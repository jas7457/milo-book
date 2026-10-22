import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { svgDoc, addGrain } from '../../art/texture'
import { useSvgTexture } from '../../art/useSvgTexture'
import { paperMaterial } from '../../art/texture'
import { starPath } from '../../art/kit'
import { INK } from '../../art/style'
import { anim } from '../../state'
import { bus } from '../../bus'
import { Part } from '../../popup/PopCard'
import { Cutout, useWorldId, useWorldLevel } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'
import { miloFigure } from '../../milo/art'
import { PoolPointLight, PoolSpotLight } from '../../scene/lightPool'

/* ------------------------------------------------------------------ art -- */

const wall = svgDoc(
  2400,
  760,
  `<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c98c"/><stop offset="1" stop-color="#f6e2b6"/></linearGradient>
   <rect width="2400" height="760" fill="url(#w)"/>
   <rect y="560" width="2400" height="14" fill="#d9b276"/>
   <rect y="700" width="2400" height="60" fill="#b98a55"/>
   <!-- window with night sky -->
   <rect x="1640" y="110" width="360" height="330" rx="14" fill="#8a5a33"/>
   <rect x="1660" y="130" width="320" height="290" fill="#27306a"/>
   <circle cx="1900" cy="200" r="38" fill="#fff4c4"/><circle cx="1915" cy="190" r="34" fill="#27306a"/>
   <path d="${starPath(1720, 180, 10)}" fill="#fff4c4"/><path d="${starPath(1800, 260, 7)}" fill="#fff4c4"/><path d="${starPath(1750, 340, 9)}" fill="#fff4c4"/><path d="${starPath(1930, 330, 6)}" fill="#fff4c4"/>
   <rect x="1812" y="130" width="16" height="290" fill="#8a5a33"/><rect x="1660" y="268" width="320" height="14" fill="#8a5a33"/>
   <path d="M1610 96 Q 1650 300 1630 470 L 1680 470 Q 1700 280 1680 96 Z" fill="#c9524a"/>
   <path d="M2030 96 Q 1990 300 2010 470 L 1960 470 Q 1940 280 1960 96 Z" fill="#c9524a"/>
   <rect x="1590" y="84" width="460" height="18" rx="9" fill="#6a4426"/>`,
)

/** Milo's crayon drawings, pinned to the wall (instead of the photo frames). */
const frame = (inner: string, w = 260, h = 300) =>
  svgDoc(
    w + 40,
    h + 40,
    `<rect x="0" y="0" width="${w + 40}" height="${h + 40}" rx="6" fill="#7a4a26"/>
     <rect x="14" y="14" width="${w + 12}" height="${h + 12}" fill="#f4e9d2"/>
     <g transform="translate(20 20)">${inner}</g>`,
    { cut: 5 },
  )

const familyDrawing = frame(
  `<g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="7">
     <circle cx="60" cy="110" r="30" stroke="#8a4a2a"/><path d="M60 140 L60 220 M60 160 L25 190 M60 160 L95 190 M60 220 L35 280 M60 220 L85 280" stroke="#3a6fd8"/>
     <path d="M32 96 Q 60 60 90 96 L 96 150" stroke="#8a4a2a"/>
     <circle cx="200" cy="105" r="30" stroke="#8a4a2a"/><path d="M200 135 L200 220 M200 155 L165 185 M200 155 L235 185 M200 220 L175 280 M200 220 L225 280" stroke="#2f9a4a"/>
     <circle cx="130" cy="170" r="22" stroke="#8a4a2a"/><path d="M130 192 L130 245 M130 205 L105 225 M130 205 L155 225 M130 245 L115 285 M130 245 L145 285" stroke="#e8572b"/>
   </g>
   <path d="M120 40 C 100 10 70 30 90 55 L 120 80 L 150 55 C 170 30 140 10 120 40 Z" fill="#ff5a7a"/>
   <text x="60" y="300" font-family="Fredoka, sans-serif" font-size="22" fill="#3a6fd8" text-anchor="middle">MOM</text>
   <text x="130" y="300" font-family="Fredoka, sans-serif" font-size="22" fill="#e8572b" text-anchor="middle">ME</text>
   <text x="200" y="300" font-family="Fredoka, sans-serif" font-size="22" fill="#2f9a4a" text-anchor="middle">DAD</text>`,
)

const truckDrawing = frame(
  `<rect x="20" y="140" width="150" height="80" fill="#e8322b"/><rect x="170" y="170" width="70" height="50" fill="#e8322b"/>
   <rect x="180" y="180" width="40" height="22" fill="#9fd4ff"/>
   <circle cx="60" cy="230" r="24" fill="#333"/><circle cx="200" cy="230" r="24" fill="#333"/>
   <path d="M30 130 L 170 80" stroke="#c9c9c9" stroke-width="10"/><path d="M50 122 L 60 98 M90 110 L 100 86 M130 96 L 140 72" stroke="#c9c9c9" stroke-width="6"/>
   <path d="M20 280 Q 130 260 240 280" stroke="#4caf50" stroke-width="8" fill="none"/>
   <circle cx="220" cy="50" r="26" fill="#ffd34d"/>`,
  260,
  300,
)

const seaPicture = frame(
  `<rect width="320" height="220" fill="#bfe3f5"/><rect y="120" width="320" height="100" fill="#4f8fc0"/>
   <path d="M0 140 Q 40 128 80 140 T 160 140 T 240 140 T 320 140" stroke="#fff" stroke-width="5" fill="none"/>
   <path d="M120 120 L 160 50 L 160 120 Z" fill="#fff"/><path d="M100 120 L 200 120 L 185 140 L 115 140 Z" fill="#c9524a"/>
   <circle cx="260" cy="50" r="24" fill="#ffd34d"/>`,
  320,
  220,
)

const couch = svgDoc(
  1300,
  560,
  `<!-- back -->
   <rect x="60" y="40" width="1180" height="300" rx="40" fill="#3d3f44"/>
   <rect x="100" y="70" width="540" height="250" rx="34" fill="#4a4c52"/>
   <rect x="660" y="70" width="540" height="250" rx="34" fill="#4a4c52"/>
   <!-- seat -->
   <rect x="40" y="300" width="1220" height="170" rx="40" fill="#45474d"/>
   <rect x="80" y="300" width="560" height="70" rx="24" fill="#53565c"/>
   <rect x="660" y="300" width="560" height="70" rx="24" fill="#53565c"/>
   <!-- arms -->
   <rect x="0" y="190" width="120" height="300" rx="50" fill="#36383d"/>
   <rect x="1180" y="190" width="120" height="300" rx="50" fill="#36383d"/>
   <!-- pillows -->
   <path d="M180 140 Q 300 100 420 140 Q 440 230 420 300 Q 300 330 180 300 Q 160 220 180 140 Z" fill="#e9a23b"/>
   <path d="M880 150 Q 990 110 1100 150 Q 1120 230 1100 300 Q 990 330 880 300 Q 860 230 880 150 Z" fill="#7cc4c4"/>
   <path d="${starPath(300, 220, 40)}" fill="#fff3c8" opacity=".8"/>
   <!-- legs -->
   <rect x="90" y="470" width="40" height="70" rx="8" fill="#5a3a22"/><rect x="1170" y="470" width="40" height="70" rx="8" fill="#5a3a22"/>`,
  { cut: 8 },
)

const lampPole = svgDoc(
  200,
  900,
  `<rect x="90" y="40" width="20" height="820" rx="10" fill="#9a9a9a"/>
   <ellipse cx="100" cy="870" rx="90" ry="24" fill="#6f6f6f"/>`,
  { cut: 6 },
)
const lampShade = svgDoc(
  420,
  300,
  `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset="1" stop-color="#ffd98a"/></linearGradient>
   <path d="M90 20 L 330 20 L 410 280 L 10 280 Z" fill="url(#s)"/>
   <rect x="4" y="270" width="412" height="20" rx="10" fill="#f0c271"/>`,
  { cut: 6 },
)

const sideTable = svgDoc(
  360,
  420,
  `<rect x="10" y="150" width="340" height="40" rx="10" fill="#8a5a33"/>
   <rect x="40" y="190" width="24" height="220" fill="#6a4426"/><rect x="296" y="190" width="24" height="220" fill="#6a4426"/>
   <!-- the blue cup from the photo -->
   <path d="M120 40 L 220 40 L 210 150 L 130 150 Z" fill="#2f6aa8"/>
   <rect x="112" y="28" width="116" height="20" rx="8" fill="#e9eef3"/>
   <path d="M180 30 L 200 -10" stroke="#e9eef3" stroke-width="8" stroke-linecap="round"/>`,
  { cut: 6 },
)

const shelf = svgDoc(
  500,
  900,
  `<rect x="0" y="0" width="500" height="900" rx="12" fill="#9a6a3a"/>
   <rect x="24" y="24" width="452" height="852" fill="#6f4a28"/>
   ${[0, 1, 2, 3]
     .map((r) => {
       const y = 40 + r * 212
       const cols = ['#e8572b', '#3a6fd8', '#f4c542', '#2f9a4a', '#a35ad8', '#e8322b', '#2fb5c4']
       let books = ''
       let x = 40
       for (let i = 0; i < 7 + (r % 2); i++) {
         const w = 34 + ((i * 17 + r * 7) % 26)
         const h = 140 + ((i * 29 + r * 13) % 50)
         books += `<rect x="${x}" y="${y + 190 - h}" width="${w}" height="${h}" rx="4" fill="${cols[(i + r) % cols.length]}"/>`
         books += `<rect x="${x + 6}" y="${y + 190 - h + 20}" width="${w - 12}" height="8" fill="#fff" opacity=".5"/>`
         x += w + 6
         if (x > 420) break
       }
       return books + `<rect x="24" y="${y + 190}" width="452" height="22" fill="#9a6a3a"/>`
     })
     .join('')}`,
  { cut: 8 },
)

const rug = svgDoc(
  1000,
  720,
  `<ellipse cx="500" cy="360" rx="490" ry="350" fill="#c9524a"/>
   <ellipse cx="500" cy="360" rx="440" ry="306" fill="#e9a23b"/>
   <ellipse cx="500" cy="360" rx="380" ry="256" fill="#c9524a"/>
   <ellipse cx="500" cy="360" rx="330" ry="214" fill="#f3d9a0"/>
   <g fill="#c9524a" opacity=".6">${Array.from({ length: 16 }, (_, i) => {
     const a = (i / 16) * Math.PI * 2
     return `<circle cx="${500 + Math.cos(a) * 412}" cy="${360 + Math.sin(a) * 282}" r="12"/>`
   }).join('')}</g>`,
)

/* ---- the four letter blocks: M-I-L-O, drawn as paths (no SVG text) ---- */

const LETTER_PATH: Record<string, string> = {
  M: 'M74 192 L 74 66 L 128 138 L 182 66 L 182 192',
  I: 'M96 68 L 160 68 M128 68 L 128 188 M96 188 L 160 188',
  L: 'M94 64 L 94 190 L 172 190',
  O: 'M128 66 C 176 66 190 96 190 128 C 190 162 172 192 128 192 C 84 192 66 162 66 128 C 66 96 80 66 128 66 Z',
}
const BLOCK_COL: Record<string, [string, string, string]> = {
  M: ['#e8322b', '#f56a5c', '#a81d17'],
  I: ['#3a6fd8', '#6f9aee', '#244a9c'],
  L: ['#f4c542', '#ffe07e', '#c9951a'],
  O: ['#2f9a4a', '#5fc47a', '#1d6a31'],
}
/** one block's printed front face (256×256, full bleed so it wraps a box) */
const blockFace = (ch: string) => {
  const [base, light, dark] = BLOCK_COL[ch]
  return svgDoc(
    256,
    256,
    `<rect width="256" height="256" fill="${dark}"/>
     <rect x="10" y="10" width="236" height="236" rx="22" fill="${base}"/>
     <path d="M20 34 Q 20 20 34 20 L 150 20" stroke="${light}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
     <path d="${LETTER_PATH[ch]}" stroke="${INK}" stroke-width="40" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
     <path d="${LETTER_PATH[ch]}" stroke="#fffaf0" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="${LETTER_PATH[ch]}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7" transform="translate(-5 -5)"/>`,
    { grain: 0.6 },
  )
}
/** a tiny invisible anchor so the blocks pop up with the rest of the world */
const nothing = svgDoc(8, 8, '', { grain: 0 })

/* ---- the toy excavator: body, boom, stick and bucket on hinges ---- */

const DK = 1 / 230 // excavator art: units per pixel
const DIG_W = 420
const DIG_H = 280
const BOOM = { w: 170, h: 170, px: 30, py: 120, ex: 124, ey: 34 } // pivot + elbow, in the boom's art
const STICK = { w: 150, h: 150, px: 28, py: 28, ex: 96, ey: 100 }
const BUCKET = { w: 130, h: 130, px: 34, py: 26 }
const BODY_PIVOT = { x: 255, y: 150 } // where the boom hinges on the body (art px, y down)

const diggerBody = svgDoc(
  DIG_W,
  DIG_H,
  `<rect x="34" y="214" width="252" height="58" rx="29" fill="#33363c" stroke="${INK}" stroke-width="5"/>
   <rect x="52" y="222" width="216" height="8" rx="4" fill="#5a5f68"/>
   ${[78, 160, 242].map((x) => `<circle cx="${x}" cy="244" r="19" fill="#8a909a" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="244" r="7" fill="#d4d8de"/>`).join('')}
   <!-- counterweight + body -->
   <path d="M52 150 L 270 150 L 270 216 L 52 216 Q 46 184 52 150 Z" fill="#f4b400" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M62 160 L 262 160" stroke="#ffd95a" stroke-width="6" stroke-linecap="round"/>
   <path d="M66 190 L 110 190 M66 200 L 100 200" stroke="#c98a00" stroke-width="5" stroke-linecap="round"/>
   <!-- cab -->
   <path d="M76 150 L 84 78 Q 86 68 98 68 L 166 68 Q 176 68 178 80 L 188 150 Z" fill="#f4b400" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M94 86 L 98 142 L 174 142 L 166 86 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M104 94 L 108 120" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
   <circle cx="126" cy="116" r="11" fill="#7a4a2c"/><circle cx="126" cy="112" r="9" fill="#f0c49c"/>
   <!-- the boom's hinge -->
   <circle cx="${BODY_PIVOT.x}" cy="${BODY_PIVOT.y}" r="17" fill="#8a909a" stroke="${INK}" stroke-width="5"/>`,
  { cut: 5 },
)

const armStroke = (d: string) =>
  `<path d="${d}" stroke="${INK}" stroke-width="36" fill="none" stroke-linecap="round"/>
   <path d="${d}" stroke="#e0a000" stroke-width="26" fill="none" stroke-linecap="round"/>
   <path d="${d}" stroke="#ffd95a" stroke-width="7" fill="none" stroke-linecap="round" transform="translate(-4 -5)"/>`
const diggerBoom = svgDoc(
  BOOM.w,
  BOOM.h,
  `${armStroke(`M${BOOM.px} ${BOOM.py} Q ${(BOOM.px + BOOM.ex) / 2 - 18} ${(BOOM.py + BOOM.ey) / 2 - 12} ${BOOM.ex} ${BOOM.ey}`)}
   <circle cx="${BOOM.px}" cy="${BOOM.py}" r="9" fill="#8a909a" stroke="${INK}" stroke-width="3"/>
   <circle cx="${BOOM.ex}" cy="${BOOM.ey}" r="10" fill="#8a909a" stroke="${INK}" stroke-width="4"/>`,
  { cut: 4 },
)
const diggerStick = svgDoc(
  STICK.w,
  STICK.h,
  `${armStroke(`M${STICK.px} ${STICK.py} L ${STICK.ex} ${STICK.ey}`)}
   <circle cx="${STICK.px}" cy="${STICK.py}" r="8" fill="#8a909a" stroke="${INK}" stroke-width="3"/>
   <circle cx="${STICK.ex}" cy="${STICK.ey}" r="9" fill="#8a909a" stroke="${INK}" stroke-width="4"/>`,
  { cut: 4 },
)
// the cup opens toward the cab (left), like a real digging bucket
const diggerBucket = svgDoc(
  BUCKET.w,
  BUCKET.h,
  `<path d="M30 20 L 72 14 Q 112 30 104 74 Q 98 104 56 110 L 30 100 Q 56 84 52 60 Q 48 36 30 20 Z" fill="#7c828c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M66 24 Q 94 38 90 70" stroke="#c4c9d2" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path d="M30 100 L 24 112 L 40 106 L 38 118 L 54 110 L 56 110 Z" fill="#c9ced6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
   <circle cx="${BUCKET.px}" cy="${BUCKET.py}" r="8" fill="#8a909a" stroke="${INK}" stroke-width="3"/>`,
  { cut: 4 },
)

/* ---- moonlight: a window-shaped patch of light on the floor ---- */

const moonPool = svgDoc(
  330,
  300,
  `<filter id="mb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
   <g filter="url(#mb)" fill="#fff">
     <rect x="14" y="14" width="143" height="127" rx="4"/><rect x="173" y="14" width="143" height="127" rx="4"/>
     <rect x="14" y="157" width="143" height="129" rx="4"/><rect x="173" y="157" width="143" height="129" rx="4"/>
   </g>`,
  { grain: 0 },
)

/* ---------------------------------------------------------------- world -- */

const TAU = Math.PI * 2

/* ---- the floor lamp is the light switch (back cover only) ---- */

/** how dark "lights out" gets: dusky and blue, not pitch black */
export const DUSK = 0.82

const lampSwitch = { tween: null as gsap.core.Tween | null, goingDark: false }

function toggleLamp() {
  const dark = lampSwitch.tween?.isActive() ? lampSwitch.goingDark : anim.lights.dark > DUSK / 2
  lampSwitch.goingDark = !dark
  lampSwitch.tween?.kill()
  bus.emit('sfx', 'snap')
  bus.emit('sfx', lampSwitch.goingDark ? 'whoosh' : 'sparkle')
  lampSwitch.tween = gsap.to(anim.lights, { dark: lampSwitch.goingDark ? DUSK : 0, duration: 1.5, ease: 'sine.inOut' })
}

/** 1 = lamp lit … 0 = lights out (only the back cover's room switches off) */
const lampGlow = (switchable: boolean) => (switchable ? Math.max(0, 1 - anim.lights.dark / DUSK) : 1)

/** Resets the switch when the world folds away (the page turn already relights the room). */
function LampDirector() {
  const id = useWorldId()
  useFrame(() => {
    if ((anim.presence[id]?.v ?? 0) < 0.02 && lampSwitch.tween) {
      lampSwitch.tween.kill()
      lampSwitch.tween = null
      lampSwitch.goingDark = false
    }
  })
  useEffect(
    () => () => {
      lampSwitch.tween?.kill()
      lampSwitch.tween = null
    },
    [],
  )
  return null
}

function LampLight({ switchable }: { switchable: boolean }) {
  const light = useRef<THREE.PointLight>(null!)
  const level = useWorldLevel(0.2)
  useFrame((s) => {
    light.current.intensity = level() * lampGlow(switchable) * (14 + Math.sin(s.clock.elapsedTime * 3) * 0.4)
  })
  return <PoolPointLight ref={light} position={[-5.6, 3.6, -4.2]} color="#ffcf8a" distance={14} decay={1.6} />
}

/** The shade: glows while the lamp is on, goes dim and dusty-blue when it's off. */
function LampShade({ switchable, onTap }: { switchable: boolean; onTap?: () => void }) {
  const tex = useSvgTexture(lampShade, 768)
  const mat = useMemo(() => {
    const base = paperMaterial(tex, { emissive: 0.9 })
    const m = base.clone()
    m.onBeforeCompile = base.onBeforeCompile
    m.customProgramCacheKey = base.customProgramCacheKey
    return m
  }, [tex])
  useEffect(() => () => mat.dispose(), [mat])
  const lit = useMemo(() => new THREE.Color('#ffffff'), [])
  const dusk = useMemo(() => new THREE.Color('#8a94bc'), [])
  useFrame(() => {
    const k = lampGlow(switchable)
    mat.emissiveIntensity = 0.9 * k
    mat.color.copy(dusk).lerp(lit, k)
  })
  return (
    <Cutout art={lampShade} material={mat} size={[1.9, 1.35]} at={[-5.6, 3.15, -4.58]} hinge="spring" delay={0.25} onTap={onTap} />
  )
}

/* ---- moonlight through the window: a beam, a pool on the floor, a cool spotlight ---- */

// the painted window on the wall (world units): x 6.5…11, y 4.8…8.9, on the wall at z ≈ −10.4
const WIN = { x0: 6.5, x1: 11, y0: 4.8, y1: 8.9, z: -10.4 }
// the beam falls down-left and toward the room, so the window's top edge lands farthest out
const SLOPE = { dx: -0.6, dz: 1.1 } // metres sideways / toward the camera per metre of drop
const landing = (x: number, y: number): [number, number, number] => [x + SLOPE.dx * y, 0.02, WIN.z + SLOPE.dz * y]

function MoonBeam() {
  const id = useWorldId()
  const tex = useSvgTexture(moonPool, 512)
  const beam = useRef<THREE.Mesh>(null!)
  const pool = useRef<THREE.Mesh>(null!)
  const spot = useRef<THREE.SpotLight>(null!)
  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      }),
    [],
  )
  const poolMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex,
        color: '#d2e0ff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
      }),
    [tex],
  )
  const beamGeo = useMemo(() => {
    const top = [
      [WIN.x0, WIN.y1],
      [WIN.x1, WIN.y1],
      [WIN.x1, WIN.y0],
      [WIN.x0, WIN.y0],
    ]
    const pos: number[] = []
    const col: number[] = []
    // 4 corners at the window (bright) and 4 on the floor (faint)
    top.forEach(([x, y]) => {
      pos.push(x, y, WIN.z)
      col.push(0.9, 0.95, 1)
    })
    top.forEach(([x, y]) => {
      const l = landing(x, y)
      pos.push(l[0], 0.02, l[2])
      col.push(0.12, 0.16, 0.26)
    })
    const idx: number[] = []
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4
      idx.push(i, j, 4 + j, i, 4 + j, 4 + i)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    g.setIndex(idx)
    return g
  }, [])
  const poolGeo = useMemo(() => {
    // floor patch: window bottom-left/right, top-right/left, with the window's picture mapped on
    const c = [
      landing(WIN.x0, WIN.y0),
      landing(WIN.x1, WIN.y0),
      landing(WIN.x1, WIN.y1),
      landing(WIN.x0, WIN.y1),
    ]
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(c.flat(), 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2))
    g.setIndex([0, 1, 2, 0, 2, 3])
    return g
  }, [])
  const target = useMemo(() => new THREE.Object3D(), [])
  useEffect(
    () => () => {
      beamMat.dispose()
      poolMat.dispose()
      beamGeo.dispose()
      poolGeo.dispose()
    },
    [beamMat, poolMat, beamGeo, poolGeo],
  )
  useFrame((s) => {
    const here = anim.presence[id]?.v ?? 0
    const m = Math.min(1, anim.lights.dark / DUSK) * here
    const flick = 1 + Math.sin(s.clock.elapsedTime * 0.8) * 0.04
    beamMat.opacity = 0.06 * m * flick
    poolMat.opacity = 0.95 * m * flick
    beam.current.visible = pool.current.visible = m > 0.003
    spot.current.intensity = 46 * m
  })
  return (
    <>
      <mesh ref={beam} geometry={beamGeo} material={beamMat} renderOrder={5} />
      <mesh ref={pool} geometry={poolGeo} material={poolMat} renderOrder={4} />
      <primitive object={target} position={[3.6, 0, -3]} />
      <PoolSpotLight
        ref={spot}
        position={[8.6, 7.2, -9.6]}
        target={target}
        color="#a9c1ff"
        intensity={0}
        angle={0.75}
        penumbra={1}
        distance={26}
        decay={1.3}
      />
    </>
  )
}

/* ---- the four blocks: tap to knock the tower over; they land spelling M-I-L-O ---- */

const BS = 0.4 // block size
type BlockSt = { x: number; y: number; z: number; rx: number; ry: number; rz: number }
/** tower spots (bottom row, middle, top), each block's slot in the word, and when it falls / restacks */
const BLOCKS = [
  { ch: 'L', tower: [-0.23, BS / 2, 0.02], tilt: 0.02, slot: 2, fall: 0.18, stack: 0 },
  { ch: 'O', tower: [0.23, BS / 2, -0.02], tilt: -0.03, slot: 3, fall: 0.3, stack: 0.1 },
  { ch: 'I', tower: [0.02, BS * 1.5, 0], tilt: 0.05, slot: 1, fall: 0.08, stack: 0.4 },
  { ch: 'M', tower: [-0.03, BS * 2.5, 0.01], tilt: -0.04, slot: 0, fall: 0, stack: 0.7 },
] as const
const SLOT_X = (i: number) => (i - 1.5) * 0.54
const SLOT_TILT = [-0.06, 0.05, -0.04, 0.07]
const blockArts = Object.fromEntries('MILO'.split('').map((c) => [c, blockFace(c)]))

const clack = () => {
  bus.emit('sfx', 'clatter')
  bus.emit('sfx', 'snap')
}

function Block({ ch, st }: { ch: string; st: BlockSt }) {
  const g = useRef<THREE.Group>(null!)
  const tex = useSvgTexture(blockArts[ch], 256)
  const mats = useMemo(() => {
    const [base, light] = BLOCK_COL[ch]
    const side = new THREE.MeshStandardMaterial({ color: base, roughness: 0.7 })
    const top = new THREE.MeshStandardMaterial({ color: light, roughness: 0.7 })
    const face = addGrain(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), tex)
    return [side, side, top, side, face, side]
  }, [ch, tex])
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useFrame(() => {
    g.current.position.set(st.x, st.y, st.z)
    g.current.rotation.set(st.rx, st.ry, st.rz)
  })
  return (
    <group ref={g}>
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={[BS, BS, BS * 0.9]} />
      </mesh>
    </group>
  )
}

function Blocks() {
  const lvl = useWorldLevel(0.12)
  const sts = useMemo<BlockSt[]>(() => BLOCKS.map((b) => ({ x: b.tower[0], y: b.tower[1], z: b.tower[2], rx: 0, ry: 0, rz: b.tilt })), [])
  const run = useRef({ fallen: false, tls: [] as gsap.core.Timeline[] })

  const killAll = () => {
    run.current.tls.forEach((t) => t.kill())
    run.current.tls = []
  }
  const reset = () => {
    killAll()
    run.current.fallen = false
    BLOCKS.forEach((b, i) => Object.assign(sts[i], { x: b.tower[0], y: b.tower[1], z: b.tower[2], rx: 0, ry: 0, rz: b.tilt }))
  }
  useEffect(() => reset, []) // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {
    if (lvl() < 0.01 && (run.current.fallen || run.current.tls.length)) reset()
  })

  const flip = () => {
    killAll()
    const fall = !run.current.fallen
    run.current.fallen = fall
    bus.emit('sfx', 'snap')
    BLOCKS.forEach((b, i) => {
      const s = sts[i]
      const tl = gsap.timeline({ delay: fall ? b.fall : b.stack })
      const floorY = BS / 2
      if (fall) {
        const dir = i % 2 ? -1 : 1
        const tx = SLOT_X(b.slot)
        const rz = Math.round(s.rz / TAU) * TAU + dir * TAU * (b.slot % 2 ? 1 : 2) + SLOT_TILT[b.slot]
        const air = 0.42 + (s.y - floorY) * 0.12
        tl.to(s, { x: tx, duration: air + 0.46, ease: 'power1.out' }, 0)
        tl.to(s, { rz, duration: air + 0.4, ease: 'power1.out' }, 0)
        tl.to(s, { rx: 0.9 * dir, ry: 0.5 * -dir, duration: air * 0.6, ease: 'sine.out' }, 0)
        tl.to(s, { rx: 0, ry: 0, duration: air * 0.5, ease: 'sine.in' }, air * 0.6)
        tl.to(s, { z: 0.35 + b.slot * 0.03, duration: air, ease: 'sine.out' }, 0)
        tl.to(s, { y: floorY, duration: air, ease: 'power2.in' }, 0)
        tl.call(clack, undefined, air)
        tl.to(s, { y: floorY + 0.2, duration: 0.14, ease: 'power2.out' }, air)
        tl.to(s, { y: floorY, duration: 0.14, ease: 'power2.in' }, air + 0.14)
        tl.call(() => bus.emit('sfx', 'snap'), undefined, air + 0.28)
        tl.to(s, { y: floorY + 0.06, duration: 0.07, ease: 'power2.out' }, air + 0.28)
        tl.to(s, { y: floorY, duration: 0.07, ease: 'power2.in' }, air + 0.35)
      } else {
        const rz = Math.round(s.rz / TAU) * TAU + b.tilt
        tl.to(s, { x: b.tower[0], z: b.tower[2], duration: 0.55, ease: 'power2.inOut' }, 0)
        tl.to(s, { rz, rx: 0, ry: 0, duration: 0.55, ease: 'power2.inOut' }, 0)
        tl.to(s, { y: b.tower[1] + 0.5, duration: 0.28, ease: 'power2.out' }, 0)
        tl.to(s, { y: b.tower[1], duration: 0.27, ease: 'power2.in' }, 0.28)
        tl.call(() => bus.emit('sfx', 'snap'), undefined, 0.55)
        tl.to(s, { y: b.tower[1] + 0.05, duration: 0.06, ease: 'power2.out' }, 0.55)
        tl.to(s, { y: b.tower[1], duration: 0.06, ease: 'power2.in' }, 0.61)
      }
      run.current.tls.push(tl)
    })
  }

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (lvl() < 0.5) return
    e.stopPropagation()
    flip()
  }
  return (
    <group
      onPointerDown={down}
      onPointerOver={() => {
        if (lvl() >= 0.5) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {BLOCKS.map((b, i) => (
        <Block key={b.ch} ch={b.ch} st={sts[i]} />
      ))}
    </group>
  )
}

/* ---- the toy excavator: tap and it scoops dirt ---- */

type Dust = { m: THREE.Mesh; x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; grav: number }
const DUST_N = 16

function Digger() {
  const lvl = useWorldLevel(0.12)
  const root = useRef<THREE.Group>(null!)
  const tip = useRef<THREE.Group>(null!)
  const d = useRef({ boom: 0, stick: 0, bucket: 0, load: 0, tl: null as gsap.core.Timeline | null })
  const dust = useRef<Dust[]>([])
  const dirt = useMemo(() => new THREE.MeshBasicMaterial({ color: '#8a5a33', transparent: true, depthWrite: false }), [])
  const dirt2 = useMemo(() => new THREE.MeshBasicMaterial({ color: '#d9bd90', transparent: true, depthWrite: false }), [])
  const loadM = useRef<THREE.Mesh>(null!)
  useEffect(
    () => () => {
      d.current.tl?.kill()
      dirt.dispose()
      dirt2.dispose()
    },
    [dirt, dirt2],
  )

  const reset = () => {
    d.current.tl?.kill()
    d.current.tl = null
    Object.assign(d.current, { boom: 0, stick: 0, bucket: 0, load: 0 })
    dust.current.forEach((p) => (p.life = 0))
  }
  const spawn = (n: number, x: number, y: number, kind: 'puff' | 'fall') => {
    let k = 0
    for (const p of dust.current) {
      if (p.life > 0) continue
      const a = Math.random() * Math.PI
      p.x = x + (Math.random() - 0.5) * 0.08
      p.y = y
      if (kind === 'puff') {
        p.vx = Math.cos(a) * 0.55 + 0.1
        p.vy = Math.sin(a) * 0.7 + 0.15
        p.grav = 0.9
        p.m.material = Math.random() < 0.5 ? dirt2 : dirt
        p.size = 0.09 + Math.random() * 0.08
        p.max = 0.8 + Math.random() * 0.3
      } else {
        p.vx = (Math.random() - 0.5) * 0.25
        p.vy = Math.random() * 0.15
        p.grav = 3.4
        p.size = 0.035 + Math.random() * 0.035
        p.max = 0.9
      }
      p.life = p.max
      if (++k >= n) break
    }
  }
  /** the bucket lip, in this piece's space */
  const tipPos = (() => {
    const v = new THREE.Vector3()
    return () => {
      tip.current.updateWorldMatrix(true, false)
      tip.current.getWorldPosition(v)
      root.current.worldToLocal(v)
      return v
    }
  })()

  useFrame((_, rawDt) => {
    const dt = rawDt * gsap.globalTimeline.timeScale()
    const lv = lvl()
    if (lv < 0.01 && (d.current.tl || d.current.boom !== 0)) reset()
    for (const p of dust.current) {
      if (p.life <= 0) {
        p.m.visible = false
        continue
      }
      p.life -= dt
      p.vy -= p.grav * dt
      p.x += p.vx * dt
      p.y = Math.max(0.025, p.y + p.vy * dt)
      if (p.y <= 0.026) p.vx *= 0.9
      const k = Math.max(0, p.life / p.max)
      p.m.visible = true
      p.m.position.set(p.x, p.y, 0.05)
      p.m.scale.setScalar(p.size * (p.grav < 2 ? 1.6 - k * 0.8 : 0.3 + k * 0.7) * (k < 0.25 ? k * 4 : 1))
    }
    loadM.current.scale.setScalar(Math.max(0.0001, d.current.load))
  })

  const dig = () => {
    if (lvl() < 0.5 || d.current.tl?.isActive()) return
    const s = d.current
    bus.emit('sfx', 'whirr')
    bus.emit('milo', 'cheer')
    const tl = gsap.timeline({ onComplete: () => (s.tl = null) })
    s.tl = tl
    tl.to(s, { boom: 0.18, stick: 0.25, bucket: 0.35, duration: 0.3, ease: 'power2.out' }) // wind-up
      .to(s, { boom: -0.62, stick: -0.3, bucket: 0.1, duration: 0.8, ease: 'power2.inOut' }) // reach down
      .call(() => {
        const p = tipPos()
        bus.emit('sfx', 'snap')
        spawn(6, p.x, 0.06, 'puff') // the bucket bites the ground
      })
      .to(s, { stick: -0.85, bucket: -0.35, duration: 0.55, ease: 'power2.inOut' }) // pull the dirt in
      .call(() => {
        const p = tipPos()
        bus.emit('sfx', 'snap')
        spawn(6, p.x, 0.06, 'puff')
      }, undefined, '<0.25')
      .to(s, { bucket: -0.95, load: 1, duration: 0.3, ease: 'back.out(2)' }) // curl
      .to(s, { boom: 0.2, stick: -0.15, duration: 0.8, ease: 'power2.inOut' }) // lift
      .to(s, { duration: 0.1 })
      .to(s, { bucket: 0.55, duration: 0.4, ease: 'power2.in' }) // tip it out
      .call(() => {
        const p = tipPos()
        bus.emit('sfx', 'boing')
        spawn(7, p.x, p.y, 'fall')
      }, undefined, '<0.18')
      .to(s, { load: 0, duration: 0.3 }, '<0.15')
      .to(s, { boom: 0, stick: 0, bucket: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.1') // back to rest
  }

  const px = (x: number, y: number, p: { px: number; py: number }): [number, number] => [(x - p.px) * DK, (p.py - y) * DK]
  const off = (p: { w: number; h: number; px: number; py: number }): [number, number] => [(p.w / 2 - p.px) * DK, (p.py - p.h / 2) * DK]
  const elbow: [number, number, number] = [...px(BOOM.ex, BOOM.ey, BOOM), 0]
  const wrist: [number, number, number] = [...px(STICK.ex, STICK.ey, STICK), 0]
  const lip = px(34, 108, BUCKET)
  const cup = px(78, 66, BUCKET)
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (lvl() < 0.5) return
    e.stopPropagation()
    bus.emit('sfx', 'pop')
    dig()
  }
  return (
    <Cutout art={diggerBody} size={[DIG_W * DK, DIG_H * DK]} at={[-4.9, 0, -0.5]} delay={0.12} rotY={0.4} onTap={dig}>
    <group
      ref={root}
      onPointerDown={onDown}
      onPointerOver={() => {
        if (lvl() >= 0.5) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <Part
        art={diggerBoom}
        size={[BOOM.w * DK, BOOM.h * DK]}
        pivot={[(BODY_PIVOT.x - DIG_W / 2) * DK, (DIG_H - BODY_PIVOT.y) * DK, 0]}
        offset={off(BOOM)}
        z={0.01}
        animate={(g) => (g.rotation.z = d.current.boom)}
      >
        <Part art={diggerStick} size={[STICK.w * DK, STICK.h * DK]} pivot={elbow} offset={off(STICK)} z={0.006} animate={(g) => (g.rotation.z = d.current.stick)}>
          <Part art={diggerBucket} size={[BUCKET.w * DK, BUCKET.h * DK]} pivot={wrist} offset={off(BUCKET)} z={0.006} animate={(g) => (g.rotation.z = d.current.bucket)}>
            <group ref={tip} position={[lip[0], lip[1], 0]} />
            <mesh ref={loadM} material={dirt} position={[cup[0], cup[1], 0.02]}>
              <circleGeometry args={[0.07, 14]} />
            </mesh>
          </Part>
        </Part>
      </Part>
      {Array.from({ length: DUST_N }, (_, i) => (
        <mesh
          key={i}
          visible={false}
          material={dirt}
          ref={(m) => {
            if (!m) return
            dust.current[i] = dust.current[i] ?? { m, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 0.05, grav: 1 }
            dust.current[i].m = m
          }}
        >
          <circleGeometry args={[1, 10]} />
        </mesh>
      ))}
    </group>
    </Cutout>
  )
}

/** The living room from the photo, as a paper diorama around the book. */
export function RoomWorld({ switchable = false }: { switchable?: boolean }) {
  return (
    <group>
      <Cutout art={wall} size={[34, 10.8]} at={[0, 0, -10.5]} hinge="rise" delay={0.05} px={2048} shadow={false} />
      <Cutout art={familyDrawing} size={[1.7, 1.95]} at={[-4.2, 4.0, -10.35]} hinge="spring" delay={0.35} />
      <Cutout art={truckDrawing} size={[1.7, 1.95]} at={[-1.4, 4.6, -10.35]} hinge="spring" delay={0.4} />
      <Cutout art={seaPicture} size={[2.5, 1.8]} at={[1.8, 4.3, -10.35]} hinge="spring" delay={0.45} />
      <Cutout art={couch} size={[7.4, 3.2]} at={[0.6, 0, -6.6]} delay={0.1} />
      <Cutout art={lampPole} size={[0.9, 4.1]} at={[-5.6, 0, -4.6]} delay={0.15} onTap={switchable ? toggleLamp : undefined} />
      <LampShade switchable={switchable} onTap={switchable ? toggleLamp : undefined} />
      <LampLight switchable={switchable} />
      {switchable && <LampDirector />}
      {switchable && <MoonBeam />}
      <Cutout art={sideTable} size={[1.6, 1.9]} at={[5.6, 0, -5.4]} delay={0.2} />
      <Cutout art={shelf} size={[2.4, 4.3]} at={[8.2, 0, -7.6]} delay={0.25} rotY={-0.4} />
      <Cutout art={rug} size={[8.5, 6.2]} at={[0, 0.004, 3.1]} flat delay={0} shadow={false} />
      {/* four blocks: knock them down, they spell M-I-L-O */}
      <Cutout art={nothing} size={[0.01, 0.01]} at={[3.1, 0, 0.4]} delay={0.12} hinge="spring" contact={false} shadow={false}>
        <Blocks />
      </Cutout>
      {/* the toy excavator scoops when tapped */}
      <Digger />
    </group>
  )
}

/* -------------------------------------------------------------- spreads -- */

export const coverArt = svgDoc(
  900,
  1238,
  `<radialGradient id="cv" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#e2453a"/><stop offset="1" stop-color="#9e231d"/></radialGradient>
   <rect width="900" height="1238" fill="url(#cv)"/>
   <g fill="#ffd34d" opacity=".9">
     <path d="${starPath(120, 420, 30)}"/><path d="${starPath(780, 380, 36)}"/><path d="${starPath(160, 900, 22)}"/><path d="${starPath(760, 860, 26)}"/><path d="${starPath(700, 560, 16)}"/><path d="${starPath(200, 640, 16)}"/>
   </g>
   <circle cx="450" cy="760" r="300" fill="#ffcb2f" opacity=".25"/>
   <circle cx="450" cy="760" r="240" fill="#ffcb2f" opacity=".25"/>
   <g transform="translate(270 470) scale(0.9)">${miloFigure({ outfit: 'superhero' })}</g>`,
)

export const coverSpread: SpreadDef = {
  id: 'cover',
  world: 'room',
  palette: palettes.livingRoom,
  outfit: 'plain',
  miloReact: 'wave',
}
