import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { svgDoc } from '../../art/texture'
import { sparkle, starPath } from '../../art/kit'
import { INK, rand, woodGrain } from '../../art/style'
import { at, clamp, goggles, hammer, hardHat, level, nut, peg, pencil, pliers, saw, screw, screwdriver, shaving, tapeMeasure, wrench } from '../../art/tools'
import { Part, PopCard } from '../../popup/PopCard'
import { DragPiece, type DragState } from '../../popup/DragPiece'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { clamp01, easeOutBack } from '../../anim/ease'
import { bus } from '../../bus'
import { beat } from '../../progress'
import { heard } from '../../cue'
import { Cutout, useWorldLevel } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 2 — "Fix-it Milo". The stars land Milo in his workshop.
 *   back:   the pegboard of tools (V-fold across the gutter)
 *   middle: Robo the sleepy robot · the workbench · an open toolbox
 *   front:  a battery and a drill you can pick up
 * Drag the battery into Robo: he powers up, waves and walks into the world.
 * Hold the drill on the cardboard box: it drills two holes. Then drag the two
 * loose wheels onto the holes (either wheel fits either hole): they snap on and
 * the box car zooms away.
 */

const MARKER = `'Marker Felt', 'Chalkboard SE', 'Comic Sans MS', sans-serif`

/* ------------------------------------------------- the printed spread -- */

function plywood() {
  const r = rand(21)
  let out = ''
  const sheets = [
    [0, 520, 1280, 620, '#e2c08c'],
    [1280, 520, 1280, 620, '#dcb984'],
    [0, 1140, 900, 620, '#d9b47c'],
    [900, 1140, 1660, 620, '#e0bd88'],
  ] as const
  sheets.forEach(([x, y, w, h, c], i) => {
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
    out += woodGrain(x, y + 10, w, h - 20, '#b98e58', i * 17 + 3, 9)
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#a37a46" stroke-width="5"/>`
    for (let k = 0; k < 14; k++) out += `<circle cx="${(x + 30 + r() * (w - 60)).toFixed(0)}" cy="${(y + 30 + r() * (h - 60)).toFixed(0)}" r="4" fill="#8a6338"/>`
  })
  return out
}

const blueprint = () => {
  const grid = Array.from({ length: 24 }, (_, i) => `<path d="M${i * 40} 0 L ${i * 40} 640 M0 ${i * 40} L 900 ${i * 40}" stroke="#7fa8e6" stroke-width="${i % 5 ? 1.5 : 3}"/>`).join('')
  const w = `stroke="#f2f7ff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`
  return `<g transform="translate(1440 700) rotate(-4)">
    <rect x="8" y="12" width="900" height="640" fill="#000" opacity=".15"/>
    <rect width="900" height="640" fill="#2f63b8"/>
    <g opacity=".8">${grid}</g>
    <!-- Robo, drawn as a plan -->
    <g ${w}>
      <rect x="110" y="150" width="150" height="110" rx="16"/><circle cx="155" cy="200" r="20"/><circle cx="215" cy="200" r="20"/>
      <path d="M185 150 L 185 100"/><circle cx="185" cy="92" r="10"/>
      <rect x="90" y="270" width="190" height="180" rx="16"/><rect x="130" y="300" width="110" height="50" rx="8" stroke-dasharray="12 10"/>
      <path d="M90 300 L 50 400 M280 300 L 320 400 M130 450 L 130 520 M240 450 L 240 520"/>
    </g>
    <path d="M70 560 L 300 560 M70 548 L 70 572 M300 548 L 300 572" stroke="#f2f7ff" stroke-width="4"/>
    <text x="185" y="600" text-anchor="middle" font-family="${MARKER}" font-size="38" fill="#f2f7ff">ROBO</text>
    <!-- the box-car plan -->
    <g ${w}>
      <rect x="500" y="250" width="300" height="200"/><path d="M500 250 L 540 190 L 760 190 L 800 250" stroke-dasharray="14 10"/>
      <circle cx="570" cy="470" r="50"/><circle cx="730" cy="470" r="50"/><circle cx="570" cy="470" r="10"/><circle cx="730" cy="470" r="10"/>
      <path d="M760 190 L 760 110 L 830 130 L 760 150"/>
    </g>
    <path d="M500 560 L 800 560 M500 548 L 500 572 M800 548 L 800 572" stroke="#f2f7ff" stroke-width="4"/>
    <text x="650" y="600" text-anchor="middle" font-family="${MARKER}" font-size="38" fill="#f2f7ff">BOX CAR</text>
    <rect x="620" y="30" width="250" height="90" fill="none" stroke="#f2f7ff" stroke-width="4"/>
    <text x="745" y="88" text-anchor="middle" font-family="${MARKER}" font-size="40" fill="#f2f7ff">PLANS</text>
    <!-- sticky note -->
    <g transform="translate(40 30) rotate(-6)">
      <rect width="210" height="150" fill="#fff07a" stroke="#d9c84a" stroke-width="3"/>
      <text x="105" y="66" text-anchor="middle" font-family="${MARKER}" font-size="40" fill="#d0372a">FIX</text>
      <text x="105" y="118" text-anchor="middle" font-family="${MARKER}" font-size="40" fill="#d0372a">ROBO!</text>
    </g>
  </g>`
}

const cuttingMat = () => {
  const grid = Array.from({ length: 20 }, (_, i) => `<path d="M${i * 50} 0 L ${i * 50} 560 M0 ${i * 50} L 960 ${i * 50}" stroke="#7cc49a" stroke-width="${i % 4 ? 2 : 4}"/>`).join('')
  return `<g transform="translate(120 600) rotate(2)">
    <rect x="6" y="10" width="960" height="560" rx="18" fill="#000" opacity=".15"/>
    <rect width="960" height="560" rx="18" fill="#2f8f5c"/>
    <g clip-path="url(#matClip)">${grid}</g>
    <rect width="960" height="560" rx="18" fill="none" stroke="${INK}" stroke-width="5"/>
    <!-- a half-made cardboard rocket on the mat -->
    <g transform="translate(320 250) rotate(-24)">
      <path d="M0 -150 Q 70 -70 64 90 L -64 90 Q -70 -70 0 -150 Z" fill="#cf9f62" stroke="${INK}" stroke-width="5"/>
      <circle cx="0" cy="-30" r="26" fill="#a87a42" stroke="${INK}" stroke-width="4"/>
      <path d="M-30 30 L 30 30" stroke="#a87a42" stroke-width="6" stroke-dasharray="10 8"/>
    </g>
    ${at(620, 300, 30, 0.8, pencil())}
    ${at(760, 150, -10, 0.55, tapeMeasure())}
  </g>`
}

const toolsSpreadArt = (() => {
  const r = rand(9)
  const bits = Array.from({ length: 40 }, (_, i) => {
    const x = 120 + r() * 2320
    const y = 600 + r() * 1100
    if (Math.abs(x - 1280) < 40) return ''
    const k = i % 4
    return k === 0 ? screw(x, y, r() * 360) : k === 1 ? nut(x, y, 10 + r() * 6) : shaving(x, y, r() * 360)
  }).join('')
  return svgDoc(
    2560,
    1760,
    `<clipPath id="matClip"><rect width="960" height="560" rx="18"/></clipPath>
     <!-- the wall behind: painted block -->
     <rect width="2560" height="520" fill="#cfe0e6"/>
     ${Array.from({ length: 9 }, (_, row) => Array.from({ length: 14 }, (_, c) => `<rect x="${c * 200 - (row % 2) * 100}" y="${row * 60}" width="196" height="56" rx="4" fill="#d8e8ee" stroke="#b4c8d0" stroke-width="3"/>`).join('')).join('')}
     <rect y="490" width="2560" height="40" fill="#7a8a92" stroke="${INK}" stroke-width="4"/>
     <!-- the floor -->
     ${plywood()}
     <!-- hazard tape along the back of the floor -->
     <g>
       <rect y="540" width="2560" height="44" fill="#ffd21a"/>
       ${Array.from({ length: 50 }, (_, i) => `<path d="M${i * 60} 584 L ${i * 60 + 30} 540 L ${i * 60 + 54} 540 L ${i * 60 + 24} 584 Z" fill="#2b2b2b"/>`).join('')}
       <rect y="540" width="2560" height="44" fill="none" stroke="${INK}" stroke-width="3"/>
     </g>
     ${cuttingMat()}
     ${blueprint()}
     <!-- tape measure ribbon curling across the floor -->
     <path d="M1150 1560 C 1350 1460 1500 1640 1750 1560 S 2150 1440 2380 1520" stroke="#ffcc1a" stroke-width="34" fill="none" stroke-linecap="round"/>
     <path d="M1150 1560 C 1350 1460 1500 1640 1750 1560 S 2150 1440 2380 1520" stroke="${INK}" stroke-width="3" fill="none" stroke-dasharray="3 22"/>
     ${bits}
     <!-- painted footprints: a robot walked here -->
     ${[0, 1, 2, 3].map((i) => `<rect x="${640 + i * 120}" y="${1290 + (i % 2) * 40}" width="54" height="34" rx="10" fill="#6aa6b4" opacity=".35"/>`).join('')}`,
  )
})()

/* ------------------------------------------------------- back layer -- */

const pegboard = (() => {
  const W = 2600
  const H = 1050
  return svgDoc(
    W,
    H,
    `<pattern id="holes" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#d2a96f"/><circle cx="20" cy="20" r="5" fill="#8a6235"/></pattern>
     <rect x="20" y="120" width="${W - 40}" height="${H - 140}" rx="10" fill="url(#holes)" stroke="${INK}" stroke-width="6"/>
     <rect x="20" y="120" width="${W - 40}" height="34" fill="#a87a42" stroke="${INK}" stroke-width="5"/>
     <rect x="20" y="${H - 54}" width="${W - 40}" height="34" fill="#a87a42" stroke="${INK}" stroke-width="5"/>
     <!-- shelf across the top with paint cans and jars -->
     <rect x="60" y="300" width="560" height="24" fill="#a87a42" stroke="${INK}" stroke-width="5"/>
     ${[[100, '#3a6fd8'], [200, '#e8322b'], [300, '#2f9a4a']].map(([x, c]) => `<g><rect x="${x}" y="200" width="84" height="100" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="5"/><rect x="${x}" y="226" width="84" height="50" fill="${c}"/><path d="M${x} 210 L ${(x as number) + 84} 210" stroke="${INK}" stroke-width="4"/><path d="M${(x as number) + 10} 200 Q ${(x as number) + 42} 170 ${(x as number) + 74} 200" stroke="${INK}" stroke-width="4" fill="none"/></g>`).join('')}
     <path d="M ${410} 300 L 410 230 Q 410 210 430 210 L 500 210 Q 520 210 520 230 L 520 300 Z" fill="#e6f3f7" stroke="${INK}" stroke-width="5" opacity=".9"/>
     <rect x="404" y="194" width="122" height="22" rx="6" fill="#e8572b" stroke="${INK}" stroke-width="4"/>
     ${[[430, 260], [452, 280], [480, 256], [500, 284], [444, 240]].map(([x, y]) => nut(x, y, 10)).join('')}
     <!-- the sign -->
     <g transform="translate(1300 70)">
       <path d="M-60 0 L 0 -50 L 60 0" stroke="#7a8a92" stroke-width="6" fill="none"/>
       <rect x="-380" y="0" width="760" height="130" rx="18" fill="#e8322b" stroke="${INK}" stroke-width="6"/>
       <rect x="-364" y="14" width="728" height="102" rx="12" fill="none" stroke="#fff3c8" stroke-width="5" stroke-dasharray="20 12"/>
       <text x="0" y="88" text-anchor="middle" font-family="'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif" font-weight="900" font-size="66" fill="#fff6e0" letter-spacing="4">MILO'S WORKSHOP</text>
     </g>
     <!-- tools on hooks, with their painted outlines -->
     ${[
       [790, 560, 0, 1, hammer()],
       [1000, 600, 12, 0.95, wrench(320)],
       [1110, 600, 8, 0.8, wrench(260)],
       [1200, 600, 4, 0.66, wrench(210)],
       [1600, 600, 0, 0.9, screwdriver('#e8322b')],
       [1700, 600, 0, 0.9, screwdriver('#3a6fd8', true)],
       [1800, 600, 0, 0.9, screwdriver('#f4b400')],
       [2000, 600, 0, 0.95, pliers()],
       [2300, 330, 0, 0.9, hardHat()],
       [2310, 560, 0, 0.8, goggles()],
       [400, 560, 0, 0.9, clamp()],
       [2200, 860, 0, 0.75, tapeMeasure()],
     ]
       .map(([x, y, rot, s, svg]) => `<g opacity=".18" transform="translate(${(x as number) + 10} ${(y as number) + 12})">${at(0, 0, rot as number, s as number, svg as string)}</g>${peg(x as number, (y as number) - 150 * (s as number))}${at(x as number, y as number, rot as number, s as number, svg as string)}`)
       .join('')}
     ${at(1400, 880, 0, 0.9, saw())}
     ${peg(1300, 830)}${peg(1560, 830)}
     ${at(700, 900, 0, 0.9, level())}
     ${peg(560, 880)}${peg(840, 880)}`,
    { cut: 5 },
  )
})()

/* ----------------------------------------------------- middle layer -- */

const workbench = svgDoc(
  1000,
  640,
  `<!-- legs + lower shelf -->
   ${[60, 900].map((x) => `<rect x="${x}" y="200" width="44" height="430" fill="#b07c44" stroke="${INK}" stroke-width="5"/>`).join('')}
   <rect x="60" y="520" width="884" height="30" fill="#b07c44" stroke="${INK}" stroke-width="5"/>
   <!-- on the lower shelf: bucket of screws, paint can, a battery box -->
   <path d="M150 520 L 140 430 L 250 430 L 240 520 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M140 430 Q 195 380 250 430" stroke="${INK}" stroke-width="5" fill="none"/>
   <rect x="320" y="440" width="110" height="80" rx="6" fill="#c9ced6" stroke="${INK}" stroke-width="5"/><rect x="320" y="460" width="110" height="34" fill="#f4b400"/>
   <g transform="translate(700 440)">
     <rect width="180" height="80" fill="#2f9a4a" stroke="${INK}" stroke-width="5"/>
     <path d="M80 10 L 60 44 L 86 44 L 70 72 L 112 32 L 86 32 L 100 10 Z" fill="#ffe27a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <text x="150" y="52" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#fff">AA</text>
   </g>
   <!-- drawers -->
   <rect x="60" y="200" width="884" height="150" fill="#c48a4c" stroke="${INK}" stroke-width="5"/>
   ${[0, 1, 2].map((i) => `<rect x="${86 + i * 290}" y="222" width="252" height="106" rx="6" fill="#d39a5a" stroke="${INK}" stroke-width="4"/><rect x="${182 + i * 290}" y="262" width="60" height="18" rx="9" fill="#7a8a92" stroke="${INK}" stroke-width="3"/>`).join('')}
   <!-- butcher-block top -->
   <rect x="20" y="150" width="960" height="60" rx="8" fill="#e0b27a" stroke="${INK}" stroke-width="6"/>
   ${Array.from({ length: 12 }, (_, i) => `<path d="M${40 + i * 80} 154 L ${40 + i * 80} 206" stroke="#c4935a" stroke-width="4"/>`).join('')}
   <!-- vise -->
   <g transform="translate(80 150)">
     <rect x="0" y="-70" width="70" height="70" fill="#4f7fa8" stroke="${INK}" stroke-width="5"/>
     <rect x="80" y="-70" width="70" height="70" fill="#4f7fa8" stroke="${INK}" stroke-width="5"/>
     <rect x="-40" y="-44" width="40" height="14" fill="#9aa3ad" stroke="${INK}" stroke-width="3"/>
     <rect x="-56" y="-60" width="16" height="46" rx="4" fill="#9aa3ad" stroke="${INK}" stroke-width="3"/>
   </g>
   <!-- jar of screws, mug, flashlight -->
   <path d="M330 150 L 330 70 Q 330 60 340 60 L 420 60 Q 430 60 430 70 L 430 150 Z" fill="#e6f3f7" stroke="${INK}" stroke-width="5" opacity=".95"/>
   <rect x="324" y="44" width="112" height="22" rx="6" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   ${[[350, 130], [380, 120], [410, 135], [360, 100], [400, 96], [372, 140]].map(([x, y]) => nut(x, y, 11)).join('')}
   <g transform="translate(560 70)">
     <path d="M0 0 L 90 0 L 84 80 L 6 80 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M90 16 Q 126 20 120 44 Q 114 64 86 60" stroke="${INK}" stroke-width="10" fill="none"/>
     <path d="M90 16 Q 126 20 120 44 Q 114 64 86 60" stroke="#fdfbf5" stroke-width="4" fill="none"/>
     <path d="M45 50 C 30 38 24 28 34 22 C 40 18 45 24 45 28 C 45 24 50 18 56 22 C 66 28 60 38 45 50 Z" fill="#e8322b"/>
     <text x="45" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="${INK}">DAD</text>
   </g>
   <g transform="translate(760 100) rotate(-8)">
     <rect x="0" y="0" width="150" height="44" rx="12" fill="#e8572b" stroke="${INK}" stroke-width="5"/>
     <path d="M150 -6 L 190 -14 L 190 58 L 150 50 Z" fill="#c9ced6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <rect x="40" y="10" width="30" height="24" rx="6" fill="#2b2b2b"/>
   </g>`,
  { cut: 5 },
)

const toolbox = svgDoc(
  520,
  360,
  `<!-- tools sticking out -->
   ${at(170, 120, -18, 0.55, hammer('#3a6fd8'))}
   ${at(330, 110, 14, 0.55, wrench(300))}
   ${at(250, 100, 4, 0.5, screwdriver('#2f9a4a'))}
   <!-- box -->
   <path d="M40 160 L 480 160 L 460 340 L 60 340 Z" fill="#e8322b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <rect x="30" y="140" width="460" height="40" rx="8" fill="#f04b40" stroke="${INK}" stroke-width="6"/>
   <path d="M60 220 L 460 220" stroke="#b8221c" stroke-width="6"/>
   <rect x="220" y="200" width="80" height="40" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="5"/>
   <path d="M70 300 L 450 300" stroke="#000" stroke-width="6" opacity=".15"/>
   <path d="M160 140 L 170 80 L 350 80 L 360 140" stroke="#7a8a92" stroke-width="16" fill="none" stroke-linejoin="round"/>
   <path d="M160 140 L 170 80 L 350 80 L 360 140" stroke="${INK}" stroke-width="3" fill="none" opacity=".6"/>`,
  { cut: 5 },
)

/* --------------------------------------------------------- Robo -- */

const ROBO = { w: 420, h: 600 }
const RK = 0.6 / ROBO.w
const RP = (x: number, y: number) => [(x - ROBO.w / 2) * RK, (ROBO.h - y) * RK] as const

const roboBody = svgDoc(
  ROBO.w,
  ROBO.h,
  `<!-- antenna -->
   <path d="M210 70 L 210 34" stroke="${INK}" stroke-width="10"/><path d="M210 70 L 210 34" stroke="#9aa3ad" stroke-width="5"/>
   <circle cx="210" cy="22" r="16" fill="#b04a42" stroke="${INK}" stroke-width="5"/>
   <!-- head -->
   <circle cx="104" cy="140" r="16" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/><circle cx="316" cy="140" r="16" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <rect x="108" y="70" width="204" height="142" rx="24" fill="#7fb8c4" stroke="${INK}" stroke-width="6"/>
   <rect x="120" y="80" width="180" height="20" rx="10" fill="#a6d4dc"/>
   <!-- sleepy eyes -->
   <circle cx="165" cy="136" r="30" fill="#2c3e48" stroke="${INK}" stroke-width="5"/>
   <circle cx="255" cy="136" r="30" fill="#2c3e48" stroke="${INK}" stroke-width="5"/>
   <path d="M145 138 Q 165 152 185 138 M235 138 Q 255 152 275 138" stroke="#7fb8c4" stroke-width="6" fill="none" stroke-linecap="round"/>
   <!-- mouth grill -->
   <rect x="160" y="172" width="100" height="24" rx="8" fill="#2c3e48" stroke="${INK}" stroke-width="4"/>
   ${[0, 1, 2, 3].map((i) => `<path d="M${180 + i * 20} 174 L ${180 + i * 20} 194" stroke="#7fb8c4" stroke-width="4"/>`).join('')}
   <!-- neck -->
   <rect x="188" y="210" width="44" height="24" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <!-- body -->
   <rect x="94" y="230" width="232" height="222" rx="22" fill="#6aa6b4" stroke="${INK}" stroke-width="6"/>
   ${[[110, 246], [310, 246], [110, 436], [310, 436]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#4f8592"/>`).join('')}
   <rect x="130" y="256" width="160" height="168" rx="14" fill="#dde8ea" stroke="${INK}" stroke-width="5"/>
   <!-- empty battery slot -->
   <rect x="150" y="274" width="120" height="52" rx="10" fill="#b9c6ca" stroke="${INK}" stroke-width="4" stroke-dasharray="10 7"/>
   <text x="166" y="309" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#7d8b90">−</text>
   <text x="242" y="310" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#7d8b90">+</text>
   <!-- power meter (empty) -->
   ${[0, 1, 2, 3].map((i) => `<rect x="${150 + i * 31}" y="344" width="27" height="22" rx="4" fill="${i ? '#b9c6ca' : '#e8322b'}" stroke="${INK}" stroke-width="3"/>`).join('')}
   <circle cx="168" cy="396" r="14" fill="#f4b400" stroke="${INK}" stroke-width="4"/><path d="M168 396 L 176 388" stroke="${INK}" stroke-width="4"/>
   <circle cx="252" cy="396" r="14" fill="#e8572b" stroke="${INK}" stroke-width="4"/><path d="M252 396 L 244 388" stroke="${INK}" stroke-width="4"/>
   <!-- hips, legs, feet -->
   <rect x="130" y="450" width="160" height="24" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   ${[140, 230].map((x) => `<rect x="${x}" y="470" width="50" height="76" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/>
     <path d="M${x} 496 L ${x + 50} 496 M${x} 520 L ${x + 50} 520" stroke="#4f8592" stroke-width="4"/>
     <path d="M${x - 22} 586 L ${x - 22} 566 Q ${x - 22} 542 ${x + 2} 542 L ${x + 48} 542 Q ${x + 72} 542 ${x + 72} 566 L ${x + 72} 586 Z" fill="#4f8592" stroke="${INK}" stroke-width="5"/>`).join('')}`,
  { cut: 5 },
)

const roboArm = svgDoc(
  90,
  220,
  `<rect x="27" y="10" width="36" height="150" rx="18" fill="#7fb8c4" stroke="${INK}" stroke-width="5"/>
   ${[50, 80, 110, 140].map((y) => `<path d="M30 ${y} L 60 ${y}" stroke="#4f8592" stroke-width="4"/>`).join('')}
   <circle cx="45" cy="20" r="16" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>
   <path d="M45 160 Q 10 170 14 206 L 30 206 Q 30 180 45 178 Q 60 180 60 206 L 76 206 Q 80 170 45 160 Z" fill="#9aa3ad" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
)

const roboEyes = svgDoc(
  180,
  80,
  `<radialGradient id="eg"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#9ff3ff"/><stop offset="1" stop-color="#2bc6e8"/></radialGradient>
   <circle cx="45" cy="41" r="30" fill="url(#eg)" stroke="${INK}" stroke-width="5"/>
   <circle cx="135" cy="41" r="30" fill="url(#eg)" stroke="${INK}" stroke-width="5"/>
   <circle cx="50" cy="44" r="11" fill="#1d4f66"/><circle cx="140" cy="44" r="11" fill="#1d4f66"/>
   <circle cx="44" cy="36" r="5" fill="#fff"/><circle cx="134" cy="36" r="5" fill="#fff"/>`,
)

const roboSmile = svgDoc(110, 34, `<path d="M8 6 Q 55 46 102 6 Z" fill="#2c3e48" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M30 18 Q 55 30 80 18" stroke="#e8727a" stroke-width="7" fill="none" stroke-linecap="round"/>`)

const roboMeter = svgDoc(124, 24, [0, 1, 2, 3].map((i) => `<rect x="${2 + i * 31}" y="1" width="27" height="22" rx="4" fill="${['#e8322b', '#f4b400', '#9ed84a', '#3ccf5a'][i]}" stroke="${INK}" stroke-width="3"/>`).join(''))

const roboBattery = svgDoc(
  124,
  56,
  `<rect x="6" y="6" width="104" height="44" rx="12" fill="#39b54a" stroke="${INK}" stroke-width="4"/>
   <rect x="6" y="6" width="28" height="44" rx="10" fill="#2b2b2b"/>
   <rect x="108" y="18" width="12" height="20" rx="3" fill="#c9ced6" stroke="${INK}" stroke-width="3"/>
   <path d="M66 10 L 52 30 L 66 30 L 58 46 L 82 24 L 68 24 L 76 10 Z" fill="#ffe27a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,
)

const antennaGlow = svgDoc(
  80,
  80,
  `<radialGradient id="ag"><stop offset="0" stop-color="#fff9c4"/><stop offset=".45" stop-color="#ffd84a"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
   <circle cx="40" cy="40" r="40" fill="url(#ag)"/><circle cx="40" cy="40" r="15" fill="#ffe44d" stroke="${INK}" stroke-width="4"/>`,
)

const Z = (x: number, y: number, s: number) =>
  `<path d="M${x} ${y} l ${s} 0 l ${-s} ${s} l ${s} 0" stroke="${INK}" stroke-width="${s * 0.42}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
   <path d="M${x} ${y} l ${s} 0 l ${-s} ${s} l ${s} 0" stroke="#fff" stroke-width="${s * 0.2}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`
const zzz = svgDoc(170, 170, `${Z(10, 110, 34)}${Z(62, 58, 44)}${Z(116, 8, 40)}`)

// generous padding all round; the text is fitted to the bubble with textLength so it can't spill out
const beepBubble = svgDoc(
  400,
  200,
  `<path d="M56 24 L 344 24 Q 372 24 372 52 L 372 122 Q 372 150 344 150 L 120 150 L 66 188 L 84 150 L 56 150 Q 28 150 28 122 L 28 52 Q 28 24 56 24 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <text x="200" y="105" text-anchor="middle" textLength="290" lengthAdjust="spacingAndGlyphs" font-family="'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif" font-weight="900" font-size="48" fill="#2bb6d8">BEEP BOOP!</text>`,
)

/* ------------------------------------------------- the cardboard box -- */

const BOX = { w: 520, h: 460 }
const BK = 0.56 / BOX.w
const BP = (x: number, y: number) => [(x - BOX.w / 2) * BK, (BOX.h - y) * BK] as const
const WHEELS = [
  [130, 392],
  [390, 392],
] as const

const cardboardBox = svgDoc(
  BOX.w,
  BOX.h,
  `<!-- open flaps -->
   <path d="M40 150 L 10 60 L 200 50 L 240 150 Z" fill="#b9864a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M480 150 L 510 60 L 320 50 L 280 150 Z" fill="#b9864a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M90 150 L 120 96 L 400 96 L 430 150 Z" fill="#8a5f30" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <!-- front -->
   <rect x="40" y="146" width="440" height="296" rx="4" fill="#d3a062" stroke="${INK}" stroke-width="6"/>
   <path d="M44 160 L 476 160" stroke="#b9864a" stroke-width="5"/>
   <rect x="230" y="146" width="60" height="110" fill="#e9c48a" opacity=".9"/>
   <path d="M230 256 L 240 248 L 250 256 L 260 248 L 270 256 L 280 248 L 290 256" stroke="#c9a06a" stroke-width="3" fill="none"/>
   <!-- printed arrows + glass -->
   <g fill="none" stroke="#7a4e22" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
     <path d="M90 300 L 90 220 M70 240 L 90 220 L 110 240"/><path d="M130 300 L 130 220 M110 240 L 130 220 L 150 240"/>
     <path d="M400 216 L 440 216 L 432 260 Q 420 276 408 260 Z M420 276 L 420 300 M404 300 L 436 300"/>
   </g>
   <!-- Milo's marker scribble -->
   <text x="300" y="340" text-anchor="middle" font-family="${MARKER}" font-size="54" fill="#d0372a" transform="rotate(-6 300 340)">MILO</text>
   <!-- where the wheels go -->
   ${WHEELS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="#7a4e22" stroke-width="5" stroke-dasharray="10 9"/><path d="M${x - 12} ${y} L ${x + 12} ${y} M${x} ${y - 12} L ${x} ${y + 12}" stroke="#7a4e22" stroke-width="5"/>`).join('')}`,
  { cut: 5 },
)

const boxHole = svgDoc(
  80,
  80,
  `<path d="${starPath(40, 40, 32, 22, 9)}" fill="#e9c48a"/>
   <circle cx="40" cy="40" r="20" fill="#2a1a0c" stroke="${INK}" stroke-width="4"/>`,
)

const wheel = svgDoc(
  150,
  150,
  `<circle cx="75" cy="75" r="68" fill="#2b2b2b" stroke="${INK}" stroke-width="6"/>
   <circle cx="75" cy="75" r="42" fill="#ffc21a" stroke="${INK}" stroke-width="5"/>
   ${[0, 1, 2, 3, 4].map((i) => {
     const a = (i / 5) * Math.PI * 2
     return `<circle cx="${(75 + Math.cos(a) * 24).toFixed(1)}" cy="${(75 + Math.sin(a) * 24).toFixed(1)}" r="7" fill="#e0a400"/>`
   }).join('')}
   <circle cx="75" cy="75" r="11" fill="#9aa3ad" stroke="${INK}" stroke-width="4"/>
   <path d="M40 30 Q 60 18 84 18" stroke="#fff" stroke-width="7" opacity=".35" fill="none" stroke-linecap="round"/>`,
)

const flag = svgDoc(
  140,
  230,
  `<path d="M20 225 L 20 20" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M20 225 L 20 20" stroke="#c9a06a" stroke-width="5" stroke-linecap="round"/>
   <path d="M24 22 Q 80 6 132 30 Q 90 50 128 80 Q 70 64 24 86 Z" fill="#3ccf5a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="${starPath(66, 50, 15)}" fill="#fff6c8"/>`,
)

/* ------------------------------------------------- tools to pick up -- */

const battery = svgDoc(
  280,
  130,
  `<rect x="14" y="14" width="224" height="102" rx="26" fill="#39b54a" stroke="${INK}" stroke-width="6"/>
   <rect x="14" y="14" width="64" height="102" rx="24" fill="#2b2b2b" stroke="${INK}" stroke-width="6"/>
   <rect x="60" y="14" width="18" height="102" fill="#2b2b2b"/>
   <rect x="236" y="44" width="30" height="42" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="5"/>
   <rect x="90" y="24" width="140" height="18" rx="9" fill="#fff" opacity=".35"/>
   <path d="M156 24 L 126 70 L 152 70 L 136 106 L 190 54 L 162 54 L 178 24 Z" fill="#ffe27a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <text x="46" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#fff">−</text>
   <text x="210" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="#fff">+</text>`,
  { cut: 5 },
)

const drill = svgDoc(
  340,
  260,
  `<!-- bit -->
   <rect x="8" y="76" width="74" height="18" rx="4" fill="#c9ced6" stroke="${INK}" stroke-width="4"/>
   ${[18, 34, 50, 66].map((x) => `<path d="M${x} 78 L ${x + 10} 92" stroke="${INK}" stroke-width="3"/>`).join('')}
   <!-- chuck -->
   <path d="M80 62 L 116 54 L 116 116 L 80 108 Z" fill="#555c66" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <!-- body -->
   <path d="M114 46 Q 114 30 134 30 L 290 30 Q 330 30 330 70 L 330 104 Q 330 130 300 130 L 134 130 Q 114 130 114 114 Z" fill="#f4b400" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <rect x="140" y="40" width="160" height="16" rx="8" fill="#fff3b0" opacity=".7"/>
   ${[0, 1, 2, 3].map((i) => `<path d="M${270 + i * 12} 66 L ${270 + i * 12} 96" stroke="#2b2b2b" stroke-width="6" stroke-linecap="round"/>`).join('')}
   <!-- handle + trigger -->
   <path d="M200 128 L 270 128 L 262 222 L 206 222 Z" fill="#2b2b2b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M196 132 Q 178 160 196 176 L 204 168 Q 194 156 206 138 Z" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <rect x="176" y="214" width="120" height="40" rx="10" fill="#f4b400" stroke="${INK}" stroke-width="6"/>
   <rect x="190" y="226" width="40" height="12" rx="4" fill="#3ccf5a"/>`,
  { cut: 5 },
)

/* ------------------------------------------------- spread behaviour -- */

/** Live state shared by the pieces of this spread (reset when you leave it). */
const robo = { power: 0, battery: false, talk: 0 }
const car = { flag: 0, roll: 0 }
/** how far each hole's wheel has popped on (0..1) */
const mount = [0, 0]
const drillState: DragState = { progress: 0, over: false, done: false, held: false }
const wheelStates: DragState[] = [0, 1].map(() => ({ progress: 0, over: false, done: false, held: false }))
/** which hole each loose wheel went into (-1: still loose) and which holes are full */
const plan = { placed: [-1, -1], taken: [false, false], aim: 0 }

// Robo stands up at the back of the left page, to the right of the story card
// (card spans x -1.56…-0.36), so his whole body and chest slot are in view.
const ROBO_AT: [number, number] = [-0.08, -0.55]
const BOX_AT: [number, number] = [0.66, 0.18]
// the loose wheels lie on the page at the front right, clear of the card, battery and drill
const WHEEL_AT: [number, number][] = [
  [0.6, 0.5],
  [1.0, 0.5],
]
const DRILL_AT: [number, number] = [1.28, 0.72]
/** where hole h is, on the page just in front of the box */
const holePage = (h: number): [number, number] => [BOX_AT[0] + (WHEELS[h][0] - BOX.w / 2) * BK, BOX_AT[1] + 0.06]
/**
 * Which hole wheel i is heading for. Either wheel fits either hole: while you carry
 * it, it's the free hole nearest your finger; otherwise its own hole (or the other
 * one if that is taken). Once it's on, it stays that hole.
 */
const aimFor = (i: number) => {
  if (plan.placed[i] >= 0) return plan.placed[i]
  if (wheelStates[i].held) return plan.taken[plan.aim] ? 1 - plan.aim : plan.aim
  return plan.taken[i] ? 1 - i : i
}
const wheelTargets = [0, 1].map((i) => ({
  get at() {
    return holePage(aimFor(i))
  },
  r: 0.2,
  y: 0.12,
}))

/** Running story timelines; killed when the page turns away (their callbacks too). */
let timelines: gsap.core.Timeline[] = []
const story = () => {
  const tl = gsap.timeline({ onComplete: () => (timelines = timelines.filter((t) => t !== tl)) })
  timelines.push(tl)
  return tl
}

/** Resets this spread's state when the page is turned away; owns timers. */
function ToolsDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  useFrame(() => {
    const away = anim.raise[index].v < 0.5
    if (away && live.current) {
      live.current = false
      timelines.forEach((t) => t.kill())
      timelines = []
      gsap.killTweensOf(robo)
      gsap.killTweensOf(car)
      gsap.killTweensOf(mount)
      Object.assign(robo, { power: 0, battery: false, talk: 0 })
      Object.assign(car, { flag: 0, roll: 0 })
      mount[0] = mount[1] = 0
      plan.placed = [-1, -1]
      plan.taken = [false, false]
    } else if (!away) live.current = true
  })
  return null
}

function powerUp() {
  robo.battery = true
  beat('tools', 1) // the battery is in: Robo's "woke up" text starts writing
  bus.emit('sfx', 'snap')
  story()
    .add(() => bus.emit('sfx', 'powerup'), 0.15)
    .to(robo, { power: 1, duration: 1.1, ease: 'power1.inOut' }, 0.15)
    .add(() => bus.emit('milo', 'cheer'), 0.5)
    .add(() => bus.emit('sfx', 'robot'), 1.3)
    .to(robo, { talk: 1, duration: 0.35, ease: 'back.out(2)' }, 1.3)
    .to(robo, { talk: 0, duration: 0.25 }, 3.2)
    .add(() => {
      bus.emit('sfx', 'whoosh')
      bus.emit('pull', 'robo')
    }, 3.3)
}

/** the drill has made both holes: now the loose wheels wake up */
function holesDrilled() {
  beat('tools', 2) // the "now pop on the wheels" text starts writing
  bus.emit('sfx', 'sparkle')
  bus.emit('milo', 'point')
}

/** wheel i was dropped on the box: it clicks onto the hole it was aiming for */
function wheelOn(i: number) {
  // `held` is already false here, so use the hole that was nearest the finger
  const h = plan.taken[plan.aim] ? 1 - plan.aim : plan.aim
  plan.placed[i] = h
  plan.taken[h] = true
  bus.emit('sfx', 'snap')
  const both = plan.taken[0] && plan.taken[1]
  const tl = story()
  tl.to(mount, { [h]: 1, duration: 0.45, ease: 'none' }, 0.25).add(() => bus.emit('sfx', 'boing'), 0.3)
  if (!both) return
  beat('tools', 3) // both wheels are on: the "box car zoomed off" text starts writing
  tl.to(car, { flag: 1, duration: 0.7, ease: 'power1.out' }, 0.6)
    .add(() => bus.emit('sfx', 'sparkle'), 0.8)
    .add(() => bus.emit('milo', 'jump'), 0.7)
    .add(() => {
      car.roll = 1
      bus.emit('sfx', 'zoom')
      bus.emit('pull', 'boxcar')
    }, 2.2)
}

/**
 * Works out which hole is nearest the finger while a wheel is carried (by screen
 * position), so either wheel can go on either hole.
 */
function WheelAim() {
  const { baseY } = useSpread()
  const { camera, gl } = useThree()
  const g = useRef<THREE.Group>(null!)
  const px = useRef(0)
  const v = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    const move = (e: PointerEvent) => (px.current = e.clientX)
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  useFrame(() => {
    if (!wheelStates[0].held && !wheelStates[1].held) return
    const rect = gl.domElement.getBoundingClientRect()
    let best = plan.aim
    let bd = Infinity
    for (const h of [0, 1]) {
      if (plan.taken[h]) continue
      const [x, z] = holePage(h)
      v.set(x - BOX_AT[0], 0, z - BOX_AT[1])
      g.current.localToWorld(v)
      v.project(camera)
      const d = Math.abs(rect.left + ((v.x + 1) / 2) * rect.width - px.current)
      if (d < bd) {
        bd = d
        best = h
      }
    }
    plan.aim = best
  })
  return <group ref={g} position={[BOX_AT[0], baseY, BOX_AT[1]]} />
}

/** Sawdust spraying off the box while the drill is working. */
function Sawdust() {
  const { baseY } = useSpread()
  const N = 26
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const parts = useMemo(() => Array.from({ length: N }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0 })), [])
  const m = useMemo(() => new THREE.Object3D(), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0cf96', roughness: 1, side: THREE.DoubleSide }), [])
  const spawn = useRef(0)
  useFrame((_, dt) => {
    spawn.current += dt * (drillState.over && !drillState.done ? 40 : 0)
    for (const q of parts) {
      if (spawn.current >= 1 && q.life <= 0) {
        spawn.current -= 1
        const [hx, hy] = BP(WHEELS[drillState.progress < 0.5 ? 0 : 1][0], WHEELS[0][1])
        q.life = 0.7 + Math.random() * 0.4
        q.p.set(BOX_AT[0] + hx, baseY + hy, BOX_AT[1] + 0.03)
        q.v.set((Math.random() - 0.5) * 1.4, 0.6 + Math.random() * 1.0, 0.3 + Math.random() * 0.8)
        q.r = Math.random() * 6
      }
      if (q.life > 0) {
        q.life -= dt
        q.v.y -= 4.5 * dt
        q.p.addScaledVector(q.v, dt)
        if (q.p.y < baseY + 0.005) {
          q.p.y = baseY + 0.005
          q.v.set(0, 0, 0)
        }
        q.r += dt * 8
      }
    }
    spawn.current = Math.min(spawn.current, 3)
    parts.forEach((q, i) => {
      m.position.copy(q.p)
      m.rotation.set(q.r, q.r * 0.7, 0)
      m.scale.setScalar(q.life > 0 ? Math.min(1, q.life * 3) : 0.0001)
      m.updateMatrix()
      mesh.current.setMatrixAt(i, m.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} material={mat} frustumCulled={false}>
      <planeGeometry args={[0.022, 0.014]} />
    </instancedMesh>
  )
}

/**
 * Keeps its children (the drill) off the page until Robo has woken up, then pops
 * them in around their home spot. This makes the two jobs happen in story order
 * (battery first, then the box car), so the text for each can follow it.
 */
function WakeGate({ home, children }: { home: [number, number]; children: ReactNode }) {
  const { baseY } = useSpread()
  const g = useRef<THREE.Group>(null!)
  useFrame(() => {
    const k = clamp01((robo.power - 0.85) / 0.15)
    const s = k > 0 ? easeOutBack(k, 1.8) : 0
    g.current.visible = s > 0.01
    g.current.scale.setScalar(Math.max(0.0001, s))
  })
  return (
    <group ref={g} position={[home[0], baseY, home[1]]} visible={false}>
      <group position={[-home[0], -baseY, -home[1]]}>{children}</group>
    </group>
  )
}

const ease = (x: number) => easeOutBack(clamp01(x), 1.6)

function Robo() {
  const [ex, ey] = RP(210, 136)
  const [mx, my] = RP(150, 355)
  const [bx, by] = RP(210, 300)
  const [ax, ay] = RP(210, 22)
  const [lx, ly] = RP(80, 262)
  const [rx, ry] = RP(340, 262)
  const [sx, sy] = RP(210, 184)
  const armSize: [number, number] = [90 * RK, 220 * RK]
  const armOff: [number, number] = [0, -(110 - 20) * RK]
  return (
    <PopCard
      art={roboBody}
      size={[ROBO.w * RK, ROBO.h * RK]}
      at={ROBO_AT}
      delay={0.16}
      rotY={0.12}
      px={1024}
      tap="wiggle"
      onTap={() => bus.emit('sfx', robo.power > 0.5 ? 'robot' : 'pop')}
      escape={{ to: [2.6, 0, -5.4], arc: 0.9, scale: 3.0, duration: 2.6, spin: -0.3, on: 'robo' }}
    >
      <Part
        art={roboArm}
        size={armSize}
        pivot={[lx, ly, 0]}
        offset={armOff}
        animate={(g, t) => {
          const a = robo.power
          g.rotation.z = -0.06 - a * (2.35 + Math.sin(t * 9) * 0.35) + (1 - a) * Math.sin(t * 1.1) * 0.03
        }}
      />
      <Part
        art={roboArm}
        size={armSize}
        pivot={[rx, ry, 0]}
        offset={armOff}
        animate={(g, t) => {
          const a = robo.power
          g.rotation.z = 0.06 + a * (0.5 + Math.sin(t * 5) * 0.25) - (1 - a) * Math.sin(t * 1.1) * 0.03
        }}
      />
      <Part
        art={roboEyes}
        size={[180 * RK, 80 * RK]}
        pivot={[ex, ey, 0]}
        emissive={0.7}
        animate={(g, t) => {
          g.visible = robo.power > 0.25
          // blink now and then
          const blink = Math.sin(t * 1.3) > 0.985 ? 0.15 : 1
          g.scale.set(1, Math.min(1, (robo.power - 0.25) * 3) * blink, 1)
        }}
      />
      <Part art={roboSmile} size={[110 * RK, 34 * RK]} pivot={[sx, sy, 0]} animate={(g) => (g.visible = robo.power > 0.6)} />
      <Part
        art={roboMeter}
        size={[124 * RK, 24 * RK]}
        pivot={[mx, my, 0]}
        offset={[62 * RK, 0]}
        emissive={0.5}
        animate={(g) => {
          g.visible = robo.power > 0.02
          g.scale.x = Math.max(0.001, robo.power)
        }}
      />
      <Part art={roboBattery} size={[124 * RK, 56 * RK]} pivot={[bx, by, 0]} animate={(g) => (g.visible = robo.battery)} />
      <Part
        art={antennaGlow}
        size={[80 * RK, 80 * RK]}
        pivot={[ax, ay, 0]}
        emissive={1}
        animate={(g, t) => {
          g.visible = robo.power > 0.5
          g.scale.setScalar(0.8 + Math.max(0, Math.sin(t * 6)) * 0.5)
        }}
      />
      <Part
        art={zzz}
        size={[0.2, 0.2]}
        pivot={[0.16, 0.6, 0.01]}
        animate={(g, t) => {
          g.visible = robo.power < 0.05
          const c = (t * 0.45) % 1
          g.position.y = 0.6 + c * 0.12
          g.scale.setScalar(0.4 + Math.sin(c * Math.PI) * 0.7)
        }}
      />
      <Part
        art={beepBubble}
        size={[0.5, 0.25]}
        pivot={[0.1, 0.7, 0.02]}
        offset={[0.25, 0.12]}
        animate={(g) => {
          g.visible = robo.talk > 0.01
          g.scale.setScalar(Math.max(0.001, robo.talk))
        }}
      />
    </PopCard>
  )
}

function BoxCar() {
  const [fx, fy] = BP(470, 150)
  return (
    <PopCard
      art={cardboardBox}
      size={[BOX.w * BK, BOX.h * BK]}
      at={BOX_AT}
      delay={0.24}
      rotY={-0.08}
      px={1024}
      tap="jump"
      escape={{ to: [-2.3, 0, -4.4], arc: 0.5, scale: 3.0, duration: 2.0, spin: 0.25, on: 'boxcar' }}
    >
      {WHEELS.map(([x, y], i) => {
        const [px, py] = BP(x, y)
        return (
          <group key={i}>
            <Part
              art={boxHole}
              size={[80 * BK, 80 * BK]}
              pivot={[px, py, 0]}
              animate={(g) => {
                const k = clamp01((drillState.progress - i * 0.5) * 2)
                g.visible = k > 0.01 || drillState.done
                g.scale.setScalar(Math.max(0.001, drillState.done ? 1 : k))
              }}
            />
            <Part
              art={wheel}
              size={[150 * BK, 150 * BK]}
              pivot={[px, py, 0.006]}
              animate={(g, t) => {
                const k = ease(mount[i])
                g.visible = k > 0.01
                g.scale.setScalar(Math.max(0.001, k))
                g.rotation.z = -t * 14 * car.roll - (1 - k) * 3
              }}
            />
          </group>
        )
      })}
      <Part
        art={flag}
        size={[140 * BK, 230 * BK]}
        pivot={[fx, fy - 0.004, -0.004]}
        offset={[50 * BK, 115 * BK]}
        animate={(g, t) => {
          const k = ease(car.flag)
          g.visible = k > 0.01
          g.scale.setScalar(Math.max(0.001, k))
          g.rotation.z = Math.sin(t * 7) * 0.08 * car.roll
        }}
      />
    </PopCard>
  )
}

/**
 * The two loose wheels. Inert until the holes are drilled, lit up once the story
 * says "wheels". Re-renders when a hole fills so each wheel's ring sits on a free hole.
 */
function LooseWheels() {
  const [, force] = useState(0)
  const key = useRef(0)
  useFrame(() => {
    const k = (plan.taken[0] ? 1 : 0) + (plan.taken[1] ? 2 : 0)
    if (k !== key.current) {
      key.current = k
      force((n) => n + 1)
    }
  })
  return (
    <>
      {[0, 1].map((i) => (
        <DragPiece
          key={i}
          art={wheel}
          size={[0.22, 0.22]}
          at={WHEEL_AT[i]}
          delay={0.38 + i * 0.04}
          flat
          idle="none"
          target={wheelTargets[i]}
          consume
          state={wheelStates[i]}
          color="#ffd84a"
          disabled={() => !drillState.done}
          hint={() => heard('tools', 'wheels')}
          onDone={() => wheelOn(i)}
        />
      ))}
    </>
  )
}

function ToolsPopups() {
  return (
    <>
      <ToolsDirector />
      {/* back */}
      <PopCard art={pegboard} size={[2.7, 1.09]} at={[0, -0.9]} vfold={0.22} delay={0} px={2048} tap="none" />
      {/* middle */}
      <PopCard art={workbench} size={[1.05, 0.67]} at={[0.82, -0.5]} delay={0.1} rotY={-0.12} px={1024} tap="wiggle" />
      <PopCard art={toolbox} size={[0.46, 0.32]} at={[-1.2, -0.5]} delay={0.2} rotY={0.3} tap="jump" />
      <Robo />
      <BoxCar />
      <Sawdust />
      <WheelAim />
      {/* front: the things you can pick up */}
      <DragPiece
        art={battery}
        size={[0.38, 0.176]}
        at={[0.2, 0.72]}
        delay={0.34}
        idle="bob"
        target={{ at: ROBO_AT, r: 0.34, y: 0.4 }}
        consume
        color="#9ff36a"
        hint={() => heard('tools', 'empty')}
        onDone={powerUp}
      />
      <LooseWheels />
      <WakeGate home={DRILL_AT}>
        <DragPiece
          art={drill}
          size={[0.44, 0.336]}
          at={DRILL_AT}
          delay={0.4}
          rotY={-0.2}
          idle="bob"
          target={{ at: BOX_AT, r: 0.3 }}
          hold={1.6}
          state={drillState}
          color="#ffd84a"
          onDone={holesDrilled}
        />
      </WakeGate>
      <PopCard art={sparkle()} size={[0.12, 0.12]} at={[0.36, 0.6]} y={0.16} delay={0.45} hinge="spring" idle="float" emissive={0.8} tap="spin" />
    </>
  )
}

/* ---------------------------------------------------------- the world -- */

const garageWall = (() => {
  const W = 3400
  const H = 1080
  // the door opening (open to the yard) and a window, as holes in the wall
  const door = { x: 1450, y: 300, w: 820 }
  const win = { x: 2560, y: 250, w: 520, h: 360 }
  const hole = (x: number, y: number, w: number, h: number) => `M${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y} Z`
  return svgDoc(
    W,
    H,
    `<path fill-rule="evenodd" d="M0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z ${hole(door.x, door.y, door.w, H - door.y)} ${hole(win.x, win.y, win.w, win.h)}" fill="#c6d8df"/>
     <clipPath id="wallc"><path fill-rule="evenodd" d="M0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z ${hole(door.x, door.y, door.w, H - door.y)} ${hole(win.x, win.y, win.w, win.h)}"/></clipPath>
     <g clip-path="url(#wallc)">
       ${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${i * 64} L ${W} ${i * 64}" stroke="#a9bfc8" stroke-width="5"/><path d="M0 ${i * 64 + 6} L ${W} ${i * 64 + 6}" stroke="#d8e7ec" stroke-width="3"/>`).join('')}
       <rect y="${H - 70}" width="${W}" height="70" fill="#8a9ea8"/>
     </g>
     <!-- door frame + the rolled-up door -->
     <rect x="${door.x - 30}" y="${door.y - 30}" width="${door.w + 60}" height="30" fill="#f2f2ee" stroke="${INK}" stroke-width="6"/>
     <rect x="${door.x - 30}" y="${door.y - 30}" width="30" height="${H - door.y + 30}" fill="#f2f2ee" stroke="${INK}" stroke-width="6"/>
     <rect x="${door.x + door.w}" y="${door.y - 30}" width="30" height="${H - door.y + 30}" fill="#f2f2ee" stroke="${INK}" stroke-width="6"/>
     <g>
       <rect x="${door.x}" y="${door.y}" width="${door.w}" height="120" fill="#e8e6de" stroke="${INK}" stroke-width="5"/>
       ${[0, 1, 2].map((i) => `<path d="M${door.x} ${door.y + 40 * (i + 1)} L ${door.x + door.w} ${door.y + 40 * (i + 1)}" stroke="#b8b6ae" stroke-width="5"/>`).join('')}
       <rect x="${door.x + door.w / 2 - 50}" y="${door.y + 96}" width="100" height="18" rx="8" fill="#7a8a92" stroke="${INK}" stroke-width="4"/>
     </g>
     <!-- window frame -->
     <rect x="${win.x - 20}" y="${win.y - 20}" width="${win.w + 40}" height="${win.h + 40}" fill="none" stroke="#f2f2ee" stroke-width="40"/>
     <rect x="${win.x - 40}" y="${win.y - 40}" width="${win.w + 80}" height="${win.h + 80}" fill="none" stroke="${INK}" stroke-width="6"/>
     <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="none" stroke="${INK}" stroke-width="5"/>
     <path d="M${win.x + win.w / 2} ${win.y} L ${win.x + win.w / 2} ${win.y + win.h} M${win.x} ${win.y + win.h / 2} L ${win.x + win.w} ${win.y + win.h / 2}" stroke="#f2f2ee" stroke-width="18"/>
     <!-- a kid's drawing of Robo taped up, and a light switch -->
     <g transform="translate(1100 360) rotate(-4)">
       <rect x="-90" y="-110" width="180" height="220" fill="#fdfbf5" stroke="${INK}" stroke-width="5"/>
       <rect x="-48" y="-70" width="96" height="70" rx="10" fill="none" stroke="#2bb6d8" stroke-width="8"/>
       <rect x="-60" y="6" width="120" height="80" rx="10" fill="none" stroke="#2bb6d8" stroke-width="8"/>
       <circle cx="-22" cy="-38" r="9" fill="#2bb6d8"/><circle cx="22" cy="-38" r="9" fill="#2bb6d8"/>
       <rect x="-30" y="-122" width="60" height="22" fill="#fff6b0" opacity=".8"/>
     </g>
     <rect x="1300" y="560" width="56" height="86" rx="8" fill="#f2f2ee" stroke="${INK}" stroke-width="5"/><rect x="1318" y="584" width="20" height="36" rx="4" fill="#d8d6ce" stroke="${INK}" stroke-width="3"/>`,
    { grain: 0.8 },
  )
})()

const bigPegboard = svgDoc(
  1200,
  700,
  `<pattern id="h2" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#d2a96f"/><circle cx="20" cy="20" r="5" fill="#8a6235"/></pattern>
   <rect x="10" y="10" width="1180" height="680" rx="10" fill="url(#h2)" stroke="${INK}" stroke-width="7"/>
   ${at(200, 330, 0, 1.1, hammer())}${peg(200, 160)}
   ${at(420, 320, 0, 1.0, saw())}${peg(330, 230)}${peg(560, 230)}
   ${at(760, 330, 10, 1.0, wrench(320))}${peg(760, 170)}
   ${at(880, 340, 0, 0.9, screwdriver('#3a6fd8'))}${peg(880, 170)}
   ${at(980, 340, 0, 0.9, screwdriver('#e8322b', true))}${peg(980, 170)}
   ${at(1090, 320, 0, 0.9, pliers('#2f9a4a'))}${peg(1090, 180)}
   ${at(600, 560, 0, 1.1, level())}${peg(420, 540)}${peg(780, 540)}
   ${at(1060, 580, 0, 0.8, tapeMeasure())}`,
  { cut: 6 },
)

const shelving = (() => {
  const cans = (y: number, cols: string[]) =>
    cols.map((c, i) => `<g transform="translate(${70 + i * 140} ${y})"><rect x="0" y="-120" width="110" height="120" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="5"/><rect x="0" y="-90" width="110" height="60" fill="${c}"/><path d="M0 -108 L 110 -108" stroke="${INK}" stroke-width="4"/></g>`).join('')
  return svgDoc(
    640,
    1100,
    `${[60, 560].map((x) => `<rect x="${x}" y="20" width="24" height="1070" fill="#7a8a92" stroke="${INK}" stroke-width="5"/>`).join('')}
     ${[300, 580, 860, 1060].map((y) => `<rect x="40" y="${y}" width="560" height="26" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/>`).join('')}
     ${cans(300, ['#3a6fd8', '#e8322b', '#2f9a4a', '#f4b400'])}
     <g transform="translate(80 580)"><rect y="-180" width="220" height="180" fill="#d3a062" stroke="${INK}" stroke-width="5"/><path d="M110 -180 L 110 -120" stroke="#e9c48a" stroke-width="40"/><text x="110" y="-50" text-anchor="middle" font-family="${MARKER}" font-size="40" fill="#7a4e22">TOYS</text></g>
     <g transform="translate(330 580)"><rect y="-140" width="230" height="140" fill="#cf9f62" stroke="${INK}" stroke-width="5"/><text x="115" y="-50" text-anchor="middle" font-family="${MARKER}" font-size="36" fill="#7a4e22">LEGO</text></g>
     <g transform="translate(150 860)"><circle cx="80" cy="-110" r="100" fill="#e6eef0" stroke="${INK}" stroke-width="6"/><circle cx="80" cy="-110" r="20" fill="#7a8a92"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="80" cy="-160" rx="22" ry="44" fill="#9ad0e0" stroke="${INK}" stroke-width="4" transform="rotate(${i * 90} 80 -110)"/>`).join('')}<rect x="60" y="-20" width="40" height="20" fill="#7a8a92"/></g>
     <g transform="translate(380 860)">${at(60, -60, -90, 0.5, level())}${at(60, -110, 0, 0.6, tapeMeasure())}</g>
     ${cans(1060, ['#8a6cd8', '#e8572b', '#2fb5c4', '#f2f2ee'])}`,
    { cut: 6 },
  )
})()

const boxStack = svgDoc(
  560,
  620,
  `${[
    [20, 360, 300, 250, '#d3a062'],
    [300, 400, 240, 210, '#c48f52'],
    [90, 140, 320, 230, '#cf9f62'],
  ]
    .map(([x, y, w, h, c]) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${INK}" stroke-width="6"/><rect x="${(x as number) + (w as number) / 2 - 24}" y="${y}" width="48" height="${(h as number) * 0.4}" fill="#e9c48a"/></g>`)
    .join('')}
   <text x="250" y="290" text-anchor="middle" font-family="${MARKER}" font-size="46" fill="#7a4e22">PARTS</text>
   <text x="170" y="520" text-anchor="middle" font-family="${MARKER}" font-size="40" fill="#d0372a">BOXES!</text>`,
  { cut: 6 },
)

const sawhorse = svgDoc(
  900,
  420,
  `${[120, 760].map((x) => `<path d="M${x - 70} 410 L ${x} 120 L ${x + 70} 410" stroke="${INK}" stroke-width="40" fill="none" stroke-linejoin="round"/><path d="M${x - 70} 410 L ${x} 120 L ${x + 70} 410" stroke="#e0b27a" stroke-width="28" fill="none" stroke-linejoin="round"/><rect x="${x - 60}" y="96" width="120" height="40" fill="#d39a5a" stroke="${INK}" stroke-width="5"/>`).join('')}
   <rect x="10" y="40" width="880" height="60" rx="6" fill="#e8c48e" stroke="${INK}" stroke-width="6"/>
   ${woodGrain(20, 46, 860, 48, '#c4935a', 7, 3)}
   <path d="M470 40 L 470 100" stroke="${INK}" stroke-width="4" stroke-dasharray="8 8"/>
   ${at(300, 30, -80, 0.5, pencil())}
   ${at(640, 20, 0, 0.5, clamp())}`,
  { cut: 6 },
)

const toolChest = svgDoc(
  500,
  680,
  `<rect x="30" y="40" width="440" height="560" rx="16" fill="#e8322b" stroke="${INK}" stroke-width="7"/>
   <rect x="30" y="40" width="440" height="70" rx="16" fill="#f04b40" stroke="${INK}" stroke-width="6"/>
   ${[0, 1, 2, 3, 4].map((i) => `<rect x="56" y="${130 + i * 90}" width="388" height="76" rx="6" fill="#d22b24" stroke="${INK}" stroke-width="5"/><rect x="180" y="${156 + i * 90}" width="140" height="18" rx="9" fill="#c9ced6" stroke="${INK}" stroke-width="4"/>`).join('')}
   <path d="M470 120 L 490 120 L 490 280 L 470 280" stroke="#9aa3ad" stroke-width="12" fill="none"/>
   ${[90, 410].map((x) => `<circle cx="${x}" cy="636" r="34" fill="#2b2b2b" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="636" r="12" fill="#9aa3ad"/>`).join('')}
   ${at(170, 30, 80, 0.4, wrench(300))}
   ${at(330, 10, 0, 0.45, tapeMeasure())}`,
  { cut: 6 },
)

const shopLight = svgDoc(
  700,
  1300,
  `<path d="M350 0 L 350 1080" stroke="${INK}" stroke-width="14"/><path d="M350 0 L 350 1080" stroke="#555c66" stroke-width="6"/>
   <path d="M210 1240 L 270 1080 L 430 1080 L 490 1240 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
   <rect x="320" y="1050" width="60" height="40" rx="6" fill="#555c66" stroke="${INK}" stroke-width="6"/>
   <ellipse cx="350" cy="1240" rx="140" ry="26" fill="#fff6c8" stroke="${INK}" stroke-width="8"/>`,
  { cut: 6 },
)

const yard = (() => {
  const r = rand(4)
  return svgDoc(
    1600,
    700,
    `<path d="M0 200 Q 400 120 800 170 Q 1200 220 1600 150 L 1600 700 L 0 700 Z" fill="#7cc46a"/>
     <path d="M0 260 Q 400 190 800 240 Q 1200 290 1600 220" stroke="#5fae55" stroke-width="30" fill="none"/>
     ${Array.from({ length: 70 }, () => `<path d="M${(r() * 1600).toFixed(0)} ${(260 + r() * 420).toFixed(0)} l -6 -22 m 6 22 l 6 -20" stroke="#5aa64a" stroke-width="5" stroke-linecap="round"/>`).join('')}
     <path d="M520 700 L 660 180 L 940 180 L 1100 700 Z" fill="#c9c4b8"/>
     <path d="M800 200 L 800 700" stroke="#fff" stroke-width="10" stroke-dasharray="40 40" opacity=".6"/>`,
    { grain: 0.6 },
  )
})()

const tree = svgDoc(
  700,
  1000,
  `<path d="M320 1000 L 330 600 Q 300 520 250 480 M330 640 Q 380 560 440 520" stroke="${INK}" stroke-width="56" fill="none" stroke-linecap="round"/>
   <path d="M320 1000 L 330 600 Q 300 520 250 480 M330 640 Q 380 560 440 520" stroke="#8a5a33" stroke-width="42" fill="none" stroke-linecap="round"/>
   ${[
     [350, 300, 230],
     [190, 420, 160],
     [520, 410, 170],
     [300, 160, 150],
     [470, 210, 140],
   ]
     .map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#4f9d4a" stroke="${INK}" stroke-width="7"/>`)
     .join('')}
   ${[
     [350, 300, 200],
     [190, 420, 132],
     [520, 410, 142],
     [300, 160, 124],
     [470, 210, 114],
   ]
     .map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#5fb35a"/>`)
     .join('')}
   ${[[280, 260], [420, 330], [230, 420], [520, 380], [340, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#e8322b" stroke="${INK}" stroke-width="4"/>`).join('')}`,
  { cut: 6 },
)

const fence = svgDoc(
  1600,
  300,
  `<rect x="0" y="100" width="1600" height="30" fill="#f2f2ee" stroke="${INK}" stroke-width="5"/>
   <rect x="0" y="210" width="1600" height="30" fill="#f2f2ee" stroke="${INK}" stroke-width="5"/>
   ${Array.from({ length: 20 }, (_, i) => `<path d="M${20 + i * 80} 300 L ${20 + i * 80} 50 L ${50 + i * 80} 20 L ${80 + i * 80} 50 L ${80 + i * 80} 300 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`).join('')}`,
  { cut: 6 },
)

const floorMat = svgDoc(
  1600,
  900,
  `<rect width="1600" height="900" rx="30" fill="#ffd21a"/>
   <clipPath id="mc"><rect width="1600" height="900" rx="30"/></clipPath>
   <g clip-path="url(#mc)">${Array.from({ length: 50 }, (_, i) => `<path d="M${i * 70 - 900} 900 L ${i * 70} 0 L ${i * 70 + 35} 0 L ${i * 70 - 865} 900 Z" fill="#2b2b2b"/>`).join('')}</g>
   <rect x="50" y="50" width="1500" height="800" rx="16" fill="#5d646c"/>
   ${Array.from({ length: 30 }, (_, i) => `<path d="M${80 + i * 50} 70 L ${80 + i * 50} 830" stroke="#4d545c" stroke-width="10"/>`).join('')}
   <rect width="1600" height="900" rx="30" fill="none" stroke="${INK}" stroke-width="8"/>`,
  { grain: 0.7 },
)

function ShopLightGlow() {
  const light = useRef<THREE.PointLight>(null!)
  const lvl = useWorldLevel(0.3)
  useFrame((s) => {
    light.current.intensity = lvl() * (12 + Math.sin(s.clock.elapsedTime * 2) * 0.3)
  })
  return <pointLight ref={light} position={[-1.2, 5.0, -5.6]} color="#fff3d6" distance={16} decay={1.5} />
}

/** Milo's workshop — a garage with the door rolled up to the sunny yard. */
export function WorkshopWorld() {
  return (
    <group>
      {/* outside, seen through the door */}
      <Cutout art={yard} size={[22, 9.6]} at={[1.5, 0.01, -15]} flat delay={0.0} shadow={false} />
      <Cutout art={fence} size={[14, 2.6]} at={[1.5, 0, -16.5]} delay={0.05} shadow={false} />
      <Cutout art={tree} size={[5.2, 7.4]} at={[-0.4, 0, -18]} delay={0.08} shadow={false} />
      <Cutout art={tree} size={[4.2, 6]} at={[5.4, 0, -19]} delay={0.1} shadow={false} />
      {/* the garage */}
      <Cutout art={garageWall} size={[34, 10.8]} at={[0, 0, -10.5]} hinge="rise" delay={0.05} px={2048} shadow={false} />
      <Cutout art={bigPegboard} size={[6.2, 3.6]} at={[-8.0, 2.4, -10.3]} hinge="spring" delay={0.3} px={1024} />
      <Cutout art={workbench} size={[7.0, 4.5]} at={[7.6, 0, -8.6]} delay={0.2} px={1024} />
      <Cutout art={shelving} size={[3.2, 5.5]} at={[-11.2, 0, -7.4]} rotY={0.45} delay={0.25} />
      <Cutout art={boxStack} size={[2.6, 2.88]} at={[-5.6, 0, -6.8]} delay={0.15} rotY={0.15} tap="wiggle" />
      <Cutout art={sawhorse} size={[3.6, 1.68]} at={[4.6, 0, -5.0]} rotY={-0.45} delay={0.12} />
      <Cutout art={toolChest} size={[2.0, 2.72]} at={[9.4, 0, -4.4]} rotY={-0.5} delay={0.18} tap="wiggle" />
      <Cutout art={shopLight} size={[2.2, 4.1]} at={[-1.2, 4.6, -6.0]} hinge="drop" delay={0.35} emissive={0.25} shadow={false} />
      <ShopLightGlow />
      <Cutout art={floorMat} size={[11, 6.2]} at={[0.4, 0.006, -3.0]} flat delay={0} shadow={false} />
    </group>
  )
}

export const toolsSpread: SpreadDef = {
  id: 'tools',
  world: 'workshop',
  palette: palettes.workshop,
  outfit: 'tools',
  heading: 'Fix-it Milo',
  beats: 3,
  textCard: { x: 0, y: 0, w: 0.8 },
  text: [
    '*Whoosh!* Milo landed in his *workshop!* Robo the robot was fast asleep. His battery was *empty*.',
    { after: 1, text: '*Click!* In went the battery. *Beep boop!* Robo woke up and waved.' },
    { after: 2, text: '*Bzzz!* Milo drilled two holes in a box. Now pop on the *wheels!*' },
    { after: 3, text: '*Snap, snap!* *Vroom!* Off zoomed the box car!' },
  ],
  spreadArt: toolsSpreadArt,
  Popups: ToolsPopups,
  miloReact: 'cheer',
}
