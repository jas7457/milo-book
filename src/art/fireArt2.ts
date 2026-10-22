import { svgDoc } from './texture'
import { INK } from './style'
import { starPath } from './kit'
import { FONT } from './fireArt'

/* The big red fire truck (and its animated parts), the hose nozzle, the
 * Dalmatian, hydrant, cones, street lamp. */

export const TRUCK = { w: 1240, h: 700 }
const RED = '#e23a2d'
const RED_D = '#b8261c'
const RED_L = '#f26a5a'
const CHROME = '#d8dee6'
const CHROME_D = '#98a2ae'

const rivets = (x: number, y: number, n: number, dx: number) =>
  Array.from({ length: n }, (_, i) => `<circle cx="${x + i * dx}" cy="${y}" r="3.5" fill="${CHROME_D}" stroke="${INK}" stroke-width="1.5"/>`).join('')

const gauge = (x: number, y: number, r: number) =>
  `<circle cx="${x}" cy="${y}" r="${r + 6}" fill="${CHROME}" stroke="${INK}" stroke-width="4"/>
   <circle cx="${x}" cy="${y}" r="${r}" fill="#fff6e0" stroke="${INK}" stroke-width="3"/>
   <path d="M${x - r * 0.6} ${y + r * 0.3} A ${r * 0.7} ${r * 0.7} 0 0 1 ${x + r * 0.6} ${y + r * 0.3}" stroke="#3ccf5a" stroke-width="4" fill="none" stroke-dasharray="6 5"/>
   <path d="M${x} ${y + 2} L ${x + r * 0.5} ${y - r * 0.4}" stroke="#c9382c" stroke-width="4" stroke-linecap="round"/>
   <circle cx="${x}" cy="${y + 2}" r="4" fill="${INK}"/>`

const bodyInner = (() => {
  const well = (cx: number, r = 86) => `M${cx - r} 570 A ${r} ${r} 0 0 1 ${cx + r} 570 Z`
  const cabPath = 'M790 570 V 196 Q 790 168 818 168 H 1092 Q 1114 168 1124 190 L 1182 322 Q 1204 340 1204 366 V 570 Z'
  const winPath = 'M834 360 V 236 Q 834 214 856 214 H 1068 L 1140 360 Z'
  return `<defs>
       <linearGradient id="red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED_L}"/><stop offset=".25" stop-color="${RED}"/><stop offset="1" stop-color="${RED_D}"/></linearGradient>
       <linearGradient id="chr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${CHROME}"/><stop offset=".55" stop-color="${CHROME_D}"/><stop offset="1" stop-color="#e8edf2"/></linearGradient>
       <linearGradient id="shut" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef2f6"/><stop offset=".5" stop-color="#cfd6de"/><stop offset="1" stop-color="#aab4c0"/></linearGradient>
       <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f7ff"/><stop offset="1" stop-color="#8fc8ea"/></linearGradient>
       <clipPath id="winc"><path d="${winPath}"/></clipPath>
     </defs>
     <!-- chassis -->
     <rect x="30" y="566" width="1200" height="40" rx="10" fill="#2e2a30" stroke="${INK}" stroke-width="5"/>
     <rect x="30" y="566" width="1200" height="8" fill="#fff" opacity=".12"/>
     <!-- ladder rack posts -->
     ${[110, 330, 560, 730].map((x) => `<rect x="${x}" y="196" width="18" height="60" fill="${CHROME_D}" stroke="${INK}" stroke-width="4"/><rect x="${x - 8}" y="190" width="34" height="14" rx="4" fill="url(#chr)" stroke="${INK}" stroke-width="4"/>`).join('')}
     <!-- rear body -->
     <path d="M40 570 V 276 Q 40 250 66 250 H 790 V 570 Z" fill="url(#red)" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
     <path d="M54 262 H 780" stroke="#fff" stroke-width="9" opacity=".25" stroke-linecap="round"/>
     <rect x="40" y="248" width="750" height="16" rx="6" fill="url(#chr)" stroke="${INK}" stroke-width="5"/>
     ${rivets(70, 256, 18, 40)}
     <!-- reel bay -->
     <rect x="100" y="270" width="180" height="176" rx="14" fill="#7a1a14" stroke="${INK}" stroke-width="6"/>
     <rect x="100" y="270" width="180" height="176" rx="14" fill="none" stroke="url(#chr)" stroke-width="8" opacity=".9"/>
     <path d="M112 282 H 268" stroke="#000" stroke-width="10" opacity=".25"/>
     <!-- roller shutters -->
     ${[300, 470].map((x) => `<g>
       <rect x="${x}" y="280" width="150" height="140" rx="8" fill="url(#shut)" stroke="${INK}" stroke-width="5"/>
       ${Array.from({ length: 9 }, (_, i) => `<path d="M${x + 4} ${292 + i * 14} H ${x + 146}" stroke="#8b95a2" stroke-width="3.5"/>`).join('')}
       <rect x="${x + 40}" y="396" width="70" height="16" rx="8" fill="url(#chr)" stroke="${INK}" stroke-width="4"/>
       <path d="M${x + 14} 292 L ${x + 40} 288" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>
     </g>`).join('')}
     <rect x="326" y="296" width="42" height="22" rx="4" fill="#fff6e0" stroke="${INK}" stroke-width="3"/><text x="347" y="313" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="15" fill="${RED_D}">HOSE</text>
     <rect x="496" y="296" width="52" height="22" rx="4" fill="#fff6e0" stroke="${INK}" stroke-width="3"/><text x="522" y="313" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="15" fill="${RED_D}">TOOLS</text>
     <!-- lower body + the stripe -->
     <path d="M40 470 H 790 V 570 H 40 Z" fill="${RED_D}" stroke="${INK}" stroke-width="5"/>
     <path d="M40 470 H 790" stroke="#fff" stroke-width="5" opacity=".25"/>
     <rect x="40" y="436" width="750" height="34" fill="#fffaf0" stroke="${INK}" stroke-width="5"/>
     <path d="M40 442 H 790 M40 464 H 790" stroke="#f4c542" stroke-width="4"/>
     <text x="415" y="463" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="25" fill="${RED_D}" letter-spacing="7">FIRE DEPT  ·  No. 5</text>
     ${[160, 640].map((x) => `<rect x="${x}" y="498" width="70" height="36" rx="6" fill="#8a1a14" stroke="${INK}" stroke-width="4"/>${rivets(x + 10, 508, 3, 25)}${rivets(x + 10, 524, 3, 25)}`).join('')}
     <!-- wheel wells -->
     ${[330, 520].map((x) => `<path d="${well(x)}" fill="#241c22" stroke="${INK}" stroke-width="6"/><path d="M${x - 98} 570 A 98 98 0 0 1 ${x + 98} 570" fill="none" stroke="${RED_D}" stroke-width="12"/><path d="M${x - 98} 570 A 98 98 0 0 1 ${x + 98} 570" fill="none" stroke="${INK}" stroke-width="4"/>`).join('')}
     <!-- tail lights, step, rails -->
     <rect x="30" y="290" width="26" height="40" rx="6" fill="#ff5a4a" stroke="${INK}" stroke-width="4"/><rect x="30" y="340" width="26" height="30" rx="6" fill="#ffc21a" stroke="${INK}" stroke-width="4"/>
     <path d="M26 400 H 70 M26 410 H 70 M26 420 H 70" stroke="#ffd21a" stroke-width="5"/>
     <rect x="14" y="526" width="60" height="22" rx="4" fill="url(#chr)" stroke="${INK}" stroke-width="5"/>
     <path d="M30 520 V 380" stroke="url(#chr)" stroke-width="9" stroke-linecap="round"/><path d="M30 520 V 380" stroke="${INK}" stroke-width="2" opacity=".5"/>
     <!-- pump panel -->
     <rect x="640" y="276" width="140" height="262" rx="10" fill="#3a3e46" stroke="${INK}" stroke-width="6"/>
     <rect x="646" y="282" width="128" height="250" rx="8" fill="url(#chr)" stroke="${INK}" stroke-width="3" opacity=".95"/>
     ${gauge(682, 322, 20)}${gauge(738, 322, 20)}
     <circle cx="682" cy="392" r="22" fill="#e8322b" stroke="${INK}" stroke-width="4"/><path d="M664 392 H 700 M682 374 V 410" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
     <circle cx="738" cy="392" r="22" fill="#3a6fd8" stroke="${INK}" stroke-width="4"/><path d="M720 392 H 756 M738 374 V 410" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
     <rect x="662" y="436" width="96" height="26" rx="6" fill="#fff6e0" stroke="${INK}" stroke-width="3"/><text x="710" y="456" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="17" fill="${INK}">PUMP</text>
     <!-- the hose outlet -->
     <rect x="684" y="486" width="52" height="38" rx="6" fill="#d9a02a" stroke="${INK}" stroke-width="5"/>
     ${[694, 706, 718].map((x) => `<path d="M${x} 488 V 522" stroke="#9a6a10" stroke-width="4"/>`).join('')}
     <circle cx="710" cy="505" r="11" fill="#7a5410" stroke="${INK}" stroke-width="3"/>
     <!-- cab -->
     <path d="${cabPath}" fill="url(#red)" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
     <path d="M806 190 Q 806 180 820 180 H 1086" stroke="#fff" stroke-width="9" opacity=".28" stroke-linecap="round" fill="none"/>
     <path d="M790 440 H 1204" stroke="#fffaf0" stroke-width="26"/><path d="M790 432 H 1204 M790 448 H 1204" stroke="#f4c542" stroke-width="3.5"/>
     <!-- cab door -->
     <path d="M838 376 H 1092 Q 1104 376 1108 390 L 1126 556 H 838 Z" fill="none" stroke="${INK}" stroke-width="4" opacity=".55"/>
     <rect x="1050" y="398" width="46" height="14" rx="7" fill="url(#chr)" stroke="${INK}" stroke-width="3.5"/>
     <circle cx="960" cy="498" r="40" fill="#f4c542" stroke="${INK}" stroke-width="5"/><circle cx="960" cy="498" r="31" fill="none" stroke="#b8860b" stroke-width="3"/>
     <text x="960" y="516" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="48" fill="${RED_D}">5</text>
     <rect x="850" y="530" width="82" height="22" rx="4" fill="url(#chr)" stroke="${INK}" stroke-width="4"/>
     <!-- cab window (sky behind Milo and the dog) -->
     <path d="${winPath}" fill="url(#sky)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <g clip-path="url(#winc)"><path d="M840 360 L 880 214 H 930 L 890 360 Z" fill="#fff" opacity=".35"/></g>
     <path d="M834 360 V 236 Q 834 214 856 214 H 1068 L 1140 360" fill="none" stroke="url(#chr)" stroke-width="12" stroke-linejoin="round"/>
     <path d="M834 360 V 236 Q 834 214 856 214 H 1068 L 1140 360" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>
     <!-- windscreen + front -->
     <path d="M1100 176 L 1128 196 L 1178 318 Q 1196 334 1198 362 L 1160 362 L 1140 360 L 1076 214 Z" fill="url(#sky)" stroke="${INK}" stroke-width="5" stroke-linejoin="round" opacity=".92"/>
     <path d="M1112 200 L 1130 246" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
     <rect x="1160" y="384" width="44" height="146" rx="6" fill="url(#chr)" stroke="${INK}" stroke-width="5"/>
     ${Array.from({ length: 7 }, (_, i) => `<path d="M1164 ${398 + i * 20} H 1200" stroke="${CHROME_D}" stroke-width="5"/>`).join('')}
     <circle cx="1180" cy="364" r="22" fill="#fff6c8" stroke="${INK}" stroke-width="5"/><circle cx="1180" cy="364" r="12" fill="#ffe97a"/>
     <rect x="1168" y="540" width="64" height="40" rx="14" fill="url(#chr)" stroke="${INK}" stroke-width="6"/>
     <rect x="1148" y="556" width="88" height="22" rx="10" fill="url(#chr)" stroke="${INK}" stroke-width="5"/>
     <rect x="1196" y="506" width="34" height="22" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="1213" y="523" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="14" fill="${RED_D}">No.5</text>
     <path d="M1160 584 H 1236" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>
     <!-- mirror -->
     <path d="M1112 270 L 1146 252" stroke="${CHROME_D}" stroke-width="7" stroke-linecap="round"/>
     <rect x="1140" y="226" width="30" height="64" rx="10" fill="url(#chr)" stroke="${INK}" stroke-width="4"/>
     <!-- roof: light bar and siren -->
     <rect x="870" y="148" width="220" height="24" rx="8" fill="url(#chr)" stroke="${INK}" stroke-width="5"/>
     <path d="M884 148 V 128 Q 884 116 896 116 H 944 Q 956 116 956 128 V 148 Z" fill="#ff4a3a" stroke="${INK}" stroke-width="5"/>
     <path d="M1006 148 V 128 Q 1006 116 1018 116 H 1066 Q 1078 116 1078 128 V 148 Z" fill="#4a9aff" stroke="${INK}" stroke-width="5"/>
     <rect x="960" y="124" width="40" height="24" rx="6" fill="#fff6c8" stroke="${INK}" stroke-width="4"/>
     <path d="M894 126 Q 904 120 930 120" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7" fill="none"/><path d="M1016 126 Q 1026 120 1052 120" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7" fill="none"/>
     <path d="M820 168 V 140 H 846 L 862 128 V 160 L 846 148 H 834 V 168 Z" fill="url(#chr)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <!-- the bell on the bumper -->
     <path d="M1204 536 q -14 4 -14 22 h 28 q 0 -18 -14 -22 z" fill="#f4c542" stroke="${INK}" stroke-width="3"/>
     <!-- mud flaps -->
     <rect x="176" y="570" width="10" height="46" fill="#2e2a30" stroke="${INK}" stroke-width="3"/>`
})()
export const truckBody = svgDoc(TRUCK.w, TRUCK.h, bodyInner, { cut: 6 })

/** A truck wheel: centre pivot, 160×160. */
export const wheelInner = `<circle cx="80" cy="80" r="74" fill="#2a2630" stroke="${INK}" stroke-width="6"/>
   <circle cx="80" cy="80" r="64" fill="none" stroke="#3d3844" stroke-width="3" stroke-dasharray="6 5"/>
   <circle cx="80" cy="80" r="46" fill="#dfe5ec" stroke="${INK}" stroke-width="5"/>
   <circle cx="80" cy="80" r="36" fill="#b4bdc8" stroke="${INK}" stroke-width="3"/>
   ${Array.from({ length: 8 }, (_, i) => {
     const a = (i / 8) * Math.PI * 2
     return `<path d="M${(80 + Math.cos(a) * 14).toFixed(1)} ${(80 + Math.sin(a) * 14).toFixed(1)} L ${(80 + Math.cos(a) * 36).toFixed(1)} ${(80 + Math.sin(a) * 36).toFixed(1)}" stroke="${INK}" stroke-width="3" opacity=".6"/>`
   }).join('')}
   ${Array.from({ length: 6 }, (_, i) => {
     const a = (i / 6) * Math.PI * 2
     return `<circle cx="${(80 + Math.cos(a) * 24).toFixed(1)}" cy="${(80 + Math.sin(a) * 24).toFixed(1)}" r="4.5" fill="#6a7480" stroke="${INK}" stroke-width="1.5"/>`
   }).join('')}
   <circle cx="80" cy="80" r="11" fill="#f4c542" stroke="${INK}" stroke-width="3.5"/>
   <path d="M32 44 Q 46 26 70 20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".28"/>`
export const truckWheel = svgDoc(160, 160, wheelInner)

/** The extension ladder. Pivot at the left end (30,30). 740×60. */
export const ladderInner = `<rect x="6" y="6" width="728" height="12" rx="6" fill="#dfe5ec" stroke="${INK}" stroke-width="4"/>
   <rect x="6" y="42" width="728" height="12" rx="6" fill="#c3ccd6" stroke="${INK}" stroke-width="4"/>
   ${Array.from({ length: 19 }, (_, i) => `<rect x="${30 + i * 38}" y="14" width="9" height="32" fill="#eef1f5" stroke="${INK}" stroke-width="3"/>`).join('')}
   <path d="M14 10 H 720" stroke="#fff" stroke-width="3" opacity=".8"/>
   <rect x="716" y="2" width="22" height="56" rx="6" fill="#ffd21a" stroke="${INK}" stroke-width="4"/>
   <rect x="2" y="2" width="22" height="56" rx="6" fill="#ffd21a" stroke="${INK}" stroke-width="4"/>`
export const truckLadder = svgDoc(740, 60, ladderInner, { cut: 3 })

/** The hose reel: pivot at the centre. 190×190. */
export const reelInner = `<circle cx="95" cy="95" r="88" fill="#c9382c" stroke="${INK}" stroke-width="6"/>
   <circle cx="95" cy="95" r="76" fill="#8a1a14"/>
   ${[70, 58, 46, 34].map((r, i) => `<circle cx="95" cy="95" r="${r}" fill="none" stroke="${INK}" stroke-width="15"/><circle cx="95" cy="95" r="${r}" fill="none" stroke="${i % 2 ? '#f0bc3c' : '#ffd34d'}" stroke-width="11"/>`).join('')}
   <circle cx="95" cy="95" r="76" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="40 90" opacity=".35"/>
   ${Array.from({ length: 6 }, (_, i) => {
     const a = (i / 6) * Math.PI * 2
     return `<path d="M95 95 L ${(95 + Math.cos(a) * 84).toFixed(1)} ${(95 + Math.sin(a) * 84).toFixed(1)}" stroke="#7a1a14" stroke-width="7" stroke-linecap="round" opacity=".7"/>`
   }).join('')}
   <circle cx="95" cy="95" r="18" fill="${CHROME}" stroke="${INK}" stroke-width="5"/><circle cx="95" cy="95" r="7" fill="${INK}"/>
   <path d="M95 95 L 160 40" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M95 95 L 160 40" stroke="${CHROME}" stroke-width="7" stroke-linecap="round"/><circle cx="162" cy="38" r="9" fill="#f4c542" stroke="${INK}" stroke-width="3.5"/>`
export const truckReel = svgDoc(190, 190, reelInner)

/** Flashing light star (red/blue/yellow). */
export const lightFlash = (c1: string, c2: string) =>
  svgDoc(160, 160, `<path d="${starPath(80, 80, 76, 26, 8, 0.2)}" fill="${c1}" stroke="${c2}" stroke-width="5" stroke-linejoin="round" opacity=".95"/><circle cx="80" cy="80" r="26" fill="#fff" opacity=".95"/>`)

/** Cab-window glass: reflections + a door ledge masking whatever pokes out below. Covers truck-art x 820..1180, y 205..375. */
export const truckGlass = svgDoc(
  360,
  170,
  `<g transform="translate(-820 -205)">
   <defs><linearGradient id="red2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED}"/><stop offset="1" stop-color="${RED_D}"/></linearGradient>
     <linearGradient id="chr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${CHROME}"/><stop offset="1" stop-color="${CHROME_D}"/></linearGradient></defs>
   <path d="M860 244 L 900 218 H 936 L 888 360 H 850 Z" fill="#fff" opacity=".3"/>
   <path d="M960 232 L 984 218 H 1000 L 962 360 H 944 Z" fill="#fff" opacity=".2"/>
   <path d="M828 352 H 1146 L 1152 372 H 828 Z" fill="url(#red2)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M832 358 H 1142" stroke="url(#chr2)" stroke-width="7" stroke-linecap="round"/>
   <path d="M834 360 V 236 Q 834 214 856 214 H 1068 L 1140 360" fill="none" stroke="url(#chr2)" stroke-width="12" stroke-linejoin="round"/>
   <path d="M834 360 V 236 Q 834 214 856 214 H 1068 L 1140 360" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/></g>`,
)

/** Dalmatian head peeking from the window. Pivot bottom-centre. 160×170. */
export const dogHead = svgDoc(
  160,
  170,
  `<path d="M26 160 Q 20 120 30 84 Q 44 30 84 28 Q 128 30 138 88 Q 146 124 136 160 Z" fill="#fffdf6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M50 38 Q 80 26 112 38" stroke="#e8e4da" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
   <!-- muzzle -->
   <path d="M44 118 Q 44 88 84 88 Q 124 88 124 118 Q 126 150 84 152 Q 42 150 44 118 Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
   <ellipse cx="84" cy="100" rx="17" ry="12" fill="${INK}"/><ellipse cx="78" cy="96" rx="5" ry="3" fill="#fff" opacity=".6"/>
   <path d="M84 110 V 124 M64 124 Q 84 140 104 124" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
   <path d="M76 132 Q 84 160 94 132 Z" fill="#ff7a8a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
   <!-- eyes -->
   <circle cx="56" cy="72" r="12" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="112" cy="72" r="12" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
   <circle cx="58" cy="74" r="6.5" fill="#2a1a12"/><circle cx="110" cy="74" r="6.5" fill="#2a1a12"/><circle cx="55" cy="71" r="2.5" fill="#fff"/><circle cx="107" cy="71" r="2.5" fill="#fff"/>
   <path d="M42 58 Q 56 50 70 56 M98 56 Q 112 50 126 58" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
   <!-- spots -->
   <g fill="${INK}"><circle cx="98" cy="42" r="8"/><circle cx="116" cy="108" r="5"/><circle cx="40" cy="104" r="6"/><ellipse cx="72" cy="44" rx="6" ry="5"/><circle cx="132" cy="92" r="5"/></g>
   <!-- collar -->
   <path d="M26 158 Q 84 176 138 158 L 138 170 H 26 Z" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <circle cx="84" cy="168" r="7" fill="#f4c542" stroke="${INK}" stroke-width="3"/>`,
  { cut: 4 },
)

/** The Dalmatian's floppy ear. Pivot top. 60×100. */
export const dogEar = svgDoc(
  60,
  100,
  `<path d="M30 6 Q 6 18 8 60 Q 12 94 32 94 Q 54 88 52 52 Q 50 18 30 6 Z" fill="#2a2228" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M22 22 Q 14 40 18 62" stroke="#5a5058" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`,
  { cut: 3 },
)

/* ----------------------------------------------------------- nozzle ---- */

export const NOZ = { w: 440, h: 300, tip: [432, 150], back: [26, 228] }

export const nozzle = svgDoc(
  NOZ.w,
  NOZ.h,
  `<defs>
     <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".35" stop-color="#e8b43a"/><stop offset=".7" stop-color="#b9821a"/><stop offset="1" stop-color="#e0a82e"/></linearGradient>
     <linearGradient id="hosered" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f26a5a"/><stop offset=".5" stop-color="#d9382c"/><stop offset="1" stop-color="#a8221a"/></linearGradient>
   </defs>
   <!-- hose coming in -->
   <path d="M20 240 Q 40 232 70 200" stroke="${INK}" stroke-width="50" fill="none" stroke-linecap="round"/>
   <path d="M20 240 Q 40 232 70 200" stroke="url(#hosered)" stroke-width="38" fill="none" stroke-linecap="round"/>
   <path d="M20 240 Q 40 232 70 200" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-4 -9)"/>
   <!-- grip -->
   <path d="M180 190 L 250 190 L 262 288 Q 262 296 252 296 H 200 Q 188 296 188 284 Z" fill="#2b2b30" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M192 226 H 256 M192 250 H 258 M192 272 H 260" stroke="#e8322b" stroke-width="7" stroke-linecap="round"/>
   <path d="M200 196 Q 196 240 202 280" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".3"/>
   <path d="M168 196 Q 150 214 166 232 L 180 224 Q 170 214 182 204 Z" fill="#c9ced6" stroke="${INK}" stroke-width="4"/>
   <!-- bail handle -->
   <path d="M150 118 Q 160 56 230 58 Q 300 60 304 124" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round"/>
   <path d="M150 118 Q 160 56 230 58 Q 300 60 304 124" stroke="#ffd21a" stroke-width="12" fill="none" stroke-linecap="round"/>
   <path d="M166 100 Q 176 70 214 66" stroke="#fff6a0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <!-- coupling -->
   <rect x="54" y="160" width="76" height="82" rx="12" fill="url(#brass)" stroke="${INK}" stroke-width="6"/>
   ${[74, 92, 110].map((x) => `<path d="M${x} 162 V 240" stroke="#8a5e10" stroke-width="4"/>`).join('')}
   <rect x="124" y="168" width="24" height="66" rx="6" fill="#c3ccd6" stroke="${INK}" stroke-width="5"/>
   <!-- barrel -->
   <path d="M142 126 H 300 L 352 134 V 170 L 300 178 H 142 Q 130 152 142 126 Z" fill="url(#brass)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M156 138 H 300 L 336 142" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6" fill="none"/>
   <path d="M150 168 H 300" stroke="#7a5410" stroke-width="5" opacity=".5"/>
   <!-- nozzle tip -->
   <path d="M346 128 L 410 118 Q 432 120 434 150 Q 432 180 410 182 L 346 172 Z" fill="#c3ccd6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M352 134 L 402 126" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
   ${[0, 1, 2].map((i) => `<path d="M${368 + i * 14} 126 V 176" stroke="${CHROME_D}" stroke-width="4"/>`).join('')}
   <ellipse cx="426" cy="150" rx="9" ry="22" fill="#4a5360" stroke="${INK}" stroke-width="4"/>
   <ellipse cx="426" cy="150" rx="4" ry="12" fill="#9fd4ff"/>
   <circle cx="232" cy="152" r="18" fill="#c9382c" stroke="${INK}" stroke-width="4"/><text x="232" y="160" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="22" fill="#fff6e0">5</text>`,
  { cut: 5 },
)

/* ----------------------------------------------------- front props ----- */

export const hydrant = svgDoc(
  180,
  270,
  `<defs><linearGradient id="hy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f26a5a"/><stop offset=".45" stop-color="#e23a2d"/><stop offset="1" stop-color="#a8221a"/></linearGradient></defs>
   <rect x="22" y="236" width="136" height="28" rx="8" fill="#b8261c" stroke="${INK}" stroke-width="5"/>
   <path d="M46 238 L 54 130 H 126 L 134 238 Z" fill="url(#hy)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="38" y="214" width="104" height="26" rx="6" fill="url(#hy)" stroke="${INK}" stroke-width="5"/>
   <rect x="38" y="116" width="104" height="22" rx="6" fill="#ffd21a" stroke="${INK}" stroke-width="5"/>
   <path d="M46 62 Q 44 24 90 20 Q 136 24 134 62 L 134 124 H 46 Z" fill="url(#hy)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M58 40 Q 66 28 84 26" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
   <rect x="76" y="2" width="28" height="22" rx="6" fill="#ffd21a" stroke="${INK}" stroke-width="5"/>
   <circle cx="90" cy="13" r="5" fill="${INK}" opacity=".5"/>
   <!-- side outlets -->
   <rect x="6" y="76" width="42" height="40" rx="8" fill="#ffd21a" stroke="${INK}" stroke-width="5"/><circle cx="22" cy="96" r="8" fill="#b8861a" stroke="${INK}" stroke-width="3"/>
   <rect x="132" y="76" width="42" height="40" rx="8" fill="#ffd21a" stroke="${INK}" stroke-width="5"/><circle cx="158" cy="96" r="8" fill="#b8861a" stroke="${INK}" stroke-width="3"/>
   <path d="M22 106 Q 14 150 40 150" stroke="${CHROME_D}" stroke-width="4" fill="none" stroke-dasharray="6 4"/>
   <rect x="64" y="150" width="52" height="30" rx="5" fill="#fff6e0" stroke="${INK}" stroke-width="3"/><text x="90" y="172" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="22" fill="#b8261c">5</text>
   ${[[58, 226], [90, 226], [122, 226]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#7a1a14"/>`).join('')}`,
  { cut: 5 },
)

export const cone = svgDoc(
  150,
  210,
  `<path d="M16 192 H 134 V 206 H 16 Z" fill="#d95a1a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M60 14 Q 75 4 90 14 L 128 192 H 22 Z" fill="#ff7a2a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M44 84 L 106 84 L 114 122 L 36 122 Z" fill="#fffaf0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M32 150 L 118 150 L 122 178 L 28 178 Z" fill="#fffaf0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M64 24 L 40 160" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".4"/>
   <path d="M86 20 L 112 150" stroke="#b8400a" stroke-width="6" stroke-linecap="round" opacity=".3"/>`,
  { cut: 5 },
)

export const lamp = svgDoc(
  130,
  640,
  `<path d="M65 640 V 120" stroke="${INK}" stroke-width="26"/><path d="M65 640 V 120" stroke="#3f6a5a" stroke-width="16"/>
   <path d="M60 130 V 600" stroke="#7fb8a0" stroke-width="4" opacity=".7"/>
   <path d="M38 640 L 48 560 H 82 L 92 640 Z" fill="#3f6a5a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="46" y="300" width="38" height="14" rx="5" fill="#3f6a5a" stroke="${INK}" stroke-width="4"/>
   <!-- the lantern -->
   <path d="M28 124 L 40 40 H 90 L 102 124 Z" fill="#fff2b0" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M50 56 L 44 112" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>
   <path d="M65 40 V 124 M34 82 H 96" stroke="${INK}" stroke-width="3" opacity=".5"/>
   <path d="M22 40 L 65 6 L 108 40 Z" fill="#3f6a5a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <circle cx="65" cy="4" r="6" fill="#f4c542" stroke="${INK}" stroke-width="3"/>
   <rect x="26" y="122" width="78" height="14" rx="5" fill="#3f6a5a" stroke="${INK}" stroke-width="5"/>`,
  { cut: 4 },
)

/** Bubbly drip/droplet sticker for the hydrant tap. */
export const dropBadge = svgDoc(
  100,
  130,
  `<path d="M50 8 Q 90 60 84 86 Q 80 122 50 122 Q 20 122 16 86 Q 10 60 50 8 Z" fill="#6ec4ff" stroke="#2a78b8" stroke-width="6" stroke-linejoin="round"/>
   <path d="M34 78 Q 34 62 44 52" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/>`,
)

/** A complete, parked truck for the world (wheels, ladder, reel and driver baked in). */
export const worldTruck = svgDoc(
  TRUCK.w,
  TRUCK.h,
  `${bodyInner}
   <g transform="translate(190 351) translate(-95 -95)">${reelInner}</g>
   <g transform="translate(50 190)">${ladderInner}</g>
   ${[330, 520, 1010].map((x) => `<g transform="translate(${x - 80} ${570 - 80 + 4})">${wheelInner}</g>`).join('')}`,
  { cut: 6 },
)

