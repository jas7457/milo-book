import { INK } from '../style'

/* Small SVG fragments shared by the bridge-builder spread (all drawn around their own origin). */

export const FONT = `Fredoka, sans-serif`

/** Catmull-Rom spline through points, as an SVG path. */
export function smooth(pts: number[][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
}

/** origin = base centre of the trunk, ~190 tall at s=1 */
export const pineFrag = (x: number, y: number, s: number, c1 = '#3f9a5a', c2 = '#2f7a46') => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="-34" width="18" height="38" fill="#7a4a24" stroke="${INK}" stroke-width="4"/>
    <path d="M0 -196 L 46 -118 L 28 -118 L 62 -58 L 38 -58 L 76 -6 L -76 -6 L -38 -58 L -62 -58 L -28 -118 L -46 -118 Z" fill="${c1}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M0 -196 L 46 -118 L 28 -118 L 62 -58 L 38 -58 L 76 -6 L 0 -6 Z" fill="${c2}" opacity=".55"/>
    <path d="M-22 -104 L -6 -152 M-34 -46 L -12 -84" stroke="#9bdc92" stroke-width="6" stroke-linecap="round" opacity=".75"/>
  </g>`

/** origin = base centre of the trunk, ~230 tall at s=1 */
export const roundTreeFrag = (x: number, y: number, s: number, c1 = '#5fb35a', c2 = '#46963f', fruit = '') => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-12 4 L -8 -90 L 8 -90 L 12 4 Z" fill="#8a5a33" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M0 -70 L 30 -104" stroke="#8a5a33" stroke-width="9" stroke-linecap="round"/>
    ${[[0, -150, 70], [-52, -118, 46], [54, -122, 48], [-22, -190, 46], [28, -180, 44]]
      .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" stroke="${INK}" stroke-width="5"/>`)
      .join('')}
    <path d="M-60 -100 Q 0 -60 60 -102 Q 40 -70 0 -66 Q -40 -68 -60 -100 Z" fill="${c2}" opacity=".6"/>
    <circle cx="-16" cy="-168" r="20" fill="#fff" opacity=".2"/><circle cx="-54" cy="-128" r="12" fill="#fff" opacity=".2"/>
    ${fruit}
  </g>`

export const apples = [[-30, -150], [26, -126], [-60, -112], [10, -190], [58, -156]]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#e8322b" stroke="${INK}" stroke-width="3"/><circle cx="${x - 3}" cy="${y - 3}" r="2.5" fill="#fff" opacity=".8"/>`)
  .join('')

/** a clump of reeds with cattails; origin at the base */
export const reedFrag = (x: number, y: number, s: number, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    ${[[-28, -170, -10], [-12, -230, -4], [6, -200, 6], [24, -160, 14], [-40, -120, -18], [36, -110, 20]]
      .map(([dx, h, bend], i) => {
        const c = i % 2 ? '#3f9a4a' : '#4fae52'
        return `<path d="M${dx * 0.4} 0 Q ${dx * 0.4 + bend * 0.2} ${h * 0.55} ${dx + bend} ${h}" stroke="${INK}" stroke-width="13" fill="none" stroke-linecap="round"/>
        <path d="M${dx * 0.4} 0 Q ${dx * 0.4 + bend * 0.2} ${h * 0.55} ${dx + bend} ${h}" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      })
      .join('')}
    ${[[-12 - 4, -230], [6 + 6, -200]]
      .map(([cx, cy]) => `<rect x="${cx - 8}" y="${cy - 40}" width="16" height="48" rx="8" fill="#8a5a33" stroke="${INK}" stroke-width="4"/><path d="M${cx - 3} ${cy - 30} L ${cx - 3} ${cy}" stroke="#b98a5a" stroke-width="3"/>`)
      .join('')}
  </g>`

/** little round grass tuft */
export const tuft = (x: number, y: number, s = 1, c = '#5aa64a') =>
  `<path d="M${x} ${y} l ${-7 * s} ${-22 * s} m ${7 * s} ${22 * s} l ${2 * s} ${-26 * s} m ${-2 * s} ${26 * s} l ${10 * s} ${-18 * s}" stroke="${c}" stroke-width="${5 * s}" stroke-linecap="round" fill="none"/>`

export const daisy = (x: number, y: number, s = 1, petal = '#ffffff', centre = '#ffd34d') => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 L 0 26" stroke="#3f9a4a" stroke-width="4" stroke-linecap="round"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="0" cy="-11" rx="5.5" ry="10" fill="${petal}" stroke="#b7a" stroke-opacity=".25" stroke-width="1" transform="rotate(${(i / 7) * 360})"/>`).join('')}
    <circle r="6" fill="${centre}" stroke="#d9a400" stroke-width="1.5"/>
  </g>`

export const stone = (x: number, y: number, rx: number, ry: number, c = '#b9bec6') => `
  <g><ellipse cx="${x}" cy="${y + ry * 0.25}" rx="${rx * 1.05}" ry="${ry}" fill="#000" opacity=".18"/>
  <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="${x - rx * 0.28}" cy="${y - ry * 0.36}" rx="${rx * 0.42}" ry="${ry * 0.3}" fill="#fff" opacity=".4"/></g>`

export const fishFrag = (x: number, y: number, rot: number, c: string, s = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-48 0 Q -12 -28 34 -8 L 64 -26 L 58 0 L 64 26 L 34 8 Q -12 28 -48 0 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-34 8 Q 0 24 30 6 Q 0 14 -34 8 Z" fill="#fff" opacity=".65"/>
    <path d="M-6 -20 Q 8 -34 22 -14" fill="${c}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="-28" cy="-5" r="6.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="-30" cy="-5" r="3" fill="${INK}"/>
    <path d="M-12 -16 Q -8 0 -12 16" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".5"/>
  </g>`

export const lilyPad = (x: number, y: number, r: number, flower = false) => `
  <g transform="translate(${x} ${y}) rotate(${(x * 7) % 360})">
    <ellipse cx="3" cy="6" rx="${r}" ry="${r * 0.9}" fill="#1d6a9a" opacity=".35"/>
    <path d="M0 0 L ${r * 0.95} ${-r * 0.2} A ${r} ${r} 0 1 1 ${r * 0.2} ${-r * 0.95} Z" fill="#53bb4f" stroke="#2c7a36" stroke-width="4" stroke-linejoin="round"/>
    <path d="M0 0 L ${-r * 0.6} ${-r * 0.5} M0 0 L ${-r * 0.7} ${r * 0.3} M0 0 L ${-r * 0.1} ${r * 0.8}" stroke="#8be07a" stroke-width="3" stroke-linecap="round"/>
    ${flower ? `<g transform="translate(${-r * 0.3} ${r * 0.1})">${Array.from({ length: 6 }, (_, i) => `<ellipse cx="0" cy="-12" rx="7" ry="13" fill="#ff9ec4" stroke="#d9507e" stroke-width="2" transform="rotate(${i * 60})"/>`).join('')}<circle r="7" fill="#ffd34d"/></g>` : ''}
  </g>`

/** a rippled water arc */
export const ripple = (x: number, y: number, w = 60, c = '#ffffff', o = 0.6) =>
  `<path d="M${x} ${y} q ${w * 0.25} ${-w * 0.2} ${w * 0.5} 0 q ${w * 0.25} ${w * 0.2} ${w * 0.5} 0" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${o}"/>`

/** a toy cube seen slightly from above, origin top-left of the front face */
export const cube = (x: number, y: number, s: number, c: string, sh: string, top: string, mark = '') => {
  const d = s * 0.24
  return `<g transform="translate(${x} ${y})">
    <path d="M0 0 L ${d} ${-d} L ${s + d} ${-d} L ${s} 0 Z" fill="${top}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${s} 0 L ${s + d} ${-d} L ${s + d} ${s - d} L ${s} ${s} Z" fill="${sh}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="0" y="0" width="${s}" height="${s}" rx="5" fill="${c}" stroke="${INK}" stroke-width="5"/>
    <path d="M${s * 0.1} ${s * 0.1} L ${s * 0.5} ${s * 0.1}" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".45"/>
    ${mark}
  </g>`
}

export const hardHatSmall = (x: number, y: number, s = 1, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-34 8 Q -34 -34 0 -36 Q 34 -34 34 8 Z" fill="#ffc21a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-5 -36 L -5 8 M5 -36 L 5 8" stroke="#e0a400" stroke-width="5"/>
    <path d="M-46 8 L 46 8 Q 49 18 38 19 L -38 19 Q -49 18 -46 8 Z" fill="#ffc21a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-22 -22 Q -16 -30 -6 -32" stroke="#fff3b0" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>`

/** traffic cone, base-centre origin, 90 tall at s=1 */
export const cone = (x: number, y: number, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-34" y="-8" width="68" height="14" rx="4" fill="#d9531e" stroke="${INK}" stroke-width="4"/>
    <path d="M-24 -8 L -9 -86 L 9 -86 L 24 -8 Z" fill="#ff7a2e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-17 -40 L 17 -40 L 14 -56 L -14 -56 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-14 -76 L -10 -86 L 10 -86 L 8 -76" fill="#e8601f"/>
  </g>`
