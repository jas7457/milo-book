import * as THREE from 'three'
import { PAGE_H, PAGE_W } from '../config'

const SEG_U = 28
const SEG_V = 3

/**
 * A page leaf as a grid. u runs from the spine (0) to the outer edge (1),
 * v runs from the near edge (0, +z) to the far edge (1, −z), so the top of the
 * page texture is the far side of the book.
 */
export function createLeafGeometry() {
  const g = new THREE.BufferGeometry()
  const cols = SEG_U + 1
  const rows = SEG_V + 1
  const pos = new Float32Array(cols * rows * 3)
  const uv = new Float32Array(cols * rows * 2)
  const idx: number[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i
      uv[k * 2] = i / SEG_U
      uv[k * 2 + 1] = j / SEG_V
    }
  }
  for (let j = 0; j < SEG_V; j++) {
    for (let i = 0; i < SEG_U; i++) {
      const a = j * cols + i
      const b = a + 1
      const c = a + cols
      const d = c + 1
      idx.push(a, b, c, b, d, c)
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

const xs = new Float32Array(SEG_U + 1)
const ys = new Float32Array(SEG_U + 1)

/**
 * Bend the leaf for turn progress p (0 = flat on the right, 1 = flat on the
 * left). The page curls: near the spine it leads, the outer edge lags behind,
 * like a real page being lifted by its corner.
 */
export function bendLeaf(g: THREE.BufferGeometry, p: number, yRight: number, yLeft: number, dir: 1 | -1, stiffness = 1) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  const cols = SEG_U + 1
  const rows = SEG_V + 1
  const theta = p * Math.PI
  const lift = Math.sin(p * Math.PI)
  const curl = 0.95 * lift * stiffness
  // flatten the curve as it settles so the page lies perfectly flat at rest
  const du = PAGE_W / SEG_U
  let x = 0
  let y = 0
  xs[0] = 0
  ys[0] = 0
  for (let i = 1; i <= SEG_U; i++) {
    const t = (i - 0.5) / SEG_U
    // the outer part trails behind the direction of travel (soft S-curve)
    const phi = theta - dir * curl * (t * t * (3 - 2 * t))
    x += Math.cos(phi) * du
    y += Math.sin(phi) * du
    xs[i] = x
    ys[i] = y
  }
  const baseY = yRight + (yLeft - yRight) * p + lift * 0.02
  for (let j = 0; j < rows; j++) {
    const z = PAGE_H / 2 - (j / SEG_V) * PAGE_H
    // tiny droop along the far/near edge while lifted gives it a paper feel
    const zt = j / SEG_V - 0.5
    for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 3
      const edge = i / SEG_U
      pos.array[k] = xs[i]
      pos.array[k + 1] = baseY + ys[i] - lift * edge * edge * zt * zt * 0.08
      pos.array[k + 2] = z
    }
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  g.computeBoundingSphere()
}
