import { svgDoc } from './texture'
import { headParts, eyesParts } from '../milo/art'
import { INK, limb } from './style'
import { DAD, MOM, dadHead, momHairGrad, momHead, type Face } from './family'

/*
 * The family hug for spread 7 ("Home again"): Mom and Dad kneel and wrap Milo
 * (in pyjamas) in the biggest, squeeziest hug.
 * Faces come from family.ts so the likeness is identical everywhere.
 */

/* --------------------------------------------------------- the hug -- */

/** The hug art is drawn on a 1500×1000 grid, then cropped to HUG.w × HUG.h. */
const CROP = { x: 50, y: 190 }
export const HUG = { w: 1400, h: 800 }
/** hug-grid point → pixel in the cropped art */
export const hugPx = (x: number, y: number): [number, number] => [x - CROP.x, y - CROP.y]

const MX = 750 // Milo's centre line
export const MILO_EYES = { cx: MX, cy: 353, s: 0.52 } // eyes group centre & head scale

/** A parent kneeling (facing right, toward Milo), everything but the head. */
function kneeler(o: {
  trouser: string
  trouserDk: string
  boot: string
  bootSole: string
  top: string
  topDk: string
  topLine: string
  wide: number
  armY: number
  detail: string
  hairBack?: string
}) {
  const w = o.wide
  return `
    ${o.hairBack ?? ''}
    <!-- far leg, in shadow -->
    ${limb('M476 744 L 600 925', o.trouserDk, 80)}
    ${limb('M598 930 L 320 944', o.trouserDk, 58)}
    <!-- near leg: thigh to the knee, shin along the floor, boot -->
    ${limb('M440 732 L 586 912', o.trouser, 88)}
    ${limb('M586 920 L 300 932', o.trouser, 64)}
    <path d="M440 770 Q 500 800 560 850" stroke="${o.trouserDk}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M500 922 L 330 930" stroke="${o.trouserDk}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M308 896 L 250 900 Q 194 908 190 940 L 194 968 L 308 968 Z" fill="${o.boot}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M194 960 L 308 960" stroke="${o.bootSole}" stroke-width="9"/>
    <path d="M262 904 L 266 926 M284 902 L 288 926" stroke="${o.bootSole}" stroke-width="4" stroke-linecap="round"/>
    <!-- torso leaning in -->
    <path d="M${440 - w} 484 Q ${462 - w} 450 500 442 L 548 442 Q ${586 + w} 450 ${608 + w} 490 L ${592 + w * 0.3} 706 L ${420 - w * 0.3} 712 Q ${410 - w} 590 ${440 - w} 484 Z" fill="${o.top}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${432 - w} 604 Q 510 622 ${598 + w} 600 L ${592 + w * 0.3} 706 L ${420 - w * 0.3} 712 Q ${414 - w} 660 ${432 - w} 604 Z" fill="${o.topDk}" opacity=".35"/>
    ${o.detail}`
}

/** The arm that wraps round Milo (shoulder, elbow, hand on his back), drawn over his body. */
function kneelerArm(o: { top: string; topLine: string; wide: number; armY: number }) {
  const w = o.wide
  return `
    ${limb(`M${598 + w} ${498 + o.armY} Q ${632 + w} ${668 + o.armY * 0.4} 812 ${592 + o.armY}`, o.top, 46)}
    <path d="M${616 + w} ${540 + o.armY} Q ${640 + w} ${640 + o.armY * 0.5} 700 ${628 + o.armY * 0.7}" stroke="${o.topLine}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M790 ${580 + o.armY} L 806 ${590 + o.armY}" stroke="${o.topLine}" stroke-width="40" stroke-linecap="round"/>`
}

function hand(x: number, y: number, f: Face, flip = false) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">
    <ellipse cx="0" cy="0" rx="27" ry="23" fill="${f.skin}" stroke="${INK}" stroke-width="5"/>
    <path d="M10 -14 Q 24 -12 26 -2 M12 -2 Q 26 2 26 12 M6 10 Q 18 20 18 22" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M-14 10 Q -2 16 10 12" stroke="${f.skinSh}" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>`
}

const pjStars = (pts: number[][], s = 1) =>
  pts
    .map(([x, y]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 l4 8 9 1.4 -6.6 6.2 1.8 9 -8.2 -4.4 -8.2 4.4 1.8 -9 -6.6 -6.2 9 -1.4z" fill="#ffe27a"/>`)
    .join('')

export const hugGroup = () =>
  svgDoc(
    HUG.w,
    HUG.h,
    `${momHairGrad}
     <g transform="translate(${-CROP.x} ${-CROP.y})">
     <!-- Dad (mirrored kneeler) -->
     <g transform="translate(1500 0) scale(-1 1)">
       ${kneeler({
         trouser: '#93b3d3',
         trouserDk: '#7b9cc0',
         boot: '#b9844a',
         bootSole: '#7a5230',
         top: '#d6d7d3',
         topDk: '#b8b9b4',
         topLine: '#c0c1bc',
         wide: 10,
         armY: -44,
         detail: `<path d="M424 700 L 596 696" stroke="#c0c1bc" stroke-width="5"/>
           <g stroke="#c4c5c0" stroke-width="3">${[456, 482, 556, 580].map((x) => `<path d="M${x} 480 L ${x + 2} 690"/>`).join('')}</g>
           <path d="M480 444 Q 524 478 568 444" stroke="#c0c1bc" stroke-width="11" fill="none" stroke-linecap="round"/>
           <path d="M480 444 Q 524 478 568 444" stroke="${INK}" stroke-width="3" fill="none" opacity=".55"/>
           <rect x="506" y="458" width="26" height="130" rx="4" fill="#cfd0cb" stroke="${INK}" stroke-width="3"/>
           ${[486, 520, 554].map((y) => `<circle cx="519" cy="${y}" r="6.5" fill="#2e2620"/>`).join('')}
           <path d="M470 600 Q 536 616 600 598" stroke="#a9aaa5" stroke-width="4" fill="none" stroke-linecap="round"/>
           <path d="M560 760 Q 590 790 596 830 M470 840 Q 520 856 560 840" stroke="#b7cde2" stroke-width="6" fill="none" stroke-linecap="round"/>`,
       })}
     </g>
     <!-- Mom: hair falling down her back, then the kneeler -->
     ${kneeler({
       trouser: '#7a4a2c',
       trouserDk: '#643a21',
       boot: '#a8622f',
       bootSole: '#6e3a18',
       top: '#dccab2',
       topDk: '#c6b194',
       topLine: '#c6b194',
       wide: 0,
       armY: 0,
       hairBack: `<path d="M486 300 C 392 330 362 470 374 566 C 360 626 380 656 366 708 C 380 736 424 728 434 696 C 454 730 494 720 502 684 C 516 700 548 690 552 662 L 612 330 Z" fill="url(#momHair)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
         <g stroke="#6e4428" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M446 360 C 420 440 436 520 418 600 C 410 640 424 672 416 700"/><path d="M486 400 C 470 480 486 560 474 640"/></g>`,
       detail: `<path d="M422 696 L 594 692" stroke="#c6b194" stroke-width="5"/>
         ${[434, 456, 478, 500, 522, 544, 566].map((x) => `<path d="M${x} 698 L ${x} 711" stroke="#c6b194" stroke-width="3"/>`).join('')}
         <path d="M456 520 Q 464 580 458 650 M530 500 Q 538 570 534 640" stroke="#c6b194" stroke-width="4" fill="none" stroke-linecap="round"/>
         <path d="M480 408 L 568 408 L 574 480 L 474 480 Z" fill="#d3bfa4" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
         <path d="M490 416 L 488 476 M508 416 L 508 478 M528 416 L 528 478 M548 416 L 550 476" stroke="#bfa98a" stroke-width="3.5"/>`,
     })}

     <!-- Milo: slippers, pyjama trousers, top -->
     <path d="M692 934 Q 668 938 670 958 Q 672 974 700 974 L 760 974 L 758 940 Z" fill="#5fb3b0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M808 934 Q 832 938 830 958 Q 828 974 800 974 L 742 974 L 744 940 Z" fill="#5fb3b0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <g fill="#8fd3cf" stroke="${INK}" stroke-width="2.5">${[684, 700, 716, 784, 800, 816].map((x) => `<circle cx="${x}" cy="958" r="6"/>`).join('')}</g>
     <rect x="696" y="900" width="56" height="42" fill="#f8cba6" stroke="${INK}" stroke-width="5"/>
     <rect x="748" y="900" width="56" height="42" fill="#f8cba6" stroke="${INK}" stroke-width="5"/>
     <path d="M676 724 L 824 724 L 820 926 L 748 926 L 750 800 L 746 926 L 680 926 Z" fill="#4f70c4" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M680 902 L 746 902 M754 902 L 820 902" stroke="#7d9be6" stroke-width="12"/>
     <path d="M750 740 L 750 800" stroke="#3d5aa6" stroke-width="4"/>
     ${pjStars([[706, 800], [790, 840], [712, 870], [788, 770]], 0.85)}
     <path d="M690 478 L 730 470 Q 750 494 770 470 L 810 478 Q 828 500 830 540 L 824 740 Q 750 756 676 740 L 670 540 Q 672 500 690 478 Z" fill="#5a7fd8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
     <path d="M676 700 Q 750 716 824 700 L 824 740 Q 750 756 676 740 Z" fill="#4262b5" opacity=".5"/>
     <path d="M730 470 Q 750 494 770 470" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>
     ${pjStars([[706, 560], [796, 600], [722, 650], [790, 690], [752, 536]], 0.95)}
     <rect x="728" y="430" width="44" height="52" rx="14" fill="#eaa987" stroke="${INK}" stroke-width="5"/>

     <!-- the parents' arms wrapping round Milo -->
     ${kneelerArm({ top: '#dccab2', topLine: '#c6b194', wide: 0, armY: 0 })}
     <g transform="translate(1500 0) scale(-1 1)">${kneelerArm({ top: '#d6d7d3', topLine: '#c0c1bc', wide: 10, armY: -44 })}</g>

     <!-- Milo hugging Mom and Dad round the neck -->
     ${limb('M702 510 Q 650 506 598 466', '#5a7fd8', 38)}
     ${limb('M798 510 Q 850 506 902 466', '#5a7fd8', 38)}
     <path d="M676 504 L 680 526" stroke="#7d9be6" stroke-width="5" stroke-linecap="round"/>
     <path d="M824 504 L 820 526" stroke="#7d9be6" stroke-width="5" stroke-linecap="round"/>
     ${hand(590, 462, { skin: '#f8cba6', skinSh: '#eaa987', iris: '', blush: '' }, true)}
     ${hand(910, 462, { skin: '#f8cba6', skinSh: '#eaa987', iris: '', blush: '' })}

     <!-- Mom's and Dad's hands, gripping Milo's back -->
     ${hand(824, 592, MOM)}
     ${hand(676, 548, DAD, true)}

     <rect x="948" y="392" width="56" height="64" rx="16" fill="#e2a988" stroke="${INK}" stroke-width="5"/>
     <!-- heads, tilted in toward Milo -->
     <g transform="translate(466 226) rotate(12 90 101) scale(0.76)">${momHead}</g>
     <g transform="translate(858 216) rotate(-12 90 101) scale(0.76)">${dadHead}</g>
     <g transform="translate(${MX - 200 * 0.52} 241) scale(0.52)">${headParts}</g>
     </g>`,
    { cut: 5 },
  )

/** Milo's open eyes (the head above is drawn without eyes — they are a Part). */
export const miloEyesOpen = () => svgDoc(260, 100, eyesParts)

/** Fast-asleep eyes: two soft crescents with little lashes. */
export const miloEyesClosed = () =>
  svgDoc(
    260,
    100,
    [78, 182]
      .map(
        (cx) => `
      <path d="M${cx - 34} 40 Q ${cx} 76 ${cx + 34} 40" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 34} 40 l -9 -3 M${cx - 22} 56 l -8 5 M${cx + 34} 40 l 9 -3 M${cx + 22} 56 l 8 5" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      )
      .join(''),
    { grain: 0 },
  )
