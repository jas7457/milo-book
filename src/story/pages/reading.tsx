import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { svgDoc } from '../../art/texture'
import { sparkle, starPath } from '../../art/kit'
import { INK, limb, rand, woodGrain } from '../../art/style'
import { dadSitting, miloSitting, momSitting } from '../../art/family'
import { PopCard, Part } from '../../popup/PopCard'
import { PullTab } from '../../popup/PullTab'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { windowed } from '../../anim/ease'
import { bus } from '../../bus'
import { beat } from '../../progress'
import { heard } from '../../cue'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 1 — "Story time". Built in three layers like a real pop-up:
 *   back:   bookshelf · floor lamp · window with curtains
 *   middle: the couch (V-fold across the gutter) with Mom, Milo and Dad
 *   front:  the glowing storybook (V-fold) bursting with stars · toys
 * Pull the tab and the stars fly out of the book into the room.
 */

/* ------------------------------------------------- the printed spread -- */

function floorboards() {
  const r = rand(7)
  const cols = ['#d6a467', '#cf9c5e', '#dbab6e', '#d2a063']
  let out = ''
  for (let row = 0; row < 12; row++) {
    const y = 566 + row * 100
    let x = -r() * 400
    while (x < 2560) {
      const len = 380 + r() * 420
      const c = cols[Math.floor(r() * cols.length)]
      out += `<rect x="${x.toFixed(0)}" y="${y}" width="${len.toFixed(0)}" height="100" fill="${c}"/>`
      out += woodGrain(x, y + 8, len, 84, '#a8743f', row * 31 + Math.floor(x), 3)
      out += `<path d="M${x.toFixed(0)} ${y} L ${x.toFixed(0)} ${y + 100}" stroke="#8f5e30" stroke-width="4"/>`
      out += `<circle cx="${(x + 14).toFixed(0)}" cy="${y + 20}" r="3.5" fill="#8f5e30"/><circle cx="${(x + 14).toFixed(0)}" cy="${y + 80}" r="3.5" fill="#8f5e30"/>`
      x += len
    }
    out += `<path d="M0 ${y} L 2560 ${y}" stroke="#8f5e30" stroke-width="4"/>`
  }
  return out
}

function rug(cx: number, cy: number, rx: number, ry: number) {
  const fringe = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2
    const x1 = cx + Math.cos(a) * rx
    const y1 = cy + Math.sin(a) * ry
    const x2 = cx + Math.cos(a) * (rx + 26)
    const y2 = cy + Math.sin(a) * (ry + 20)
    return `M${x1.toFixed(0)} ${y1.toFixed(0)} L ${x2.toFixed(0)} ${y2.toFixed(0)}`
  }).join(' ')
  const ring = (k: number, n: number, r: number, fill: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return `<circle cx="${(cx + Math.cos(a) * (rx - k)).toFixed(0)}" cy="${(cy + Math.sin(a) * (ry - k * 0.47)).toFixed(0)}" r="${r}" fill="${fill}"/>`
    }).join('')
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * 360
    return `<ellipse cx="${cx}" cy="${cy - 70}" rx="34" ry="70" fill="#e9a23b" stroke="#a83a33" stroke-width="5" transform="rotate(${a} ${cx} ${cy}) scale(1 1)"/>`
  }).join('')
  return `
    <path d="${fringe}" stroke="#f4e6c6" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#a83a33" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 46}" ry="${ry - 24}" fill="#e9a23b"/>
    ${ring(23, 64, 9, '#a83a33')}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 92}" ry="${ry - 46}" fill="#c9524a"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 136}" ry="${ry - 68}" fill="#f4ddb0"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 250}" ry="${ry - 125}" fill="none" stroke="#c9524a" stroke-width="16" stroke-dasharray="40 26"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx - 300}" ry="${ry - 150}" fill="none" stroke="#3f8f8a" stroke-width="6"/>
    <g transform="translate(${cx} ${cy}) scale(1.6 0.75) translate(${-cx} ${-cy})">${petals}<circle cx="${cx}" cy="${cy}" r="40" fill="#3f8f8a" stroke="#a83a33" stroke-width="5"/></g>`
}

function crayon(x: number, y: number, rot: number, color: string) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-70" y="-15" width="120" height="30" rx="6" fill="${color}" stroke="${INK}" stroke-width="4"/>
    <rect x="-40" y="-15" width="40" height="30" fill="#fff" opacity=".35"/>
    <path d="M50 -15 L 82 0 L 50 15 Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  </g>`
}

const readingSpreadArt = (() => {
  const r = rand(3)
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a0 = ((i - 0.25) / 18) * Math.PI * 2
    const a1 = ((i + 0.25) / 18) * Math.PI * 2
    const R = 1100
    return `<path d="M1280 1060 L ${(1280 + Math.cos(a0) * R).toFixed(0)} ${(1060 + Math.sin(a0) * R * 0.6).toFixed(0)} L ${(1280 + Math.cos(a1) * R).toFixed(0)} ${(1060 + Math.sin(a1) * R * 0.6).toFixed(0)} Z"/>`
  }).join('')
  const stickers = Array.from({ length: 14 }, () => {
    const x = 1350 + r() * 1150
    const y = 640 + r() * 1000
    return `<path d="${starPath(x, y, 12 + r() * 10)}" fill="#ffe27a" stroke="#e9a23b" stroke-width="3" opacity=".9"/>`
  }).join('')
  return svgDoc(
    2560,
    1760,
    `<pattern id="wp" width="90" height="90" patternUnits="userSpaceOnUse">
       <rect width="90" height="90" fill="#f0d6a2"/><rect width="45" height="90" fill="#ead096"/>
       <path d="${starPath(67, 30, 9)}" fill="#e2bb7c"/><circle cx="22" cy="72" r="5" fill="#e2bb7c"/>
     </pattern>
     <radialGradient id="glow" cx="1280" cy="1060" r="820" gradientUnits="userSpaceOnUse">
       <stop offset="0" stop-color="#fff8cf" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe9a0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/>
     </radialGradient>
     <clipPath id="floor"><rect y="566" width="2560" height="1194"/></clipPath>
     <!-- wall -->
     <rect width="2560" height="566" fill="url(#wp)"/>
     <rect y="410" width="2560" height="156" fill="#c48a55"/>
     ${Array.from({ length: 16 }, (_, i) => `<rect x="${20 + i * 160}" y="440" width="128" height="96" rx="6" fill="#b87d4a" stroke="#9a6438" stroke-width="3"/>`).join('')}
     <rect y="400" width="2560" height="24" fill="#a06a3c" stroke="${INK}" stroke-width="4"/>
     <rect y="540" width="2560" height="28" fill="#8a5530" stroke="${INK}" stroke-width="4"/>
     <!-- floor -->
     <g clip-path="url(#floor)">${floorboards()}</g>
     ${rug(1280, 1150, 1080, 500)}
     <!-- the glow from the storybook, printed onto the floor -->
     <g clip-path="url(#floor)">
       <g fill="#fff3b0" opacity=".28">${rays}</g>
       <rect y="566" width="2560" height="1194" fill="url(#glow)"/>
     </g>
     ${stickers}
     <!-- things on the floor -->
     ${crayon(1960, 1190, -18, '#3a6fd8')}${crayon(2040, 1260, 12, '#e8322b')}${crayon(1900, 1290, 40, '#2f9a4a')}
     <g transform="translate(2330 840) rotate(-20)">
       <path d="M-120 0 L 110 -30 L -40 60 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
       <path d="M110 -30 L -60 18 L -40 60" fill="#e6e1d4" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     </g>
     <g transform="translate(420 760) rotate(-12)">
       <rect x="-90" y="-46" width="180" height="92" rx="30" fill="#e8322b" stroke="${INK}" stroke-width="5"/>
       <rect x="-40" y="-34" width="70" height="68" rx="12" fill="#bfe3ff" stroke="${INK}" stroke-width="4"/>
       ${[-60, 60].map((x) => `<rect x="${x - 18}" y="-60" width="36" height="18" rx="6" fill="#333"/><rect x="${x - 18}" y="42" width="36" height="18" rx="6" fill="#333"/>`).join('')}
     </g>
     <g transform="translate(860 700) rotate(8)">
       <rect x="-110" y="-80" width="220" height="160" fill="#fdfbf5" stroke="${INK}" stroke-width="4"/>
       <path d="M-80 40 Q -40 -60 0 30 T 80 -20" stroke="#3a6fd8" stroke-width="8" fill="none" stroke-linecap="round"/>
       <circle cx="60" cy="-40" r="22" fill="#ffd34d"/>
       <path d="M-80 60 L 80 60" stroke="#2f9a4a" stroke-width="8" stroke-linecap="round"/>
     </g>`,
  )
})()

/* ------------------------------------------------------- back layer -- */

const bookshelf = (() => {
  const r = rand(11)
  const cols = ['#c9524a', '#3a6fd8', '#e9a23b', '#2f9a4a', '#8a6cd8', '#2fb5c4', '#e8572b', '#f4c542']
  const shelfY = [380, 610, 840, 1070]
  let books = ''
  shelfY.forEach((sy, si) => {
    let x = 76
    const stop = si === 1 ? 380 : si === 2 ? 330 : 560
    while (x < stop) {
      const w = 30 + r() * 30
      const h = 140 + r() * 60
      const c = cols[Math.floor(r() * cols.length)]
      const lean = r() < 0.12 && x > 120 ? -10 : 0
      books += `<g transform="rotate(${lean} ${x} ${sy})"><rect x="${x.toFixed(0)}" y="${(sy - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="4" fill="${c}" stroke="${INK}" stroke-width="3.5"/>
        <rect x="${(x + 4).toFixed(0)}" y="${(sy - h + 18).toFixed(0)}" width="${(w - 8).toFixed(0)}" height="10" fill="#fff" opacity=".45"/>
        <rect x="${(x + 4).toFixed(0)}" y="${(sy - 34).toFixed(0)}" width="${(w - 8).toFixed(0)}" height="7" fill="#000" opacity=".15"/></g>`
      x += w + 3
    }
  })
  return svgDoc(
    640,
    1140,
    `<!-- plant on top -->
     <path d="M440 150 Q 380 60 420 10 Q 450 80 450 150 M470 150 Q 480 40 540 20 Q 520 100 480 150 M455 150 Q 440 70 470 30" stroke="#2f7a46" stroke-width="18" fill="none" stroke-linecap="round"/>
     <path d="M410 140 L 530 140 L 514 210 L 426 210 Z" fill="#d9724a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <rect x="402" y="132" width="136" height="22" rx="6" fill="#e8885e" stroke="${INK}" stroke-width="4"/>
     <!-- carcass -->
     <rect x="20" y="200" width="600" height="920" rx="8" fill="#a0683a" stroke="${INK}" stroke-width="5"/>
     <rect x="0" y="180" width="640" height="40" rx="8" fill="#b5783f" stroke="${INK}" stroke-width="5"/>
     <rect x="52" y="226" width="536" height="860" fill="#6e4425"/>
     ${[150, 250, 350, 450].map((x) => `<path d="M${x} 226 L ${x} 1086" stroke="#5e391e" stroke-width="3"/>`).join('')}
     ${books}
     <!-- shelf 2: a globe -->
     <ellipse cx="490" cy="604" rx="56" ry="10" fill="#4a2c16" opacity=".5"/>
     <path d="M490 600 L 490 560" stroke="#7a5a2a" stroke-width="8"/>
     <circle cx="490" cy="500" r="66" fill="#4f9fd8" stroke="${INK}" stroke-width="5"/>
     <path d="M450 470 Q 480 450 500 480 Q 520 500 490 520 Q 460 530 450 500 Z M520 440 Q 550 460 540 490 Q 520 470 520 440 Z" fill="#6cc06a"/>
     <path d="M424 500 A 66 66 0 0 0 556 500" stroke="#c9a04a" stroke-width="6" fill="none"/>
     <!-- shelf 3: a toy rocket -->
     <g transform="translate(460 700) rotate(12)">
       <path d="M0 -110 Q 40 -60 36 40 L -36 40 Q -40 -60 0 -110 Z" fill="#f3efe4" stroke="${INK}" stroke-width="5"/>
       <circle cx="0" cy="-30" r="18" fill="#4f9fd8" stroke="${INK}" stroke-width="4"/>
       <path d="M-36 0 L -64 50 L -36 40 Z M36 0 L 64 50 L 36 40 Z" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
       <path d="M-24 40 L 0 80 L 24 40 Z" fill="#ffb02e" stroke="${INK}" stroke-width="4"/>
     </g>
     <!-- shelf 4: family photo -->
     <g transform="translate(250 960) rotate(-4)">
       <rect x="-90" y="-100" width="180" height="140" rx="6" fill="#e9a23b" stroke="${INK}" stroke-width="5"/>
       <rect x="-72" y="-82" width="144" height="104" fill="#bfe3f5"/>
       <circle cx="-38" cy="-30" r="18" fill="#f6c9a4"/><circle cx="38" cy="-30" r="18" fill="#f6c9a4"/><circle cx="0" cy="-18" r="13" fill="#f6c9a4"/>
       <path d="M-60 22 Q -38 -14 -16 22 Z M16 22 Q 38 -14 60 22 Z M-14 22 Q 0 -6 14 22 Z" fill="#4f9d74"/>
     </g>
     ${shelfY.map((y) => `<rect x="40" y="${y}" width="560" height="24" fill="#b5783f" stroke="${INK}" stroke-width="4"/>`).join('')}
     <rect x="30" y="1094" width="580" height="30" fill="#8a5530" stroke="${INK}" stroke-width="4"/>`,
    { cut: 5 },
  )
})()

const lampPole = svgDoc(
  260,
  1080,
  `<path d="M130 40 L 130 1010" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
   <path d="M130 40 L 130 1010" stroke="#b8a27a" stroke-width="14" stroke-linecap="round"/>
   <path d="M126 60 L 126 990" stroke="#e8dcc0" stroke-width="4"/>
   <ellipse cx="130" cy="1036" rx="110" ry="30" fill="#8a7650" stroke="${INK}" stroke-width="5"/>
   <path d="M40 1030 Q 130 1010 220 1030" stroke="#b8a27a" stroke-width="8" fill="none"/>`,
  { cut: 4 },
)

const lampShade = svgDoc(
  440,
  320,
  `<linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe7a6"/><stop offset=".5" stop-color="#fff6d6"/><stop offset="1" stop-color="#ffdf8f"/></linearGradient>
   <path d="M110 30 L 330 30 L 410 270 L 30 270 Z" fill="url(#sh)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[150, 200, 240, 290].map((x, i) => `<path d="M${x} 34 L ${[90, 175, 265, 350][i]} 266" stroke="#f0cf7a" stroke-width="4"/>`).join('')}
   <rect x="20" y="262" width="400" height="26" rx="13" fill="#e9b85a" stroke="${INK}" stroke-width="5"/>
   <path d="M150 288 Q 220 312 290 288" stroke="#e9b85a" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  { cut: 4 },
)

const nightWindow = (() => {
  const r = rand(5)
  const stars = Array.from({ length: 16 }, () => {
    const x = 290 + r() * 520
    const y = 170 + r() * 300
    return `<path d="${starPath(x, y, 5 + r() * 8)}" fill="#fff4c4"/>`
  }).join('')
  const curtain = (flip: boolean) => {
    const g = `<path d="M40 70 L 300 70 Q 290 300 250 520 Q 236 560 252 600 Q 300 800 280 990 L 40 990 Z" fill="#c9524a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      ${[90, 150, 210].map((x) => `<path d="M${x} 80 Q ${x + 20} 300 ${x + 70 * ((x - 40) / 260)} 540 Q ${x + 10} 760 ${x - 10} 980" stroke="#a83a33" stroke-width="7" fill="none" opacity=".8"/>`).join('')}
      ${Array.from({ length: 22 }, () => `<circle cx="${(60 + r() * 200).toFixed(0)}" cy="${(110 + r() * 860).toFixed(0)}" r="7" fill="#f4c542" opacity=".8"/>`).join('')}
      <path d="M232 520 Q 280 548 268 600 Q 248 616 236 596 Q 230 560 214 540 Z" fill="#f4c542" stroke="${INK}" stroke-width="4"/>`
    return flip ? `<g transform="translate(1100 0) scale(-1 1)">${g}</g>` : g
  }
  return svgDoc(
    1100,
    1000,
    `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2558"/><stop offset="1" stop-color="#4a4a96"/></linearGradient>
     <rect x="230" y="110" width="640" height="650" rx="8" fill="#8a5a33" stroke="${INK}" stroke-width="5"/>
     <rect x="262" y="142" width="576" height="586" fill="url(#night)"/>
     ${stars}
     <circle cx="720" cy="240" r="58" fill="#fff4c4"/><circle cx="748" cy="222" r="52" fill="#262f68"/>
     <!-- the town asleep -->
     <path d="M262 728 L 262 620 L 320 620 L 320 590 L 380 560 L 440 590 L 440 640 L 520 640 L 520 600 L 560 570 L 600 600 L 600 650 L 680 650 L 680 590 L 740 590 L 740 560 L 790 560 L 790 620 L 838 620 L 838 728 Z" fill="#141b44"/>
     ${[[340, 610], [400, 600], [540, 618], [700, 610], [760, 590], [470, 660]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="20" fill="#ffd56a"/>`).join('')}
     <rect x="538" y="142" width="24" height="586" fill="#8a5a33"/>
     <rect x="262" y="420" width="576" height="22" fill="#8a5a33"/>
     <rect x="190" y="746" width="720" height="38" rx="6" fill="#a06a3c" stroke="${INK}" stroke-width="5"/>
     <!-- on the sill -->
     <path d="M330 746 L 340 696 L 400 696 L 410 746 Z" fill="#d9724a" stroke="${INK}" stroke-width="4"/>
     <path d="M370 696 Q 350 640 370 610 Q 390 640 370 696 M370 690 Q 330 670 340 640 M370 690 Q 410 670 404 640" stroke="#4f9d74" stroke-width="12" fill="none" stroke-linecap="round"/>
     <g transform="translate(690 716)">
       <rect x="-70" y="-30" width="110" height="44" rx="6" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
       <rect x="30" y="-16" width="40" height="30" rx="4" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
       <path d="M-60 -40 L 30 -46" stroke="#ddd" stroke-width="7"/>
       <circle cx="-40" cy="18" r="12" fill="#333"/><circle cx="40" cy="18" r="12" fill="#333"/>
     </g>
     <rect x="20" y="52" width="1060" height="22" rx="11" fill="#6a4426" stroke="${INK}" stroke-width="4"/>
     <circle cx="24" cy="63" r="20" fill="#a06a3c" stroke="${INK}" stroke-width="4"/><circle cx="1076" cy="63" r="20" fill="#a06a3c" stroke="${INK}" stroke-width="4"/>
     ${curtain(false)}${curtain(true)}`,
    { cut: 5 },
  )
})()

/* ----------------------------------------------------- middle layer -- */

const couch = svgDoc(
  1900,
  800,
  `<!-- back -->
   <path d="M120 430 L 120 120 Q 120 60 190 60 L 1710 60 Q 1780 60 1780 120 L 1780 430 Z" fill="#5a5d64" stroke="${INK}" stroke-width="6"/>
   ${[[170, 930], [970, 1730]]
     .map(
       ([a, b]) => `<path d="M${a} 430 L ${a} 140 Q ${a} 100 ${a + 40} 100 L ${b - 40} 100 Q ${b} 100 ${b} 140 L ${b} 430 Z" fill="#6a6d74" stroke="${INK}" stroke-width="4"/>
       ${[0.25, 0.5, 0.75].map((k) => `<circle cx="${a + (b - a) * k}" cy="200" r="9" fill="#4a4d54"/><circle cx="${a + (b - a) * k}" cy="320" r="9" fill="#4a4d54"/>`).join('')}
       <path d="M${a + 30} 130 Q ${(a + b) / 2} 116 ${b - 30} 130" stroke="#7d8088" stroke-width="10" fill="none" stroke-linecap="round"/>`,
     )
     .join('')}
   <!-- pillows -->
   <path d="M250 230 Q 390 190 530 230 Q 550 340 530 440 Q 390 470 250 440 Q 230 340 250 230 Z" fill="#e9a23b" stroke="${INK}" stroke-width="5"/>
   <path d="${starPath(390, 336, 44)}" fill="#fff3c8" opacity=".85"/>
   <path d="M1370 236 Q 1500 196 1630 236 Q 1650 340 1630 440 Q 1500 470 1370 440 Q 1350 340 1370 236 Z" fill="#5fb3b0" stroke="${INK}" stroke-width="5"/>
   <path d="M1400 300 L 1600 300 M1400 340 L 1600 340 M1400 380 L 1600 380" stroke="#4a9a96" stroke-width="10"/>
   <!-- seat -->
   <rect x="150" y="410" width="1600" height="160" rx="30" fill="#63666d" stroke="${INK}" stroke-width="6"/>
   <rect x="166" y="416" width="1568" height="34" rx="16" fill="#777a82"/>
   <path d="M950 416 L 950 566" stroke="${INK}" stroke-width="4"/>
   <rect x="140" y="560" width="1620" height="140" rx="16" fill="#55585f" stroke="${INK}" stroke-width="6"/>
   <!-- arms -->
   ${[0, 1]
     .map((i) => {
       const x = i ? 1680 : 20
       return `<path d="M${x} 700 L ${x} 300 Q ${x} 240 ${x + 100} 240 Q ${x + 200} 240 ${x + 200} 300 L ${x + 200} 700 Z" fill="#50535a" stroke="${INK}" stroke-width="6"/>
         <ellipse cx="${x + 100}" cy="300" rx="100" ry="58" fill="#5d6067" stroke="${INK}" stroke-width="5"/>
         <ellipse cx="${x + 100}" cy="300" rx="50" ry="26" fill="none" stroke="#474a51" stroke-width="5"/>`
     })
     .join('')}
   <!-- knitted throw on the right arm -->
   <path d="M1660 250 Q 1780 220 1900 260 L 1890 560 Q 1860 600 1830 560 Q 1800 600 1770 560 Q 1740 600 1710 560 L 1700 320 Z" fill="#f2c45a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   ${[300, 380, 460].map((y) => `<path d="M1700 ${y} Q 1800 ${y - 20} 1894 ${y + 6}" stroke="#c9524a" stroke-width="14" fill="none"/>`).join('')}
   <!-- legs -->
   ${[110, 1760].map((x) => `<path d="M${x} 700 L ${x + 30} 700 L ${x + 24} 790 L ${x + 6} 790 Z" fill="#6a4426" stroke="${INK}" stroke-width="4"/>`).join('')}
   <path d="M950 70 L 950 410" stroke="#000" stroke-width="10" opacity=".08"/>`,
  { cut: 5 },
)

/* ------------------------------------------------------ front layer -- */

const storybook = svgDoc(
  1000,
  660,
  `<linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#ffe896"/></linearGradient>
   <!-- cover behind the pages -->
   <path d="M500 640 Q 290 590 30 630 L 46 70 Q 290 30 500 92 Q 710 30 954 70 L 970 630 Q 710 590 500 640 Z" fill="#c8362f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <!-- page edges -->
   ${[0, 1, 2].map((i) => `<path d="M500 ${622 - i * 10} Q 290 ${572 - i * 10} ${54 + i * 8} ${608 - i * 10} L ${68 + i * 8} ${92 + i * 6} Q 290 ${54 + i * 6} 500 ${112 + i * 6} Q 710 ${54 + i * 6} ${932 - i * 8} ${92 + i * 6} L ${946 - i * 8} ${608 - i * 10} Q 710 ${572 - i * 10} 500 ${622 - i * 10} Z" fill="${i % 2 ? '#fff1c2' : '#f7e3a8'}" stroke="#d9b05a" stroke-width="3"/>`).join('')}
   <path d="M500 596 Q 290 548 92 584 L 104 116 Q 290 80 500 132 Q 710 80 896 116 L 908 584 Q 710 548 500 596 Z" fill="url(#pg)" stroke="#d9b05a" stroke-width="4"/>
   <path d="M500 132 L 500 596" stroke="#e0b860" stroke-width="5"/>
   <!-- the little pictures in the book -->
   <g transform="translate(296 300)">
     <path d="M-110 90 L -110 0 L -40 -60 L 30 0 L 30 90 Z" fill="#f2a65a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <path d="M-130 6 L -40 -76 L 50 6" stroke="#c9524a" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
     <rect x="-60" y="30" width="36" height="60" fill="#8a5a33"/><rect x="-6" y="14" width="26" height="26" fill="#ffe27a" stroke="${INK}" stroke-width="3"/>
     <circle cx="100" cy="-90" r="34" fill="#ffd34d"/>
   </g>
   <g stroke="#d9b56a" stroke-width="10" stroke-linecap="round"><path d="M560 200 L 820 186"/><path d="M560 240 L 820 228"/><path d="M560 280 L 760 272"/></g>
   <path d="${starPath(700, 410, 70)}" fill="#ffd34d" stroke="#e9a23b" stroke-width="6" stroke-linejoin="round"/>
   <path d="M600 520 Q 700 480 820 510" stroke="#d9b56a" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  { cut: 5 },
)

const burst = svgDoc(
  1200,
  900,
  `${Array.from({ length: 17 }, (_, i) => {
    const a0 = Math.PI + (i / 17) * Math.PI
    const a1 = Math.PI + ((i + 0.55) / 17) * Math.PI
    const R = i % 2 ? 640 : 820
    return `<path d="M600 860 L ${(600 + Math.cos(a0) * R).toFixed(0)} ${(860 + Math.sin(a0) * R).toFixed(0)} L ${(600 + Math.cos(a1) * R).toFixed(0)} ${(860 + Math.sin(a1) * R).toFixed(0)} Z" fill="${i % 2 ? '#ffe680' : '#fff2b0'}"/>`
  }).join('')}
   <circle cx="600" cy="860" r="300" fill="#fff6c8"/>`,
  { cut: 3, edge: '#fffbe8' },
)

const toyBlocks = (() => {
  const L = {
    M: 'M24 84 L 24 20 L 50 56 L 76 20 L 76 84',
    I: 'M50 20 L 50 82 M32 20 L 68 20 M32 82 L 68 82',
    L: 'M32 18 L 32 82 L 74 82',
    O: 'M50 18 C 80 18 80 82 50 82 C 20 82 20 18 50 18 Z',
  } as const
  const block = (x: number, y: number, c: string, sh: string, top: string, letter: keyof typeof L) =>
    `<g transform="translate(${x} ${y})">
       <path d="M0 30 L 30 0 L 150 0 L 120 30 Z" fill="${top}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M120 30 L 150 0 L 150 120 L 120 150 Z" fill="${sh}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <rect x="0" y="30" width="120" height="120" rx="6" fill="${c}" stroke="${INK}" stroke-width="5"/>
       <g transform="translate(10 40)"><path d="${L[letter]}" stroke="#fff" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
     </g>`
  return svgDoc(
    480,
    420,
    `${block(20, 250, '#e8322b', '#b8221c', '#f26a5e', 'M')}${block(160, 250, '#3a6fd8', '#2a55aa', '#6f97ea', 'I')}${block(300, 250, '#f4c542', '#d09e1a', '#ffe07a', 'L')}
     ${block(96, 104, '#2f9a4a', '#217538', '#5cc072', 'O')}`,
    { cut: 5 },
  )
})()

const toyDigger = svgDoc(
  640,
  440,
  `<!-- tracks -->
   <rect x="40" y="320" width="380" height="96" rx="48" fill="#3a3a3a" stroke="${INK}" stroke-width="6"/>
   ${[92, 172, 252, 332].map((x) => `<circle cx="${x + 6}" cy="368" r="30" fill="#6f6f6f" stroke="${INK}" stroke-width="4"/><circle cx="${x + 6}" cy="368" r="10" fill="#9a9a9a"/>`).join('')}
   ${Array.from({ length: 14 }, (_, i) => `<path d="M${64 + i * 26} 322 L ${70 + i * 26} 332" stroke="#5a5a5a" stroke-width="6"/>`).join('')}
   <!-- body -->
   <rect x="60" y="230" width="330" height="96" rx="14" fill="#f4b400" stroke="${INK}" stroke-width="6"/>
   <rect x="60" y="292" width="330" height="34" fill="#d99a00"/>
   ${[0, 1, 2, 3, 4].map((i) => `<path d="M${80 + i * 40} 300 L ${100 + i * 40} 320" stroke="#3a3a3a" stroke-width="12"/>`).join('')}
   <rect x="34" y="214" width="74" height="96" rx="10" fill="#e0a300" stroke="${INK}" stroke-width="5"/>
   <rect x="300" y="170" width="16" height="64" fill="#555" stroke="${INK}" stroke-width="4"/>
   <!-- cab -->
   <path d="M130 230 L 130 92 Q 130 70 152 70 L 262 70 Q 290 70 296 96 L 310 230 Z" fill="#f4b400" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M152 214 L 152 100 Q 152 92 160 92 L 252 92 Q 270 92 274 108 L 286 214 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M176 104 L 168 200 M200 104 L 192 160" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
   <!-- boom + dipper + bucket -->
   ${limb('M330 250 L 470 110', '#f4b400', 54, 6)}
   ${limb('M470 110 L 560 230', '#f4b400', 40, 6)}
   <path d="M350 214 L 452 120" stroke="#9a9a9a" stroke-width="14" stroke-linecap="round"/>
   <circle cx="470" cy="110" r="14" fill="#555" stroke="${INK}" stroke-width="4"/>
   <path d="M532 220 L 620 236 L 606 320 Q 560 340 520 300 Z" fill="#7a7a7a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   ${[0, 1, 2].map((i) => `<path d="M${532 + i * 26} ${306 + i * 8} L ${528 + i * 26} ${334 + i * 6}" stroke="#4a4a4a" stroke-width="10" stroke-linecap="round"/>`).join('')}`,
  { cut: 5 },
)

const toyFireTruck = svgDoc(
  640,
  380,
  `<rect x="30" y="140" width="420" height="150" rx="14" fill="#e8322b" stroke="${INK}" stroke-width="6"/>
   <path d="M450 290 L 450 140 L 530 140 Q 560 140 576 176 L 610 240 L 610 290 Z" fill="#e8322b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M470 160 L 526 160 Q 546 160 556 186 L 576 226 L 470 226 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <rect x="30" y="226" width="580" height="22" fill="#f3efe4"/>
   <rect x="484" y="114" width="60" height="26" rx="8" fill="#4f9fd8" stroke="${INK}" stroke-width="4"/>
   <!-- ladder -->
   <path d="M60 110 L 430 110 M60 140 L 430 140" stroke="#cfd3d8" stroke-width="12" stroke-linecap="round"/>
   ${Array.from({ length: 9 }, (_, i) => `<path d="M${80 + i * 42} 110 L ${80 + i * 42} 140" stroke="#cfd3d8" stroke-width="9"/>`).join('')}
   <path d="M60 104 L 430 104" stroke="${INK}" stroke-width="3" opacity=".6"/>
   <rect x="60" y="170" width="80" height="44" rx="6" fill="#b8221c"/><rect x="170" y="170" width="80" height="44" rx="6" fill="#b8221c"/><rect x="280" y="170" width="80" height="44" rx="6" fill="#b8221c"/>
   ${[120, 360, 530].map((x) => `<circle cx="${x}" cy="300" r="44" fill="#333" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="300" r="18" fill="#cfd3d8"/>`).join('')}`,
  { cut: 5 },
)

/* ---------------------------------------------------------- pop-ups -- */

/** Warm light from the open storybook, pulsing gently, lighting the family. */
function BookGlow() {
  const { index, baseY } = useSpread()
  const ref = useRef<THREE.PointLight>(null!)
  useFrame((s) => {
    const l = windowed(anim.raise[index].v, 0.34)
    // fades up with the cue
    const on = Math.min(1, glow.at ? (performance.now() - glow.at) / 900 : 0)
    ref.current.intensity = l * on * (1.6 + Math.sin(s.clock.elapsedTime * 2.4) * 0.35)
  })
  return <pointLight ref={ref} position={[0, baseY + 0.45, 0.55]} color="#ffd27a" distance={3} decay={1.4} />
}

/** The glowing stars: few, big and clear. Each pops out of the book, then flies up into the room. */
const STAR_FLIGHTS: {
  at: [number, number]
  y: number
  size: number
  to: [number, number, number]
  fill: string
  stroke: string
  spin: number
}[] = [
  { at: [-0.8, 0.2], y: 0.6, size: 0.34, to: [-2.55, 0.46, -3.0], fill: '#ffd34d', stroke: '#e08a00', spin: 1 },
  { at: [-0.3, 0.16], y: 0.86, size: 0.4, to: [-1.1, 0.8, -4.2], fill: '#fff09a', stroke: '#e9a800', spin: -1 },
  { at: [0.32, 0.16], y: 0.84, size: 0.38, to: [0.23, 0.6, -3.0], fill: '#ffc83a', stroke: '#dc7a00', spin: 1 },
  { at: [0.82, 0.2], y: 0.6, size: 0.34, to: [2.35, 0.92, -4.2], fill: '#fff09a', stroke: '#e9a800', spin: -1 },
]

/** one big storybook star: ink outline, soft shine and a little face-less sparkle */
const bigStar = (fill: string, stroke: string) =>
  svgDoc(
    240,
    240,
    `<path d="${starPath(120, 124, 108, 54)}" fill="${fill}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
     <path d="${starPath(120, 128, 92, 46)}" fill="none" stroke="${stroke}" stroke-width="6" stroke-linejoin="round" opacity=".7"/>
     <path d="${starPath(120, 128, 46, 22)}" fill="#fffbe0" opacity=".85"/>
     <path d="M70 70 Q 84 52 104 48" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"/>`,
    { cut: 7 },
  )

/** stars are sent into the room once; the tab can be pulled again without taking them back */
const flight = { out: false }

/**
 * The magic waits for the story: nothing glows until the card has written
 * "the book began to *GLOW!*". `glowing(d)` turns true d seconds after that.
 */
const glow = { at: 0 }
const glowing = (d = 0) => glow.at > 0 && performance.now() - glow.at > d * 1000

function ReadingDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  useFrame(() => {
    const away = anim.raise[index].v < 0.3
    if (away && live.current) {
      live.current = false
      flight.out = false
      glow.at = 0
    } else if (!away) live.current = true
    if (!away && !glow.at && heard('reading', 'glow')) {
      glow.at = performance.now()
      bus.emit('sfx', 'sparkle')
      bus.emit('milo', 'point')
    }
  })
  return null
}

function ReadingPopups() {
  return (
    <>
      <ReadingDirector />
      {/* back */}
      <PopCard art={bookshelf} size={[0.6, 1.07]} at={[-1.12, -0.84]} delay={0} px={1024} tap="wiggle" rotY={0.1} />
      <PopCard art={lampPole} size={[0.24, 1.0]} at={[-0.6, -0.8]} delay={0.04} tap="none" />
      <PopCard art={lampShade} size={[0.44, 0.32]} at={[-0.6, -0.795]} y={0.82} delay={0.1} hinge="spring" emissive={0.75} tap="wiggle" />
      <PopCard art={nightWindow} size={[1.1, 1.0]} at={[0.98, -0.88]} delay={0.02} px={1024} tap="none" />
      {/* middle */}
      <PopCard art={couch} size={[1.9, 0.8]} at={[0, -0.4]} vfold={0.24} delay={0.12} px={1536} tap="none" />
      <PopCard art={momSitting()} size={[0.6, 0.93]} at={[-0.6, -0.1]} delay={0.2} rotY={0.12} idle="sway" idleAmp={0.4} tap="wiggle" px={1024} />
      <PopCard art={dadSitting()} size={[0.64, 0.99]} at={[0.62, -0.09]} delay={0.24} rotY={-0.12} idle="sway" idleAmp={0.4} tap="wiggle" px={1024} />
      <PopCard art={miloSitting()} size={[0.42, 0.66]} at={[0.02, -0.24]} y={0.1} delay={0.22} idle="bob" tap="jump" px={1024} />
      {/* front */}
      <PopCard art={burst} size={[0.96, 0.72]} at={[0, 0.25]} delay={0.3} hinge="spring" lean={0.3} emissive={0.32} tap="none" contact={false} gate={() => glowing()} />
      <PopCard art={storybook} size={[1.0, 0.66]} at={[0, 0.32]} vfold={0.5} lean={0.16} delay={0.34} emissive={0.18} tap="jump" px={1024} />
      <BookGlow />
      {STAR_FLIGHTS.map((f, i) => (
        <PopCard
          key={i}
          art={bigStar(f.fill, f.stroke)}
          size={[f.size, f.size]}
          at={f.at}
          y={f.y}
          delay={0.42 + i * 0.03}
          gate={() => glowing(0.35 + i * 0.22)}
          hinge="spring"
          emissive={0.85}
          idle="float"
          idleAmp={1.3}
          tap="spin"
          px={512}
          escape={{ to: f.to, arc: 1.1, scale: 2.2, duration: 1.7 + i * 0.15, spin: Math.PI * 2 * f.spin, on: 'stars-fly', upright: true }}
        >
          <Part
            art={sparkle()}
            size={[f.size * 0.5, f.size * 0.5]}
            pivot={[f.size * 0.3, f.size * 0.74, 0]}
            z={0.012}
            emissive={1}
            animate={(g, t) => g.scale.setScalar(0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(t * 2.6 + i * 1.7)), 2))}
          />
        </PopCard>
      ))}
      <PopCard art={toyBlocks} size={[0.42, 0.37]} at={[0.42, 0.72]} delay={0.44} rotY={-0.15} tap="jump" />
      <PopCard art={toyDigger} size={[0.58, 0.4]} at={[1.2, 0.4]} delay={0.4} rotY={-0.35} tap="wiggle" />
      <PopCard art={toyFireTruck} size={[0.52, 0.31]} at={[-1.28, -0.38]} delay={0.38} rotY={0.3} tap="jump" />
      <PullTab
        id="stars"
        label="Let them out!"
        at={[0.98, 0.9]}
        accent="#7a5cc8"
        color="#8a6cd8"
        delay={0.55}
        gate={() => glowing(1.4)}
        hint={() => heard('reading', 'tab')}
        onPull={() => {
          bus.emit('sfx', 'sparkle')
          bus.emit('milo', 'cheer')
          if (flight.out) return
          flight.out = true
          bus.emit('pull', 'stars-fly') // the stars burst out and stay in the room
          beat('reading', 1)
        }}
      />
    </>
  )
}

export const readingSpread: SpreadDef = {
  id: 'reading',
  world: 'room',
  palette: palettes.glowRoom,
  outfit: 'plain',
  heading: 'Story time',
  beats: 1,
  text: [
    'This is *Milo*. He LOVES books! Every night he reads with *Mom* and *Dad*... but tonight, the book began to *GLOW!* Pull the tab!',
    { after: 1, text: '*Whoosh!* Out flew the stars, twinkling all around the room!' },
  ],
  textCard: { x: 0.08, y: 0.56, w: 0.8 },
  spreadArt: readingSpreadArt,
  Popups: ReadingPopups,
  miloReact: 'point',
}
