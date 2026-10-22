import { svgDoc } from './texture'
import { starPath } from './kit'
import { INK, limb, rand } from './style'
import { at, hardHat } from './tools'

/*
 * Art for spread 3 "Dig, dig, dig!": the printed page, the back panel, the
 * excavator (built from many pieces), the dump truck, the dirt pile and props.
 * Everything here is SVG strings; digging.tsx wires them to pop-ups.
 */

export const YEL = '#f5b700'
export const YEL_D = '#d99a00'
export const YEL_L = '#ffe27a'
export const DIRT = '#c98b4a'
export const DIRT_D = '#a56a33'
export const DIRT_L = '#e0ae6e'
const STEEL = '#9aa3ad'
const STEEL_HI = '#d4dae0'
const STEEL_SH = '#6f7882'
const FONT = `Fredoka, 'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif`

const bolt = (x: number, y: number, r = 6) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${STEEL}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.34}" fill="#fff" opacity=".65"/>`

const bolts = (pts: number[][], r = 6) => pts.map(([x, y]) => bolt(x, y, r)).join('')

export const rock = (x: number, y: number, s: number, fill = '#a9a6a0', shade = '#86837d', rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-44 14 Q -52 -22 -14 -36 Q 24 -48 44 -14 Q 56 16 32 28 Q -6 38 -44 14 Z" fill="${fill}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M-34 16 Q 0 32 36 20 Q 44 6 32 0 Q 2 18 -34 16 Z" fill="${shade}"/>
    <path d="M-22 -14 Q -8 -30 14 -30" stroke="#fff" stroke-width="5" opacity=".45" fill="none" stroke-linecap="round"/>
    <path d="M6 -8 L 14 6 L 8 14" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`

const tuft = (x: number, y: number, s: number, c = '#5fae4a') =>
  `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-16 0 Q -22 -26 -30 -40 Q -14 -26 -6 0 Z M-6 0 Q -6 -34 -4 -52 Q 6 -32 6 0 Z M6 0 Q 14 -26 28 -42 Q 20 -20 16 0 Z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </g>`

export const cone = (s = 1) =>
  `<g transform="scale(${s})">
    <path d="M10 296 L 190 296 L 190 270 L 10 270 Z" fill="#2f3036" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M42 272 L 88 24 Q 100 4 112 24 L 158 272 Z" fill="#ff7a1a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M62 170 L 138 170 L 146 212 L 54 212 Z" fill="#fff7e6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78 84 L 122 84 L 130 126 L 70 126 Z" fill="#fff7e6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M58 262 L 76 262 L 108 40 L 96 36 Z" fill="#fff" opacity=".35"/>
    <path d="M142 262 L 158 262 L 118 40 Z" fill="#c0500a" opacity=".5"/>
    <path d="M10 284 L 190 284" stroke="#000" stroke-width="4" opacity=".25"/>
  </g>`

/* ------------------------------------------------------------------ the printed spread -- */

function crossSection() {
  const r = rand(77)
  const wave = (y: number, a: number, seed: number) => {
    const q = rand(seed)
    let d = `M0 ${y}`
    for (let x = 0; x < 2560; x += 160) d += ` Q ${x + 80} ${(y + (q() - 0.5) * a).toFixed(0)} ${x + 160} ${(y + (q() - 0.5) * a * 0.5).toFixed(0)}`
    return d
  }
  const layer = (y: number, a: number, seed: number, fill: string) => `<path d="${wave(y, a, seed)} L 2560 1760 L 0 1760 Z" fill="${fill}"/>`
  const root = (x: number, y: number, len: number, bend: number) =>
    limb(`M${x} ${y} Q ${x + bend} ${y + len * 0.5} ${x + bend * 0.4} ${y + len}`, '#e6c590', 9, 3) +
    limb(`M${x + bend * 0.5} ${y + len * 0.5} Q ${x + bend * 1.6} ${y + len * 0.7} ${x + bend * 1.8} ${y + len * 0.9}`, '#e6c590', 6, 2.5)
  const worm = (x: number, y: number, flip = 1) => {
    const d = `M${x} ${y} q ${30 * flip} -34 ${60 * flip} -8 t ${60 * flip} 4 t ${50 * flip} -10`
    const segs = Array.from({ length: 9 }, (_, i) => `<path d="M${x + i * 20 * flip} ${y - 12 + (i % 2) * 8} l 4 14" stroke="#d9708a" stroke-width="3"/>`).join('')
    return `${limb(d, '#f4a3b6', 15, 3.5)}${segs}
      <circle cx="${x + 170 * flip}" cy="${y - 14}" r="14" fill="#f4a3b6" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="${x + 174 * flip}" cy="${y - 18}" r="3.4" fill="${INK}"/><circle cx="${x + 163 * flip}" cy="${y - 18}" r="3.4" fill="${INK}"/>
      <path d="M${x + 164 * flip} ${y - 9} q 6 6 12 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
  }
  const bone = (x: number, y: number, len: number, rot: number) => {
    const h = len / 2
    return `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M${-h + 20} -13 Q 0 -4 ${h - 20} -13 L ${h - 20} 13 Q 0 4 ${-h + 20} 13 Z" fill="#f7efd6" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      ${[[-h + 12, -16], [-h + 12, 16], [h - 12, -16], [h - 12, 16]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="19" fill="#f7efd6" stroke="${INK}" stroke-width="4.5"/>`).join('')}
      ${[[-h + 12, -16], [-h + 12, 16], [h - 12, -16], [h - 12, 16]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="15" fill="#f7efd6"/>`).join('')}
      <path d="M${-h + 34} -5 Q 0 -1 ${h - 34} -5" stroke="#e2d3a6" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${-h + 6} -24 q 8 -6 16 -2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`
  }
  const ammonite = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="#e8c88a" stroke="${INK}" stroke-width="4"/>
     <path d="M0 0 Q 6 -6 10 0 Q 12 12 0 14 Q -18 14 -18 -2 Q -16 -22 4 -24 Q 26 -22 26 0" stroke="#a9763a" stroke-width="4" fill="none" stroke-linecap="round"/></g>`
  const gem = (x: number, y: number, c: string, c2: string) =>
    `<g transform="translate(${x} ${y})"><path d="M-22 -8 L -10 -24 L 10 -24 L 22 -8 L 0 24 Z" fill="${c}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
     <path d="M-22 -8 L 22 -8 M-10 -24 L -4 -8 L 0 24 L 4 -8 L 10 -24" stroke="${c2}" stroke-width="2.5" fill="none"/><path d="M-12 -18 L -6 -20" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`
  const pebbles = Array.from({ length: 70 }, () => {
    const x = r() * 2560
    const y = 1500 + r() * 250
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(3 + r() * 5).toFixed(1)}" ry="${(2 + r() * 3).toFixed(1)}" fill="${y > 1660 ? '#b99a62' : '#6d4422'}" opacity=".7"/>`
  }).join('')
  return `
    ${layer(1478, 20, 5, '#6cb84f')}
    ${layer(1512, 26, 9, '#7a4c26')}
    ${layer(1590, 26, 11, '#b97639')}
    ${layer(1662, 22, 13, '#dfc088')}
    ${layer(1722, 16, 17, '#8f9199')}
    ${pebbles}
    <path d="${wave(1512, 26, 9)}" stroke="${INK}" stroke-width="5" fill="none"/>
    <path d="${wave(1590, 26, 11)}" stroke="${INK}" stroke-width="4" fill="none" opacity=".6"/>
    <path d="${wave(1662, 22, 13)}" stroke="${INK}" stroke-width="4" fill="none" opacity=".6"/>
    <path d="${wave(1722, 16, 17)}" stroke="${INK}" stroke-width="4" fill="none" opacity=".6"/>
    ${[260, 640, 1010, 1420, 1830, 2230, 2470].map((x, i) => root(x, 1500, 70 + (i % 3) * 24, (i % 2 ? 1 : -1) * 22)).join('')}
    ${worm(1380, 1560)}${worm(2290, 1620, -1)}
    ${rock(520, 1640, 0.85)}${rock(1130, 1690, 0.7, '#9b8f86', '#7a6f66')}${rock(2430, 1560, 0.6)}${rock(760, 1745, 0.8, '#7f8189', '#62646c')}${rock(1560, 1752, 0.7, '#7f8189', '#62646c')}
    ${bone(1900, 1668, 330, -6)}
    ${[[1790, 1722, -40], [1870, 1730, -20], [1960, 1736, 10], [2040, 1726, 36]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 Q 40 -8 66 6" stroke="${INK}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M0 0 Q 40 -8 66 6" stroke="#f7efd6" stroke-width="12" fill="none" stroke-linecap="round"/></g>`).join('')}
    ${ammonite(1230, 1712, 0.9)}${ammonite(660, 1566, 0.7)}
    ${gem(2150, 1690, '#4fc3f7', '#2b8bb8')}${gem(330, 1700, '#ff6f8f', '#c23a5e')}
    <g transform="translate(1500 1620)"><circle r="22" fill="#ffd34d" stroke="${INK}" stroke-width="4"/><path d="${starPath(0, 0, 12, 5)}" fill="#e0a400"/></g>
    <!-- grass lip + tufts -->
    ${Array.from({ length: 30 }, (_, i) => tuft(40 + i * 86 + (i % 3) * 14, 1484, 0.5 + (i % 4) * 0.08)).join('')}`
}

export const digSpreadArt = (() => {
  const r = rand(33)
  const blotches = Array.from({ length: 58 }, () => {
    const x = r() * 2560
    const y = 280 + r() * 1180
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(70 + r() * 190).toFixed(0)}" ry="${(18 + r() * 52).toFixed(0)}" fill="${r() < 0.5 ? '#c07f40' : '#dfae70'}" opacity=".5"/>`
  }).join('')
  const pebs = Array.from({ length: 160 }, () => {
    const x = r() * 2560
    const y = 300 + r() * 1140
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(3 + r() * 6).toFixed(1)}" ry="${(2 + r() * 3.5).toFixed(1)}" fill="${r() < 0.5 ? '#8a5a2e' : '#f0cf96'}" opacity=".75"/>`
  }).join('')
  const rocks = [
    [180, 520, 0.8], [2380, 480, 0.9], [1700, 880, 0.55], [820, 1180, 0.6], [2300, 1250, 0.8], [1450, 1330, 0.5], [2480, 900, 0.5], [120, 1010, 0.7], [1020, 420, 0.5],
  ]
    .map(([x, y, s], i) => rock(x, y, s, i % 2 ? '#a9a6a0' : '#b5a99a', i % 2 ? '#86837d' : '#948679', i * 40))
    .join('')
  const grass = Array.from({ length: 22 }, () => tuft(r() * 2560, 330 + r() * 1100, 0.5 + r() * 0.35, '#7dbb55')).join('')
  const treads = (d: string, dx: number) =>
    `<g transform="translate(${dx} 0)"><path d="${d}" stroke="#b27a3d" stroke-width="70" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="${d}" stroke="#92602c" stroke-width="70" fill="none" stroke-dasharray="8 20" opacity=".85"/>
      <path d="${d}" stroke="#7a4d22" stroke-width="3" fill="none" transform="translate(-30 0)" opacity=".5"/><path d="${d}" stroke="#7a4d22" stroke-width="3" fill="none" transform="translate(30 0)" opacity=".5"/></g>`
  const trackPath = 'M120 1360 C 420 1180 640 1020 880 900 S 1180 660 1320 560'
  const steps = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7
    const x = 480 + t * 820 + (i % 2) * 36
    const y = 1230 - t * 420 + (i % 2) * 12
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(-24)"><rect width="58" height="36" rx="12" fill="#5aa6b6" opacity=".45"/><rect x="8" y="6" width="42" height="8" rx="4" fill="#fff" opacity=".3"/></g>`
  }).join('')
  const cloud = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="120" ry="40"/><circle cx="-40" cy="-30" r="44"/><circle cx="30" cy="-44" r="56"/><circle cx="80" cy="-16" r="36"/></g>`
  return svgDoc(
    2560,
    1760,
    `<linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76c2f2"/><stop offset="1" stop-color="#ffeabf"/></linearGradient>
     <radialGradient id="dsun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
     <clipPath id="dground"><rect y="250" width="2560" height="1230"/></clipPath>
     <!-- sky strip, far hills, site fence -->
     <rect width="2560" height="330" fill="url(#dsky)"/>
     <circle cx="2250" cy="110" r="150" fill="url(#dsun)"/><circle cx="2250" cy="110" r="52" fill="#fff2b0" stroke="#f6c64a" stroke-width="5"/>
     ${cloud(420, 110, 1)}${cloud(1180, 70, 0.8)}${cloud(1700, 150, 0.9)}
     <path d="M0 330 Q 160 210 360 250 Q 560 160 780 260 Q 1000 200 1240 270 Q 1500 190 1740 260 Q 1980 210 2200 270 Q 2400 220 2560 290 L 2560 340 L 0 340 Z" fill="#9ccb7a" stroke="${INK}" stroke-width="4"/>
     <path d="M0 360 Q 300 290 640 330 Q 980 280 1320 340 Q 1700 290 2040 340 Q 2300 300 2560 340 L 2560 380 L 0 380 Z" fill="#7fb65f" stroke="${INK}" stroke-width="4"/>
     <!-- the dirt -->
     <g clip-path="url(#dground)">
       <rect y="330" width="2560" height="1150" fill="${DIRT}"/>
       ${blotches}${pebs}
       <!-- far fence line -->
       <rect y="350" width="2560" height="22" fill="#ffb02e" stroke="${INK}" stroke-width="4"/>
       ${Array.from({ length: 52 }, (_, i) => `<path d="M${i * 52 - 26} 372 L ${i * 52 + 26} 350" stroke="#fff" stroke-width="12" opacity=".8"/>`).join('')}
       ${treads(trackPath, 0)}${treads(trackPath, 128)}
       <ellipse cx="1330" cy="590" rx="360" ry="70" fill="#9a6430" opacity=".45"/>
       ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${1000 + i * 60} 640 l 60 -12" stroke="#7a4d22" stroke-width="14" opacity=".35"/>`).join('')}
       ${steps}
       ${rocks}
       ${grass}
       <!-- the hole under the dirt pile -->
       <ellipse cx="2080" cy="648" rx="300" ry="104" fill="#e8bb7c" stroke="${INK}" stroke-width="5"/>
       <ellipse cx="2080" cy="652" rx="262" ry="82" fill="#a56a33" stroke="${INK}" stroke-width="5"/>
       <ellipse cx="2080" cy="656" rx="214" ry="62" fill="#6d4422"/>
       <ellipse cx="2080" cy="660" rx="150" ry="40" fill="#3f2814"/>
       <path d="M1940 640 Q 2080 690 2220 640" stroke="#8f5e30" stroke-width="5" fill="none" opacity=".6"/>
       ${[[1850, 596], [1980, 560], [2200, 566], [2320, 616], [1830, 690], [2330, 700]].map(([x, y], i) => rock(x, y, 0.32 + (i % 3) * 0.08, '#b5a99a', '#948679', i * 55)).join('')}
       <!-- a dotted trail leading off the right edge -->
       <path d="M2260 750 C 2340 830 2420 800 2470 900 S 2530 990 2540 1060" stroke="#ff8a1a" stroke-width="12" stroke-dasharray="4 26" stroke-linecap="round" fill="none"/>
       <path d="M2500 1030 L 2546 1090 L 2478 1086" stroke="#ff8a1a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
     </g>
     <!-- hazard tape along the front -->
     <g><rect y="1432" width="2560" height="44" fill="#ffd21a"/>
       ${Array.from({ length: 52 }, (_, i) => `<path d="M${i * 60} 1476 L ${i * 60 + 30} 1432 L ${i * 60 + 54} 1432 L ${i * 60 + 24} 1476 Z" fill="#2b2b2b"/>`).join('')}
       <rect y="1432" width="2560" height="44" fill="none" stroke="${INK}" stroke-width="4"/></g>
     ${crossSection()}`,
  )
})()

/* -------------------------------------------------------------------- back layer -- */

export const backPanel = (() => {
  const W = 2600
  const H = 1050
  const bunting = Array.from({ length: 16 }, (_, i) => {
    const x = 560 + i * 98
    const sag = Math.sin((i / 15) * Math.PI) * 54
    const c = ['#ff7a1a', '#f5b700', '#e8322b', '#3a8bd8'][i % 4]
    return `<path d="M${x} ${196 + sag} l 84 0 l -42 74 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
  }).join('')
  const strata = (cx: number, cy: number, rx: number) =>
    [0.82, 0.62, 0.42].map((k, i) => `<path d="M${cx - rx * k} ${cy + 150 + i * 20} Q ${cx} ${cy + 60 - i * 40} ${cx + rx * k} ${cy + 150 + i * 20}" stroke="${['#b57a3e', '#9d672f', '#e5b373'][i]}" stroke-width="12" fill="none" opacity=".7"/>`).join('')
  const post = (x: number) => `<rect x="${x - 22}" y="150" width="44" height="560" fill="#c98e4e" stroke="${INK}" stroke-width="6"/><path d="M${x - 8} 160 L ${x - 8} 700" stroke="#a8743f" stroke-width="5"/><rect x="${x - 34}" y="134" width="68" height="30" rx="8" fill="#b57a3e" stroke="${INK}" stroke-width="5"/>`
  const meshFence = (x0: number, x1: number) => {
    const n = Math.floor((x1 - x0) / 60)
    return `<rect x="${x0}" y="820" width="${x1 - x0}" height="170" fill="#ff8a1a" stroke="${INK}" stroke-width="6"/>
      ${Array.from({ length: n + 3 }, (_, i) => `<path d="M${x0 + i * 60 - 80} 820 L ${x0 + i * 60 + 10} 990 M${x0 + i * 60 + 100} 820 L ${x0 + i * 60 + 10} 990" stroke="#c55a08" stroke-width="5" opacity=".8"/>`).join('')}
      <rect x="${x0}" y="820" width="${x1 - x0}" height="28" fill="#ff9d3d" stroke="${INK}" stroke-width="5"/>
      ${Array.from({ length: Math.floor((x1 - x0) / 330) + 1 }, (_, i) => `<rect x="${x0 + 10 + i * 330}" y="790" width="22" height="230" rx="6" fill="#fdfbf5" stroke="${INK}" stroke-width="5"/>`).join('')}`
  }
  return svgDoc(
    W,
    H,
    `<clipPath id="bpc"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>
     <!-- far green hill -->
     <path d="M0 640 Q 200 440 480 470 Q 760 390 1020 480 Q 1300 420 1560 500 Q 1860 400 2140 470 Q 2400 430 2600 560 L 2600 1050 L 0 1050 Z" fill="#9ccb7a" stroke="${INK}" stroke-width="6"/>
     <path d="M0 640 Q 200 440 480 470 Q 760 390 1020 480" stroke="#c8e8a6" stroke-width="8" fill="none" opacity=".8"/>
     <!-- dirt mounds with strata -->
     <path d="M0 1050 L 0 640 Q 140 520 330 560 Q 520 600 640 760 Q 780 820 820 1050 Z" fill="#dba468" stroke="${INK}" stroke-width="6"/>
     ${strata(330, 560, 300)}
     <path d="M1700 1050 Q 1760 700 1920 500 Q 2080 380 2260 520 Q 2420 640 2600 700 L 2600 1050 Z" fill="#dba468" stroke="${INK}" stroke-width="6"/>
     ${strata(2100, 520, 420)}
     <path d="M1960 560 Q 2060 520 2160 560" stroke="#fff3c8" stroke-width="8" fill="none" opacity=".7"/>
     <!-- a buried bone sticking out of the right mound -->
     <g transform="translate(2300 640) rotate(-28)"><rect x="-110" y="-12" width="220" height="24" rx="10" fill="#f7efd6" stroke="${INK}" stroke-width="5"/>
       ${[[-110, -16], [-110, 16], [110, -16], [110, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#f7efd6" stroke="${INK}" stroke-width="5"/>`).join('')}
       ${[[-110, -16], [-110, 16], [110, -16], [110, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#f7efd6"/>`).join('')}</g>
     <rect x="2236" y="560" width="200" height="150" fill="#dba468" opacity="0"/>
     <!-- little flag on the left mound -->
     <path d="M250 560 L 250 410" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M250 560 L 250 410" stroke="#d6dbe0" stroke-width="6" stroke-linecap="round"/>
     <path d="M254 412 Q 310 396 360 420 Q 320 444 360 470 Q 306 452 254 474 Z" fill="#e8322b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <!-- the sign gantry -->
     ${post(820)}${post(1780)}
     <path d="M800 196 Q 1300 270 1800 196" stroke="${INK}" stroke-width="7" fill="none"/>
     ${bunting}
     <g transform="translate(1300 360)">
       <path d="M-380 -20 L -300 -80 M380 -20 L 300 -80" stroke="${INK}" stroke-width="6"/>
       <rect x="-470" y="-30" width="940" height="260" rx="26" fill="#f5b700" stroke="${INK}" stroke-width="8"/>
       <rect x="-452" y="-12" width="904" height="224" rx="16" fill="none" stroke="#fff6d2" stroke-width="6" stroke-dasharray="24 14"/>
       ${Array.from({ length: 8 }, (_, i) => `<path d="M${-440 + i * 130} 216 l 50 -26 l 40 26" fill="#2b2b2b" stroke="none" opacity="0"/>`).join('')}
       <rect x="-470" y="170" width="940" height="60" rx="0" fill="#2b2b2b" opacity=".0"/>
       <text x="0" y="104" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="118" fill="#2b2b2b" letter-spacing="6" stroke="#fff6d2" stroke-width="4" paint-order="stroke">DIG SITE</text>
       <text x="0" y="190" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="62" fill="#c0361d" letter-spacing="3">- MILO'S CREW -</text>
       ${bolts([[-436, 4], [436, 4], [-436, 196], [436, 196]], 9)}
     </g>
     <g transform="translate(1300 330) scale(1.05)">${at(0, 0, 0, 0.42, hardHat())}</g>
     <!-- orange mesh fences in front -->
     ${meshFence(60, 1040)}${meshFence(1560, 2520)}
     <!-- a stack of pipes at the foot of the left mound -->
     ${[0, 1, 2].map((i) => `<g transform="translate(${960 + i * 96} 940)"><circle r="46" fill="#cfcac0" stroke="${INK}" stroke-width="6"/><circle r="30" fill="#6d4422"/><circle r="30" fill="none" stroke="#a8a396" stroke-width="5"/></g>`).join('')}
     <g transform="translate(1008 862)"><circle r="46" fill="#cfcac0" stroke="${INK}" stroke-width="6"/><circle r="30" fill="#6d4422"/></g>`,
    { cut: 5 },
  )
})()

/** A tall lattice crane behind the back panel. 520 × 1500. */
export const crane = (() => {
  const W = 700
  const H = 1500
  const mastL = 250
  const mastR = 330
  const lat = (x0: number, x1: number, y0: number, y1: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const ya = y0 + ((y1 - y0) * i) / n
      const yb = y0 + ((y1 - y0) * (i + 1)) / n
      return `<path d="M${x0} ${ya} L ${x1} ${yb} M${x1} ${ya} L ${x0} ${yb}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M${x0} ${ya} L ${x1} ${yb} M${x1} ${ya} L ${x0} ${yb}" stroke="${YEL}" stroke-width="7" stroke-linecap="round"/>`
    }).join('')
  return svgDoc(
    W,
    H,
    `<!-- mast -->
     <rect x="${mastL}" y="240" width="22" height="1220" fill="${YEL}" stroke="${INK}" stroke-width="6"/>
     <rect x="${mastR}" y="240" width="22" height="1220" fill="${YEL}" stroke="${INK}" stroke-width="6"/>
     ${lat(mastL + 22, mastR, 240, 1460, 12)}
     <rect x="200" y="1430" width="200" height="40" rx="8" fill="#6d7480" stroke="${INK}" stroke-width="6"/>
     <!-- jib (long arm) + counter jib -->
     <path d="M0 232 L 640 232 L 600 190 L 40 190 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     ${lat(60, 600, 192, 232, 12)}
     <path d="M286 100 L 40 190 M286 100 L 600 190" stroke="${INK}" stroke-width="8" fill="none"/><path d="M286 100 L 40 190 M286 100 L 600 190" stroke="#d6dbe0" stroke-width="3.5" fill="none"/>
     <path d="M262 240 L 286 100 L 310 240 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <!-- counterweights + cab -->
     <rect x="30" y="232" width="110" height="86" rx="8" fill="#5c626c" stroke="${INK}" stroke-width="6"/>
     <rect x="120" y="232" width="90" height="86" rx="8" fill="#6d7480" stroke="${INK}" stroke-width="6"/>
     ${bolts([[50, 250], [120, 250], [50, 300], [120, 300], [140, 250], [190, 250]], 6)}
     <path d="M330 232 L 330 320 L 450 320 L 450 244 L 410 232 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <rect x="350" y="252" width="80" height="48" rx="8" fill="#bfe6ff" stroke="${INK}" stroke-width="5"/>
     <path d="M362 296 L 392 256" stroke="#fff" stroke-width="7" opacity=".8" stroke-linecap="round"/>
     <circle cx="286" cy="90" r="16" fill="#e8322b" stroke="${INK}" stroke-width="5"/>
     <path d="M286 76 L 286 40" stroke="${INK}" stroke-width="8"/><path d="M286 76 L 286 40" stroke="#d6dbe0" stroke-width="3.5"/>
     <path d="M286 38 L 340 48 L 286 60 Z" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    { cut: 5 },
  )
})()

/** The hanging hook + a bundle of pipes, a swinging part of the crane. 160 × 330 */
export const craneHook = svgDoc(
  200,
  400,
  `<path d="M100 0 L 100 150" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M100 0 L 100 150" stroke="#d6dbe0" stroke-width="3.5" stroke-linecap="round"/>
   <rect x="70" y="138" width="60" height="34" rx="8" fill="#e8322b" stroke="${INK}" stroke-width="5"/>
   <path d="M100 172 Q 100 200 88 206 Q 70 214 80 232" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M100 172 Q 100 200 88 206 Q 70 214 80 232" stroke="${STEEL}" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M30 252 L 100 214 L 170 252" stroke="${INK}" stroke-width="7" fill="none" stroke-linejoin="round"/>
   ${[[48, 300], [100, 300], [152, 300], [74, 262], [126, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="#cfcac0" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="15" fill="#6d4422"/>`).join('')}
   <rect x="20" y="262" width="160" height="14" rx="6" fill="#ffb02e" stroke="${INK}" stroke-width="4"/>`,
  { cut: 4 },
)

/* ------------------------------------------------------------------------- excavator -- */

/** Excavator working units: 1 px of art = EK world units. */
export const EK = 0.00132
/** the host canvas (tracks at the bottom, transparent above = big tap area) */
export const EX = { w: 1000, h: 640, tx: 500, ty: 450 }
/** the house art; origin = turntable centre (bottom middle) */
export const HS = { w: 560, h: 380, ox: 280 }
/** the three arm pieces: pivot and tip, in art px */
export const BOOM = { w: 600, h: 240, px: 60, py: 150, len: 500 }
export const STICK = { w: 440, h: 150, px: 60, py: 75, len: 340 }
export const BUCKET = { w: 280, h: 260, px: 50, py: 50 }
/** cab window rect inside the house art */
export const WIN = { x: 316, y: 104, w: 140, h: 148 }

export const excavatorHost = svgDoc(
  EX.w,
  EX.h,
  `<!-- mud under the tracks -->
   <ellipse cx="500" cy="634" rx="360" ry="12" fill="#5d3a1c" opacity=".35"/>
   <!-- rubber belt -->
   <path d="M258 500 H 742 A 68 68 0 0 1 742 636 H 258 A 68 68 0 0 1 258 500 Z" fill="#3a3a40"/>
   <path d="M258 500 H 742 A 68 68 0 0 1 742 636 H 258 A 68 68 0 0 1 258 500 Z" fill="none" stroke="#202024" stroke-width="16" stroke-dasharray="6 14"/>
   <path d="M258 510 H 742 A 58 58 0 0 1 742 626 H 258 A 58 58 0 0 1 258 510 Z" fill="none" stroke="#5b5b63" stroke-width="4" opacity=".8"/>
   <path d="M258 500 H 742 A 68 68 0 0 1 742 636 H 258 A 68 68 0 0 1 258 500 Z" fill="none" stroke="${INK}" stroke-width="6"/>
   <path d="M300 506 H 700" stroke="#8a8a94" stroke-width="5" opacity=".5" stroke-linecap="round"/>
   <!-- track frame -->
   <rect x="232" y="522" width="536" height="56" rx="20" fill="${YEL}" stroke="${INK}" stroke-width="5"/>
   <path d="M244 560 H 756" stroke="${YEL_D}" stroke-width="12" stroke-linecap="round"/>
   <path d="M250 532 H 740" stroke="${YEL_L}" stroke-width="6" stroke-linecap="round"/>
   ${bolts([[262, 566], [330, 566], [400, 566], [470, 566], [540, 566], [610, 566], [680, 566], [740, 566]], 5)}
   <!-- sprocket + idler + road wheels -->
   ${[258, 742].map((x) => `<circle cx="${x}" cy="568" r="46" fill="#8d949c" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="568" r="26" fill="${YEL}" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="568" r="9" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${(x + Math.cos((i / 6) * 6.283) * 36).toFixed(1)}" cy="${(568 + Math.sin((i / 6) * 6.283) * 36).toFixed(1)}" r="4" fill="#5c626c"/>`).join('')}`).join('')}
   ${[340, 420, 500, 580, 660].map((x) => `<circle cx="${x}" cy="598" r="25" fill="#7b828a" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="598" r="10" fill="#4b4f57" stroke="${INK}" stroke-width="3"/><path d="M${x - 14} 584 Q ${x} 576 ${x + 14} 584" stroke="#d4dae0" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
   ${[400, 600].map((x) => `<circle cx="${x}" cy="508" r="12" fill="#7b828a" stroke="${INK}" stroke-width="4"/>`).join('')}
   <!-- mud splats -->
   <g fill="#6d4422" opacity=".7"><ellipse cx="300" cy="620" rx="22" ry="8"/><ellipse cx="560" cy="626" rx="30" ry="7"/><ellipse cx="690" cy="618" rx="16" ry="6"/><circle cx="380" cy="630" r="5"/></g>
   <!-- undercarriage + turntable -->
   <path d="M306 526 L 320 476 Q 324 462 342 462 L 658 462 Q 676 462 680 476 L 694 526 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M310 508 L 690 508 L 694 526 L 306 526 Z" fill="${YEL_D}"/>
   <path d="M334 474 H 666" stroke="${YEL_L}" stroke-width="6" stroke-linecap="round"/>
   <rect x="290" y="446" width="420" height="20" rx="8" fill="#2f3036" stroke="${INK}" stroke-width="4"/>
   ${Array.from({ length: 11 }, (_, i) => bolt(316 + i * 37, 456, 4.5)).join('')}`,
  { cut: 5 },
)

/** The turning upper structure: counterweight, engine, cab with an open window. */
export const excavatorHouse = svgDoc(
  HS.w,
  HS.h,
  `<clipPath id="hoodc"><path d="M96 372 L 96 252 Q 96 232 118 232 L 300 226 Q 338 226 344 262 L 350 372 Z"/></clipPath>
   <!-- exhaust stack -->
   <rect x="176" y="156" width="28" height="100" rx="6" fill="#8b9099" stroke="${INK}" stroke-width="5"/>
   <rect x="168" y="144" width="44" height="22" rx="6" fill="#5d636b" stroke="${INK}" stroke-width="5"/>
   <path d="M182 168 L 182 250" stroke="#d4dae0" stroke-width="5" opacity=".7" stroke-linecap="round"/>
   <!-- counterweight -->
   <path d="M16 372 L 16 238 Q 16 214 42 214 L 128 214 L 140 372 Z" fill="#454850" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M30 230 L 118 230" stroke="#767b86" stroke-width="7" stroke-linecap="round"/>
   <path d="M16 330 L 140 330 L 140 372 L 16 372 Z" fill="#2f3036"/>
   ${Array.from({ length: 5 }, (_, i) => `<path d="M${20 + i * 26} 372 L ${40 + i * 26} 332 L ${58 + i * 26} 332 L ${38 + i * 26} 372 Z" fill="${YEL}"/>`).join('')}
   <path d="M16 372 L 16 238 Q 16 214 42 214 L 128 214 L 140 372 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   ${bolts([[40, 250], [110, 250], [40, 306], [112, 306]], 6)}
   <rect x="8" y="270" width="14" height="30" rx="5" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <!-- engine hood -->
   <path d="M96 372 L 96 252 Q 96 232 118 232 L 300 226 Q 338 226 344 262 L 350 372 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <g clip-path="url(#hoodc)">
     <rect x="90" y="338" width="270" height="40" fill="${YEL_D}"/>
     <path d="M108 248 Q 116 238 132 238 L 296 233" stroke="${YEL_L}" stroke-width="7" fill="none" stroke-linecap="round"/>
     ${Array.from({ length: 6 }, (_, i) => `<path d="M${124 + i * 30} 276 l 14 -24" stroke="#8a6200" stroke-width="9" stroke-linecap="round" opacity=".85"/>`).join('')}
     <path d="M102 296 H 348 M102 338 H 348" stroke="#b97f00" stroke-width="4"/>
     <path d="M226 296 V 338" stroke="#b97f00" stroke-width="4"/>
   </g>
   ${bolts([[112, 312], [212, 312], [240, 312], [334, 312], [112, 356], [334, 356]], 5.5)}
   <circle cx="168" cy="322" r="22" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="${starPath(168, 322, 14, 6)}" fill="#ff7a1a" stroke="${INK}" stroke-width="2"/>
   <rect x="262" y="300" width="42" height="26" rx="6" fill="#5d636b" stroke="${INK}" stroke-width="4"/><circle cx="283" cy="313" r="7" fill="#d4dae0" stroke="${INK}" stroke-width="3"/>
   <!-- grab rail -->
   <path d="M126 232 L 126 198 Q 126 190 134 190 L 156 190" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M126 232 L 126 198 Q 126 190 134 190 L 156 190" stroke="#d4dae0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <!-- cab with a window hole you can see through -->
   <path fill-rule="evenodd" d="M290 372 L 290 98 Q 290 78 310 78 L 452 78 Q 470 78 474 98 L 486 372 Z M316 104 L 446 104 L 456 252 L 316 252 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M298 100 Q 300 86 312 86" stroke="${YEL_L}" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path d="M316 252 L 456 252 L 460 270 L 316 270 Z" fill="${YEL_D}"/>
   <path d="M326 284 L 326 360 L 456 360 L 462 284 Z" fill="none" stroke="#b97f00" stroke-width="4"/>
   <rect x="416" y="306" width="34" height="11" rx="5.5" fill="#2f3036" stroke="${INK}" stroke-width="2.5"/>
   <path d="M296 372 L 296 356 L 330 356 L 330 372 Z" fill="#454850" stroke="${INK}" stroke-width="4"/>
   <!-- roof, lamp, wiper -->
   <rect x="268" y="52" width="236" height="32" rx="12" fill="${YEL_D}" stroke="${INK}" stroke-width="5"/>
   <path d="M284 62 H 484" stroke="${YEL_L}" stroke-width="6" stroke-linecap="round"/>
   ${bolts([[284, 72], [352, 72], [420, 72], [486, 72]], 4)}
   <rect x="474" y="34" width="36" height="22" rx="7" fill="#fff6b0" stroke="${INK}" stroke-width="4"/>
   <rect x="334" y="38" width="74" height="16" rx="6" fill="#5d636b" stroke="${INK}" stroke-width="4"/>
   <!-- boom foot bracket -->
   <path d="M436 372 L 446 298 Q 450 280 470 278 L 518 284 L 538 308 L 520 372 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M450 296 L 516 296" stroke="${YEL_L}" stroke-width="5" stroke-linecap="round"/>
   <circle cx="486" cy="312" r="23" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/><circle cx="486" cy="312" r="10" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   ${bolts([[452, 350], [510, 350], [452, 330]], 5)}`,
  { cut: 5 },
)

/** What you see through the cab window: back wall and the operator's seat. */
export const cabInterior = svgDoc(
  WIN.w,
  WIN.h,
  `<linearGradient id="cabg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd2ec"/><stop offset="1" stop-color="#e3f3fa"/></linearGradient>
   <rect width="${WIN.w}" height="${WIN.h}" fill="url(#cabg)"/>
   <path d="M0 100 L ${WIN.w} 100" stroke="#8fb8cc" stroke-width="3"/>
   <!-- seat -->
   <rect x="8" y="36" width="34" height="100" rx="14" fill="#b3342a" stroke="${INK}" stroke-width="4"/>
   <rect x="8" y="112" width="86" height="30" rx="12" fill="#c9433a" stroke="${INK}" stroke-width="4"/>
   <path d="M16 50 Q 26 44 34 52" stroke="#ec7d70" stroke-width="4" fill="none" stroke-linecap="round"/>
   <!-- console + buttons -->
   <rect x="98" y="100" width="46" height="60" rx="8" fill="#4b4f57" stroke="${INK}" stroke-width="4"/>
   ${[[110, 112, '#e8322b'], [124, 112, '#3ccf5a'], [110, 126, '#f5b700'], [124, 126, '#3a8bd8']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`).join('')}
   <!-- glass shine -->
   <path d="M20 8 L 52 8 L 8 90 L 8 52 Z" fill="#fff" opacity=".55"/>
   <path d="M64 8 L 80 8 L 28 130 L 20 130 Z" fill="#fff" opacity=".4"/>`,
  { grain: 0.6 },
)

/** Milo at the controls (head and shoulders, front view), sized to fit the window. */
export const miloAtWheel = svgDoc(
  WIN.w,
  WIN.h,
  `<!-- shoulders / tank top -->
   <path d="M20 148 Q 20 110 60 104 L 84 104 Q 120 110 120 148 Z" fill="#a0a3a8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M54 104 Q 72 122 90 104" stroke="#8c8f94" stroke-width="4" fill="none"/>
   <!-- levers -->
   <path d="M104 138 L 108 112" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M104 138 L 108 112" stroke="#9aa3ad" stroke-width="4" stroke-linecap="round"/>
   <circle cx="108" cy="108" r="9" fill="#e8322b" stroke="${INK}" stroke-width="3"/>
   <path d="M32 138 L 28 114" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M32 138 L 28 114" stroke="#9aa3ad" stroke-width="4" stroke-linecap="round"/>
   <circle cx="27" cy="110" r="9" fill="#3a8bd8" stroke="${INK}" stroke-width="3"/>
   <!-- arms -->
   ${limb('M32 124 Q 20 118 26 110', '#f6c9a4', 9, 2.8)}
   ${limb('M106 124 Q 114 118 108 108', '#f6c9a4', 9, 2.8)}
   <!-- head -->
   <rect x="58" y="92" width="24" height="16" rx="6" fill="#f0b996" stroke="${INK}" stroke-width="3.5"/>
   <circle cx="42" cy="64" r="9" fill="#f6c9a4" stroke="${INK}" stroke-width="3.5"/><circle cx="98" cy="64" r="9" fill="#f6c9a4" stroke="${INK}" stroke-width="3.5"/>
   <ellipse cx="70" cy="62" rx="33" ry="35" fill="#f6c9a4" stroke="${INK}" stroke-width="4"/>
   <path d="M38 52 Q 44 34 70 34 Q 98 34 102 54 Q 86 42 70 44 Q 52 44 38 52 Z" fill="#2b1a12" stroke="${INK}" stroke-width="2.5"/>
   <ellipse cx="57" cy="64" rx="8" ry="9.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><ellipse cx="84" cy="64" rx="8" ry="9.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
   <circle cx="59" cy="65" r="5.6" fill="#5a3418"/><circle cx="86" cy="65" r="5.6" fill="#5a3418"/>
   <circle cx="60" cy="63" r="2" fill="#fff"/><circle cx="87" cy="63" r="2" fill="#fff"/>
   <path d="M48 52 Q 57 47 65 51 M76 51 Q 84 47 93 52" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
   <ellipse cx="46" cy="78" rx="6" ry="4" fill="#f08a7a" opacity=".6"/><ellipse cx="94" cy="78" rx="6" ry="4" fill="#f08a7a" opacity=".6"/>
   <path d="M58 82 Q 70 98 84 82 Z" fill="#7a1f22" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
   <path d="M62 90 Q 71 95 80 90" stroke="#e8727a" stroke-width="3" fill="none"/>
   <!-- hard hat -->
   ${at(70, 40, 0, 0.27, hardHat())}`,
  { grain: 0.6 },
)

/** A bent boom. Pivot (60,150) → tip pin (560,150). */
export const boomArt = svgDoc(
  BOOM.w,
  BOOM.h,
  `<!-- ram eye lugs -->
   <path d="M268 50 L 276 20 Q 290 10 304 20 L 312 50 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M188 180 L 194 212 Q 208 224 222 212 L 230 180 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <!-- boom body -->
   <path d="M30 118 Q 36 98 64 94 C 150 68 214 40 290 42 C 380 46 470 88 548 116 Q 580 128 580 150 Q 580 172 548 184 C 470 186 410 170 340 158 C 280 150 210 160 150 190 Q 120 208 80 206 Q 36 204 30 180 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M78 202 Q 120 206 150 190 C 210 160 280 150 340 158 C 410 170 470 186 548 184 Q 572 178 578 164 L 546 164 C 470 164 410 148 340 142 C 270 136 210 148 150 176 Q 120 192 82 192 Z" fill="${YEL_D}"/>
   <path d="M70 108 C 150 82 214 56 290 56 C 380 60 460 98 532 124" stroke="${YEL_L}" stroke-width="8" fill="none" stroke-linecap="round"/>
   <!-- hose -->
   <path d="M120 126 C 190 96 236 74 292 76 C 378 78 448 112 520 138" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
   <path d="M120 126 C 190 96 236 74 292 76 C 378 78 448 112 520 138" stroke="#3b3b43" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="M130 120 C 196 92 238 72 290 72" stroke="#7b7b86" stroke-width="2.5" fill="none" opacity=".8"/>
   <!-- weld seams -->
   ${[170, 230, 330, 400, 470].map((x) => `<path d="M${x} ${x < 300 ? 150 : 140} l 0 18" stroke="${YEL_D}" stroke-width="5" stroke-linecap="round"/>`).join('')}
   ${bolts([[120, 168], [180, 154], [350, 150], [420, 156], [490, 164]], 5)}
   <!-- pins -->
   <circle cx="60" cy="150" r="32" fill="${STEEL}" stroke="${INK}" stroke-width="5"/><circle cx="60" cy="150" r="14" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   ${bolts([[60, 126], [84, 150], [60, 174], [36, 150]], 4)}
   <circle cx="560" cy="150" r="27" fill="${STEEL}" stroke="${INK}" stroke-width="5"/><circle cx="560" cy="150" r="11" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   <circle cx="290" cy="26" r="8" fill="#4b4f57" stroke="${INK}" stroke-width="3"/><circle cx="208" cy="204" r="8" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>`,
  { cut: 5 },
)

/** The stick (dipper). Pivot (60,75) → bucket pin (400,75). */
export const stickArt = svgDoc(
  STICK.w,
  STICK.h,
  `<path d="M84 34 L 90 8 Q 100 0 110 8 L 116 34 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M176 38 L 182 14 Q 190 8 198 14 L 204 38 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M26 46 Q 30 28 62 28 C 150 28 280 40 372 50 Q 414 54 416 75 Q 414 98 372 100 C 280 110 170 126 100 124 Q 40 124 28 106 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M100 124 C 170 126 280 110 372 100 Q 400 98 410 88 L 372 88 C 280 98 170 112 100 114 Q 60 114 34 104 Q 40 122 100 124 Z" fill="${YEL_D}"/>
   <path d="M60 36 C 150 36 280 46 372 56" stroke="${YEL_L}" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="M120 84 C 200 84 300 78 372 76" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M120 84 C 200 84 300 78 372 76" stroke="#3b3b43" stroke-width="6" fill="none" stroke-linecap="round"/>
   ${[150, 230, 310].map((x) => `<path d="M${x} 60 l 0 14" stroke="${YEL_D}" stroke-width="5" stroke-linecap="round"/>`).join('')}
   ${bolts([[130, 104], [210, 98], [290, 96], [350, 90]], 5)}
   <circle cx="60" cy="75" r="30" fill="${STEEL}" stroke="${INK}" stroke-width="5"/><circle cx="60" cy="75" r="13" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   <circle cx="400" cy="75" r="23" fill="${STEEL}" stroke="${INK}" stroke-width="5"/><circle cx="400" cy="75" r="10" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   <circle cx="100" cy="14" r="6.5" fill="#4b4f57" stroke="${INK}" stroke-width="3"/><circle cx="190" cy="20" r="6.5" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>`,
  { cut: 5 },
)

/** The digging bucket: a pie with teeth, open edge facing down-left. Pin (50,50), teeth tip (240,212), mouth centre (135,185). */
export const bucketArt = svgDoc(
  BUCKET.w,
  BUCKET.h,
  `<!-- back plate -->
   <path d="M28 40 Q 54 14 90 30 C 160 50 224 110 242 196 L 28 156 Q 8 110 28 40 Z" fill="#7e8794" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M60 28 C 140 40 214 100 234 180" stroke="#c4ccd6" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>
   <!-- side plate -->
   <path d="M50 62 C 130 66 204 120 222 188 L 52 152 Q 38 108 50 62 Z" fill="#a1abb7" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M66 78 C 120 84 170 116 194 160" stroke="#c9d1da" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
   <path d="M100 118 l 18 10 M130 136 l 14 6 M80 130 l 22 8" stroke="#7a838f" stroke-width="3" stroke-linecap="round"/>
   <!-- cutting edge + teeth -->
   <path d="M28 156 L 242 196 L 244 206 L 28 166 Z" fill="#4b4f57" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   ${[0.34, 0.54, 0.74, 0.94].map((t) => {
     const x = 28 + (242 - 28) * t
     const y = 160 + (196 - 156) * t + 4
     return `<path d="M${(x - 15).toFixed(0)} ${(y + 4).toFixed(0)} L ${(x + 14).toFixed(0)} ${(y + 8).toFixed(0)} L ${(x + 10).toFixed(0)} ${(y + 40).toFixed(0)} Z" fill="#c4ccd6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
   }).join('')}
   ${bolts([[70, 54], [112, 70], [156, 96], [192, 134], [214, 170]], 5)}
   <!-- pin boss -->
   <circle cx="50" cy="50" r="24" fill="${STEEL}" stroke="${INK}" stroke-width="5"/><circle cx="50" cy="50" r="10" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   <circle cx="26" cy="96" r="8" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>`,
  { cut: 5 },
)

/** Dirt carried in the bucket (baseline at the top; bulges downward). */
export const bucketDirt = svgDoc(
  240,
  130,
  `<path d="M10 22 Q 14 108 120 116 Q 226 108 230 22 Z" fill="#a9703a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M30 40 Q 120 70 210 40 Q 200 96 120 108 Q 44 96 30 40 Z" fill="#8a5a2e" opacity=".7"/>
   ${[[60, 54, 12], [110, 78, 9], [160, 50, 13], [190, 82, 8], [84, 96, 7]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#c58b4e" stroke="${INK}" stroke-width="3"/>`).join('')}
   <path d="M40 34 Q 80 24 118 32" stroke="#e0ae6e" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  { cut: 4 },
)

export const ramBarrel = svgDoc(
  300,
  40,
  `<rect x="4" y="6" width="292" height="28" rx="12" fill="#4f555e" stroke="${INK}" stroke-width="5"/>
   <rect x="14" y="10" width="270" height="8" rx="4" fill="#9aa3ad" opacity=".85"/>
   <rect x="250" y="4" width="18" height="32" rx="5" fill="#2f3036" stroke="${INK}" stroke-width="4"/>
   <circle cx="14" cy="20" r="11" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/><circle cx="14" cy="20" r="4" fill="#4b4f57"/>
   <path d="M60 8 L 60 32 M120 8 L 120 32" stroke="#2f3036" stroke-width="3" opacity=".5"/>`,
  { grain: 0.5 },
)

export const ramRod = svgDoc(
  300,
  24,
  `<rect x="4" y="4" width="292" height="16" rx="8" fill="#d6dbe0" stroke="${INK}" stroke-width="4"/>
   <rect x="20" y="7" width="270" height="4" rx="2" fill="#fff" opacity=".9"/>
   <circle cx="12" cy="12" r="10" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/><circle cx="12" cy="12" r="3.5" fill="#4b4f57"/>`,
  { grain: 0.5 },
)

export const beaconGlow = svgDoc(
  90,
  90,
  `<radialGradient id="bg"><stop offset="0" stop-color="#fff6b0"/><stop offset=".4" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff8a1a" stop-opacity="0"/></radialGradient>
   <circle cx="45" cy="45" r="44" fill="url(#bg)"/><ellipse cx="45" cy="52" rx="15" ry="12" fill="#ff9d1a" stroke="${INK}" stroke-width="4"/>
   <rect x="32" y="60" width="26" height="10" rx="3" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>`,
  { grain: 0 },
)

export const smokePuff = svgDoc(
  120,
  100,
  `<circle cx="60" cy="52" r="34" fill="#cfd3d8"/><circle cx="32" cy="62" r="24" fill="#cfd3d8"/><circle cx="88" cy="62" r="26" fill="#cfd3d8"/><circle cx="52" cy="34" r="22" fill="#e6e9ed"/>
   <path d="M40 80 Q 60 90 84 78" stroke="#b6bbc2" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  { grain: 0.4 },
)

/* ---------------------------------------------------------------------------- dump truck -- */

export const TK = 0.0012
export const TRUCK = { w: 780, h: 440, wheelY: 390 }
export const TRUCK_WHEELS = [
  [150, 390],
  [498, 390],
  [616, 390],
] as const

export const truckBody = svgDoc(
  TRUCK.w,
  TRUCK.h,
  `<!-- exhaust + chassis -->
   <rect x="262" y="40" width="22" height="200" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <rect x="254" y="26" width="38" height="24" rx="7" fill="#5d636b" stroke="${INK}" stroke-width="5"/>
   <rect x="60" y="318" width="690" height="52" rx="10" fill="#4d5058" stroke="${INK}" stroke-width="5"/>
   <path d="M70 332 H 740" stroke="#7b808a" stroke-width="5" stroke-linecap="round"/>
   ${bolts([[110, 346], [220, 346], [330, 346], [440, 346], [550, 346], [660, 346], [724, 346]], 5)}
   <!-- fuel tank -->
   <rect x="268" y="300" width="96" height="50" rx="22" fill="#cfd3d8" stroke="${INK}" stroke-width="5"/>
   <path d="M284 312 H 350" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
   <!-- cab -->
   <path d="M52 330 L 52 232 Q 54 188 86 166 L 134 136 Q 154 124 184 124 L 258 124 L 258 330 Z" fill="#3d7ad6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M52 296 H 258 V 330 H 52 Z" fill="#2f62b4"/>
   <path d="M66 226 Q 68 196 92 180" stroke="#7fb0f0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>
   <path d="M144 140 Q 160 132 186 132 H 250" stroke="#7fb0f0" stroke-width="7" fill="none" stroke-linecap="round"/>
   <!-- window with Robo at the wheel -->
   <path d="M92 236 L 98 196 Q 106 178 126 168 L 168 146 L 238 146 L 238 236 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="148" y="170" width="68" height="58" rx="12" fill="#7fb8c4" stroke="${INK}" stroke-width="4"/>
   <rect x="154" y="176" width="56" height="9" rx="4.5" fill="#a6d4dc"/>
   <circle cx="168" cy="200" r="11" fill="#9ff3ff" stroke="${INK}" stroke-width="3"/><circle cx="198" cy="200" r="11" fill="#9ff3ff" stroke="${INK}" stroke-width="3"/>
   <circle cx="170" cy="202" r="4.5" fill="#1d4f66"/><circle cx="200" cy="202" r="4.5" fill="#1d4f66"/>
   <path d="M168 218 Q 183 226 198 218" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
   <path d="M182 170 L 182 156" stroke="${INK}" stroke-width="4"/><circle cx="182" cy="152" r="6" fill="#e8322b" stroke="${INK}" stroke-width="3"/>
   <path d="M104 210 L 130 176 M120 228 L 150 188" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>
   <!-- door, handle, mirror, step -->
   <path d="M150 244 L 150 322 L 250 322 L 250 244 Z" fill="none" stroke="#2a5ea6" stroke-width="4"/>
   <rect x="214" y="262" width="30" height="10" rx="5" fill="#d4dae0" stroke="${INK}" stroke-width="3"/>
   <path d="M64 170 L 40 166 L 40 214 L 62 214" stroke="${INK}" stroke-width="5" fill="#3b4048" stroke-linejoin="round"/>
   <rect x="96" y="326" width="70" height="14" rx="4" fill="#cfd3d8" stroke="${INK}" stroke-width="4"/>
   <!-- front: grille, headlight, bumper -->
   <rect x="28" y="266" width="38" height="68" rx="8" fill="#d4dae0" stroke="${INK}" stroke-width="5"/>
   ${[0, 1, 2, 3].map((i) => `<path d="M34 ${276 + i * 14} H 60" stroke="${STEEL_SH}" stroke-width="4"/>`).join('')}
   <circle cx="62" cy="248" r="15" fill="#fff6b0" stroke="${INK}" stroke-width="4.5"/><circle cx="58" cy="244" r="5" fill="#fff"/>
   <rect x="14" y="326" width="62" height="20" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <!-- rear light, hitch -->
   <rect x="738" y="322" width="20" height="30" rx="6" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <!-- hoist ram under the bed -->
   <path d="M470 318 L 612 258" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M470 318 L 612 258" stroke="#8d949c" stroke-width="12" stroke-linecap="round"/>
   <!-- mud flaps -->
   <rect x="700" y="352" width="14" height="52" rx="4" fill="#2f3036" stroke="${INK}" stroke-width="4"/>`,
  { cut: 5 },
)

export const truckWheel = svgDoc(
  124,
  124,
  `<circle cx="62" cy="62" r="56" fill="#2f3036" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 12 }, (_, i) => {
     const a = (i / 12) * 6.283
     return `<path d="M${(62 + Math.cos(a) * 56).toFixed(1)} ${(62 + Math.sin(a) * 56).toFixed(1)} L ${(62 + Math.cos(a) * 46).toFixed(1)} ${(62 + Math.sin(a) * 46).toFixed(1)}" stroke="#4a4a52" stroke-width="7" stroke-linecap="round"/>`
   }).join('')}
   <circle cx="62" cy="62" r="34" fill="#cfd3d8" stroke="${INK}" stroke-width="5"/>
   <circle cx="62" cy="62" r="22" fill="#3d7ad6" stroke="${INK}" stroke-width="4"/>
   ${[0, 1, 2, 3, 4].map((i) => {
     const a = (i / 5) * 6.283
     return `<circle cx="${(62 + Math.cos(a) * 28).toFixed(1)}" cy="${(62 + Math.sin(a) * 28).toFixed(1)}" r="3.5" fill="#6f7882"/>`
   }).join('')}
   <circle cx="62" cy="62" r="7" fill="#9aa3ad" stroke="${INK}" stroke-width="3"/>
   <path d="M22 40 Q 30 22 52 14" stroke="#fff" stroke-width="6" opacity=".3" fill="none" stroke-linecap="round"/>`,
  { grain: 0.5 },
)

/** The tipping bed. Hinge at the rear bottom (470,190). */
export const BED = { w: 490, h: 210, px: 470, py: 190 }
export const truckBed = svgDoc(
  BED.w,
  BED.h,
  `<path d="M4 66 L 22 196 L 476 196 L 486 36 L 360 36 L 346 24 L 20 24 Z" fill="#e8572b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M22 160 L 476 160 L 476 196 L 22 196 Z" fill="#c4421a"/>
   <path d="M14 36 L 346 36 L 360 46 L 486 46" stroke="#ff9a6a" stroke-width="7" fill="none" stroke-linecap="round"/>
   ${Array.from({ length: 7 }, (_, i) => `<path d="M${52 + i * 64} 50 L ${58 + i * 64} 186" stroke="#b8391a" stroke-width="9" stroke-linecap="round"/><path d="M${46 + i * 64} 50 L ${52 + i * 64} 186" stroke="#ff9a6a" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('')}
   <rect x="2" y="12" width="352" height="24" rx="8" fill="#c4421a" stroke="${INK}" stroke-width="5"/>
   ${bolts([[36, 112], [440, 112], [36, 176], [440, 176], [200, 176], [300, 176]], 5.5)}
   <circle cx="470" cy="190" r="12" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/>
   <path d="M280 90 L 300 70 L 330 70 L 310 100 Z" fill="#fff6e0" opacity="0"/>
   <g transform="translate(230 98)"><circle r="26" fill="#fff6d2" stroke="${INK}" stroke-width="4"/><path d="${starPath(0, 0, 16, 7)}" fill="#f5b700" stroke="${INK}" stroke-width="2"/></g>`,
  { cut: 5 },
)

export const truckLoad = svgDoc(
  440,
  150,
  `<path d="M6 150 Q 30 70 110 54 Q 160 18 230 30 Q 300 4 350 46 Q 420 66 436 150 Z" fill="#a9703a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M40 130 Q 130 98 230 110 Q 330 96 410 130 Z" fill="#8a5a2e" opacity=".6"/>
   ${[[96, 90, 13], [170, 56, 11], [260, 52, 14], [340, 84, 10], [200, 98, 9], [300, 110, 8], [130, 120, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c58b4e" stroke="${INK}" stroke-width="3.5"/>`).join('')}
   <path d="M90 66 Q 150 38 214 44" stroke="#e0ae6e" stroke-width="7" fill="none" stroke-linecap="round"/>
   ${rock(280, 70, 0.35, '#a9a6a0', '#86837d')}`,
  { cut: 5 },
)

/* ------------------------------------------------------------------------------ dirt pile -- */

const dirtMound = (w: number, h: number, seed: number, rocks: number) => {
  const r = rand(seed)
  const pebs = Array.from({ length: 16 }, () => {
    const x = w * (0.15 + r() * 0.7)
    const y = h * (0.35 + r() * 0.55)
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(3 + r() * 5).toFixed(1)}" ry="${(2 + r() * 3).toFixed(1)}" fill="${r() < 0.5 ? '#6d4422' : '#f0cf96'}" opacity=".8"/>`
  }).join('')
  const rk = Array.from({ length: rocks }, (_, i) => rock(w * (0.25 + r() * 0.5), h * (0.5 + r() * 0.35), 0.28 + r() * 0.16, '#b5a99a', '#948679', i * 70)).join('')
  return svgDoc(
    w,
    h,
    `<path d="M4 ${h - 4} Q ${w * 0.06} ${h * 0.45} ${w * 0.3} ${h * 0.2} Q ${w * 0.5} ${h * 0.02} ${w * 0.7} ${h * 0.2} Q ${w * 0.94} ${h * 0.45} ${w - 4} ${h - 4} Z" fill="#c48240" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M${w * 0.12} ${h - 4} Q ${w * 0.3} ${h * 0.62} ${w * 0.55} ${h * 0.6} Q ${w * 0.82} ${h * 0.62} ${w * 0.9} ${h - 4} Z" fill="#a46a33" opacity=".75"/>
     <path d="M${w * 0.16} ${h * 0.46} Q ${w * 0.3} ${h * 0.2} ${w * 0.5} ${h * 0.14}" stroke="#e8bd80" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>
     ${pebs}${rk}
     <path d="M${w * 0.32} ${h * 0.5} q 14 -10 28 0 M${w * 0.6} ${h * 0.4} q 12 -8 24 0" stroke="#8a5a2e" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    { cut: 5 },
  )
}
export const PILE = { w: 680, h: 360 }
export const pileLayers = [
  { art: dirtMound(680, 230, 3, 2), w: 680, h: 230, y: 0 },
  { art: dirtMound(470, 210, 5, 1), w: 470, h: 210, y: 90 },
  { art: dirtMound(290, 170, 8, 1), w: 290, h: 170, y: 170 },
]
export const blankArt = svgDoc(4, 4, `<rect width="4" height="4" fill="none"/>`, { grain: 0 })

export const holeGlint = svgDoc(
  120,
  120,
  `<radialGradient id="gg"><stop offset="0" stop-color="#fffbe0"/><stop offset=".4" stop-color="#ffe27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
   <circle cx="60" cy="60" r="58" fill="url(#gg)"/>
   <path d="M60 6 Q 66 54 114 60 Q 66 66 60 114 Q 54 66 6 60 Q 54 54 60 6 Z" fill="#fff"/>`,
  { grain: 0 },
)

/* ------------------------------------------------------------------------ treasure map -- */

/** An unmistakable classic treasure map: torn parchment with rolled ends, a dotted trail, a BIG red X. */
const mapSheet = (() => {
  // torn top / bottom edges (deterministic), straight-ish sides under the rolls
  const r = rand(31)
  const edge = (y: number, dir: number, x0: number, x1: number) => {
    let d = ''
    const n = 14
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n
      d += ` L ${x.toFixed(0)} ${(y + dir * (i % 2 ? 7 + r() * 6 : -2 + r() * 5)).toFixed(0)}`
    }
    return d
  }
  const top = edge(26, 1, 44, 318)
  const bottomPts = edge(254, -1, 318, 44)
  return `M44 30${top} L 320 34 Q 326 140 318 252${bottomPts} Q 36 150 44 30 Z`
})()

export const treasureMap = svgDoc(
  360,
  280,
  `<defs>
     <radialGradient id="mpP" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#fdf0c2"/><stop offset=".65" stop-color="#f3d896"/><stop offset="1" stop-color="#d9a95c"/></radialGradient>
     <clipPath id="mpC"><path d="${mapSheet}"/></clipPath>
     <linearGradient id="mpR" x1="0" x2="1"><stop offset="0" stop-color="#c99a52"/><stop offset=".35" stop-color="#f6dfa2"/><stop offset=".7" stop-color="#e6c07a"/><stop offset="1" stop-color="#b98842"/></linearGradient>
   </defs>
   <!-- the sheet -->
   <path d="${mapSheet}" fill="url(#mpP)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <g clip-path="url(#mpC)">
     <path d="${mapSheet}" fill="none" stroke="#b8793a" stroke-width="22" opacity=".28"/>
     <ellipse cx="96" cy="206" rx="34" ry="22" fill="#c98f4a" opacity=".18"/><ellipse cx="292" cy="212" rx="22" ry="14" fill="#c98f4a" opacity=".2"/>
     <!-- fold creases -->
     <path d="M133 28 L 136 256 M226 28 L 223 256 M44 142 L 318 140" stroke="#a9733a" stroke-width="3" opacity=".3"/>
     <path d="M137 28 L 140 256 M227 28 L 224 256 M44 146 L 318 144" stroke="#fff8dc" stroke-width="3" opacity=".5"/>
     <!-- sea + island -->
     <path d="M104 146 Q 112 100 176 98 Q 250 92 282 130 Q 304 172 270 214 Q 220 250 150 232 Q 96 214 104 146 Z" fill="#9fd6e6" stroke="#4f9db6" stroke-width="4" stroke-linejoin="round"/>
     <path d="M118 150 Q 126 112 178 110 Q 238 106 266 134" fill="none" stroke="#d6f2f8" stroke-width="5" stroke-linecap="round" opacity=".8"/>
     <path d="M130 214 q 9 -9 18 0 t 18 0 M232 228 q 9 -9 18 0 t 18 0 M268 112 q 8 -8 16 0 t 16 0" stroke="#3f86a3" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M150 160 Q 148 130 190 128 Q 240 122 258 154 Q 268 188 232 200 Q 190 212 160 192 Q 148 180 150 160 Z" fill="#f1d48a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
     <path d="M158 166 Q 160 140 192 138 Q 232 134 246 152 Q 214 150 190 160 Q 170 168 158 166 Z" fill="#7cc35a"/>
     <path d="M168 196 Q 200 206 234 192" stroke="#d7b062" stroke-width="5" fill="none" stroke-linecap="round"/>
     <!-- hills on the mainland -->
     <path d="M52 124 L 76 82 L 94 108 L 108 90 L 130 124 Z" fill="#b7885a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
     <path d="M76 82 L 66 102 L 76 98 L 82 106 L 88 98 Z" fill="#fff" opacity=".85"/>
     <path d="M94 108 L 108 90 L 130 124 L 108 124 Z" fill="#8f6238" opacity=".55"/>
     <!-- palm tree -->
     <path d="M178 150 Q 172 128 184 108" stroke="${INK}" stroke-width="13" fill="none" stroke-linecap="round"/>
     <path d="M178 150 Q 172 128 184 108" stroke="#b5743a" stroke-width="7" fill="none" stroke-linecap="round"/>
     <g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" fill="#4eb04a">
       <path d="M184 108 Q 158 76 132 100 Q 158 106 184 116 Z"/>
       <path d="M184 108 Q 166 70 142 74 Q 158 96 184 112 Z"/>
       <path d="M184 108 Q 200 68 228 74 Q 206 96 184 112 Z"/>
       <path d="M184 108 Q 214 78 236 100 Q 210 106 184 116 Z"/>
       </g>
     <circle cx="181" cy="113" r="4.5" fill="#7a4a26" stroke="${INK}" stroke-width="2.5"/><circle cx="190" cy="114" r="4.5" fill="#7a4a26" stroke="${INK}" stroke-width="2.5"/>
     <!-- the dotted trail from the start (bottom-left) to the X -->
     <circle cx="70" cy="222" r="10" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="70" cy="222" r="4" fill="#3f86d6"/>
     <path d="M82 218 C 104 190 118 236 146 216 S 190 214 206 190 S 214 176 226 176" stroke="${INK}" stroke-width="12" fill="none" stroke-dasharray="0.1 17" stroke-linecap="round"/>
     <path d="M82 218 C 104 190 118 236 146 216 S 190 214 206 190 S 214 176 226 176" stroke="#e23a2a" stroke-width="7.5" fill="none" stroke-dasharray="0.1 17" stroke-linecap="round"/>
     <!-- the BIG red X -->
     <path d="M206 160 L 248 202 M248 160 L 206 202" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
     <path d="M206 160 L 248 202 M248 160 L 206 202" stroke="#e8281c" stroke-width="14" stroke-linecap="round"/>
     <path d="M210 163 L 224 177" stroke="#ff9a8a" stroke-width="4" stroke-linecap="round"/>
     <!-- compass rose -->
     <g transform="translate(262 70) scale(.92)">
       <circle r="30" fill="#fdf0c2" stroke="${INK}" stroke-width="4.5"/>
       <circle r="24" fill="none" stroke="#c0883f" stroke-width="2.5" stroke-dasharray="3 4"/>
       <path d="M0 -36 L 8 -8 L 36 0 L 8 8 L 0 36 L -8 8 L -36 0 L -8 -8 Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
       <path d="M0 -36 L 8 -8 L 0 0 Z M0 36 L -8 8 L 0 0 Z M36 0 L 8 8 L 0 0 Z M-36 0 L -8 -8 L 0 0 Z" fill="#3f86d6"/>
       <path d="M0 -36 L 8 -8 L 0 0 L -8 -8 Z" fill="#e8281c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
       <circle r="4.5" fill="#ffd34d" stroke="${INK}" stroke-width="2.5"/>
     </g>
     <!-- a little shark fin in the sea -->
     <path d="M112 186 Q 122 166 126 160 Q 128 176 138 186 Z" fill="#7f95a8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
     <path d="M104 190 q 8 -5 16 0 t 18 0" stroke="#3f86a3" stroke-width="3.5" fill="none" stroke-linecap="round"/>
   </g>
   <!-- rolled ends -->
   <g stroke-linejoin="round">
     <path d="M20 40 Q 20 26 34 24 L 52 24 Q 62 26 62 40 L 62 246 Q 62 260 50 262 L 32 262 Q 20 260 20 246 Z" fill="url(#mpR)" stroke="${INK}" stroke-width="5"/>
     <ellipse cx="41" cy="30" rx="21" ry="9" fill="#f9e7b0" stroke="${INK}" stroke-width="4"/>
     <path d="M41 30 m -10 0 a 10 5 0 1 1 20 0 a 6 3 0 1 1 -12 0" fill="none" stroke="#a9733a" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M28 44 L 28 244" stroke="#fff8dc" stroke-width="4" opacity=".6" stroke-linecap="round"/>
     <path d="M298 40 Q 298 26 312 24 L 330 24 Q 340 26 340 40 L 340 246 Q 340 260 328 262 L 310 262 Q 298 260 298 246 Z" fill="url(#mpR)" stroke="${INK}" stroke-width="5"/>
     <ellipse cx="319" cy="30" rx="21" ry="9" fill="#f9e7b0" stroke="${INK}" stroke-width="4"/>
     <path d="M319 30 m -10 0 a 10 5 0 1 1 20 0 a 6 3 0 1 1 -12 0" fill="none" stroke="#a9733a" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M306 44 L 306 244" stroke="#fff8dc" stroke-width="4" opacity=".6" stroke-linecap="round"/>
   </g>
   <!-- gold shine -->
   <path d="M20 8 Q 23 18 33 21 Q 23 24 20 34 Q 17 24 7 21 Q 17 18 20 8 Z" fill="#fff" stroke="#ffd34d" stroke-width="3"/>
   <path d="M342 250 Q 345 260 355 263 Q 345 266 342 276 Q 339 266 329 263 Q 339 260 342 250 Z" fill="#fff" stroke="#ffd34d" stroke-width="3"/>`,
  { cut: 5 },
)

/* ------------------------------------------------------------------------------- props -- */

export const coneArt = svgDoc(200, 310, cone(1), { cut: 5 })

export const barrier = svgDoc(
  420,
  250,
  `${[[70, 250], [350, 250]].map(([x, y]) => `<path d="M${x - 46} ${y} L ${x - 14} 120 L ${x + 14} 120 L ${x + 46} ${y} Z" fill="#fdfbf5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`).join('')}
   <rect x="14" y="42" width="392" height="62" rx="8" fill="#fdfbf5" stroke="${INK}" stroke-width="6"/>
   <clipPath id="brc"><rect x="14" y="42" width="392" height="62" rx="8"/></clipPath>
   <g clip-path="url(#brc)">${Array.from({ length: 10 }, (_, i) => `<path d="M${14 + i * 48} 104 L ${44 + i * 48} 42 L ${70 + i * 48} 42 L ${40 + i * 48} 104 Z" fill="#e8322b"/>`).join('')}</g>
   <rect x="14" y="42" width="392" height="62" rx="8" fill="none" stroke="${INK}" stroke-width="6"/>
   <rect x="14" y="52" width="392" height="10" rx="5" fill="#fff" opacity=".35"/>
   <rect x="14" y="128" width="392" height="46" rx="8" fill="#fdfbf5" stroke="${INK}" stroke-width="6"/>
   <clipPath id="brc2"><rect x="14" y="128" width="392" height="46" rx="8"/></clipPath>
   <g clip-path="url(#brc2)">${Array.from({ length: 10 }, (_, i) => `<path d="M${14 + i * 48} 174 L ${44 + i * 48} 128 L ${70 + i * 48} 128 L ${40 + i * 48} 174 Z" fill="#e8322b"/>`).join('')}</g>
   <rect x="14" y="128" width="392" height="46" rx="8" fill="none" stroke="${INK}" stroke-width="6"/>
   <!-- warning lamp -->
   <rect x="180" y="12" width="60" height="30" rx="6" fill="#4b4f57" stroke="${INK}" stroke-width="5"/>
   <path d="M186 14 Q 210 -10 234 14 Z" fill="#ffb02e" stroke="${INK}" stroke-width="4"/>`,
  { cut: 5 },
)

export const smallRock = (fill: string, shade: string) => svgDoc(130, 100, rock(65, 56, 1.05, fill, shade), { cut: 4 })

export const shovel = svgDoc(
  200,
  560,
  `<rect x="88" y="20" width="26" height="340" rx="10" fill="#d39a5a" stroke="${INK}" stroke-width="6"/>
   <path d="M96 40 L 96 340" stroke="#e8bf86" stroke-width="5" stroke-linecap="round"/>
   <path d="M64 30 Q 64 6 100 6 Q 138 6 138 30 L 138 48 Q 138 60 126 60 L 76 60 Q 64 60 64 48 Z" fill="#e8322b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M88 346 L 114 346 L 130 390 L 72 390 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M60 380 Q 40 470 76 540 Q 100 560 124 540 Q 160 470 140 380 Z" fill="#c4ccd6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M76 400 Q 66 470 92 524" stroke="#fff" stroke-width="7" opacity=".6" fill="none" stroke-linecap="round"/>
   <path d="M118 400 Q 128 470 108 520" stroke="#8d949c" stroke-width="5" opacity=".7" fill="none" stroke-linecap="round"/>`,
  { cut: 5 },
)

export const hardHatProp = svgDoc(260, 150, `${at(130, 78, 0, 0.85, hardHat())}`, { cut: 4 })

export const wheelbarrow = svgDoc(
  520,
  330,
  `<path d="M150 214 L 40 70 M200 224 L 80 70" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M150 214 L 40 70 M200 224 L 80 70" stroke="#d39a5a" stroke-width="12" stroke-linecap="round"/>
   <rect x="22" y="48" width="64" height="26" rx="10" fill="#2f3036" stroke="${INK}" stroke-width="5"/>
   <path d="M150 90 Q 300 60 480 100 Q 470 200 410 230 L 220 236 Q 160 200 150 90 Z" fill="#3a8bd8" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M170 110 Q 300 86 458 116" stroke="#8fc4f2" stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"/>
   <path d="M170 200 Q 300 214 410 218 L 410 230 L 220 236 Q 180 216 170 200 Z" fill="#2a6ab4"/>
   <!-- dirt heap -->
   <path d="M190 100 Q 230 20 320 26 Q 400 20 440 100 Z" fill="#a9703a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[[250, 80, 10], [320, 58, 12], [390, 82, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c58b4e" stroke="${INK}" stroke-width="3"/>`).join('')}
   <path d="M230 80 Q 280 44 330 46" stroke="#e0ae6e" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path d="M430 120 L 470 270 M300 236 L 360 280" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M430 120 L 470 270 M300 236 L 360 280" stroke="#7a8590" stroke-width="7" stroke-linecap="round"/>
   <circle cx="150" cy="260" r="58" fill="#2f3036" stroke="${INK}" stroke-width="6"/><circle cx="150" cy="260" r="30" fill="#cfd3d8" stroke="${INK}" stroke-width="5"/>
   <circle cx="150" cy="260" r="8" fill="#6f7882" stroke="${INK}" stroke-width="3"/>
   <path d="M118 222 Q 128 206 150 204" stroke="#fff" stroke-width="5" opacity=".3" fill="none" stroke-linecap="round"/>`,
  { cut: 5 },
)

export const pipeStack = svgDoc(
  560,
  330,
  `${[
    [90, 250], [230, 250], [370, 250], [510, 250],
    [160, 140], [300, 140], [440, 140],
    [230, 32], [370, 32],
  ].map(([x, y]) => `<circle cx="${x}" cy="${y + 56}" r="62" fill="#cfcac0" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${y + 56}" r="42" fill="#5d3a1c" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="${y + 56}" r="50" fill="none" stroke="#a8a396" stroke-width="5"/><path d="M${x - 40} ${y + 24} Q ${x - 22} ${y + 2} ${x + 6} ${y}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`).join('')}`,
  { cut: 5 },
)

export const barrel = svgDoc(
  180,
  250,
  `<rect x="16" y="14" width="148" height="226" rx="22" fill="#f5b700" stroke="${INK}" stroke-width="6"/>
   <path d="M16 60 H 164 M16 190 H 164" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 6 }, (_, i) => `<path d="M${22 + i * 26} 190 L ${44 + i * 26} 60 L ${58 + i * 26} 60 L ${36 + i * 26} 190 Z" fill="#2b2b2b" opacity=".85"/>`).join('')}
   <rect x="16" y="14" width="148" height="226" rx="22" fill="none" stroke="${INK}" stroke-width="6"/>
   <path d="M30 28 V 226" stroke="#fff" stroke-width="7" opacity=".35" stroke-linecap="round"/>
   <ellipse cx="90" cy="26" rx="62" ry="12" fill="#ffe27a" stroke="${INK}" stroke-width="5"/>`,
  { cut: 5 },
)

export const tapBubble = svgDoc(
  300,
  190,
  `<path d="M40 20 L 262 20 Q 284 20 284 42 L 284 104 Q 284 126 262 126 L 190 126 L 150 172 L 126 126 L 40 126 Q 18 126 18 104 L 18 42 Q 18 20 40 20 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <text x="151" y="92" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="64" fill="#e8572b" letter-spacing="2">TAP!</text>`,
  { cut: 4 },
)

export const hintRing = svgDoc(
  256,
  256,
  `<circle cx="128" cy="128" r="104" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="28 20" stroke-linecap="round"/>
   <circle cx="128" cy="128" r="104" fill="none" stroke="#ffd34d" stroke-width="5" stroke-dasharray="28 20" stroke-linecap="round" opacity=".9"/>
   <circle cx="128" cy="128" r="118" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`,
  { grain: 0 },
)

export { FONT, bolt, tuft, STEEL, STEEL_HI, STEEL_SH }
