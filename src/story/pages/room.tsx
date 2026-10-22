import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { svgDoc } from '../../art/texture'
import { starPath } from '../../art/kit'
import { Cutout, useWorldLevel } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'
import { miloFigure } from '../../milo/art'

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

const toyBlocks = svgDoc(
  360,
  300,
  `<rect x="20" y="160" width="130" height="130" rx="10" fill="#e8322b"/><text x="85" y="255" font-family="Fredoka" font-weight="700" font-size="90" fill="#fff" text-anchor="middle">M</text>
   <rect x="160" y="160" width="130" height="130" rx="10" fill="#3a6fd8"/><text x="225" y="255" font-family="Fredoka" font-weight="700" font-size="90" fill="#fff" text-anchor="middle">I</text>
   <rect x="90" y="24" width="130" height="130" rx="10" fill="#f4c542"/><text x="155" y="120" font-family="Fredoka" font-weight="700" font-size="90" fill="#fff" text-anchor="middle">L</text>`,
  { cut: 6 },
)

const toyDigger = svgDoc(
  420,
  300,
  `<rect x="40" y="220" width="240" height="50" rx="25" fill="#3a3a3a"/>
   <circle cx="75" cy="245" r="18" fill="#777"/><circle cx="160" cy="245" r="18" fill="#777"/><circle cx="245" cy="245" r="18" fill="#777"/>
   <rect x="60" y="140" width="200" height="80" rx="12" fill="#f4b400"/>
   <rect x="80" y="70" width="90" height="80" rx="10" fill="#f4b400"/><rect x="95" y="84" width="60" height="50" rx="6" fill="#bfe6ff"/>
   <path d="M250 160 L 340 70 L 360 90 L 280 180 Z" fill="#e0a000"/>
   <path d="M340 70 L 400 140 L 384 152 L 330 96 Z" fill="#e0a000"/>
   <path d="M372 130 L 414 170 L 380 210 L 350 170 Z" fill="#666"/>`,
  { cut: 6 },
)

/* ---------------------------------------------------------------- world -- */

function LampLight() {
  const light = useRef<THREE.PointLight>(null!)
  const level = useWorldLevel(0.2)
  useFrame((s) => {
    light.current.intensity = level() * (14 + Math.sin(s.clock.elapsedTime * 3) * 0.4)
  })
  return <pointLight ref={light} position={[-5.6, 3.6, -4.2]} color="#ffcf8a" distance={14} decay={1.6} />
}

/** The living room from the photo, as a paper diorama around the book. */
export function RoomWorld() {
  return (
    <group>
      <Cutout art={wall} size={[34, 10.8]} at={[0, 0, -10.5]} hinge="rise" delay={0.05} px={2048} shadow={false} />
      <Cutout art={familyDrawing} size={[1.7, 1.95]} at={[-4.2, 4.0, -10.35]} hinge="spring" delay={0.35} />
      <Cutout art={truckDrawing} size={[1.7, 1.95]} at={[-1.4, 4.6, -10.35]} hinge="spring" delay={0.4} />
      <Cutout art={seaPicture} size={[2.5, 1.8]} at={[1.8, 4.3, -10.35]} hinge="spring" delay={0.45} />
      <Cutout art={couch} size={[7.4, 3.2]} at={[0.6, 0, -6.6]} delay={0.1} />
      <Cutout art={lampPole} size={[0.9, 4.1]} at={[-5.6, 0, -4.6]} delay={0.15} />
      <Cutout art={lampShade} size={[1.9, 1.35]} at={[-5.6, 3.15, -4.58]} hinge="spring" delay={0.25} emissive={0.9} />
      <LampLight />
      <Cutout art={sideTable} size={[1.6, 1.9]} at={[5.6, 0, -5.4]} delay={0.2} />
      <Cutout art={shelf} size={[2.4, 4.3]} at={[8.2, 0, -7.6]} delay={0.25} rotY={-0.4} />
      <Cutout art={rug} size={[8.5, 6.2]} at={[0, 0.004, 3.1]} flat delay={0} shadow={false} />
      <Cutout art={toyBlocks} size={[1.1, 0.92]} at={[3.0, 0, 0.2]} delay={0.12} rotY={-0.4} tap="jump" />
      <Cutout art={toyDigger} size={[1.4, 1.0]} at={[-4.3, 0, -0.6]} delay={0.12} rotY={0.4} tap="wiggle" />
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
