import { svgDoc } from './texture'
import { starPath } from './kit'
import { INK, rand, woodGrain } from './style'

/*
 * Art for spread 7 "Home again": Milo's bedroom at night.
 * (page painting, back wall, window, bed, front pieces, mobile)
 */

const FONT = `Fredoka, 'Arial Rounded MT Bold', 'Marker Felt', sans-serif`

/* ----------------------------------------------- the printed spread -- */

function floorboards() {
  const r = rand(17)
  const cols = ['#c99a62', '#c29259', '#cfa06a', '#c4965e']
  let out = ''
  for (let row = 0; row < 17; row++) {
    const y = 150 + row * 100
    let x = -r() * 400
    while (x < 2560) {
      const len = 380 + r() * 420
      const c = cols[Math.floor(r() * cols.length)]
      out += `<rect x="${x.toFixed(0)}" y="${y}" width="${len.toFixed(0)}" height="100" fill="${c}"/>`
      out += woodGrain(x, y + 8, len, 84, '#9a6c3c', row * 31 + Math.floor(x), 3)
      out += `<path d="M${x.toFixed(0)} ${y} L ${x.toFixed(0)} ${y + 100}" stroke="#7d5430" stroke-width="4"/>`
      out += `<circle cx="${(x + 14).toFixed(0)}" cy="${y + 20}" r="3.5" fill="#7d5430"/><circle cx="${(x + 14).toFixed(0)}" cy="${y + 80}" r="3.5" fill="#7d5430"/>`
      x += len
    }
    out += `<path d="M0 ${y} L 2560 ${y}" stroke="#7d5430" stroke-width="4"/>`
  }
  return out
}

function nightRug(cx: number, cy: number, rx: number, ry: number) {
  const r = rand(5)
  const fringe = Array.from({ length: 140 }, (_, i) => {
    const a = (i / 140) * Math.PI * 2
    return `M${(cx + Math.cos(a) * rx).toFixed(0)} ${(cy + Math.sin(a) * ry).toFixed(0)} L ${(cx + Math.cos(a) * (rx + 28)).toFixed(0)} ${(cy + Math.sin(a) * (ry + 22)).toFixed(0)}`
  }).join(' ')
  const ring = (k: number, n: number, rr: number, fill: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return `<circle cx="${(cx + Math.cos(a) * (rx - k)).toFixed(0)}" cy="${(cy + Math.sin(a) * (ry - k * 0.55)).toFixed(0)}" r="${rr}" fill="${fill}"/>`
    }).join('')
  const stars = Array.from({ length: 46 }, () => {
    const a = r() * Math.PI * 2
    const d = 0.25 + r() * 0.68
    const x = cx + Math.cos(a) * rx * d * 0.86
    const y = cy + Math.sin(a) * ry * d * 0.86
    return `<path d="${starPath(x, y, 10 + r() * 14)}" fill="${r() < 0.5 ? '#ffe9a0' : '#f4c0d8'}" opacity=".9"/>`
  }).join('')
  return `
    <path d="${fringe}" stroke="#f1e2c0" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="${cx + 10}" cy="${cy + 16}" rx="${rx}" ry="${ry}" fill="#000" opacity=".18"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2b2f78" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 40}" ry="${ry - 22}" fill="#f1c55a"/>
    ${ring(20, 70, 8, '#2b2f78')}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 84}" ry="${ry - 46}" fill="#3a3f9a"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 110}" ry="${ry - 60}" fill="none" stroke="#9aa6ee" stroke-width="5" stroke-dasharray="26 18"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 130}" ry="${ry - 72}" fill="#343a8e"/>
    ${stars}
    <!-- a big sleepy crescent moon woven into the rug -->
    <g transform="translate(${cx + 470} ${cy - 150}) rotate(-18)">
      <path d="M0 -90 A 90 90 0 1 0 90 40 A 70 70 0 1 1 0 -90 Z" fill="#fff1b8" stroke="#e9c35a" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-30 20 q 10 12 22 0 M-62 8 q 8 10 18 0" stroke="#b58a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>`
}

export const homeSpreadArt = (() => {
  const r = rand(23)
  const confetti = Array.from({ length: 16 }, () => {
    const x = 120 + r() * 2320
    const y = 1180 + r() * 520
    if (Math.abs(x - 1280) < 30) return ''
    return `<path d="${starPath(x, y, 9 + r() * 7)}" fill="#ffe27a" stroke="#d9a030" stroke-width="2.5" opacity=".55"/>`
  }).join('')
  return svgDoc(
    2560,
    1760,
    `<!-- the wall behind the pop-up wall -->
     <rect width="2560" height="170" fill="#555ca8"/>
     <!-- floor -->
     <g>${floorboards()}</g>
     <rect y="150" width="2560" height="26" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
     <!-- the moonlight through the window, painted on the floorboards -->
     <g opacity=".3">
       <path d="M1640 176 L 2170 176 L 2420 700 L 1880 700 Z" fill="#cfe0ff"/>
       <path d="M1900 176 L 1910 176 L 2150 700 L 2140 700 Z M1640 440 L 2290 440 L 2300 452 L 1650 452 Z" fill="#8a7a9a"/>
     </g>
     ${nightRug(1230, 1010, 880, 470)}
     ${confetti}
     <!-- a goodnight book left on the floor -->
     <g transform="translate(2200 1420) rotate(-16)">
       <rect x="-110" y="-70" width="220" height="140" rx="8" fill="#e8a23a" stroke="${INK}" stroke-width="5"/>
       <rect x="-96" y="-58" width="192" height="116" rx="4" fill="#f7e9c4" stroke="#c98a2a" stroke-width="3"/>
       <path d="${starPath(0, -8, 30)}" fill="#ffd34d" stroke="#e9a23b" stroke-width="4"/>
       <path d="M-60 36 L 60 36" stroke="#c98a2a" stroke-width="6" stroke-linecap="round"/>
     </g>
     <!-- a stray sock -->
     <g transform="translate(560 1380) rotate(24)">
       <path d="M-60 -24 L 40 -24 L 40 6 Q 80 6 80 34 Q 80 52 56 52 L -60 52 Q -76 52 -76 36 Z" fill="#f6f4ee" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <rect x="-60" y="-24" width="100" height="20" fill="#e8727a"/>
     </g>`,
  )
})()

/* ------------------------------------------------ the bedroom wall -- */

export const WALL = { w: 2.9, h: 1.3 } // art 2900 × 1300 (1000 px / unit)

/** A kid's crayon drawing on a sheet of paper, pegged on the line. */
function drawing(cx: number, cy: number, rot: number, inner: string, bg = '#fdfbf5') {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <rect x="-70" y="-6" width="140" height="190" fill="#000" opacity=".16" transform="translate(5 7)"/>
    <rect x="-70" y="-6" width="140" height="190" fill="${bg}" stroke="${INK}" stroke-width="4"/>
    <g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="7">${inner}</g>
    <!-- wooden peg -->
    <rect x="-9" y="-30" width="18" height="46" rx="4" fill="#d9a05a" stroke="${INK}" stroke-width="3"/>
    <path d="M0 -26 L 0 8" stroke="#9a6430" stroke-width="3"/>
  </g>`
}

const drawings = [
  // robot
  drawing(790, 372, -5, `
    <rect x="-34" y="28" width="68" height="46" rx="8" stroke="#2bb6d8"/><circle cx="-14" cy="50" r="6" fill="#2bb6d8" stroke="none"/><circle cx="14" cy="50" r="6" fill="#2bb6d8" stroke="none"/>
    <rect x="-44" y="84" width="88" height="62" rx="8" stroke="#2bb6d8"/><path d="M-26 108 L 26 108" stroke="#f4a52e"/>
    <path d="M-44 96 L -62 132 M44 96 L 62 132 M-20 146 L -20 170 M20 146 L 20 170 M0 28 L 0 12" stroke="#2bb6d8"/><circle cx="0" cy="8" r="5" fill="#e8322b" stroke="none"/>
    <text x="0" y="178" text-anchor="middle" font-family="${FONT}" font-size="20" fill="#2bb6d8" stroke="none">ROBO</text>`),
  // excavator
  drawing(950, 380, 4, `
    <rect x="-52" y="110" width="104" height="26" rx="13" stroke="#3a3a3a"/>
    <path d="M-40 106 L -40 70 L -4 70 L -4 106 Z M-4 90 L 40 90 L 40 106" stroke="#f4b400" fill="#ffe27a"/>
    <path d="M30 92 L 56 44 L 20 24" stroke="#f4b400"/><path d="M20 24 L 8 46 L 28 52" stroke="#9a9a9a"/>
    <circle cx="-34" cy="148" r="7" fill="#3a3a3a" stroke="none"/><circle cx="34" cy="148" r="7" fill="#3a3a3a" stroke="none"/>
    <circle cx="-30" cy="24" r="14" fill="#ffd34d" stroke="none"/><path d="M-80 160 Q -20 150 80 164" stroke="#8a5a2b"/>`),
  // bridge
  drawing(1110, 368, -3, `
    <path d="M-62 120 L 62 120" stroke="#6a6a72" stroke-width="10"/>
    <path d="M-52 120 Q 0 20 52 120" stroke="#e8572b"/><path d="M-30 120 L -30 76 M-10 120 L -10 56 M10 120 L 10 56 M30 120 L 30 76" stroke="#e8572b" stroke-width="5"/>
    <path d="M-66 154 q 12 -10 24 0 t 24 0 t 24 0 t 24 0 t 24 0" stroke="#3a6fd8"/><path d="M-66 170 q 12 -10 24 0 t 24 0 t 24 0 t 24 0 t 24 0" stroke="#5aa6e8"/>
    <circle cx="44" cy="30" r="14" fill="#ffd34d" stroke="none"/>`),
  // fire truck
  drawing(1270, 380, 5, `
    <rect x="-56" y="84" width="76" height="44" rx="5" stroke="#e8322b" fill="#e8322b"/><path d="M20 128 L 20 100 L 54 100 L 60 128 Z" stroke="#e8322b" fill="#e8322b"/>
    <path d="M-48 70 L 14 56 M-48 80 L 14 66" stroke="#9aa3ad" stroke-width="6"/><path d="M-30 74 L -30 62 M-10 70 L -10 60" stroke="#9aa3ad" stroke-width="4"/>
    <circle cx="-30" cy="134" r="12" fill="#333" stroke="none"/><circle cx="36" cy="134" r="12" fill="#333" stroke="none"/>
    <path d="M-20 28 q 8 -22 16 0 q 8 -18 14 4 q -4 14 -14 14 q -16 0 -16 -18 Z" stroke="#f4a52e" fill="#ffb02e" stroke-width="4"/>
    <path d="M-62 160 Q 0 150 64 162" stroke="#2f9a4a"/>`),
  // super-Milo with a cape
  drawing(1430, 372, -4, `
    <circle cx="0" cy="52" r="20" stroke="#8a4a2a" fill="#ffd9b8"/><path d="M-12 46 Q 0 38 12 46" stroke="#1f5fd6" stroke-width="6"/>
    <path d="M-14 74 L -10 128 L 10 128 L 14 74 Z" stroke="#3a6fd8" fill="#3a6fd8"/>
    <path d="M-12 76 Q -70 100 -58 150 Q -30 128 -10 126 Z M12 76 Q 70 100 58 150 Q 30 128 10 126 Z" stroke="#d8261c" fill="#e8322b"/>
    <path d="M-14 82 L -40 50 M14 82 L 40 50 M-8 128 L -14 160 M8 128 L 14 160" stroke="#8a4a2a" stroke-width="6"/>
    <path d="${starPath(0, 98, 11)}" fill="#ffd21f" stroke="none"/>`),
].join('')

function wallRobo(x: number, y: number) {
  // little Robo asleep on the shelf (x centre, y = shelf top)
  return `<g transform="translate(${x} ${y})">
    <path d="M0 -176 L 0 -196" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="-202" r="9" fill="#b04a42" stroke="${INK}" stroke-width="4"/>
    <rect x="-52" y="-176" width="104" height="70" rx="14" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/>
    <rect x="-44" y="-170" width="88" height="14" rx="7" fill="#a6d4dc"/>
    <circle cx="-22" cy="-142" r="15" fill="#2c3e48" stroke="${INK}" stroke-width="3.5"/><circle cx="22" cy="-142" r="15" fill="#2c3e48" stroke="${INK}" stroke-width="3.5"/>
    <path d="M-34 -142 Q -22 -132 -10 -142 M10 -142 Q 22 -132 34 -142" stroke="#7fb8c4" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="-24" y="-122" width="48" height="10" rx="4" fill="#2c3e48"/>
    <rect x="-54" y="-104" width="108" height="86" rx="12" fill="#6aa6b4" stroke="${INK}" stroke-width="5"/>
    <rect x="-36" y="-92" width="72" height="62" rx="8" fill="#dde8ea" stroke="${INK}" stroke-width="3.5"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${-30 + i * 15}" y="-80" width="12" height="12" rx="2" fill="${['#3ccf5a', '#9ed84a', '#f4b400', '#e8322b'][i]}" stroke="${INK}" stroke-width="2"/>`).join('')}
    <circle cx="-14" cy="-50" r="7" fill="#f4b400" stroke="${INK}" stroke-width="2.5"/><circle cx="14" cy="-50" r="7" fill="#e8572b" stroke="${INK}" stroke-width="2.5"/>
    <rect x="-84" y="-100" width="22" height="64" rx="10" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/><rect x="62" y="-100" width="22" height="64" rx="10" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/>
    <rect x="-40" y="-20" width="30" height="20" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/><rect x="10" y="-20" width="30" height="20" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/>
    <path d="M-48 0 L -48 -8 Q -48 -18 -38 -18 M48 0 L 48 -8 Q 48 -18 38 -18" stroke="${INK}" stroke-width="4" fill="none"/>
  </g>`
}

function wallBoxCar(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
    <path d="M-100 -96 L -118 -138 L -30 -142 L -14 -96 Z M100 -96 L 118 -138 L 30 -142 L 14 -96 Z" fill="#b9864a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="-106" y="-100" width="212" height="86" rx="3" fill="#d3a062" stroke="${INK}" stroke-width="5"/>
    <rect x="-16" y="-100" width="32" height="46" fill="#e9c48a" opacity=".9"/>
    <text x="40" y="-48" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="#d0372a" transform="rotate(-5 40 -48)">MILO</text>
    <path d="M-80 -60 L -80 -84 M-90 -74 L -80 -84 L -70 -74" stroke="#7a4e22" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${[-62, 62].map((cx) => `<circle cx="${cx}" cy="-14" r="26" fill="#2b2b2b" stroke="${INK}" stroke-width="4"/><circle cx="${cx}" cy="-14" r="14" fill="#ffc21a" stroke="${INK}" stroke-width="3"/><circle cx="${cx}" cy="-14" r="4" fill="#9aa3ad"/>`).join('')}
    <path d="M112 -112 L 112 -168" stroke="${INK}" stroke-width="5"/><path d="M114 -166 Q 150 -176 168 -158 Q 144 -150 150 -132 Q 132 -142 114 -134 Z" fill="#3ccf5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  </g>`
}

export const bedroomWall = (() => {
  const W = 2900
  const H = 1300
  const r = rand(77)
  const books = (x: number, y: number, n: number) => {
    const cols = ['#c9524a', '#3a6fd8', '#e9a23b', '#2f9a4a', '#8a6cd8', '#2fb5c4']
    let out = ''
    let xx = x
    for (let i = 0; i < n; i++) {
      const w = 30 + r() * 22
      const h = 96 + r() * 50
      out += `<rect x="${xx.toFixed(0)}" y="${(y - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="3" fill="${cols[i % cols.length]}" stroke="${INK}" stroke-width="3.5"/><rect x="${(xx + 4).toFixed(0)}" y="${(y - h + 14).toFixed(0)}" width="${(w - 8).toFixed(0)}" height="8" fill="#fff" opacity=".4"/>`
      xx += w + 2
    }
    return out
  }
  const bracket = (x: number, y: number) => `<path d="M${x} ${y} L ${x} ${y + 70} M${x} ${y + 70} L ${x + 50} ${y}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M${x} ${y} L ${x} ${y + 70} M${x} ${y + 70} L ${x + 50} ${y}" stroke="#a8683c" stroke-width="8" stroke-linecap="round"/>`
  return svgDoc(
    W,
    H,
    `<pattern id="wp" width="130" height="130" patternUnits="userSpaceOnUse">
       <rect width="130" height="130" fill="#5a61ad"/><rect width="65" height="130" fill="#555ca8"/>
       <path d="M32 40 a 14 14 0 1 0 14 22 a 11 11 0 1 1 -14 -22 Z" fill="#7f87cf"/><circle cx="98" cy="84" r="4" fill="#7f87cf"/><circle cx="104" cy="30" r="3" fill="#7f87cf"/><circle cx="20" cy="104" r="3" fill="#7f87cf"/>
     </pattern>
     <radialGradient id="vg" cx="50%" cy="55%" r="75%"><stop offset=".55" stop-color="#1a1d4a" stop-opacity="0"/><stop offset="1" stop-color="#1a1d4a" stop-opacity=".42"/></radialGradient>
     <rect width="${W}" height="${H}" fill="url(#wp)"/>
     <!-- beadboard under a chair rail -->
     <rect y="900" width="${W}" height="400" fill="#8b74b8"/>
     ${Array.from({ length: 58 }, (_, i) => `<path d="M${i * 50 + 25} 930 L ${i * 50 + 25} 1250" stroke="#725ca0" stroke-width="4"/><path d="M${i * 50 + 28} 930 L ${i * 50 + 28} 1250" stroke="#a290cc" stroke-width="2" opacity=".7"/>`).join('')}
     <rect y="888" width="${W}" height="38" fill="#f0e2bd" stroke="${INK}" stroke-width="4"/>
     <rect y="900" width="${W}" height="8" fill="#fff8e4" opacity=".8"/>
     <rect y="1236" width="${W}" height="64" fill="#b5784a" stroke="${INK}" stroke-width="4"/>
     <rect y="1240" width="${W}" height="10" fill="#d09a68" opacity=".8"/>
     <!-- shelf 1: Robo and the box car -->
     ${bracket(120, 690)}${bracket(520, 690)}
     <rect x="40" y="660" width="600" height="30" rx="4" fill="#b5783f" stroke="${INK}" stroke-width="5"/>
     <rect x="46" y="664" width="588" height="8" fill="#d9a05a" opacity=".7"/>
     ${wallRobo(170, 660)}
     ${wallBoxCar(440, 660)}
     <!-- shelf 2: books, a rocket and a cactus -->
     ${bracket(100, 330)}${bracket(500, 330)}
     <rect x="40" y="300" width="560" height="28" rx="4" fill="#b5783f" stroke="${INK}" stroke-width="5"/>
     ${books(70, 300, 6)}
     <g transform="translate(330 300) rotate(8)">
       <path d="M0 -118 Q 26 -80 24 0 L -24 0 Q -26 -80 0 -118 Z" fill="#f3efe4" stroke="${INK}" stroke-width="4"/>
       <circle cx="0" cy="-60" r="11" fill="#4f9fd8" stroke="${INK}" stroke-width="3"/>
       <path d="M-24 -20 L -42 10 L -24 0 Z M24 -20 L 42 10 L 24 0 Z" fill="#e8322b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     </g>
     <g transform="translate(470 300)">
       <path d="M-34 0 L -26 -50 L 26 -50 L 34 0 Z" fill="#d9724a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="-32" y="-60" width="64" height="14" rx="4" fill="#e8885e" stroke="${INK}" stroke-width="3.5"/>
       <path d="M0 -60 L 0 -120 Q 0 -134 12 -134 Q 22 -134 22 -120 L 22 -100 M0 -90 L -22 -90 Q -34 -90 -34 -104 L -34 -112" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M0 -60 L 0 -120 Q 0 -134 12 -134 Q 22 -134 22 -120 L 22 -100 M0 -90 L -22 -90 Q -34 -90 -34 -104 L -34 -112" stroke="#4f9d4a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
     </g>
     <!-- the clothesline of the day's adventures -->
     <path d="M690 200 Q 1100 300 1510 200" stroke="${INK}" stroke-width="6" fill="none"/>
     <path d="M690 200 Q 1100 300 1510 200" stroke="#e8d6a0" stroke-width="3" fill="none"/>
     <circle cx="690" cy="200" r="12" fill="#a8683c" stroke="${INK}" stroke-width="4"/><circle cx="1510" cy="200" r="12" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
     ${drawings}
     <!-- Milo's cape, hung on a peg -->
     <g transform="translate(2780 380)">
       <path d="M-14 0 Q 0 -30 14 0 Z" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
       <path d="M-70 8 Q 0 -10 70 8 Q 84 120 100 240 Q 60 262 40 238 Q 20 266 0 244 Q -20 266 -40 238 Q -60 262 -100 240 Q -84 120 -70 8 Z" fill="#e8322b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M-60 24 Q -50 120 -78 224 M60 24 Q 50 120 78 224 M0 14 Q 0 130 0 232" stroke="#b51e16" stroke-width="5" fill="none" opacity=".8"/>
       <path d="${starPath(0, 110, 30)}" fill="#ffd21f" stroke="#d8261c" stroke-width="5" stroke-linejoin="round"/>
       <circle cx="0" cy="0" r="12" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
     </g>
     <!-- little night-light plugged in by the skirting -->
     <g transform="translate(2000 1170)"><rect x="-30" y="-44" width="60" height="88" rx="10" fill="#f3efe4" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="-8" r="20" fill="#ffe9a0" stroke="${INK}" stroke-width="3"/><path d="M-8 28 L 8 28" stroke="#b8b0a0" stroke-width="4"/></g>
     <rect width="${W}" height="${H}" fill="url(#vg)"/>`,
    { cut: 5 },
  )
})()

/* ----------------------------------------------------- the window -- */

export const WINDOW = { w: 0.82, h: 0.78 } // art 820 × 780

function skyStars(n: number, seed: number, x0: number, y0: number, w: number, h: number, big = 1) {
  const rr = rand(seed)
  return Array.from({ length: n }, () => `<path d="${starPath(x0 + rr() * w, y0 + rr() * h, (4 + rr() * 6) * big)}" fill="#fff4c4"/>`).join('')
}

export const nightWindow = svgDoc(
  820,
  780,
  `<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2558"/><stop offset=".65" stop-color="#4b3f8e"/><stop offset="1" stop-color="#9a5a98"/></linearGradient>
   <!-- frame -->
   <rect x="150" y="84" width="520" height="560" rx="8" fill="#9a6232" stroke="${INK}" stroke-width="5"/>
   <rect x="176" y="110" width="468" height="508" fill="url(#dusk)"/>
   ${skyStars(5, 3, 190, 124, 440, 220, 0.8)}
   <circle cx="540" cy="204" r="48" fill="#fff4c4"/><circle cx="562" cy="190" r="44" fill="#352f78"/>
   <!-- rooftops across the way -->
   <path d="M176 618 L 176 540 L 226 540 L 226 506 L 270 478 L 314 506 L 314 560 L 380 560 L 380 520 L 424 490 L 468 520 L 468 570 L 540 570 L 540 524 L 590 524 L 590 556 L 644 556 L 644 618 Z" fill="#241e5a"/>
   ${[[246, 524], [282, 524], [410, 530], [440, 530], [556, 538]].map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="18" fill="#ffd56a"/>`).join('')}
   <!-- cross bars -->
   <rect x="400" y="110" width="22" height="508" fill="#9a6232" stroke="${INK}" stroke-width="3"/>
   <rect x="176" y="340" width="468" height="22" fill="#9a6232" stroke="${INK}" stroke-width="3"/>
   <rect x="150" y="84" width="520" height="12" fill="#b9783f" opacity=".6"/>
   <!-- sill with a tiny plant and a jar -->
   <rect x="120" y="632" width="580" height="40" rx="6" fill="#b5783f" stroke="${INK}" stroke-width="5"/>
   <rect x="126" y="636" width="568" height="8" fill="#d9a05a" opacity=".8"/>
   <path d="M210 632 L 220 584 L 280 584 L 290 632 Z" fill="#d9724a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M250 584 Q 232 540 250 508 Q 268 540 250 584 M250 580 Q 214 560 220 528 M250 580 Q 286 560 282 528" stroke="#4f9d74" stroke-width="12" fill="none" stroke-linecap="round"/>
   <g transform="translate(560 632)"><path d="M-30 0 L -34 -62 Q -34 -72 -24 -72 L 24 -72 Q 34 -72 34 -62 L 30 0 Z" fill="#e6f3f7" stroke="${INK}" stroke-width="4" opacity=".95"/>
     <rect x="-32" y="-86" width="64" height="16" rx="5" fill="#e8572b" stroke="${INK}" stroke-width="3.5"/>
     <path d="${starPath(0, -34, 14)}" fill="#ffe27a" stroke="#e9a23b" stroke-width="2"/></g>
   <!-- curtain rod + dusky-rose curtains tied back -->
   <rect x="40" y="58" width="740" height="20" rx="10" fill="#6a4426" stroke="${INK}" stroke-width="4"/>
   <circle cx="42" cy="68" r="18" fill="#a8683c" stroke="${INK}" stroke-width="4"/><circle cx="778" cy="68" r="18" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
   ${[0, 1]
     .map((i) => {
       const g = `<path d="M60 76 L 200 76 Q 190 230 168 330 Q 156 380 176 420 Q 214 520 204 690 L 60 690 Z" fill="#d9768a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
         ${[96, 136, 170].map((x) => `<path d="M${x} 84 Q ${x + 14} 300 ${x + 18} 430 Q ${x + 8} 560 ${x - 6} 684" stroke="#b85a70" stroke-width="6" fill="none" opacity=".85"/>`).join('')}
         ${Array.from({ length: 9 }, (_, k) => `<path d="${starPath(86 + ((k * 53) % 90), 150 + k * 60, 8)}" fill="#ffe9a0" opacity=".85"/>`).join('')}
         <path d="M170 330 Q 214 350 200 392 Q 176 404 164 384 Q 160 354 150 340 Z" fill="#f4c542" stroke="${INK}" stroke-width="4"/>`
       return i ? `<g transform="translate(820 0) scale(-1 1)">${g}</g>` : g
     })
     .join('')}`,
  { cut: 5 },
)

/** Over the window glass: the full night sky and a bright moon (fades in with the dark). */
export const windowNightOverlay = svgDoc(
  820,
  780,
  `<radialGradient id="mg"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#fff4c4" stop-opacity=".5"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient>
   <rect x="176" y="110" width="468" height="508" fill="#10163f"/>
   ${skyStars(34, 8, 190, 124, 440, 300, 1.1)}
   <circle cx="540" cy="204" r="96" fill="url(#mg)"/>
   <circle cx="540" cy="204" r="48" fill="#fffbe0"/><circle cx="562" cy="190" r="44" fill="#10163f"/>
   <path d="M176 618 L 176 540 L 226 540 L 226 506 L 270 478 L 314 506 L 314 560 L 380 560 L 380 520 L 424 490 L 468 520 L 468 570 L 540 570 L 540 524 L 590 524 L 590 556 L 644 556 L 644 618 Z" fill="#0c1033"/>
   <path d="M120 300 L 60 330 M70 322 l 80 -20" stroke="none"/>
   <rect x="400" y="110" width="22" height="508" fill="#9a6232" stroke="${INK}" stroke-width="3"/>
   <rect x="176" y="340" width="468" height="22" fill="#9a6232" stroke="${INK}" stroke-width="3"/>`,
  { grain: 0 },
)

/* ------------------------------------------------------------- bed -- */

export const BED = { w: 1.1, h: 0.66 } // art 1100 × 660

export const bed = svgDoc(
  1100,
  660,
  `<!-- legs -->
   ${[70, 1010].map((x) => `<rect x="${x - 18}" y="540" width="36" height="104" rx="6" fill="#a86f3c" stroke="${INK}" stroke-width="5"/>`).join('')}
   <rect x="120" y="560" width="760" height="22" fill="#8a5628" stroke="${INK}" stroke-width="4"/>
   <!-- headboard (right) with a star cut-out -->
   <path d="M880 560 L 880 190 Q 880 90 960 90 Q 1050 90 1052 190 L 1052 560 Z" fill="#b67a45" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M896 548 L 896 200 Q 896 112 960 112 Q 1036 112 1036 200 L 1036 548 Z" fill="#c48a52"/>
   ${woodGrain(900, 130, 130, 400, '#9a6430', 11, 7)}
   <path d="${starPath(966, 240, 44)}" fill="#3a2418" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="${starPath(966, 240, 30, 14)}" fill="#ffe27a" opacity=".9"/>
   <circle cx="1052" cy="96" r="0" fill="none"/>
   <!-- footboard (left) -->
   <path d="M60 560 L 60 360 Q 60 330 90 330 L 120 330 L 120 560 Z" fill="#b67a45" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M72 548 L 72 360 Q 72 342 92 342 L 108 342 L 108 548 Z" fill="#c48a52"/>
   <!-- mattress -->
   <rect x="110" y="438" width="780" height="104" rx="24" fill="#f4ecdc" stroke="${INK}" stroke-width="5"/>
   <path d="M130 470 L 870 470" stroke="#ddd0b8" stroke-width="4"/>
   <!-- the patchwork quilt, tucked in -->
   <path d="M96 392 Q 400 340 880 372 L 880 462 Q 860 540 800 536 Q 770 570 730 536 Q 690 574 650 536 Q 610 574 570 536 Q 530 574 490 536 Q 450 574 410 536 Q 370 574 330 536 Q 290 574 250 536 Q 210 574 170 536 Q 120 548 96 492 Z" fill="#4f6fcf" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[0, 1, 2, 3, 4, 5, 6].map((i) => {
     const x = 112 + i * 108
     const cols = ['#e8727a', '#f4c542', '#5fb3b0', '#c9a0e8', '#f08a4a', '#6fcf8a', '#f4a0c0']
     return `<path d="M${x} ${388 - Math.sin(i * 0.5) * 6} L ${x + 100} ${372 + i * 1} L ${x + 100} ${470} L ${x} ${474} Z" fill="${cols[i]}" opacity=".95" stroke="#fdf3d8" stroke-width="4" stroke-dasharray="10 7"/>
       <path d="${starPath(x + 50, 428, 22)}" fill="#fff6c8" stroke="#d9a030" stroke-width="2.5" stroke-linejoin="round"/>`
   }).join('')}
   <path d="M96 392 Q 400 340 880 372" stroke="#fff6dc" stroke-width="8" fill="none" opacity=".7"/>
   <!-- folded-down sheet cuff -->
   <path d="M560 360 Q 700 338 880 366 L 880 408 Q 700 384 560 404 Z" fill="#fdf6e6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   ${[600, 660, 720, 780, 840].map((x, i) => `<path d="M${x} ${390 - i * 3} q 10 -12 20 0" stroke="#c9a0e8" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
   <!-- pillow -->
   <path d="M690 296 Q 790 252 884 290 Q 904 336 884 380 Q 790 410 690 376 Q 670 334 690 296 Z" fill="#fdf8ee" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M706 316 Q 790 288 872 312" stroke="#e4d8c0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M700 358 Q 790 388 878 360" stroke="#e4d8c0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="${starPath(792, 336, 20)}" fill="#8aa2f0" opacity=".85"/>
   <circle cx="800" cy="338" r="3" fill="#fff"/>
   <!-- a little hand-knit blanket draped over the foot -->
   <path d="M118 360 Q 170 326 230 350 L 220 440 Q 170 470 120 440 Z" fill="#f2c45a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   ${[376, 396, 416].map((y) => `<path d="M126 ${y} Q 170 ${y - 18} 226 ${y - 2}" stroke="#c9524a" stroke-width="8" fill="none"/>`).join('')}`,
  { cut: 5 },
)

/* ------------------------------------------------ front-of-book bits -- */

/** The teddy (420×540). The eyes are separate parts so they can close. */
export const teddy = svgDoc(
  420,
  540,
  `<!-- legs + feet -->
   ${[140, 280]
     .map(
       (x) => `<ellipse cx="${x}" cy="490" rx="62" ry="44" fill="#b9783f" stroke="${INK}" stroke-width="5"/>
       <ellipse cx="${x + (x < 200 ? -6 : 6)}" cy="494" rx="34" ry="26" fill="#ecc99a"/>
       <circle cx="${x - 14}" cy="486" r="6" fill="#d9a572"/><circle cx="${x + 2}" cy="480" r="6" fill="#d9a572"/><circle cx="${x + 18}" cy="486" r="6" fill="#d9a572"/>`,
     )
     .join('')}
   <!-- arms -->
   <ellipse cx="100" cy="372" rx="38" ry="64" transform="rotate(24 100 372)" fill="#c68a52" stroke="${INK}" stroke-width="5"/>
   <ellipse cx="320" cy="372" rx="38" ry="64" transform="rotate(-24 320 372)" fill="#c68a52" stroke="${INK}" stroke-width="5"/>
   <!-- tummy -->
   <ellipse cx="210" cy="388" rx="120" ry="138" fill="#c68a52" stroke="${INK}" stroke-width="5"/>
   <ellipse cx="210" cy="404" rx="78" ry="92" fill="#ecc99a"/>
   <path d="M170 384 q 8 -10 16 0 M234 384 q 8 -10 16 0" stroke="none"/>
   <g transform="translate(246 370)"><path d="M0 14 C -28 -8 -16 -30 0 -18 C 16 -30 28 -8 0 14 Z" fill="#e8727a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>
   <path d="M168 440 q 10 6 20 0 M214 452 q 10 6 20 0" stroke="#c69a68" stroke-width="3" fill="none" stroke-linecap="round"/>
   <!-- ears + head -->
   <circle cx="112" cy="116" r="46" fill="#b9783f" stroke="${INK}" stroke-width="5"/><circle cx="112" cy="120" r="24" fill="#ecc99a"/>
   <circle cx="308" cy="116" r="46" fill="#b9783f" stroke="${INK}" stroke-width="5"/><circle cx="308" cy="120" r="24" fill="#ecc99a"/>
   <circle cx="210" cy="178" r="112" fill="#c68a52" stroke="${INK}" stroke-width="5"/>
   <path d="M130 130 Q 150 100 190 92" stroke="#dba46c" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/>
   <ellipse cx="210" cy="214" rx="54" ry="42" fill="#ecc99a" stroke="${INK}" stroke-width="4"/>
   <ellipse cx="210" cy="196" rx="21" ry="14" fill="#4a2c1a"/><ellipse cx="203" cy="191" rx="7" ry="4" fill="#fff" opacity=".7"/>
   <path d="M210 210 L 210 226 M188 232 Q 210 246 232 232" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
   <circle cx="132" cy="206" r="20" fill="#ee8a7a" opacity=".5"/><circle cx="288" cy="206" r="20" fill="#ee8a7a" opacity=".5"/>
   <!-- stitched patch on the ear -->
   <path d="M326 96 l 16 16 M342 96 l -16 16" stroke="#4a2c1a" stroke-width="3" stroke-linecap="round"/>
   <!-- sleepy nightcap with a pompom -->
   <path d="M104 134 Q 130 22 236 44 Q 330 62 372 168 Q 300 112 214 106 Q 150 104 104 134 Z" fill="#5a7fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M200 48 Q 232 76 238 108 M270 56 Q 296 84 300 120" stroke="#8aa6ee" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="${starPath(160, 76, 14)}" fill="#ffe27a"/><path d="${starPath(262, 96, 10)}" fill="#ffe27a"/>
   <path d="M96 138 Q 214 80 330 134" stroke="${INK}" stroke-width="40" fill="none" stroke-linecap="round"/>
   <path d="M96 138 Q 214 80 330 134" stroke="#fdfbf5" stroke-width="30" fill="none" stroke-linecap="round"/>
   <path d="M120 142 Q 214 94 316 140" stroke="#e8dcc4" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="3 10"/>
   <circle cx="372" cy="176" r="26" fill="#fdfbf5" stroke="${INK}" stroke-width="5"/>
   <circle cx="366" cy="170" r="8" fill="#fff" opacity=".9"/>`,
  { cut: 5 },
)

export const teddyEyesOpen = svgDoc(
  160,
  50,
  [34, 126]
    .map((x) => `<circle cx="${x}" cy="26" r="13" fill="#2a1a12"/><circle cx="${x - 4}" cy="21" r="4.5" fill="#fff"/>`)
    .join(''),
  { grain: 0 },
)
export const teddyEyesClosed = svgDoc(
  160,
  50,
  [34, 126].map((x) => `<path d="M${x - 14} 22 Q ${x} 40 ${x + 14} 22" stroke="#2a1a12" stroke-width="6" fill="none" stroke-linecap="round"/>`).join(''),
  { grain: 0 },
)

/** A pair of fuzzy slippers (520×230). */
export const slippers = (() => {
  const one = (x: number, flip: boolean) => `<g transform="translate(${x} 0) ${flip ? 'translate(220 0) scale(-1 1)' : ''}">
    <path d="M14 176 Q 0 120 40 94 Q 96 70 160 90 Q 214 108 214 160 Q 214 204 150 208 L 60 208 Q 22 206 14 176 Z" fill="#4f9d9a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M14 176 Q 22 206 60 208 L 150 208 Q 214 204 214 160 L 214 178 Q 214 214 150 218 L 60 218 Q 18 216 14 188 Z" fill="#2f6f6c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 92 Q 120 66 168 96 Q 176 130 140 140 Q 100 148 74 128 Q 62 110 70 92 Z" fill="#fff2d8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${70 + i * 12.5}" cy="${92 - Math.sin((i / 8) * Math.PI) * 18}" r="9" fill="#fff8e8" stroke="#e8dcc4" stroke-width="2"/>`).join('')}
    <path d="${starPath(150, 170, 20)}" fill="#ffe27a" stroke="#d9a030" stroke-width="3" stroke-linejoin="round"/>
    ${Array.from({ length: 7 }, (_, i) => `<path d="M${34 + i * 24} ${150 + (i % 2) * 14} q 6 -10 12 0" stroke="#8fd3cf" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
  </g>`
  return svgDoc(520, 230, `${one(20, false)}${one(280, true)}`, { cut: 5 })
})()

export const LAMP = { w: 0.36, h: 0.56 } // art 360 × 560

const lampShadePath = 'M118 118 L 242 118 L 306 296 L 54 296 Z'

/** The little bedside lamp on a round stool (360×560). The shade is unlit here. */
export const lamp = svgDoc(
  360,
  560,
  `<!-- stool -->
   ${[70, 290].map((x) => `<path d="M${x} 470 L ${x + (x < 180 ? -18 : 18)} 548" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M${x} 470 L ${x + (x < 180 ? -18 : 18)} 548" stroke="#a8683c" stroke-width="13" stroke-linecap="round"/>`).join('')}
   <path d="M180 470 L 180 548" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M180 470 L 180 548" stroke="#8a5628" stroke-width="13" stroke-linecap="round"/>
   <rect x="44" y="428" width="272" height="48" rx="20" fill="#b9783f" stroke="${INK}" stroke-width="5"/>
   <rect x="54" y="434" width="252" height="12" rx="6" fill="#d9a05a" opacity=".8"/>
   <path d="M70 500 Q 180 516 290 500" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M70 500 Q 180 516 290 500" stroke="#a8683c" stroke-width="6" fill="none" stroke-linecap="round"/>
   <!-- a glass of water -->
   <path d="M262 428 L 258 384 Q 258 378 264 378 L 292 378 Q 298 378 298 384 L 294 428 Z" fill="#dff1f7" stroke="${INK}" stroke-width="4" opacity=".95"/>
   <path d="M262 400 L 294 400" stroke="#8ad0e8" stroke-width="3"/>
   <!-- lamp base: a blue gourd with stars -->
   <ellipse cx="170" cy="398" rx="60" ry="14" fill="#2b3f8a" stroke="${INK}" stroke-width="4"/>
   <path d="M122 396 Q 104 340 154 318 L 186 318 Q 236 340 218 396 Q 170 420 122 396 Z" fill="#5a7fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M132 350 Q 140 330 160 326" stroke="#9db6f4" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="${starPath(176, 366, 12)}" fill="#ffe27a"/><path d="${starPath(150, 386, 7)}" fill="#ffe27a"/><path d="${starPath(200, 388, 8)}" fill="#ffe27a"/>
   <rect x="164" y="300" width="22" height="24" fill="#d9a05a" stroke="${INK}" stroke-width="4"/>
   <!-- shade (dim) -->
   <path d="${lampShadePath}" fill="#cfa66c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[100, 150, 190, 230, 270].map((x, i) => `<path d="M${118 + i * 31} 120 L ${x - 12 + (i - 2) * 10} 294" stroke="#b58a50" stroke-width="3.5"/>`).join('')}
   <rect x="44" y="286" width="272" height="22" rx="11" fill="#c9954a" stroke="${INK}" stroke-width="5"/>
   <rect x="164" y="98" width="32" height="24" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
   <circle cx="180" cy="92" r="9" fill="#e8c36a" stroke="${INK}" stroke-width="3"/>`,
  { cut: 5 },
)

/** The shade, lit (same box as the lamp): faded over the dim one. */
export const lampLit = svgDoc(
  360,
  560,
  `<linearGradient id="lt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffe19a"/></linearGradient>
   <path d="${lampShadePath}" fill="url(#lt)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[0, 1, 2, 3, 4].map((i) => `<path d="M${118 + i * 31} 120 L ${98 + i * 40} 294" stroke="#f4d27a" stroke-width="3.5"/>`).join('')}
   <rect x="44" y="286" width="272" height="22" rx="11" fill="#ffd27a" stroke="${INK}" stroke-width="5"/>
   <ellipse cx="180" cy="290" rx="60" ry="10" fill="#fffbe6"/>`,
  { grain: 0 },
)

export const FLOOR_LAMP = { w: 0.6, h: 1.36 } // art 440 × 1000

const floorShadePath = 'M128 64 L 312 64 L 404 330 L 36 330 Z'

/** Milo's big floor lamp: a tall wooden pole, a round base, a pull chain, a starry shade (440×1000). Unlit. */
export const floorLamp = svgDoc(
  440,
  1000,
  `<!-- round base -->
   <ellipse cx="220" cy="968" rx="124" ry="24" fill="#2b3f8a" stroke="${INK}" stroke-width="5"/>
   <path d="M110 960 Q 220 900 330 960 Q 220 988 110 960 Z" fill="#5a7fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M140 948 Q 180 926 220 922" stroke="#9db6f4" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="${starPath(270, 944, 10)}" fill="#ffe27a"/><path d="${starPath(176, 952, 7)}" fill="#ffe27a"/>
   <!-- wooden pole with a brass knuckle -->
   <rect x="204" y="330" width="32" height="606" rx="10" fill="#a8683c" stroke="${INK}" stroke-width="5"/>
   <rect x="211" y="340" width="8" height="586" rx="4" fill="#d9a05a" opacity=".8"/>
   <rect x="194" y="610" width="52" height="30" rx="10" fill="#e8c36a" stroke="${INK}" stroke-width="4"/>
   <rect x="194" y="336" width="52" height="34" rx="8" fill="#e8c36a" stroke="${INK}" stroke-width="4"/>
   <!-- shade (dim) with little cut-out stars -->
   <path d="${floorShadePath}" fill="#cfa66c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${146 + i * 30} 68 L ${70 + i * 60} 326" stroke="#b58a50" stroke-width="3.5"/>`).join('')}
   ${[[150, 150, 14], [290, 140, 12], [220, 230, 16], [110, 270, 11], [330, 268, 12]].map(([x, y, r]) => `<path d="${starPath(x, y, r)}" fill="#a07a44"/>`).join('')}
   <rect x="22" y="318" width="396" height="26" rx="13" fill="#c9954a" stroke="${INK}" stroke-width="5"/>
   <rect x="118" y="52" width="204" height="20" rx="10" fill="#c9954a" stroke="${INK}" stroke-width="5"/>
   <!-- pull chain -->
   ${Array.from({ length: 7 }, (_, i) => `<circle cx="318" cy="${352 + i * 13}" r="4.5" fill="#e8c36a" stroke="${INK}" stroke-width="2"/>`).join('')}
   <circle cx="318" cy="454" r="11" fill="#e8c36a" stroke="${INK}" stroke-width="4"/>`,
  { cut: 5 },
)

/** The floor lamp's shade, lit (same box as the lamp): faded over the dim one. */
export const floorLampLit = svgDoc(
  440,
  1000,
  `<linearGradient id="flt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffe19a"/></linearGradient>
   <path d="${floorShadePath}" fill="url(#flt)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${146 + i * 30} 68 L ${70 + i * 60} 326" stroke="#f4d27a" stroke-width="3.5"/>`).join('')}
   ${[[150, 150, 14], [290, 140, 12], [220, 230, 16], [110, 270, 11], [330, 268, 12]].map(([x, y, r]) => `<path d="${starPath(x, y, r)}" fill="#ffd04a"/>`).join('')}
   <rect x="22" y="318" width="396" height="26" rx="13" fill="#ffd27a" stroke="${INK}" stroke-width="5"/>
   <ellipse cx="220" cy="334" rx="120" ry="12" fill="#fffbe6"/>`,
  { grain: 0 },
)

/** Moonlight on the floor: the window's four panes, soft-edged, white (330×300). */
export const moonPanes = svgDoc(
  330,
  300,
  `<filter id="mpb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
   <g filter="url(#mpb)" fill="#fff">
     <rect x="14" y="14" width="143" height="127" rx="4"/><rect x="173" y="14" width="143" height="127" rx="4"/>
     <rect x="14" y="157" width="143" height="129" rx="4"/><rect x="173" y="157" width="143" height="129" rx="4"/>
   </g>`,
  { grain: 0 },
)

/** A wooden toy chest — the toys are all put away (640×470). */
export const toyChest = svgDoc(
  640,
  470,
  `<!-- stack of tidy blocks on the lid -->
   ${[
     [200, 66, '#e8322b', 'M'],
     [262, 66, '#3a6fd8', 'I'],
     [324, 66, '#f4c542', 'L'],
     [386, 66, '#2f9a4a', 'O'],
   ]
     .map(
       ([x, y, c, l]) => `<rect x="${x}" y="${y}" width="58" height="58" rx="5" fill="${c}" stroke="${INK}" stroke-width="4"/><text x="${(x as number) + 29}" y="${(y as number) + 43}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="38" fill="#fff">${l}</text>`,
     )
     .join('')}
   <!-- feet + body -->
   ${[70, 540].map((x) => `<rect x="${x}" y="418" width="40" height="46" rx="8" fill="#6a4426" stroke="${INK}" stroke-width="5"/>`).join('')}
   <rect x="40" y="220" width="560" height="214" rx="14" fill="#c48a4c" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 5 }, (_, i) => `<path d="M${56 + i * 112} 232 L ${56 + i * 112} 424" stroke="#a8703a" stroke-width="4"/>`).join('')}
   ${woodGrain(52, 240, 536, 180, '#a8703a', 31, 6)}
   <!-- domed lid -->
   <path d="M30 228 Q 36 124 120 118 L 520 118 Q 604 124 610 228 Z" fill="#d39a5a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M60 210 Q 66 146 126 140 L 300 140" stroke="#ecc08a" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/>
   <!-- iron straps + studs + lock -->
   ${[130, 490].map((x) => `<rect x="${x - 20}" y="118" width="40" height="316" fill="#5d646c" stroke="${INK}" stroke-width="5"/>${[150, 200, 250, 300, 350, 400].map((y) => `<circle cx="${x}" cy="${y}" r="5" fill="#8a929c"/>`).join('')}`).join('')}
   <rect x="36" y="214" width="568" height="24" rx="8" fill="#6a4426" stroke="${INK}" stroke-width="5"/>
   <rect x="290" y="206" width="60" height="62" rx="10" fill="#e9c25a" stroke="${INK}" stroke-width="5"/><circle cx="320" cy="232" r="9" fill="${INK}"/><rect x="316" y="236" width="8" height="18" fill="${INK}"/>
   <!-- name plate -->
   <rect x="200" y="300" width="240" height="84" rx="12" fill="#fdf3d8" stroke="${INK}" stroke-width="5"/>
   <text x="320" y="360" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="58" fill="#c9524a" letter-spacing="6">TOYS</text>
   <!-- a sock-tail poking out -->
   <path d="M584 232 Q 626 238 618 268 Q 608 286 590 270" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round"/>
   <path d="M584 232 Q 626 238 618 268 Q 608 286 590 270" stroke="#e8727a" stroke-width="13" fill="none" stroke-linecap="round"/>`,
  { cut: 5 },
)

/* ---------------------------------------------------------- mobile -- */

export const MOBILE = { w: 0.7, h: 0.7 } // art 700 × 700

export const starMobile = svgDoc(
  700,
  700,
  `<!-- ceiling rose + cord -->
   <ellipse cx="350" cy="14" rx="46" ry="12" fill="#f3efe4" stroke="${INK}" stroke-width="4"/>
   <path d="M350 24 L 350 110" stroke="${INK}" stroke-width="7"/><path d="M350 24 L 350 110" stroke="#e8d6a0" stroke-width="3"/>
   <!-- wooden bar -->
   <rect x="70" y="104" width="560" height="26" rx="13" fill="#d9a05a" stroke="${INK}" stroke-width="5"/>
   <rect x="80" y="108" width="540" height="7" rx="3.5" fill="#f0c88a" opacity=".8"/>
   <circle cx="350" cy="117" r="14" fill="#a8683c" stroke="${INK}" stroke-width="4"/>
   <!-- strings -->
   ${[[90, 330], [230, 450], [470, 430], [610, 300]].map(([x, y]) => `<path d="M${x} 128 L ${x} ${y}" stroke="${INK}" stroke-width="6"/><path d="M${x} 128 L ${x} ${y}" stroke="#f4ead0" stroke-width="3"/>`).join('')}
   <!-- the sleepy crescent moon in the middle -->
   <path d="M350 130 L 350 360" stroke="${INK}" stroke-width="6"/><path d="M350 130 L 350 360" stroke="#f4ead0" stroke-width="3"/>
   <g transform="translate(350 360)">
     <path d="M-6 0 C -92 6 -94 150 -6 196 C 60 186 100 120 60 70 C 28 126 -40 112 -52 56 C -60 20 -34 4 -6 0 Z" fill="#ffe9a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M-62 60 C -66 100 -40 150 -4 178" stroke="#f4c542" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
     <path d="M-50 100 q 10 10 20 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
     <circle cx="-48" cy="122" r="8" fill="#f4a0a0" opacity=".6"/>
     <path d="M-30 150 q 10 8 20 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
   </g>
   <!-- bead on each string -->
   ${[[90, 330], [230, 450], [470, 430], [610, 300]].map(([x, y]) => `<circle cx="${x}" cy="${(y as number) - 4}" r="8" fill="#e8727a" stroke="${INK}" stroke-width="3.5"/>`).join('')}`,
  { cut: 5 },
)

/** A sleepy star with a little smile; `lit` is the glowing version. */
export const sleepyStar = (fill = '#ffd34d', stroke = '#e9a23b') =>
  svgDoc(
    200,
    200,
    `<path d="${starPath(100, 104, 92, 48)}" fill="${stroke}" stroke="${stroke}" stroke-width="16" stroke-linejoin="round"/>
     <path d="${starPath(100, 104, 92, 48)}" fill="${fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="${starPath(100, 108, 52, 28)}" fill="#fff6c8" opacity=".6"/>
     <path d="M70 100 q 10 10 20 0 M112 100 q 10 10 20 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M88 122 q 12 12 24 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <circle cx="66" cy="120" r="9" fill="#f08a7e" opacity=".55"/><circle cx="134" cy="120" r="9" fill="#f08a7e" opacity=".55"/>`,
    { cut: 6 },
  )

/** Glow-in-the-dark stars stuck on the wall: pale by day… */
export const glowStarOff = svgDoc(
  100,
  100,
  `<path d="${starPath(50, 52, 44, 20)}" fill="#dfe8a0" stroke="#aebc66" stroke-width="4" stroke-linejoin="round"/>
   <path d="${starPath(50, 54, 22, 10)}" fill="#f2f6c8" opacity=".8"/>`,
  { cut: 3 },
)
/** …and glowing at night. */
export const glowStarOn = svgDoc(
  100,
  100,
  `<path d="${starPath(50, 52, 44, 20)}" fill="#f6ffb0" stroke="#d8ff6a" stroke-width="5" stroke-linejoin="round"/>
   <path d="${starPath(50, 54, 24, 11)}" fill="#ffffff"/>`,
  { grain: 0 },
)

export const zzz = (() => {
  const Z = (x: number, y: number, s: number) =>
    `<path d="M${x} ${y} l ${s} 0 l ${-s} ${s} l ${s} 0" stroke="${INK}" stroke-width="${s * 0.42}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
     <path d="M${x} ${y} l ${s} 0 l ${-s} ${s} l ${s} 0" stroke="#e4e9ff" stroke-width="${s * 0.2}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`
  return svgDoc(170, 170, `${Z(10, 110, 34)}${Z(62, 58, 44)}${Z(116, 8, 40)}`, { grain: 0 })
})()

export const homeFont = FONT
