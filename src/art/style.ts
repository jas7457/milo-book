/*
 * The book's illustration style: flat colour, one shade tone, a few
 * highlights, and warm dark-brown ink outlines (never pure black).
 */

export const INK = '#3b2a20'

/** A rounded limb/tube drawn as a thick stroke with an ink outline. */
export const limb = (d: string, fill: string, w: number, ink = 5) =>
  `<path d="${d}" stroke="${INK}" stroke-width="${w + ink * 2}" stroke-linecap="round" fill="none"/>
   <path d="${d}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`

/** Deterministic pseudo-random numbers, so art is identical every load. */
export function rand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Wavy wood-grain lines inside a box. */
export function woodGrain(x: number, y: number, w: number, h: number, color: string, seed = 1, n = 4) {
  const r = rand(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const yy = y + ((i + 0.5) / n) * h + (r() - 0.5) * (h / n) * 0.6
    const a = (r() - 0.5) * h * 0.25
    const b = (r() - 0.5) * h * 0.25
    out += `<path d="M${x} ${yy.toFixed(1)} C ${(x + w * 0.3).toFixed(1)} ${(yy + a).toFixed(1)} ${(x + w * 0.6).toFixed(1)} ${(yy - b).toFixed(1)} ${x + w} ${(yy + a * 0.5).toFixed(1)}" stroke="${color}" stroke-width="2.5" fill="none" opacity=".55"/>`
    if (r() < 0.35) {
      const kx = x + r() * w
      out += `<ellipse cx="${kx.toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(8 + r() * 10).toFixed(1)}" ry="${(3 + r() * 3).toFixed(1)}" fill="none" stroke="${color}" stroke-width="2.5" opacity=".6"/>`
    }
  }
  return out
}
