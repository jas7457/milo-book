import * as THREE from 'three'
import { PAGE_TEX_H, PAGE_TEX_W } from '../config'
import { loadSvgImage } from '../art/texture'
import type { SpreadDef } from '../story/types'

export const FONT = 'Fredoka'
let fontsReady: Promise<unknown> | null = null
export function waitFonts() {
  fontsReady ??= Promise.all([
    document.fonts.load(`500 40px ${FONT}`),
    document.fonts.load(`600 40px ${FONT}`),
    document.fonts.load(`700 40px ${FONT}`),
  ])
  return fontsReady
}

function makeCanvas(w = PAGE_TEX_W, h = PAGE_TEX_H) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Cream paper with fibres and speckles. */
function paper(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  ctx.fillStyle = '#fbf3e2'
  ctx.fillRect(0, 0, w, h)
  fibres(ctx, w, h, seed, 1)
}

function fibres(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, k: number) {
  const r = rng(seed)
  for (let i = 0; i < 1400 * k; i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(110,80,40,${0.05 * k})` : `rgba(255,255,255,${0.22 * k})`
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
  }
  ctx.strokeStyle = `rgba(130,100,60,${0.06 * k})`
  ctx.lineWidth = 1
  for (let i = 0; i < 90 * k; i++) {
    const x = r() * w
    const y = r() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + r() * 30 - 15, y + r() * 30 - 15, x + r() * 40 - 20, y + r() * 40 - 20)
    ctx.stroke()
  }
}

/** The gutter shadow where the page curves into the spine. */
function spineShade(ctx: CanvasRenderingContext2D, w: number, h: number, spine: 'left' | 'right') {
  const g =
    spine === 'left' ? ctx.createLinearGradient(0, 0, w * 0.14, 0) : ctx.createLinearGradient(w, 0, w * 0.86, 0)
  g.addColorStop(0, 'rgba(60,40,20,0.38)')
  g.addColorStop(0.3, 'rgba(60,40,20,0.12)')
  g.addColorStop(1, 'rgba(60,40,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // a soft light catching the curve, just off the gutter
  const x0 = spine === 'left' ? w * 0.03 : w * 0.97
  const l = ctx.createLinearGradient(x0, 0, spine === 'left' ? x0 + w * 0.05 : x0 - w * 0.05, 0)
  l.addColorStop(0, 'rgba(255,250,235,0)')
  l.addColorStop(0.5, 'rgba(255,250,235,0.10)')
  l.addColorStop(1, 'rgba(255,250,235,0)')
  ctx.fillStyle = l
  ctx.fillRect(0, 0, w, h)
}

/** A printed double rule just inside the page edge, with little corner stars. */
function pageBorder(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.save()
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.75
  ctx.lineWidth = 3
  ctx.strokeRect(38, 38, w - 76, h - 76)
  ctx.lineWidth = 1.5
  ctx.strokeRect(48, 48, w - 96, h - 96)
  ctx.fillStyle = accent
  for (const [x, y] of [[43, 43], [w - 43, 43], [43, h - 43], [w - 43, h - 43]]) {
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const rad = i % 2 ? 4 : 11
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad)
    }
    ctx.fill()
  }
  ctx.restore()
}

/** Draw one half of a spread painting onto a page canvas. */
async function drawHalf(ctx: CanvasRenderingContext2D, svg: string, half: 0 | 1, w: number, h: number) {
  const img = await loadSvgImage(svg)
  const sw = img.width / 2
  ctx.drawImage(img, half * sw, 0, sw, img.height, 0, 0, w, h)
}

async function drawSvg(ctx: CanvasRenderingContext2D, svg: string, x: number, y: number, w: number, h: number, mode: 'contain' | 'cover' = 'contain') {
  const img = await loadSvgImage(svg)
  const ir = img.width / img.height
  let dw = w
  let dh = h
  if ((mode === 'contain') === ir > w / h) dh = w / ir
  else dw = h * ir
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

type Tok = { word: string; em: boolean; tail?: string }
function tokenize(line: string): Tok[] {
  const out: Tok[] = []
  // *emphasis* may be followed directly by punctuation: "*Milo*." → Milo + "."
  const re = /\*([^*]+)\*([^\s*]*)|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m[1]) {
      const ws = m[1].split(/\s+/)
      ws.forEach((w, i) => out.push({ word: w, em: true, tail: i === ws.length - 1 ? m![2] : '' }))
    } else out.push({ word: m[3], em: false })
  }
  return out
}

/**
 * Lay out story text: left-aligned, with a big drop cap on the first
 * paragraph. Words in *stars* are bold in the accent colour.
 * Returns the total height; draws only when `draw` is true.
 */
function layoutText(
  ctx: CanvasRenderingContext2D,
  paras: string[],
  x: number,
  y: number,
  maxW: number,
  size: number,
  accent: string,
  draw: boolean,
) {
  const lh = size * 1.3
  const font = (em: boolean) => `${em ? 700 : 600} ${size}px ${FONT}`
  const width = (t: Tok) => {
    ctx.font = font(t.em)
    let w = ctx.measureText(t.word + ' ').width
    if (t.tail) {
      ctx.font = font(false)
      w += ctx.measureText(t.tail).width
    }
    return w
  }
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  let cy = y + size
  paras.forEach((p, pi) => {
    const toks = tokenize(p)
    // drop cap: pull the first letter off the first word
    let capW = 0
    if (pi === 0 && toks.length) {
      const first = toks[0]
      const cap = first.word[0]
      first.word = first.word.slice(1)
      ctx.font = `700 ${size * 2.45}px ${FONT}`
      capW = ctx.measureText(cap).width + size * 0.22
      if (draw) {
        ctx.fillStyle = accent
        ctx.fillText(cap, x - size * 0.04, cy + lh - size * 0.08)
      }
    }
    const lines: Tok[][] = [[]]
    let lw = 0
    const avail = (li: number) => maxW - (li < 2 ? capW : 0)
    for (const t of toks) {
      const ww = width(t)
      if (lw + ww > avail(lines.length - 1) && lines[lines.length - 1].length) {
        lines.push([])
        lw = 0
      }
      lines[lines.length - 1].push(t)
      lw += ww
    }
    lines.forEach((line, li) => {
      let cx = x + (li < 2 ? capW : 0)
      if (draw)
        for (const t of line) {
          ctx.font = font(t.em)
          ctx.fillStyle = t.em ? accent : '#2e2017'
          ctx.fillText(t.word, cx, cy)
          if (t.tail) {
            const ww = ctx.measureText(t.word).width
            ctx.font = font(false)
            ctx.fillStyle = '#2e2017'
            ctx.fillText(t.tail, cx + ww, cy)
          }
          cx += width(t)
        }
      cy += lh
    })
    if (pi === 0 && lines.length < 2) cy += lh * (2 - lines.length)
    cy += size * 0.45
  })
  return cy - y - lh + size * 0.35
}

/** The accent, deepened so it reads as text on cream paper. */
function inkAccent(hex: string) {
  const c = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  c.setHSL(hsl.h, Math.min(1, hsl.s * 1.05), Math.min(hsl.l, 0.42))
  return '#' + c.getHexString()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** Story-card layout, in logical px (the canvas is drawn at 2× for crisp text). */
const CARD = { w: 900, size: 54, pad: 52, head: 54, scale: 2 }

/**
 * The story card as its own crisp texture. It stands up off the left page as
 * a propped-up pop-up card, angled toward the reader, so the words aren't
 * squashed by the page's perspective. Resolves once fonts are ready.
 */
export async function storyCardTexture(s: SpreadDef) {
  await waitFonts()
  const accent = inkAccent(s.palette.accent)
  const { w, size, pad, scale } = CARD
  const headH = s.heading ? CARD.head : 0
  const probe = makeCanvas(8, 8).getContext('2d')!
  const textH = layoutText(probe, s.text ?? [], 0, 0, w - pad * 2, size, accent, false)
  const h = Math.ceil(pad * 2 + headH + textH)
  const canvas = makeCanvas(w * scale, h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  ctx.fillStyle = '#fdf8ec'
  roundRect(ctx, 0, 0, w, h, 26)
  ctx.fill()
  fibresIn(ctx, 0, 0, w, h)
  ctx.save()
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 3
  roundRect(ctx, 14, 14, w - 28, h - 28, 16)
  ctx.stroke()
  ctx.restore()
  if (s.heading) {
    ctx.save()
    ctx.font = `600 28px ${FONT}`
    ctx.fillStyle = accent
    ctx.letterSpacing = '6px'
    ctx.fillText(s.heading.toUpperCase(), pad, pad + 22)
    ctx.restore()
  }
  layoutText(ctx, s.text ?? [], pad, pad + headH, w - pad * 2, size, accent, true)
  const tex = finish(canvas, false)
  tex.anisotropy = 16
  return { tex, aspect: w / h }
}

function fibresIn(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 22)
  ctx.clip()
  ctx.translate(x, y)
  fibres(ctx, w, h, 5, 0.8)
  ctx.restore()
}

function pageNumber(ctx: CanvasRenderingContext2D, n: number, x: number, y: number, accent: string) {
  ctx.save()
  ctx.fillStyle = accent
  ctx.font = `600 24px ${FONT}`
  ctx.textAlign = 'center'
  ctx.globalAlpha = 0.9
  ctx.fillText(`\u2014  ${n}  \u2014`, x, y)
  ctx.restore()
}

function finish(canvas: HTMLCanvasElement, mirror: boolean) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (mirror) {
    tex.repeat.x = -1
    tex.offset.x = 1
  }
  return tex
}

/** Paint one page of a spread: painting half, paper grain, gutter, border, text. */
function pageTexture(s: SpreadDef, index: number, side: 0 | 1, mirror: boolean) {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  paper(ctx, w, h, index * 31 + side * 7)
  spineShade(ctx, w, h, side ? 'left' : 'right')
  const tex = finish(canvas, mirror)
  ;(async () => {
    await waitFonts()
    const accent = s.palette.accent
    if (s.spreadArt) await drawHalf(ctx, s.spreadArt, side, w, h)
    fibres(ctx, w, h, index * 13 + side, 0.6)
    spineShade(ctx, w, h, side ? 'left' : 'right')
    pageBorder(ctx, w, h, accent)
    pageNumber(ctx, index * 2 - 1 + side, w / 2, h - 60, accent)
    tex.needsUpdate = true
  })()
  return tex
}

/** Left page of a spread (spine on its right edge). */
export const leftPageTexture = (s: SpreadDef, index: number, mirror: boolean) => pageTexture(s, index, 0, mirror)
/** Right page of a spread (spine on its left edge). */
export const rightPageTexture = (s: SpreadDef, index: number) => pageTexture(s, index, 1, false)

export function blankPageTexture(mirror: boolean, seed = 1) {
  const canvas = makeCanvas(256, Math.round((256 * PAGE_TEX_H) / PAGE_TEX_W))
  const ctx = canvas.getContext('2d')!
  paper(ctx, canvas.width, canvas.height, seed)
  spineShade(ctx, canvas.width, canvas.height, mirror ? 'right' : 'left')
  return finish(canvas, mirror)
}

/** The front cover: cloth board, illustration and title. */
export function coverTexture(art: string, title: string[], subtitle: string) {
  const canvas = makeCanvas(900, Math.round((900 * PAGE_TEX_H) / PAGE_TEX_W))
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#c8362f'
  ctx.fillRect(0, 0, w, h)
  const tex = finish(canvas, false)
  ;(async () => {
    await waitFonts()
    await drawSvg(ctx, art, 0, 0, w, h, 'cover')
    // cloth weave
    const r = rng(99)
    ctx.globalAlpha = 0.06
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = r() < 0.5 ? '#000' : '#fff'
      ctx.fillRect(0, y, w, 1)
    }
    ctx.globalAlpha = 1
    // title
    ctx.textAlign = 'center'
    let y = 150
    for (const [i, line] of title.entries()) {
      const size = i === 0 ? 132 : 92
      ctx.font = `700 ${size}px ${FONT}`
      ctx.lineJoin = 'round'
      ctx.lineWidth = 22
      ctx.strokeStyle = '#5a1712'
      ctx.strokeText(line, w / 2, y)
      ctx.lineWidth = 10
      ctx.strokeStyle = '#fff6e0'
      ctx.strokeText(line, w / 2, y)
      ctx.fillStyle = i === 0 ? '#ffcb2f' : '#ffffff'
      ctx.fillText(line, w / 2, y)
      y += size * 0.95
    }
    ctx.font = `600 40px ${FONT}`
    ctx.fillStyle = '#fff6e0'
    ctx.fillText(subtitle, w / 2, h - 60)
    ctx.textAlign = 'left'
    // board edge bevel
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 18
    ctx.strokeRect(0, 0, w, h)
    tex.needsUpdate = true
  })()
  return tex
}
