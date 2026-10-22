import { INK, woodGrain } from './style'

/*
 * Hand tools, drawn in local coordinates centred on (0, 0), pointing up.
 * Place them with `at(x, y, rot, scale, svg)`.
 */

export const at = (x: number, y: number, rot: number, s: number, svg: string) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${svg}</g>`

const STEEL = '#9aa3ad'
const STEEL_HI = '#d4dae0'
const STEEL_SH = '#6f7882'

/** ~300 tall */
export const hammer = (grip = '#e8322b') => `
  <rect x="-15" y="-100" width="30" height="250" rx="12" fill="#d39a5a" stroke="${INK}" stroke-width="5"/>
  ${woodGrain(-12, -90, 24, 160, '#a8743f', 3, 2)}
  <rect x="-18" y="70" width="36" height="88" rx="14" fill="${grip}" stroke="${INK}" stroke-width="5"/>
  <path d="M-12 86 L 12 86 M-12 106 L 12 106 M-12 126 L 12 126" stroke="#000" stroke-width="4" opacity=".25"/>
  <path d="M-96 -150 L 34 -150 L 34 -96 L -96 -96 Q -110 -123 -96 -150 Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M34 -146 Q 90 -150 112 -112 Q 80 -126 34 -110 Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-88 -140 L 26 -140" stroke="${STEEL_HI}" stroke-width="7" stroke-linecap="round"/>`

/** ~300 tall */
export const wrench = (len = 300) => {
  const h = len / 2
  return `
  <path d="M-15 ${-h + 70} L 15 ${-h + 70} L 13 ${h - 60} L -13 ${h - 60} Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-6 ${-h + 80} L -5 ${h - 70}" stroke="${STEEL_HI}" stroke-width="5" stroke-linecap="round"/>
  <path d="M-22 ${-h} L -22 ${-h + 36} L 22 ${-h + 36} L 22 ${-h} A 50 50 0 1 1 -22 ${-h} Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="0" cy="${h - 30}" r="36" fill="${STEEL}" stroke="${INK}" stroke-width="5"/>
  <circle cx="0" cy="${h - 30}" r="16" fill="#00000000" stroke="${INK}" stroke-width="5"/>
  <circle cx="0" cy="${h - 30}" r="14" fill="${STEEL_SH}"/>`
}

/** ~340 tall */
export const screwdriver = (color = '#f4b400', phillips = false) => `
  <rect x="-7" y="-170" width="14" height="210" fill="${STEEL}" stroke="${INK}" stroke-width="4"/>
  ${phillips ? `<path d="M-7 -170 L 0 -190 L 7 -170 Z" fill="${STEEL}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` : `<rect x="-11" y="-184" width="22" height="16" fill="${STEEL}" stroke="${INK}" stroke-width="4"/>`}
  <rect x="-3" y="-160" width="5" height="190" fill="${STEEL_HI}"/>
  <path d="M-28 40 Q -32 20 -18 20 L 18 20 Q 32 20 28 40 L 30 160 Q 30 182 0 182 Q -30 182 -30 160 Z" fill="${color}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-14 50 L -14 160 M0 50 L 0 166 M14 50 L 14 160" stroke="#000" stroke-width="5" opacity=".18" stroke-linecap="round"/>
  <path d="M-20 30 Q 0 24 20 30" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>`

/** ~560 wide, handle on the right */
export const saw = () => `
  <path d="M-280 -40 L 150 -70 L 150 60 L -280 30 Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-272 -28 L 140 -56" stroke="${STEEL_HI}" stroke-width="7" stroke-linecap="round"/>
  <path d="${Array.from({ length: 27 }, (_, i) => `${i ? 'L' : 'M'} ${-280 + i * 16} ${30 + i * 1.1} L ${-272 + i * 16} ${42 + i * 1.1}`).join(' ')} L 150 60" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="-250" cy="-12" r="9" fill="${STEEL_SH}"/>
  <path d="M130 -80 Q 130 -100 160 -100 L 250 -100 Q 290 -100 290 -60 L 290 60 Q 290 100 250 100 L 160 100 Q 130 100 130 80 Z" fill="#d39a5a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M176 -54 L 240 -54 Q 254 -54 254 -40 L 254 40 Q 254 54 240 54 L 176 54 Q 162 54 162 40 L 162 -40 Q 162 -54 176 -54 Z" fill="#c9a06a" stroke="${INK}" stroke-width="5"/>
  <circle cx="146" cy="-40" r="8" fill="#e9c25a" stroke="${INK}" stroke-width="3"/><circle cx="146" cy="40" r="8" fill="#e9c25a" stroke="${INK}" stroke-width="3"/>`

/** ~300 tall */
export const pliers = (grip = '#e8322b') => `
  <path d="M-10 -40 Q -40 40 -50 150 Q -48 162 -32 160 Q -20 60 6 -20 Z" fill="${grip}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M10 -40 Q 40 40 50 150 Q 48 162 32 160 Q 20 60 -6 -20 Z" fill="${grip}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-14 -40 L -20 -130 Q -12 -150 0 -150 L 4 -40 Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M14 -40 L 20 -130 Q 12 -150 0 -150 L -4 -40 Z" fill="${STEEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="0" cy="-36" r="16" fill="${STEEL_SH}" stroke="${INK}" stroke-width="4"/>
  <path d="M-12 -120 L 12 -120 M-12 -104 L 12 -104 M-12 -88 L 12 -88" stroke="${INK}" stroke-width="3"/>`

/** ~160 */
export const tapeMeasure = () => `
  <rect x="-80" y="-80" width="160" height="160" rx="36" fill="#ffcc1a" stroke="${INK}" stroke-width="5"/>
  <circle cx="-6" cy="-4" r="46" fill="#2b2b2b" stroke="${INK}" stroke-width="4"/>
  <circle cx="-6" cy="-4" r="22" fill="#ffcc1a" stroke="${INK}" stroke-width="4"/>
  <rect x="62" y="40" width="44" height="22" fill="#ffe680" stroke="${INK}" stroke-width="4"/>
  <rect x="100" y="34" width="10" height="34" fill="${STEEL}" stroke="${INK}" stroke-width="3"/>
  <path d="M-60 60 L 60 60" stroke="#000" stroke-width="6" opacity=".2"/>`

/** ~440 wide */
export const level = () => `
  <rect x="-220" y="-28" width="440" height="56" rx="8" fill="#2f9a4a" stroke="${INK}" stroke-width="5"/>
  <rect x="-200" y="-20" width="400" height="12" rx="6" fill="#fff" opacity=".25"/>
  <rect x="-44" y="-16" width="88" height="32" rx="14" fill="#e8f7a8" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="6" cy="0" rx="14" ry="9" fill="#fff"/>
  <path d="M-16 -16 L -16 16 M28 -16 L 28 16" stroke="${INK}" stroke-width="3"/>
  <circle cx="-160" cy="0" r="12" fill="#1f6a33"/><circle cx="160" cy="0" r="12" fill="#1f6a33"/>`

/** ~260 wide */
export const goggles = () => `
  <path d="M-130 0 Q -150 -10 -150 10" stroke="#3a6fd8" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M130 0 Q 150 -10 150 10" stroke="#3a6fd8" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M-128 -40 Q -128 -56 -110 -56 L 110 -56 Q 128 -56 128 -40 L 128 30 Q 128 52 104 52 L 40 52 Q 20 52 12 30 Q 0 10 -12 30 Q -20 52 -40 52 L -104 52 Q -128 52 -128 30 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round" opacity=".95"/>
  <path d="M-104 -36 L -70 -36 M70 -36 L 104 -36" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <path d="M-128 -40 L 128 -40" stroke="#3a6fd8" stroke-width="10"/>`

/** ~280 wide */
export const hardHat = () => `
  <path d="M-110 30 Q -110 -110 0 -112 Q 110 -110 110 30 Z" fill="#ffc21a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-20 -110 L -20 30 M20 -110 L 20 30" stroke="#e0a400" stroke-width="10"/>
  <path d="M-150 30 L 150 30 Q 156 52 130 54 L -130 54 Q -156 52 -150 30 Z" fill="#ffc21a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M-70 -70 Q -50 -96 -20 -100" stroke="#fff3b0" stroke-width="10" fill="none" stroke-linecap="round"/>`

/** ~240 tall */
export const clamp = () => `
  <path d="M-60 -110 L 40 -110 Q 70 -110 70 -80 L 70 80 Q 70 110 40 110 L -60 110 L -60 76 L 30 76 L 30 -76 L -60 -76 Z" fill="#e8572b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="-100" y="-20" width="140" height="18" fill="${STEEL}" stroke="${INK}" stroke-width="4"/>
  <rect x="-110" y="-40" width="26" height="58" rx="5" fill="${STEEL_SH}" stroke="${INK}" stroke-width="4"/>`

/** ~300 long */
export const pencil = () => `
  <path d="M-150 -14 L 110 -14 L 150 0 L 110 14 L -150 14 Z" fill="#ffc21a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M110 -14 L 150 0 L 110 14 Z" fill="#f2d2a2" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M136 -5 L 150 0 L 136 5 Z" fill="#333"/>
  <rect x="-170" y="-14" width="24" height="28" rx="6" fill="#f08ea0" stroke="${INK}" stroke-width="4"/>
  <path d="M-150 0 L 110 0" stroke="#e0a400" stroke-width="4"/>`

/** a pegboard hook */
export const peg = (x: number, y: number) =>
  `<path d="M${x - 10} ${y} L ${x - 10} ${y - 14} L ${x + 10} ${y - 14} L ${x + 10} ${y}" stroke="#8a939c" stroke-width="7" fill="none" stroke-linecap="round"/>`

export const screw = (x: number, y: number, rot: number) =>
  at(x, y, rot, 1, `<rect x="-5" y="-26" width="10" height="40" fill="${STEEL}" stroke="${INK}" stroke-width="3"/>
    <path d="M-5 -18 L 5 -14 M-5 -8 L 5 -4 M-5 2 L 5 6" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="0" cy="-28" rx="14" ry="7" fill="${STEEL}" stroke="${INK}" stroke-width="3"/>
    <path d="M0 14 L -5 14 L 0 24 L 5 14 Z" fill="${STEEL}" stroke="${INK}" stroke-width="2"/>`)

export const nut = (x: number, y: number, r = 14) =>
  `<path d="M${x - r} ${y} L ${x - r / 2} ${y - r * 0.87} L ${x + r / 2} ${y - r * 0.87} L ${x + r} ${y} L ${x + r / 2} ${y + r * 0.87} L ${x - r / 2} ${y + r * 0.87} Z" fill="${STEEL}" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${STEEL_SH}"/>`

/** a curl of wood shaving */
export const shaving = (x: number, y: number, rot: number) =>
  at(x, y, rot, 1, `<path d="M-30 0 Q -30 -22 -6 -22 Q 18 -22 18 0 Q 18 14 4 14 Q -8 14 -8 4" stroke="#e8b878" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M-30 0 Q -30 -22 -6 -22 Q 18 -22 18 0" stroke="#c98a4a" stroke-width="3" fill="none"/>`)
