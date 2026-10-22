import { svgDoc } from './texture'
import { headParts, eyesParts } from '../milo/art'
import { INK, limb } from './style'

/*
 * Milo's family as die-cut pop-up figures, in the book's illustrated style:
 * flat colour + one shade tone + a few highlights, warm ink outlines.
 *
 * Likeness notes (from family photos):
 *  Mom (Jen)  — long, loosely wavy dark-brown hair that lightens to caramel
 *               at the ends, near-centre part; warm light-tan skin; a huge
 *               open laughing smile with crinkly crescent eyes; cosy
 *               neutrals: oatmeal turtleneck, brown trousers, cognac boots.
 *  Dad (Brett) — short brown hair, short at the sides and swept up on top;
 *               short trimmed full beard; fair skin; big toothy grin with
 *               crinkly eyes; light-grey henley, light-wash jeans, tan boots.
 */

const CUT = 5

type Face = { skin: string; skinSh: string; iris: string; blush: string }

/** Smiling "crinkly" eye: the cheek pushes the lower lid up into a crescent. */
function happyEye(x: number, y: number, f: Face, lash = false) {
  return `
    <ellipse cx="${x}" cy="${y}" rx="17" ry="15" fill="#fff"/>
    <circle cx="${x + 1}" cy="${y + 1}" r="11.5" fill="${f.iris}"/>
    <circle cx="${x + 1}" cy="${y + 2}" r="6" fill="#140d09"/>
    <circle cx="${x - 3}" cy="${y - 4}" r="4" fill="#fff"/>
    <path d="M${x - 22} ${y + 6} Q ${x} ${y - 4} ${x + 22} ${y + 6} L ${x + 22} ${y + 22} L ${x - 22} ${y + 22} Z" fill="${f.skin}"/>
    <path d="M${x - 16} ${y + 7} Q ${x} ${y + 1} ${x + 16} ${y + 7}" stroke="${f.skinSh}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M${x - 21} ${y + 2} Q ${x} ${y - 24} ${x + 21} ${y}" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    ${lash ? `<path d="M${x + (x < 120 ? -21 : 21)} ${y} l ${x < 120 ? -8 : 8} -6" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` : ''}
    <path d="M${x + (x < 120 ? -24 : 24)} ${y + 10} q ${x < 120 ? -6 : 6} 4 ${x < 120 ? -8 : 8} 10" stroke="${f.skinSh}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`
}

/** Big open laughing smile with teeth. */
function grin(f: Face, wide = 1) {
  const a = 120 - 34 * wide
  const b = 120 + 34 * wide
  return `
    <path d="M${a} 190 Q 120 200 ${b} 190 Q ${b - 6} 232 120 232 Q ${a + 6} 232 ${a} 190 Z" fill="#7d2a2c" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M${a + 5} 193 Q 120 202 ${b - 5} 193 L ${b - 9} 207 Q 120 214 ${a + 9} 207 Z" fill="#fff"/>
    <path d="M${a + 18} 224 Q 120 212 ${b - 18} 224 Q 136 231 120 231 Q 104 231 ${a + 18} 224 Z" fill="#e8727a"/>
    <path d="M${a - 6} 186 Q ${a - 2} 192 ${a + 2} 190 M${b + 6} 186 Q ${b + 2} 192 ${b - 2} 190" stroke="${f.skinSh}" stroke-width="4" fill="none" stroke-linecap="round"/>`
}

/** An adult head in a 240×260 box (face centre ≈ 120,135). */
function adultHead(
  f: Face,
  o: { hairBack?: string; hairFront: string; hairFill: string; strands?: string; brow: string; beard?: string; lash?: boolean; jaw?: string; turn?: number },
) {
  const turn = o.turn ?? 0
  const face =
    o.jaw ??
    'M120 24 C 188 24 218 78 216 134 C 214 202 172 246 120 246 C 68 246 26 202 24 134 C 22 78 52 24 120 24 Z'
  return `
    ${o.hairBack ? `<path d="${o.hairBack}" fill="${o.hairFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` : ''}
    <ellipse cx="24" cy="146" rx="17" ry="25" fill="${f.skin}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="216" cy="146" rx="17" ry="25" fill="${f.skin}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="26" cy="148" rx="7" ry="12" fill="${f.skinSh}"/>
    <ellipse cx="214" cy="148" rx="7" ry="12" fill="${f.skinSh}"/>
    <path d="${face}" fill="${f.skin}" stroke="${INK}" stroke-width="5"/>
    <path d="M40 160 C 46 214 86 238 120 238 C 100 226 60 206 40 160 Z" fill="${f.skinSh}" opacity=".4"/>
    <circle cx="64" cy="180" r="22" fill="${f.blush}" opacity=".4"/>
    <circle cx="176" cy="180" r="22" fill="${f.blush}" opacity=".4"/>
    ${o.beard ?? ''}
    <g transform="translate(${turn} 0)">
    ${happyEye(82, 138, f, o.lash)}${happyEye(158, 138, f, o.lash)}
    <path d="M60 108 Q 82 94 104 104" stroke="${o.brow}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M136 104 Q 158 94 180 108" stroke="${o.brow}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M118 150 Q 110 170 124 174" stroke="${f.skinSh}" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${grin(f, o.beard ? 0.95 : 1.05)}
    ${o.beard ? `<path d="M86 184 Q 104 172 120 178 Q 136 172 154 184 Q 138 190 120 186 Q 102 190 86 184 Z" fill="#6b4a30" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>` : ''}
    </g>
    <path d="${o.hairFront}" fill="${o.hairFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    ${o.strands ?? ''}`
}

/* ------------------------------------------------------------ parents -- */
/*
 * Mom and Dad sit on the couch in a three-quarter view, turned toward Milo:
 * slim storybook proportions (head ≈ 1/4.5 of the seated height), a real
 * waist, the near thigh coming forward and the lower leg dropping to the
 * floor. Both are drawn facing right; Dad is mirrored so he faces left.
 */

const MOM: Face = { skin: '#f0c49c', skinSh: '#d99f78', iris: '#3f2616', blush: '#ef8a7a' }

const momHairGrad = `
  <linearGradient id="momHair" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b1a12"/><stop offset=".5" stop-color="#3a2318"/><stop offset=".85" stop-color="#6e4428"/><stop offset="1" stop-color="#9a6a42"/>
  </linearGradient>
  <linearGradient id="momHairTop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b1a12"/><stop offset=".8" stop-color="#3a2318"/><stop offset="1" stop-color="#55331f"/>
  </linearGradient>`

const momHead = adultHead(MOM, {
  hairFill: 'url(#momHairTop)',
  brow: '#2b1a12',
  lash: true,
  turn: 7,
  jaw: 'M120 28 C 184 28 212 80 210 136 C 208 196 170 238 120 240 C 70 238 32 196 30 136 C 28 80 56 28 120 28 Z',
  // near-centre part; curtains frame the face and fall past the chin
  hairFront: `M122 12 C 58 12 18 60 18 132 C 18 184 28 222 22 266 C 42 266 54 242 56 210 C 60 170 58 128 72 92 C 86 62 106 46 126 38
              C 152 62 176 92 186 140 C 190 180 186 222 196 266 C 214 266 224 232 222 190 C 224 140 222 62 122 12 Z`,
  strands: `<g stroke="#6e4428" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M94 36 C 66 66 44 116 44 170"/><path d="M134 40 C 168 70 190 118 196 170"/>
      <path d="M38 200 C 44 226 34 246 38 262"/><path d="M204 200 C 198 226 210 246 206 262"/>
    </g>`,
})

/** Mom on the couch, turned toward Milo, reaching out to him (600×930). */
export const momSitting = () =>
  svgDoc(
    600,
    930,
    `${momHairGrad}
     <!-- long hair down her back (behind everything) -->
     <path d="M190 58 C 112 84 92 190 104 284 C 94 326 110 358 98 398 C 90 432 108 458 98 486 C 118 500 140 490 150 470 C 160 492 186 496 198 476 C 210 490 232 484 238 462 L 266 262 L 304 108 Z" fill="url(#momHair)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <g stroke="#6e4428" stroke-width="4.5" fill="none" stroke-linecap="round">
       <path d="M140 140 C 120 210 136 280 124 340 C 116 390 132 420 120 470"/>
       <path d="M164 200 C 152 270 168 330 156 390 C 150 420 164 446 158 474"/>
       <path d="M190 260 C 184 330 198 380 190 450"/>
     </g>
     <!-- far leg (in shadow) -->
     <path d="M412 560 L 466 560 L 470 862 L 414 862 Z" fill="#643a21" stroke="${INK}" stroke-width="5"/>
     <path d="M408 846 L 470 846 L 472 870 Q 512 874 518 900 L 404 900 Q 400 872 408 846 Z" fill="#8a4f26" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <!-- near thigh coming forward, then the lower leg: wide-leg brown trousers -->
     <path d="M178 500 L 470 494 Q 516 496 518 540 Q 516 582 470 584 L 198 588 Q 170 578 178 500 Z" fill="#7a4a2c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M456 556 L 516 556 L 530 866 L 442 866 Z" fill="#7a4a2c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M486 572 L 488 860" stroke="#643a21" stroke-width="4"/>
     <path d="M230 548 Q 340 556 450 548" stroke="#643a21" stroke-width="4" fill="none"/>
     <!-- cognac ankle boot -->
     <path d="M444 850 L 528 850 L 530 878 Q 576 882 582 914 L 442 914 Q 438 882 444 850 Z" fill="#a8622f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M442 904 L 582 904" stroke="#6e3a18" stroke-width="7"/>
     <path d="M450 864 L 526 864" stroke="#c98a52" stroke-width="4"/>
     <!-- turtleneck collar (under the chin) -->
     <path d="M222 196 L 272 196 L 276 268 L 218 268 Z" fill="#d3bfa4" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M232 204 L 230 264 M246 204 L 246 266 M260 204 L 262 264" stroke="#bfa98a" stroke-width="3.5"/>
     <!-- oatmeal sweater: shoulders, a waist, a ribbed hem sitting on the lap -->
     <path d="M202 254 Q 248 244 294 254 C 330 262 344 288 340 320 L 320 440 Q 316 482 324 522 L 178 522 Q 184 482 178 440 L 156 320 C 152 288 166 262 202 254 Z" fill="#dccab2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M180 500 L 322 500" stroke="#c6b194" stroke-width="5"/>
     ${[196, 216, 236, 256, 276, 296].map((x) => `<path d="M${x} 504 L ${x} 518" stroke="#c6b194" stroke-width="3"/>`).join('')}
     <path d="M178 440 Q 250 452 320 440" stroke="#c6b194" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M226 300 Q 236 360 230 420" stroke="#c6b194" stroke-width="4" fill="none" stroke-linecap="round"/>
     <!-- arm resting on her lap -->
     ${limb('M186 292 Q 168 420 296 500', '#dccab2', 48)}
     <path d="M276 490 L 300 504" stroke="#c6b194" stroke-width="34" stroke-linecap="round"/>
     <ellipse cx="318" cy="508" rx="24" ry="19" fill="${MOM.skin}" stroke="${INK}" stroke-width="5"/>
     <!-- arm reaching toward Milo -->
     ${limb('M312 284 Q 382 330 466 352', '#dccab2', 48)}
     <path d="M448 348 L 470 354" stroke="#c6b194" stroke-width="34" stroke-linecap="round"/>
     <ellipse cx="490" cy="358" rx="23" ry="20" fill="${MOM.skin}" stroke="${INK}" stroke-width="5"/>
     <path d="M500 344 Q 518 346 520 356" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
     <!-- head -->
     <g transform="translate(150 22) scale(0.8)">${momHead}</g>
     <!-- a long lock falling over her front shoulder, ending in loose waves -->
     <path d="M292 212 C 320 250 334 292 326 334 C 320 366 338 394 328 424 C 322 444 302 450 294 434 C 308 410 292 388 296 358 C 300 326 288 288 276 244 Z" fill="url(#momHair)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M300 240 C 314 290 318 330 312 380" stroke="#6e4428" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    { cut: CUT },
  )

const DAD: Face = { skin: '#f6cfb0', skinSh: '#e2a988', iris: '#5a4a32', blush: '#f08a7e' }

const dadHead = adultHead(DAD, {
  hairFill: '#5a3a24',
  brow: '#4a301e',
  turn: 7,
  jaw: 'M120 26 C 188 26 216 76 214 134 C 212 188 194 230 150 242 Q 120 248 90 242 C 46 230 28 188 26 134 C 24 76 52 26 120 26 Z',
  // short at the sides, swept up on top
  hairFront:
    'M30 132 C 20 76 40 28 96 12 C 128 0 186 6 210 46 C 224 72 222 104 212 132 C 206 106 198 92 188 86 C 172 66 146 58 118 62 C 88 60 62 68 48 88 C 40 102 34 116 30 132 Z',
  strands: `<g stroke="#7a5236" stroke-width="5" fill="none" stroke-linecap="round">
      <path d="M70 52 C 96 30 140 24 172 36"/><path d="M90 40 C 110 20 150 16 180 28"/><path d="M190 56 C 200 70 206 88 208 104"/>
    </g>`,
  // short trimmed full beard along the jaw
  beard: `<path d="M30 146 C 32 198 66 238 120 246 C 174 238 208 198 210 146 C 204 168 194 184 180 196 C 166 184 146 180 120 182 C 94 180 74 184 60 196 C 46 184 36 168 30 146 Z" fill="#6b4a30" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <g stroke="#8a6444" stroke-width="3" stroke-linecap="round" opacity=".8">
      <path d="M52 200 l 6 8"/><path d="M72 222 l 4 9"/><path d="M96 232 l 2 9"/><path d="M144 232 l -2 9"/><path d="M168 222 l -4 9"/><path d="M188 200 l -6 8"/>
    </g>`,
})

/** Dad on the couch, turned toward Milo, pointing up at the magic (640×990). */
export const dadSitting = () =>
  svgDoc(
    640,
    990,
    `<g transform="translate(640 0) scale(-1 1)">
     <!-- far leg (in shadow) -->
     <path d="M452 600 L 512 600 L 516 930 L 454 930 Z" fill="#7b9cc0" stroke="${INK}" stroke-width="5"/>
     <path d="M446 912 L 516 912 L 518 932 Q 562 936 568 966 L 442 966 Q 438 936 446 912 Z" fill="#9a6c3c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <!-- near thigh + lower leg: light-wash jeans -->
     <path d="M184 536 L 520 528 Q 568 530 570 578 Q 568 626 520 628 L 204 632 Q 174 620 184 536 Z" fill="#93b3d3" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M490 596 L 556 596 L 562 930 L 482 930 Z" fill="#93b3d3" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M522 610 L 524 924" stroke="#7b9cc0" stroke-width="4"/>
     <path d="M240 586 Q 370 594 500 584" stroke="#7b9cc0" stroke-width="4" fill="none"/>
     <path d="M500 700 Q 520 710 548 702 M498 800 Q 520 810 552 800 M320 560 Q 360 570 400 560" stroke="#b7cde2" stroke-width="7" fill="none" stroke-linecap="round"/>
     <!-- tan lace-up boot -->
     <path d="M480 910 L 562 910 L 564 932 Q 618 936 624 970 L 476 970 Q 472 938 480 910 Z" fill="#b9844a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M476 960 L 624 960" stroke="#7a5230" stroke-width="8"/>
     <path d="M530 916 L 540 932 M550 916 L 560 934" stroke="#7a5230" stroke-width="4"/>
     <!-- neck -->
     <rect x="240" y="222" width="44" height="60" rx="14" fill="${DAD.skinSh}" stroke="${INK}" stroke-width="5"/>
     <!-- light-grey henley -->
     <path d="M198 266 Q 262 256 326 266 C 366 274 382 302 378 338 L 352 480 Q 348 520 356 558 L 186 558 Q 192 520 186 480 L 158 338 C 154 302 168 274 198 266 Z" fill="#d6d7d3" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <g stroke="#c4c5c0" stroke-width="3">${[190, 214, 238, 312, 336].map((x) => `<path d="M${x} 300 L ${x + 2} 550"/>`).join('')}</g>
     <path d="M188 534 L 354 534" stroke="#c0c1bc" stroke-width="5"/>
     <path d="M186 480 Q 270 494 352 480" stroke="#c0c1bc" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M232 268 Q 262 290 294 268" stroke="#c0c1bc" stroke-width="11" fill="none" stroke-linecap="round"/>
     <path d="M232 268 Q 262 290 294 268" stroke="${INK}" stroke-width="3" fill="none" opacity=".6"/>
     <rect x="266" y="284" width="24" height="98" rx="4" fill="#cfd0cb" stroke="${INK}" stroke-width="3"/>
     ${[304, 332, 360].map((y) => `<circle cx="278" cy="${y}" r="6" fill="#2e2620"/>`).join('')}
     <!-- arm resting on his lap -->
     ${limb('M196 300 Q 174 452 332 546', '#d6d7d3', 56)}
     <ellipse cx="352" cy="552" rx="28" ry="22" fill="${DAD.skin}" stroke="${INK}" stroke-width="5"/>
     <!-- arm raised, pointing up at the stars -->
     ${limb('M346 296 Q 424 276 440 186', '#d6d7d3', 54)}
     <g transform="translate(380 -40)">
       <path d="M36 196 Q 52 178 72 190 L 70 150 Q 70 128 84 130 Q 96 132 94 154 L 94 214 Q 92 244 62 244 Q 32 242 30 214 Z" fill="${DAD.skin}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M40 210 Q 56 204 70 212" stroke="${DAD.skinSh}" stroke-width="4" fill="none" stroke-linecap="round"/>
     </g>
     <!-- head -->
     <g transform="translate(158 40) scale(0.86)">${dadHead}</g>
     </g>`,
    { cut: CUT },
  )

/* --------------------------------------------------------------- Milo -- */

/** Little Milo on the couch, arms up in wonder (420×660, feet at the bottom). */
export const miloSitting = () =>
  svgDoc(
    420,
    660,
    `<g transform="translate(10 10)">
     <!-- dangling legs -->
     <path d="M126 440 L 186 440 L 182 586 L 130 586 Z" fill="#f6c9a4" stroke="${INK}" stroke-width="5"/>
     <path d="M214 440 L 274 440 L 270 586 L 218 586 Z" fill="#f6c9a4" stroke="${INK}" stroke-width="5"/>
     <path d="M124 570 L 186 570 L 186 612 Q 184 636 156 636 L 108 636 Q 92 634 96 618 Q 102 602 124 600 Z" fill="#f6f4ee" stroke="${INK}" stroke-width="5"/>
     <path d="M214 570 L 276 570 L 276 600 Q 298 602 304 618 Q 308 634 292 636 L 244 636 Q 216 636 214 612 Z" fill="#f6f4ee" stroke="${INK}" stroke-width="5"/>
     <!-- shorts / lap -->
     <path d="M100 380 L 300 380 L 312 462 Q 200 474 88 462 Z" fill="#8f9297" stroke="${INK}" stroke-width="5"/>
     <path d="M200 390 L 200 460" stroke="#74777c" stroke-width="5"/>
     <!-- arms up! -->
     ${limb('M128 290 Q 70 230 74 150', '#f6c9a4', 46)}
     ${limb('M272 290 Q 330 230 326 150', '#f6c9a4', 46)}
     <circle cx="74" cy="140" r="28" fill="#f6c9a4" stroke="${INK}" stroke-width="5"/>
     <circle cx="326" cy="140" r="28" fill="#f6c9a4" stroke="${INK}" stroke-width="5"/>
     <!-- tank top -->
     <path d="M136 262 L 160 262 Q 200 306 240 262 L 264 262 Q 270 300 296 316 L 300 400 Q 200 412 100 400 L 104 316 Q 130 300 136 262 Z" fill="#a0a3a8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M160 262 Q 200 306 240 262" stroke="#8c8f94" stroke-width="6" fill="none"/>
     <!-- head (Milo's own) -->
     <g transform="translate(76 0) scale(0.62)">
       ${headParts}
       <g transform="translate(70 165)">${eyesParts}</g>
     </g>
     </g>`,
    { cut: CUT },
  )
