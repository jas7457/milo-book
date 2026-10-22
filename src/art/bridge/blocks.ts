import { svgDoc } from '../texture'
import { starPath } from '../kit'
import { INK, rand, woodGrain } from '../style'
import { FONT, cone, cube, hardHatSmall } from './frags'

/* The bridge's own pieces: abutments (the two banks), the three blocks, the ghosts of the empty slots. */

/** frame art: 1000 px = 1 book unit. x = (bookX + 0.25) * 1000, ground at y = 800 */
export const FRAME = { w: 1800, h: 800, x0: -0.25, deck: 560, gapL: 450, gapR: 1350 }
/** slot centres in book x */
export const SLOT_X = [0.35, 0.65, 0.95]
/** the block art is 306×300 px at 1000 px/unit */
export const SEG = { w: 306, h: 300 }

type Variant = { body: string; dark: string; light: string; trim: string; mark: string }
export const VARIANTS: Variant[] = [
  { body: '#e8322b', dark: '#b8221c', light: '#f26a5e', trim: '#ffd0c8', mark: '#fff' },
  { body: '#f4b400', dark: '#c98a00', light: '#ffd75a', trim: '#fff0b8', mark: '#fff' },
  // green, not blue: blue vanished against the river
  { body: '#22a84a', dark: '#16793a', light: '#5fd47e', trim: '#d2f5da', mark: '#fff' },
]

const bridgeRails = (w: number, postsAt: number[]) => `
  ${postsAt.map((x) => `<rect x="${x - 10}" y="6" width="20" height="76" rx="4" fill="#eebb78" stroke="${INK}" stroke-width="4.5"/><circle cx="${x}" cy="12" r="11" fill="#f7d29a" stroke="${INK}" stroke-width="4"/>`).join('')}
  <rect x="2" y="16" width="${w - 4}" height="22" rx="8" fill="#f7cf8e" stroke="${INK}" stroke-width="5"/>
  <rect x="8" y="20" width="${w - 16}" height="6" rx="3" fill="#fff" opacity=".45"/>
  <rect x="2" y="50" width="${w - 4}" height="12" rx="5" fill="#e9b070" stroke="${INK}" stroke-width="4"/>`

/** one bridge block: rails + wooden deck + a coloured arch block */
export const segmentArt = (v: number) => {
  const c = VARIANTS[v]
  const { w, h } = SEG
  const body = `M0 124 L ${w} 124 L ${w} ${h} L 0 ${h} Z M62 ${h} L 62 224 A 91 91 0 0 1 244 224 L 244 ${h} Z`
  return svgDoc(
    w,
    h,
    `${bridgeRails(w, [14, w / 2, w - 14])}
     <!-- deck -->
     <rect x="0" y="80" width="${w}" height="46" rx="6" fill="#d9a566" stroke="${INK}" stroke-width="5"/>
     ${woodGrain(6, 86, w - 12, 34, '#a8743f', 4 + v, 3)}
     ${[50, 102, 153, 204, 255].map((x) => `<path d="M${x} 84 L ${x} 122" stroke="#8f5e30" stroke-width="3.5"/>`).join('')}
     ${[22, 76, 128, 180, 230, 284].map((x) => `<circle cx="${x}" cy="92" r="3.5" fill="#6a4326"/>`).join('')}
     <!-- the block -->
     <clipPath id="sg${v}"><path fill-rule="evenodd" clip-rule="evenodd" d="${body}"/></clipPath>
     <path fill-rule="evenodd" d="${body}" fill="${c.body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <g clip-path="url(#sg${v})">
       <rect x="${w - 54}" y="124" width="54" height="${h}" fill="${c.dark}" opacity=".6"/>
       <rect x="0" y="124" width="${w}" height="26" fill="${c.light}" opacity=".7"/>
       <path d="M0 176 L ${w} 176" stroke="${c.dark}" stroke-width="3.5" opacity=".6"/>
       <path d="M76 124 L 76 176 M152 150 L 152 176 M228 124 L 228 176" stroke="${c.dark}" stroke-width="3.5" opacity=".5"/>
     </g>
     <path d="M62 ${h} L 62 224 A 91 91 0 0 1 244 224 L 244 ${h}" fill="none" stroke="${c.trim}" stroke-width="14" stroke-linejoin="round"/>
     <path d="M62 ${h} L 62 224 A 91 91 0 0 1 244 224 L 244 ${h}" fill="none" stroke="${INK}" stroke-width="4"/>
     <path d="M136 134 L 170 134 L 176 156 L 130 156 Z" fill="${c.trim}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <path d="${starPath(30, 168, 15, 7)}" fill="${c.mark}" opacity=".9"/><path d="${starPath(w - 30, 168, 15, 7)}" fill="${c.mark}" opacity=".9"/>`,
    { cut: 4 },
  )
}

/** the dashed ghost where a block will go: a dashed outline, a faint arch in the block's own colour and a bouncing arrow */
export const ghostArt = (v: number) => {
  const { w, h } = SEG
  const c = VARIANTS[v]
  return svgDoc(
    w,
    h,
    `<rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="18" fill="#ffffff" opacity=".28"/>
     <path d="M62 ${h - 14} L 62 224 A 91 91 0 0 1 244 224 L 244 ${h - 14} Z" fill="${c.body}" opacity=".55"/>
     <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="18" fill="none" stroke="${c.body}" stroke-width="12" stroke-dasharray="26 18" stroke-linecap="round"/>
     <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="18" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="26 18" stroke-linecap="round" opacity=".95"/>
     <path d="M${w / 2 - 34} 130 L ${w / 2} 176 L ${w / 2 + 34} 130" fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M${w / 2 - 34} 130 L ${w / 2} 176 L ${w / 2 + 34} 130" fill="none" stroke="${c.dark}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    { grain: 0 },
  )
}

const brickWall = (x0: number, y0: number, w: number, h: number, seed: number) => {
  const r = rand(seed)
  let out = ''
  const rows = Math.ceil(h / 40)
  for (let row = 0; row < rows; row++) {
    for (let c = -1; c < Math.ceil(w / 92) + 1; c++) {
      const x = x0 + c * 92 + (row % 2) * 46
      const tone = r()
      out += `<rect x="${x}" y="${y0 + row * 40}" width="90" height="38" rx="4" fill="${tone < 0.4 ? '#d8cfbd' : tone < 0.75 ? '#cdc2ad' : '#e0d8c6'}" stroke="#a89a82" stroke-width="3"/>`
    }
  }
  return out
}

/** the two banks of the river, as stone abutments with a plank ramp and a gap between */
export const frameArt = (() => {
  const { w, h, deck } = FRAME
  const mirror = (g: string) => `<g transform="translate(${w} 0) scale(-1 1)">${g}</g>`
  const side = (seed: number, flagC: string) => {
    const shape = `M50 ${h} L 300 ${deck} L 450 ${deck} L 450 ${h} Z M300 ${h} L 300 726 A 60 60 0 0 1 420 726 L 420 ${h} Z`
    return `
      <clipPath id="ab${seed}"><path clip-rule="evenodd" d="${shape}"/></clipPath>
      <path fill-rule="evenodd" d="${shape}" fill="#cdc2ad" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <g clip-path="url(#ab${seed})">
        ${brickWall(40, deck - 10, 420, 280, seed)}
        <rect x="400" y="${deck}" width="60" height="260" fill="#000" opacity=".12"/>
        <path d="M30 ${h} L 40 740 Q 200 700 300 760 L 300 ${h} Z" fill="#79b85a" opacity=".85"/>
        ${[70, 130, 200, 260].map((x) => `<path d="M${x} ${h} l 6 -26 m -6 26 l 10 -20" stroke="#3f8a3a" stroke-width="6" stroke-linecap="round"/>`).join('')}
      </g>
      <path d="M300 726 A 60 60 0 0 1 420 726" fill="none" stroke="#a89a82" stroke-width="14"/>
      <path d="M300 726 A 60 60 0 0 1 420 726" fill="none" stroke="${INK}" stroke-width="4"/>
      <!-- plank ramp -->
      <path d="M50 ${h} L 300 ${deck - 2}" stroke="${INK}" stroke-width="38" stroke-linecap="butt"/>
      <path d="M50 ${h} L 300 ${deck - 2}" stroke="#d9a566" stroke-width="28"/>
      <path d="M62 ${h - 8} L 300 ${deck - 2}" stroke="#a8743f" stroke-width="28" stroke-dasharray="3 31"/>
      <!-- deck on top -->
      <rect x="296" y="${deck}" width="166" height="46" rx="6" fill="#d9a566" stroke="${INK}" stroke-width="5"/>
      ${woodGrain(302, deck + 6, 154, 34, '#a8743f', seed + 4, 3)}
      ${[345, 396, 447].map((x) => `<path d="M${x} ${deck + 4} L ${x} ${deck + 42}" stroke="#8f5e30" stroke-width="3.5"/>`).join('')}
      <!-- rails + a flag -->
      <g transform="translate(300 ${deck - 80})">${bridgeRails(150, [14, 76, 138])}</g>
      <path d="M314 ${deck - 76} L 314 ${deck - 150}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M314 ${deck - 76} L 314 ${deck - 150}" stroke="#c9a06a" stroke-width="4" stroke-linecap="round"/>
      <path d="M318 ${deck - 148} Q 350 ${deck - 160} 376 ${deck - 140} Q 350 ${deck - 126} 318 ${deck - 122} Z" fill="${flagC}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      ${cone(70, h - 6, 0.9)}`
  }
  return svgDoc(
    w,
    h,
    `${side(11, '#e8322b')}${mirror(side(23, '#3a8be0'))}
     <!-- a lantern, a bucket and a hard hat on the left bank -->
     ${hardHatSmall(112, h - 112, 0.9, -12)}
     <g transform="translate(1690 ${h - 8})"><path d="M-26 0 L -32 -50 L 32 -50 L 26 0 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-30 -44 Q 0 -86 30 -44" fill="none" stroke="${INK}" stroke-width="4"/><path d="M-22 -40 L 22 -40" stroke="#fff" stroke-width="5" opacity=".4"/></g>`,
    { cut: 5 },
  )
})()

/* ---------------------------------------------------- the toy pile -- */

export const pileArt = (() => {
  const L = (s: number, ch: string) => `<text x="${s / 2}" y="${s * 0.72}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${s * 0.6}" fill="#fff" stroke="${INK}" stroke-width="2" stroke-opacity=".35">${ch}</text>`
  const cyl = (x: number, y: number, rw: number, h: number, c: string, sh: string, top: string) => `
    <g transform="translate(${x} ${y})">
      <path d="M0 0 L 0 ${h} A ${rw} 26 0 0 0 ${rw * 2} ${h} L ${rw * 2} 0 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M${rw * 1.3} 6 L ${rw * 2} 0 L ${rw * 2} ${h} A ${rw} 26 0 0 1 ${rw * 1.3} ${h + 24} Z" fill="${sh}" opacity=".5"/>
      <ellipse cx="${rw}" cy="0" rx="${rw}" ry="26" fill="${top}" stroke="${INK}" stroke-width="5"/>
      <path d="M12 ${h * 0.3} L 12 ${h * 0.8}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".4"/>
    </g>`
  const s = 130
  return svgDoc(
    800,
    520,
    `<!-- back row -->
     ${cyl(40, 150, 70, 200, '#2f9a4a', '#217538', '#5cc072')}
     <g transform="translate(300 120)">${cube(0, 0, 150, '#8a6cd8', '#6a4cb8', '#b39cf0', L(150, 'I'))}</g>
     <!-- triangle roof block -->
     <g transform="translate(500 110)">
       <path d="M0 220 L 110 20 L 220 220 Z" fill="#f4b400" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
       <path d="M110 20 L 220 220 L 110 220 Z" fill="#c98a00" opacity=".5"/>
       <path d="M60 150 L 110 56" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".45"/>
       <circle cx="110" cy="150" r="24" fill="#fff6d8" stroke="${INK}" stroke-width="5"/>
     </g>
     <!-- front row -->
     <g transform="translate(10 300)">${cube(0, 0, s, '#e8322b', '#b8221c', '#f26a5e', L(s, 'B'))}</g>
     <g transform="translate(170 300)">${cube(0, 0, s, '#3a8be0', '#2a5fb0', '#78b4f2', L(s, 'R'))}</g>
     <g transform="translate(330 300)">${cube(0, 0, s, '#ff8a2e', '#d96a12', '#ffb26a', L(s, 'D'))}</g>
     <!-- arch block -->
     <g transform="translate(500 296)">
       <path d="M0 140 L 0 24 L 246 24 L 246 140 Z" fill="#2fb5c4" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
       <path d="M60 140 L 60 100 A 63 63 0 0 1 186 100 L 186 140 Z" fill="#ffeaa8" stroke="${INK}" stroke-width="6"/>
       <path d="M0 24 L 246 24 L 246 50 L 0 50 Z" fill="#6fd8e2" opacity=".6"/>
       <path d="M200 24 L 246 24 L 246 140 L 200 140 Z" fill="#1f8a96" opacity=".5"/>
     </g>
     <!-- a toy hard hat and a star sticker -->
     ${hardHatSmall(400, 290, 1.1, 10)}
     <path d="${starPath(76, 380, 22)}" fill="#ffe27a" stroke="#e9a23b" stroke-width="3"/>`,
    { cut: 5 },
  )
})()
