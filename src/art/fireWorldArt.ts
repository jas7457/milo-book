import { svgDoc } from './texture'
import { INK, rand } from './style'
import { FONT } from './fireArt'

/* Art for the "firetown" world diorama behind the book. */

/** The street: far pavement, kerbs, road with lane dashes and a zebra crossing, near pavement. 3400×900. */
export const worldRoad = (() => {
  const r = rand(21)
  let slabs = ''
  for (let row = 0; row < 3; row++)
    for (let c = 0; c < 22; c++)
      slabs += `<rect x="${c * 160 - (row % 2) * 80}" y="${row * 90}" width="158" height="88" fill="${['#c9bdc4', '#c2b6bd', '#d0c4ca'][Math.floor(r() * 3)]}" stroke="#a89ca6" stroke-width="3"/>`
  let near = ''
  for (let row = 0; row < 2; row++)
    for (let c = 0; c < 22; c++)
      near += `<rect x="${c * 160 - (row % 2) * 80}" y="${770 + row * 70}" width="158" height="68" fill="${['#c9bdc4', '#c2b6bd', '#d0c4ca'][Math.floor(r() * 3)]}" stroke="#a89ca6" stroke-width="3"/>`
  const speck = Array.from({ length: 300 }, () => `<circle cx="${(r() * 3400).toFixed(0)}" cy="${(290 + r() * 480).toFixed(0)}" r="${(2 + r() * 3).toFixed(1)}" fill="${r() < 0.5 ? '#7f8294' : '#575a6c'}" opacity=".5"/>`).join('')
  return svgDoc(
    3400,
    900,
    `<rect width="3400" height="900" fill="#c9bdc4"/>
     ${slabs}
     <rect y="262" width="3400" height="40" fill="#d6d3dc" stroke="${INK}" stroke-width="5"/>
     <rect y="262" width="3400" height="12" fill="#f0eef4"/>
     <rect y="302" width="3400" height="470" fill="#6e7284"/>
     ${speck}
     ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 200 + 40}" y="520" width="120" height="16" rx="6" fill="#f3c93a"/>`).join('')}
     <path d="M0 332 H 3400 M0 742 H 3400" stroke="#f4f4ee" stroke-width="8" opacity=".8"/>
     ${Array.from({ length: 9 }, (_, i) => `<rect x="1500" y="${344 + i * 44}" width="300" height="26" rx="6" fill="#f6f4ee" opacity=".9"/>`).join('')}
     <rect y="772" width="3400" height="40" fill="#d6d3dc" stroke="${INK}" stroke-width="5"/>
     <rect y="772" width="3400" height="12" fill="#f0eef4"/>
     <rect y="812" width="3400" height="88" fill="#c9bdc4"/>
     ${near}
     <g fill="#9ccaea" stroke="#5e89b0" stroke-width="5">
       <ellipse cx="620" cy="650" rx="150" ry="44" transform="rotate(-4 620 650)"/><ellipse cx="2700" cy="440" rx="190" ry="52"/><ellipse cx="2200" cy="690" rx="110" ry="30"/>
     </g>
     <g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"><path d="M520 640 Q 600 622 680 632"/><path d="M2600 430 Q 2700 410 2790 428"/></g>
     <circle cx="1100" cy="470" r="56" fill="#5b6070" stroke="${INK}" stroke-width="5"/><circle cx="1100" cy="470" r="42" fill="none" stroke="#434858" stroke-width="5"/>`,
    { grain: 0.8 },
  )
})()

/** A far-away skyline in dusk colours, with a few lit windows. 4200×720. */
export const farTown = (() => {
  const r = rand(33)
  let s = ''
  let x = 0
  let i = 0
  while (x < 4200) {
    const w = 140 + r() * 180
    const h = 220 + r() * 400
    const c = ['#8a6aa8', '#9a78b4', '#7a5c98', '#a285b8'][i % 4]
    s += `<rect x="${x.toFixed(0)}" y="${(720 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${c}"/>`
    if (r() < 0.5) s += `<path d="M${x.toFixed(0)} ${(720 - h).toFixed(0)} l ${(w / 2).toFixed(0)} -60 l ${(w / 2).toFixed(0)} 60 z" fill="${c}"/>`
    for (let k = 0; k < 14; k++) {
      const wx = x + 16 + r() * (w - 44)
      const wy = 720 - h + 24 + r() * (h - 70)
      s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="16" height="22" rx="3" fill="${r() < 0.4 ? '#ffe9a0' : '#6a4c88'}" opacity=".85"/>`
    }
    x += w + 8 + r() * 20
    i++
  }
  return svgDoc(4200, 720, s, { grain: 0.5 })
})()

/** A water tower on stilts with a "5" on the tank. 460×1100. */
export const waterTower = svgDoc(
  460,
  1100,
  `<defs><pattern id="wd" width="30" height="40" patternUnits="userSpaceOnUse"><rect width="30" height="40" fill="#b8773a"/><path d="M0 8 H 30 M0 28 H 30" stroke="#8a5424" stroke-width="3"/><path d="M15 0 V 40" stroke="#8a5424" stroke-width="2" opacity=".6"/></pattern></defs>
   <path d="M90 1090 L 150 540 M370 1090 L 310 540 M230 1090 V 540 M120 900 H 340 M104 1010 H 356" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
   <path d="M90 1090 L 150 540 M370 1090 L 310 540 M230 1090 V 540 M120 900 H 340 M104 1010 H 356" stroke="#7a5430" stroke-width="12" stroke-linecap="round"/>
   <path d="M120 740 L 340 900 M340 740 L 120 900" stroke="${INK}" stroke-width="10" opacity=".7"/>
   <rect x="70" y="260" width="320" height="290" rx="16" fill="url(#wd)" stroke="${INK}" stroke-width="7"/>
   ${[300, 360, 420, 480].map((y) => `<path d="M70 ${y} H 390" stroke="#5a3a1a" stroke-width="9"/>`).join('')}
   <rect x="70" y="260" width="60" height="290" fill="#fff" opacity=".12"/>
   <path d="M60 262 L 230 130 L 400 262 Z" fill="#6a4a3a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M60 262 L 230 130 L 230 262 Z" fill="#fff" opacity=".12"/>
   <circle cx="230" cy="400" r="70" fill="#e8322b" stroke="${INK}" stroke-width="7"/>
   <circle cx="230" cy="400" r="56" fill="none" stroke="#fff6e0" stroke-width="5" stroke-dasharray="14 8"/>
   <text x="230" y="428" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="84" fill="#fff6e0">5</text>
   <path d="M230 130 V 96" stroke="${INK}" stroke-width="6"/><circle cx="230" cy="90" r="9" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <path d="M390 520 q 40 10 40 90 v 300" stroke="${INK}" stroke-width="20" fill="none"/><path d="M390 520 q 40 10 40 90 v 300" stroke="#9aa3ad" stroke-width="10" fill="none"/>`,
  { cut: 6 },
)

/** A big round tree for the town. 600×760. */
export const townTree = (leaf: string, leaf2: string, fruit?: string) =>
  svgDoc(
    600,
    760,
    `<path d="M300 760 L 306 440 M306 520 Q 360 470 400 430 M300 560 Q 250 500 210 470" stroke="${INK}" stroke-width="58" fill="none" stroke-linecap="round"/>
     <path d="M300 760 L 306 440 M306 520 Q 360 470 400 430 M300 560 Q 250 500 210 470" stroke="#8a5a33" stroke-width="42" fill="none" stroke-linecap="round"/>
     ${[[300, 280, 220], [160, 380, 140], [440, 380, 150], [250, 150, 130], [380, 190, 120]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${leaf}" stroke="${INK}" stroke-width="7"/>`).join('')}
     ${[[300, 280, 190], [160, 380, 114], [440, 380, 124], [250, 150, 104], [380, 190, 96]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${leaf2}"/>`).join('')}
     <path d="M200 230 Q 240 170 310 170" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".3"/>
     ${fruit ? [[250, 250], [380, 320], [190, 400], [450, 400], [320, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="${fruit}" stroke="${INK}" stroke-width="4"/>`).join('') : ''}`,
    { cut: 6 },
  )

/** The hedge/fence along the pavement. 1400×200. */
export const hedge = svgDoc(
  1400,
  200,
  `<path d="M0 200 Q 0 90 60 90 Q 80 40 140 56 Q 200 20 260 60 Q 320 30 380 70 Q 440 30 500 66 Q 560 40 620 72 Q 700 30 760 70 Q 820 34 880 70 Q 940 40 1000 70 Q 1060 36 1120 72 Q 1200 44 1260 80 Q 1330 70 1400 100 V 200 Z" fill="#4f9d4a" stroke="${INK}" stroke-width="6"/>
   <path d="M20 200 Q 20 130 80 120 Q 140 100 200 130 Q 280 100 340 134 Q 420 108 500 136 Q 600 108 700 134 Q 800 110 900 136 Q 1000 110 1100 136 Q 1200 114 1300 138 Q 1360 130 1390 150 V 200 Z" fill="#3f8a43"/>
   ${Array.from({ length: 30 }, (_, i) => `<circle cx="${40 + i * 46}" cy="${84 + (i % 3) * 18}" r="9" fill="${['#ff6b8a', '#ffd34d', '#fff'][i % 3]}" stroke="${INK}" stroke-width="2.5"/>`).join('')}`,
  { cut: 5 },
)
