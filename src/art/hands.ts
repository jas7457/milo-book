import { svgDoc } from './texture'
import { INK } from './style'

/*
 * Show-me hand options (the invisible full-size rect in each keeps svgDoc's
 * filter region big enough for the die-cut border). All point DOWN; the fingertip is at the bottom centre
 * of the art (x = W/2) unless `tipInset` says otherwise (handC has a tap
 * ripple under the tip, so its tip sits `tipInset` px above the bottom edge).
 */
export const HAND_W = 220
export const HAND_H = 284

/** Several shapes drawn as ONE silhouette: all outlines first, then all fills. */
const blob = (shapes: string[], fill: string, ink: number) =>
  `<g stroke="${INK}" stroke-width="${ink * 2}" stroke-linejoin="round" stroke-linecap="round">${shapes
    .map((s) => s.replace('/>', ' fill="' + INK + '"/>'))
    .join('')}</g>
   <g>${shapes.map((s) => s.replace('/>', ' fill="' + fill + '"/>')).join('')}</g>`

/* ───────────────────────── A: child-like hand with a knit sleeve ───────────────────────── */
const SKIN = '#f7c59f'
const SKIN_SH = '#e29a74'
const SKIN_HI = '#fde3cc'

export const handA = svgDoc(
  HAND_W,
  HAND_H,
  `
  <rect x="0" y="0" width="${HAND_W}" height="${HAND_H}" fill="none"/>
  <!-- knit sleeve -->
  <path d="M60 6 H160 Q168 6 168 14 V56 Q168 64 160 64 H60 Q52 64 52 56 V14 Q52 6 60 6 Z" fill="#e8574a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <g stroke="#b83a30" stroke-width="5" stroke-linecap="round">
    <path d="M72 18 V52 M90 18 V52 M108 18 V52 M126 18 V52 M144 18 V52"/>
  </g>
  <path d="M62 15 H158" stroke="#f9998c" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M52 50 H168" stroke="${INK}" stroke-width="0"/>
  <!-- palm, thumb, curled fingers: one silhouette -->
  ${blob(
    [
      `<path d="M76 58 H144 C162 64 170 90 170 124 V170 H92 V176 C66 176 54 156 54 126 V100 C54 78 62 62 76 58 Z"/>`,
      `<rect x="122" y="128" width="54" height="30" rx="15"/>`,
      `<rect x="120" y="154" width="52" height="30" rx="15"/>`,
      `<rect x="116" y="180" width="48" height="30" rx="15"/>`,
      `<path d="M58 104 C34 122 34 160 56 184 C70 194 90 186 90 172 L90 120 Z"/>`,
    ],
    SKIN,
    6,
  )}
  <!-- curled-finger creases -->
  <g fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".6">
    <path d="M132 156 H160 M130 182 H156"/>
  </g>
  <g fill="none" stroke="${SKIN_SH}" stroke-width="5" stroke-linecap="round">
    <path d="M154 140 q9 0 13 5"/><path d="M150 166 q9 0 13 5"/><path d="M144 192 q8 0 12 5"/>
  </g>
  <!-- thumb crease + highlight -->
  <path d="M46 138 q2 18 12 30" stroke="${SKIN_SH}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M50 126 q-2 -8 2 -14" stroke="${SKIN_HI}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- index finger: open at the top so it grows out of the palm -->
  <path d="M88 108 H132 V240 C132 260 124 270 110 270 C96 270 88 260 88 240 Z" fill="${SKIN}"/>
  <path d="M88 120 V240 C88 260 96 270 110 270 C124 270 132 260 132 240 V120" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M123 124 V240 C123 254 119 262 111 266 C125 264 129 254 129 240 V124 Z" fill="${SKIN_SH}" opacity=".6"/>
  <path d="M98 126 V222" stroke="${SKIN_HI}" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M97 190 q13 7 26 0 M97 156 q13 7 26 0" stroke="${SKIN_SH}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <!-- nail -->
  <path d="M97 244 C97 232 123 232 123 244 C123 256 118 262 110 262 C102 262 97 256 97 244 Z" fill="#fde8dc" stroke="#d9876c" stroke-width="3.5"/>
  <path d="M104 242 q0 -4 5 -5" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <!-- back-of-hand highlight -->
  <path d="M68 84 Q70 70 84 66" stroke="${SKIN_HI}" stroke-width="7" fill="none" stroke-linecap="round"/>
  `,
  { cut: 5 },
)

/* ───────────────────────── B: chunky paper-cutout hand, thick white border + soft shadow ───────────────────────── */
export const handB = svgDoc(
  HAND_W,
  HAND_H,
  `
  <rect x="0" y="0" width="${HAND_W}" height="${HAND_H}" fill="none"/>
  <g transform="translate(110 268) scale(.86) translate(-110 -268)">
  <g transform="translate(220 0) scale(-1 1)">
  <!-- soft paper shadow (falls to the lower right on screen) -->
  <g transform="translate(-9 9)" fill="#3b2a20" opacity=".2">
    <path d="M72 56 H148 C170 62 178 90 178 124 V176 H92 V184 C60 184 46 164 46 132 V100 C46 78 56 62 72 56 Z"/>
    <rect x="116" y="126" width="68" height="36" rx="18"/><rect x="114" y="158" width="64" height="36" rx="18"/><rect x="110" y="190" width="58" height="36" rx="18"/>
    <path d="M52 100 C22 120 22 166 50 192 C68 204 92 196 92 178 L92 116 Z"/>
    <path d="M82 112 H138 V234 C138 258 126 268 110 268 C94 268 82 258 82 234 Z"/>
  </g>
  <!-- cuff -->
  <path d="M58 6 H162 Q168 6 168 12 V54 Q168 60 162 60 H58 Q52 60 52 54 V12 Q52 6 58 6 Z" fill="#6fc6a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M52 44 H168" stroke="#47a07b" stroke-width="6"/>
  <g fill="#fff" opacity=".9"><circle cx="76" cy="25" r="5.5"/><circle cx="110" cy="25" r="5.5"/><circle cx="144" cy="25" r="5.5"/></g>
  ${blob(
    [
      `<path d="M72 56 H148 C170 62 178 90 178 124 V176 H92 V184 C60 184 46 164 46 132 V100 C46 78 56 62 72 56 Z"/>`,
      `<rect x="116" y="126" width="68" height="36" rx="18"/>`,
      `<rect x="114" y="158" width="64" height="36" rx="18"/>`,
      `<rect x="110" y="190" width="58" height="36" rx="18"/>`,
      `<path d="M52 100 C22 120 22 166 50 192 C68 204 92 196 92 178 L92 116 Z"/>`,
    ],
    '#ffc58c',
    4.5,
  )}
  <!-- curled finger divisions + stitches -->
  <g fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round">
    <path d="M138 160 H176 M136 192 H168"/>
  </g>
  <g fill="none" stroke="#c9733f" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="2 9">
    <path d="M62 80 Q52 100 54 130"/><path d="M164 78 Q172 100 170 120"/>
  </g>
  <path d="M34 142 q2 20 14 34" stroke="#ee9a62" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M40 120 q-1 -8 4 -14" stroke="#ffe3c8" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- fat index finger, open at the top -->
  <path d="M82 112 H138 V234 C138 258 126 268 110 268 C94 268 82 258 82 234 Z" fill="#ffc58c"/>
  <path d="M82 124 V234 C82 258 94 268 110 268 C126 268 138 258 138 234 V124" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M127 126 V236 C127 252 122 260 112 264 C130 262 135 252 135 236 V126 Z" fill="#ee9a62" opacity=".6"/>
  <path d="M94 130 V228" stroke="#ffe3c8" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M94 196 q16 8 32 0" stroke="#ee9a62" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M106 242 h8" stroke="#ee9a62" stroke-width="4" stroke-linecap="round" opacity="0"/>
  </g>
  </g>
  `,
  { cut: 10, edge: '#ffffff' },
)

/* ───────────────────────── C: bold icon hand + tap ripple ───────────────────────── */
export const handC_tipInset = 26
const CT = HAND_H - handC_tipInset
export const handC = svgDoc(
  HAND_W,
  HAND_H,
  `
  <rect x="0" y="0" width="${HAND_W}" height="${HAND_H}" fill="none"/>
  <!-- tap ripple, centred on the fingertip -->
  <ellipse cx="110" cy="${CT}" rx="86" ry="22" fill="#ffd34d" fill-opacity=".28" stroke="#ffd34d" stroke-width="5" stroke-opacity=".9"/>
  <ellipse cx="110" cy="${CT}" rx="54" ry="13" fill="#ffd34d" fill-opacity=".55" stroke="#fff" stroke-width="4"/>
  <path d="M78 6 H142 V90 C160 92 170 104 170 122 Q190 122 190 138 Q190 154 172 154 Q188 154 188 170 Q188 186 170 186 Q182 186 182 200 Q182 214 164 214 H142 Q132 214 132 226 V236 C132 250 124 ${CT} 110 ${CT} C96 ${CT} 88 250 88 236 V200 C70 206 48 196 46 170 C44 148 52 124 52 110 C52 98 62 92 78 90 Z"
    fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <!-- minimal detail: finger separations, soft shade, highlight -->
  <g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
    <path d="M172 154 Q154 150 140 156 M170 186 Q154 182 140 188"/>
  </g>
  <path d="M121 100 V230 C121 244 118 252 112 ${CT - 4} C126 ${CT - 6} 128 244 128 232 V100 Z" fill="#cfd9ea" opacity=".85"/>
  <path d="M98 110 V226" stroke="#fff" stroke-width="0"/>
  <path d="M60 110 Q58 124 62 140" stroke="#cfd9ea" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M70 8 H150 V62 H70 Z" fill="#ff6f61" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M80 20 H140" stroke="#ffa497" stroke-width="5" stroke-linecap="round"/>
  `,
  { cut: 4, edge: '#ffffff', grain: 0.25 },
)

/* ───────────────────── Pointing hand (final A): index finger out of the thumb side ─────────────────────
 * Back-of-hand cartoon pointing DOWN. The index finger leaves the fist at its thumb side; three curled
 * fingers are stacked on the far side; the thumb is either folded across them or tucked beside the index.
 * The fingertip sits at the bottom centre (x = POINT_W / 2). The whole hand is tilted a few degrees
 * about the fingertip so it reads as "this way". */
export const POINT_W = 240
export const POINT_H = 306
const PCX = POINT_W / 2
const PTIP = 286 // fingertip (before the 14px top margin is added)
const TILT = -10

const pointHand = (thumb: 'across' | 'side') => {
  const cx = PCX
  // 3 curled fingers (stacked sausages) + palm: the far-side mass
  const mass = [
    `<rect x="${cx - 24}" y="70" width="84" height="128" rx="34"/>`,
    `<rect x="${cx + 8}" y="92" width="76" height="40" rx="20"/>`,
    `<rect x="${cx + 6}" y="126" width="74" height="40" rx="20"/>`,
    `<rect x="${cx + 4}" y="160" width="66" height="40" rx="20"/>`,
    // wrist
    `<rect x="${cx + 4}" y="46" width="62" height="50" rx="10"/>`,
    // index finger, slight taper, rounded tip
    `<path d="M${cx - 28} 110 L${cx - 25} ${PTIP - 26} C${cx - 25} ${PTIP - 9} ${cx - 14} ${PTIP} ${cx} ${PTIP} C${cx + 14} ${PTIP} ${cx + 25} ${PTIP - 9} ${cx + 25} ${PTIP - 26} L${cx + 28} 110 Z"/>`,
    ...(thumb === 'side'
      ? [`<rect x="${cx - 44}" y="88" width="36" height="104" rx="18" transform="rotate(4 ${cx - 26} 140)"/>`]
      : []),
  ]
  const thumbOn =
    thumb === 'across'
      ? `<g>
    <path d="M${cx - 8} 104 L${cx + 30} 140" stroke="${INK}" stroke-width="46" stroke-linecap="round" fill="none"/>
    <path d="M${cx - 8} 104 L${cx + 30} 140" stroke="${SKIN}" stroke-width="34" stroke-linecap="round" fill="none"/>
    <path d="M${cx + 6} 92 L${cx + 30} 116" stroke="${SKIN_SH}" stroke-width="0" fill="none"/>
    <path d="M${cx - 4} 118 L${cx + 22} 143" stroke="${SKIN_SH}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8" transform="translate(7 7)"/>
    <path d="M${cx - 6} 94 L${cx + 14} 114" stroke="${SKIN_HI}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <ellipse cx="${cx + 29}" cy="140" rx="9" ry="7" transform="rotate(45 ${cx + 29} 140)" fill="#fde8dc" stroke="#d9876c" stroke-width="3"/>
  </g>`
      : `<g transform="rotate(4 ${cx - 26} 140)">
    <rect x="${cx - 44}" y="88" width="36" height="104" rx="18" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>
    <path d="M${cx - 20} 106 V174 C${cx - 20} 184 ${cx - 24} 188 ${cx - 28} 190 C${cx - 14} 190 ${cx - 10} 184 ${cx - 10} 174 V106 Z" fill="${SKIN_SH}" opacity=".55"/>
    <path d="M${cx - 36} 106 V150" stroke="${SKIN_HI}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M${cx - 36} 150 q10 6 20 0" stroke="${SKIN_SH}" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>`
  return svgDoc(
    POINT_W,
    POINT_H,
    `
  <rect x="0" y="0" width="${POINT_W}" height="${POINT_H}" fill="none"/>
  <g transform="translate(0 14) rotate(${TILT} ${cx} ${PTIP})">
  <!-- knit sleeve -->
  <path d="M${cx - 16} 6 H${cx + 80} Q${cx + 88} 6 ${cx + 88} 14 V50 Q${cx + 88} 58 ${cx + 80} 58 H${cx - 16} Q${cx - 24} 58 ${cx - 24} 50 V14 Q${cx - 24} 6 ${cx - 16} 6 Z" fill="#e8574a" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <g stroke="#b83a30" stroke-width="5" stroke-linecap="round">
    <path d="M${cx - 4} 18 V46 M${cx + 14} 18 V46 M${cx + 32} 18 V46 M${cx + 50} 18 V46 M${cx + 68} 18 V46"/>
  </g>
  <path d="M${cx - 14} 15 H${cx + 78}" stroke="#f9998c" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${blob(mass, SKIN, 6)}
  <!-- soft shade under the cuff -->
  <path d="M${cx + 4} 62 H${cx + 62} V74 Q${cx + 34} 82 ${cx + 4} 74 Z" fill="${SKIN_SH}" opacity=".55"/>
  <!-- creases between the curled fingers -->
  <g fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round">
    <path d="M${cx + 34} 130 H${cx + 70} M${cx + 34} 164 H${cx + 66}"/>
  </g>
  <g fill="none" stroke="${SKIN_SH}" stroke-width="5" stroke-linecap="round">
    <path d="M${cx + 62} 104 q9 3 13 10 M${cx + 60} 138 q9 3 13 10 M${cx + 54} 172 q8 3 12 10"/>
  </g>
  <!-- index finger shading + highlight -->
  <path d="M${cx + 16} 150 V${PTIP - 24} C${cx + 16} ${PTIP - 12} ${cx + 12} ${PTIP - 6} ${cx + 4} ${PTIP - 3} C${cx + 20} ${PTIP - 4} ${cx + 26} ${PTIP - 12} ${cx + 26} ${PTIP - 26} V150 Z" fill="${SKIN_SH}" opacity=".6"/>
  <path d="M${cx - 15} 176 V${PTIP - 56}" stroke="${SKIN_HI}" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M${cx - 15} 206 q15 7 30 0" stroke="${SKIN_SH}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <!-- nail -->
  <path d="M${cx - 14} ${PTIP - 36} C${cx - 14} ${PTIP - 50} ${cx + 14} ${PTIP - 50} ${cx + 14} ${PTIP - 36} C${cx + 14} ${PTIP - 22} ${cx + 9} ${PTIP - 16} ${cx} ${PTIP - 16} C${cx - 9} ${PTIP - 16} ${cx - 14} ${PTIP - 22} ${cx - 14} ${PTIP - 36} Z" fill="#fde8dc" stroke="#d9876c" stroke-width="3.5"/>
  <path d="M${cx - 7} ${PTIP - 38} q0 -4 5 -5" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  ${thumbOn}
  </g>
  `,
    { cut: 5 },
  )
}

export const handPoint = pointHand('across')
export const handPoint2 = pointHand('side')
