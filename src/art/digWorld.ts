import { svgDoc } from './texture'
import { INK, rand } from './style'
import { rock, bolt, tuft, FONT, YEL, YEL_D, YEL_L } from './dig'

/* The big dig-site diorama behind the book: backdrop, bulldozer, trailer, mounds, fences. */

const bolts = (pts: number[][], r = 6) => pts.map(([x, y]) => bolt(x, y, r)).join('')

/** A painted sky + hills + far skyline, standing at the back of the world. 3600 × 1150 */
export const backdrop = (() => {
  const W = 3600
  const H = 1150
  const r = rand(12)
  const cloud = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="150" ry="46"/><circle cx="-60" cy="-30" r="52"/><circle cx="20" cy="-52" r="68"/><circle cx="96" cy="-18" r="44"/></g><g transform="translate(${x} ${y + 24 * s}) scale(${s})" fill="#dcebf7" opacity=".7"><ellipse cx="0" cy="0" rx="140" ry="18"/></g>`
  const buildings = Array.from({ length: 22 }, (_, i) => {
    const x = i * 170 + r() * 40
    const h = 120 + r() * 220
    const w = 110 + r() * 40
    return `<rect x="${x.toFixed(0)}" y="${(760 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#b9c9d8" stroke="#8fa3b6" stroke-width="4"/>${Array.from({ length: Math.floor(h / 50) }, (_, k) => `<rect x="${(x + 14).toFixed(0)}" y="${(760 - h + 14 + k * 50).toFixed(0)}" width="${(w - 28).toFixed(0)}" height="20" fill="#d9e6f2"/>`).join('')}`
  }).join('')
  const farCrane = (x: number, h: number) =>
    `<g transform="translate(${x} 780)" stroke="#9aa9b8" stroke-width="10" fill="none" stroke-linecap="round"><path d="M0 0 V ${-h}"/><path d="M-130 ${-h + 20} H 260"/><path d="M0 ${-h - 50} L -130 ${-h + 20} M0 ${-h - 50} L 260 ${-h + 20}"/><path d="M200 ${-h + 20} V ${-h + 120}"/></g>`
  return svgDoc(
    W,
    H,
    `<linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4ef"/><stop offset=".62" stop-color="#bfe3f6"/><stop offset="1" stop-color="#ffeabf"/></linearGradient>
     <radialGradient id="wsun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffe9a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
     <rect width="${W}" height="${H}" fill="url(#wsky)"/>
     <circle cx="2900" cy="260" r="260" fill="url(#wsun)"/><circle cx="2900" cy="260" r="86" fill="#fff4b8" stroke="#f6c64a" stroke-width="6"/>
     ${Array.from({ length: 12 }, (_, i) => `<path d="M2900 260 L ${(2900 + Math.cos(i * 0.52) * 150).toFixed(0)} ${(260 + Math.sin(i * 0.52) * 150).toFixed(0)}" stroke="#ffe27a" stroke-width="8" stroke-linecap="round" opacity=".6"/>`).join('')}
     ${cloud(420, 280, 1.5)}${cloud(1240, 180, 1.1)}${cloud(1900, 320, 1.3)}${cloud(2500, 150, 0.9)}${cloud(3260, 400, 1.2)}
     <g opacity=".85">${buildings}</g>
     ${farCrane(520, 320)}${farCrane(2300, 400)}${farCrane(3250, 280)}
     <path d="M0 800 Q 300 620 640 690 Q 960 600 1320 700 Q 1700 640 2040 720 Q 2400 620 2760 700 Q 3120 640 3600 740 L 3600 ${H} L 0 ${H} Z" fill="#a9d184" stroke="${INK}" stroke-width="6"/>
     <path d="M0 900 Q 400 780 820 850 Q 1240 780 1700 870 Q 2160 790 2620 870 Q 3060 800 3600 880 L 3600 ${H} L 0 ${H} Z" fill="#d6a463" stroke="${INK}" stroke-width="6"/>
     <path d="M0 960 Q 500 900 1000 950 Q 1500 900 2000 960 Q 2600 900 3600 960 L 3600 ${H} L 0 ${H} Z" fill="#c98b4a"/>
     ${Array.from({ length: 12 }, (_, i) => tuft(150 + i * 300 + (i % 3) * 40, 830 + (i % 2) * 20, 1.1, '#6fae4d')).join('')}`,
    { grain: 0.8 },
  )
})()

/** A yellow bulldozer facing left. 1000 × 580 */
export const bulldozer = svgDoc(
  1000,
  580,
  `<!-- ripper at the back -->
   <path d="M800 330 L 900 330 L 940 540 L 900 540 L 860 400 L 800 400 Z" fill="#6d7480" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M900 520 L 950 572 L 900 560 Z" fill="#c4ccd6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <!-- tracks -->
   <path d="M330 420 H 790 A 74 74 0 0 1 790 568 H 330 A 74 74 0 0 1 330 420 Z" fill="#3a3a40"/>
   <path d="M330 420 H 790 A 74 74 0 0 1 790 568 H 330 A 74 74 0 0 1 330 420 Z" fill="none" stroke="#202024" stroke-width="16" stroke-dasharray="6 14"/>
   <path d="M330 420 H 790 A 74 74 0 0 1 790 568 H 330 A 74 74 0 0 1 330 420 Z" fill="none" stroke="${INK}" stroke-width="6"/>
   <rect x="320" y="440" width="480" height="60" rx="22" fill="${YEL}" stroke="${INK}" stroke-width="5"/>
   ${[330, 790].map((x) => `<circle cx="${x}" cy="494" r="50" fill="#8d949c" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="494" r="28" fill="${YEL}" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="494" r="9" fill="#4b4f57"/>`).join('')}
   ${[420, 510, 600, 690].map((x) => `<circle cx="${x}" cy="524" r="26" fill="#7b828a" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="524" r="10" fill="#4b4f57"/>`).join('')}
   <!-- blade arms + blade -->
   <path d="M150 380 L 340 340 L 340 400 L 160 440 Z" fill="${YEL}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M170 400 L 330 366" stroke="${YEL_L}" stroke-width="6" stroke-linecap="round"/>
   <path d="M20 250 Q 6 360 40 540 L 150 560 Q 126 380 140 250 Q 80 230 20 250 Z" fill="#7e8794" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M40 262 Q 28 370 56 520" stroke="#c4ccd6" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/>
   <path d="M30 540 L 150 560 L 156 576 L 26 556 Z" fill="#4b4f57" stroke="${INK}" stroke-width="4"/>
   ${bolts([[110, 290], [118, 360], [124, 440], [128, 510]], 6)}
   <!-- engine hood -->
   <path d="M230 430 L 230 300 Q 230 270 262 266 L 480 258 L 520 430 Z" fill="${YEL}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M230 390 H 520 V 430 H 230 Z" fill="${YEL_D}"/>
   <path d="M250 282 L 470 274" stroke="${YEL_L}" stroke-width="8" stroke-linecap="round"/>
   ${Array.from({ length: 5 }, (_, i) => `<path d="M${262 + i * 44} 350 l 14 -52" stroke="#8a6200" stroke-width="10" stroke-linecap="round" opacity=".8"/>`).join('')}
   <rect x="320" y="150" width="30" height="120" rx="8" fill="#8b9099" stroke="${INK}" stroke-width="5"/><rect x="310" y="136" width="50" height="22" rx="7" fill="#5d636b" stroke="${INK}" stroke-width="5"/>
   <!-- cab -->
   <path fill-rule="evenodd" d="M480 430 L 470 150 Q 470 120 500 120 L 690 120 Q 720 120 724 150 L 770 430 Z M510 156 L 690 156 L 724 340 L 520 340 Z" fill="${YEL}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M510 156 L 690 156 L 724 340 L 520 340 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5"/>
   <path d="M540 170 L 520 320 M580 170 L 560 260" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".8"/>
   <path d="M600 330 L 612 210 Q 620 190 640 200 L 650 230 L 640 330 Z" fill="#c9433a" stroke="${INK}" stroke-width="4"/>
   <rect x="456" y="92" width="300" height="38" rx="14" fill="${YEL_D}" stroke="${INK}" stroke-width="6"/>
   <rect x="470" y="104" width="270" height="8" rx="4" fill="${YEL_L}"/>
   <rect x="716" y="76" width="44" height="24" rx="8" fill="#fff6b0" stroke="${INK}" stroke-width="4"/>
   <circle cx="600" cy="76" r="14" fill="#ff9d1a" stroke="${INK}" stroke-width="4"/><rect x="586" y="86" width="28" height="12" rx="3" fill="#4b4f57" stroke="${INK}" stroke-width="3"/>
   ${bolts([[490, 410], [740, 410], [300, 410], [460, 300]], 6.5)}
   <circle cx="396" cy="360" r="28" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M396 340 L 404 356 L 422 358 L 408 370 L 412 388 L 396 378 L 380 388 L 384 370 L 370 358 L 388 356 Z" fill="#ff7a1a" stroke="${INK}" stroke-width="2"/>`,
  { cut: 6 },
)

/** A portable site office. 940 × 560 */
export const trailer = svgDoc(
  940,
  560,
  `<!-- skids + steps -->
   <rect x="50" y="470" width="780" height="26" rx="6" fill="#6d4a2a" stroke="${INK}" stroke-width="5"/>
   ${[130, 420, 700].map((x) => `<rect x="${x}" y="496" width="70" height="52" fill="#b8a98f" stroke="${INK}" stroke-width="5"/>`).join('')}
   <path d="M780 470 L 800 540 L 930 540 L 930 470 Z M810 470 L 830 540 M860 470 L 874 540 M900 470 L 912 540" fill="#c98e4e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <!-- AC unit -->
   <rect x="120" y="60" width="150" height="70" rx="8" fill="#cfd3d8" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 6 }, (_, i) => `<path d="M${140 + i * 20} 74 V 118" stroke="#8d949c" stroke-width="5"/>`).join('')}
   <!-- box -->
   <rect x="40" y="120" width="810" height="360" rx="14" fill="#f2f0e8" stroke="${INK}" stroke-width="7"/>
   <rect x="40" y="120" width="810" height="40" rx="14" fill="#fdfbf5" stroke="${INK}" stroke-width="6"/>
   <rect x="40" y="410" width="810" height="70" fill="#e2dfd2"/>
   ${Array.from({ length: 14 }, (_, i) => `<path d="M${40 + i * 58} 160 V 410" stroke="#e0ddd0" stroke-width="4"/>`).join('')}
   <rect x="20" y="104" width="850" height="30" rx="8" fill="#3a8bd8" stroke="${INK}" stroke-width="6"/>
   <rect x="34" y="112" width="822" height="8" rx="4" fill="#8fc4f2"/>
   <!-- door -->
   <rect x="690" y="200" width="120" height="270" rx="6" fill="#3a8bd8" stroke="${INK}" stroke-width="6"/>
   <rect x="710" y="230" width="80" height="90" rx="6" fill="#bfe6ff" stroke="${INK}" stroke-width="5"/>
   <path d="M722 310 L 748 244" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>
   <circle cx="716" cy="390" r="9" fill="#d4dae0" stroke="${INK}" stroke-width="4"/>
   <!-- windows -->
   ${[100, 330].map((x) => `<rect x="${x}" y="210" width="190" height="140" rx="8" fill="#bfe6ff" stroke="${INK}" stroke-width="6"/><path d="M${x + 95} 210 V 350 M${x} 280 H ${x + 190}" stroke="${INK}" stroke-width="5"/><path d="M${x + 14} 336 L ${x + 60} 224" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".7"/><rect x="${x - 12}" y="350" width="214" height="14" rx="4" fill="#e8322b" stroke="${INK}" stroke-width="4"/>`).join('')}
   <!-- sign + stickers -->
   <rect x="250" y="168" width="250" height="36" rx="8" fill="#f5b700" stroke="${INK}" stroke-width="5"/>
   <text x="375" y="196" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="26" fill="#2b2b2b" letter-spacing="3">SITE OFFICE</text>
   <circle cx="580" cy="250" r="34" fill="#fff" stroke="${INK}" stroke-width="5"/><path d="M580 224 L 590 244 L 612 246 L 596 260 L 600 282 L 580 270 L 560 282 L 564 260 L 548 246 L 570 244 Z" fill="#f5b700" stroke="${INK}" stroke-width="2.5"/>
   <path d="M550 330 L 640 330 L 640 420 L 550 420 Z" fill="#fff6d2" stroke="${INK}" stroke-width="4" transform="rotate(-4 595 375)"/>
   <path d="M562 350 H 626 M562 368 H 618 M562 386 H 622" stroke="#d0372a" stroke-width="5" stroke-linecap="round" transform="rotate(-4 595 375)"/>
   ${bolts([[60, 460], [830, 460], [60, 140], [830, 140]], 6)}`,
  { cut: 6 },
)

/** A huge dirt mound with strata, a flag and a bone. 1500 × 640 */
export const mound = (flag = true) => {
  const w = 1500
  const h = 640
  return svgDoc(
    w,
    h,
    `<path d="M0 ${h} Q 120 300 420 180 Q 700 40 960 150 Q 1260 260 ${w} ${h} Z" fill="#d9a05a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
     ${[0, 1, 2, 3].map((i) => `<path d="M${150 + i * 40} ${h} Q ${520 + i * 20} ${250 + i * 90} ${1000 + i * 40} ${h}" fill="${['#c98b4a', '#b57a3e', '#a56a33', '#8f5a2b'][i]}" opacity=".75"/>`).join('')}
     <path d="M200 340 Q 460 150 700 120 Q 880 110 1000 190" stroke="#f0cf96" stroke-width="12" fill="none" stroke-linecap="round" opacity=".8"/>
     <!-- tyre tracks climbing the hill -->
     <path d="M640 ${h} Q 700 400 760 220" stroke="#8a5a2e" stroke-width="40" stroke-dasharray="6 18" fill="none" opacity=".7"/>
     ${[[300, 460, 0.7], [1100, 440, 0.8], [880, 330, 0.5], [520, 330, 0.45]].map(([x, y, s], i) => rock(x, y, s, i % 2 ? '#a9a6a0' : '#b5a99a', '#86837d', i * 30)).join('')}
     <g transform="translate(1150 380) rotate(-24)"><rect x="-120" y="-13" width="240" height="26" rx="10" fill="#f7efd6" stroke="${INK}" stroke-width="5"/>
       ${[[-120, -17], [-120, 17], [120, -17], [120, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#f7efd6" stroke="${INK}" stroke-width="5"/>`).join('')}
       ${[[-120, -17], [-120, 17], [120, -17], [120, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18" fill="#f7efd6"/>`).join('')}</g>
     ${flag ? `<path d="M720 130 V -0" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M720 130 V 0" stroke="#d6dbe0" stroke-width="6" stroke-linecap="round"/><path d="M724 4 Q 790 -10 850 14 Q 800 38 850 66 Q 786 46 724 70 Z" fill="#e8322b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` : ''}
     ${Array.from({ length: 8 }, (_, i) => tuft(80 + i * 190, h - 6, 1.2, '#7dbb55')).join('')}`,
    { cut: 6 },
  )
}

/** An orange mesh construction fence. 1500 × 330 */
export const fenceWorld = svgDoc(
  1500,
  330,
  `<rect x="0" y="80" width="1500" height="200" fill="#ff8a1a" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 30 }, (_, i) => `<path d="M${i * 60 - 80} 80 L ${i * 60 + 10} 280 M${i * 60 + 100} 80 L ${i * 60 + 10} 280" stroke="#c55a08" stroke-width="5" opacity=".8"/>`).join('')}
   <rect x="0" y="80" width="1500" height="30" fill="#ff9d3d" stroke="${INK}" stroke-width="5"/>
   ${Array.from({ length: 6 }, (_, i) => `<rect x="${10 + i * 300}" y="40" width="26" height="290" rx="6" fill="#fdfbf5" stroke="${INK}" stroke-width="5"/>`).join('')}
   ${[1, 3].map((i) => `<g transform="translate(${i * 300 + 110} 130)"><rect width="190" height="110" rx="10" fill="#fdfbf5" stroke="${INK}" stroke-width="6"/><rect x="10" y="10" width="170" height="90" rx="6" fill="#e8322b"/><text x="95" y="48" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="30" fill="#fff">KEEP</text><text x="95" y="86" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="30" fill="#fff">OUT!</text></g>`).join('')}`,
  { cut: 6 },
)

export const lightTower = svgDoc(
  460,
  1100,
  `<path d="M230 120 V 960" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M230 120 V 960" stroke="${YEL}" stroke-width="18" stroke-linecap="round"/>
   <path d="M100 1080 L 230 700 L 360 1080" stroke="${INK}" stroke-width="22" fill="none" stroke-linejoin="round"/><path d="M100 1080 L 230 700 L 360 1080" stroke="#6d7480" stroke-width="12" fill="none" stroke-linejoin="round"/>
   <rect x="70" y="40" width="320" height="110" rx="12" fill="#4b4f57" stroke="${INK}" stroke-width="7"/>
   ${[0, 1, 2, 3].map((i) => `<rect x="${86 + i * 76}" y="54" width="66" height="82" rx="8" fill="#fff6b0" stroke="${INK}" stroke-width="5"/><path d="M${96 + i * 76} 70 L ${140 + i * 76} 70" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`).join('')}
   <rect x="60" y="940" width="340" height="140" rx="12" fill="${YEL}" stroke="${INK}" stroke-width="7"/>
   <path d="M60 1040 H 400" stroke="${YEL_D}" stroke-width="40"/>
   ${bolts([[90, 970], [370, 970], [90, 1050], [370, 1050]], 7)}
   <circle cx="130" cy="1090" r="34" fill="#2f3036" stroke="${INK}" stroke-width="6"/><circle cx="330" cy="1090" r="34" fill="#2f3036" stroke="${INK}" stroke-width="6"/>`,
  { cut: 6 },
)

export const dangerSign = svgDoc(
  440,
  700,
  `<rect x="200" y="260" width="40" height="430" fill="#c98e4e" stroke="${INK}" stroke-width="6"/>
   <path d="M220 20 L 420 330 L 20 330 Z" fill="#ffd21a" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
   <path d="M220 62 L 380 308 L 60 308 Z" fill="none" stroke="#2b2b2b" stroke-width="10" stroke-linejoin="round"/>
   <rect x="204" y="130" width="32" height="100" rx="14" fill="#2b2b2b"/><circle cx="220" cy="262" r="19" fill="#2b2b2b"/>
   <rect x="60" y="380" width="320" height="130" rx="16" fill="#e8322b" stroke="${INK}" stroke-width="7"/>
   <text x="220" y="430" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="44" fill="#fff">HARD HATS</text>
   <text x="220" y="484" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="44" fill="#fff">PLEASE!</text>
   ${bolts([[84, 404], [356, 404], [84, 488], [356, 488]], 7)}`,
  { cut: 6 },
)

export const sandbags = svgDoc(
  520,
  260,
  `${[
    [20, 170], [150, 170], [280, 170], [390, 170],
    [80, 90], [210, 90], [330, 90],
    [150, 10], [270, 10],
  ].map(([x, y], i) => `<path d="M${x} ${y + 40} Q ${x - 6} ${y} ${x + 30} ${y} L ${x + 100} ${y} Q ${x + 128} ${y + 6} ${x + 124} ${y + 40} Q ${x + 120} ${y + 80} ${x + 90} ${y + 80} L ${x + 30} ${y + 80} Q ${x + 2} ${y + 80} ${x} ${y + 40} Z" fill="${i % 2 ? '#d9c08a' : '#cfb27a'}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M${x + 18} ${y + 20} Q ${x + 60} ${y + 8} ${x + 104} ${y + 18}" stroke="#f0e2b8" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/><path d="M${x + 60} ${y + 30} v 40" stroke="#a88a52" stroke-width="3" opacity=".7"/>`).join('')}`,
  { cut: 6 },
)

/** Tyre tracks and puddles stamped on the ground. */
export const groundDecal = (() => {
  const W = 1800
  const H = 1000
  const tr = 'M-40 880 C 300 760 520 520 860 440 S 1400 300 1860 120'
  const track = (dx: number) => `<g transform="translate(${dx} 0)"><path d="${tr}" stroke="#7a4d22" stroke-width="64" fill="none" opacity=".45" stroke-linecap="round"/><path d="${tr}" stroke="#4d2f14" stroke-width="64" stroke-dasharray="8 22" fill="none" opacity=".4"/></g>`
  return svgDoc(
    W,
    H,
    `${track(0)}${track(140)}
     <ellipse cx="1150" cy="760" rx="250" ry="70" fill="#7a4d22" opacity=".5"/>
     <ellipse cx="1150" cy="756" rx="214" ry="54" fill="#6fb4d8" opacity=".85" stroke="#4d2f14" stroke-width="5"/>
     <path d="M1030 746 Q 1100 726 1170 744" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
     ${[[300, 300], [560, 700], [1500, 600], [760, 160], [1640, 900]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${70 + i * 10}" ry="22" fill="#a56a33" opacity=".5"/>`).join('')}`,
    { grain: 0.7 },
  )
})()

