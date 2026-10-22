import { svgDoc } from './texture'

/* Small reusable SVG building blocks for the paper-craft look. */

export function starPath(cx: number, cy: number, R: number, r = R * 0.48, n = 5, rot = -Math.PI / 2) {
  let d = ''
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n
    const rad = i % 2 ? r : R
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad).toFixed(1) + ' ' + (cy + Math.sin(a) * rad).toFixed(1) + ' '
  }
  return d + 'Z'
}

export const star = (fill = '#ffd34d', stroke = '#f0a500') =>
  svgDoc(200, 200, `<path d="${starPath(100, 100, 90, 42)}" fill="${fill}" stroke="${stroke}" stroke-width="8" stroke-linejoin="round"/>
    <path d="${starPath(100, 104, 40, 18)}" fill="#fff6c8" opacity=".7"/>`, { cut: 6 })

export const sparkle = (fill = '#fff3b0') =>
  svgDoc(200, 200, `<path d="M100 6 Q 112 88 194 100 Q 112 112 100 194 Q 88 112 6 100 Q 88 88 100 6 Z" fill="${fill}"/>`, { cut: 4 })

export const heart = (fill = '#ff5a7a') =>
  svgDoc(200, 190, `<path d="M100 180 C 20 120 4 80 14 50 C 26 12 80 6 100 46 C 120 6 174 12 186 50 C 196 80 180 120 100 180 Z" fill="${fill}"/>
    <path d="M50 52 Q 60 34 80 40" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/>`, { cut: 6 })

export const cloud = (fill = '#ffffff', shade = '#e4eef8') =>
  svgDoc(
    400,
    200,
    `<path d="M40 170 Q 0 170 10 130 Q 20 96 64 104 Q 64 50 120 46 Q 160 0 214 30 Q 262 6 292 56 Q 350 50 360 104 Q 400 112 392 146 Q 384 172 350 170 Z" fill="${fill}"/>
     <path d="M40 170 Q 30 150 60 146 Q 200 160 350 146 Q 380 150 350 170 Z" fill="${shade}"/>`,
    { cut: 6 },
  )

export const hill = (fill: string, shade: string, w = 800, h = 300) =>
  svgDoc(
    w,
    h,
    `<path d="M0 ${h} Q ${w * 0.08} ${h * 0.3} ${w * 0.32} ${h * 0.18} Q ${w * 0.5} ${h * 0.05} ${w * 0.68} ${h * 0.2} Q ${w * 0.92} ${h * 0.35} ${w} ${h} Z" fill="${fill}"/>
     <path d="M${w * 0.1} ${h} Q ${w * 0.3} ${h * 0.55} ${w * 0.55} ${h * 0.6} Q ${w * 0.8} ${h * 0.65} ${w * 0.9} ${h} Z" fill="${shade}" opacity=".5"/>`,
    { cut: 8 },
  )

export const tree = (leaf = '#5cb85c', leaf2 = '#3f9a45', trunk = '#8a5a2b') =>
  svgDoc(
    300,
    420,
    `<rect x="130" y="230" width="40" height="180" rx="12" fill="${trunk}"/>
     <circle cx="150" cy="150" r="130" fill="${leaf}"/>
     <circle cx="105" cy="120" r="50" fill="${leaf2}" opacity=".5"/>
     <circle cx="200" cy="190" r="40" fill="${leaf2}" opacity=".5"/>
     <circle cx="110" cy="95" r="20" fill="#fff" opacity=".25"/>`,
    { cut: 8 },
  )

export const pine = (leaf = '#3f9a5a', leaf2 = '#2f7a46') =>
  svgDoc(
    260,
    440,
    `<rect x="115" y="360" width="30" height="70" fill="#7a4a24"/>
     <path d="M130 10 L 220 150 L 180 150 L 245 260 L 195 260 L 255 370 L 5 370 L 65 260 L 15 260 L 80 150 L 40 150 Z" fill="${leaf}"/>
     <path d="M130 10 L 220 150 L 180 150 L 245 260 L 195 260 L 255 370 L 130 370 Z" fill="${leaf2}" opacity=".5"/>`,
    { cut: 8 },
  )

export const bush = (fill = '#6cc06a', shade = '#4fa34f') =>
  svgDoc(
    300,
    160,
    `<path d="M10 150 Q 0 100 50 90 Q 60 30 120 40 Q 160 0 200 40 Q 260 30 270 90 Q 300 100 290 150 Z" fill="${fill}"/>
     <path d="M20 150 Q 150 120 280 150 Z" fill="${shade}"/>`,
    { cut: 6 },
  )

export const puff = (fill = '#9aa0aa', shade = '#7d8390') =>
  svgDoc(
    300,
    240,
    `<circle cx="150" cy="120" r="90" fill="${fill}"/><circle cx="80" cy="150" r="60" fill="${fill}"/><circle cx="220" cy="150" r="64" fill="${fill}"/>
     <circle cx="120" cy="80" r="50" fill="${fill}"/><circle cx="190" cy="90" r="46" fill="${fill}"/>
     <path d="M30 170 Q 150 230 270 170 Q 260 210 150 214 Q 40 210 30 170 Z" fill="${shade}"/>`,
    { cut: 6 },
  )

/** A full-bleed printed page backdrop (used on right pages). */
export const pageBackdrop = (sky: [string, string], ground: string, extra = '') =>
  svgDoc(
    768,
    1056,
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
     <rect width="768" height="1056" fill="url(#bg)"/>
     <path d="M0 640 Q 200 590 384 620 Q 560 650 768 600 L 768 1056 L 0 1056 Z" fill="${ground}"/>
     ${extra}`,
  )
