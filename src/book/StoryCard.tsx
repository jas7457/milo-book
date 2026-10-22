import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { storyCardTexture, type StoryCardArt, type WordBox } from './pageTextures'
import { PopCard } from '../popup/PopCard'
import { useSpread } from '../popup/SpreadContext'
import type { SpreadDef } from '../story/types'
import { anim } from '../state'
import { useBook } from '../store'
import { bus } from '../bus'
import { markWritten, paraAfter, setWriting, stageOf, useProgress } from '../progress'
import { svgDoc } from '../art/texture'
import { useSvgTexture } from '../art/useSvgTexture'
import { INK } from '../art/style'
import { debug } from '../debug'

/** Card width on the page (world units); the left page is 1.6 wide. */
const CARD_W = 1.2
/**
 * How far the card leans back from upright once open. Together with the book
 * tilt and the camera height this turns it to face the reader, like a little
 * reading stand, so the text isn't foreshortened.
 */
const LEAN = 0.72

/* ---------------------------------------------------------------- pacing -- */

/** letters per second: a brisk read-aloud pace */
const CPS = 17
/** extra pause after a word: none / comma / sentence end */
const PAUSE = [0.07, 0.22, 0.42]
/** breath between paragraphs */
const PARA_GAP = 0.4
/** wait after the card has popped up before the pencil starts */
const START_DELAY = 0.6

type Timed = WordBox & { t0: number; t1: number }
type Schedule = { words: Timed[]; paraStart: number[]; paraEnd: number[]; end: number }

function schedule(boxes: WordBox[], paraCount: number): Schedule {
  const words: Timed[] = []
  const paraStart: number[] = Array(paraCount).fill(0)
  const paraEnd: number[] = Array(paraCount).fill(0)
  let t = 0
  let para = -1
  for (const b of boxes) {
    if (b.para > para && b.para >= 0) {
      if (para >= 0 || b.para > 0) t += PARA_GAP
      para = b.para
      paraStart[para] = t
    }
    const dur = b.kind === -1 ? b.chars * 0.035 : b.kind === 0 ? 0.55 : b.chars / CPS
    words.push({ ...b, t0: t, t1: t + dur })
    t += dur + (b.kind === -1 ? 0.3 : b.kind === 0 ? 0.05 : PAUSE[b.pause])
    if (b.para >= 0) paraEnd[b.para] = t
  }
  return { words, paraStart, paraEnd, end: t }
}

/**
 * When each bit of the card gets written: a small float texture over the card
 * where every texel holds the time the pencil reaches it. Inside a word time
 * runs left → right; the shader shows ink wherever the clock has passed.
 */
function timeMap(art: StoryCardArt, words: Timed[]) {
  const S = 2 // card px per texel
  const tw = Math.ceil(art.w / S)
  const th = Math.ceil(art.h / S)
  const data = new Float32Array(tw * th).fill(1e4)
  const special = words.filter((w) => w.kind <= 0)
  // group the normal words into lines
  const lines = new Map<number, Timed[]>()
  for (const w of words) {
    if (w.kind !== 1) continue
    const k = Math.round(w.baseline)
    if (!lines.has(k)) lines.set(k, [])
    lines.get(k)!.push(w)
  }
  const lineList = [...lines.values()].map((ws) => ws.sort((a, b) => a.x0 - b.x0))
  const at = (w: Timed, x: number) => w.t0 + THREE.MathUtils.clamp((x - w.x0) / (w.x1 - w.x0), 0, 1) * (w.t1 - w.t0)
  for (let j = 0; j < th; j++) {
    const y = (j + 0.5) * S
    const line = lineList.find((ws) => y >= ws[0].top && y <= ws[0].bottom)
    for (let i = 0; i < tw; i++) {
      const x = (i + 0.5) * S
      let t = 1e4
      const sp = special.find((w) => x >= w.x0 && x <= w.x1 && y >= w.top && y <= w.bottom)
      if (sp) t = at(sp, x)
      else if (line) {
        t = line[0].t0
        for (const w of line) {
          if (x < w.x0) break
          t = x <= w.x1 ? at(w, x) : w.t1
        }
      }
      // canvas rows run top → bottom; texture rows bottom → top (flipY off for data)
      data[(th - 1 - j) * tw + i] = t
    }
  }
  const tex = new THREE.DataTexture(data, tw, th, THREE.RedFormat, THREE.FloatType)
  tex.minFilter = tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

/** Paper + ink, with the ink revealed by the writing clock (fresh ink is darker). */
function writingMaterial(art: StoryCardArt, times: THREE.Texture) {
  const m = new THREE.MeshStandardMaterial({
    map: art.paper,
    roughness: 0.92,
    metalness: 0,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
  })
  const uniforms = {
    uInk: { value: art.ink },
    uTimes: { value: times },
    uClock: { value: 0 },
    uBack: { value: new THREE.Color('#efe6d6') },
  }
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform sampler2D uInk; uniform sampler2D uTimes; uniform float uClock; uniform vec3 uBack;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
         {
           vec4 ink = texture2D(uInk, vMapUv);
           float tt = texture2D(uTimes, vMapUv).r;
           // a slightly ragged pen front instead of a ruler-straight wipe
           tt += sin(vMapUv.y * 610.0 + vMapUv.x * 37.0) * 0.018;
           float k = clamp((uClock - tt) / 0.07, 0.0, 1.0);
           float wet = 1.0 - clamp((uClock - tt) / 1.1, 0.0, 1.0);
           vec3 c = ink.rgb * (1.0 - 0.38 * wet);
           diffuseColor.rgb = mix(diffuseColor.rgb, c, ink.a * k);
         }`,
      )
      .replace(
        '#include <alphatest_fragment>',
        `#include <alphatest_fragment>
         if (!gl_FrontFacing) diffuseColor.rgb = uBack;`,
      )
      .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance = diffuseColor.rgb * 0.1;')
  }
  m.customProgramCacheKey = () => 'storycard'
  return { mat: m, uniforms }
}

/* ---------------------------------------------------------------- pencil -- */

const PEN = { w: 220, h: 300, tipX: 16, tipY: 290 }
const pencilArt = svgDoc(
  PEN.w,
  PEN.h,
  `<g stroke="${INK}" stroke-width="7" stroke-linejoin="round">
     <!-- body, running from the tip (bottom-left) up to the eraser (top-right) -->
     <g transform="translate(16 290) rotate(-52)">
       <path d="M0 0 L46 -17 L46 17 Z" fill="#f2c890"/>
       <path d="M0 0 L16 -6 L16 6 Z" fill="#3a3330" stroke-width="5"/>
       <rect x="46" y="-17" width="230" height="34" fill="#ffc533"/>
       <rect x="46" y="-6" width="230" height="12" fill="#ffd866" stroke="none"/>
       <rect x="276" y="-19" width="26" height="38" fill="#b8bcc4"/>
       <path d="M284 -19 V19 M293 -19 V19" stroke-width="4"/>
       <path d="M302 -17 H322 Q334 -17 334 0 Q334 17 322 17 H302 Z" fill="#f28da0"/>
     </g>
   </g>`,
  { cut: 5, grain: 0.6 },
)
/** pencil size on the card (world units) */
const PEN_H = 0.27
const PEN_W = (PEN_H * PEN.w) / PEN.h

function Pencil({ api }: { api: { pos: THREE.Vector3; show: number } }) {
  const tex = useSvgTexture(pencilArt, 384)
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.3,
        roughness: 0.8,
        side: THREE.DoubleSide,
        opacity: 0,
      }),
    [tex],
  )
  useEffect(() => () => mat.dispose(), [mat])
  const g = useRef<THREE.Group>(null!)
  useFrame(() => {
    g.current.position.copy(api.pos)
    mat.opacity = api.show
    g.current.visible = api.show > 0.01
    g.current.scale.setScalar(0.7 + 0.3 * api.show)
  })
  // the art's tip sits at the group origin
  const ox = (PEN.w / 2 - PEN.tipX) / PEN.w * PEN_W
  const oy = (PEN.tipY - PEN.h / 2) / PEN.h * PEN_H
  return (
    <group ref={g} visible={false}>
      <mesh material={mat} position={[ox, oy, 0]} castShadow raycast={() => null}>
        <planeGeometry args={[PEN_W, PEN_H]} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ card -- */

/**
 * The spread's story text on a cream card that folds up off the front of the
 * left page (first piece up, last one down). The words are written in by a
 * pencil at read-aloud pace; paragraphs marked `after: n` wait for the
 * reader's n-th interaction. Reports progress so the next arrow can unlock.
 */
export function StoryCard({ spread }: { spread: SpreadDef }) {
  const [art, setArt] = useState<StoryCardArt | null>(null)
  useEffect(() => {
    let live = true
    let got: StoryCardArt | null = null
    storyCardTexture(spread).then((c) => {
      got = c
      if (live) setArt(c)
      else c.paper.dispose(), c.ink.dispose()
    })
    return () => {
      live = false
      if (got) got.paper.dispose(), got.ink.dispose()
    }
  }, [spread])
  if (!art) return null
  return <WritingCard spread={spread} art={art} />
}

function WritingCard({ spread, art }: { spread: SpreadDef; art: StoryCardArt }) {
  const { index } = useSpread()
  const paras = spread.text ?? []
  const sched = useMemo(() => schedule(art.boxes, paras.length), [art, paras.length])
  const times = useMemo(() => timeMap(art, sched.words), [art, sched])
  const { mat, uniforms } = useMemo(() => writingMaterial(art, times), [art, times])
  useEffect(
    () => () => {
      mat.dispose()
      times.dispose()
    },
    [mat, times],
  )

  const box = spread.textCard ?? { x: 0.1, y: 0, w: 0.8 }
  const cx = -1.6 + (box.x + box.w / 2) * 1.6
  const h = CARD_W / art.aspect
  /** card px → card-local world position (origin at the card's bottom centre) */
  const toLocal = (x: number, y: number, z: number, out: THREE.Vector3) =>
    out.set((x / art.w - 0.5) * CARD_W, (1 - y / art.h) * h, z)

  const st = useMemo(() => ({ clock: 0, wait: 0, word: -1, written: 0 }), [])
  const pen = useMemo(() => ({ pos: new THREE.Vector3(), show: 0 }), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const rest = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1) * (debug.fast ? 8 : 1)
    const id = spread.id
    const v = anim.raise[index].v
    const book = useBook.getState()
    if (v < 0.5) {
      // folded away: start over next time
      st.clock = st.wait = st.written = 0
      st.word = -1
      pen.show = 0
      uniforms.uClock.value = 0
      return
    }
    const here = book.spread === index && !book.busy && v > 0.98
    if (here) st.wait += dt
    // how far may the pencil go? up to the first paragraph still waiting for its beat
    const stage = stageOf(id)
    let limit = sched.end
    for (let k = 0; k < paras.length; k++)
      if (paraAfter(paras[k]) > stage) {
        limit = sched.paraStart[k] - 0.02
        break
      }
    const writing = here && st.wait > START_DELAY && st.clock < limit
    if (writing) st.clock = Math.min(limit, st.clock + dt)
    uniforms.uClock.value = st.clock

    if (writing) setWriting(id)
    else if (useProgress.getState().writing === id) setWriting('')

    // paragraphs finished
    let n = 0
    while (n < paras.length && st.clock >= sched.paraEnd[n] - 0.05) n++
    if (n > st.written) {
      st.written = n
      markWritten(id, n)
    }

    // the pencil: on the word being written, hopping between words
    const ws = sched.words
    let wi = ws.findIndex((w) => st.clock < w.t1)
    if (wi < 0) wi = ws.length - 1
    const w = ws[wi]
    if (writing && wi !== st.word && w.kind === 1 && st.clock >= w.t0) {
      st.word = wi
      bus.emit('sfx', 'scribble')
    }
    const prev = ws[wi - 1]
    if (st.clock >= w.t0) {
      const f = THREE.MathUtils.clamp((st.clock - w.t0) / (w.t1 - w.t0), 0, 1)
      const x = w.x0 + (w.x1 - w.x0) * f
      // little up-down strokes, one per letter
      const stroke = Math.abs(Math.sin(st.clock * CPS * Math.PI)) * (w.kind === 0 ? 30 : 12)
      toLocal(x, w.baseline - stroke - 6, 0.012, target)
    } else if (prev) {
      // between words: glide over, lifted off the paper
      const f = THREE.MathUtils.clamp((st.clock - prev.t1) / Math.max(0.01, w.t0 - prev.t1), 0, 1)
      const nl = Math.abs(w.baseline - prev.baseline) > 1
      toLocal(prev.x1 + (w.x0 - prev.x1) * f, prev.baseline + (w.baseline - prev.baseline) * f - 18, 0.04 + (nl ? 0.04 : 0), target)
    } else toLocal(w.x0, w.baseline, 0.06, target)
    // resting off to the side while nothing is being written
    toLocal(art.w * 0.98, art.h * 0.92, 0.08, rest)
    const want = writing ? 1 : 0
    pen.show += (want - pen.show) * Math.min(1, dt * (want ? 6 : 3))
    pen.pos.lerp(writing ? target : rest, writing ? Math.min(1, dt * 22) : Math.min(1, dt * 2.5))
  })

  return (
    <PopCard art="" map={art.paper} material={mat} size={[CARD_W, h]} at={[cx, 0.98]} lean={LEAN} delay={0.02} tap="none">
      <Pencil api={pen} />
    </PopCard>
  )
}
