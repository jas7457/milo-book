import { svgDoc } from './texture'
import { INK, rand } from './style'
import { starPath } from './kit'
import { headParts, eyesParts } from '../milo/art'

/*
 * Painted art for spread 5, "Fire rescue!": the street, the town, the fire
 * station, the bakery, the little oven shed and the baker. (The big red fire
 * truck, the nozzle and the small parts live in fireArt2.ts.)
 */

export const FONT = `'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif`
export const MARKER = `'Marker Felt', 'Chalkboard SE', 'Comic Sans MS', sans-serif`

export const GLASS = `<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dff5ff"/><stop offset="1" stop-color="#8cc4e6"/></linearGradient>`

/** A brick wall pattern: use as fill="url(#id)". */
export const brickPat = (id: string, c: string, mortar: string, bw = 56, bh = 26) =>
  `<pattern id="${id}" width="${bw}" height="${bh * 2}" patternUnits="userSpaceOnUse">
    <rect width="${bw}" height="${bh * 2}" fill="${c}"/>
    <rect x="3" y="3" width="${bw / 2 - 6}" height="${bh - 6}" fill="#fff" opacity=".08"/>
    <rect x="${bw / 2 + 3}" y="${bh + 3}" width="${bw / 2 - 6}" height="${bh - 6}" fill="#000" opacity=".06"/>
    <path d="M0 0H${bw}M0 ${bh}H${bw}M0 ${bh * 2}H${bw}M${bw / 2} 0V${bh}M0 ${bh}V${bh * 2}M${bw} ${bh}V${bh * 2}" stroke="${mortar}" stroke-width="3"/>
  </pattern>`

/** A tiled roof pattern. */
export const tilePat = (id: string, c: string, line: string) =>
  `<pattern id="${id}" width="44" height="30" patternUnits="userSpaceOnUse">
    <rect width="44" height="30" fill="${c}"/>
    <path d="M0 29 Q 11 12 22 29 Q 33 12 44 29" stroke="${line}" stroke-width="3.5" fill="none"/>
    <path d="M0 14 Q 11 -3 22 14 Q 33 -3 44 14" stroke="${line}" stroke-width="3.5" fill="none" opacity=".6"/>
  </pattern>`

/** A window with frame, sill, glass reflection and (optionally) curtains/flowers/shutters. */
export function win(x: number, y: number, w: number, h: number, o: { frame?: string; flower?: boolean; shutter?: string; curtain?: string; arch?: boolean; light?: boolean } = {}) {
  const fr = o.frame ?? '#fbf6ea'
  const glass = o.light ? '#ffe9a0' : 'url(#glass)'
  const body = o.arch
    ? `M${x} ${y + h} L ${x} ${y + w / 2} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z`
    : `M${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`
  return `
    ${o.shutter ? `<rect x="${x - w * 0.34}" y="${y}" width="${w * 0.3}" height="${h}" fill="${o.shutter}" stroke="${INK}" stroke-width="4"/><rect x="${x + w * 1.04}" y="${y}" width="${w * 0.3}" height="${h}" fill="${o.shutter}" stroke="${INK}" stroke-width="4"/>
      ${[0.2, 0.4, 0.6, 0.8].map((k) => `<path d="M${x - w * 0.31} ${y + h * k} h ${w * 0.24} M${x + w * 1.07} ${y + h * k} h ${w * 0.24}" stroke="${INK}" stroke-width="2.5" opacity=".5"/>`).join('')}` : ''}
    <path d="${body}" fill="${glass}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    ${o.curtain ? `<path d="M${x + 3} ${y + 3} L ${x + w * 0.3} ${y + 3} Q ${x + w * 0.2} ${y + h * 0.5} ${x + w * 0.32} ${y + h * 0.8} L ${x + 3} ${y + h * 0.8} Z M${x + w - 3} ${y + 3} L ${x + w * 0.7} ${y + 3} Q ${x + w * 0.8} ${y + h * 0.5} ${x + w * 0.68} ${y + h * 0.8} L ${x + w - 3} ${y + h * 0.8} Z" fill="${o.curtain}" opacity=".9"/>` : ''}
    <path d="M${x + w / 2} ${y} V ${y + h} M${x} ${y + h * 0.5} H ${x + w}" stroke="${fr}" stroke-width="6"/>
    <path d="M${x + w * 0.14} ${y + h * 0.3} L ${x + w * 0.32} ${y + h * 0.08}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <rect x="${x - 8}" y="${y + h}" width="${w + 16}" height="12" rx="3" fill="${fr}" stroke="${INK}" stroke-width="4"/>
    ${o.flower ? `<rect x="${x - 4}" y="${y + h - 4}" width="${w + 8}" height="20" rx="3" fill="#a8683a" stroke="${INK}" stroke-width="4"/>
      ${[0.12, 0.3, 0.5, 0.7, 0.88].map((k, i) => `<circle cx="${x + w * k}" cy="${y + h - 10}" r="${9 + (i % 2) * 2}" fill="${['#ff6b8a', '#ffd34d', '#ff9a4a', '#ff6b8a', '#fff'][i]}" stroke="${INK}" stroke-width="2.5"/><path d="M${x + w * k} ${y + h - 2} v 8" stroke="#3f9a45" stroke-width="3"/>`).join('')}
      <path d="M${x + 2} ${y + h - 2} q ${w * 0.25} -14 ${w * 0.5} -2 q ${w * 0.25} -12 ${w * 0.5} 0" stroke="#4f9d4a" stroke-width="5" fill="none"/>` : ''}`
}

export function door(x: number, y: number, w: number, h: number, c: string, knob = '#f4c542') {
  return `<path d="M${x} ${y + h} L ${x} ${y + w / 2} Q ${x} ${y} ${x + w / 2} ${y} Q ${x + w} ${y} ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z" fill="${c}" stroke="${INK}" stroke-width="5"/>
    <path d="M${x + 10} ${y + h - 6} L ${x + 10} ${y + w / 2 + 2} Q ${x + 10} ${y + 12} ${x + w / 2} ${y + 12} Q ${x + w - 10} ${y + 12} ${x + w - 10} ${y + w / 2 + 2} L ${x + w - 10} ${y + h - 6}" stroke="#000" stroke-width="3" fill="none" opacity=".18"/>
    <circle cx="${x + w - 14}" cy="${y + h * 0.58}" r="5.5" fill="${knob}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="${x - 8}" y="${y + h}" width="${w + 16}" height="12" fill="#c9c2b4" stroke="${INK}" stroke-width="4"/>`
}

/* ============================================================ the street == */

function cobbles(x0: number, y0: number, w: number, h: number, seed: number) {
  const r = rand(seed)
  const cols = ['#a6a09a', '#9a948f', '#b3ada4', '#8f8a86', '#a9a198']
  let out = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#7d7873"/>`
  const rows = Math.round(h / 34)
  for (let row = 0; row < rows; row++) {
    for (let x = x0 - (row % 2) * 24; x < x0 + w; x += 48) {
      const c = cols[Math.floor(r() * cols.length)]
      out += `<rect x="${(x + 2).toFixed(0)}" y="${y0 + row * 34 + 2}" width="44" height="30" rx="13" fill="${c}" stroke="#5f5a56" stroke-width="2.5"/>`
      out += `<path d="M${(x + 10).toFixed(0)} ${y0 + row * 34 + 11} q 10 -6 20 -1" stroke="#fff" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`
    }
  }
  return out
}

function chalk(d: string, c = '#fffdf6', w = 9) {
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`
}

export const fireSpreadArt = (() => {
  const r = rand(11)
  let slabs = ''
  for (let row = 0; row < 4; row++)
    for (let c = 0; c < 17; c++) {
      const x = c * 160 - (row % 2) * 80
      slabs += `<rect x="${x}" y="${row * 84}" width="158" height="82" fill="${['#dcd0bb', '#d6c9b2', '#e1d6c2'][Math.floor(r() * 3)]}" stroke="#bfb199" stroke-width="3"/>`
    }
  let nearSlabs = ''
  for (let row = 0; row < 4; row++)
    for (let c = 0; c < 17; c++) {
      const x = c * 160 - (row % 2) * 80
      nearSlabs += `<rect x="${x}" y="${1500 + row * 66}" width="158" height="64" fill="${['#ddd1bc', '#d7caB3', '#e2d7c3'][Math.floor(r() * 3)]}" stroke="#c2b49c" stroke-width="3"/>`
    }
  const speck = Array.from({ length: 420 }, () => `<circle cx="${(r() * 2560).toFixed(0)}" cy="${(480 + r() * 860).toFixed(0)}" r="${(1.5 + r() * 3).toFixed(1)}" fill="${r() < 0.5 ? '#8c91a0' : '#636878'}" opacity=".55"/>`).join('')
  const hose = (d: string) => `
    <path d="${d}" stroke="${INK}" stroke-width="44" fill="none" stroke-linecap="round" opacity=".22" transform="translate(8 10)"/>
    <path d="${d}" stroke="${INK}" stroke-width="42" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="#f0bc3c" stroke-width="32" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="#c98f1c" stroke-width="32" fill="none" stroke-linecap="round" stroke-dasharray="3 26" opacity=".7"/>
    <path d="${d}" stroke="#fff3b0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6" transform="translate(-5 -7)"/>`
  const puddle = (x: number, y: number, rx: number, ry: number, rot = 0) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <ellipse rx="${rx + 8}" ry="${ry + 6}" fill="#4f5566" opacity=".5"/>
      <path d="M${-rx} 0 C ${-rx} ${-ry * 1.1} ${-rx * 0.3} ${-ry * 1.2} ${rx * 0.2} ${-ry} C ${rx * 0.9} ${-ry * 1.1} ${rx} ${-ry * 0.2} ${rx} ${ry * 0.1} C ${rx} ${ry} ${rx * 0.3} ${ry * 1.1} ${-rx * 0.2} ${ry} C ${-rx * 0.8} ${ry * 1.1} ${-rx} ${ry * 0.6} ${-rx} 0 Z" fill="#9ccaea" stroke="#5e89b0" stroke-width="5"/>
      <path d="M${-rx * 0.6} ${-ry * 0.3} Q ${-rx * 0.2} ${-ry * 0.7} ${rx * 0.25} ${-ry * 0.55}" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="${rx * 0.3}" cy="${ry * 0.2}" rx="${rx * 0.28}" ry="${ry * 0.2}" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
    </g>`
  const manhole = (x: number, y: number) => `
    <ellipse cx="${x + 4}" cy="${y + 8}" rx="74" ry="62" fill="#000" opacity=".18"/>
    <circle cx="${x}" cy="${y}" r="64" fill="#5d6272" stroke="${INK}" stroke-width="5"/>
    <circle cx="${x}" cy="${y}" r="50" fill="none" stroke="#434858" stroke-width="5"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${x - 40} ${y - 40 + i * 11} H ${x + 40}" stroke="#434858" stroke-width="4" opacity=".8"/>`).join('')}
    <path d="M${x - 40} ${y - 56} Q ${x} ${y - 66} ${x + 40} ${y - 56}" stroke="#8b91a3" stroke-width="5" fill="none" opacity=".6"/>`
  const cone = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="30" ry="16" fill="#e8662a" opacity=".5"/>`
  void cone
  return svgDoc(
    2560,
    1760,
    `${GLASS}
     <!-- far pavement -->
     <rect width="2560" height="340" fill="#d9ccb6"/>
     ${slabs}
     <rect y="326" width="2560" height="50" fill="#cfd2d8" stroke="${INK}" stroke-width="5"/>
     <rect y="326" width="2560" height="14" fill="#eef0f4"/>
     ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 190 + 40} 340 v 30" stroke="#a5a9b3" stroke-width="3"/>`).join('')}
     <!-- the road -->
     <rect y="376" width="2560" height="1080" fill="#747a8a"/>
     ${speck}
     ${cobbles(0, 376, 2560, 102, 3)}
     ${cobbles(0, 1354, 2560, 102, 8)}
     <path d="M0 482 H 2560" stroke="#f4f4ee" stroke-width="9" opacity=".85"/>
     <path d="M0 1350 H 2560" stroke="#f4f4ee" stroke-width="9" opacity=".85"/>
     <!-- centre lane dashes -->
     ${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 200 + 30}" y="900" width="120" height="15" rx="6" fill="#f3c93a" stroke="#c89c18" stroke-width="2.5"/>`).join('')}
     <!-- a zebra crossing -->
     ${Array.from({ length: 10 }, (_, i) => `<rect x="2110" y="${520 + i * 84}" width="330" height="52" rx="8" fill="#f6f4ee" opacity=".92"/>`).join('')}
     <!-- the fire-station apron -->
     <g>
       <rect x="20" y="492" width="470" height="150" rx="14" fill="#c9382c" stroke="${INK}" stroke-width="6"/>
       <rect x="34" y="506" width="442" height="122" rx="8" fill="none" stroke="#fff3d6" stroke-width="6" stroke-dasharray="26 16"/>
       <text x="255" y="566" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="54" fill="#fff6e0" stroke="${INK}" stroke-width="3" paint-order="stroke" letter-spacing="3">FIRE STATION</text>
       <g transform="translate(255 604)"><rect x="-170" y="-30" width="340" height="46" rx="10" fill="#ffd21a" stroke="${INK}" stroke-width="4"/>
         <text x="0" y="4" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="28" fill="${INK}" letter-spacing="2">No. 5 · KEEP CLEAR</text></g>
     </g>
     <!-- tyre tracks coming out of the station -->
     <g stroke="#4c5262" stroke-width="22" fill="none" opacity=".45" stroke-linecap="round">
       <path d="M110 720 C 300 780 460 800 760 860"/><path d="M110 820 C 300 880 460 900 760 960"/>
     </g>
     <g stroke="#3a3f4d" stroke-width="22" fill="none" opacity=".28" stroke-dasharray="3 14">
       <path d="M110 720 C 300 780 460 800 760 860"/><path d="M110 820 C 300 880 460 900 760 960"/>
     </g>
     <!-- manholes + puddles -->
     ${manhole(1500, 1010)}${manhole(560, 1230)}
     ${puddle(1120, 1230, 130, 54, -6)}${puddle(2020, 1100, 160, 62, 8)}${puddle(1640, 1390, 110, 36, 0)}${puddle(300, 1300, 90, 34, 4)}${puddle(860, 600, 70, 26, -10)}
     <!-- hoses on the road -->
     ${hose('M150 960 C 100 880 260 840 340 900 C 440 980 560 940 600 1030 C 640 1120 760 1110 840 1070')}
     <g transform="translate(300 1060)">
       ${[78, 54, 30].map((rr) => `<circle r="${rr}" fill="none" stroke="${INK}" stroke-width="42"/>`).join('')}
       ${[78, 54, 30].map((rr) => `<circle r="${rr}" fill="none" stroke="#f0bc3c" stroke-width="32"/>`).join('')}
       ${[78, 54, 30].map((rr) => `<circle r="${rr}" fill="none" stroke="#fff3b0" stroke-width="6" stroke-dasharray="${rr * 1.4} ${rr * 5}" opacity=".6"/>`).join('')}
       <circle r="10" fill="#c98f1c" stroke="${INK}" stroke-width="4"/>
     </g>
     ${[[150, 960], [840, 1070]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#d9a02a" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="10" fill="#7a5410" stroke="${INK}" stroke-width="3"/>`).join('')}
     <!-- a hydrant plate on the kerb -->
     <g transform="translate(2290 420)"><rect x="-50" y="-30" width="100" height="56" rx="10" fill="#ffd21a" stroke="${INK}" stroke-width="5"/><text x="0" y="14" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="40" fill="#c9382c">HYD</text></g>
     <!-- near kerb + pavement with chalk -->
     <rect y="1452" width="2560" height="50" fill="#cfd2d8" stroke="${INK}" stroke-width="5"/>
     <rect y="1452" width="2560" height="14" fill="#eef0f4"/>
     <rect y="1500" width="2560" height="260" fill="#d9ccb6"/>
     ${nearSlabs}
     <!-- chalk drawings on the pavement -->
     ${chalk('M1420 1700 L 1420 1600 L 1700 1600 L 1700 1700 M1700 1600 L 1760 1600 L 1790 1650 L 1790 1700 L 1700 1700 M1420 1700 L 1790 1700', '#fffdf6', 8)}
     ${chalk('M1450 1585 L 1650 1585 M1450 1570 L 1650 1570', '#ffe27a', 7)}
     <circle cx="1490" cy="1710" r="26" fill="none" stroke="#fffdf6" stroke-width="8" opacity=".88"/><circle cx="1670" cy="1710" r="26" fill="none" stroke="#fffdf6" stroke-width="8" opacity=".88"/><circle cx="1770" cy="1710" r="20" fill="none" stroke="#fffdf6" stroke-width="8" opacity=".88"/>
     ${chalk('M1470 1620 h 60 v 40 h -60 z M1560 1620 h 60 v 40 h -60 z', '#9fd4ff', 6)}
     <g transform="translate(1520 1535)">${chalk('M0 0 m -34 0 a 34 34 0 0 1 68 0', '#ffd34d', 8)}${[-40, -20, 0, 20, 40].map((a) => chalk(`M${Math.sin((a * Math.PI) / 90) * 46} ${-Math.cos((a * Math.PI) / 90) * 46} L ${Math.sin((a * Math.PI) / 90) * 66} ${-Math.cos((a * Math.PI) / 90) * 66}`, '#ffd34d', 6)).join('')}</g>
     <!-- hopscotch -->
     <g transform="translate(2050 1510)">
       ${[[0, 150, 1], [0, 90, 2], [-60, 30, 3], [60, 30, 4], [0, -30, 5], [-60, -90, 6], [60, -90, 7], [0, -150, 8]].map(([x, y, n]) => `<rect x="${(x as number) - 28}" y="${(y as number) + 28}" width="56" height="56" fill="none" stroke="#ffb8d4" stroke-width="6" opacity=".9"/><text x="${x}" y="${(y as number) + 66}" text-anchor="middle" font-family="${MARKER}" font-size="30" fill="#fff" opacity=".9">${n}</text>`).join('')}
     </g>
     <text x="2290" y="1650" text-anchor="middle" font-family="${MARKER}" font-size="64" fill="#fffdf6" opacity=".85" transform="rotate(-6 2290 1650)">MILO</text>
     ${chalk('M2210 1685 q 80 20 160 -6', '#ff9ec4', 7)}
     <!-- a chalk rainbow, a hint of what is coming -->
     <g transform="translate(1130 1706)" opacity=".92">${['#ff7a7a', '#ffc15e', '#ffe97a', '#8ddc8a', '#7ab8ff'].map((c, i) => chalk(`M${-90 + i * 14} 0 a ${90 - i * 14} ${90 - i * 14} 0 0 1 ${(90 - i * 14) * 2} 0`, c, 8)).join('')}</g>
     ${[[260, 1620], [460, 1700], [760, 1650], [980, 1560]].map(([x, y], i) => `<path d="${starPath(x, y, 18, 8, 5, i)}" fill="none" stroke="#ffe27a" stroke-width="5" stroke-linejoin="round" opacity=".5"/>`).join('')}
     <!-- a few autumn leaves -->
     ${Array.from({ length: 16 }, () => `<path d="M0 0 q 10 -14 22 0 q -10 14 -22 0 z" transform="translate(${(r() * 2400).toFixed(0)} ${(1500 + r() * 240).toFixed(0)}) rotate(${(r() * 360).toFixed(0)})" fill="${['#e8a23a', '#d9582b', '#f2c542'][Math.floor(r() * 3)]}" opacity=".8"/>`).join('')}`,
  )
})()

/* ============================================================ the town == */

export type Bldg = { x: number; w: number; h: number; wall: string; roof: string; kind: 'house' | 'shop' | 'flat'; sign?: string; seed: number }

export function building(b: Bldg, H: number) {
  const r = rand(b.seed)
  const top = H - b.h
  const { x, w } = b
  let s = ''
  const shade = `<rect x="${x + w * 0.78}" y="${top}" width="${w * 0.22}" height="${b.h}" fill="#000" opacity=".08"/><rect x="${x}" y="${top}" width="${w * 0.07}" height="${b.h}" fill="#fff" opacity=".22"/>`
  // roof first (behind the wall top)
  if (b.kind === 'house') {
    const ph = 100 + r() * 30
    s += `<path d="M${x - 14} ${top + 4} L ${x + w / 2} ${top - ph} L ${x + w + 14} ${top + 4} Z" fill="url(#roofp${b.seed})" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M${x - 14} ${top + 4} L ${x + w / 2} ${top - ph} L ${x + w / 2} ${top + 4} Z" fill="#fff" opacity=".12"/>
      <rect x="${x + w * 0.7}" y="${top - ph * 0.7}" width="38" height="${ph * 0.7 + 6}" fill="url(#chim)" stroke="${INK}" stroke-width="5"/><rect x="${x + w * 0.7 - 6}" y="${top - ph * 0.7 - 12}" width="50" height="16" rx="3" fill="#c9c2b4" stroke="${INK}" stroke-width="4"/>`
  } else if (b.kind === 'shop') {
    s += `<rect x="${x - 8}" y="${top - 26}" width="${w + 16}" height="34" rx="4" fill="${b.roof}" stroke="${INK}" stroke-width="5"/>
      ${[0.2, 0.5, 0.8].map((k) => `<path d="M${x + w * k} ${top - 22} v 24" stroke="#000" opacity=".15" stroke-width="3"/>`).join('')}`
  } else {
    s += `<rect x="${x - 8}" y="${top - 30}" width="${w + 16}" height="40" rx="3" fill="#efe6d4" stroke="${INK}" stroke-width="5"/><rect x="${x + w * 0.62}" y="${top - 74}" width="40" height="50" fill="url(#chim)" stroke="${INK}" stroke-width="5"/><rect x="${x + w * 0.62 - 6}" y="${top - 86}" width="52" height="16" rx="3" fill="#c9c2b4" stroke="${INK}" stroke-width="4"/>`
  }
  s += `<rect x="${x}" y="${top}" width="${w}" height="${b.h}" fill="${b.wall}" stroke="${INK}" stroke-width="6"/>${shade}`
  s += `<rect x="${x}" y="${H - 46}" width="${w}" height="46" fill="#000" opacity=".12"/><path d="M${x} ${H - 46} H ${x + w}" stroke="${INK}" stroke-width="3" opacity=".5"/>`
  // windows
  const floors = Math.max(1, Math.floor((b.h - (b.kind === 'shop' ? 220 : 170)) / 150))
  const cols = w > 280 ? 3 : w > 200 ? 2 : 1
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const ww = 52
      const wx = x + (w / cols) * (c + 0.5) - ww / 2
      const wy = top + 44 + f * 150
      s += win(wx, wy, ww, 82, { shutter: r() < 0.4 ? ['#4f8fd8', '#3f9a5a', '#e8572b'][Math.floor(r() * 3)] : undefined, flower: r() < 0.55, curtain: r() < 0.5 ? ['#f26a8a', '#ffd34d', '#8a6cd8'][Math.floor(r() * 3)] : undefined, light: r() < 0.12 })
    }
  }
  if (b.kind === 'shop') {
    const sy = H - 230
    s += `<rect x="${x + 14}" y="${sy}" width="${w - 28}" height="150" fill="url(#glass)" stroke="${INK}" stroke-width="5"/>
      <path d="M${x + 14 + (w - 28) / 2} ${sy} v 150" stroke="#fbf6ea" stroke-width="6"/>
      <path d="M${x + 30} ${sy + 20} l 40 -4" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
      <path d="M${x - 4} ${sy - 14} h ${w + 8} v 36 q ${-(w + 8) / 12} 20 ${-(w + 8) / 6} 0 ${Array.from({ length: 5 }, () => `q ${-(w + 8) / 12} 20 ${-(w + 8) / 6} 0`).join(' ')} z" fill="#e8322b" stroke="${INK}" stroke-width="5"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${x - 4 + (i * (w + 8)) / 6 + (w + 8) / 12} ${sy - 12} v 34" stroke="#fff" stroke-width="${(w + 8) / 12}" opacity=".9"/>`).join('')}
      <rect x="${x + 20}" y="${sy - 62}" width="${w - 40}" height="40" rx="8" fill="#fff6e0" stroke="${INK}" stroke-width="5"/>
      <text x="${x + w / 2}" y="${sy - 32}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="28" fill="#b8221c" letter-spacing="3">${b.sign}</text>
      ${door(x + w - 74, H - 160, 52, 114, '#9a5a2c')}`
  } else {
    s += door(x + w / 2 - 28, H - 160, 56, 114, ['#d9472b', '#3a6fd8', '#2f9a4a', '#8a6cd8'][b.seed % 4])
    s += `<circle cx="${x + w / 2 + 52}" cy="${H - 150}" r="15" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="${x + w / 2 + 52}" y="${H - 144}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="18" fill="${INK}">${b.seed % 17 + 3}</text>`
  }
  return s
}

export const townRow = (() => {
  const W = 2480
  const H = 880
  const list: Bldg[] = [
    { x: 14, w: 270, h: 500, wall: '#f2c9a0', roof: '#c4553b', kind: 'house', seed: 3 },
    { x: 284, w: 250, h: 600, wall: '#9fd0c3', roof: '#e8572b', kind: 'shop', sign: 'TOYS', seed: 4 },
    { x: 534, w: 300, h: 470, wall: '#f6e08a', roof: '#3a6fd8', kind: 'house', seed: 5 },
    { x: 834, w: 240, h: 650, wall: '#f2a7b0', roof: '#c4553b', kind: 'flat', seed: 6 },
    { x: 1410, w: 250, h: 590, wall: '#b7c9f0', roof: '#2f9a4a', kind: 'shop', sign: 'BOOKS', seed: 7 },
    { x: 1660, w: 300, h: 480, wall: '#f4b98f', roof: '#8a6cd8', kind: 'house', seed: 8 },
    { x: 1960, w: 260, h: 640, wall: '#c9e3a0', roof: '#e8572b', kind: 'shop', sign: 'CAFE', seed: 9 },
    { x: 2220, w: 246, h: 520, wall: '#f3d0e0', roof: '#4f8fd8', kind: 'house', seed: 10 },
  ]
  const roofs = list.map((b) => tilePat(`roofp${b.seed}`, b.roof, '#00000033')).join('')
  // the clock tower on the fold
  const tx = 1074
  const tw = 334
  const tower = `
    <rect x="${tx}" y="170" width="${tw}" height="${H - 170}" fill="url(#stone)" stroke="${INK}" stroke-width="6"/>
    <rect x="${tx + tw * 0.78}" y="170" width="${tw * 0.22}" height="${H - 170}" fill="#000" opacity=".08"/>
    <path d="M${tx - 20} 176 L ${tx + tw / 2} 20 L ${tx + tw + 20} 176 Z" fill="#3a8f9a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${tx - 20} 176 L ${tx + tw / 2} 20 L ${tx + tw / 2} 176 Z" fill="#fff" opacity=".14"/>
    <path d="M${tx + tw / 2} 20 V -2" stroke="${INK}" stroke-width="5"/>
    <rect x="${tx - 10}" y="170" width="${tw + 20}" height="26" rx="4" fill="#d9ccb0" stroke="${INK}" stroke-width="5"/>
    <!-- clock -->
    <circle cx="${tx + tw / 2}" cy="290" r="82" fill="#fff6e0" stroke="${INK}" stroke-width="7"/>
    <circle cx="${tx + tw / 2}" cy="290" r="68" fill="none" stroke="#d9a02a" stroke-width="5"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${tx + tw / 2 + Math.sin((i * Math.PI) / 6) * 56} ${290 - Math.cos((i * Math.PI) / 6) * 56} L ${tx + tw / 2 + Math.sin((i * Math.PI) / 6) * 66} ${290 - Math.cos((i * Math.PI) / 6) * 66}" stroke="${INK}" stroke-width="${i % 3 ? 4 : 7}" stroke-linecap="round"/>`).join('')}
    <path d="M${tx + tw / 2} 290 L ${tx + tw / 2 + 4} 238 M${tx + tw / 2} 290 L ${tx + tw / 2 + 40} 304" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="${tx + tw / 2}" cy="290" r="9" fill="#e8322b" stroke="${INK}" stroke-width="3"/>
    <!-- belfry + windows -->
    <path d="M${tx + tw / 2 - 40} 520 L ${tx + tw / 2 - 40} 440 Q ${tx + tw / 2} 380 ${tx + tw / 2 + 40} 440 L ${tx + tw / 2 + 40} 520 Z" fill="#2d2330" stroke="${INK}" stroke-width="5"/>
    <path d="M${tx + tw / 2} 410 q -14 4 -14 24 q 14 8 28 0 q 0 -20 -14 -24 z" fill="#f4c542" stroke="${INK}" stroke-width="3"/>
    ${win(tx + 40, 580, 44, 80, { arch: true })}${win(tx + tw - 84, 580, 44, 80, { arch: true })}
    ${door(tx + tw / 2 - 40, H - 170, 80, 124, '#7a4a24')}
    <path d="M${tx + 14} 700 h 306" stroke="#000" opacity=".1" stroke-width="3"/>`
  // bunting between buildings
  const bunt = (x1: number, x2: number, y: number, sag: number) => {
    const n = Math.round((x2 - x1) / 40)
    let d = `<path d="M${x1} ${y} Q ${(x1 + x2) / 2} ${y + sag} ${x2} ${y}" stroke="${INK}" stroke-width="4" fill="none"/>`
    for (let i = 1; i < n; i++) {
      const t = i / n
      const px = x1 + (x2 - x1) * t
      const py = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + sag) + t * t * y
      d += `<path d="M${px - 14} ${py} L ${px + 14} ${py} L ${px} ${py + 30} Z" fill="${['#e8322b', '#ffd34d', '#3a6fd8', '#3ccf5a', '#ff9ec4'][i % 5]}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    }
    return d
  }
  return svgDoc(
    W,
    H,
    `${GLASS}
     <defs>${roofs}${brickPat('chim', '#c4553b', '#8e3322', 38, 18)}${brickPat('stone', '#e6d8b8', '#bfae86', 66, 30)}</defs>
     ${list.map((b) => building(b, H)).join('')}
     ${tower}
     ${bunt(520, 1074, 400, 40)}${bunt(1408, 1960, 420, 44)}${bunt(60, 520, 340, 34)}
     <!-- a little blue flag on the tower -->
     <path d="M${tx + tw / 2} 4 L ${tx + tw / 2 + 60} 18 L ${tx + tw / 2} 36 Z" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    { cut: 5 },
  )
})()

/* ====================================================== fire station ==== */

export const fireStation = (() => {
  const W = 800
  const H = 960
  const wallL = 20
  const wallR = 610
  const top = 380
  const bay = { x: 110, y: 540, w: 360 }
  const bayArch = `M${bay.x} ${H - 30} L ${bay.x} ${bay.y + 70} Q ${bay.x} ${bay.y} ${bay.x + bay.w / 2} ${bay.y} Q ${bay.x + bay.w} ${bay.y} ${bay.x + bay.w} ${bay.y + 70} L ${bay.x + bay.w} ${H - 30} Z`
  return svgDoc(
    W,
    H,
    `${GLASS}
     <defs>${brickPat('br', '#c4553b', '#8e3322', 56, 26)}${brickPat('brd', '#a8442f', '#7a2a1c', 56, 26)}${brickPat('stn', '#e8dcc2', '#bfae86', 60, 28)}
      <linearGradient id="bayg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1824"/><stop offset=".7" stop-color="#4a3a3a"/><stop offset="1" stop-color="#8a6a4a"/></linearGradient>
      <clipPath id="bayc"><path d="${bayArch}"/></clipPath></defs>
     <!-- hose tower -->
     <rect x="610" y="120" width="180" height="${H - 150}" fill="url(#brd)" stroke="${INK}" stroke-width="6"/>
     <rect x="610" y="120" width="40" height="${H - 150}" fill="#fff" opacity=".1"/>
     <rect x="740" y="120" width="50" height="${H - 150}" fill="#000" opacity=".1"/>
     <rect x="596" y="108" width="208" height="30" rx="4" fill="#efe6d4" stroke="${INK}" stroke-width="5"/>
     <path d="M606 108 L 700 24 L 794 108 Z" fill="#7a3f2a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M606 108 L 700 24 L 700 108 Z" fill="#fff" opacity=".12"/>
     <path d="M700 24 V 0" stroke="${INK}" stroke-width="5"/>
     <path d="M700 4 L 754 14 L 700 30 Z" fill="#fff6e0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <circle cx="716" cy="17" r="3.6" fill="${INK}"/><circle cx="730" cy="21" r="3.2" fill="${INK}"/>
     <!-- the belfry arch (bell hangs there) -->
     <path d="M648 300 L 648 220 Q 700 150 752 220 L 752 300 Z" fill="#2d2330" stroke="${INK}" stroke-width="5"/>
     <path d="M648 300 L 648 220 Q 700 150 752 220 L 752 300" stroke="#efe6d4" stroke-width="10" fill="none"/>
     <!-- tower clock -->
     <circle cx="700" cy="400" r="48" fill="#fff6e0" stroke="${INK}" stroke-width="6"/>
     <path d="M700 400 L 700 366 M700 400 L 724 410" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
     ${[0, 3, 6, 9].map((i) => `<circle cx="${700 + Math.sin((i * Math.PI) / 6) * 38}" cy="${400 - Math.cos((i * Math.PI) / 6) * 38}" r="4" fill="${INK}"/>`).join('')}
     ${win(668, 500, 64, 100, { arch: true, frame: '#efe6d4' })}
     ${win(668, 680, 64, 100, { arch: true, frame: '#efe6d4' })}
     <rect x="640" y="${H - 190}" width="120" height="160" fill="#7a4a24" stroke="${INK}" stroke-width="5"/>
     <path d="M700 ${H - 190} v 160 M640 ${H - 110} h 120" stroke="#5a3418" stroke-width="4"/>
     <!-- main block -->
     <rect x="${wallL}" y="${top}" width="${wallR - wallL}" height="${H - top - 30}" fill="url(#br)" stroke="${INK}" stroke-width="6"/>
     <rect x="${wallL}" y="${top}" width="30" height="${H - top - 30}" fill="#fff" opacity=".1"/>
     <rect x="${wallL - 12}" y="${top - 26}" width="${wallR - wallL + 24}" height="34" rx="4" fill="#efe6d4" stroke="${INK}" stroke-width="6"/>
     ${Array.from({ length: 12 }, (_, i) => `<rect x="${wallL + i * 50}" y="${top - 26}" width="16" height="12" fill="#fff" opacity=".6"/>`).join('')}
     <!-- the sign -->
     <rect x="40" y="${top + 16}" width="540" height="92" rx="12" fill="#f8f1de" stroke="${INK}" stroke-width="6"/>
     <rect x="52" y="${top + 28}" width="516" height="68" rx="8" fill="none" stroke="#c9382c" stroke-width="4"/>
     <text x="250" y="${top + 82}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="52" fill="#c9382c" letter-spacing="2">FIRE STATION</text>
     <circle cx="500" cy="${top + 62}" r="38" fill="#c9382c" stroke="${INK}" stroke-width="5"/>
     <text x="500" y="${top + 78}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="46" fill="#fff6e0">5</text>
     <path d="M474 ${top + 44} q 26 -22 52 0" stroke="#f4c542" stroke-width="4" fill="none"/>
     <!-- the open bay -->
     <path d="${bayArch}" fill="url(#bayg)" stroke="${INK}" stroke-width="8"/>
     <g clip-path="url(#bayc)">
       <!-- inside: coats, boots, the sliding pole, a lamp -->
       <rect x="${bay.x}" y="${H - 120}" width="${bay.w}" height="90" fill="#8a7a6a"/>
       <path d="M${bay.x} ${H - 120} H ${bay.x + bay.w}" stroke="#5a4a3a" stroke-width="5"/>
       <rect x="${bay.x + 250}" y="${bay.y + 60}" width="10" height="${H - bay.y - 150}" fill="#d9a02a" stroke="${INK}" stroke-width="3"/>
       <rect x="${bay.x + 240}" y="${bay.y + 40}" width="30" height="24" rx="4" fill="#d9a02a" stroke="${INK}" stroke-width="3"/>
       ${[0, 1, 2].map((i) => `<g transform="translate(${bay.x + 34 + i * 62} ${bay.y + 160})"><path d="M0 0 L 44 0 L 52 120 L -8 120 Z" fill="#d9a441" stroke="${INK}" stroke-width="3"/><rect x="-4" y="70" width="52" height="12" fill="#f4f06a"/><circle cx="22" cy="-8" r="9" fill="#dd2a1f" stroke="${INK}" stroke-width="3"/></g>`).join('')}
       ${[0, 1].map((i) => `<g transform="translate(${bay.x + 40 + i * 70} ${H - 150})"><path d="M0 0 L 22 0 L 22 54 L 52 60 L 52 80 L 0 80 Z" fill="#333" stroke="${INK}" stroke-width="3"/><rect x="0" y="40" width="22" height="8" fill="#f4f06a"/></g>`).join('')}
       <circle cx="${bay.x + bay.w / 2}" cy="${bay.y + 60}" r="90" fill="#ffd77a" opacity=".22"/>
       <circle cx="${bay.x + bay.w / 2}" cy="${bay.y + 60}" r="50" fill="#ffe9a0" opacity=".25"/>
       <!-- the rolled-up door at the top -->
       <rect x="${bay.x}" y="${bay.y - 4}" width="${bay.w}" height="70" fill="#d9d6cc"/>
       ${Array.from({ length: 5 }, (_, i) => `<path d="M${bay.x} ${bay.y + i * 14} H ${bay.x + bay.w}" stroke="#9a978c" stroke-width="4"/>`).join('')}
       <rect x="${bay.x}" y="${bay.y + 62}" width="${bay.w}" height="12" fill="#8a877c"/>
     </g>
     <path d="${bayArch}" fill="none" stroke="#efe6d4" stroke-width="16" stroke-linejoin="round"/>
     <path d="${bayArch}" fill="none" stroke="${INK}" stroke-width="4"/>
     ${Array.from({ length: 9 }, (_, i) => {
       const a = Math.PI + (i / 8) * Math.PI
       return `<path d="M${bay.x + bay.w / 2 + Math.cos(a) * (bay.w / 2 - 6)} ${bay.y + 70 + Math.sin(a) * 70} l ${Math.cos(a) * 24} ${Math.sin(a) * 24}" stroke="${INK}" stroke-width="3" opacity=".5"/>`
     }).join('')}
     <!-- windows, hose rack, lanterns -->
     ${win(500, top + 140, 60, 90, { frame: '#efe6d4' })}
     ${win(500, top + 290, 60, 90, { frame: '#efe6d4' })}
     <g transform="translate(66 ${top + 190})"><circle r="34" fill="#e8322b" stroke="${INK}" stroke-width="4"/><circle r="20" fill="#f4c542" stroke="${INK}" stroke-width="3"/><circle r="8" fill="#e8322b"/></g>
     <path d="M${bay.x - 22} ${bay.y + 120} v 36 M${bay.x + bay.w + 22} ${bay.y + 120} v 36" stroke="${INK}" stroke-width="3"/>
     ${[bay.x - 22, bay.x + bay.w + 22].map((x) => `<rect x="${x - 12}" y="${bay.y + 70}" width="24" height="50" rx="8" fill="#ffe9a0" stroke="${INK}" stroke-width="4"/><path d="M${x - 8} ${bay.y + 76} v 36" stroke="#fff" stroke-width="4" opacity=".7"/>`).join('')}
     <!-- steps -->
     <rect x="${bay.x - 30}" y="${H - 36}" width="${bay.w + 60}" height="22" fill="#cfc8b8" stroke="${INK}" stroke-width="5"/>
     <rect x="0" y="${H - 18}" width="${W}" height="18" fill="#9a978c" stroke="${INK}" stroke-width="4"/>`,
    { cut: 5 },
  )
})()

/** The belfry bell: a Part that swings. 100×110. */
export const bell = svgDoc(
  100,
  110,
  `<path d="M50 6 V 20" stroke="${INK}" stroke-width="6"/>
   <path d="M18 88 Q 20 40 50 28 Q 80 40 82 88 Q 90 92 92 100 H 8 Q 10 92 18 88 Z" fill="#f4c542" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M30 80 Q 32 52 48 40" stroke="#fff6c8" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
   <circle cx="50" cy="104" r="8" fill="#9a6a10" stroke="${INK}" stroke-width="3"/>`,
)

/* ============================================================ bakery ==== */

export const bakery = (() => {
  const W = 880
  const H = 1000
  const bx = 30
  const bw = 640
  const top = 330
  return svgDoc(
    W,
    H,
    `${GLASS}
     <defs>${brickPat('bk', '#d6704c', '#9a3f27', 50, 24)}${tilePat('bt', '#8a4a3a', '#00000040')}
       <linearGradient id="cake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffd6e4"/></linearGradient></defs>
     <!-- chimney -->
     <rect x="672" y="150" width="108" height="${H - 190}" fill="url(#bk)" stroke="${INK}" stroke-width="6"/>
     <rect x="780" y="150" width="0" height="0"/>
     <rect x="740" y="150" width="40" height="${H - 190}" fill="#000" opacity=".1"/>
     <rect x="660" y="124" width="132" height="34" rx="5" fill="#c9c2b4" stroke="${INK}" stroke-width="6"/>
     <rect x="672" y="130" width="108" height="10" fill="#fff" opacity=".35"/>
     <!-- roof -->
     <path d="M${bx - 24} ${top + 8} L ${bx + bw / 2} 150 L ${bx + bw + 24} ${top + 8} Z" fill="url(#bt)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M${bx - 24} ${top + 8} L ${bx + bw / 2} 150 L ${bx + bw / 2} ${top + 8} Z" fill="#fff" opacity=".12"/>
     <circle cx="${bx + bw / 2}" cy="240" r="40" fill="#fbf6ea" stroke="${INK}" stroke-width="6"/>
     <circle cx="${bx + bw / 2}" cy="240" r="30" fill="url(#glass)" stroke="${INK}" stroke-width="4"/>
     <path d="M${bx + bw / 2} 210 v 60 M${bx + bw / 2 - 30} 240 h 60" stroke="#fbf6ea" stroke-width="5"/>
     <!-- walls -->
     <rect x="${bx}" y="${top}" width="${bw}" height="${H - top - 30}" fill="#f6dcb2" stroke="${INK}" stroke-width="6"/>
     <rect x="${bx}" y="${top}" width="34" height="${H - top - 30}" fill="#fff" opacity=".2"/>
     <rect x="${bx + bw - 70}" y="${top}" width="70" height="${H - top - 30}" fill="#000" opacity=".07"/>
     <rect x="${bx}" y="${H - 190}" width="${bw}" height="160" fill="url(#bk)" stroke="${INK}" stroke-width="5"/>
     <!-- upstairs windows -->
     ${win(70, top + 50, 80, 110, { shutter: '#c9382c', flower: true })}
     ${win(260, top + 50, 80, 110, { shutter: '#c9382c', curtain: '#ff9ec4' })}
     ${win(500, top + 50, 80, 110, { shutter: '#c9382c', flower: true, light: true })}
     <!-- the sign -->
     <path d="M${bx + 40} ${top + 200} v -20 M${bx + bw - 40} ${top + 200} v -20" stroke="${INK}" stroke-width="4"/>
     <rect x="${bx + 30}" y="${top + 196}" width="${bw - 60}" height="96" rx="14" fill="#7a4a24" stroke="${INK}" stroke-width="6"/>
     <rect x="${bx + 42}" y="${top + 208}" width="${bw - 84}" height="72" rx="8" fill="none" stroke="#f4c542" stroke-width="4"/>
     <text x="${bx + bw / 2 + 10}" y="${top + 264}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="64" fill="#fff0c0" letter-spacing="6">BAKERY</text>
     <g transform="translate(${bx + 86} ${top + 244})" fill="#f4c542" stroke="${INK}" stroke-width="3">${[-16, -6, 4, 14].map((o) => `<ellipse cx="${o}" cy="${-Math.abs(o) * 0.3}" rx="6" ry="14" transform="rotate(${o * 2.2})"/>`).join('')}<path d="M0 10 V 36" stroke="#9a6a10" stroke-width="4"/></g>
     <!-- awning -->
     <path d="M${bx - 14} ${top + 300} H ${bx + bw + 14} L ${bx + bw + 4} ${top + 380} H ${bx + 6} Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${bx - 14 + i * 85.5} ${top + 300} h 42.75 l -2.5 80 h -39 z" fill="#e8322b"/>`).join('')}
     <path d="M${bx + 6} ${top + 380} ${Array.from({ length: 8 }, () => `q 40 28 ${(bw - 12) / 8} 0`).join(' ')}" fill="none" stroke="${INK}" stroke-width="6"/>
     ${Array.from({ length: 8 }, (_, i) => `<path d="M${bx + 6 + i * ((bw - 12) / 8)} ${top + 380} q 40 28 ${(bw - 12) / 8} 0 z" fill="${i % 2 ? '#fff' : '#e8322b'}" stroke="${INK}" stroke-width="3"/>`).join('')}
     <!-- shop window with bread -->
     <rect x="${bx + 24}" y="${top + 410}" width="360" height="${H - top - 410 - 190}" fill="url(#glass)" stroke="${INK}" stroke-width="6"/>
     <rect x="${bx + 24}" y="${H - 300}" width="360" height="16" fill="#a8683a" stroke="${INK}" stroke-width="4"/>
     <g transform="translate(${bx + 56} ${H - 316})">
       <ellipse cx="50" cy="-8" rx="46" ry="20" fill="#e0a24a" stroke="${INK}" stroke-width="4"/>
       ${[22, 50, 78].map((o) => `<path d="M${o - 8} -22 q 8 -6 12 6" stroke="#b9772a" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
       <path d="M120 0 q 20 -40 40 -34 q 36 -8 56 34 z" fill="#e8b25a" stroke="${INK}" stroke-width="4"/>
       <path d="M140 -4 q 8 -22 14 -18 M168 -4 q 4 -26 10 -22 M194 -4 q 2 -20 8 -16" stroke="#b9772a" stroke-width="4" fill="none" stroke-linecap="round"/>
       <g transform="translate(238 0)"><rect x="0" y="-44" width="90" height="44" rx="6" fill="url(#cake)" stroke="${INK}" stroke-width="4"/><path d="M0 -34 q 11 14 22 0 q 11 14 22 0 q 11 14 22 0 q 11 14 24 0" fill="#ff7aa8" stroke="${INK}" stroke-width="3"/><circle cx="45" cy="-52" r="8" fill="#e8322b" stroke="${INK}" stroke-width="3"/></g>
     </g>
     <path d="M${bx + 40} ${top + 440} l 70 -8 M${bx + 40} ${top + 466} l 40 -4" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".7"/>
     <!-- door -->
     ${door(bx + 430, top + 420, 150, H - top - 420 - 30 - 8, '#b9772a')}
     <rect x="${bx + 458}" y="${top + 470}" width="94" height="60" fill="url(#glass)" stroke="${INK}" stroke-width="4"/>
     <g transform="translate(${bx + 505} ${top + 560})"><rect x="-44" y="0" width="88" height="40" rx="8" fill="#fff6e0" stroke="${INK}" stroke-width="4"/><text x="0" y="29" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="26" fill="#2f9a4a">OPEN</text></g>
     <!-- lantern + pots -->
     <g transform="translate(${bx + 400} ${top + 400})"><path d="M0 -24 v 24" stroke="${INK}" stroke-width="3"/><rect x="-12" y="0" width="24" height="34" rx="8" fill="#ffe9a0" stroke="${INK}" stroke-width="4"/></g>
     <rect x="0" y="${H - 34}" width="${W}" height="34" fill="#a79f90" stroke="${INK}" stroke-width="5"/>
     <g transform="translate(724 ${H - 34})"><path d="M-40 0 L -30 -60 H 30 L 40 0 Z" fill="#c9692c" stroke="${INK}" stroke-width="5"/>${[-24, 0, 24].map((o, i) => `<circle cx="${o}" cy="${-78 - (i % 2) * 14}" r="19" fill="${['#ff6b8a', '#ffd34d', '#ff9a4a'][i]}" stroke="${INK}" stroke-width="3"/>`).join('')}<path d="M-26 -60 q 26 -30 52 0" stroke="#3f9a45" stroke-width="8" fill="none"/></g>`,
    { cut: 5 },
  )
})()

/** A friendly puff of smoke (paper cut-out). 220×180. */
export const smokePuff = svgDoc(
  220,
  180,
  `<g fill="#a9aab6" stroke="#6f7080" stroke-width="5" stroke-linejoin="round">
     <circle cx="110" cy="96" r="62"/><circle cx="58" cy="116" r="44"/><circle cx="164" cy="118" r="46"/><circle cx="84" cy="62" r="40"/><circle cx="142" cy="66" r="36"/>
   </g>
   <g fill="#c4c5d0">
     <circle cx="110" cy="96" r="52"/><circle cx="58" cy="116" r="34"/><circle cx="164" cy="118" r="36"/><circle cx="84" cy="62" r="30"/><circle cx="142" cy="66" r="26"/>
   </g>
   <path d="M70 60 Q 90 40 116 44" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".6"/>`,
  { cut: 4 },
)

/** A rainbow arch. 1200×600, pivot bottom-centre. */
export const rainbow = (() => {
  const cols = ['#ff5a5a', '#ff9a3c', '#ffd93c', '#5cc96a', '#4aa8ff', '#8a6cd8']
  const cx = 600
  const cy = 560
  return svgDoc(
    1200,
    600,
    `${cols.map((c, i) => `<path d="M${cx - (540 - i * 40)} ${cy} A ${540 - i * 40} ${500 - i * 40} 0 0 1 ${cx + (540 - i * 40)} ${cy}" stroke="${c}" stroke-width="42" fill="none"/>`).join('')}
     <path d="M${cx - 540 + 6} ${cy} A 534 494 0 0 1 ${cx + 540 - 6} ${cy}" stroke="#fff" stroke-width="8" fill="none" opacity=".35" stroke-dasharray="120 80"/>
     ${[[70, 14], [1130, 14]].map(([x]) => `<g transform="translate(${x} 540)"><circle cx="-30" cy="0" r="44" fill="#fff"/><circle cx="14" cy="-14" r="52" fill="#fff"/><circle cx="56" cy="6" r="40" fill="#fff"/><path d="M-70 30 H 90" stroke="#dfeaf6" stroke-width="22" stroke-linecap="round"/></g>`).join('')}`,
    { cut: 5 },
  )
})()

/* ========================================================= oven shed ==== */

export const shed = (() => {
  const W = 560
  const H = 600
  const arch = { x: 150, w: 260 }
  const archD = `M${arch.x} ${H - 40} L ${arch.x} 400 Q ${arch.x} 320 ${arch.x + arch.w / 2} 320 Q ${arch.x + arch.w} 320 ${arch.x + arch.w} 400 L ${arch.x + arch.w} ${H - 40} Z`
  return svgDoc(
    W,
    H,
    `<defs>${brickPat('sb', '#c9603f', '#8e3322', 50, 24)}${tilePat('st', '#6a5a6e', '#00000044')}
      <radialGradient id="glow" cx="50%" cy="85%" r="70%"><stop offset="0" stop-color="#ffb347"/><stop offset=".5" stop-color="#d9562a"/><stop offset="1" stop-color="#3a1a14"/></radialGradient>
      <clipPath id="archc"><path d="${archD}"/></clipPath></defs>
     <!-- chimney on the side -->
     <rect x="420" y="70" width="80" height="260" fill="url(#sb)" stroke="${INK}" stroke-width="6"/>
     <rect x="410" y="52" width="100" height="26" rx="4" fill="#c9c2b4" stroke="${INK}" stroke-width="5"/>
     <!-- roof -->
     <path d="M10 250 L 280 90 L 550 250 Z" fill="url(#st)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M10 250 L 280 90 L 280 250 Z" fill="#fff" opacity=".1"/>
     <path d="M200 160 q 20 -24 50 -22" stroke="#2a2030" stroke-width="10" fill="none" opacity=".25" stroke-linecap="round"/>
     <!-- walls -->
     <rect x="40" y="250" width="480" height="${H - 290}" fill="url(#sb)" stroke="${INK}" stroke-width="6"/>
     <rect x="40" y="250" width="30" height="${H - 290}" fill="#fff" opacity=".1"/>
     <rect x="470" y="250" width="50" height="${H - 290}" fill="#000" opacity=".1"/>
     <path d="M40 250 H 520" stroke="${INK}" stroke-width="3"/>
     <!-- soot above the arch (a gentle smudge) -->
     <path d="M${arch.x + 20} 330 Q ${arch.x + arch.w / 2} 230 ${arch.x + arch.w - 20} 330 Q ${arch.x + arch.w / 2} 280 ${arch.x + 20} 330 Z" fill="#2a1f24" opacity=".28"/>
     <!-- the oven mouth -->
     <path d="${archD}" fill="url(#glow)" stroke="${INK}" stroke-width="8"/>
     <g clip-path="url(#archc)">
       <path d="M${arch.x} ${H - 60} H ${arch.x + arch.w}" stroke="#2a1410" stroke-width="30" opacity=".7"/>
       ${[0, 1, 2].map((i) => `<ellipse cx="${arch.x + 60 + i * 70}" cy="${H - 62}" rx="30" ry="12" fill="#ff8a2a" stroke="#7a2a12" stroke-width="3"/>`).join('')}
     </g>
     ${Array.from({ length: 11 }, (_, i) => {
       const a = Math.PI + (i / 10) * Math.PI
       const cx = arch.x + arch.w / 2
       return `<path d="M${cx + Math.cos(a) * (arch.w / 2)} ${400 + Math.sin(a) * 80} L ${cx + Math.cos(a) * (arch.w / 2 + 34)} ${400 + Math.sin(a) * (80 + 34)}" stroke="${INK}" stroke-width="4"/>`
     }).join('')}
     <path d="M${arch.x - 34} ${H - 40} L ${arch.x - 34} 400 Q ${arch.x - 34} 286 ${arch.x + arch.w / 2} 286 Q ${arch.x + arch.w + 34} 286 ${arch.x + arch.w + 34} 400 L ${arch.x + arch.w + 34} ${H - 40}" fill="none" stroke="#e8dcc2" stroke-width="22"/>
     <path d="M${arch.x - 34} ${H - 40} L ${arch.x - 34} 400 Q ${arch.x - 34} 286 ${arch.x + arch.w / 2} 286 Q ${arch.x + arch.w + 34} 286 ${arch.x + arch.w + 34} 400 L ${arch.x + arch.w + 34} ${H - 40}" fill="none" stroke="${INK}" stroke-width="4"/>
     <!-- plaque -->
     <rect x="${arch.x + arch.w / 2 - 50}" y="258" width="100" height="32" rx="8" fill="#f4c542" stroke="${INK}" stroke-width="4"/>
     <text x="${arch.x + arch.w / 2}" y="282" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="24" fill="${INK}" letter-spacing="3">OVEN</text>
     <!-- logs on the left, flour sacks on the right -->
     <g transform="translate(52 ${H - 40})">
       ${[[0, 0], [38, 0], [76, 0], [19, -34], [57, -34], [38, -68]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-4" y="-40" width="76" height="40" rx="20" fill="#9a6a3a" stroke="${INK}" stroke-width="4" transform="scale(.5 1)"/><ellipse cx="2" cy="-20" rx="15" ry="19" fill="#d9a468" stroke="${INK}" stroke-width="3"/><circle cx="2" cy="-20" r="8" fill="none" stroke="#9a6a3a" stroke-width="2"/></g>`).join('')}
     </g>
     <g transform="translate(450 ${H - 40})">
       <path d="M-30 0 Q -40 -50 -22 -74 Q 0 -86 22 -74 Q 40 -50 30 0 Z" fill="#f2ead8" stroke="${INK}" stroke-width="4"/>
       <path d="M-20 -72 Q 0 -60 20 -72" stroke="${INK}" stroke-width="3" fill="none"/>
       <text x="0" y="-30" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="16" fill="#b9772a">FLOUR</text>
     </g>
     <rect x="0" y="${H - 40}" width="${W}" height="40" fill="#a79f90" stroke="${INK}" stroke-width="5"/>`,
    { cut: 5 },
  )
})()

/** A cartoon flame, friendly and round. 200×300, pivot bottom-centre. */
export const flame = svgDoc(
  200,
  300,
  `<path d="M100 288 C 30 288 10 230 28 180 C 40 148 64 132 62 96 C 90 118 98 142 98 160 C 110 120 112 70 100 14 C 150 52 190 120 184 196 C 182 252 150 288 100 288 Z" fill="#ff7a1a" stroke="#b8381a" stroke-width="7" stroke-linejoin="round"/>
   <path d="M100 280 C 52 280 40 238 52 204 C 62 180 82 170 84 150 C 106 170 104 196 108 210 C 122 186 132 164 130 140 C 156 170 166 206 156 238 C 148 264 128 280 100 280 Z" fill="#ffb52e"/>
   <path d="M100 274 C 74 274 68 248 76 230 C 84 216 96 214 100 198 C 120 214 128 232 122 250 C 118 266 110 274 100 274 Z" fill="#ffe27a"/>
   <path d="M90 258 C 84 250 88 242 96 238 C 104 244 104 254 98 262 Z" fill="#fff8d8"/>
   <path d="M52 170 Q 48 150 64 130" stroke="#ffd9a0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`,
  { cut: 4 },
)

/** A spark of embers. */
export const spark = svgDoc(60, 60, `<path d="${starPath(30, 30, 26, 10, 4, 0.2)}" fill="#ffd34d" stroke="#e8822a" stroke-width="4" stroke-linejoin="round"/>`)

/* ============================================================== baker ==== */

const SKIN = '#f5c9a0'
const SKIN_SH = '#dea078'

export const baker = svgDoc(
  320,
  600,
  `<!-- clogs + trousers -->
   ${[96, 168].map((x) => `<path d="M${x} 410 H ${x + 58} L ${x + 54} 560 H ${x + 4} Z" fill="#6f86c8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M${x + 4} 440 h 52 M${x + 4} 480 h 50 M${x + 4} 520 h 50" stroke="#fff" stroke-width="4" opacity=".4"/>
     <path d="M${x - 8} 556 H ${x + 66} Q ${x + 74} 560 ${x + 74} 582 H ${x - 14} Q ${x - 14} 560 ${x - 8} 556 Z" fill="#b9772a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`).join('')}
   <!-- jacket -->
   <path d="M84 238 Q 160 214 236 238 L 252 430 Q 160 452 68 430 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M160 234 V 440" stroke="#d9d2c0" stroke-width="5"/>
   ${[270, 320, 370].map((y) => `<circle cx="136" cy="${y}" r="8" fill="#e8322b" stroke="${INK}" stroke-width="3"/><circle cx="184" cy="${y}" r="8" fill="#e8322b" stroke="${INK}" stroke-width="3"/>`).join('')}
   <path d="M96 252 Q 160 276 224 252" stroke="#e8322b" stroke-width="9" fill="none" stroke-linecap="round"/>
   <path d="M76 400 Q 160 420 244 400 L 248 430 Q 160 452 72 430 Z" fill="#000" opacity=".06"/>
   <rect x="120" y="330" width="80" height="62" rx="8" fill="#fff" stroke="#d9d2c0" stroke-width="4"/>
   <path d="M160 340 q -12 14 0 38 q 12 -24 0 -38 z" fill="#ffd34d" opacity=".0"/>
   <!-- neck + head + hat -->
   <rect x="140" y="204" width="40" height="40" fill="${SKIN_SH}" stroke="${INK}" stroke-width="4"/>
   <path d="M86 110 Q 70 40 112 26 Q 120 -2 160 8 Q 200 -2 208 26 Q 250 40 234 110 Q 226 134 200 140 H 120 Q 94 134 86 110 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <path d="M120 120 H 200" stroke="#d9d2c0" stroke-width="5"/>
   <path d="M104 66 Q 100 46 124 40" stroke="#e4e4ec" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M110 136 H 210 L 206 150 H 114 Z" fill="#e8322b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  { cut: 5 },
)

const bakerFace = (happy: boolean) =>
  svgDoc(
    150,
    130,
    `<ellipse cx="75" cy="68" rx="58" ry="56" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
     <ellipse cx="22" cy="72" rx="11" ry="15" fill="${SKIN_SH}" stroke="${INK}" stroke-width="4"/><ellipse cx="128" cy="72" rx="11" ry="15" fill="${SKIN_SH}" stroke="${INK}" stroke-width="4"/>
     <circle cx="40" cy="82" r="14" fill="#f07a7a" opacity=".45"/><circle cx="110" cy="82" r="14" fill="#f07a7a" opacity=".45"/>
     ${
       happy
         ? `<path d="M38 56 Q 50 40 62 56 M88 56 Q 100 40 112 56" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M44 88 Q 75 128 106 88 Z" fill="#7d2a2c" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M52 92 Q 75 100 98 92 L 96 98 Q 75 106 54 98 Z" fill="#fff"/>`
         : `<circle cx="52" cy="58" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="98" cy="58" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="54" cy="60" r="4.5" fill="${INK}"/><circle cx="96" cy="60" r="4.5" fill="${INK}"/>
            <path d="M38 40 Q 52 30 66 38 M84 38 Q 98 30 112 40" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>
            <ellipse cx="75" cy="104" rx="10" ry="12" fill="#7d2a2c" stroke="${INK}" stroke-width="4"/>`
     }
     <path d="M30 80 Q 50 72 75 82 Q 100 72 120 80 Q 112 94 96 88 Q 75 84 54 88 Q 38 94 30 80 Z" fill="#6b4a30" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <circle cx="75" cy="74" r="8" fill="#e8a58a" stroke="${INK}" stroke-width="3"/>`,
  )
export const bakerWorry = bakerFace(false)
export const bakerHappy = bakerFace(true)

/** Baker's arm: sleeve + hand, pivot at the shoulder (top). 80×240. */
export const bakerArm = svgDoc(
  80,
  240,
  `<path d="M14 16 Q 40 0 66 16 L 62 150 Q 40 164 18 150 Z" fill="#fdfbf5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M20 140 Q 40 154 60 140 L 60 156 Q 40 170 20 156 Z" fill="#e8322b" stroke="${INK}" stroke-width="4"/>
   <circle cx="40" cy="190" r="30" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>
   <path d="M24 180 q 16 -14 32 0" stroke="${SKIN_SH}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  { cut: 4 },
)

/** A loaf for the baker to wave. */
export const loaf = svgDoc(
  120,
  60,
  `<ellipse cx="60" cy="32" rx="52" ry="22" fill="#e0a24a" stroke="${INK}" stroke-width="5"/>
   ${[28, 54, 80].map((x) => `<path d="M${x - 6} 22 q 8 -6 12 8" stroke="#b9772a" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('')}
   <path d="M24 26 Q 40 14 60 14" stroke="#ffe0a0" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`,
  { cut: 4 },
)

/** "Hooray!" speech bubble. */
export const hooray = svgDoc(
  300,
  170,
  `<path d="M40 20 L 262 20 Q 284 20 284 42 L 284 106 Q 284 128 262 128 L 120 128 L 70 160 L 82 128 L 40 128 Q 18 128 18 106 L 18 42 Q 18 20 40 20 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <text x="152" y="92" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="54" fill="#e8322b">HOORAY!</text>
   <path d="${starPath(256, 44, 16, 7, 5)}" fill="#ffd34d" stroke="#e8a000" stroke-width="3" stroke-linejoin="round"/>`,
)

/** A tiny "oh no!" bubble before the fire goes out. */
export const ohNo = svgDoc(
  300,
  170,
  `<path d="M40 20 L 262 20 Q 284 20 284 42 L 284 106 Q 284 128 262 128 L 120 128 L 70 160 L 82 128 L 40 128 Q 18 128 18 106 L 18 42 Q 18 20 40 20 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
   <text x="152" y="94" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="48" fill="#e8722b">My buns!</text>`,
)

/** Milo's head in a fire helmet, for the truck window (240×250). */
export const miloDriver = svgDoc(
  240,
  250,
  `<g transform="translate(-12 22) scale(0.6)">${headParts}<g transform="translate(70 165)">${eyesParts}</g></g>
   <path d="M10 70 Q 120 40 230 70 L 226 94 Q 120 70 14 94 Z" fill="#9e1a14" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M34 76 Q 30 4 120 -2 Q 210 4 206 76 Z" fill="#dd2a1f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
   <path d="M114 0 L 126 0 L 128 76 L 112 76 Z" fill="#b51e16"/>
   <path d="M52 52 Q 66 18 98 8" stroke="#ff9a8a" stroke-width="8" fill="none" stroke-linecap="round"/>
   <path d="M88 34 L 152 34 L 158 68 Q 120 90 82 68 Z" fill="#f2c230" stroke="#b8860b" stroke-width="4" stroke-linejoin="round"/>
   <text x="120" y="68" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="34" fill="#b51e16">5</text>`,
  { cut: 4 },
)

/** A stand-alone house / shop for the world diorama (w+60 × h+150 px). */
export function houseDoc(b: Omit<Bldg, 'x'>) {
  const W = b.w + 60
  const H = b.h + 150
  return svgDoc(
    W,
    H,
    `${GLASS}<defs>${tilePat(`roofp${b.seed}`, b.roof, '#00000033')}${brickPat('chim', '#c4553b', '#8e3322', 38, 18)}</defs>${building({ ...b, x: 30 }, H)}`,
    { cut: 6 },
  )
}
