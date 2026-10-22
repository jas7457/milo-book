import * as THREE from 'three'

/** Colour mood of a world. Everything in the environment blends between these. */
export type Palette = {
  skyTop: string
  skyBottom: string
  ground: string
  ground2: string // speckle / pattern colour on the ground
  sun: string
  sunIntensity: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  fogNear: number
  fogFar: number
  /** page paper tint for printed pages */
  accent: string
}

export type Outfit = 'plain' | 'tools' | 'hardhat' | 'firefighter' | 'superhero' | 'pajamas'

/**
 * Per-frame animation values. These are mutated by GSAP timelines and read in
 * useFrame loops, so they live outside React state (no re-renders).
 */
export const anim = {
  /** turn progress per leaf: 0 = resting on the right, 1 = turned to the left */
  leaves: [] as { p: number }[],
  /** how "popped up" each spread's pop-ups are, 0..1 */
  raise: [] as { v: number }[],
  /** how present each world is, 0..1 (keyed by world id) */
  presence: {} as Record<string, { v: number }>,
  /** environment blend from `from` palette to `to` palette */
  env: { t: 1 },
  envFrom: null as Palette | null,
  envTo: null as Palette | null,
  /** camera: 0 = closed book framing, 1 = open book framing; push = dive-in */
  cam: { open: 0, push: 0 },
  /** Milo's twirl when changing outfit */
  milo: { spin: 0 },
  time: 0,
}

/** Pointer state shared between 3D widgets and the DOM controls. */
export const ui = {
  /** a 3D widget (e.g. a pull tab) owns the current drag: don't swipe-turn */
  grab: false,
  /** something is being dragged right now: hold the camera parallax still */
  dragging: false,
}

export function initAnim(spreadCount: number, worldIds: string[]) {
  anim.leaves = Array.from({ length: spreadCount }, () => ({ p: 0 }))
  anim.raise = Array.from({ length: spreadCount }, () => ({ v: 0 }))
  for (const id of worldIds) anim.presence[id] ??= { v: 0 }
}

const ca = new THREE.Color()
const cb = new THREE.Color()
export function mixColor(a: string, b: string, t: number, out: THREE.Color) {
  ca.set(a)
  cb.set(b)
  return out.copy(ca).lerp(cb, t)
}
