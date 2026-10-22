import { svgUrl } from '../src/art/texture'
import { momSitting, dadSitting, miloSitting } from '../src/art/family'
import { handA, handB, handC, handPoint, handPoint2, HAND_W, HAND_H, POINT_W, POINT_H } from '../src/art/hands'
const out = document.getElementById('out')!
for (const [svg, h] of [[momSitting(), 930], [miloSitting(), 660], [dadSitting(), 992]] as const) {
  const img = new Image(); img.src = svgUrl(svg); img.style.height = h * 0.62 + 'px'; out.appendChild(img)
}

/* ── show-me hand options: A / B / C, large and small, on light paper and a busy patch ── */
const busy =
  'background:' +
  'radial-gradient(circle at 20% 30%,#ff5d73 0 22px,transparent 23px),' +
  'radial-gradient(circle at 70% 20%,#ffd34d 0 30px,transparent 31px),' +
  'radial-gradient(circle at 80% 75%,#3fa9f5 0 34px,transparent 35px),' +
  'radial-gradient(circle at 35% 80%,#7bd389 0 28px,transparent 29px),' +
  'repeating-linear-gradient(45deg,#8e5cd9 0 14px,#f7a8d8 14px 28px)'
const hands = document.createElement('div')
hands.style.cssText = 'display:flex;flex-direction:column;gap:14px;font:600 16px Fredoka,sans-serif;color:#3b2a20'
for (const [bgName, bg] of [['light paper', 'background:#f6ecd6'], ['busy colour', busy], ['dark wood', 'background:#6b4a2f']] as const) {
  const row = document.createElement('div')
  row.style.cssText = `display:flex;gap:18px;align-items:flex-end;padding:14px 20px;border-radius:12px;${bg}`
  const lab = document.createElement('div'); lab.textContent = bgName; lab.style.cssText = 'width:70px;align-self:center;background:#fffa;padding:4px 6px;border-radius:6px'
  row.appendChild(lab)
  const opts = [['Point', handPoint, POINT_W, POINT_H], ['Point2', handPoint2, POINT_W, POINT_H], ['A', handA, HAND_W, HAND_H], ['B', handB, HAND_W, HAND_H], ['C', handC, HAND_W, HAND_H]] as const
  for (const [name, svg, bw, bh] of opts)
    for (const px of [230, 100]) {
      const cell = document.createElement('div')
      cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px'
      const img = new Image(); img.src = svgUrl(svg)
      img.style.cssText = `width:${px}px;height:${(px * bh) / bw}px`
      const t = document.createElement('div'); t.textContent = name + ' ' + px
      t.style.cssText = 'background:#fffa;padding:1px 6px;border-radius:6px;font-size:13px'
      cell.append(img, t); row.appendChild(cell)
    }
  hands.appendChild(row)
}
document.body.prepend(hands)
document.body.style.flexWrap = 'wrap'
hands.style.width = '100%'
