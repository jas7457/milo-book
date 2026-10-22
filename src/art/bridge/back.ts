import { svgDoc } from '../texture'
import { INK, rand } from '../style'
import { FONT, apples, pineFrag, reedFrag, roundTreeFrag, stone } from './frags'

/* Back layer of the bridge spread: the far bank. */

const sheep = (x: number, y: number, s: number, flip = 1) => `
  <g transform="translate(${x} ${y}) scale(${s * flip} ${s})">
    ${[[-30, 20], [30, 20]].map(([lx]) => `<rect x="${lx - 5}" y="40" width="10" height="26" fill="#4a3a33" stroke="${INK}" stroke-width="3.5"/>`).join('')}
    ${[[-34, 0, 30], [0, -10, 36], [34, 0, 30], [-12, 20, 30], [20, 22, 30]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fdfbf5" stroke="${INK}" stroke-width="4"/>`).join('')}
    <ellipse cx="62" cy="-4" rx="20" ry="24" fill="#5a4a43" stroke="${INK}" stroke-width="4"/>
    <circle cx="68" cy="-10" r="4" fill="#fff"/><circle cx="69" cy="-10" r="2" fill="${INK}"/>
    <path d="M52 -26 Q 40 -36 36 -22" fill="#5a4a43" stroke="${INK}" stroke-width="3.5"/>
  </g>`

/** The far hills across the whole book, with a river valley notch where the river runs in (V-fold). */
export const farHills = (() => {
  const W = 2600
  const H = 900
  const peaks: [number, number][] = [[170, 360], [470, 250], [780, 330], [1900, 330], [2050, 220], [2370, 330]]
  const caps = peaks
    .map(([x, y]) => `<path d="M${x} ${y} L ${x - 50} ${y + 74} L ${x - 24} ${y + 62} L ${x - 4} ${y + 84} L ${x + 18} ${y + 62} L ${x + 50} ${y + 74} Z" fill="#fff" stroke="#8fb0d8" stroke-width="3" stroke-linejoin="round"/>`)
    .join('')
  const leftHill = 'M0 900 L 0 580 Q 300 400 620 470 Q 960 540 1230 600 Q 1400 630 1500 656 Q 1380 760 1240 900 Z'
  const rightHill = 'M2600 900 L 2600 540 Q 2330 380 2000 470 Q 1800 530 1700 654 Q 1760 770 1940 900 Z'
  const pines: [number, number, number][] = [[90, 660, 0.9], [200, 625, 1.05], [330, 585, 0.8], [690, 600, 1.0], [790, 612, 0.72], [1030, 660, 0.85], [1290, 700, 0.7], [2530, 640, 1.0], [2440, 600, 0.78], [2040, 600, 0.8], [1850, 660, 0.7]]
  const rounds: [number, number, number][] = [[460, 585, 0.65], [570, 612, 0.5], [900, 650, 0.58], [1170, 690, 0.5]]
  const valley = 'M1500 656 Q 1593 640 1690 654 L 1940 900 L 1240 900 Z'
  const r = rand(3)
  const bits = Array.from({ length: 16 }, () => {
    const x = 60 + r() * 2480
    return `<path d="M${x.toFixed(0)} 880 l -6 -18 m 6 18 l 6 -16" stroke="#4a9a40" stroke-width="5" stroke-linecap="round"/>`
  }).join('')
  return svgDoc(
    W,
    H,
    `<linearGradient id="vw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd0f6"/><stop offset="1" stop-color="#3ea4e6"/></linearGradient>
     <!-- distant mountains -->
     <path d="M0 900 L 0 520 L 170 360 L 300 460 L 470 250 L 640 430 L 780 330 L 930 470 L 1100 380 L 1240 520 L 1500 470 L 1593 430 L 1700 470 L 1900 330 L 2050 220 L 2230 420 L 2370 330 L 2500 440 L 2600 380 L 2600 900 Z" fill="#a9caee" stroke="#86a8d4" stroke-width="5" stroke-linejoin="round"/>
     <path d="M470 250 L 640 430 L 540 600 L 400 400 Z M2050 220 L 2230 420 L 2130 600 L 1990 380 Z M780 330 L 930 470 L 860 600 L 740 440 Z" fill="#8fb4de" opacity=".6"/>
     ${caps}
     <!-- the valley and its river, narrowing away -->
     <path d="${valley}" fill="#8ed27c"/>
     <path d="M1522 662 Q 1593 650 1668 662 L 1895 900 L 1290 900 Z" fill="url(#vw)" stroke="#2a78b8" stroke-width="5" stroke-linejoin="round"/>
     <path d="M1593 668 Q 1560 740 1600 790 Q 1640 840 1590 900" stroke="#bdeaff" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="40 40" opacity=".6"/>
     <!-- a tiny sailboat far away -->
     <g transform="translate(1620 760) scale(.9)"><path d="M-30 0 L 30 0 L 20 16 L -22 16 Z" fill="#e8322b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M0 -4 L 0 -52 L 26 -8 Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-4 -8 L -4 -42 L -22 -8 Z" fill="#ffe27a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>
     <!-- hills -->
     <path d="${leftHill}" fill="#6fc36a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="${rightHill}" fill="#7bcb6f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M0 640 Q 300 470 620 540 Q 960 610 1240 690 Q 1380 730 1330 800 Q 1100 700 700 640 Q 300 590 0 740 Z" fill="#5aa857" opacity=".55"/>
     <path d="M2600 640 Q 2330 470 2000 540 Q 1800 600 1740 700 Q 1800 740 1890 780 Q 2000 640 2300 640 Q 2500 650 2600 740 Z" fill="#69b95f" opacity=".55"/>
     <path d="M0 586 Q 300 406 620 476 Q 960 546 1230 606" stroke="#a2e394" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>
     <path d="M2600 546 Q 2330 386 2000 476 Q 1800 536 1704 650" stroke="#aeeaa0" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>
     ${bits}
     <!-- sheep on the left hill, a stone wall on the right -->
     ${sheep(420, 700, 0.9)}${sheep(590, 740, 0.7, -1)}${sheep(250, 760, 0.75)}
     <path d="M2080 760 Q 2250 690 2450 730" stroke="${INK}" stroke-width="30" fill="none" stroke-linecap="round" opacity=".15"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => stone(2090 + i * 62, 758 - Math.sin(i / 5 * 2.4) * 40 + (i % 2) * 6, 30, 20, i % 2 ? '#c5c0b2' : '#b9b4a8')).join('')}
     <!-- trees, big and small -->
     ${rounds.map(([x, y, s]) => roundTreeFrag(x, y, s)).join('')}
     ${pines.map(([x, y, s], i) => pineFrag(x, y, s, i % 2 ? '#3f9a5a' : '#4aa86a', '#2f7a46')).join('')}`,
    { cut: 5 },
  )
})()

/** the town on the hill that the treasure trail leads to */
export const castle = (() => {
  const W = 760
  const H = 900
  const merl = (x0: number, x1: number, y: number, n: number) => {
    const w = (x1 - x0) / (n * 2 - 1)
    return Array.from({ length: n }, (_, i) => `<rect x="${x0 + i * 2 * w}" y="${y - 22}" width="${w}" height="26" fill="#eadfc8" stroke="${INK}" stroke-width="4"/>`).join('')
  }
  const bricks = (x0: number, y0: number, w: number, h: number) =>
    Array.from({ length: Math.ceil(h / 36) }, (_, row) => `<path d="M${x0} ${y0 + row * 36} L ${x0 + w} ${y0 + row * 36}" stroke="#cdbf9f" stroke-width="3"/>${Array.from({ length: Math.ceil(w / 60) }, (_, c) => `<path d="M${x0 + c * 60 + (row % 2) * 30} ${y0 + row * 36} l 0 36" stroke="#cdbf9f" stroke-width="3"/>`).join('')}`).join('')
  const tower = (x: number, y: number, w: number, h: number, roof: string, roofDark: string) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eadfc8" stroke="${INK}" stroke-width="6"/>
    <clipPath id="t${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    <g clip-path="url(#t${x})">${bricks(x, y, w, h)}<rect x="${x + w - 20}" y="${y}" width="20" height="${h}" fill="#000" opacity=".1"/></g>
    <path d="M${x - 16} ${y} L ${x + w / 2} ${y - w * 1.25} L ${x + w + 16} ${y} Z" fill="${roof}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${x + w / 2} ${y - w * 1.25} L ${x + w + 16} ${y} L ${x + w / 2 + 6} ${y} Z" fill="${roofDark}" opacity=".5"/>
    <path d="M${x + 10} ${y - 8} Q ${x + 24} ${y - w * 0.6} ${x + w / 2 - 6} ${y - w * 1.0}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35"/>
    <path d="M${x + w / 2 - 14} ${y + 50} L ${x + w / 2 - 14} ${y + 30} Q ${x + w / 2} ${y + 14} ${x + w / 2 + 14} ${y + 30} L ${x + w / 2 + 14} ${y + 50} Z" fill="#ffe27a" stroke="${INK}" stroke-width="4"/>`
  const house = (x: number, y: number, c: string) => `
    <rect x="${x}" y="${y}" width="86" height="66" fill="${c}" stroke="${INK}" stroke-width="5"/>
    <path d="M${x - 10} ${y} L ${x + 43} ${y - 48} L ${x + 96} ${y} Z" fill="#d9531e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${x + 12}" y="${y + 22}" width="20" height="26" fill="#ffe27a" stroke="${INK}" stroke-width="3.5"/><rect x="${x + 50}" y="${y + 28}" width="24" height="38" fill="#8a5a33" stroke="${INK}" stroke-width="3.5"/>`
  return svgDoc(
    W,
    H,
    `<!-- the hill -->
     <path d="M0 900 Q 10 700 120 640 Q 380 540 640 640 Q 750 700 760 900 Z" fill="#7bcb6f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M30 880 Q 60 760 160 700 Q 100 800 120 880 Z" fill="#5aa857" opacity=".5"/>
     <path d="M120 640 Q 380 560 640 640" stroke="#aeeaa0" stroke-width="12" fill="none" stroke-linecap="round" opacity=".8"/>
     <!-- castle -->
     ${tower(112, 400, 130, 250, '#e8322b', '#b8221c')}
     ${tower(518, 400, 130, 250, '#3a8be0', '#2a5fb0')}
     <rect x="220" y="300" width="320" height="350" fill="#f2e8d0" stroke="${INK}" stroke-width="6"/>
     <clipPath id="keep"><rect x="220" y="300" width="320" height="350"/></clipPath>
     <g clip-path="url(#keep)">${bricks(220, 300, 320, 350)}<rect x="520" y="300" width="20" height="350" fill="#000" opacity=".1"/><rect x="220" y="300" width="14" height="350" fill="#fff" opacity=".35"/></g>
     ${merl(220, 540, 300, 6)}
     <!-- flag poles -->
     <path d="M380 300 L 380 190" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M380 300 L 380 190" stroke="#c9a06a" stroke-width="6" stroke-linecap="round"/>
     <!-- windows + door -->
     ${[300, 440].map((x) => `<path d="M${x - 22} 440 L ${x - 22} 392 Q ${x} 364 ${x + 22} 392 L ${x + 22} 440 Z" fill="#ffe27a" stroke="${INK}" stroke-width="5"/><path d="M${x} 372 L ${x} 440 M${x - 22} 414 L ${x + 22} 414" stroke="${INK}" stroke-width="3.5"/>`).join('')}
     <path d="M320 650 L 320 540 Q 380 470 440 540 L 440 650 Z" fill="#8a5a33" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M380 484 L 380 650 M350 520 L 350 650 M410 520 L 410 650" stroke="#6a4326" stroke-width="4"/>
     ${[[340, 560], [420, 560], [340, 610], [420, 610], [380, 584]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#d9d0b8" stroke="${INK}" stroke-width="2"/>`).join('')}
     <circle cx="435" cy="600" r="7" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>
     <!-- the town below -->
     ${house(40, 740, '#fdf3d8')}${house(620, 750, '#ffe9b8')}${house(500, 790, '#fdf3d8')}
     ${pineFrag(30, 870, 0.55)}${roundTreeFrag(720, 880, 0.5)}
     <!-- the path down -->
     <path d="M380 650 Q 330 700 400 750 Q 470 800 380 860 Q 330 890 340 900 L 440 900 Q 460 860 520 840 Q 420 790 440 750 Q 380 700 440 650 Z" fill="#e8cc92" stroke="#b89460" stroke-width="4" stroke-linejoin="round"/>
     <!-- signpost -->
     <g transform="translate(250 840)"><path d="M0 0 L 0 -90" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M0 0 L 0 -90" stroke="#c9a06a" stroke-width="6" stroke-linecap="round"/><path d="M-90 -100 L 60 -100 L 86 -80 L 60 -60 L -90 -60 Z" fill="#f4c542" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><text x="-14" y="-72" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" fill="${INK}">TOWN</text></g>`,
    { cut: 5 },
  )
})()

export const castleFlag = svgDoc(
  150,
  100,
  `<path d="M6 10 Q 50 -8 90 12 Q 120 24 144 14 L 144 66 Q 120 78 90 66 Q 50 48 6 72 Z" fill="#ffd34d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M30 40 l 8 -16 l 8 16 l -16 -10 l 16 0 z" fill="#e8322b"/><path d="M6 10 L 6 72" stroke="${INK}" stroke-width="6"/>`,
)

export const windmill = svgDoc(
  420,
  640,
  `<!-- tower -->
   <path d="M90 640 L 130 220 L 290 220 L 330 640 Z" fill="#f6ecd6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <clipPath id="wm"><path d="M90 640 L 130 220 L 290 220 L 330 640 Z"/></clipPath>
   <g clip-path="url(#wm)">
     ${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${230 + i * 40} L 420 ${230 + i * 40}" stroke="#dccfaf" stroke-width="3"/>`).join('')}
     <path d="M290 220 L 330 640 L 250 640 L 240 220 Z" fill="#000" opacity=".1"/><path d="M130 220 L 90 640 L 120 640 L 150 220 Z" fill="#fff" opacity=".4"/>
   </g>
   <path d="M170 640 L 170 540 Q 210 490 250 540 L 250 640 Z" fill="#8a5a33" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <circle cx="236" cy="590" r="6" fill="#ffd34d" stroke="${INK}" stroke-width="2.5"/>
   <path d="M170 400 L 170 366 Q 210 330 250 366 L 250 400 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5"/><path d="M210 340 L 210 400 M170 380 L 250 380" stroke="${INK}" stroke-width="3.5"/>
   <rect x="110" y="236" width="200" height="14" rx="6" fill="#c9a06a" stroke="${INK}" stroke-width="4"/>
   <!-- cap -->
   <path d="M104 226 Q 100 120 210 96 Q 320 120 316 226 Z" fill="#d9472b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M210 96 Q 320 120 316 226 L 250 226 Q 280 140 210 96 Z" fill="#b8321b" opacity=".6"/>
   <path d="M128 200 Q 130 140 180 118" stroke="#ff9a7a" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
   <circle cx="210" cy="170" r="22" fill="#c9a06a" stroke="${INK}" stroke-width="5"/>`,
  { cut: 5 },
)

export const windmillBlades = svgDoc(
  520,
  520,
  `${[0, 90, 180, 270]
    .map((a) => `<g transform="rotate(${a} 260 260)">
      <rect x="248" y="40" width="24" height="220" fill="#b8814a" stroke="${INK}" stroke-width="5"/>
      <rect x="272" y="46" width="76" height="150" fill="#fdf6e4" stroke="${INK}" stroke-width="5"/>
      <path d="M272 82 L 348 82 M272 120 L 348 120 M272 158 L 348 158 M310 46 L 310 196" stroke="#c9a06a" stroke-width="4"/>
    </g>`)
    .join('')}
   <circle cx="260" cy="260" r="30" fill="#c9a06a" stroke="${INK}" stroke-width="6"/><circle cx="260" cy="260" r="11" fill="#7a5a2a" stroke="${INK}" stroke-width="3"/>`,
  { cut: 4 },
)

export const bigTree = svgDoc(460, 640, `${roundTreeFrag(230, 630, 2.5, '#5fb35a', '#46963f', apples)}`, { cut: 5 })
export const smallTree = svgDoc(460, 640, `${roundTreeFrag(230, 630, 2.5, '#7acb5e', '#58a844')}`, { cut: 5 })
export const bigPine = svgDoc(420, 640, `${pineFrag(210, 630, 3.2)}`, { cut: 5 })

export const farReeds = svgDoc(300, 440, `${reedFrag(150, 430, 1.5)}`, { cut: 5 })
