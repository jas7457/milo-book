import { svgUrl } from '../src/art/texture'
import { momSitting, dadSitting, miloSitting } from '../src/art/family'
const out = document.getElementById('out')!
for (const [svg, h] of [[momSitting(), 930], [miloSitting(), 660], [dadSitting(), 992]] as const) {
  const img = new Image(); img.src = svgUrl(svg); img.style.height = h * 0.62 + 'px'; out.appendChild(img)
}
