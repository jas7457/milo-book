import { svgDoc } from '../art/texture'

/*
 * Milo, drawn as paper-doll parts so he can be rigged and animated in 3D.
 * Based on the reference: big round head, dark tousled hair with a swoopy
 * fringe, thick brows, big brown eyes, rosy cheeks, a huge open smile, grey
 * tank top + shorts, white socks.
 *
 * Coordinate systems (px):  head 400×420 · eyes 260×100 (head 70..330, 165..265)
 *                           body 400×560 · arm 120×300
 */

export const SKIN = '#f8cba6'
export const SKIN_SH = '#eaa987'
const HAIR = '#2a201b'
const HAIR_HI = '#4c3b31'
const INK = '#2a201b'

const CUT = 7

export const headParts = /* svg */ `
  <defs>
    <radialGradient id="face" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="#ffdcc0"/><stop offset="0.75" stop-color="#f8c7a0"/><stop offset="1" stop-color="#eeb089"/>
    </radialGradient>
    <radialGradient id="blush"><stop offset="0" stop-color="#f27f73" stop-opacity=".55"/><stop offset="1" stop-color="#f27f73" stop-opacity="0"/></radialGradient>
  </defs>
  <!-- ears -->
  <ellipse cx="66" cy="238" rx="38" ry="46" fill="#f2b68f"/>
  <ellipse cx="74" cy="240" rx="19" ry="27" fill="#e2967a"/>
  <ellipse cx="334" cy="238" rx="38" ry="46" fill="#f2b68f"/>
  <ellipse cx="326" cy="240" rx="19" ry="27" fill="#e2967a"/>
  <!-- face: round and chubby -->
  <path d="M200 72 C 302 72 346 142 343 226 C 340 322 282 376 200 376 C 118 376 60 322 57 226 C 54 142 98 72 200 72 Z" fill="url(#face)"/>
  <!-- cheeks -->
  <circle cx="110" cy="280" r="42" fill="url(#blush)"/>
  <circle cx="290" cy="280" r="42" fill="url(#blush)"/>
  <!-- hair: tousled with a swoopy fringe -->
  <path d="M58 232 C 34 118 112 26 212 30 C 306 34 372 104 344 232
           C 340 196 330 168 312 150
           Q 300 128 282 116  Q 276 140 256 152
           Q 250 126 232 112  Q 222 138 204 154
           Q 198 124 180 112  Q 172 138 158 150
           Q 150 124 134 118  Q 128 142 110 152
           C 86 164 66 196 58 232 Z" fill="${HAIR}"/>
  <path d="M120 70 C 160 48 230 44 280 66" stroke="${HAIR_HI}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M96 104 C 140 82 196 80 236 92" stroke="${HAIR_HI}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M250 84 C 290 92 318 114 330 140" stroke="${HAIR_HI}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M200 30 C 196 16 206 6 220 8 C 212 14 210 22 214 32 Z" fill="${HAIR}"/>
  <!-- brows -->
  <path d="M112 182 Q 140 160 176 172" stroke="${INK}" stroke-width="15" fill="none" stroke-linecap="round"/>
  <path d="M224 172 Q 260 160 288 182" stroke="${INK}" stroke-width="15" fill="none" stroke-linecap="round"/>
  <!-- nose -->
  <ellipse cx="200" cy="264" rx="19" ry="14" fill="#eb9d7d"/>
  <ellipse cx="193" cy="259" rx="7" ry="4.5" fill="#ffe3cf"/>
  <!-- big open smile -->
  <path d="M146 294 Q 200 304 254 294 Q 248 358 200 358 Q 152 358 146 294 Z" fill="#7d2a2c"/>
  <path d="M154 298 Q 200 307 246 298 L 241 315 Q 200 321 159 315 Z" fill="#fff"/>
  <path d="M170 342 Q 200 324 230 342 Q 216 356 200 356 Q 184 356 170 342 Z" fill="#e8727a"/>
  <path d="M140 292 Q 146 288 152 292" stroke="#d98a6e" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M248 292 Q 254 288 260 292" stroke="#d98a6e" stroke-width="4" fill="none" stroke-linecap="round"/>
`

export const miloHead = () => svgDoc(400, 420, headParts, { cut: CUT })

function eye(cx: number, cy: number, look = 6) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="36" ry="41" fill="#fff"/>
    <circle cx="${cx + look}" cy="${cy + 3}" r="28" fill="#6a4122"/>
    <circle cx="${cx + look}" cy="${cy + 3}" r="21" fill="#4a2c16"/>
    <circle cx="${cx + look}" cy="${cy + 4}" r="14" fill="#140d09"/>
    <circle cx="${cx + look - 10}" cy="${cy - 9}" r="9" fill="#fff"/>
    <circle cx="${cx + look + 9}" cy="${cy + 13}" r="4" fill="#fff"/>
    <path d="M${cx - 38} ${cy - 4} Q ${cx} ${cy - 50} ${cx + 38} ${cy - 4}" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`
}
export const eyesParts = eye(78, 50) + eye(182, 50)
export const miloEyes = () => svgDoc(260, 100, eyesParts)

export const bodyParts = /* svg */ `
  <!-- neck + shoulders -->
  <rect x="170" y="0" width="60" height="70" rx="20" fill="${SKIN_SH}"/>
  <ellipse cx="200" cy="96" rx="112" ry="42" fill="${SKIN}"/>
  <!-- legs -->
  <path d="M112 400 L 182 400 L 178 500 Q 146 508 116 500 Z" fill="${SKIN}"/>
  <path d="M218 400 L 288 400 L 284 500 Q 254 508 222 500 Z" fill="${SKIN}"/>
  <ellipse cx="146" cy="440" rx="22" ry="10" fill="${SKIN_SH}" opacity=".5"/>
  <ellipse cx="254" cy="440" rx="22" ry="10" fill="${SKIN_SH}" opacity=".5"/>
  <!-- socks -->
  <path d="M114 488 L 180 488 L 180 532 Q 180 552 160 552 L 104 552 Q 84 552 86 538 Q 90 524 114 520 Z" fill="#f6f4ee"/>
  <path d="M220 488 L 286 488 L 286 520 Q 310 524 314 538 Q 316 552 296 552 L 240 552 Q 220 552 220 532 Z" fill="#f6f4ee"/>
  <path d="M116 498 L 178 498" stroke="#dcd8ce" stroke-width="5"/><path d="M222 498 L 284 498" stroke="#dcd8ce" stroke-width="5"/>
  <!-- shorts -->
  <path d="M96 318 L 304 318 L 318 424 Q 264 434 212 424 L 200 372 L 188 424 Q 136 434 82 424 Z" fill="#8f9297"/>
  <path d="M200 330 L 200 372" stroke="#7a7d82" stroke-width="4"/>
  <!-- tank top -->
  <path d="M126 52 L 160 52 Q 200 112 240 52 L 274 52 Q 280 112 306 132 L 302 334 Q 200 350 98 334 L 94 132 Q 120 112 126 52 Z" fill="#a0a3a8"/>
  <path d="M160 52 Q 200 112 240 52" stroke="#8c8f94" stroke-width="7" fill="none"/>
  <path d="M126 52 Q 120 112 94 132" stroke="#8c8f94" stroke-width="6" fill="none"/>
  <path d="M274 52 Q 280 112 306 132" stroke="#8c8f94" stroke-width="6" fill="none"/>
  <g stroke="#979aa0" stroke-width="2" opacity=".6">
    <path d="M130 150 L 128 330"/><path d="M160 130 L 160 336"/><path d="M200 120 L 200 340"/><path d="M240 130 L 240 336"/><path d="M270 150 L 272 330"/>
  </g>
`
export const miloBody = () => svgDoc(400, 560, bodyParts, { cut: CUT })

export const armParts = /* svg */ `
  <path d="M34 34 Q 60 8 88 34 L 88 220 Q 88 236 60 236 Q 32 236 32 220 Z" fill="${SKIN}"/>
  <path d="M44 150 Q 60 158 76 150" stroke="${SKIN_SH}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="250" r="34" fill="${SKIN}"/>
  <path d="M38 262 Q 60 280 82 262" stroke="${SKIN_SH}" stroke-width="5" fill="none" stroke-linecap="round"/>
`
export const miloArm = () => svgDoc(120, 300, armParts, { cut: CUT })

/* ---------- outfits (overlays) ---------- */

export const hardHat = () =>
  svgDoc(
    400,
    230,
    `<path d="M62 196 Q 56 46 200 34 Q 344 46 338 196 Z" fill="#ffc21a"/>
     <path d="M180 38 L 220 38 L 226 196 L 174 196 Z" fill="#f0ab00"/>
     <path d="M92 120 Q 120 64 170 50" stroke="#ffe27a" stroke-width="12" fill="none" stroke-linecap="round"/>
     <rect x="24" y="182" width="352" height="34" rx="17" fill="#e89b00"/>`,
    { cut: CUT },
  )

export const fireHelmet = () =>
  svgDoc(
    420,
    260,
    `<path d="M20 200 Q 210 160 400 200 L 392 232 Q 210 206 28 232 Z" fill="#9e1a14"/>
     <path d="M66 206 Q 60 54 210 40 Q 360 54 354 206 Z" fill="#dd2a1f"/>
     <path d="M200 42 L 220 42 L 224 204 L 196 204 Z" fill="#b51e16"/>
     <path d="M98 120 Q 124 70 174 56" stroke="#ff7a6a" stroke-width="12" fill="none" stroke-linecap="round"/>
     <path d="M160 96 L 260 96 L 270 160 Q 210 200 150 160 Z" fill="#f2c230" stroke="#b8860b" stroke-width="5"/>
     <text x="210" y="160" text-anchor="middle" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-weight="700" font-size="58" fill="#b51e16">5</text>`,
    { cut: CUT },
  )

export const fireCoat = () =>
  svgDoc(
    400,
    560,
    `<path d="M110 60 L 290 60 Q 312 110 312 140 L 310 360 Q 200 376 90 360 L 88 140 Q 88 110 110 60 Z" fill="#d9a441"/>
     <path d="M168 60 L 200 120 L 232 60 Z" fill="${SKIN_SH}"/>
     <path d="M196 120 L 200 360" stroke="#8a6420" stroke-width="5"/>
     <rect x="90" y="250" width="220" height="22" fill="#f4f06a"/><rect x="90" y="256" width="220" height="10" fill="#c9cdd2"/>
     <rect x="90" y="320" width="220" height="22" fill="#f4f06a"/><rect x="90" y="326" width="220" height="10" fill="#c9cdd2"/>
     <circle cx="182" cy="160" r="7" fill="#5a4010"/><circle cx="182" cy="210" r="7" fill="#5a4010"/>`,
    { cut: CUT },
  )

export const safetyVest = () =>
  svgDoc(
    400,
    560,
    `<path d="M118 60 L 160 60 Q 200 150 240 60 L 282 60 Q 300 120 306 140 L 302 336 Q 200 352 98 336 L 94 140 Q 100 120 118 60 Z" fill="#ff7a1a"/>
     <path d="M190 140 L 210 140 L 210 340 L 190 340 Z" fill="#e5630a"/>
     <rect x="96" y="230" width="208" height="20" fill="#f5f7c8"/>
     <rect x="96" y="290" width="208" height="20" fill="#f5f7c8"/>`,
    { cut: CUT },
  )

export const toolBelt = () =>
  svgDoc(
    400,
    190,
    `<!-- hammer -->
     <rect x="286" y="10" width="16" height="110" rx="6" fill="#a8743a"/>
     <path d="M262 8 L 330 8 Q 340 8 340 20 L 340 30 L 262 30 Z" fill="#7d858f"/>
     <!-- screwdriver -->
     <rect x="104" y="24" width="8" height="60" fill="#c9ced6"/>
     <rect x="96" y="70" width="24" height="56" rx="10" fill="#e8322b"/>
     <!-- belt -->
     <rect x="80" y="96" width="240" height="38" rx="8" fill="#8a5a2b"/>
     <rect x="180" y="92" width="40" height="46" rx="6" fill="none" stroke="#e9c25a" stroke-width="8"/>
     <!-- pouches -->
     <path d="M82 120 L 150 120 L 146 182 Q 116 190 86 182 Z" fill="#a46a33"/>
     <path d="M82 120 L 150 120 L 148 144 L 84 144 Z" fill="#8a5a2b"/>
     <path d="M250 120 L 318 120 L 314 182 Q 284 190 254 182 Z" fill="#a46a33"/>
     <path d="M250 120 L 318 120 L 316 144 L 252 144 Z" fill="#8a5a2b"/>
     <circle cx="116" cy="160" r="5" fill="#e9c25a"/><circle cx="284" cy="160" r="5" fill="#e9c25a"/>`,
    { cut: CUT },
  )

export const cape = () =>
  svgDoc(
    480,
    600,
    `<path d="M150 40 Q 240 70 330 40 Q 400 300 450 560 Q 380 590 330 560 Q 290 590 240 566 Q 190 590 150 560 Q 100 590 30 560 Q 80 300 150 40 Z" fill="#d8261c"/>
     <path d="M150 40 Q 240 70 330 40 Q 360 200 380 300 Q 240 330 100 300 Q 120 200 150 40 Z" fill="#b51e16" opacity=".5"/>`,
    { cut: CUT },
  )

export const heroMask = () =>
  svgDoc(
    300,
    110,
    `<path d="M10 40 Q 150 0 290 40 Q 300 80 270 96 Q 220 108 172 80 Q 150 70 128 80 Q 80 108 30 96 Q 0 80 10 40 Z" fill="#1f5fd6"/>`,
    { cut: 4 },
  )

export const heroEmblem = () =>
  svgDoc(
    160,
    160,
    `<path d="M80 8 L 152 46 L 80 152 L 8 46 Z" fill="#ffd21f" stroke="#d8261c" stroke-width="8" stroke-linejoin="round"/>
     <text x="80" y="92" text-anchor="middle" font-family="Fredoka, Arial Rounded MT Bold, sans-serif" font-weight="700" font-size="64" fill="#d8261c">M</text>`,
    { cut: 4 },
  )

export const pajamas = () =>
  svgDoc(
    400,
    560,
    `<path d="M116 56 L 160 56 Q 200 100 240 56 L 284 56 Q 304 100 310 130 L 306 330 Q 200 346 94 330 L 90 130 Q 96 100 116 56 Z" fill="#5a7fd8"/>
     <path d="M94 318 L 306 318 L 302 504 L 214 504 L 200 380 L 186 504 L 98 504 Z" fill="#4f70c4"/>
     <g fill="#ffe27a">
       <path d="M140 170 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z"/>
       <path d="M250 220 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z"/>
       <path d="M180 270 l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2z"/>
       <path d="M130 420 l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2z"/>
       <path d="M256 450 l5 10 11 2 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -2z"/>
     </g>
     <path d="M160 56 Q 200 100 240 56" stroke="#ffffff" stroke-width="8" fill="none"/>`,
    { cut: CUT },
  )

/** A whole Milo in one SVG group (used on the cover and in page illustrations). */
export function miloFigure(opts: { outfit?: 'plain' | 'superhero' | 'firefighter' | 'tools' } = {}) {
  const o = opts.outfit ?? 'plain'
  const extra = {
    plain: '',
    tools: '',
    firefighter: '',
    superhero: '',
  }[o]
  // body at (0,0) 400×560; head scaled 1.2 sitting on the neck; arms behind
  return `
    <g>
      ${o === 'superhero' ? `<g transform="translate(-40 40) scale(1)"><path d="M150 40 Q 240 70 330 40 Q 400 300 450 560 Q 380 590 330 560 Q 290 590 240 566 Q 190 590 150 560 Q 100 590 30 560 Q 80 300 150 40 Z" fill="#d8261c"/></g>` : ''}
      <g transform="translate(58 65) rotate(18 60 30)">${armParts}</g>
      <g transform="translate(222 65) rotate(-150 60 30)">${armParts}</g>
      <g>${bodyParts}</g>
      ${o === 'superhero' ? `<g transform="translate(152 150) scale(0.6)"><path d="M80 8 L 152 46 L 80 152 L 8 46 Z" fill="#ffd21f" stroke="#d8261c" stroke-width="8"/><text x="80" y="92" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="64" fill="#d8261c">M</text></g>` : ''}
      <g transform="translate(-40 -405) scale(1.2)">
        ${headParts}
        <g transform="translate(70 165)">${eyesParts}</g>
        ${o === 'superhero' ? `<g transform="translate(50 160) scale(1)"><path d="M10 40 Q 150 0 290 40 Q 300 80 270 96 Q 220 108 172 80 Q 150 70 128 80 Q 80 108 30 96 Q 0 80 10 40 Z" fill="#1f5fd6"/></g><g transform="translate(70 165)">${eyesParts}</g>` : ''}
      </g>
      ${extra}
    </g>`
}
