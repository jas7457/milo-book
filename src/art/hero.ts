import { svgDoc } from './texture'
import { starPath } from './kit'
import { INK, limb, rand } from './style'
import { eyesParts, headParts, SKIN, SKIN_SH } from '../milo/art'

/*
 * Art for spread 6, "Super Milo": the calm town square, box-folded buildings, the tall tower, the
 * kitten, the flying Super-Milo figure and the pieces of the sky world.
 * (Only superhero.tsx uses this file.)
 */

export const CAPE = '#d8261c'
export const CAPE_SH = '#a8160f'
export const MASK = '#1f5fd6'
export const EMBLEM = '#ffd21f'

const ROUND = `Fredoka, 'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif`

/** A grid of little windows: some lit, some dark, a few with something in them. */
function windowGrid(
  x: number, y: number, cols: number, rows: number, cw: number, ch: number, gx: number, gy: number,
  seed: number, lit = 0.55, litCol = '#ffe08a', darkCol = '#33407f', frame = '#f6e6c8', extras = true,
) {
  const r = rand(seed)
  let out = ''
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const wx = x + i * (cw + gx)
      const wy = y + j * (ch + gy)
      const on = r() < lit
      out += `<rect x="${wx - 4}" y="${wy - 4}" width="${cw + 8}" height="${ch + 8}" rx="5" fill="${frame}" stroke="${INK}" stroke-width="3"/>`
      out += `<rect x="${wx}" y="${wy}" width="${cw}" height="${ch}" rx="3" fill="${on ? litCol : darkCol}"/>`
      if (on) {
        out += `<rect x="${wx}" y="${wy + ch * 0.55}" width="${cw}" height="${ch * 0.45}" fill="#ffb84a" opacity=".55"/>`
        const k = r()
        if (extras && k < 0.16) {
          // a plant on the sill
          out += `<path d="M${wx + cw * 0.3} ${wy + ch} q -6 -22 4 -30 q 4 14 8 30 M${wx + cw * 0.3 + 6} ${wy + ch} q 10 -20 20 -22 q -4 14 -6 22" fill="#3d9a54" stroke="${INK}" stroke-width="2"/>`
        } else if (extras && k < 0.26) {
          // curtains
          out += `<path d="M${wx} ${wy} L ${wx + cw * 0.34} ${wy} Q ${wx + cw * 0.2} ${wy + ch * 0.5} ${wx + cw * 0.34} ${wy + ch} L ${wx} ${wy + ch} Z M${wx + cw} ${wy} L ${wx + cw * 0.66} ${wy} Q ${wx + cw * 0.8} ${wy + ch * 0.5} ${wx + cw * 0.66} ${wy + ch} L ${wx + cw} ${wy + ch} Z" fill="#e8574a" opacity=".92"/>`
        } else if (extras && k < 0.32) {
          // a little cat watching
          out += `<path d="M${wx + cw * 0.3} ${wy + ch} L ${wx + cw * 0.3} ${wy + ch * 0.58} L ${wx + cw * 0.36} ${wy + ch * 0.4} L ${wx + cw * 0.44} ${wy + ch * 0.52} L ${wx + cw * 0.56} ${wy + ch * 0.52} L ${wx + cw * 0.64} ${wy + ch * 0.4} L ${wx + cw * 0.7} ${wy + ch * 0.58} L ${wx + cw * 0.7} ${wy + ch} Z" fill="#3a2d4f"/>`
        }
      } else {
        out += `<path d="M${wx + 4} ${wy + 6} L ${wx + cw * 0.5} ${wy + 6} L ${wx + 4} ${wy + ch * 0.5} Z" fill="#fff" opacity=".18"/>`
      }
      out += `<path d="M${wx + cw / 2} ${wy} L ${wx + cw / 2} ${wy + ch} M${wx} ${wy + ch * 0.45} L ${wx + cw} ${wy + ch * 0.45}" stroke="${frame}" stroke-width="3" opacity=".9"/>`
    }
  }
  return out
}

/* =================================================================== */
/* ===========================  PRINTED SPREAD  ====================== */
/* =================================================================== */

const cloudShape = (cx: number, cy: number, s: number) =>
  `M${cx - 170 * s} ${cy + 40 * s} Q ${cx - 230 * s} ${cy + 40 * s} ${cx - 210 * s} ${cy - 10 * s} Q ${cx - 190 * s} ${cy - 50 * s} ${cx - 130 * s} ${cy - 38 * s} Q ${cx - 120 * s} ${cy - 110 * s} ${cx - 50 * s} ${cy - 100 * s} Q ${cx} ${cy - 160 * s} ${cx + 70 * s} ${cy - 110 * s} Q ${cx + 140 * s} ${cy - 130 * s} ${cx + 160 * s} ${cy - 50 * s} Q ${cx + 230 * s} ${cy - 40 * s} ${cx + 214 * s} ${cy + 14 * s} Q ${cx + 210 * s} ${cy + 44 * s} ${cx + 170 * s} ${cy + 40 * s} Z`

function comicBurst(cx: number, cy: number, R: number, r: number, n: number, fill: string, stroke: string, rot = 0) {
  return `<path d="${starPath(cx, cy, R, r, n, rot)}" fill="${fill}" stroke="${stroke}" stroke-width="10" stroke-linejoin="round"/>`
}

function bird(x: number, y: number, s: number, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-46 8 Q -26 -26 0 4 Q 26 -26 46 8" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-46 8 Q -26 -26 0 4 Q 26 -26 46 8" stroke="#fff6e8" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
}



/**
 * The printed pages: a calm, sunny town square. Warm paving slabs, a soft
 * street along the front edge and a few big round planters. Quiet colours:
 * it is the floor the paper buildings stand on, not a pattern.
 */
export const heroSpreadArt = (() => {
  const r = rand(66)
  // paving slabs: big, low contrast
  let slabs = ''
  const sw = 320
  const sh = 200
  for (let y = 0, j = 0; y < 1500; y += sh, j++)
    for (let x = (j % 2) * -sw * 0.5; x < 2560; x += sw)
      slabs += `<rect x="${(x + 6).toFixed(0)}" y="${y + 6}" width="${sw - 12}" height="${sh - 12}" rx="22" fill="${r() < 0.5 ? '#fbeee0' : '#f9e6d6'}" stroke="#ecd3c0" stroke-width="5"/>`
  const planter = (x: number, y: number, s: number) => `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="10" cy="64" rx="150" ry="40" fill="#8a5a50" opacity=".18"/>
      <path d="M-120 20 L 120 20 L 104 76 L -104 76 Z" fill="#d99a82" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M-120 20 L 120 20 L 116 38 L -116 38 Z" fill="#efb8a0"/>
      <ellipse cx="0" cy="20" rx="120" ry="30" fill="#7fc47a" stroke="${INK}" stroke-width="7"/>
      <circle cx="-60" cy="-6" r="58" fill="#5fae62" stroke="${INK}" stroke-width="7"/><circle cx="30" cy="-30" r="70" fill="#6cbb6a" stroke="${INK}" stroke-width="7"/><circle cx="84" cy="2" r="48" fill="#5fae62" stroke="${INK}" stroke-width="7"/>
      <circle cx="-76" cy="-26" r="22" fill="#9ae092" opacity=".85"/><circle cx="14" cy="-54" r="26" fill="#9ae092" opacity=".85"/>
      <circle cx="-30" cy="6" r="9" fill="#ff8aa8"/><circle cx="58" cy="-12" r="9" fill="#ffd96a"/><circle cx="90" cy="14" r="8" fill="#ff8aa8"/>
    </g>`
  return svgDoc(
    2560,
    1760,
    `<linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dfd2"/><stop offset=".55" stop-color="#fbeee2"/><stop offset="1" stop-color="#f6e2d4"/></linearGradient>
     <radialGradient id="pgl" cx="1500" cy="900" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d8" stop-opacity=".8"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
     <rect width="2560" height="1760" fill="url(#pg)"/>
     ${slabs}
     <rect width="2560" height="1760" fill="url(#pgl)"/>
     <!-- the street along the front edge -->
     <rect x="0" y="1500" width="2560" height="40" fill="#e4c6b6"/>
     <rect x="0" y="1540" width="2560" height="220" fill="#cdbfe0"/>
     <rect x="0" y="1540" width="2560" height="14" fill="#b7a6d2"/>
     <path d="M0 1652 L 2560 1652" stroke="#fff3c8" stroke-width="12" stroke-dasharray="120 90" stroke-linecap="round"/>
     <!-- planters in the far corners -->
     ${planter(220, 300, 1.05)}${planter(2380, 360, 0.95)}${planter(2250, 1180, 0.8)}`,
    { grain: 1 },
  )
})()

/** the one sound-word sticker: pops up when Milo takes off */
export const zoomBurst = svgDoc(
  560,
  400,
  `<g transform="translate(280 200) rotate(-8)">
     ${comicBurst(0, 0, 190, 112, 13, '#ffd21f', INK, 0.2)}
     ${comicBurst(0, 0, 162, 98, 13, '#fff08a', 'none', 0.2)}
     <text x="0" y="30" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="112" fill="${INK}" stroke="${INK}" stroke-width="20" stroke-linejoin="round" transform="translate(5 6)">ZOOM!</text>
     <text x="0" y="30" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="112" fill="#e8322b" stroke="#fff" stroke-width="16" stroke-linejoin="round" paint-order="stroke">ZOOM!</text>
   </g>`,
  { cut: 5 },
)

/* =================================================================== */
/* ===========================  BOX-FOLDED BUILDINGS  ================ */
/* =================================================================== */

/**
 * The side wall of a box-folded building (glued to the edge of the front).
 * `flip` draws it for the left edge (the near corner is then on the right).
 */
export function sideFace(o: {
  w: number; h: number; body: string; shade: string; rim: string; seed: number; flip?: boolean
  cw?: number; ch?: number; lit?: number; litCol?: string; darkCol?: string; frame?: string; band?: string; base?: string; top?: string
}) {
  const { w, h, body, shade, rim, seed, flip, cw = 40, ch = 54, lit = 0.5, litCol = '#ffe08a', darkCol = '#33407f', frame = '#f6e6c8', band, base = shade, top = shade } = o
  const gx = 26
  const gy = 40
  const cols = Math.max(1, Math.floor((w - 70 + gx) / (cw + gx)))
  const rows = Math.max(1, Math.floor((h - 190 + gy) / (ch + gy)))
  const x0 = (w - (cols * (cw + gx) - gx)) / 2
  const bands = band ? Array.from({ length: Math.floor(h / 360) }, (_, i) => `<rect x="0" y="${300 + i * 340}" width="${w}" height="16" fill="${band}" stroke="${INK}" stroke-width="4"/>`).join('') : ''
  const inner = `<linearGradient id="sf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${shade}"/></linearGradient>
     <rect x="0" y="0" width="${w}" height="${h}" fill="url(#sf)" stroke="${INK}" stroke-width="6"/>
     <rect x="0" y="0" width="12" height="${h}" fill="${rim}" opacity=".55"/>
     <rect x="0" y="0" width="${w}" height="34" fill="${top}" stroke="${INK}" stroke-width="5"/>
     <rect x="0" y="0" width="${w}" height="9" fill="#fff" opacity=".35"/>
     ${bands}
     ${windowGrid(x0, 78, cols, rows, cw, ch, gx, gy, seed, lit, litCol, darkCol, frame, false)}
     <rect x="0" y="${h - 36}" width="${w}" height="36" fill="${base}" stroke="${INK}" stroke-width="5"/>
     <rect x="${w - 40}" y="34" width="40" height="${h - 70}" fill="#1c1450" opacity=".16"/>`
  return svgDoc(w, h, flip ? `<g transform="translate(${w} 0) scale(-1 1)">${inner}</g>` : inner, { cut: 5 })
}

/** The flat top of a box-folded building, seen from above (front edge at the bottom). */
export function roofTopArt(o: { w: number; d: number; base: string; rim: string; kind: 'garden' | 'plain' | 'launch' | 'tower'; seed: number }) {
  const { w, d, base, rim, kind, seed } = o
  const r = rand(seed)
  let extra = ''
  const dots = Array.from({ length: 70 }, () => `<circle cx="${(30 + r() * (w - 60)).toFixed(0)}" cy="${(30 + r() * (d - 60)).toFixed(0)}" r="${(2 + r() * 3).toFixed(1)}" fill="#fff" opacity=".28"/>`).join('')
  if (kind === 'garden') {
    extra = `<rect x="${w * 0.12}" y="${d * 0.18}" width="${w * 0.76}" height="${d * 0.56}" rx="24" fill="#7fc47a" stroke="${INK}" stroke-width="6"/>
      ${[0.24, 0.42, 0.6, 0.76].map((u, i) => `<circle cx="${w * u}" cy="${d * (0.36 + (i % 2) * 0.2)}" r="${d * 0.1}" fill="#4fa456" stroke="${INK}" stroke-width="5"/><circle cx="${w * u - 10}" cy="${d * (0.36 + (i % 2) * 0.2) - 10}" r="${d * 0.035}" fill="#9ae092"/>`).join('')}
      <path d="M${w * 0.5} ${d * 0.74} L ${w * 0.5} ${d} " stroke="#e8d4b0" stroke-width="34"/>`
  } else if (kind === 'launch') {
    extra = `<rect x="${w * 0.06}" y="${d * 0.1}" width="${w * 0.88}" height="${d * 0.8}" rx="18" fill="none" stroke="#fff6c8" stroke-width="9" stroke-dasharray="36 22" opacity=".85"/>
      <g transform="translate(${w * 0.82} ${d * 0.34})"><rect x="-44" y="-30" width="88" height="60" rx="8" fill="#cfd5de" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="0" r="20" fill="#9aa3b4" stroke="${INK}" stroke-width="4"/><path d="M-12 0 L 12 0 M0 -12 L 0 12" stroke="${INK}" stroke-width="3"/></g>
      <g transform="translate(${w * 0.9} ${d * 0.72})"><circle cx="0" cy="0" r="30" fill="#b8553f" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="0" r="17" fill="#7a3a2c"/></g>`
  } else if (kind === 'tower') {
    extra = `<rect x="${w * 0.1}" y="${d * 0.14}" width="${w * 0.8}" height="${d * 0.72}" rx="10" fill="none" stroke="${INK}" stroke-width="5" opacity=".55"/>
      <g transform="translate(${w * 0.28} ${d * 0.5})"><rect x="-34" y="-26" width="68" height="52" rx="6" fill="#cfd5de" stroke="${INK}" stroke-width="5"/><circle r="16" fill="#9aa3b4" stroke="${INK}" stroke-width="4"/></g>`
  } else {
    extra = `<g transform="translate(${w * 0.28} ${d * 0.45})"><rect x="-40" y="-30" width="80" height="60" rx="6" fill="#cfd5de" stroke="${INK}" stroke-width="5"/><circle r="20" fill="#9aa3b4" stroke="${INK}" stroke-width="4"/></g>
      <g transform="translate(${w * 0.7} ${d * 0.5})"><rect x="-26" y="-26" width="52" height="52" rx="4" fill="#b8553f" stroke="${INK}" stroke-width="5"/><rect x="-18" y="-18" width="36" height="36" fill="#8a3f33"/></g>`
  }
  return svgDoc(
    w,
    d,
    `<rect x="0" y="0" width="${w}" height="${d}" fill="${rim}" stroke="${INK}" stroke-width="6"/>
     <rect x="16" y="16" width="${w - 32}" height="${d - 32}" fill="${base}" stroke="${INK}" stroke-width="4"/>
     <rect x="16" y="16" width="${w - 32}" height="22" fill="#000" opacity=".1"/>
     ${dots}${extra}`,
    { cut: 5 },
  )
}

/** Milo's launch pad: a low corner shop, front wall (900×360). */
export const launchShop = (() => {
  const W = 900
  const H = 360
  return svgDoc(
    W,
    H,
    `<linearGradient id="ls" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd2bc"/><stop offset=".6" stop-color="#f6b69c"/><stop offset="1" stop-color="#e49a88"/></linearGradient>
     <!-- wall -->
     <rect x="14" y="30" width="${W - 28}" height="${H - 30}" fill="url(#ls)" stroke="${INK}" stroke-width="6"/>
     <rect x="14" y="30" width="${W - 28}" height="30" fill="#c9524a" stroke="${INK}" stroke-width="5"/>
     <rect x="22" y="34" width="${W - 44}" height="8" rx="4" fill="#ef8378"/>
     <rect x="${W - 90}" y="60" width="76" height="${H - 60}" fill="#7a3a50" opacity=".16"/>
     <rect x="20" y="60" width="12" height="${H - 60}" fill="#fff6e0" opacity=".7"/>
     <!-- sign -->
     <rect x="250" y="70" width="400" height="62" rx="16" fill="#26306a" stroke="${INK}" stroke-width="6"/>
     <rect x="262" y="80" width="376" height="42" rx="10" fill="none" stroke="#ffd21f" stroke-width="3" stroke-dasharray="12 9"/>
     <text x="450" y="118" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="44" fill="#ffd96a" letter-spacing="4">BAKERY</text>
     <!-- awning -->
     <path d="M60 150 L 840 150 L 868 218 L 32 218 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     ${Array.from({ length: 10 }, (_, i) => `<path d="M${60 + i * 78} 150 L ${32 + i * 83.6} 218 L ${32 + (i + 0.5) * 83.6} 218 L ${60 + (i + 0.5) * 78} 150 Z" fill="#e8574a"/>`).join('')}
     <path d="M60 150 L 840 150 L 868 218 L 32 218 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M32 218 Q 78 238 124 218 Q 170 238 216 218 Q 262 238 308 218 Q 354 238 400 218 Q 446 238 492 218 Q 538 238 584 218 Q 630 238 676 218 Q 722 238 768 218 Q 814 238 868 218" fill="#fff" stroke="${INK}" stroke-width="5"/>
     <!-- shop window + door -->
     <rect x="60" y="238" width="320" height="108" rx="8" fill="#ffe9a8" stroke="${INK}" stroke-width="6"/>
     <rect x="520" y="238" width="320" height="108" rx="8" fill="#ffe9a8" stroke="${INK}" stroke-width="6"/>
     <path d="M70 248 L 150 248 L 70 330 Z M530 248 L 610 248 L 530 330 Z" fill="#fff" opacity=".35"/>
     <ellipse cx="150" cy="322" rx="46" ry="20" fill="#c98a52" stroke="${INK}" stroke-width="5"/><ellipse cx="150" cy="312" rx="40" ry="16" fill="#e8b878"/>
     <circle cx="270" cy="318" r="24" fill="#e8b878" stroke="${INK}" stroke-width="5"/><circle cx="270" cy="318" r="9" fill="#a8453a"/>
     <path d="M600 332 q 34 -52 66 0 Z M680 332 q 34 -52 66 0 Z" fill="#e8b878" stroke="${INK}" stroke-width="5"/>
     <rect x="410" y="240" width="80" height="${H - 240}" rx="8" fill="#7a3f33" stroke="${INK}" stroke-width="6"/>
     <rect x="420" y="250" width="60" height="${H - 250}" fill="#c98a52" stroke="${INK}" stroke-width="4"/><circle cx="470" cy="312" r="5" fill="#ffd21f"/>
     <rect x="14" y="${H - 20}" width="${W - 28}" height="20" fill="#8a6a5a" stroke="${INK}" stroke-width="4"/>`,
    { cut: 5 },
  )
})()

/* =================================================================== */
/* ===========================  BACK LAYER  ========================== */
/* =================================================================== */

/** A row of dusk-lit skyscraper silhouettes, with a sunset rim on their left edge. */
function skylineSvg(W: number, H: number, seed: number, body: string, rim: string, lit: number, hMin: number, hMax: number, details = true) {
  const r = rand(seed)
  let out = ''
  let x = 0
  let i = 0
  const roofs: string[] = []
  while (x < W) {
    const w = 120 + Math.floor(r() * 150)
    const h = hMin + r() * (hMax - hMin)
    const top = H - h
    const k = Math.floor(r() * 6)
    out += `<rect x="${x}" y="${top}" width="${w}" height="${h + 40}" fill="${body}" stroke="${INK}" stroke-width="5"/>`
    out += `<rect x="${x}" y="${top}" width="14" height="${h + 40}" fill="${rim}" opacity=".85"/>`
    out += `<rect x="${x + w - 30}" y="${top}" width="30" height="${h + 40}" fill="#1c1450" opacity=".2"/>`
    if (k === 0) out += `<path d="M${x} ${top} L ${x + w / 2} ${top - 70} L ${x + w} ${top} Z" fill="${body}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M${x + w / 2} ${top - 70} L ${x + w / 2} ${top - 120}" stroke="${INK}" stroke-width="5"/><circle cx="${x + w / 2}" cy="${top - 124}" r="7" fill="#ff4a4a"/>`
    else if (k === 1) out += `<rect x="${x + 16}" y="${top - 34}" width="${w - 32}" height="34" fill="${body}" stroke="${INK}" stroke-width="5"/><rect x="${x + w / 2 - 4}" y="${top - 130}" width="8" height="96" fill="${body}" stroke="${INK}" stroke-width="3"/><circle cx="${x + w / 2}" cy="${top - 134}" r="7" fill="#ff4a4a"/>`
    else if (k === 2) out += `<path d="M${x + 8} ${top} Q ${x + w / 2} ${top - 90} ${x + w - 8} ${top} Z" fill="${body}" stroke="${INK}" stroke-width="5"/>`
    else if (k === 3 && details) {
      // a rooftop water tank on stilts
      const tx = x + w * 0.5
      out += `<path d="M${tx - 22} ${top} L ${tx - 22} ${top - 30} M${tx + 22} ${top} L ${tx + 22} ${top - 30}" stroke="${INK}" stroke-width="6"/><rect x="${tx - 30}" y="${top - 74}" width="60" height="46" rx="6" fill="#c98a52" stroke="${INK}" stroke-width="5"/><path d="M${tx - 34} ${top - 74} L ${tx} ${top - 98} L ${tx + 34} ${top - 74} Z" fill="#a8703c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    } else if (k === 4) out += `<rect x="${x + 24}" y="${top - 22}" width="${w - 48}" height="22" fill="${body}" stroke="${INK}" stroke-width="5"/><rect x="${x + 48}" y="${top - 44}" width="${w - 96}" height="22" fill="${body}" stroke="${INK}" stroke-width="5"/>`
    roofs.push('')
    // lit windows
    const cols = Math.max(2, Math.floor((w - 36) / 34))
    const rows = Math.floor((h - 40) / 46)
    for (let j = 0; j < rows; j++)
      for (let c = 0; c < cols; c++)
        if (r() < lit) out += `<rect x="${x + 22 + c * 34}" y="${top + 24 + j * 46}" width="20" height="26" rx="3" fill="#ffdc7a" opacity=".95"/>`
        else if (r() < 0.5) out += `<rect x="${x + 22 + c * 34}" y="${top + 24 + j * 46}" width="20" height="26" rx="3" fill="#000" opacity=".12"/>`
    x += w - 8 + (r() < 0.3 ? 14 : 0)
    i++
  }
  void roofs
  void i
  return svgDoc(W, H, out, { cut: 5 })
}

export const skylineFar = skylineSvg(3000, 900, 12, '#dcc8e6', '#ffe0cc', 0.06, 300, 640, false)
export const skylineNear = (() => {
  const base = skylineSvg(3000, 800, 31, '#6a56b4', '#ff9a8a', 0.5, 230, 560)
  return base
})()

/** low skylines for the world: the tops of far-away city blocks on the cloud horizon */
export const worldSkyFar = skylineSvg(3000, 380, 52, '#d3a4d4', '#ffd0b0', 0.22, 120, 330, false)
export const worldSkyNear = skylineSvg(3000, 340, 77, '#8c6cc0', '#ffa890', 0.45, 100, 290, false)

/** A banded sunset cloud streak that hangs behind the skyline. */
export const sunsetStreaks = svgDoc(
  3000,
  520,
  `${[
    [90, 40, 1900, 70, '#ffb08a'],
    [600, 130, 2300, 60, '#ff8fa8'],
    [0, 230, 1500, 54, '#ffd0a0'],
    [1300, 330, 1700, 70, '#ffa0b8'],
  ]
    .map(([x, y, w, h, c]) => `<path d="M${x} ${(y as number) + (h as number) / 2} Q ${(x as number) + 90} ${y} ${(x as number) + 240} ${(y as number) + 10} L ${(x as number) + (w as number) - 240} ${(y as number) + 10} Q ${(x as number) + (w as number) - 90} ${y} ${(x as number) + (w as number)} ${(y as number) + (h as number) / 2} Q ${(x as number) + (w as number) - 90} ${(y as number) + (h as number)} ${(x as number) + (w as number) - 240} ${(y as number) + (h as number) - 10} L ${(x as number) + 240} ${(y as number) + (h as number) - 10} Q ${(x as number) + 90} ${(y as number) + (h as number)} ${x} ${(y as number) + (h as number) / 2} Z" fill="${c}" stroke="#ff7a8a" stroke-width="4"/>
       <path d="M${(x as number) + 120} ${(y as number) + 18} L ${(x as number) + (w as number) * 0.5} ${(y as number) + 18}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>`)
    .join('')}
   ${Array.from({ length: 12 }, (_, i) => `<path d="${starPath(160 + i * 240 + (i % 3) * 30, 90 + ((i * 97) % 340), 16)}" fill="#fff6c8" opacity=".9"/>`).join('')}`,
  { cut: 4 },
)

/* =================================================================== */
/* ===========================  THE TALL TOWER  ====================== */
/* =================================================================== */

export const TOWER = { w: 620, h: 1750 }
/** where the kitten sits on the roof (art px) and where the antenna light is */
export const TOWER_KITTEN = { x: 262, y: 236 }
export const TOWER_LIGHT = { x: 424, y: 22 }

export const tallTower = (() => {
  const W = TOWER.w
  const H = TOWER.h
  const cream = '#f3dcb4'
  const creamSh = '#d9b98a'
  const trim = '#c9524a'
  // lower body windows
  let lower = ''
  const colX = [64, 156, 248, 340, 432, 524]
  for (let j = 0; j < 7; j++) {
    const y = 790 + j * 92
    lower += windowGrid(colX[0] - 2, y, 6, 1, 40, 56, 52, 0, 400 + j * 9, 0.58)
  }
  // floor bands (ledges)
  const bands = [1034, 1310, 1402].map((y) => `<rect x="14" y="${y}" width="${W - 28}" height="20" fill="${trim}" stroke="${INK}" stroke-width="5"/><rect x="14" y="${y}" width="${W - 28}" height="6" fill="#e9786d"/>`).join('')
  const brick = Array.from({ length: 36 }, (_, i) => `<path d="M24 ${760 + i * 26} L ${W - 24} ${760 + i * 26}" stroke="${creamSh}" stroke-width="2" opacity=".5"/>`).join('')
  return svgDoc(
    W,
    H,
    `<linearGradient id="tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff0d2"/><stop offset=".55" stop-color="${cream}"/><stop offset="1" stop-color="#d6a974"/></linearGradient>
     <radialGradient id="clk"><stop offset="0" stop-color="#fffdf2"/><stop offset="1" stop-color="#f5e6bc"/></radialGradient>
     <!-- antenna mast with cross bars + dish -->
     <path d="M424 236 L 424 40" stroke="${INK}" stroke-width="14"/><path d="M424 236 L 424 40" stroke="#c9ced6" stroke-width="7"/>
     <path d="M396 90 L 452 90 M404 140 L 444 140 M410 188 L 438 188" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M396 90 L 452 90 M404 140 L 444 140 M410 188 L 438 188" stroke="#c9ced6" stroke-width="6" stroke-linecap="round"/>
     <path d="M424 150 L 396 236 M424 150 L 452 236" stroke="${INK}" stroke-width="5" opacity=".7"/>
     <g transform="translate(470 156) rotate(-24)"><path d="M0 -24 Q 30 0 0 24 Q -10 0 0 -24 Z" fill="#e9eef3" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M-4 0 L -34 0" stroke="${INK}" stroke-width="6"/></g>
     <!-- upper roof platform, railing on the right, cornice -->
     <path d="M312 232 L 312 196 M352 232 L 352 196 M392 232 L 392 196 M456 232 L 456 196 M486 232 L 486 196" stroke="${INK}" stroke-width="10"/><path d="M312 232 L 312 196 M352 232 L 352 196 M392 232 L 392 196 M456 232 L 456 196 M486 232 L 486 196" stroke="#f6e6c8" stroke-width="5"/>
     <rect x="304" y="190" width="190" height="14" rx="6" fill="#f6e6c8" stroke="${INK}" stroke-width="5"/>
     <rect x="168" y="228" width="332" height="34" rx="8" fill="${trim}" stroke="${INK}" stroke-width="6"/>
     <rect x="176" y="232" width="316" height="9" rx="4" fill="#ef8378"/>
     <!-- little roof hatch + chimney vent -->
     <rect x="188" y="204" width="50" height="26" rx="4" fill="#9aa3b4" stroke="${INK}" stroke-width="5"/><path d="M188 204 L 238 204" stroke="#cfd5de" stroke-width="6"/>
     <!-- upper block -->
     <rect x="190" y="260" width="288" height="452" fill="url(#tw)" stroke="${INK}" stroke-width="6"/>
     <rect x="440" y="262" width="36" height="448" fill="#7a4e7a" opacity=".16"/>
     <rect x="196" y="262" width="12" height="448" fill="#fff6e0" opacity=".7"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => `<path d="M194 ${290 + i * 28} L 474 ${290 + i * 28}" stroke="${creamSh}" stroke-width="2" opacity=".5"/>`).join('')}
     <!-- the big clock -->
     <circle cx="334" cy="338" r="66" fill="${trim}" stroke="${INK}" stroke-width="6"/>
     <circle cx="334" cy="338" r="52" fill="url(#clk)" stroke="${INK}" stroke-width="5"/>
     ${Array.from({ length: 12 }, (_, i) => `<path d="M${(334 + Math.cos(i * 0.5236) * 42).toFixed(1)} ${(338 + Math.sin(i * 0.5236) * 42).toFixed(1)} L ${(334 + Math.cos(i * 0.5236) * 49).toFixed(1)} ${(338 + Math.sin(i * 0.5236) * 49).toFixed(1)}" stroke="${INK}" stroke-width="${i % 3 ? 3 : 5}" stroke-linecap="round"/>`).join('')}
     <path d="M334 338 L 334 304" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M334 338 L 358 346" stroke="${CAPE}" stroke-width="5" stroke-linecap="round"/><circle cx="334" cy="338" r="6" fill="${INK}"/>
     <path d="M296 296 Q 308 286 326 284" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
     <!-- upper windows -->
     ${windowGrid(214, 440, 3, 4, 52, 46, 36, 24, 71, 0.6)}
     <!-- water tank on the setback -->
     <g>
       <ellipse cx="108" cy="702" rx="86" ry="12" fill="#2a1d5e" opacity=".25"/>
       <path d="M62 700 L 70 560 M154 700 L 146 560 M108 700 L 108 560" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M62 700 L 70 560 M154 700 L 146 560 M108 700 L 108 560" stroke="#8a5a33" stroke-width="7" stroke-linecap="round"/>
       <path d="M64 640 L 152 600 M64 600 L 152 640" stroke="#8a5a33" stroke-width="5"/>
       <rect x="52" y="548" width="112" height="22" rx="6" fill="#8a5a33" stroke="${INK}" stroke-width="5"/>
       <path d="M56 556 L 56 440 Q 108 456 160 440 L 160 556 Q 108 570 56 556 Z" fill="#cf9a62" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
       ${[78, 100, 122, 144].map((x) => `<path d="M${x} 452 L ${x} 560" stroke="#a8703c" stroke-width="4"/>`).join('')}
       <path d="M60 470 Q 108 486 156 470 M60 530 Q 108 546 156 530" stroke="#5a5a64" stroke-width="9" fill="none"/>
       <path d="M60 470 Q 108 486 156 470 M60 530 Q 108 546 156 530" stroke="#9aa3b4" stroke-width="4" fill="none"/>
       <path d="M46 440 L 108 380 L 170 440 Q 108 456 46 440 Z" fill="#b8553f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
       <path d="M108 380 L 108 440" stroke="#8a3a2c" stroke-width="4"/>
       <path d="M108 380 L 108 358" stroke="${INK}" stroke-width="5"/><path d="M108 358 L 128 364 L 108 372 Z" fill="#ffd21f" stroke="${INK}" stroke-width="3"/>
       <path d="M62 470 Q 70 500 66 540" stroke="#fff" stroke-width="7" opacity=".4" stroke-linecap="round" fill="none"/>
       <path d="M156 560 L 156 696 M172 560 L 172 696" stroke="#c9ced6" stroke-width="5"/><path d="M156 580 L 172 580 M156 610 L 172 610 M156 640 L 172 640 M156 670 L 172 670" stroke="#c9ced6" stroke-width="4"/>
     </g>
     <!-- AC units + a satellite dish on the right of the setback -->
     <rect x="500" y="640" width="70" height="52" rx="6" fill="#cfd5de" stroke="${INK}" stroke-width="5"/><circle cx="535" cy="666" r="18" fill="#9aa3b4" stroke="${INK}" stroke-width="3"/>
     <rect x="494" y="608" width="46" height="34" rx="5" fill="#e8ecf2" stroke="${INK}" stroke-width="5"/>
     <g transform="translate(562 628) rotate(-30)"><path d="M0 -30 Q 40 0 0 30 Q -12 0 0 -30 Z" fill="#fff" stroke="${INK}" stroke-width="5"/></g>
     <!-- setback ledge -->
     <rect x="14" y="696" width="${W - 28}" height="34" rx="6" fill="${trim}" stroke="${INK}" stroke-width="6"/>
     <rect x="22" y="700" width="${W - 44}" height="9" rx="4" fill="#ef8378"/>
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${40 + i * 46}" y="715" width="22" height="9" rx="3" fill="#9c3c36"/>`).join('')}
     <!-- the lower body -->
     <rect x="20" y="728" width="${W - 40}" height="${H - 728}" fill="url(#tw)" stroke="${INK}" stroke-width="6"/>
     <rect x="560" y="730" width="38" height="${H - 730}" fill="#7a4e7a" opacity=".16"/>
     <rect x="26" y="730" width="14" height="${H - 730}" fill="#fff6e0" opacity=".7"/>
     ${brick}
     ${bands}
     ${lower}
     <!-- the sign -->
     <g transform="translate(310 1490)">
       <rect x="-250" y="-34" width="500" height="68" rx="16" fill="#26306a" stroke="${INK}" stroke-width="6"/>
       <rect x="-238" y="-24" width="476" height="48" rx="10" fill="none" stroke="#ffd21f" stroke-width="4" stroke-dasharray="14 10"/>
       <text x="0" y="16" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="46" fill="#ffd96a" letter-spacing="3">TALLEST TOWER</text>
     </g>
     <!-- lobby: awning, doors, planters -->
     <rect x="200" y="1630" width="220" height="${H - 1630}" fill="#7a3f33" stroke="${INK}" stroke-width="6"/>
     <rect x="214" y="1646" width="90" height="${H - 1646}" fill="#ffe08a" stroke="${INK}" stroke-width="5"/><rect x="316" y="1646" width="90" height="${H - 1646}" fill="#ffe08a" stroke="${INK}" stroke-width="5"/>
     <path d="M259 1646 L 259 ${H} M361 1646 L 361 ${H}" stroke="${INK}" stroke-width="4"/><circle cx="296" cy="1700" r="6" fill="#c98a1a"/><circle cx="324" cy="1700" r="6" fill="#c98a1a"/>
     <path d="M180 1630 L 440 1630 L 462 1580 L 158 1580 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${158 + i * 50.7} 1580 L ${180 + i * 43.3} 1630 L ${180 + (i + 0.5) * 43.3} 1630 L ${158 + (i + 0.5) * 50.7} 1580 Z" fill="${CAPE}"/>`).join('')}
     <path d="M158 1580 L 462 1580 L 440 1630 L 180 1630 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M168 1630 Q 310 1650 452 1630" stroke="${INK}" stroke-width="5" fill="none"/>
     ${[78, 520].map((x) => `<rect x="${x - 40}" y="1690" width="80" height="60" rx="8" fill="#b8553f" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="1682" r="30" fill="#3f9a4a" stroke="${INK}" stroke-width="5"/><circle cx="${x - 10}" cy="1672" r="12" fill="#7fd07a"/><circle cx="${x + 22}" cy="1690" r="8" fill="#ff7a9a"/>`).join('')}
     <rect x="20" y="${H - 24}" width="${W - 40}" height="24" fill="#8a6a5a" stroke="${INK}" stroke-width="4"/>`,
    { cut: 5 },
  )
})()

/** The red warning light on the antenna, a glowing blob. */
export const antennaLight = svgDoc(
  90,
  90,
  `<radialGradient id="al"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#ff6a5a"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>
   <circle cx="45" cy="45" r="44" fill="url(#al)"/>`,
  { grain: 0 },
)

/* ---------- the other buildings of the middle layer ---------- */

export const glassOffice = (() => {
  const W = 700
  const H = 1050
  return svgDoc(
    W,
    H,
    `<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fd2ee"/><stop offset=".5" stop-color="#5aa4dc"/><stop offset="1" stop-color="#3c6fc4"/></linearGradient>
     <!-- roof garden -->
     <rect x="90" y="200" width="520" height="40" rx="8" fill="#c9ced6" stroke="${INK}" stroke-width="6"/>
     <rect x="104" y="150" width="492" height="56" rx="10" fill="#6fbf6a" stroke="${INK}" stroke-width="5"/>
     ${[150, 240, 360, 450, 540].map((x, i) => `<circle cx="${x}" cy="${130 - (i % 2) * 14}" r="${34 + (i % 3) * 8}" fill="#3f9a4a" stroke="${INK}" stroke-width="5"/><circle cx="${x - 10}" cy="${120 - (i % 2) * 14}" r="13" fill="#7fd07a"/>`).join('')}
     <!-- billboard -->
     <path d="M200 60 L 200 150 M500 60 L 500 150" stroke="${INK}" stroke-width="12"/><path d="M200 60 L 200 150 M500 60 L 500 150" stroke="#9aa3b4" stroke-width="6"/>
     <rect x="150" y="-0" width="400" height="120" rx="12" fill="#26306a" stroke="${INK}" stroke-width="6" transform="translate(0 6)"/>
     <text x="350" y="86" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="64" fill="#ffd96a">SKY CAFE</text>
     <path d="M214 108 L 486 108" stroke="#ff7a9a" stroke-width="6" stroke-dasharray="12 10" stroke-linecap="round" transform="translate(0 6)"/>
     <!-- tower body -->
     <rect x="60" y="240" width="580" height="800" fill="url(#gl)" stroke="${INK}" stroke-width="6"/>
     <rect x="60" y="240" width="22" height="800" fill="#d8f4ff" opacity=".8"/>
     <rect x="590" y="240" width="50" height="800" fill="#1c2a78" opacity=".25"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => `<rect x="60" y="${290 + j * 86}" width="580" height="10" fill="#2a3c88" opacity=".6"/>`).join('')}
     ${[0, 1, 2, 3, 4].map((i) => `<rect x="${158 + i * 100}" y="240" width="8" height="800" fill="#2a3c88" opacity=".55"/>`).join('')}
     ${Array.from({ length: 36 }, (_, i) => {
       const c = i % 5
       const rr = Math.floor(i / 5)
       const lit = ((i * 37) % 10) < 5
       return lit ? `<rect x="${72 + c * 100}" y="${304 + rr * 86}" width="86" height="64" fill="#ffe08a" opacity=".92"/><rect x="${72 + c * 100}" y="${340 + rr * 86}" width="86" height="28" fill="#ffb84a" opacity=".5"/>` : ''
     }).join('')}
     ${[0, 1, 2].map((i) => `<path d="M${110 + i * 190} 250 L ${60 + i * 190} 700" stroke="#fff" stroke-width="22" opacity=".16"/>`).join('')}
     <!-- cafe at the bottom -->
     <rect x="60" y="900" width="580" height="140" fill="#26306a" stroke="${INK}" stroke-width="6"/>
     <path d="M60 900 L 640 900 L 640 870 L 60 870 Z" fill="#ffd21f" stroke="${INK}" stroke-width="5"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${60 + i * 72.5}" y="870" width="36" height="30" fill="#e8574a"/>`).join('')}
     <rect x="100" y="920" width="130" height="120" rx="6" fill="#ffe08a" stroke="${INK}" stroke-width="5"/><rect x="270" y="920" width="130" height="120" rx="6" fill="#ffe08a" stroke="${INK}" stroke-width="5"/><rect x="440" y="920" width="160" height="120" rx="6" fill="#ffe08a" stroke="${INK}" stroke-width="5"/>
     <path d="M170 1010 q 14 -26 28 0 M330 1010 q 14 -26 28 0" stroke="#7a4e22" stroke-width="8" fill="none"/>
     <path d="M0 0" />`,
    { cut: 5 },
  )
})()

export const brickBlock = (() => {
  const W = 560
  const H = 860
  let bricks = ''
  const r = rand(17)
  for (let j = 0; j < 23; j++) for (let i = 0; i < 12; i++) if (r() < 0.12) bricks += `<rect x="${40 + i * 40 + (j % 2) * 20}" y="${130 + j * 32}" width="38" height="14" fill="#a8453a" opacity=".7"/>`
  return svgDoc(
    W,
    H,
    `<!-- chimneys -->
     <rect x="80" y="40" width="50" height="100" fill="#8a3f33" stroke="${INK}" stroke-width="6"/><rect x="72" y="30" width="66" height="22" fill="#a8453a" stroke="${INK}" stroke-width="5"/>
     <path d="M104 24 Q 90 -10 110 -30 Q 130 -10 112 -50" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".85"/>
     <rect x="420" y="60" width="44" height="80" fill="#8a3f33" stroke="${INK}" stroke-width="6"/><rect x="414" y="52" width="56" height="20" fill="#a8453a" stroke="${INK}" stroke-width="5"/>
     <!-- laundry line -->
     <path d="M150 120 Q 290 160 400 116" stroke="${INK}" stroke-width="5" fill="none"/>
     <path d="M190 138 l -4 52 l 40 4 l 6 -50 Z" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M262 148 l 0 40 l 34 0 l -2 -40 Z" fill="#ff7a9a" stroke="${INK}" stroke-width="4"/><path d="M326 146 l 4 56 l 28 -4 l -6 -56 Z" fill="#ffd21f" stroke="${INK}" stroke-width="4"/>
     <!-- body -->
     <path d="M20 130 L 540 130 L 540 860 L 20 860 Z" fill="#c8584a" stroke="${INK}" stroke-width="6"/>
     <rect x="20" y="130" width="540" height="26" fill="#e07a6a" stroke="${INK}" stroke-width="5"/>
     <rect x="500" y="156" width="40" height="704" fill="#4a1c50" opacity=".2"/>
     <rect x="26" y="156" width="12" height="704" fill="#ffd9c0" opacity=".6"/>
     ${bricks}
     ${windowGrid(66, 200, 4, 6, 56, 70, 40, 52, 91, 0.55, '#ffe08a', '#33407f', '#fff0d8')}
     <!-- fire escape zig-zag -->
     <g stroke="${INK}" stroke-width="9" fill="none" stroke-linejoin="round">${[0, 1, 2, 3, 4, 5].map((j) => `<path d="M${60 + (j % 2) * 20} ${262 + j * 122} L ${460} ${262 + j * 122}"/>`).join('')}</g>
     <g stroke="#4a4a5a" stroke-width="5" fill="none">${[0, 1, 2, 3, 4, 5].map((j) => `<path d="M${60 + (j % 2) * 20} ${262 + j * 122} L ${460} ${262 + j * 122}"/>`).join('')}</g>
     <g stroke="${INK}" stroke-width="9">${[0, 1, 2, 3, 4].map((j) => `<path d="M${j % 2 ? 80 : 440} ${262 + j * 122} L ${j % 2 ? 440 : 80} ${384 + j * 122}"/>`).join('')}</g>
     <g stroke="#4a4a5a" stroke-width="5">${[0, 1, 2, 3, 4].map((j) => `<path d="M${j % 2 ? 80 : 440} ${262 + j * 122} L ${j % 2 ? 440 : 80} ${384 + j * 122}"/>`).join('')}</g>
     <!-- door -->
     <rect x="224" y="770" width="112" height="90" rx="8" fill="#5a3a2a" stroke="${INK}" stroke-width="6"/><circle cx="318" cy="820" r="6" fill="#ffd21f"/>`,
    { cut: 5 },
  )
})()

/* =================================================================== */
/* ===========================  THE KITTEN  ========================== */
/* =================================================================== */

export const KITTEN = { w: 240, h: 280 }

export function kitten(mood: 'scared' | 'happy') {
  const orange = '#f2a24a'
  const dark = '#c9702c'
  const cream = '#fff3dc'
  const happy = mood === 'happy'
  return svgDoc(
    KITTEN.w,
    KITTEN.h,
    `<!-- tail -->
     ${limb('M176 238 Q 222 230 214 176 Q 210 150 192 156', orange, 24, 5)}
     <path d="M206 206 L 224 200 M212 180 L 226 176" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
     <circle cx="192" cy="156" r="13" fill="${cream}" stroke="${INK}" stroke-width="4"/>
     <!-- body -->
     <path d="M52 262 Q 44 190 74 168 L 166 168 Q 196 190 188 262 Q 120 278 52 262 Z" fill="${orange}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M64 200 L 82 206 M60 226 L 80 230 M176 200 L 158 206 M180 226 L 160 230" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
     <path d="M88 170 Q 120 150 152 170 Q 156 224 120 252 Q 84 224 88 170 Z" fill="${cream}"/>
     <!-- paws -->
     <ellipse cx="92" cy="262" rx="26" ry="15" fill="${cream}" stroke="${INK}" stroke-width="5"/><ellipse cx="148" cy="262" rx="26" ry="15" fill="${cream}" stroke="${INK}" stroke-width="5"/>
     <path d="M82 258 L 82 268 M94 256 L 94 268 M138 256 L 138 268 M150 258 L 150 268" stroke="#d9b48a" stroke-width="3" stroke-linecap="round"/>
     <!-- ears -->
     <path d="M44 84 L 40 18 Q 40 8 50 14 L 100 48 Z" fill="${orange}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M196 84 L 200 18 Q 200 8 190 14 L 140 48 Z" fill="${orange}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M54 70 L 52 34 L 84 54 Z" fill="#ff9aa8"/><path d="M186 70 L 188 34 L 156 54 Z" fill="#ff9aa8"/>
     <!-- head -->
     <path d="M30 118 Q 28 52 120 48 Q 212 52 210 118 Q 218 160 190 178 Q 120 204 50 178 Q 22 160 30 118 Z" fill="${orange}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M104 52 L 108 80 M120 50 L 120 82 M136 52 L 132 80" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
     <path d="M30 124 L 52 132 M28 146 L 50 150 M210 124 L 188 132 M212 146 L 190 150" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>
     <!-- muzzle -->
     <ellipse cx="120" cy="150" rx="36" ry="26" fill="${cream}"/>
     <path d="M110 138 L 130 138 L 120 150 Z" fill="#ff8a9a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
     ${
       happy
         ? `<path d="M96 108 Q 108 90 122 108 M120 108 Q 134 90 146 108" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round" transform="translate(-2 4)"/>
            <path d="M104 156 Q 120 176 136 156 Q 120 166 104 156 Z M120 150 L 120 160" fill="#c9455a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
            <circle cx="70" cy="146" r="14" fill="#ff7a8a" opacity=".5"/><circle cx="170" cy="146" r="14" fill="#ff7a8a" opacity=".5"/>`
         : `<ellipse cx="86" cy="112" rx="22" ry="26" fill="#fff" stroke="${INK}" stroke-width="4"/><ellipse cx="154" cy="112" rx="22" ry="26" fill="#fff" stroke="${INK}" stroke-width="4"/>
            <circle cx="90" cy="116" r="16" fill="#58b85a"/><circle cx="150" cy="116" r="16" fill="#58b85a"/>
            <circle cx="92" cy="118" r="10" fill="#17120e"/><circle cx="148" cy="118" r="10" fill="#17120e"/>
            <circle cx="86" cy="108" r="6" fill="#fff"/><circle cx="144" cy="108" r="6" fill="#fff"/><circle cx="96" cy="124" r="2.5" fill="#fff"/><circle cx="152" cy="124" r="2.5" fill="#fff"/>
            <path d="M62 86 Q 82 74 104 88 M178 86 Q 158 74 136 88" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
            <ellipse cx="120" cy="170" rx="11" ry="9" fill="#7a2a3c" stroke="${INK}" stroke-width="3.5"/><ellipse cx="120" cy="173" rx="6" ry="4" fill="#ff8a9a"/>
            <path d="M206 70 Q 218 92 206 100 Q 194 92 206 70 Z" fill="#8fd6ff" stroke="${INK}" stroke-width="3"/>`
     }
     <!-- whiskers -->
     <path d="M70 156 L 18 146 M70 164 L 20 168 M170 156 L 222 146 M170 164 L 220 168" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`,
    { cut: 5 },
  )
}

export const meowBubble = svgDoc(
  340,
  190,
  `<path d="M34 22 L 306 22 Q 326 22 326 42 L 326 112 Q 326 132 306 132 L 130 132 L 70 176 L 86 132 L 34 132 Q 14 132 14 112 L 14 42 Q 14 22 34 22 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <text x="170" y="100" text-anchor="middle" font-family="${ROUND}" font-weight="900" font-size="68" fill="#ff5a7a" stroke="#fff" stroke-width="2">MEOW!</text>`,
)

/* =================================================================== */
/* ===========================  SUPER-MILO  ========================== */
/* =================================================================== */

export const HERO = { w: 800, h: 460 }
export const HERO_K = 1 / 1000

const diamond = (cx: number, cy: number, s: number) => `<g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M0 -50 L 46 -10 L 0 52 L -46 -10 Z" fill="${EMBLEM}" stroke="${CAPE}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-20 18 L -20 -16 L 0 4 L 20 -16 L 20 18" stroke="${CAPE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`

/** Super-Milo standing tall on the rooftop, fists on his hips (cape is a separate piece). */
export const STAND = { w: 420, h: 650 }
export const STAND_K = 1 / 640
/** where the cape hangs from (art px): between the shoulders, just under the neck */
export const STAND_NECK = { x: 212, y: 200 }

export const heroStand = (() => {
  const sock = '#f6f4ee'
  return svgDoc(
    STAND.w,
    STAND.h,
    `<!-- legs -->
     ${limb('M178 400 L 176 560', SKIN, 34, 5)}
     ${limb('M246 400 L 250 560', SKIN, 34, 5)}
     <path d="M158 536 L 198 536 L 200 586 Q 200 604 182 604 L 140 604 Q 124 604 128 590 Q 134 574 158 570 Z" fill="${sock}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M226 536 L 270 536 L 270 570 Q 294 574 298 590 Q 300 604 284 604 L 242 604 Q 226 604 226 586 Z" fill="${sock}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M160 548 L 198 548 M228 548 L 268 548" stroke="#d6d2c6" stroke-width="5"/>
     <!-- shorts -->
     <path d="M140 338 L 288 338 L 298 428 Q 262 440 228 430 L 214 392 L 198 430 Q 164 440 130 428 Z" fill="#8f9297" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M146 346 Q 214 358 282 346" stroke="#b6b9be" stroke-width="7" fill="none" stroke-linecap="round"/>
     <path d="M214 352 L 214 392" stroke="#7a7d82" stroke-width="4"/>
     <!-- far arm (fist on hip) -->
     ${limb('M152 222 Q 90 262 106 318 Q 118 340 148 344', SKIN_SH, 28, 5)}
     <circle cx="150" cy="346" r="20" fill="${SKIN_SH}" stroke="${INK}" stroke-width="5"/>
     <!-- neck -->
     <rect x="194" y="160" width="36" height="46" rx="12" fill="${SKIN_SH}"/>
     <!-- tank-top torso -->
     <path d="M146 196 L 182 196 Q 212 232 242 196 L 280 196 Q 290 232 296 262 L 290 352 Q 214 370 136 352 L 130 262 Q 136 232 146 196 Z" fill="#a9acb2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M150 204 Q 214 216 276 204" stroke="#cfd2d8" stroke-width="8" fill="none" stroke-linecap="round" opacity=".9"/>
     <path d="M140 342 Q 214 362 288 342" stroke="#8c8f94" stroke-width="7" fill="none" stroke-linecap="round"/>
     <g stroke="#979aa0" stroke-width="2.5" opacity=".7"><path d="M172 214 L 170 346"/><path d="M214 216 L 214 352"/><path d="M256 214 L 258 346"/></g>
     ${diamond(214, 268, 0.86)}
     <!-- near arm (fist on hip) -->
     ${limb('M276 222 Q 338 262 322 318 Q 310 340 280 344', SKIN, 28, 5)}
     <circle cx="278" cy="346" r="21" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
     <path d="M262 340 Q 270 350 280 352" stroke="${SKIN_SH}" stroke-width="4" fill="none" stroke-linecap="round"/>
     <!-- head: Milo with mask, chin up -->
     <g transform="translate(214 112) rotate(-4) scale(0.37) translate(-200 -225)">
       <path d="M62 196 Q -10 170 -64 198 Q -20 218 -70 250 Q 0 246 66 226 Z" fill="${MASK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
       ${headParts}
       <g transform="translate(50 160)">
         <path d="M10 40 Q 150 0 290 40 Q 300 80 270 96 Q 220 108 172 80 Q 150 70 128 80 Q 80 108 30 96 Q 0 80 10 40 Z" fill="${MASK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
         <path d="M34 42 Q 150 12 266 42" stroke="#5f93f2" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>
       </g>
       <g transform="translate(70 165)">${eyesParts}</g>
     </g>`,
    { cut: 5 },
  )
})()

/** The cape hanging behind the standing hero, blown to the left (same canvas as the figure). */
export const heroStandCape = svgDoc(
  STAND.w,
  STAND.h,
  `<path d="M150 196 Q 214 214 280 196 Q 300 290 286 400 Q 270 500 232 576 Q 214 556 196 592 Q 170 552 148 584 Q 120 540 96 560 Q 60 520 58 470 Q 40 400 70 330 Q 100 250 150 196 Z" fill="${CAPE}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M150 196 Q 214 214 280 196 Q 296 270 290 340 Q 220 330 150 330 Q 120 280 150 196 Z" fill="${CAPE_SH}" opacity=".5"/>
   <path d="M170 220 Q 120 300 112 420 M214 232 Q 196 340 196 470 M250 232 Q 262 360 238 500" stroke="${CAPE_SH}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
   <path d="M160 204 Q 214 222 270 204" stroke="#f0584a" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>`,
  { cut: 4 },
)

/** Milo in flight, facing right, arms out in front. */
export const superMilo = (() => {
  const sock = '#f6f4ee'
  return svgDoc(
    HERO.w,
    HERO.h,
    `<!-- far arm -->
     ${limb('M458 206 Q 548 160 640 142', SKIN_SH, 26, 5)}
     <circle cx="658" cy="140" r="20" fill="${SKIN_SH}" stroke="${INK}" stroke-width="5"/>
     <!-- far leg, kicked up -->
     ${limb('M276 224 Q 190 216 110 186', SKIN_SH, 28, 5)}
     ${limb('M160 200 Q 120 190 66 170', sock, 32, 5)}
     <path d="M176 186 L 170 224 M214 198 L 208 232" stroke="#d6d2c6" stroke-width="4" opacity=".0"/>
     <!-- near leg -->
     ${limb('M276 258 Q 190 296 100 292', SKIN, 28, 5)}
     ${limb('M150 294 Q 110 296 54 282', sock, 34, 5)}
     
     <!-- shorts -->
     <path d="M254 200 Q 296 190 340 200 L 346 276 Q 300 296 248 280 Q 236 240 254 200 Z" fill="#8f9297" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M258 208 Q 296 198 336 206" stroke="#b6b9be" stroke-width="7" fill="none" stroke-linecap="round"/>
     <path d="M270 232 Q 306 250 340 244" stroke="#7a7d82" stroke-width="4" fill="none"/>
     <!-- neck -->
     <rect x="452" y="176" width="46" height="46" rx="14" fill="${SKIN_SH}"/>
     <!-- tank-top torso -->
     <path d="M326 192 Q 398 168 472 190 Q 504 232 478 272 Q 400 296 330 276 Q 310 232 326 192 Z" fill="#a9acb2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M334 198 Q 400 178 462 196" stroke="#cfd2d8" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>
     <path d="M336 266 Q 404 286 472 262" stroke="#8c8f94" stroke-width="7" fill="none" stroke-linecap="round"/>
     <g stroke="#979aa0" stroke-width="2.5" opacity=".7"><path d="M366 190 L 364 280"/><path d="M400 186 L 400 286"/><path d="M434 188 L 434 282"/></g>
     ${diamond(410, 234, 0.74)}
     <!-- head: Milo, mask + mask ties flying behind -->
     <g transform="translate(522 154) rotate(-8) scale(0.4) translate(-200 -225)">
       <path d="M62 196 Q -10 170 -64 198 Q -20 218 -70 250 Q 0 246 66 226 Z" fill="${MASK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
       <path d="M62 196 Q -10 170 -64 198" stroke="#5f93f2" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
       ${headParts}
       <g transform="translate(50 160)">
         <path d="M10 40 Q 150 0 290 40 Q 300 80 270 96 Q 220 108 172 80 Q 150 70 128 80 Q 80 108 30 96 Q 0 80 10 40 Z" fill="${MASK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
         <path d="M34 42 Q 150 12 266 42" stroke="#5f93f2" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85"/>
       </g>
       <g transform="translate(70 165)">${eyesParts}</g>
     </g>
     <!-- near arm: reaching forward -->
     ${limb('M452 240 Q 552 252 628 232', SKIN, 28, 5)}
     <path d="M470 246 Q 500 254 520 252" stroke="${SKIN_SH}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <circle cx="648" cy="230" r="22" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
     <path d="M652 214 L 668 206 M658 226 L 676 222 M656 240 L 672 244" stroke="${SKIN_SH}" stroke-width="5" stroke-linecap="round"/>`,
    { cut: 5 },
  )
})()

export const CAPE_ART = { w: 560, h: 340, ax: 524, ay: 104 }
export const heroCape = svgDoc(
  CAPE_ART.w,
  CAPE_ART.h,
  `<path d="M524 104 C 420 30 250 28 110 70 Q 70 84 30 112 Q 70 130 96 150 Q 62 190 50 236 Q 90 224 120 218 Q 130 260 160 296 Q 190 262 214 238 Q 290 270 372 230 Q 450 205 520 192 Z" fill="${CAPE}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M420 150 Q 300 120 150 150 Q 100 180 96 150 Q 62 190 50 236 Q 90 224 120 218 Q 130 260 160 296 Q 190 262 214 238 Q 290 270 372 230 Q 450 205 520 192 Z" fill="${CAPE_SH}" opacity=".5"/>
   <path d="M524 104 C 420 30 250 28 110 70" stroke="#f0584a" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/>
   <path d="M440 140 Q 300 100 140 120 M420 180 Q 300 170 190 190 M380 214 Q 300 214 230 232" stroke="${CAPE_SH}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
   <circle cx="520" cy="112" r="11" fill="${EMBLEM}" stroke="${INK}" stroke-width="4"/>`,
  { cut: 4 },
)

export const speedLines = svgDoc(
  360,
  200,
  [[10, 40, 300, 12], [70, 84, 260, 14], [0, 124, 320, 12], [60, 162, 240, 10]]
    .map(([x, y, w, h]) => `<path d="M${x} ${y} L ${x + w} ${y - h / 2} L ${x + w} ${y + h / 2} Z" fill="#fff" opacity=".9"/>`)
    .join(''),
  { grain: 0 },
)

/* =================================================================== */
/* ===========================  SMALL PIECES  ======================== */
/* =================================================================== */

export const puffyCloud = (w: number, h: number, _seed = 1, tint = '#fff8f4', under = '#f2c9e0') => {
  const d = cloudShape(0, 0, 1)
  const t = `translate(${w / 2} ${(h * 168) / 230}) scale(${w / 470} ${h / 230})`
  return svgDoc(
    w,
    h,
    `<g transform="${t}">
       <path d="${d}" fill="${tint}"/>
       <path d="M-200 30 Q 0 66 205 30 Q 190 48 170 40 L -170 40 Z" fill="${under}"/>
       <path d="M-90 -66 Q -40 -100 10 -84 M60 -92 Q 100 -106 128 -80 M-190 -4 Q -176 -30 -140 -30" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/>
     </g>`,
    { cut: 4, grain: 0.25 },
  )
}

export const songBird = svgDoc(
  170,
  130,
  `<path d="M26 76 L -2 66 L 8 92 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round" transform="translate(6 4)"/>
   <ellipse cx="86" cy="80" rx="54" ry="40" fill="#5aa0e8" stroke="${INK}" stroke-width="5"/>
   <ellipse cx="92" cy="96" rx="34" ry="22" fill="#fff6e8"/>
   <path d="M62 66 Q 80 6 126 22 Q 108 40 104 70 Q 84 74 62 66 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M76 52 Q 94 30 116 30" stroke="#8fc0f4" stroke-width="5" fill="none" stroke-linecap="round"/>
   <circle cx="118" cy="62" r="16" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="122" cy="63" r="8" fill="${INK}"/><circle cx="119" cy="59" r="3" fill="#fff"/>
   <path d="M132 72 L 164 78 L 134 88 Z" fill="#ffb02e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
   <path d="M76 118 L 76 128 M96 118 L 96 128" stroke="#ff9a3c" stroke-width="5" stroke-linecap="round"/>`,
  { cut: 4 },
)

export const arrowHint = svgDoc(
  180,
  220,
  `<path d="M60 10 L 120 10 L 120 100 L 160 100 L 90 206 L 20 100 L 60 100 Z" fill="#ffd21f" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M70 22 L 70 108" stroke="#fff6a0" stroke-width="10" stroke-linecap="round"/>`,
  { cut: 5 },
)

/* =================================================================== */
/* ===========================  THE SKY WORLD  ======================= */
/* =================================================================== */

/** A tall slender tower for the distance. */
export function worldTower(opts: {
  w: number; h: number; body: string; shade: string; rim: string; crown: 'flat' | 'spire' | 'dome' | 'stepped' | 'antenna' | 'pyramid'; seed: number; lit?: number; bands?: string
}) {
  const { w, h, body, shade, rim, crown, seed, lit = 0.5, bands } = opts
  const r = rand(seed)
  const top = 170
  const bodyH = h - top
  let wins = ''
  const cols = Math.max(3, Math.floor((w - 50) / 44))
  const rows = Math.floor((bodyH - 80) / 66)
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const on = r() < lit
      wins += `<rect x="${(w - cols * 44) / 2 + i * 44 + 8}" y="${top + 40 + j * 66}" width="26" height="40" rx="4" fill="${on ? '#ffe08a' : '#2d3a78'}" ${on ? '' : 'opacity=".85"'}/>`
      if (on) wins += `<rect x="${(w - cols * 44) / 2 + i * 44 + 8}" y="${top + 62 + j * 66}" width="26" height="18" fill="#ffb84a" opacity=".6"/>`
    }
  let crownSvg = ''
  const cx = w / 2
  if (crown === 'spire')
    crownSvg = `<path d="M${w * 0.18} ${top} L ${w * 0.18} ${top - 24} L ${w * 0.3} ${top - 24} L ${w * 0.3} ${top - 60} L ${w * 0.7} ${top - 60} L ${w * 0.7} ${top - 24} L ${w * 0.82} ${top - 24} L ${w * 0.82} ${top} Z" fill="${body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M${cx - 18} ${top - 60} L ${cx} ${top - 130} L ${cx + 18} ${top - 60} Z" fill="${body}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M${cx} ${top - 130} L ${cx} 20" stroke="${INK}" stroke-width="7"/><circle cx="${cx}" cy="16" r="9" fill="#ff4a4a"/>`
  else if (crown === 'dome')
    crownSvg = `<path d="M${w * 0.12} ${top} Q ${cx} ${top - 150} ${w * 0.88} ${top} Z" fill="${shade}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M${w * 0.22} ${top - 16} Q ${cx} ${top - 120} ${w * 0.5} ${top - 118}" stroke="${rim}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M${cx} ${top - 118} L ${cx} ${top - 158}" stroke="${INK}" stroke-width="6"/><circle cx="${cx}" cy="${top - 162}" r="8" fill="#ffd21f" stroke="${INK}" stroke-width="3"/>`
  else if (crown === 'stepped')
    crownSvg = [0, 1, 2].map((i) => `<rect x="${w * (0.12 + i * 0.12)}" y="${top - 46 * (i + 1)}" width="${w * (0.76 - i * 0.24)}" height="48" fill="${body}" stroke="${INK}" stroke-width="6"/>`).join('') + `<path d="M${cx} ${top - 138} L ${cx} 30" stroke="${INK}" stroke-width="7"/><circle cx="${cx}" cy="26" r="9" fill="#ff4a4a"/>`
  else if (crown === 'antenna')
    crownSvg = `<rect x="${w * 0.1}" y="${top - 30}" width="${w * 0.8}" height="32" fill="${body}" stroke="${INK}" stroke-width="6"/><path d="M${cx} ${top - 30} L ${cx} 14" stroke="${INK}" stroke-width="8"/><path d="M${cx - 18} 60 L ${cx + 18} 60 M${cx - 14} 100 L ${cx + 14} 100" stroke="${INK}" stroke-width="7"/><circle cx="${cx}" cy="12" r="9" fill="#ff4a4a"/>`
  else if (crown === 'pyramid')
    crownSvg = `<path d="M${w * 0.08} ${top} L ${cx} ${top - 130} L ${w * 0.92} ${top} Z" fill="${shade}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M${w * 0.08} ${top} L ${cx} ${top - 130} L ${cx} ${top} Z" fill="${rim}" opacity=".45"/>`
  else crownSvg = `<rect x="${w * 0.08}" y="${top - 24}" width="${w * 0.84}" height="26" fill="${shade}" stroke="${INK}" stroke-width="6"/>`
  return svgDoc(
    w,
    h,
    `${crownSvg}
     <rect x="${w * 0.06}" y="${top}" width="${w * 0.88}" height="${bodyH + 20}" fill="${body}" stroke="${INK}" stroke-width="6"/>
     <rect x="${w * 0.06}" y="${top}" width="${w * 0.1}" height="${bodyH + 20}" fill="${rim}" opacity=".6"/>
     <rect x="${w * 0.74}" y="${top}" width="${w * 0.2}" height="${bodyH + 20}" fill="#241a60" opacity=".24"/>
     ${bands ? Array.from({ length: Math.floor(bodyH / 280) }, (_, i) => `<rect x="${w * 0.06}" y="${top + 240 + i * 280}" width="${w * 0.88}" height="16" fill="${bands}" stroke="${INK}" stroke-width="4"/>`).join('') : ''}
     ${wins}`,
    { cut: 6 },
  )
}

export const sunBig = svgDoc(
  900,
  900,
  `<radialGradient id="sg" cx="450" cy="450" r="450" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbd0"/><stop offset=".5" stop-color="#ffe27a"/><stop offset=".75" stop-color="#ffb347"/><stop offset="1" stop-color="#ff8a3a"/></radialGradient>
   ${Array.from({ length: 16 }, (_, i) => {
     const a = (i / 16) * Math.PI * 2
     const a2 = a + 0.14
     return `<path d="M${(450 + Math.cos(a) * 380).toFixed(0)} ${(450 + Math.sin(a) * 380).toFixed(0)} L ${(450 + Math.cos(a + 0.07) * (i % 2 ? 440 : 400)).toFixed(0)} ${(450 + Math.sin(a + 0.07) * (i % 2 ? 440 : 400)).toFixed(0)} L ${(450 + Math.cos(a2) * 380).toFixed(0)} ${(450 + Math.sin(a2) * 380).toFixed(0)} Z" fill="#ffd36b"/>`
   }).join('')}
   <circle cx="450" cy="450" r="360" fill="url(#sg)" stroke="#ff9a3a" stroke-width="10"/>
   <path d="M200 330 Q 260 220 380 190" stroke="#fffbe8" stroke-width="30" fill="none" stroke-linecap="round" opacity=".7"/>
   <circle cx="360" cy="440" r="34" fill="#ff7a4a" opacity=".16"/><circle cx="560" cy="520" r="52" fill="#ff7a4a" opacity=".14"/><circle cx="480" cy="300" r="26" fill="#ff7a4a" opacity=".12"/>`,
  { grain: 0.6 },
)

export const sunGlow = svgDoc(
  1000,
  1000,
  `<radialGradient id="gg" cx="500" cy="500" r="500" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff3b8" stop-opacity=".9"/><stop offset=".45" stop-color="#ffc98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffc98a" stop-opacity="0"/></radialGradient>
   <circle cx="500" cy="500" r="500" fill="url(#gg)"/>`,
  { grain: 0 },
)

/** hot-air balloon */
export const balloon = svgDoc(
  520,
  800,
  `<path d="M260 20 C 90 20 20 150 40 270 C 56 360 170 440 214 500 L 306 500 C 350 440 464 360 480 270 C 500 150 430 20 260 20 Z" fill="#e8322b" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
   <path d="M260 20 C 170 60 130 150 150 270 C 160 380 200 440 214 500 L 260 500 Z" fill="#ffd21f" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M260 20 C 350 60 390 150 370 270 C 360 380 320 440 306 500 L 260 500 Z" fill="#3a6fd8" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M260 20 C 230 100 230 400 260 500 C 290 400 290 100 260 20 Z" fill="#fff6e4" stroke="${INK}" stroke-width="6"/>
   <path d="M110 150 Q 130 90 200 60" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" opacity=".6"/>
   <path d="M60 300 Q 260 340 460 300" stroke="${INK}" stroke-width="5" fill="none" opacity=".5"/>
   <path d="M214 500 L 226 640 M306 500 L 294 640 M244 500 L 244 640 M276 500 L 276 640" stroke="${INK}" stroke-width="5"/>
   <path d="M214 500 L 306 500" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
   <path d="M210 640 L 310 640 L 298 740 L 222 740 Z" fill="#c98a52" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
   <path d="M216 662 L 304 662 M218 690 L 302 690 M220 716 L 300 716" stroke="#a8703c" stroke-width="4"/>
   <path d="M210 640 L 310 640" stroke="#e0a56a" stroke-width="10"/>
   <!-- a cat riding along -->
   <path d="M246 640 L 244 612 L 254 620 L 266 620 L 276 612 L 274 640 Z" fill="#f2a24a" stroke="${INK}" stroke-width="3"/>`,
  { cut: 6 },
)

export const flockV = (n: number, seed = 5) => {
  const r = rand(seed)
  let s = ''
  for (let i = 0; i < n; i++) {
    const row = Math.ceil(i / 2) * (i % 2 ? 1 : -1)
    s += bird(300 + row * 70 + r() * 10, 200 + Math.abs(row) * 40 + r() * 10, 1.4 + r() * 0.3, (r() - 0.5) * 16)
  }
  return svgDoc(600, 360, s, { cut: 4 })
}

/** big flat cloud-sea floor: soft puffs on a transparent ground */
export const cloudSea = (() => {
  const r = rand(44)
  let out = ''
  for (let i = 0; i < 46; i++) {
    const x = r() * 2400
    const y = 80 + r() * 1040
    const s = 0.5 + r() * 0.9
    out += `<g opacity="${(0.55 + r() * 0.4).toFixed(2)}"><path d="${cloudShape(x, y, s)}" fill="${r() < 0.4 ? '#ffe3ef' : '#ffffff'}"/><path d="M${x - 150 * s} ${y + 34 * s} Q ${x} ${y + 62 * s} ${x + 160 * s} ${y + 34 * s}" stroke="#e2c0e0" stroke-width="${8 * s}" fill="none" stroke-linecap="round"/></g>`
  }
  return svgDoc(2400, 1200, out, { grain: 0.5 })
})()

/** a round puffy cloud for the world, in sunset tints */

/** A near rooftop with a corner of the city: the world's foreground, left or right. */
export function foregroundRoof(seed: number, flip = false) {
  const r = rand(seed)
  const body = `
    <rect x="30" y="120" width="560" height="780" fill="#e8c9a0" stroke="${INK}" stroke-width="7"/>
    <rect x="30" y="120" width="30" height="780" fill="#fff0d2" opacity=".7"/><rect x="520" y="120" width="70" height="780" fill="#3a2a70" opacity=".2"/>
    <rect x="0" y="90" width="620" height="54" rx="8" fill="#c9524a" stroke="${INK}" stroke-width="7"/><rect x="10" y="96" width="600" height="12" rx="5" fill="#ef8378"/>
    ${windowGrid(76, 200, 4, 7, 60, 70, 40, 46, seed + 3, 0.5, '#ffe08a', '#33407f', '#fff0d8')}
    <!-- rooftop: tank + antenna + string lights -->
    <path d="M110 90 L 110 40 M190 90 L 190 40" stroke="${INK}" stroke-width="9"/><path d="M80 40 L 220 40 L 200 -40 L 100 -40 Z" fill="#b8553f" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="84" y="-38" width="132" height="80" fill="#cf9a62" stroke="${INK}" stroke-width="7"/>
    <path d="M84 -10 L 216 -10 M84 20 L 216 20" stroke="#5a5a64" stroke-width="7"/>
    <path d="M410 90 L 410 -120" stroke="${INK}" stroke-width="10"/><path d="M380 -40 L 440 -40 M390 -80 L 430 -80" stroke="${INK}" stroke-width="8"/><circle cx="410" cy="-126" r="10" fill="#ff4a4a" stroke="${INK}" stroke-width="3"/>
    <path d="M60 80 Q 200 130 330 80 T 590 80" stroke="${INK}" stroke-width="4" fill="none"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${70 + i * 58}" cy="${i % 2 ? 106 : 96}" r="9" fill="${['#ffd21f', '#ff7a9a', '#6fe0a8', '#6fb4ff'][i % 4]}" stroke="${INK}" stroke-width="3"/>`).join('')}
    ${Array.from({ length: 6 }, () => `<path d="M${(60 + r() * 500).toFixed(0)} ${(740 + r() * 100).toFixed(0)} l 0 0" />`).join('')}`
  return svgDoc(620, 900 + 160, `<g transform="translate(0 160)">${body}</g>`.replace(/<g transform="translate\(0 160\)">/, flip ? '<g transform="translate(620 160) scale(-1 1)">' : '<g transform="translate(0 160)">'), { cut: 6 })
}
