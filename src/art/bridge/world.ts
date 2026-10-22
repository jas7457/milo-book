import { svgDoc } from '../texture'
import { starPath } from '../kit'
import { INK, rand } from '../style'
import { daisy, lilyPad, pineFrag, ripple, roundTreeFrag, smooth, stone, tuft } from './frags'

/* Art for the big river valley behind the book. */

type Ctrl = number[][]
function spline(c: Ctrl) {
  return (y: number) => {
    let i = 0
    while (i < c.length - 2 && y > c[i + 1][0]) i++
    const p0 = c[Math.max(0, i - 1)]
    const p1 = c[i]
    const p2 = c[i + 1]
    const p3 = c[Math.min(c.length - 1, i + 2)]
    const h = p2[0] - p1[0]
    const t = Math.min(1.1, Math.max(-0.1, (y - p1[0]) / h))
    const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * h
    const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * h
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2
  }
}

/** floor of the valley: art 3400×1500 = 34×15 world units, art-top = far. 100 px = 1 unit; x = (px − 1700)/100. */
export const FLOOR = { w: 3400, h: 1500, z0: -2.4 }
const rx = spline([[-50, 2500], [300, 2350], [700, 2100], [1100, 1880], [1500, 1720], [1560, 1700]])
const rw = spline([[-50, 100], [300, 150], [700, 250], [1100, 380], [1500, 540], [1560, 560]])

export const valleyFloor = (() => {
  const r = rand(9)
  const ys: number[] = []
  for (let y = -40; y <= 1560; y += 20) ys.push(y)
  const wob = (side: number, y: number) => 10 * Math.sin(y / 40 + side) + 6 * Math.sin(y / 17 + side * 3)
  const poly = (grow: number) => {
    const l = ys.map((y) => `${(rx(y) - rw(y) / 2 - grow + wob(-1, y)).toFixed(0)} ${y}`)
    const rr = ys.map((y) => `${(rx(y) + rw(y) / 2 + grow + wob(1, y)).toFixed(0)} ${y}`).reverse()
    return `M${l.join(' L')} L${rr.join(' L')} Z`
  }
  const land = (x: number, y: number, pad = 90) => Math.abs(x - rx(y)) > rw(y) / 2 + pad
  let meadow = ''
  for (let i = 0; i < 26; i++) {
    const y = i * 62
    meadow += `<rect x="0" y="${y}" width="3400" height="31" fill="#ffffff" opacity=".06"/>`
  }
  let deco = ''
  for (let i = 0; i < 230; i++) {
    const x = r() * 3400
    const y = 20 + r() * 1460
    if (!land(x, y)) continue
    const s = 0.8 + (y / 1500) * 1.3
    if (i % 3) deco += tuft(x.toFixed(0) as unknown as number, y.toFixed(0) as unknown as number, s, r() < 0.5 ? '#5aa64a' : '#4a9a40')
    else deco += daisy(x, y, s * 1.1, r() < 0.6 ? '#fff' : '#ffd0e0')
  }
  const streaks = [-0.3, -0.1, 0.12, 0.32]
    .map((k, i) => `<path d="M${ys.map((y) => `${(rx(y) + k * rw(y)).toFixed(0)} ${y}`).join(' L')}" stroke="#c8efff" stroke-width="${10 + i * 2}" fill="none" stroke-linecap="round" stroke-dasharray="${70 + i * 20} ${170 + i * 30}" opacity=".5"/>`)
    .join('')
  let rip = ''
  for (let i = 0; i < 46; i++) {
    const y = 40 + r() * 1450
    rip += ripple((rx(y) + (r() - 0.5) * rw(y) * 0.8).toFixed(0) as unknown as number, y.toFixed(0) as unknown as number, 40 + (y / 1500) * 80, '#fff', 0.5)
  }
  const pads = [[1250, 1], [1330, 0], [1060, 0], [1440, 1]]
    .map(([y, f], i) => lilyPad(rx(y) + (i % 2 ? 1 : -1) * rw(y) * 0.32, y, 26 + (y / 1500) * 30, !!f))
    .join('')
  let rocks = ''
  for (let y = 60; y < 1500; y += 90 + r() * 80) {
    for (const side of [-1, 1]) {
      if (r() < 0.5) rocks += stone((rx(y) + side * (rw(y) / 2 + 40)).toFixed(0) as unknown as number, y, 12 + (y / 1500) * 22, 8 + (y / 1500) * 14, r() < 0.5 ? '#b9bec6' : '#cbc3b4')
    }
  }
  // fields far away (a patchwork), and the road that winds to the town
  const field = (x: number, y: number, w: number, h: number, c: string, rot: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="${w}" height="${h}" fill="${c}" stroke="#5a9a44" stroke-width="3"/>${Array.from({ length: Math.floor(w / 20) }, (_, i) => `<path d="M${i * 20 + 10} 4 L ${i * 20 + 10} ${h - 4}" stroke="#fff" stroke-width="3" opacity=".25"/>`).join('')}</g>`
  const fields = [
    field(2650, 330, 220, 110, '#e9d65a', -4), field(2900, 400, 200, 90, '#9fd86a', 3), field(2780, 470, 260, 110, '#d9b85a', -2),
    field(3050, 240, 200, 80, '#b6e070', 2), field(2400, 160, 180, 70, '#e4d060', 0), field(450, 300, 240, 100, '#9fd86a', 3), field(700, 380, 200, 90, '#e9d65a', -3),
  ].join('')
  const roadR = smooth([[2230, 1130], [2450, 960], [2560, 820], [2480, 690], [2640, 580], [2560, 520], [2480, 470]])
  const roadL = smooth([[1530, 1130], [1200, 1240], [900, 1360], [640, 1500]])
  const road = (d: string, w0: number) => `<path d="${d}" stroke="#b89460" stroke-width="${w0 + 18}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#ead29a" stroke-width="${w0}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#f6e4b4" stroke-width="${w0 * 0.3}" fill="none" stroke-dasharray="40 50" opacity=".7"/>`
  return svgDoc(
    FLOOR.w,
    FLOOR.h,
    `<linearGradient id="wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76d6f8"/><stop offset="1" stop-color="#3a9fe4"/></linearGradient>
     <linearGradient id="mf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a4dc7e"/><stop offset="1" stop-color="#7cc457"/></linearGradient>
     <rect width="3400" height="1500" fill="url(#mf)"/>
     ${meadow}
     ${fields}
     <path d="${poly(70)}" fill="#e9d6a0"/><path d="${poly(40)}" fill="#d9c07e"/>
     <path d="${poly(0)}" fill="url(#wf)" stroke="#2a78b8" stroke-width="6" stroke-linejoin="round"/>
     ${streaks}${rip}${pads}${rocks}
     ${road(roadR, 80)}${road(roadL, 110)}
     ${deco}
     <path d="${starPath(2480, 450, 26, 10)}" fill="#ffd34d" stroke="#e9a23b" stroke-width="3"/>`,
    { grain: 0.8 },
  )
})()

const hillBody = (w: number, h: number, c1: string, c2: string, hi: string) => `
  <path d="M0 ${h} L 0 ${h * 0.7} Q ${w * 0.12} ${h * 0.2} ${w * 0.4} ${h * 0.12} Q ${w * 0.7} ${h * 0.05} ${w * 0.88} ${h * 0.4} Q ${w * 0.97} ${h * 0.6} ${w} ${h * 0.72} L ${w} ${h} Z" fill="${c1}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M${w * 0.1} ${h} Q ${w * 0.3} ${h * 0.5} ${w * 0.62} ${h * 0.55} Q ${w * 0.9} ${h * 0.6} ${w * 0.95} ${h} Z" fill="${c2}" opacity=".5"/>
  <path d="M${w * 0.03} ${h * 0.62} Q ${w * 0.14} ${h * 0.24} ${w * 0.4} ${h * 0.16} Q ${w * 0.66} ${h * 0.1} ${w * 0.82} ${h * 0.34}" stroke="${hi}" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>`

export const hillLeft = svgDoc(
  1500,
  560,
  `${hillBody(1500, 560, '#6fc36a', '#4fa34f', '#a2e394')}
   ${[[220, 300, 1.1], [330, 260, 0.9], [980, 250, 1.2], [1110, 280, 0.9], [1280, 340, 1.0]].map(([x, y, s]) => pineFrag(x, y + 120, s, '#3f9a5a')).join('')}
   ${[[520, 240, 0.8], [640, 270, 0.65], [800, 230, 0.7]].map(([x, y, s]) => roundTreeFrag(x, y + 160, s)).join('')}`,
  { cut: 6 },
)

export const hillRight = svgDoc(
  1500,
  560,
  `${hillBody(1500, 560, '#8fcf62', '#6fb44a', '#c4ee90')}
   ${[[1180, 280, 1.2], [1300, 320, 0.95], [1400, 360, 0.8], [180, 330, 0.9]].map(([x, y, s]) => pineFrag(x, y + 120, s, '#4aa86a')).join('')}
   ${[[320, 250, 0.7], [440, 290, 0.6]].map(([x, y, s]) => roundTreeFrag(x, y + 160, s, '#7acb5e', '#58a844')).join('')}
   ${[[700, 300], [780, 330], [900, 320]].map(([x, y]) => `<g transform="translate(${x} ${y + 100})"><ellipse cx="0" cy="26" rx="46" ry="10" fill="#000" opacity=".12"/><rect x="-44" y="-6" width="88" height="34" rx="14" fill="#e9c15a" stroke="${INK}" stroke-width="4"/><path d="M-30 -4 L -30 26 M0 -4 L 0 26 M30 -4 L 30 26" stroke="#c99a2e" stroke-width="3"/></g>`).join('')}`,
  { cut: 6 },
)

export const mountains = (() => {
  const W = 3200
  const H = 760
  const peaks: [number, number][] = [[260, 220], [820, 120], [1500, 260], [2200, 100], [2860, 240]]
  return svgDoc(
    W,
    H,
    `<path d="M0 ${H} L 0 460 L 260 220 L 480 420 L 820 120 L 1100 400 L 1300 300 L 1500 260 L 1800 420 L 2200 100 L 2500 400 L 2700 320 L 2860 240 L ${W} 440 L ${W} ${H} Z" fill="#a9caee" stroke="#86a8d4" stroke-width="6" stroke-linejoin="round"/>
     <path d="M820 120 L 1100 400 L 960 ${H} L 760 380 Z M2200 100 L 2500 400 L 2340 ${H} L 2130 360 Z M260 220 L 480 420 L 380 ${H} L 220 380 Z" fill="#8fb4de" opacity=".55"/>
     ${peaks.map(([x, y]) => `<path d="M${x} ${y} L ${x - 90} ${y + 120} L ${x - 44} ${y + 100} L ${x - 8} ${y + 140} L ${x + 32} ${y + 100} L ${x + 90} ${y + 120} Z" fill="#fff" stroke="#8fb0d8" stroke-width="4" stroke-linejoin="round"/>`).join('')}`,
    { cut: 0, grain: 0.7 },
  )
})()

export const birdBody = svgDoc(
  120,
  80,
  `<path d="M12 44 L 30 30 Q 70 20 96 36 Q 108 44 100 52 Q 70 64 34 56 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
   <path d="M94 38 L 116 46 L 94 50 Z" fill="#ff9a2e" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
   <circle cx="82" cy="40" r="4" fill="${INK}"/><path d="M12 44 L 0 36 M12 44 L 0 50" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  { cut: 3 },
)
export const birdWing = svgDoc(
  100,
  70,
  `<path d="M6 60 Q 20 10 60 6 Q 80 4 96 14 Q 70 20 60 60 Z" fill="#e8f2fb" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M30 50 Q 44 26 70 14" stroke="#9ab8d8" stroke-width="4" fill="none" stroke-linecap="round"/>`,
)

export const boat = svgDoc(
  420,
  420,
  `<ellipse cx="210" cy="372" rx="190" ry="30" fill="#bdeaff" opacity=".7" stroke="#fff" stroke-width="5"/>
   <path d="M210 40 L 210 290" stroke="${INK}" stroke-width="12"/><path d="M210 40 L 210 290" stroke="#c9a06a" stroke-width="6"/>
   <path d="M222 50 Q 330 160 340 270 L 222 270 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M198 70 Q 120 160 90 260 L 198 260 Z" fill="#ffe27a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M60 290 L 360 290 Q 340 360 290 364 L 130 364 Q 80 360 60 290 Z" fill="#e8322b" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M70 312 L 350 312" stroke="#fff" stroke-width="9"/>
   <path d="M210 40 L 252 52 L 210 66 Z" fill="#3a8be0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  { cut: 5 },
)
