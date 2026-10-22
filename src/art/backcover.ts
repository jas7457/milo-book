import { svgDoc } from './texture'
import { starPath } from './kit'
import { INK } from './style'
import * as outfit from '../milo/art'
import { bodyParts, armParts, headParts, eyesParts } from '../milo/art'
import { superMilo, heroCape } from './hero'

/*
 * Art for the final screen: the back cover of the book, and the paper-cutout
 * "Easter egg" Milos / toys hidden around the living room behind it.
 * (Only story/pages/backcover.tsx uses this file.)
 */

/** width / height of an svgDoc string, so any art can be sized without knowing it. */
export function dims(svg: string): [number, number] {
  const m = /<svg[^>]*?\swidth="([\d.]+)"\s+height="([\d.]+)"/.exec(svg)
  return m ? [Number(m[1]), Number(m[2])] : [1, 1]
}

/** the drawing inside an svgDoc (without its paper filter), to re-use as a group */
const inner = (svg: string) => {
  const m = /<g filter="url\(#cut\)">([\s\S]*)<\/g>\s*<\/svg>\s*$/.exec(svg)
  return m ? m[1] : ''
}

/* ============================================================ BACK COVER == */

const GOLD = '#ffd34d'
const CREAM = '#fff3d6'

/** an icon is drawn around (0,0) inside a ±46 box */
const icons: string[] = [
  // 1 reading — an open book
  `<path d="M-42 -26 Q -20 -36 0 -22 Q 20 -36 42 -26 L 42 28 Q 20 18 0 32 Q -20 18 -42 28 Z" fill="#fffaf0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M0 -22 L 0 32" stroke="${INK}" stroke-width="4"/>
   <path d="M-32 -14 Q -18 -20 -8 -12 M-32 -2 Q -18 -8 -8 0 M-32 10 Q -18 4 -8 12 M32 -14 Q 18 -20 8 -12 M32 -2 Q 18 -8 8 0" stroke="#e8572b" stroke-width="4" fill="none" stroke-linecap="round"/>
   <path d="${starPath(26, 14, 9)}" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/>`,
  // 2 tools — a wrench
  `<g transform="rotate(-40)">
     <rect x="-9" y="-12" width="18" height="62" rx="9" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
     <path d="M-24 -14 L -24 -44 Q 0 -54 24 -44 L 24 -14 L 10 -14 L 10 -30 L -10 -30 L -10 -14 Z" fill="#c9ced6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <circle cx="0" cy="38" r="3.5" fill="${INK}"/>
   </g>
   <circle cx="-28" cy="30" r="7" fill="#e8322b" stroke="${INK}" stroke-width="3"/>`,
  // 3 digging — a little excavator
  `<rect x="-38" y="20" width="64" height="18" rx="9" fill="#3a3a3a" stroke="${INK}" stroke-width="4"/>
   <circle cx="-26" cy="29" r="4" fill="#999"/><circle cx="-6" cy="29" r="4" fill="#999"/><circle cx="14" cy="29" r="4" fill="#999"/>
   <rect x="-34" y="0" width="56" height="22" rx="5" fill="#f5b700" stroke="${INK}" stroke-width="4"/>
   <path d="M-28 0 L -28 -20 L -8 -20 L -4 0 Z" fill="#f5b700" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M-24 -4 L -24 -16 L -11 -16 L -9 -4 Z" fill="#bfe6ff"/>
   <path d="M18 8 L 38 -24 L 46 -18 L 28 14 Z" fill="#d99a00" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M38 -24 L 50 -4 L 36 4 L 30 -10 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  // 4 building — a bridge
  `<rect x="-44" y="-6" width="88" height="12" rx="3" fill="#c9524a" stroke="${INK}" stroke-width="4"/>
   <path d="M-40 -6 Q 0 -52 40 -6" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
   <path d="M-40 -6 Q 0 -52 40 -6" fill="none" stroke="#e9a23b" stroke-width="6" stroke-linecap="round"/>
   <path d="M-20 -26 L -20 -6 M0 -32 L 0 -6 M20 -26 L 20 -6" stroke="${INK}" stroke-width="4"/>
   <rect x="-44" y="6" width="14" height="30" fill="#9a9a9a" stroke="${INK}" stroke-width="4"/><rect x="30" y="6" width="14" height="30" fill="#9a9a9a" stroke="${INK}" stroke-width="4"/>
   <path d="M-30 30 q 8 -8 16 0 t 16 0 t 16 0 t 14 0" stroke="#3f86d6" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  // 5 fire — a fire helmet
  `<path d="M-46 22 Q 0 8 46 22 L 44 36 Q 0 24 -44 36 Z" fill="#9e1a14" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M-34 24 Q -38 -34 0 -40 Q 38 -34 34 24 Z" fill="#dd2a1f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M-6 -39 L 6 -39 L 8 24 L -8 24 Z" fill="#b51e16"/>
   <path d="M-22 -4 Q -18 -26 -4 -32" stroke="#ff9a8a" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M-14 -16 L 14 -16 L 16 6 Q 0 18 -16 6 Z" fill="#f2c230" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
   <path d="M0 -10 Q 8 -2 4 6 Q 0 10 -4 6 Q -4 0 0 -10 Z" fill="#dd2a1f"/>`,
  // 6 hero — cape and emblem
  `<path d="M-20 -40 Q 0 -32 20 -40 Q 34 0 46 40 Q 22 32 0 44 Q -22 32 -46 40 Q -34 0 -20 -40 Z" fill="#d8261c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M-12 -34 Q 0 -28 12 -34 Q 22 -8 28 12 Q 0 22 -28 12 Q -22 -8 -12 -34 Z" fill="#a8160f" opacity=".5"/>
   <path d="M0 -14 L 17 -2 L 0 20 L -17 -2 Z" fill="#ffd21f" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
  // 7 home — moon and star
  `<path d="M14 -42 Q -34 -34 -34 6 Q -34 40 8 44 Q -18 24 -8 -6 Q -4 -28 14 -42 Z" fill="#fff0a8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="${starPath(24, 6, 18, 8)}" fill="${GOLD}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
   <path d="${starPath(30, -30, 8, 3.5)}" fill="#fff" stroke="${INK}" stroke-width="2"/>`,
]
const badgeFills = ['#9fd6f0', '#cfd8e0', '#f1d19a', '#b7e0a8', '#ffc9b8', '#ffb3a8', '#c8c0f0']

/** playful barcode: bars that spell a smile */
function barcode() {
  const bars = [4, 2, 6, 2, 3, 6, 2, 4, 2, 6, 3, 2, 5, 2, 4, 6, 2, 3, 2, 5]
  let x = 0
  let s = ''
  bars.forEach((b, i) => {
    if (i % 2 === 0) s += `<rect x="${x}" y="0" width="${b}" height="${i % 5 === 0 ? 78 : 66}" fill="${INK}"/>`
    x += b + 1
  })
  return { svg: s, w: x }
}

export const backCoverArt = (() => {
  const R = 300
  const cx = 450
  const cy = 700
  const ring = icons
    .map((ic, k) => {
      const a = -Math.PI / 2 + (k / 7) * Math.PI * 2
      const x = cx + Math.cos(a) * R
      const y = cy + Math.sin(a) * R
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(k % 2 ? 6 : -6)})">
        <circle r="70" fill="${INK}" opacity=".25" transform="translate(5 7)"/>
        <circle r="70" fill="${CREAM}" stroke="${INK}" stroke-width="6"/>
        <circle r="58" fill="${badgeFills[k]}" stroke="#fff" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>
        <g transform="scale(1.02)">${ic}</g>
      </g>`
    })
    .join('')
  const dots = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2
    return `<circle cx="${(cx + Math.cos(a) * R).toFixed(1)}" cy="${(cy + Math.sin(a) * R).toFixed(1)}" r="5" fill="${GOLD}" opacity=".85"/>`
  }).join('')
  // the burst-edge medal
  const burst = (() => {
    const n = 28
    let d = ''
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2
      const r = i % 2 ? 190 : 214
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `
    }
    return d + 'Z'
  })()
  const bc = barcode()
  const stars = [
    [120, 120, 26, 0.3],
    [790, 130, 20, 0.5],
    [92, 470, 30, 0.1],
    [812, 480, 24, 0.2],
    [110, 980, 20, 0.4],
    [800, 960, 30, 0.3],
    [310, 70, 14, 0],
    [610, 62, 16, 0.2],
  ]
    .map(([x, y, r, rot]) => `<path d="${starPath(x, y, r, r * 0.46, 5, -Math.PI / 2 + rot)}" fill="${GOLD}" stroke="#e29a00" stroke-width="3" stroke-linejoin="round"/>`)
    .join('')
  const tiny = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 337) % 860 + 20
    const y = (i * 521) % 1180 + 30
    return `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#ffe9a8" opacity=".5"/>`
  }).join('')
  return svgDoc(
    900,
    1238,
    `<radialGradient id="bc" cx="50%" cy="52%" r="72%"><stop offset="0" stop-color="#e2453a"/><stop offset="1" stop-color="#8e1e18"/></radialGradient>
     <radialGradient id="bcm" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#30386f"/><stop offset="1" stop-color="#171c44"/></radialGradient>
     <clipPath id="bcc"><circle cx="${cx}" cy="${cy}" r="170"/></clipPath>
     <rect width="900" height="1238" fill="url(#bc)"/>
     <!-- cloth weave -->
     <g stroke="#7a1812" stroke-width="2" opacity=".16">${Array.from({ length: 62 }, (_, i) => `<path d="M0 ${i * 20} L 900 ${i * 20}"/>`).join('')}</g>
     <g stroke="#ff8a7a" stroke-width="2" opacity=".07">${Array.from({ length: 46 }, (_, i) => `<path d="M${i * 20} 0 L ${i * 20} 1238"/>`).join('')}</g>
     ${tiny}
     <!-- stitched border -->
     <rect x="34" y="34" width="832" height="1170" rx="30" fill="none" stroke="#7a1812" stroke-width="10" opacity=".5"/>
     <rect x="34" y="34" width="832" height="1170" rx="30" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="22 14" stroke-linecap="round"/>
     ${stars}
     <!-- soft glow behind the medal -->
     <circle cx="${cx}" cy="${cy}" r="400" fill="#ffcb2f" opacity=".1"/>
     <circle cx="${cx}" cy="${cy}" r="340" fill="#ffcb2f" opacity=".12"/>
     ${dots}
     <!-- medal -->
     <path d="${burst}" fill="#000" opacity=".28" transform="translate(6 9)"/>
     <path d="${burst}" fill="${GOLD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <circle cx="${cx}" cy="${cy}" r="180" fill="#fff0a8" stroke="${INK}" stroke-width="5"/>
     <circle cx="${cx}" cy="${cy}" r="170" fill="url(#bcm)"/>
     <g clip-path="url(#bcc)">
       <path d="${starPath(cx - 110, cy - 90, 14, 6)}" fill="#fff4c4"/><path d="${starPath(cx + 118, cy - 70, 10, 4.4)}" fill="#fff4c4"/>
       <path d="${starPath(cx + 96, cy + 70, 8, 3.5)}" fill="#fff4c4"/><path d="${starPath(cx - 118, cy + 52, 9, 4)}" fill="#fff4c4"/>
       <path d="M${cx + 88} ${cy - 130} a 34 34 0 1 0 22 52 a 28 28 0 1 1 -22 -52 Z" fill="#fff4c4"/>
       <!-- Milo, in his pyjamas -->
       <g transform="translate(${cx - 120} ${cy + 36}) scale(0.6)">${inner(outfit.pajamas())}</g>
       <g transform="translate(${cx - 116} ${cy - 134}) scale(0.58)">${headParts}<g transform="translate(70 165)">${eyesParts}</g></g>
     </g>
     <circle cx="${cx}" cy="${cy}" r="170" fill="none" stroke="${INK}" stroke-width="6"/>
     ${ring}
     <!-- sticker -->
     <g transform="translate(150 1120) rotate(-12)">
       <path d="${starPath(0, 0, 66, 46, 14, 0)}" fill="#ffd34d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="${starPath(0, 0, 40, 18, 5)}" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     </g>
     <!-- barcode label -->
     <g transform="translate(676 1078) rotate(2)">
       <rect x="0" y="0" width="170" height="118" rx="10" fill="#000" opacity=".25" transform="translate(4 6)"/>
       <rect x="0" y="0" width="170" height="118" rx="10" fill="${CREAM}" stroke="${INK}" stroke-width="5"/>
       <g transform="translate(${(170 - bc.w) / 2} 12)">${bc.svg}</g>
       <path d="M44 100 Q 85 116 126 100" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
       <circle cx="58" cy="94" r="4" fill="${INK}"/><circle cx="112" cy="94" r="4" fill="${INK}"/>
     </g>`,
  )
})()

/* ============================================================= EASTER EGGS == */

type Look = 'tools' | 'builder' | 'fire' | 'pjs'

/** A standing paper Milo in one of his costumes (canvas 560×1100, feet at the bottom). */
export function miloStanding(look: Look, wave: 'none' | 'right' | 'left' | 'both' = 'none') {
  const arm = (side: 'l' | 'r', raised: boolean) =>
    side === 'l'
      ? `<g transform="translate(118 95) rotate(${raised ? -150 : 8}) translate(-60 -30)">${armParts}</g>`
      : `<g transform="translate(282 95) scale(-1 1) rotate(${raised ? 150 : 8}) translate(-60 -30)">${armParts}</g>`
  const top = {
    tools: '',
    builder: inner(outfit.safetyVest()),
    fire: inner(outfit.fireCoat()),
    pjs: inner(outfit.pajamas()),
  }[look]
  const belt = look === 'tools' || look === 'builder' ? `<g transform="translate(0 210)">${inner(outfit.toolBelt())}</g>` : ''
  const hat =
    look === 'builder'
      ? `<g transform="translate(-40 -465) scale(1.2)">${inner(outfit.hardHat())}</g>`
      : look === 'fire'
        ? `<g transform="translate(-52 -474) scale(1.2)">${inner(outfit.fireHelmet())}</g>`
        : ''
  const goggles =
    look === 'tools'
      ? `<g transform="translate(-4 -325)"><rect x="60" y="0" width="290" height="22" rx="11" fill="#5a3a22"/>
          <circle cx="150" cy="8" r="42" fill="#bfe6ff" fill-opacity=".55" stroke="#8a939c" stroke-width="12"/><circle cx="262" cy="8" r="42" fill="#bfe6ff" fill-opacity=".55" stroke="#8a939c" stroke-width="12"/>
          <path d="M132 -6 Q 142 -16 156 -16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/><path d="M244 -6 Q 254 -16 268 -16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/></g>`
      : ''
  return svgDoc(
    560,
    1100,
    `<g transform="translate(80 500)">
       ${arm('l', wave === 'left' || wave === 'both')}${arm('r', wave === 'right' || wave === 'both')}
       <g>${bodyParts}</g>${top}${belt}
       <g transform="translate(-40 -405) scale(1.2)">${headParts}<g transform="translate(70 165)">${eyesParts}</g></g>
       ${goggles}${hat}
     </g>`,
    { cut: 7 },
  )
}

/** Super Milo flying, cape streaming (900×640). */
export const flyingMilo = svgDoc(
  900,
  640,
  `<g transform="translate(16 196)">${inner(heroCape)}</g>
   <g transform="translate(100 100)">${inner(superMilo)}</g>`,
  { cut: 6 },
)
/** where the string ties on, as a fraction of the art (x from left, y from top) */
export const flyingKnot = { x: 0.555, y: 0.4 }

export const hangString = svgDoc(
  16,
  400,
  `<rect x="6" y="0" width="4" height="400" fill="#c9a36b"/><path d="M6 20 L10 30 M6 60 L10 70 M6 100 L10 110 M6 140 L10 150 M6 180 L10 190 M6 220 L10 230 M6 260 L10 270 M6 300 L10 310 M6 340 L10 350" stroke="#8a6a3a" stroke-width="1.5"/>`,
  { grain: 0 },
)

/** Robo, awake and happy, standing in Milo's living room (his own little copy). */
export const roboToy = svgDoc(
  300,
  470,
  `<path d="M150 56 L 150 28" stroke="${INK}" stroke-width="9"/><path d="M150 56 L 150 28" stroke="#9aa3ad" stroke-width="4"/>
   <circle cx="150" cy="20" r="14" fill="#ff7a6a" stroke="${INK}" stroke-width="5"/><circle cx="145" cy="15" r="4" fill="#fff"/>
   <circle cx="62" cy="116" r="13" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/><circle cx="238" cy="116" r="13" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <rect x="68" y="56" width="164" height="118" rx="22" fill="#7fb8c4" stroke="${INK}" stroke-width="6"/>
   <rect x="80" y="64" width="140" height="16" rx="8" fill="#a6d4dc"/>
   <circle cx="112" cy="108" r="26" fill="#d8fbff" stroke="${INK}" stroke-width="5"/><circle cx="188" cy="108" r="26" fill="#d8fbff" stroke="${INK}" stroke-width="5"/>
   <circle cx="116" cy="111" r="11" fill="#1d4f66"/><circle cx="192" cy="111" r="11" fill="#1d4f66"/><circle cx="109" cy="103" r="5" fill="#fff"/><circle cx="185" cy="103" r="5" fill="#fff"/>
   <path d="M116 146 Q 150 170 184 146 Z" fill="#2c3e48" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <rect x="132" y="172" width="36" height="20" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <rect x="64" y="188" width="172" height="150" rx="20" fill="#6aa6b4" stroke="${INK}" stroke-width="6"/>
   <rect x="92" y="206" width="116" height="104" rx="12" fill="#dde8ea" stroke="${INK}" stroke-width="5"/>
   ${[0, 1, 2, 3].map((i) => `<rect x="${102 + i * 24}" y="222" width="20" height="18" rx="3" fill="${['#e8322b', '#f4b400', '#9ed84a', '#3ccf5a'][i]}" stroke="${INK}" stroke-width="3"/>`).join('')}
   <path d="M150 256 l 6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" fill="${GOLD}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
   <circle cx="116" cy="292" r="9" fill="#f4b400" stroke="${INK}" stroke-width="3"/><circle cx="184" cy="292" r="9" fill="#e8572b" stroke="${INK}" stroke-width="3"/>
   <!-- arms -->
   <rect x="22" y="196" width="30" height="104" rx="15" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/>
   <path d="M37 300 Q 14 306 16 332 L 28 332 Q 28 318 37 316 Q 46 318 46 332 L 58 332 Q 60 306 37 300 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <rect x="248" y="196" width="30" height="104" rx="15" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/>
   <path d="M263 300 Q 240 306 242 332 L 254 332 Q 254 318 263 316 Q 272 318 272 332 L 284 332 Q 286 306 263 300 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <!-- legs -->
   <rect x="64" y="336" width="172" height="20" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   ${[84, 164].map((x) => `<rect x="${x}" y="354" width="52" height="64" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/><path d="M${x} 378 L ${x + 52} 378 M${x} 400 L ${x + 52} 400" stroke="#4f8592" stroke-width="4"/>
     <path d="M${x - 16} 462 L ${x - 16} 446 Q ${x - 16} 424 ${x + 6} 424 L ${x + 48} 424 Q ${x + 70} 424 ${x + 70} 446 L ${x + 70} 462 Z" fill="#4f8592" stroke="${INK}" stroke-width="5"/>`).join('')}`,
  { cut: 5 },
)

/** Robo's dump truck as a toy (blue cab, orange tipping bed). */
export const toyTruck = svgDoc(
  480,
  260,
  `<path d="M170 100 L 460 100 L 450 190 L 160 190 Z" fill="#e8572b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M160 160 L 452 160 L 450 190 L 160 190 Z" fill="#c4421a"/>
   <path d="M184 112 L 440 112" stroke="#ff9a6a" stroke-width="7" stroke-linecap="round"/>
   ${[0, 1, 2, 3, 4].map((i) => `<path d="M${210 + i * 52} 126 L ${214 + i * 52} 176" stroke="#b8391a" stroke-width="8" stroke-linecap="round"/>`).join('')}
   <path d="M30 196 L 30 128 Q 32 98 56 90 L 96 80 Q 110 76 128 76 L 160 76 L 160 196 Z" fill="#3d7ad6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M52 170 L 56 112 Q 62 100 80 96 L 134 90 L 134 170 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="84" y="112" width="40" height="40" rx="9" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/><circle cx="96" cy="128" r="6" fill="#d8fbff"/><circle cx="114" cy="128" r="6" fill="#d8fbff"/>
   <rect x="20" y="176" width="44" height="20" rx="6" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <circle cx="42" cy="162" r="9" fill="#fff6b0" stroke="${INK}" stroke-width="3.5"/>
   <rect x="22" y="190" width="440" height="30" rx="10" fill="#4d5058" stroke="${INK}" stroke-width="5"/>
   ${[92, 330, 410].map((x) => `<circle cx="${x}" cy="222" r="34" fill="#2f3036" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="222" r="17" fill="#cfd3d8" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="222" r="6" fill="#3d7ad6"/>`).join('')}`,
  { cut: 5 },
)
