import { svgDoc } from './texture'
import { starPath } from './kit'
import { INK, rand } from './style'

/*
 * Art for the world behind spread 7: Milo's house at dusk, windows lit under a
 * starry sky and a big sleepy moon.
 */

/** Stars + soft pink-lilac cloud streaks, on a transparent backdrop (2400×800). */
export const skyDecor = (() => {
  const r = rand(91)
  const stars = Array.from({ length: 120 }, () => {
    const x = r() * 2400
    const y = r() * 620
    const R = 4 + r() * r() * 22
    const tint = r() < 0.7 ? '#fff4c4' : r() < 0.5 ? '#ffd6ec' : '#cfe6ff'
    return r() < 0.3
      ? `<path d="M${x.toFixed(0)} ${(y - R * 1.6).toFixed(0)} Q ${x.toFixed(0)} ${y.toFixed(0)} ${(x + R * 1.6).toFixed(0)} ${y.toFixed(0)} Q ${x.toFixed(0)} ${y.toFixed(0)} ${x.toFixed(0)} ${(y + R * 1.6).toFixed(0)} Q ${x.toFixed(0)} ${y.toFixed(0)} ${(x - R * 1.6).toFixed(0)} ${y.toFixed(0)} Q ${x.toFixed(0)} ${y.toFixed(0)} ${x.toFixed(0)} ${(y - R * 1.6).toFixed(0)} Z" fill="${tint}"/>`
      : `<path d="${starPath(x, y, R)}" fill="${tint}"/>`
  }).join('')
  const streak = (x: number, y: number, w: number, c1: string, c2: string) =>
    `<path d="M${x} ${y} Q ${x + w * 0.1} ${y - 46} ${x + w * 0.3} ${y - 30} Q ${x + w * 0.45} ${y - 80} ${x + w * 0.62} ${y - 34} Q ${x + w * 0.84} ${y - 54} ${x + w} ${y} Q ${x + w * 0.5} ${y + 24} ${x} ${y} Z" fill="${c1}" opacity=".9"/>
     <path d="M${x + w * 0.08} ${y + 4} Q ${x + w * 0.5} ${y + 28} ${x + w * 0.94} ${y + 4} Q ${x + w * 0.5} ${y + 16} ${x + w * 0.08} ${y + 4} Z" fill="${c2}" opacity=".9"/>`
  return svgDoc(
    2400,
    800,
    `${stars}
     ${streak(120, 640, 560, '#e8a0c8', '#b8709f')}
     ${streak(820, 560, 420, '#c9a8e8', '#9a7ac8')}
     ${streak(1500, 650, 640, '#f0b0c8', '#c07aa8')}
     ${streak(1960, 520, 360, '#d4b4ec', '#a888d0')}`,
    { grain: 0.4 },
  )
})()

/** A big sleepy moon (800×800). */
export const bigMoon = svgDoc(
  800,
  800,
  `<circle cx="400" cy="400" r="330" fill="#fff4c4" stroke="#f0d98a" stroke-width="10"/>
   <circle cx="400" cy="400" r="330" fill="none" stroke="#ffffff" stroke-width="30" opacity=".35" transform="translate(-14 -14)" clip-path="none"/>
   <g fill="#f0d98a" opacity=".75">
     <circle cx="250" cy="250" r="56"/><circle cx="560" cy="300" r="36"/><circle cx="520" cy="560" r="64"/><circle cx="270" cy="540" r="30"/><circle cx="420" cy="170" r="24"/>
   </g>
   <g fill="#fffbe0" opacity=".9"><circle cx="236" cy="236" r="30"/><circle cx="500" cy="540" r="34"/></g>
   <!-- a sleepy smile -->
   <path d="M290 420 Q 330 460 372 420 M430 420 Q 470 460 512 420" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
   <path d="M346 500 Q 400 548 454 500" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
   <circle cx="262" cy="486" r="34" fill="#f4a0a0" opacity=".55"/><circle cx="540" cy="486" r="34" fill="#f4a0a0" opacity=".55"/>`,
  { cut: 8 },
)

/** Soft glow halo for behind the moon (tinted, additive). */
export const haloArt = svgDoc(
  400,
  400,
  `<radialGradient id="h"><stop offset="0" stop-color="#fff4c4" stop-opacity=".9"/><stop offset=".4" stop-color="#ffe9a0" stop-opacity=".4"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
   <circle cx="200" cy="200" r="200" fill="url(#h)"/>`,
  { grain: 0 },
)

/* --------------------------------------------------------- the house -- */

export const HOUSE = { w: 900, h: 620, units: 0.0075 }

const win = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" rx="6" fill="#fff3dc" stroke="${INK}" stroke-width="5"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2a2450"/>
   <rect x="${x - 22}" y="${y + h + 12}" width="${w + 44}" height="18" rx="4" fill="#d9c8a8" stroke="${INK}" stroke-width="4"/>`

/** Milo's bedroom window is the left one. */
export const WINDOWS = [
  { id: 'milo', x: 130, y: 346, w: 160, h: 140 },
  { id: 'lounge', x: 610, y: 346, w: 160, h: 140 },
] as const

export const house = svgDoc(
  HOUSE.w,
  HOUSE.h,
  `<!-- chimney -->
   <rect x="650" y="52" width="80" height="150" fill="#b0614a" stroke="${INK}" stroke-width="5"/>
   ${[90, 126, 162].map((y) => `<path d="M650 ${y} L 730 ${y}" stroke="#8a4a38" stroke-width="3"/>`).join('')}
   <rect x="638" y="38" width="104" height="24" rx="4" fill="#8a4a38" stroke="${INK}" stroke-width="5"/>
   <!-- roof -->
   <path d="M24 274 L 450 78 L 876 274 Z" fill="#4a5496" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   ${Array.from({ length: 5 }, (_, i) => {
     const y = 120 + i * 32
     const half = (y - 78) * 2.17 + 30
     return `<path d="M${450 - half} ${y + 32} L ${450 + half} ${y + 32}" stroke="#39427a" stroke-width="5"/>${Array.from({ length: Math.ceil(half / 24) }, (_, k) => `<path d="M${450 - half + k * 48 + (i % 2) * 24} ${y + 32} l 0 -28" stroke="#39427a" stroke-width="3"/>`).join('')}`
   }).join('')}
   <path d="M450 78 L 876 274" stroke="#6a76b8" stroke-width="8" opacity=".5"/>
   <path d="${`M450 110 l 12 24 26 4 -19 18 5 26 -24 -13 -24 13 5 -26 -19 -18 26 -4 z`}" fill="#ffe27a" stroke="#d9a030" stroke-width="3" stroke-linejoin="round" transform="translate(0 30) scale(1)"/>
   <rect x="10" y="262" width="880" height="26" rx="4" fill="#fff3dc" stroke="${INK}" stroke-width="5"/>
   <!-- walls -->
   <rect x="64" y="288" width="772" height="316" fill="#e8c8a8" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 8 }, (_, i) => `<path d="M66 ${312 + i * 36} L 834 ${312 + i * 36}" stroke="#cfa986" stroke-width="4"/><path d="M66 ${316 + i * 36} L 834 ${316 + i * 36}" stroke="#f4dcc0" stroke-width="2"/>`).join('')}
   <rect x="64" y="556" width="772" height="48" fill="#8a7a9a" stroke="${INK}" stroke-width="5"/>
   ${Array.from({ length: 10 }, (_, i) => `<path d="M${64 + i * 77} 556 L ${64 + i * 77} 604" stroke="#6e5f7e" stroke-width="4"/>`).join('')}
   <!-- windows (the glass is a lit card in front) -->
   ${WINDOWS.map((w) => win(w.x, w.y, w.w, w.h)).join('')}
   ${WINDOWS.map((w) => `<rect x="${w.x - 52}" y="${w.y - 8}" width="30" height="${w.h + 16}" rx="4" fill="#4f9d94" stroke="${INK}" stroke-width="4"/><rect x="${w.x + w.w + 22}" y="${w.y - 8}" width="30" height="${w.h + 16}" rx="4" fill="#4f9d94" stroke="${INK}" stroke-width="4"/>
     ${[0, 1, 2, 3].map((k) => `<path d="M${w.x - 48} ${w.y + 10 + k * (w.h / 4)} l 22 0 M${w.x + w.w + 26} ${w.y + 10 + k * (w.h / 4)} l 22 0" stroke="#3a7a72" stroke-width="3"/>`).join('')}
     <rect x="${w.x - 14}" y="${w.y + w.h + 34}" width="${w.w + 28}" height="26" rx="4" fill="#a8683c" stroke="${INK}" stroke-width="4"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${w.x + i * 30}" cy="${w.y + w.h + 32}" r="11" fill="${['#e8727a', '#ffd34d', '#c9a0e8'][i % 3]}" stroke="${INK}" stroke-width="2.5"/>`).join('')}`).join('')}
   <!-- the front door under a little porch roof -->
   <path d="M326 392 L 450 336 L 574 392 Z" fill="#4a5496" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="342" y="388" width="12" height="216" fill="#fff3dc" stroke="${INK}" stroke-width="4"/><rect x="546" y="388" width="12" height="216" fill="#fff3dc" stroke="${INK}" stroke-width="4"/>
   <path d="M376 604 L 376 450 Q 376 418 450 418 Q 524 418 524 450 L 524 604 Z" fill="#c9524a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M396 596 L 396 456 Q 396 436 450 436 Q 504 436 504 456 L 504 596" stroke="#a83a33" stroke-width="5" fill="none"/>
   <circle cx="450" cy="478" r="20" fill="#2a2450" stroke="${INK}" stroke-width="4"/>
   <circle cx="494" cy="530" r="8" fill="#e9c25a" stroke="${INK}" stroke-width="3"/>
   <path d="M424 516 L 476 516 L 470 582 L 430 582 Z" fill="none" stroke="#a83a33" stroke-width="4"/>
   <rect x="352" y="594" width="196" height="16" fill="#b0a0c0" stroke="${INK}" stroke-width="4"/><rect x="334" y="606" width="232" height="12" fill="#9a8aac" stroke="${INK}" stroke-width="4"/>
   <rect x="394" y="586" width="112" height="10" rx="4" fill="#e8a23a" stroke="${INK}" stroke-width="3"/>
   <rect x="816" y="286" width="14" height="316" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/>`,
  { cut: 6 },
)

/** Warm lit glass for a window (a card in front of the house, emissive). */
export const windowLit = (w: number, h: number, kind: 'milo' | 'plain') =>
  svgDoc(
    w,
    h,
    `<linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffc864"/></linearGradient>
     <rect width="${w}" height="${h}" fill="url(#wl)"/>
     ${
       kind === 'milo'
         ? `<path d="M0 0 L ${w * 0.3} 0 Q ${w * 0.22} ${h * 0.5} ${w * 0.26} ${h} L 0 ${h} Z M${w} 0 L ${w * 0.7} 0 Q ${w * 0.78} ${h * 0.5} ${w * 0.74} ${h} L ${w} ${h} Z" fill="#d9768a" stroke="${INK}" stroke-width="3"/>
            <path d="${starPath(w * 0.5, h * 0.4, w * 0.12)}" fill="#fff6c8" opacity=".9"/>
            <path d="M${w * 0.36} ${h} L ${w * 0.36} ${h * 0.7} Q ${w * 0.5} ${h * 0.56} ${w * 0.64} ${h * 0.7} L ${w * 0.64} ${h} Z" fill="#f3b86a" opacity=".7"/>`
         : `<path d="M0 0 L ${w * 0.22} 0 Q ${w * 0.16} ${h * 0.5} ${w * 0.2} ${h} L 0 ${h} Z M${w} 0 L ${w * 0.78} 0 Q ${w * 0.84} ${h * 0.5} ${w * 0.8} ${h} L ${w} ${h} Z" fill="#e8a56a" opacity=".9"/>
            <path d="M${w * 0.4} ${h} L ${w * 0.4} ${h * 0.6} Q ${w * 0.5} ${h * 0.46} ${w * 0.6} ${h * 0.6} L ${w * 0.6} ${h} Z" fill="#c98a4a" opacity=".5"/>`
     }
     <rect x="${w / 2 - 5}" y="0" width="10" height="${h}" fill="#fff3dc" stroke="${INK}" stroke-width="2.5"/>
     <rect x="0" y="${h / 2 - 5}" width="${w}" height="10" fill="#fff3dc" stroke="${INK}" stroke-width="2.5"/>`,
    { grain: 0 },
  )

/** Milo's window with the light out: dark blue glass and glow-in-the-dark stars. */
export const windowDark = (w: number, h: number) =>
  svgDoc(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#222b6e"/>
     <path d="M0 0 L ${w * 0.3} 0 Q ${w * 0.22} ${h * 0.5} ${w * 0.26} ${h} L 0 ${h} Z M${w} 0 L ${w * 0.7} 0 Q ${w * 0.78} ${h * 0.5} ${w * 0.74} ${h} L ${w} ${h} Z" fill="#7a4a74" stroke="${INK}" stroke-width="3"/>
     ${[[0.42, 0.22, 9], [0.58, 0.3, 7], [0.5, 0.52, 11], [0.38, 0.62, 6], [0.62, 0.7, 8]].map(([x, y, R]) => `<path d="${starPath(w * x, h * y, R)}" fill="#f6ffb0"/>`).join('')}
     <circle cx="${w * 0.5}" cy="${h * 0.52}" r="${w * 0.2}" fill="#d8ff8a" opacity=".12"/>
     <rect x="${w / 2 - 5}" y="0" width="10" height="${h}" fill="#e8d8c0" stroke="${INK}" stroke-width="2.5"/>
     <rect x="0" y="${h / 2 - 5}" width="${w}" height="10" fill="#e8d8c0" stroke="${INK}" stroke-width="2.5"/>`,
    { grain: 0 },
  )

/** String lights along the eaves (transparent, emissive). */
export const eaveLights = svgDoc(
  880,
  120,
  `<path d="M0 20 ${Array.from({ length: 11 }, (_, i) => `Q ${40 + i * 80} 80 ${80 + i * 80} 20`).join(' ')}" stroke="${INK}" stroke-width="5" fill="none"/>
   ${Array.from({ length: 11 }, (_, i) => {
     const c = ['#ffd34d', '#ff8aa8', '#7fd8ff', '#9be58a'][i % 4]
     return `<circle cx="${40 + i * 80}" cy="${58}" r="15" fill="${c}" stroke="${INK}" stroke-width="3.5"/><circle cx="${35 + i * 80}" cy="${52}" r="5" fill="#fff" opacity=".8"/>`
   }).join('')}`,
  { grain: 0 },
)

/** Lantern by the door (emissive). */
export const lantern = svgDoc(
  120,
  200,
  `<path d="M60 0 L 60 30" stroke="${INK}" stroke-width="6"/>
   <path d="M36 40 L 84 40 L 76 30 L 44 30 Z" fill="#3a3a44" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M38 40 L 82 40 L 90 150 L 30 150 Z" fill="#ffe9a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M60 40 L 60 150 M44 40 L 38 150 M76 40 L 82 150" stroke="#3a3a44" stroke-width="4"/>
   <ellipse cx="60" cy="96" rx="14" ry="22" fill="#fff8d0"/>
   <rect x="28" y="148" width="64" height="14" rx="4" fill="#3a3a44" stroke="${INK}" stroke-width="4"/>`,
  { cut: 3 },
)

/* ------------------------------------------------------ the garden -- */

export const lawn = (() => {
  const r = rand(14)
  return svgDoc(
    2600,
    1100,
    `<path d="M0 160 Q 400 80 900 130 Q 1500 190 2000 110 Q 2400 60 2600 120 L 2600 1100 L 0 1100 Z" fill="#3f7a6c"/>
     <path d="M0 260 Q 500 190 1000 240 Q 1600 290 2100 210 Q 2400 170 2600 220" stroke="#2f6a5c" stroke-width="40" fill="none"/>
     ${Array.from({ length: 110 }, () => `<path d="M${(r() * 2600).toFixed(0)} ${(300 + r() * 780).toFixed(0)} l -8 -26 m 8 26 l 2 -30 m -2 30 l 10 -22" stroke="#2c6558" stroke-width="5" stroke-linecap="round"/>`).join('')}
     ${Array.from({ length: 26 }, () => {
       const x = r() * 2600
       const y = 300 + r() * 760
       const c = ['#ffd6ec', '#fff4c4', '#e0c8ff'][Math.floor(r() * 3)]
       return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="${c}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.5" fill="#ffb02e"/>`
     }).join('')}
     <!-- winding stone path to the door -->
     <path d="M1330 120 Q 1300 300 1250 480 Q 1190 700 1230 900 Q 1250 1020 1200 1100 L 1540 1100 Q 1560 960 1480 780 Q 1440 640 1500 460 Q 1530 320 1520 120 Z" fill="#c9b6a0"/>
     ${[[1400, 180], [1380, 300], [1330, 420], [1300, 540], [1290, 660], [1330, 780], [1360, 900], [1330, 1010]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="76" ry="${40 + ((x as number) % 7)}" fill="#e0d0bc" stroke="#a8947c" stroke-width="5"/>`).join('')}`,
    { grain: 0.6 },
  )
})()

export const fence = svgDoc(
  1600,
  300,
  `<rect x="0" y="100" width="1600" height="26" fill="#f2f0f6" stroke="${INK}" stroke-width="5"/>
   <rect x="0" y="206" width="1600" height="26" fill="#f2f0f6" stroke="${INK}" stroke-width="5"/>
   ${Array.from({ length: 20 }, (_, i) => `<path d="M${20 + i * 80} 300 L ${20 + i * 80} 52 L ${50 + i * 80} 22 L ${80 + i * 80} 52 L ${80 + i * 80} 300 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M${28 + i * 80} 60 L ${28 + i * 80} 296" stroke="#e4dff0" stroke-width="5"/>`).join('')}`,
  { cut: 6 },
)

export const mailbox = svgDoc(
  200,
  380,
  `<rect x="86" y="170" width="28" height="206" fill="#a8683c" stroke="${INK}" stroke-width="5"/>
   <path d="M20 110 Q 20 30 100 30 Q 180 30 180 110 L 180 180 L 20 180 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M34 120 Q 34 48 100 46" stroke="#7da0ec" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
   <rect x="60" y="112" width="80" height="34" rx="6" fill="#fdf3d8" stroke="${INK}" stroke-width="3.5"/>
   <text x="100" y="138" text-anchor="middle" font-family="Fredoka, 'Arial Rounded MT Bold', sans-serif" font-weight="700" font-size="26" fill="#c9524a">MILO</text>
   <path d="M180 90 L 214 90 L 214 40 L 190 40" stroke="${INK}" stroke-width="12" fill="none" stroke-linejoin="round"/>
   <path d="M180 90 L 214 90 L 214 40 L 190 40" stroke="#e8322b" stroke-width="6" fill="none" stroke-linejoin="round"/>`,
  { cut: 5 },
)

export const streetLamp = svgDoc(
  200,
  760,
  `<path d="M100 120 L 100 730" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M100 120 L 100 730" stroke="#4a4a58" stroke-width="12" stroke-linecap="round"/>
   <rect x="64" y="706" width="72" height="40" rx="8" fill="#4a4a58" stroke="${INK}" stroke-width="5"/>
   <path d="M60 40 L 140 40 L 128 8 L 72 8 Z" fill="#4a4a58" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M62 44 L 138 44 L 150 126 L 50 126 Z" fill="#ffe9a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M100 44 L 100 126" stroke="#4a4a58" stroke-width="4"/>
   <rect x="48" y="122" width="104" height="14" rx="4" fill="#4a4a58" stroke="${INK}" stroke-width="4"/>`,
  { cut: 5 },
)

/** A dark-green round tree strung with fairy lights (700×1000). */
export const nightTree = (leaf: string, leaf2: string, seed: number) => {
  const r = rand(seed)
  const lights = Array.from({ length: 14 }, (_, i) => {
    const a = r() * Math.PI * 2
    const d = 60 + r() * 200
    return `<circle cx="${(350 + Math.cos(a) * d).toFixed(0)}" cy="${(300 + Math.sin(a) * d * 0.8).toFixed(0)}" r="9" fill="${['#ffd34d', '#ff8aa8', '#7fd8ff'][i % 3]}" stroke="${INK}" stroke-width="3"/>`
  }).join('')
  return svgDoc(
    700,
    1000,
    `<path d="M320 1000 L 330 600 Q 300 520 250 480 M330 640 Q 380 560 440 520" stroke="${INK}" stroke-width="56" fill="none" stroke-linecap="round"/>
     <path d="M320 1000 L 330 600 Q 300 520 250 480 M330 640 Q 380 560 440 520" stroke="#6a4630" stroke-width="42" fill="none" stroke-linecap="round"/>
     ${[[350, 300, 230], [190, 420, 160], [520, 410, 170], [300, 160, 150], [470, 210, 140]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${leaf}" stroke="${INK}" stroke-width="7"/>`).join('')}
     ${[[350, 300, 200], [190, 420, 132], [520, 410, 142], [300, 160, 124], [470, 210, 114]].map(([x, y, rr]) => `<circle cx="${(x as number) + 14}" cy="${(y as number) + 18}" r="${(rr as number) - 20}" fill="${leaf2}" opacity=".7"/>`).join('')}
     ${lights}`,
    { cut: 6 },
  )
}

export const bushNight = svgDoc(
  400,
  220,
  `<path d="M10 210 Q 0 150 54 134 Q 66 60 138 70 Q 190 18 246 66 Q 320 56 332 130 Q 394 150 384 210 Z" fill="#2f6a5c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M20 210 Q 200 176 372 210 Z" fill="#245648"/>
   ${[[90, 130], [170, 100], [250, 120], [300, 160], [130, 170]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" fill="${['#ffd6ec', '#fff4c4', '#e0c8ff'][i % 3]}" stroke="${INK}" stroke-width="2.5"/>`).join('')}`,
  { cut: 5 },
)

export const boxCarToy = svgDoc(
  420,
  300,
  `<path d="M70 120 L 44 54 L 190 46 L 210 120 Z M350 120 L 376 54 L 230 46 L 210 120 Z" fill="#b9864a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="40" y="114" width="340" height="140" rx="5" fill="#d3a062" stroke="${INK}" stroke-width="6"/>
   <rect x="190" y="114" width="40" height="70" fill="#e9c48a" opacity=".9"/>
   <text x="260" y="206" text-anchor="middle" font-family="Fredoka, 'Arial Rounded MT Bold', sans-serif" font-weight="700" font-size="48" fill="#d0372a" transform="rotate(-5 260 206)">MILO</text>
   ${[100, 320].map((x) => `<circle cx="${x}" cy="258" r="42" fill="#2b2b2b" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="258" r="24" fill="#ffc21a" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="258" r="7" fill="#9aa3ad"/>`).join('')}
   <path d="M340 110 L 340 30" stroke="${INK}" stroke-width="7"/><path d="M342 30 Q 382 18 404 38 Q 372 46 380 70 Q 358 60 342 70 Z" fill="#3ccf5a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  { cut: 5 },
)

export const cat = svgDoc(
  260,
  300,
  `<path d="M190 270 Q 250 260 240 200 Q 232 160 206 170" stroke="${INK}" stroke-width="30" fill="none" stroke-linecap="round"/>
   <path d="M190 270 Q 250 260 240 200 Q 232 160 206 170" stroke="#3a3a4e" stroke-width="20" fill="none" stroke-linecap="round"/>
   <path d="M60 290 Q 30 200 80 150 L 150 150 Q 200 200 176 290 Z" fill="#3a3a4e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M62 62 L 74 8 L 108 42 L 142 8 L 154 62 Q 168 110 108 120 Q 48 110 62 62 Z" fill="#3a3a4e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M76 24 L 86 46 L 70 52 Z M140 24 L 130 46 L 146 52 Z" fill="#e8a0b8"/>
   <path d="M80 82 q 10 8 20 0 M116 82 q 10 8 20 0" stroke="#ffe9a0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M104 96 l 4 5 l 4 -5 Z" fill="#e8a0b8"/>
   <path d="M60 96 L 30 90 M60 104 L 30 108 M156 96 L 186 90 M156 104 L 186 108" stroke="#cfcfe0" stroke-width="3" stroke-linecap="round"/>
   <ellipse cx="100" cy="290" rx="36" ry="12" fill="#3a3a4e" stroke="${INK}" stroke-width="4"/><ellipse cx="148" cy="290" rx="30" ry="12" fill="#3a3a4e" stroke="${INK}" stroke-width="4"/>`,
  { cut: 4 },
)

export const smokePuff = svgDoc(
  200,
  200,
  `<circle cx="100" cy="110" r="52" fill="#c9bfe0"/><circle cx="62" cy="128" r="34" fill="#c9bfe0"/><circle cx="140" cy="126" r="38" fill="#c9bfe0"/><circle cx="100" cy="76" r="34" fill="#d8d0ec"/>
   <path d="M40 150 Q 100 182 164 150 Q 150 172 100 176 Q 54 172 40 150 Z" fill="#b0a4cc"/>`,
  { cut: 4 },
)

export const firefly = svgDoc(
  60,
  60,
  `<radialGradient id="ff"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#e8ff90"/><stop offset="1" stop-color="#e8ff90" stop-opacity="0"/></radialGradient>
   <circle cx="30" cy="30" r="30" fill="url(#ff)"/><circle cx="30" cy="30" r="7" fill="#fffbe0"/>`,
  { grain: 0 },
)

export const farHills = (a: string, b: string, w = 1200, h = 360) =>
  svgDoc(
    w,
    h,
    `<path d="M0 ${h} L 0 ${h * 0.6} Q ${w * 0.12} ${h * 0.18} ${w * 0.3} ${h * 0.34} Q ${w * 0.46} ${h * 0.5} ${w * 0.6} ${h * 0.24} Q ${w * 0.8} ${h * 0.04} ${w} ${h * 0.5} L ${w} ${h} Z" fill="${a}"/>
     <path d="M0 ${h} L 0 ${h * 0.8} Q ${w * 0.2} ${h * 0.5} ${w * 0.4} ${h * 0.7} Q ${w * 0.7} ${h * 0.9} ${w} ${h * 0.66} L ${w} ${h} Z" fill="${b}" opacity=".6"/>`,
    { cut: 0, grain: 0.5 },
  )

/** a few little rooftops/trees of the neighbourhood, with lit windows (1600×260) */
export const townline = (() => {
  const r = rand(66)
  let out = ''
  let x = 0
  while (x < 1600) {
    const w = 80 + r() * 120
    const h = 70 + r() * 150
    out += `<path d="M${x} 260 L ${x} ${260 - h} L ${x + w / 2} ${260 - h - 40} L ${x + w} ${260 - h} L ${x + w} 260 Z" fill="#2a2660"/>`
    for (let k = 0; k < 3; k++) {
      if (r() < 0.6) out += `<rect x="${(x + 16 + r() * (w - 44)).toFixed(0)}" y="${(260 - h + 14 + r() * (h - 50)).toFixed(0)}" width="14" height="18" fill="#ffd56a"/>`
    }
    x += w + 10 + r() * 30
  }
  return svgDoc(1600, 260, out, { grain: 0.4 })
})()
