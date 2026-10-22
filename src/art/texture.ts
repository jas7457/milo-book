import * as THREE from 'three'

/**
 * All artwork in the book is authored as SVG strings in code and rasterised to
 * canvas textures at runtime. This keeps everything editable as text and lets
 * us share one paper-cutout look (white die-cut border) across all pieces.
 */

let maxAniso = 4
export function setMaxAnisotropy(n: number) {
  maxAniso = Math.min(8, n)
}

/** standard normal CDF (Abramowitz–Stegun erf approximation) */
function phi(x: number) {
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * z)
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z)
  return 0.5 * (1 + (x < 0 ? -erf : erf))
}


/**
 * Wrap an SVG body in a document.
 *  - `cut`   adds a thin cream die-cut paper edge around the shapes
 *  - `grain` (default 1) prints the art onto paper: fine fibres plus soft
 *            blotchy ink density, so flat fills look like a printed page.
 *            The grain is NOT in the SVG: it's recorded as `data-grain` and
 *            the paper material multiplies a tiling noise texture in on the
 *            GPU (see `grainTexture`). As an SVG filter (feTurbulence) it cost
 *            100–400 ms per big piece to paint in Safari, which froze the iPad
 *            whenever a new page's art was painted.
 */
export function svgDoc(
  w: number,
  h: number,
  body: string,
  opts: { cut?: number; defs?: string; grain?: number; edge?: string } = {},
) {
  const cut = opts.cut ?? 0
  const grain = opts.grain ?? 1
  // edge widths are sized relative to the art so they look the same at any scale
  const s = Math.max(w, h) / 1000
  const grainFx = `<feOffset in="SourceGraphic" result="art"/>`
  // The die-cut edge: the shape's alpha grown outwards twice (cream border, then a thin
  // brown rim). One blur + two thresholds does both. (feMorphology "dilate" looked the
  // same but cost ~10× more to paint, which stalled page turns, worst on iPad.)
  const rim = cut + 1.5 * s
  const sigma = rim / 2
  const grow = (r: number, result: string) => {
    const t = phi(-r / sigma) // blurred alpha at distance r from a straight edge
    return `<feComponentTransfer in="blurA" result="${result}"><feFuncA type="linear" slope="${(1 / t).toFixed(2)}" intercept="-0.5"/></feComponentTransfer>`
  }
  const edgeFx = cut
    ? `<feGaussianBlur in="SourceAlpha" stdDeviation="${sigma.toFixed(2)}" result="blurA"/>
       ${grow(cut, 'd')}
       <feFlood flood-color="${opts.edge ?? '#fbf4e4'}"/>
       <feComposite in2="d" operator="in" result="border"/>
       ${grow(rim, 'd2')}
       <feFlood flood-color="#5a4632" flood-opacity="0.55"/>
       <feComposite in2="d2" operator="in" result="rim"/>
       <feMerge><feMergeNode in="rim"/><feMergeNode in="border"/><feMergeNode in="art"/></feMerge>`
    : ''
  const filter =
    cut
      ? `<filter id="cut" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">${grainFx}${edgeFx}</filter>`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-grain="${grain}">
    <defs>${filter}${opts.defs ?? ''}</defs>
    <g ${filter ? 'filter="url(#cut)"' : ''}>${body}</g>
  </svg>`
}

/** The same drawing, declared at another pixel size (the viewBox keeps the art identical). */
function sizeSvg(svg: string, w: number, h: number) {
  return svg.replace(/width="([\d.]+)" height="([\d.]+)"/, `width="${w}" height="${h}"`)
}

export function svgUrl(svg: string) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const imgCache = new Map<string, Promise<HTMLImageElement>>()
export function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  let p = imgCache.get(svg)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = svgUrl(svg)
    })
    imgCache.set(svg, p)
  }
  return p
}

const texCache = new Map<string, THREE.CanvasTexture>()

/**
 * Rasterise an SVG into a CanvasTexture. Returns immediately (transparent),
 * then fills in once the image has decoded.
 */
export function svgTexture(svg: string, maxPx = 1024): THREE.CanvasTexture {
  const key = maxPx + '|' + svg
  const cached = texCache.get(key)
  if (cached) return cached
  const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/)
  const w = m ? parseFloat(m[1]) : 512
  const h = m ? parseFloat(m[2]) : 512
  const s = maxPx / Math.max(w, h)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(2, Math.round(w * s))
  canvas.height = Math.max(2, Math.round(h * s))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = maxAniso
  tex.userData.key = key
  setGrain(tex, parseFloat(svg.match(/data-grain="([\d.]+)"/)?.[1] ?? '0'), w, h)
  texCache.set(key, tex)
  decoding++
  // Safari rasterises an SVG image at its own width/height and then scales it, so a
  // drawing declared bigger than its texture would be painted (filters and all) at
  // the bigger size for nothing. Declare the texture's size instead.
  const decoded = loadSvgImage(Math.max(w, h) > maxPx ? sizeSvg(svg, canvas.width, canvas.height) : svg).finally(() => decoding--)
  decoded.then((img) => {
    rasterQueue.push({ tex, run: () => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      tex.needsUpdate = true
    } })
  })
  return tex
}

/*
 * Painting an SVG into its canvas and uploading it to the GPU is the costly
 * part, so it isn't done the moment the image decodes: the jobs queue up and
 * `pumpTextures` (called every frame by scene/Prewarm) works through a few per
 * frame, uploading each right away so no texture is left to upload mid-animation.
 */
const rasterQueue: { tex: THREE.CanvasTexture; run: () => void }[] = []
/** SVG images still decoding (their paint job isn't queued yet) */
let decoding = 0
/** Textures not painted yet: still decoding, or decoded and waiting in the queue. */
export const texturesPending = () => decoding + rasterQueue.length
/**
 * Paint + upload queued textures until `budgetMs` has been spent this frame
 * (always at least one). Time, not pixels: Safari only really rasterises the
 * SVG when the canvas is uploaded, and the cost depends on the art, not its size.
 */
export function pumpTextures(upload: (t: THREE.Texture) => void, budgetMs = 6) {
  const start = performance.now()
  while (rasterQueue.length && performance.now() - start < budgetMs) {
    const job = rasterQueue.shift()!
    if (texCache.get(job.tex.userData.key) !== job.tex) continue // freed before it was painted
    job.run()
    upload(job.tex)
  }
  return rasterQueue.length
}

/*
 * GPU memory: textures are reference-counted by the components that show them
 * (`useSvgTexture`). When nothing has used one for a few seconds (its spread
 * or world was unmounted), it and its materials are freed. Textures made with a
 * bare `svgTexture()` call are never retained, so they're never freed.
 */
const refs = new Map<THREE.Texture, number>()
export function retainTexture(tex: THREE.Texture) {
  refs.set(tex, (refs.get(tex) ?? 0) + 1)
}
export function releaseTexture(tex: THREE.Texture) {
  const n = (refs.get(tex) ?? 1) - 1
  refs.set(tex, n)
  if (n > 0) return
  setTimeout(() => {
    if ((refs.get(tex) ?? 0) > 0) return
    refs.delete(tex)
    if (tex.userData.key && texCache.get(tex.userData.key) === tex) texCache.delete(tex.userData.key)
    for (const [k, m] of matCache) {
      if (m.map === tex) {
        m.dispose()
        matCache.delete(k)
      }
    }
    tex.dispose()
  }, 4000)
}

/**
 * Paper material: lit, alpha-tested cut-out with a plain paper-coloured back
 * face (like a real die-cut pop-up piece).
 */
const matCache = new Map<string, THREE.MeshLambertMaterial>()
/* ---------------------------------------------------------------- grain -- */

/** Store a texture's paper-grain amount and the art's aspect (for `paperMaterial` / `addGrain`). */
export function setGrain(tex: THREE.Texture, grain: number, w: number, h: number) {
  const L = Math.max(w, h)
  tex.userData.grain = grain
  tex.userData.grainAsp = [w / L, h / L]
}

/** Periodic value noise on a size×size grid with `cells` lattice cells per side. */
function periodicNoise(size: number, cells: number, rnd: () => number) {
  const lat = Array.from({ length: cells * cells }, rnd)
  const out = new Float32Array(size * size)
  const sm = (t: number) => t * t * (3 - 2 * t)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells, fy = (y / size) * cells
      const x0 = Math.floor(fx), y0 = Math.floor(fy)
      const tx = sm(fx - x0), ty = sm(fy - y0)
      const at = (i: number, j: number) => lat[((j % cells) * cells + (i % cells))]
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx
      out[y * size + x] = a + (b - a) * ty
    }
  return out
}

let grainTex: THREE.DataTexture | null = null
/**
 * The paper grain, one small tiling texture shared by every piece:
 *  R = fine fibres (≈ 900 noise cells across a piece's long side, like the old
 *      feTurbulence baseFrequency 0.9 per 1000 px),
 *  G = soft blotchy ink density (≈ 12 cells across, 3 octaves).
 * Made once in JS (a few ms); mipmapped, so distant pieces average out smoothly.
 */
export function grainTexture() {
  if (grainTex) return grainTex
  const N = 256
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const f1 = periodicNoise(N, 128, rnd), f2 = periodicNoise(N, 256, rnd)
  const b1 = periodicNoise(N, 4, rnd), b2 = periodicNoise(N, 8, rnd), b3 = periodicNoise(N, 16, rnd)
  const data = new Uint8Array(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    // centred on 0.5 with about the spread of SVG fractalNoise
    const fib = 0.5 + ((f1[i] * 0.67 + f2[i] * 0.33) - 0.5) * 0.9
    const blot = 0.5 + ((b1[i] * 0.57 + b2[i] * 0.29 + b3[i] * 0.14) - 0.5) * 1.4
    data[i * 4] = Math.round(fib * 255)
    data[i * 4 + 1] = Math.round(blot * 255)
    data[i * 4 + 2] = 128
    data[i * 4 + 3] = 255
  }
  grainTex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat)
  grainTex.wrapS = grainTex.wrapT = THREE.RepeatWrapping
  grainTex.magFilter = THREE.LinearFilter
  grainTex.minFilter = THREE.LinearMipmapLinearFilter
  grainTex.generateMipmaps = true
  grainTex.needsUpdate = true
  return grainTex
}

/** Uniforms for the grain of one texture (amount 0 = off). */
export function grainUniforms(map: THREE.Texture | null, amount?: number, asp?: [number, number]) {
  const a = (asp ?? map?.userData.grainAsp ?? [1, 1]) as [number, number]
  const id = map?.id ?? 0
  return {
    uGrain: { value: grainTexture() },
    uGrainAmt: { value: amount ?? map?.userData.grain ?? 0 },
    uGrainAsp: { value: new THREE.Vector2(a[0], a[1]) },
    // each piece gets its own patch of blotches
    uGrainOff: { value: new THREE.Vector2(((id * 0.6180339) % 1), ((id * 0.7548776) % 1)) },
  }
}
export const GRAIN_DECL = 'uniform sampler2D uGrain; uniform float uGrainAmt; uniform vec2 uGrainAsp; uniform vec2 uGrainOff;'
/** paper density = 1 − 0.2g + 0.3g·(0.45·fibres + 0.55·blotches), the same formula the SVG filter used */
export const GRAIN_APPLY = `#ifdef USE_MAP
  if (uGrainAmt > 0.0) {
    vec2 guv = vMapUv * uGrainAsp;
    float gFib = texture2D(uGrain, guv * 7.0).r;
    float gBlot = texture2D(uGrain, guv * 3.0 + uGrainOff).g;
    diffuseColor.rgb *= 1.0 - 0.2 * uGrainAmt + 0.3 * uGrainAmt * (0.45 * gFib + 0.55 * gBlot);
  }
  #endif`

/**
 * Give any MeshStandard/Lambert material with a `map` the same paper grain
 * (for materials not made by `paperMaterial`). `amount` defaults to the map's
 * own `data-grain`.
 */
export function addGrain<M extends THREE.Material>(m: M, map: THREE.Texture | null, amount?: number, asp?: [number, number]): M {
  const prev = m.onBeforeCompile.bind(m)
  const prevKey = m.customProgramCacheKey()
  const u = grainUniforms(map, amount, asp)
  m.onBeforeCompile = (shader, renderer) => {
    prev(shader, renderer)
    Object.assign(shader.uniforms, u)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + GRAIN_DECL)
      .replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n' + GRAIN_APPLY)
  }
  m.customProgramCacheKey = () => 'grain|' + prevKey
  return m
}

export function paperMaterial(map: THREE.Texture | null, opts: { back?: string; color?: string; emissive?: number } = {}) {
  const key = (map?.uuid ?? 'none') + (opts.back ?? '') + (opts.color ?? '') + (opts.emissive ?? '')
  const c = matCache.get(key)
  if (c) return c
  const back = new THREE.Color(opts.back ?? '#efe6d6')
  // Lambert, not Standard: matte paper (it was roughness 0.92) looks the same,
  // and the per-pixel cost of every light is a fraction of the physical model's.
  // Every pixel of every piece runs the light loop (hemi, sun, book lamp + the
  // 8 pooled lights), so this matters most on the iPad's GPU.
  const m = new THREE.MeshLambertMaterial({
    map,
    color: opts.color ?? '#ffffff',
    alphaTest: map ? 0.5 : 0,
    side: THREE.DoubleSide,
  })
  if (opts.emissive && map) {
    m.emissiveMap = map
    m.emissive = new THREE.Color('#ffffff')
    m.emissiveIntensity = opts.emissive
  }
  const grain = grainUniforms(map)
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uBack = { value: back }
    Object.assign(shader.uniforms, grain)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBack;\n' + GRAIN_DECL)
      .replace(
        '#include <alphatest_fragment>',
        `#include <alphatest_fragment>
         if (!gl_FrontFacing) diffuseColor.rgb = uBack;
         ${GRAIN_APPLY}`,
      )
  }
  m.customProgramCacheKey = () => 'paper'
  matCache.set(key, m)
  return m
}
