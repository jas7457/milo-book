import { svgDoc } from '../texture'
import { INK } from '../style'
import { FONT, cube, hardHatSmall, reedFrag } from './frags'

/* Front + middle layer extras: ducks, frog, reeds, the sign, the truck and the crane. */

export const duckArt = (opts: { hat?: boolean; flip?: boolean; body?: string; shade?: string } = {}) => {
  const body = opts.body ?? '#ffd23c'
  const shade = opts.shade ?? '#f0aa14'
  const g = `
    <ellipse cx="150" cy="248" rx="124" ry="24" fill="#bdeaff" opacity=".75" stroke="#fff" stroke-width="5"/>
    <ellipse cx="150" cy="248" rx="86" ry="14" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>
    <path d="M44 150 Q 20 120 30 96 Q 62 112 72 144 Z" fill="${body}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 130 Q 20 168 70 226 Q 150 266 232 220 Q 262 170 232 130 Q 196 100 150 114 Q 86 100 40 130 Z" fill="${body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M60 196 Q 150 250 232 214 Q 250 190 244 170 Q 200 232 80 212 Z" fill="${shade}" opacity=".7"/>
    <path d="M72 140 Q 100 120 140 126" stroke="#fff6b0" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M90 160 Q 140 140 176 170 Q 150 214 100 206 Q 76 190 90 160 Z" fill="${shade}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M110 176 Q 140 164 160 182" stroke="#fff6b0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    <!-- neck + head -->
    <path d="M190 130 Q 200 66 232 66 Q 262 66 262 100 Q 262 130 240 140 Z" fill="${body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="238" cy="90" r="40" fill="${body}" stroke="${INK}" stroke-width="6"/>
    <path d="M266 96 Q 300 90 298 108 Q 290 124 262 118 Z" fill="#ff8a1e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M268 106 L 292 106" stroke="${INK}" stroke-width="3" opacity=".6"/>
    <circle cx="246" cy="80" r="9" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="249" cy="80" r="4.5" fill="${INK}"/><circle cx="251" cy="78" r="1.8" fill="#fff"/>
    <circle cx="232" cy="106" r="8" fill="#ff9aa8" opacity=".7"/>
    ${opts.hat ? hardHatSmall(232, 56, 1.15, 6) : ''}`
  return svgDoc(320, 280, opts.flip ? `<g transform="translate(320 0) scale(-1 1)">${g}</g>` : g, { cut: 5 })
}

export const frogArt = svgDoc(
  320,
  240,
  `<ellipse cx="160" cy="190" rx="140" ry="40" fill="#1d6a9a" opacity=".3"/>
   <path d="M20 190 Q 20 160 160 156 Q 300 160 300 190 Q 300 224 160 226 Q 20 224 20 190 Z" fill="#53bb4f" stroke="#2c7a36" stroke-width="5"/>
   <path d="M160 190 L 300 176" stroke="#8be07a" stroke-width="3.5" stroke-linecap="round"/>
   <!-- frog -->
   <path d="M70 180 Q 50 150 76 120 Q 120 140 118 184 Z" fill="#4fbf3a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M250 180 Q 270 150 244 120 Q 200 140 202 184 Z" fill="#4fbf3a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M110 192 Q 90 110 160 96 Q 230 110 210 192 Z" fill="#6fd64a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M126 168 Q 160 190 194 168 Q 190 192 160 194 Q 130 192 126 168 Z" fill="#d9f2a0" opacity=".85"/>
   <circle cx="128" cy="96" r="26" fill="#6fd64a" stroke="${INK}" stroke-width="6"/><circle cx="192" cy="96" r="26" fill="#6fd64a" stroke="${INK}" stroke-width="6"/>
   <circle cx="128" cy="94" r="15" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="192" cy="94" r="15" fill="#fff" stroke="${INK}" stroke-width="4"/>
   <circle cx="131" cy="95" r="7.5" fill="${INK}"/><circle cx="189" cy="95" r="7.5" fill="${INK}"/><circle cx="133" cy="92" r="2.5" fill="#fff"/><circle cx="191" cy="92" r="2.5" fill="#fff"/>
   <path d="M126 132 Q 160 156 194 132" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
   <circle cx="116" cy="130" r="7" fill="#ff9aa8" opacity=".7"/><circle cx="204" cy="130" r="7" fill="#ff9aa8" opacity=".7"/>
   ${[[150, 122], [172, 130], [140, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#46a82e" opacity=".8"/>`).join('')}`,
  { cut: 5 },
)

export const reedsArt = svgDoc(300, 440, `${reedFrag(150, 430, 1.55)}`, { cut: 5 })
export const reedsArt2 = svgDoc(300, 440, `<g transform="translate(300 0) scale(-1 1)">${reedFrag(150, 430, 1.4)}</g>`, { cut: 5 })

/* ------------------------------------------------------------ signs -- */

const boardPost = `
  <path d="M120 560 L 120 240 M320 560 L 320 240" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
  <path d="M120 560 L 120 240 M320 560 L 320 240" stroke="#c9a06a" stroke-width="18" stroke-linecap="round"/>
  <path d="M112 520 L 112 260" stroke="#e8cc92" stroke-width="5"/>`

export const signArt = svgDoc(
  440,
  580,
  `${boardPost}
   <g transform="rotate(-3 220 150)">
     <rect x="20" y="30" width="400" height="230" rx="22" fill="#f4c542" stroke="${INK}" stroke-width="7"/>
     <rect x="38" y="48" width="364" height="194" rx="12" fill="none" stroke="#fff6d0" stroke-width="5" stroke-dasharray="22 14"/>
     <text x="220" y="116" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="62" fill="#d0372a">NO</text>
     <text x="220" y="180" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="62" fill="#d0372a">BRIDGE!</text>
     <!-- sad face -->
     <circle cx="150" cy="218" r="6" fill="${INK}"/><circle cx="290" cy="218" r="6" fill="${INK}"/><path d="M190 228 Q 220 208 250 228" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M290 226 Q 296 238 290 246" stroke="#4aa8e8" stroke-width="6" fill="none" stroke-linecap="round"/>
     ${[60, 380].map((x) => `<circle cx="${x}" cy="52" r="7" fill="#9aa3ad" stroke="${INK}" stroke-width="3"/>`).join('')}
   </g>
   <path d="M60 560 L 380 560 L 380 580 L 60 580 Z" fill="#79b85a"/>`,
  { cut: 5 },
)

export const hoorayArt = svgDoc(
  440,
  290,
  `<g transform="rotate(-3 220 150)">
     <rect x="20" y="30" width="400" height="230" rx="22" fill="#5fd06a" stroke="${INK}" stroke-width="7"/>
     <rect x="38" y="48" width="364" height="194" rx="12" fill="none" stroke="#e6ffe0" stroke-width="5" stroke-dasharray="22 14"/>
     <text x="220" y="120" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="66" fill="#fff" stroke="${INK}" stroke-width="3">HOORAY!</text>
     <circle cx="160" cy="190" r="7" fill="${INK}"/><circle cx="280" cy="190" r="7" fill="${INK}"/>
     <path d="M170 206 Q 220 252 270 206 Z" fill="#c8322b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M70 70 l 6 12 l 12 6 l -12 6 l -6 12 l -6 -12 l -12 -6 l 12 -6 z M370 66 l 6 12 l 12 6 l -12 6 l -6 12 l -6 -12 l -12 -6 l 12 -6 z" fill="#fff6a8"/>
   </g>`,
  { cut: 5 },
)

/* -------------------------------------------------------- the truck -- */

export const TRUCK = { w: 640, h: 380 }
export const TRUCK_WHEELS = [[120, 300], [250, 300], [500, 300]] as const

export const truckArt = svgDoc(
  TRUCK.w,
  TRUCK.h,
  `<!-- chassis -->
   <rect x="30" y="250" width="590" height="34" rx="8" fill="#555c66" stroke="${INK}" stroke-width="6"/>
   <!-- load of toy blocks -->
   <g transform="translate(60 8)">${cube(0, 50, 96, '#e8322b', '#b8221c', '#f26a5e')}${cube(120, 34, 96, '#3a8be0', '#2a5fb0', '#78b4f2')}${cube(236, 56, 84, '#2f9a4a', '#217538', '#5cc072')}</g>
   <!-- tipper bed -->
   <path d="M26 112 L 372 112 L 350 262 L 40 262 Z" fill="#ff8a2e" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M26 112 L 372 112 L 368 138 L 30 138 Z" fill="#ffb26a"/>
   <path d="M330 138 L 372 112 L 350 262 L 322 262 Z" fill="#d96a12" opacity=".55"/>
   ${[100, 170, 240, 306].map((x) => `<path d="M${x} 140 L ${x - 4 + (x > 200 ? -6 : 4)} 258" stroke="#d96a12" stroke-width="6"/>`).join('')}
   ${[44, 372].map((x) => `<circle cx="${x}" cy="124" r="6.5" fill="#fff3c8" stroke="${INK}" stroke-width="3"/>`).join('')}
   <rect x="22" y="104" width="356" height="16" rx="6" fill="#ffd0a0" stroke="${INK}" stroke-width="5"/>
   <text x="196" y="214" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="46" fill="#fff" stroke="${INK}" stroke-width="2.5" paint-order="stroke">MILO</text>
   <!-- cab -->
   <path d="M392 262 L 392 112 Q 392 92 412 92 L 500 92 Q 520 92 530 112 L 548 158 L 596 166 Q 618 172 618 196 L 618 262 Z" fill="#ffc21a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M530 112 L 548 158 L 596 166 L 618 196 L 618 262 L 560 262 Q 566 180 530 112 Z" fill="#e0a400" opacity=".5"/>
   <path d="M410 150 L 410 112 Q 410 106 418 106 L 494 106 Q 506 106 512 118 L 530 150 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M426 112 L 418 146 M448 112 L 440 146" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".75"/>
   <!-- the bear driver -->
   <g transform="translate(466 142)">
     <circle cx="-26" cy="-22" r="12" fill="#a5703d" stroke="${INK}" stroke-width="4"/><circle cx="26" cy="-22" r="12" fill="#a5703d" stroke="${INK}" stroke-width="4"/>
     <circle cx="0" cy="0" r="34" fill="#b8814a" stroke="${INK}" stroke-width="5"/>
     <ellipse cx="0" cy="12" rx="17" ry="13" fill="#f0d3a0" stroke="${INK}" stroke-width="3.5"/>
     <ellipse cx="0" cy="6" rx="6" ry="4.5" fill="${INK}"/>
     <circle cx="-14" cy="-8" r="5" fill="${INK}"/><circle cx="14" cy="-8" r="5" fill="${INK}"/><circle cx="-12.5" cy="-9.5" r="1.8" fill="#fff"/><circle cx="15.5" cy="-9.5" r="1.8" fill="#fff"/>
     <path d="M-8 20 Q 0 28 8 20" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
     ${hardHatSmall(0, -26, 0.78)}
   </g>
   <rect x="410" y="148" width="130" height="14" fill="#ffc21a"/>
   <path d="M404 156 L 540 156" stroke="${INK}" stroke-width="5"/>
   <path d="M420 198 L 520 198 M420 224 L 520 224" stroke="#e0a400" stroke-width="6" stroke-linecap="round"/>
   <rect x="446" y="196" width="46" height="12" rx="6" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/>
   <!-- grille, lamp, bumper -->
   <rect x="596" y="206" width="22" height="42" rx="6" fill="#555c66" stroke="${INK}" stroke-width="4"/>
   <circle cx="606" cy="184" r="14" fill="#fff6a8" stroke="${INK}" stroke-width="5"/><circle cx="602" cy="180" r="4" fill="#fff"/>
   <rect x="586" y="248" width="48" height="22" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <!-- exhaust -->
   <rect x="396" y="30" width="22" height="70" rx="6" fill="#555c66" stroke="${INK}" stroke-width="5"/>
   <rect x="392" y="22" width="30" height="16" rx="6" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/>
   <!-- wheel wells -->
   ${TRUCK_WHEELS.map(([x, y]) => `<path d="M${x - 62} ${y + 6} A 62 62 0 0 1 ${x + 62} ${y + 6} Z" fill="#3a3a44" stroke="${INK}" stroke-width="5"/>`).join('')}
   <path d="M22 262 L 600 262" stroke="#000" stroke-width="4" opacity=".15"/>`,
  { cut: 5 },
)

export const wheelArt = svgDoc(
  130,
  130,
  `<circle cx="65" cy="65" r="60" fill="#2b2b2b" stroke="${INK}" stroke-width="6"/>
   <circle cx="65" cy="65" r="38" fill="#ffc21a" stroke="${INK}" stroke-width="5"/>
   ${[0, 1, 2, 3, 4].map((i) => {
     const a = (i / 5) * Math.PI * 2
     return `<circle cx="${(65 + Math.cos(a) * 22).toFixed(1)}" cy="${(65 + Math.sin(a) * 22).toFixed(1)}" r="6" fill="#e0a400"/>`
   }).join('')}
   <circle cx="65" cy="65" r="10" fill="#9aa3ad" stroke="${INK}" stroke-width="3.5"/>
   <path d="M30 28 Q 50 14 76 14" stroke="#fff" stroke-width="6" opacity=".3" fill="none" stroke-linecap="round"/>`,
)

export const smokePuff = svgDoc(
  120,
  100,
  `<circle cx="60" cy="56" r="30" fill="#f2f2f2" stroke="#c9c9c9" stroke-width="4"/><circle cx="34" cy="66" r="22" fill="#f2f2f2" stroke="#c9c9c9" stroke-width="4"/><circle cx="88" cy="64" r="22" fill="#f2f2f2" stroke="#c9c9c9" stroke-width="4"/><circle cx="60" cy="56" r="30" fill="#f2f2f2"/>`,
  { grain: 0.4 },
)

/* --------------------------------------------------------- the crane -- */

export const CRANE = { w: 1000, h: 1100 }

const lattice = (x0: number, x1: number, y0: number, y1: number, n: number) => {
  const dx = (x1 - x0) / n
  let d = ''
  for (let i = 0; i < n; i++) {
    d += `M${x0 + i * dx} ${y1} L ${x0 + (i + 0.5) * dx} ${y0} L ${x0 + (i + 1) * dx} ${y1} `
  }
  return d
}
const tube = (d: string, w: number, c = '#ffc21a') =>
  `<path d="${d}" stroke="${INK}" stroke-width="${w + 8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`

export const craneArt = svgDoc(
  CRANE.w,
  CRANE.h,
  `<!-- base -->
   <rect x="110" y="1030" width="250" height="60" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 8 }, (_, i) => `<path d="M${130 + i * 30} 1090 L ${160 + i * 30} 1032 L ${176 + i * 30} 1032 L ${146 + i * 30} 1090 Z" fill="#2b2b2b" opacity=".85"/>`).join('')}
   <!-- mast -->
   <g>${tube('M170 1030 L 170 190 M250 1030 L 250 190', 16)}</g>
   ${Array.from({ length: 10 }, (_, i) => tube(`M170 ${1030 - i * 84} L 250 ${946 - i * 84} M250 ${1030 - i * 84} L 170 ${946 - i * 84}`, 8)).join('')}
   ${Array.from({ length: 11 }, (_, i) => tube(`M170 ${1030 - i * 84} L 250 ${1030 - i * 84}`, 8)).join('')}
   <!-- slewing unit + cab -->
   <rect x="140" y="150" width="140" height="50" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="6"/>
   <rect x="280" y="108" width="96" height="92" rx="10" fill="#ffc21a" stroke="${INK}" stroke-width="6"/>
   <rect x="296" y="124" width="64" height="48" rx="6" fill="#bfe6ff" stroke="${INK}" stroke-width="4"/><path d="M306 128 L 300 168" stroke="#fff" stroke-width="7" opacity=".7" stroke-linecap="round"/>
   <!-- counter jib + weights -->
   ${tube('M40 150 L 150 150 M40 150 L 150 110', 14)}
   ${[[36, 150], [72, 150], [108, 150]].map(([x]) => `<rect x="${x}" y="150" width="34" height="70" rx="4" fill="#8d96a0" stroke="${INK}" stroke-width="5"/><path d="M${x + 8} 160 L ${x + 8} 206" stroke="#fff" stroke-width="5" opacity=".35"/>`).join('')}
   <!-- main jib -->
   ${tube('M250 140 L 960 150 M250 98 L 960 150', 12)}
   ${tube(lattice(262, 950, 100, 148, 10), 7)}
   <!-- A-frame + tie rods -->
   ${tube('M170 190 L 210 20 L 250 190', 14)}
   <path d="M210 20 L 960 148 M210 20 L 46 148" stroke="${INK}" stroke-width="6"/><path d="M210 20 L 960 148 M210 20 L 46 148" stroke="#c9ced6" stroke-width="2.5"/>
   <circle cx="210" cy="18" r="15" fill="#e8322b" stroke="${INK}" stroke-width="5"/>
   <!-- trolley -->
   <rect x="770" y="150" width="62" height="28" rx="6" fill="#555c66" stroke="${INK}" stroke-width="5"/>
   <!-- warning flag + paint -->
   <path d="M960 150 L 960 100" stroke="${INK}" stroke-width="7"/><path d="M960 104 L 1000 116 L 960 130 Z" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  { cut: 5 },
)

/** hook + rope + a toy block hanging from it; pivot at the very top */
export const HOOK = { w: 140, h: 420 }
export const hookArt = svgDoc(
  HOOK.w,
  HOOK.h,
  `<path d="M70 0 L 70 214" stroke="${INK}" stroke-width="8"/><path d="M70 0 L 70 214" stroke="#8a6a44" stroke-width="3.5" stroke-dasharray="6 5"/>
   <rect x="52" y="196" width="36" height="34" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <path d="M70 228 L 70 244 Q 70 262 54 262 Q 40 260 44 248" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M70 228 L 70 244 Q 70 262 54 262 Q 40 260 44 248" stroke="#c9ced6" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M70 260 L 14 316 M70 260 L 126 316" stroke="${INK}" stroke-width="6"/>
   <g transform="translate(14 310)">${cube(0, 0, 90, '#2f9a4a', '#217538', '#5cc072')}</g>`,
  { cut: 3 },
)
