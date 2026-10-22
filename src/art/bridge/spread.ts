import { svgDoc } from '../texture'
import { starPath } from '../kit'
import { INK, rand } from '../style'
import { FONT, daisy, fishFrag, lilyPad, reedFrag, ripple, smooth, stone, tuft } from './frags'

/* The painting printed across both pages: a river valley with a gap where the bridge goes. */

/** river centre-line and width at a given y of the 2560×1760 spread */
const RC = [[-60, 1555], [300, 1600], [560, 1710], [760, 1800], [1000, 1765], [1300, 1620], [1560, 1480], [1820, 1400]]
export const riverX = (y: number) => {
  let i = 0
  while (i < RC.length - 2 && y > RC[i + 1][0]) i++
  const p0 = RC[Math.max(0, i - 1)]
  const p1 = RC[i]
  const p2 = RC[i + 1]
  const p3 = RC[Math.min(RC.length - 1, i + 2)]
  const h = p2[0] - p1[0]
  const t = Math.min(1.1, Math.max(-0.1, (y - p1[0]) / h))
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0])) * h
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0])) * h
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2
}
export const riverW = (y: number) => 667 + y * 0.07
const wob = (side: number, y: number) => 16 * Math.sin(y / 53 + side * 2) + 9 * Math.sin(y / 23 + side)
const edgeX = (side: number, y: number, grow = 0) => riverX(y) + side * (riverW(y) / 2 + grow) + wob(side, y)

function riverPoly(grow: number) {
  const ys: number[] = []
  for (let y = -40; y <= 1800; y += 20) ys.push(y)
  const l = ys.map((y) => `${edgeX(-1, y, grow).toFixed(0)} ${y}`)
  const r = ys.map((y) => `${edgeX(1, y, grow).toFixed(0)} ${y}`).reverse()
  return `M${l.join(' L')} L${r.join(' L')} Z`
}

const onLand = (x: number, y: number, pad = 130) => Math.abs(x - riverX(y)) > riverW(y) / 2 + pad

function grass() {
  const r = rand(41)
  let out = ''
  for (let i = 0; i < 46; i++) {
    const x = r() * 2560
    const y = r() * 1760
    if (!onLand(x, y, 60)) continue
    out += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(80 + r() * 140).toFixed(0)}" ry="${(30 + r() * 50).toFixed(0)}" fill="${r() < 0.5 ? '#86c95f' : '#a4de7a'}" opacity=".5"/>`
  }
  for (let i = 0; i < 150; i++) {
    const x = r() * 2560
    const y = 60 + r() * 1700
    if (!onLand(x, y, 150) || Math.abs(x - 1280) < 14) continue
    out += tuft(x.toFixed(0) as unknown as number, y.toFixed(0) as unknown as number, 0.8 + r() * 0.6, r() < 0.5 ? '#5aa64a' : '#4a9a40')
  }
  for (let i = 0; i < 46; i++) {
    const x = r() * 2560
    const y = 80 + r() * 1680
    if (!onLand(x, y, 170) || Math.abs(x - 1280) < 30) continue
    const k = r()
    out += daisy(x, y, 0.8 + r() * 0.5, k < 0.5 ? '#ffffff' : k < 0.75 ? '#ffd0e0' : '#fff0a0', k < 0.75 ? '#ffd34d' : '#e8802b')
  }
  return out
}

function water() {
  const r = rand(77)
  const ys: number[] = []
  for (let y = -40; y <= 1800; y += 20) ys.push(y)
  // flowing streaks that follow the bend of the river
  const streaks = [-0.32, -0.12, 0.12, 0.32]
    .map((k, i) => {
      const pts = ys.map((y) => `${(riverX(y) + k * riverW(y) + 12 * Math.sin(y / 70 + i)).toFixed(0)} ${y}`)
      return `<path d="M${pts.join(' L')}" stroke="#bdeaff" stroke-width="${i % 2 ? 9 : 14}" fill="none" stroke-linecap="round" stroke-dasharray="${60 + i * 20} ${150 + i * 30}" opacity=".55"/>`
    })
    .join('')
  let rip = ''
  for (let i = 0; i < 40; i++) {
    const y = 60 + r() * 1660
    const x = riverX(y) + (r() - 0.5) * riverW(y) * 0.8
    rip += ripple(x.toFixed(0) as unknown as number, y.toFixed(0) as unknown as number, 50 + r() * 50, '#ffffff', 0.45)
  }
  const fishes = [
    [riverX(430) - 120, 430, 80, '#ff9a3c', 1.0],
    [riverX(560) + 150, 560, 96, '#ffbf3c', 0.8],
    [riverX(1250) - 220, 1250, 70, '#ff7a5c', 1.1],
    [riverX(1420) + 120, 1420, 105, '#ff9a3c', 0.9],
    [riverX(1580) - 60, 1580, 85, '#ffd23c', 0.75],
  ]
    .map(([x, y, rot, c, s]) => fishFrag(x as number, y as number, rot as number, c as string, s as number))
    .join('')
  const pads = [
    [riverX(310) - 190, 310, 40, 1],
    [riverX(340) - 120, 365, 30, 0],
    [riverX(1130) + 230, 1130, 46, 1],
    [riverX(1190) + 170, 1230, 34, 0],
    [riverX(1500) - 250, 1500, 44, 0],
    [riverX(1560) - 170, 1530, 32, 1],
    [riverX(950) + 300, 960, 36, 0],
  ]
    .map(([x, y, rr, f]) => lilyPad(x as number, y as number, rr as number, !!f))
    .join('')
  // a couple of swirly shadows under the bridge spot
  return `${streaks}${rip}${fishes}${pads}`
}

function bankDecor() {
  const r = rand(5)
  let out = ''
  const rocks: [number, number, number, number][] = []
  for (let y = 120; y < 1740; y += 70 + r() * 80) {
    for (const side of [-1, 1]) {
      if (Math.abs(y - 760) < 190) continue
      const x = edgeX(side, y, 54 + r() * 20)
      if (r() < 0.55) rocks.push([x, y, 14 + r() * 20, 10 + r() * 12])
      else if (r() < 0.5) out += reedFrag(edgeX(side, y, 30), y + 20, 0.42 + r() * 0.2, side * (6 + r() * 8))
    }
  }
  out += rocks.map(([x, y, rx, ry]) => stone(x.toFixed(0) as unknown as number, y.toFixed(0) as unknown as number, rx, ry, r() < 0.5 ? '#b9bec6' : '#cbc3b4')).join('')
  // stepping stones in the river near the front
  out += stone(riverX(1330) - 40, 1330, 34, 20) + stone(riverX(1360) + 20, 1362, 26, 16) + stone(riverX(1400) + 60, 1400, 20, 12)
  return out
}

const leftPath = [[500, 1060], [820, 980], [1100, 890], [1320, 812], [1470, 775]]
const rightPath = [[2130, 775], [2270, 722], [2370, 610], [2430, 460], [2410, 300]]

function trail() {
  const lp = smooth(leftPath)
  const rp = smooth(rightPath)
  const dirt = (d: string) => `
    <path d="${d}" stroke="#c4a064" stroke-width="112" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" stroke="#e8cc92" stroke-width="92" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" stroke="#f2dcaa" stroke-width="40" fill="none" stroke-linecap="round" stroke-dasharray="90 60" opacity=".7"/>`
  const trailDots = (d: string) => `<path d="${d}" stroke="#d9322b" stroke-width="13" fill="none" stroke-linecap="round" stroke-dasharray="1 34"/>`
  const pebbles = [[120, 1000], [330, 930], [560, 850], [760, 810], [1760, 745], [1930, 650], [2060, 520], [2110, 380]]
    .map(([x, y], i) => `<ellipse cx="${x + (i % 2 ? 30 : -34)}" cy="${y + 28}" rx="9" ry="6" fill="#b89460" stroke="#9a7a46" stroke-width="2"/>`)
    .join('')
  return `${dirt(lp)}${dirt(rp)}${pebbles}${trailDots(lp)}${trailDots(rp)}`
}

/** the X where the treasure is buried */
function xMarks(x: number, y: number) {
  return `<g transform="translate(${x} ${y}) rotate(-8)">
    <ellipse cx="0" cy="26" rx="70" ry="22" fill="#000" opacity=".15"/>
    <path d="M-48 -48 L 48 48 M48 -48 L -48 48" stroke="${INK}" stroke-width="40" stroke-linecap="round"/>
    <path d="M-48 -48 L 48 48 M48 -48 L -48 48" stroke="#e8322b" stroke-width="26" stroke-linecap="round"/>
    <path d="M-40 -40 L -10 -10" stroke="#ff8a7a" stroke-width="7" stroke-linecap="round"/>
  </g>`
}

function treasureMap() {
  const torn = 'M10 20 L 60 8 L 120 22 L 190 6 L 260 20 L 330 8 L 392 24 L 380 90 L 396 160 L 384 230 L 398 300 L 380 370 L 394 412 L 330 400 L 260 416 L 190 398 L 120 414 L 50 400 L 8 410 L 18 340 L 4 270 L 20 200 L 6 130 L 18 70 Z'
  const river = 'M178 28 C 150 90 230 120 196 190 C 166 250 232 300 200 410'
  return `<g transform="translate(1790 1380) rotate(-5) scale(.95)">
    <path d="${torn}" transform="translate(10 16)" fill="#000" opacity=".2"/>
    <path d="${torn}" fill="#f3dfa8" stroke="#b58a46" stroke-width="5" stroke-linejoin="round"/>
    <clipPath id="mapclip"><path d="${torn}"/></clipPath>
    <g clip-path="url(#mapclip)">
      <ellipse cx="60" cy="360" rx="120" ry="80" fill="#e3c27e" opacity=".55"/>
      <ellipse cx="360" cy="60" rx="100" ry="70" fill="#e3c27e" opacity=".5"/>
      <circle cx="320" cy="300" r="34" fill="#d9b66a" opacity=".4"/>
      <!-- mountains + trees -->
      <path d="M40 150 L 78 80 L 112 150 Z M84 150 L 124 96 L 158 150 Z" fill="#b99a6a" stroke="#7a5a2a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M68 100 L 78 80 L 90 102 L 80 98 Z" fill="#fff"/>
      <path d="M300 300 l 16 -36 l 16 36 z M326 310 l 14 -30 l 14 30 z" fill="#7fae5a" stroke="#4a7a3a" stroke-width="3" stroke-linejoin="round"/>
      <!-- the river with a bridge gap -->
      <path d="${river}" stroke="#5aa8e0" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path d="${river}" stroke="#8cc8f0" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="30 24"/>
      <!-- the trail -->
      <path d="M40 360 Q 100 300 140 250 M250 210 Q 300 170 320 110" stroke="#c8322b" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 14"/>
      <path d="M140 250 L 246 214" stroke="#c8322b" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="14 12" opacity=".8"/>
      <rect x="132" y="228" width="26" height="44" fill="#b99a6a" stroke="#7a5a2a" stroke-width="3"/><rect x="238" y="192" width="26" height="44" fill="#b99a6a" stroke="#7a5a2a" stroke-width="3"/>
      <text x="198" y="232" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="52" fill="#c8322b" transform="rotate(-10 198 232)">?</text>
      <!-- the castle + X -->
      <path d="M300 82 L 300 40 L 312 40 L 312 52 L 324 52 L 324 40 L 336 40 L 336 52 L 348 52 L 348 40 L 360 40 L 360 82 Z" fill="#cbb48a" stroke="#7a5a2a" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M312 104 L 340 132 M340 104 L 312 132" stroke="#d9322b" stroke-width="12" stroke-linecap="round" transform="translate(-6 0)"/>
      <!-- compass -->
      <g transform="translate(86 336)">
        <circle r="38" fill="none" stroke="#7a5a2a" stroke-width="3.5"/>
        <path d="${starPath(0, 0, 44, 10, 4)}" fill="#c8322b" stroke="#7a2a1a" stroke-width="3" stroke-linejoin="round"/>
        <path d="${starPath(0, 0, 28, 8, 4, Math.PI / 4)}" fill="#e9a23b" stroke="#7a5a2a" stroke-width="2" stroke-linejoin="round"/>
        <text y="-48" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" fill="#7a2a1a">N</text>
      </g>
      <text x="196" y="392" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="#8a5a2a" letter-spacing="3">TREASURE!</text>
    </g>
    <!-- tape -->
    <g transform="translate(60 6) rotate(-14)"><rect x="-56" y="-18" width="112" height="38" fill="#ffe27a" opacity=".82" stroke="#d9c04a" stroke-width="2"/><path d="M-56 -18 l 6 5 l -6 5 l 6 5 l -6 5 l 6 5 M56 -18 l -6 5 l 6 5 l -6 5 l 6 5 l -6 5" stroke="#d9c04a" stroke-width="2" fill="none"/></g>
    <g transform="translate(346 400) rotate(-12)"><rect x="-56" y="-18" width="112" height="38" fill="#ffe27a" opacity=".82" stroke="#d9c04a" stroke-width="2"/></g>
  </g>`
}

function blueprint() {
  const grid = Array.from({ length: 16 }, (_, i) => `<path d="M${i * 40} 0 L ${i * 40} 300 M0 ${i * 40} L 640 ${i * 40}" stroke="#7fa8e6" stroke-width="${i % 5 ? 1.5 : 3}"/>`).join('')
  const w = `stroke="#f2f7ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`
  return `<g transform="translate(1830 930) rotate(3) scale(.85)">
    <rect x="10" y="14" width="640" height="300" fill="#000" opacity=".16"/>
    <rect width="640" height="300" fill="#2f63b8" stroke="#1f4a94" stroke-width="4"/>
    <g opacity=".75">${grid}</g>
    <!-- the bridge: two banks, three blocks in a row -->
    <g ${w}>
      <path d="M30 230 L 130 230 L 130 150 L 190 150 M450 150 L 510 150 L 510 230 L 610 230"/>
      <path d="M190 150 L 190 210 A 40 40 0 0 0 270 210 L 270 150 Z M270 150 L 270 210 A 40 40 0 0 0 350 210 L 350 150 Z M350 150 L 350 210 A 40 40 0 0 0 430 210 L 430 150 Z" stroke-dasharray="14 9"/>
      <path d="M190 120 L 430 120 M200 120 L 200 150 M300 120 L 300 150 M420 120 L 420 150" stroke-width="4"/>
    </g>
    <g fill="#f2f7ff" font-family="${FONT}" font-weight="700" font-size="34" text-anchor="middle"><text x="230" y="205">1</text><text x="310" y="205">2</text><text x="390" y="205">3</text></g>
    <path d="M190 262 L 430 262 M190 250 L 190 274 M430 250 L 430 274" stroke="#f2f7ff" stroke-width="4"/>
    <text x="310" y="290" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="24" fill="#f2f7ff">3 BLOCKS!</text>
    <rect x="410" y="26" width="210" height="56" fill="none" stroke="#f2f7ff" stroke-width="4"/>
    <text x="515" y="64" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="#f2f7ff">BRIDGE PLANS</text>
    <g transform="translate(60 70) rotate(-5)"><rect width="130" height="82" fill="#fff07a" stroke="#d9c84a" stroke-width="3"/><text x="65" y="36" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="26" fill="#d0372a">BUILD</text><text x="65" y="66" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="26" fill="#d0372a">IT!</text></g>
    <!-- tape + pencil -->
    <g transform="translate(40 8) rotate(-14)"><rect x="-44" y="-14" width="88" height="30" fill="#ffe27a" opacity=".85" stroke="#d9c04a" stroke-width="2"/></g>
    <g transform="translate(630 300) rotate(-16)"><rect x="-10" y="-12" width="140" height="24" rx="3" fill="#ffc21a" stroke="${INK}" stroke-width="4"/><path d="M130 -12 L 168 0 L 130 12 Z" fill="#f2d9a8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M158 -4 L 168 0 L 158 4 Z" fill="${INK}"/><rect x="-10" y="-12" width="22" height="24" fill="#e8738a" stroke="${INK}" stroke-width="4"/></g>
  </g>`
}

/** a few little wooden toy blocks lying around on the grass */
function scatteredBlocks() {
  const b = (x: number, y: number, c: string, rot: number) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-26" y="-20" width="56" height="56" rx="6" fill="#000" opacity=".16"/><rect x="-28" y="-28" width="56" height="56" rx="6" fill="${c}" stroke="${INK}" stroke-width="4"/><rect x="-22" y="-22" width="22" height="8" rx="4" fill="#fff" opacity=".45"/></g>`
  return b(2250, 1000, '#e8322b', 14) + b(2312, 1034, '#3a8be0', -10) + b(900, 600, '#f4c542', 20) + b(1060, 1500, '#2f9a4a', -18)
}

export const buildingSpreadArt = (() => {
  return svgDoc(
    2560,
    1760,
    `<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fcdf6"/><stop offset="1" stop-color="#38a0e4"/></linearGradient>
     <!-- grass -->
     <rect width="2560" height="1760" fill="#92d36b"/>
     ${grass()}
     <!-- the sandy bank, the wet edge, and the river -->
     <path d="${riverPoly(96)}" fill="#e9d6a0"/>
     <path d="${riverPoly(62)}" fill="#d9c07e"/>
     <path d="${riverPoly(34)}" fill="#b7a468" opacity=".7"/>
     <path d="${riverPoly(0)}" fill="url(#wg)" stroke="#2a78b8" stroke-width="6" stroke-linejoin="round"/>
     <path d="${riverPoly(-26)}" fill="none" stroke="#a6e2ff" stroke-width="6" opacity=".5" stroke-linejoin="round"/>
     ${water()}
     ${bankDecor()}
     ${trail()}
     ${xMarks(2440, 520)}
     ${scatteredBlocks()}
     ${blueprint()}
     ${treasureMap()}`,
  )
})()
