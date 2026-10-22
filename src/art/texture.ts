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

let seedN = 1
// paper density = 1 − 0.2g + 0.3g·noise  (noise ≈ 0.25…0.75 → ~0.88…1.0)
const grainRow = (g: number) => `${(0.3 * g).toFixed(3)} 0 0 0 ${(1 - 0.2 * g).toFixed(3)}`

/**
 * Wrap an SVG body in a document.
 *  - `cut`   adds a thin cream die-cut paper edge around the shapes
 *  - `grain` (default on) prints the art onto paper: fine fibres plus soft
 *            blotchy ink density, so flat fills look like a printed page.
 */
export function svgDoc(
  w: number,
  h: number,
  body: string,
  opts: { cut?: number; defs?: string; grain?: number; edge?: string } = {},
) {
  const cut = opts.cut ?? 0
  const grain = opts.grain ?? 1
  const seed = seedN++ % 97
  // the noise is sized relative to the art so it looks the same at any scale
  const s = Math.max(w, h) / 1000
  const grainFx = grain
    ? `<feTurbulence type="fractalNoise" baseFrequency="${(0.9 / s).toFixed(3)}" numOctaves="2" seed="${seed}" result="fib"/>
       <feTurbulence type="fractalNoise" baseFrequency="${(0.012 / s).toFixed(4)}" numOctaves="3" seed="${seed + 7}" result="blot"/>
       <feComposite in="fib" in2="blot" operator="arithmetic" k1="0" k2="0.45" k3="0.55" k4="0" result="mix"/>
       <feColorMatrix in="mix" type="matrix" values="${grainRow(grain)} ${grainRow(grain)} ${grainRow(grain)} 0 0 0 0 1" result="paper"/>
       <feBlend in="SourceGraphic" in2="paper" mode="multiply" result="inked"/>
       <feComposite in="inked" in2="SourceAlpha" operator="in" result="art"/>`
    : `<feOffset in="SourceGraphic" result="art"/>`
  const edgeFx = cut
    ? `<feMorphology in="SourceAlpha" operator="dilate" radius="${cut}" result="d"/>
       <feFlood flood-color="${opts.edge ?? '#fbf4e4'}"/>
       <feComposite in2="d" operator="in" result="border"/>
       <feMorphology in="SourceAlpha" operator="dilate" radius="${cut + 1.5 * s}" result="d2"/>
       <feFlood flood-color="#5a4632" flood-opacity="0.55"/>
       <feComposite in2="d2" operator="in" result="rim"/>
       <feMerge><feMergeNode in="rim"/><feMergeNode in="border"/><feMergeNode in="art"/></feMerge>`
    : ''
  const filter =
    cut || grain
      ? `<filter id="cut" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">${grainFx}${edgeFx}</filter>`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>${filter}${opts.defs ?? ''}</defs>
    <g ${filter ? 'filter="url(#cut)"' : ''}>${body}</g>
  </svg>`
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
  texCache.set(key, tex)
  loadSvgImage(svg).then((img) => {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    tex.needsUpdate = true
  })
  return tex
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
const matCache = new Map<string, THREE.MeshStandardMaterial>()
export function paperMaterial(map: THREE.Texture | null, opts: { back?: string; color?: string; emissive?: number } = {}) {
  const key = (map?.uuid ?? 'none') + (opts.back ?? '') + (opts.color ?? '') + (opts.emissive ?? '')
  const c = matCache.get(key)
  if (c) return c
  const back = new THREE.Color(opts.back ?? '#efe6d6')
  const m = new THREE.MeshStandardMaterial({
    map,
    color: opts.color ?? '#ffffff',
    roughness: 0.92,
    metalness: 0,
    alphaTest: map ? 0.5 : 0,
    side: THREE.DoubleSide,
  })
  if (opts.emissive && map) {
    m.emissiveMap = map
    m.emissive = new THREE.Color('#ffffff')
    m.emissiveIntensity = opts.emissive
  }
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uBack = { value: back }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBack;')
      .replace(
        '#include <alphatest_fragment>',
        `#include <alphatest_fragment>
         if (!gl_FrontFacing) diffuseColor.rgb = uBack;`,
      )
  }
  m.customProgramCacheKey = () => 'paper'
  matCache.set(key, m)
  return m
}
