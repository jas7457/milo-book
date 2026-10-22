import { create } from 'zustand'
import gsap from 'gsap'
import { T } from './config'
import { anim, type Outfit, type Palette } from './state'
import { spreads } from './story/spreads'
import { bus } from './bus'
import { mixPalette } from './story/palettes'
import { isDone, resetAll, resetProgress } from './progress'

type Store = {
  spread: number
  busy: boolean
  /** the spread whose neighbours are mounted: moves only once a turn's animation has fully played out */
  settled: number
  outfit: Outfit
  started: boolean
  go: (dir: 1 | -1) => void
  /** from the back cover: flip the whole book back to the front cover */
  restart: () => void
  start: () => void
}

/** bumps with every turn, so only the latest turn moves `settled` */
let turnId = 0

export const useBook = create<Store>((set, get) => ({
  spread: 0,
  busy: false,
  settled: 0,
  started: false,
  outfit: spreads[0].outfit,
  start: () => set({ started: true }),
  restart: () => {
    const { spread: from, busy } = get()
    if (busy || from === 0) return
    set({ busy: true, spread: 0 })
    resetAll()
    const id = ++turnId
    flipBack(from, () => set({ busy: false }), (outfit) => set({ outfit })).eventCallback('onComplete', () => {
      if (id === turnId) set({ settled: 0 })
    })
  },
  go: (dir) => {
    const { spread: from, busy } = get()
    const to = from + dir
    if (busy || to < 0 || to >= spreads.length) return
    // you have to finish a page (its interactions + its story) before moving on
    if (dir > 0 && !isDone(spreads[from].id)) return
    resetProgress(spreads[to].id)
    set({ busy: true, spread: to })
    const id = ++turnId
    turn(from, to, () => set({ busy: false }), (outfit) => set({ outfit })).eventCallback('onComplete', () => {
      // a newer turn started before this one finished playing: that one settles instead
      if (id === turnId) set({ settled: to })
    })
  },
}))

/**
 * The page-turn choreography. Everything that happens when you turn a page is
 * here, on one GSAP timeline, so it's easy to tune:
 *
 *  0.00  current pop-ups fold flat ............ world starts folding away
 *  0.35  sky / ground / light start bleeding into the new palette
 *  0.40  the page lifts and turns (camera dives in a little)
 *  1.25  the new world unfolds, nearest pieces first
 *  1.45  the new pop-ups spring up
 */
function turn(from: number, to: number, done: () => void, setOutfit: (o: Outfit) => void) {
  const dir = to > from ? 1 : -1
  const a = spreads[from]
  const b = spreads[to]
  const leaf = dir > 0 ? from : to
  const tl = gsap.timeline()

  bus.emit('turn', { from, to })

  // whatever a page did to the room lights, the next page starts lit
  gsap.killTweensOf(anim.lights)
  tl.to(anim.lights, { dark: 0, duration: 0.9, ease: 'sine.inOut' }, 0)

  // pop-ups fold down
  tl.to(anim.raise[from], { v: 0, duration: T.popDown, ease: 'power1.in', overwrite: 'auto' }, 0)

  // world swap (only if the world actually changes)
  if (a.world !== b.world) {
    tl.to(anim.presence[a.world], { v: 0, duration: T.worldOut, ease: 'power1.in', overwrite: 'auto' }, 0)
    tl.to(anim.presence[b.world], { v: 1, duration: T.worldIn, ease: 'power1.out', overwrite: 'auto' }, T.worldInAt)
  }

  // environment colour bleed
  const current: Palette =
    anim.envFrom && anim.envTo ? mixPalette(anim.envFrom, anim.envTo, anim.env.t) : a.palette
  anim.envFrom = current
  anim.envTo = b.palette
  anim.env.t = 0
  tl.to(anim.env, { t: 1, duration: T.env, ease: 'sine.inOut', overwrite: 'auto' }, T.envAt)

  // the page itself — or, at the end, the whole back of the book closing over
  const closing = b.closed === 'back' || a.closed === 'back'
  if (closing && dir < 0) tl.to(anim.back, { slide: 0, duration: 0.7, ease: 'power2.inOut' }, 0)
  const at = closing && dir < 0 ? T.turnAt + 0.4 : T.turnAt
  tl.to(anim.leaves[leaf], { p: dir > 0 ? 1 : 0, duration: T.turn, ease: 'power2.inOut' }, at)
  if (closing) tl.to(anim.back, { v: dir > 0 ? 1 : 0, duration: T.turn, ease: 'power2.inOut' }, at)
  if (closing && dir > 0) tl.to(anim.back, { slide: 1, duration: 0.9, ease: 'power2.inOut' }, at + T.turn - 0.1)
  tl.call(() => bus.emit('flip'), [], at + 0.05)

  // camera: frame the open book, and dive in slightly during the turn
  tl.to(anim.cam, { open: to === 0 ? 0 : 1, duration: 1.8, ease: 'power2.inOut' }, 0.2)
  tl.to(anim.cam, { push: 1, duration: 1.0, ease: 'sine.inOut' }, 0.3)
  tl.to(anim.cam, { push: 0, duration: 1.6, ease: 'sine.inOut' }, 1.3)

  // Milo twirls into his new outfit
  if (a.outfit !== b.outfit) {
    anim.milo.spin = 0
    tl.to(anim.milo, { spin: 1, duration: 0.9, ease: 'power2.inOut' }, 0.7)
    tl.call(() => setOutfit(b.outfit), [], 1.15)
  }

  // new pop-ups
  tl.to(anim.raise[to], { v: 1, duration: T.popUp, ease: 'none', overwrite: 'auto' }, T.popUpAt)
  tl.call(() => bus.emit('milo', b.miloReact ?? 'wave'), [], T.popUpAt + 0.6)

  tl.call(done, [], at + T.turn + (closing && dir > 0 ? 0.8 : 0))
  return tl
}

/** "Read again": the book turns over and riffles back to the front cover. */
function flipBack(from: number, done: () => void, setOutfit: (o: Outfit) => void) {
  const a = spreads[from]
  const b = spreads[0]
  const tl = gsap.timeline()
  bus.emit('turn', { from, to: 0 })
  gsap.killTweensOf(anim.lights)
  tl.to(anim.lights, { dark: 0, duration: 0.9, ease: 'sine.inOut' }, 0)
  tl.to(anim.raise[from], { v: 0, duration: T.popDown, ease: 'power1.in', overwrite: 'auto' }, 0)
  if (a.world !== b.world) {
    tl.to(anim.presence[a.world], { v: 0, duration: T.worldOut, ease: 'power1.in', overwrite: 'auto' }, 0)
    tl.to(anim.presence[b.world], { v: 1, duration: T.worldIn, ease: 'power1.out', overwrite: 'auto' }, 2.2)
  }
  const current: Palette = anim.envFrom && anim.envTo ? mixPalette(anim.envFrom, anim.envTo, anim.env.t) : a.palette
  anim.envFrom = current
  anim.envTo = b.palette
  anim.env.t = 0
  tl.to(anim.env, { t: 1, duration: T.env, ease: 'sine.inOut', overwrite: 'auto' }, 1.2)
  let t = 0.2
  if (anim.back.v > 0) {
    tl.to(anim.back, { slide: 0, duration: 0.7, ease: 'power2.inOut' }, t)
    t += 0.6
    const last = anim.leaves.findLastIndex((l) => l.p > 0.5)
    tl.to(anim.back, { v: 0, duration: 0.9, ease: 'power2.inOut' }, t)
    if (last >= 0) tl.to(anim.leaves[last], { p: 0, duration: 0.9, ease: 'power2.inOut' }, t)
    t += 0.5
  }
  // riffle the pages back, faster and faster, then close the front cover
  const turned = anim.leaves.map((l, i) => (l.p > 0.5 ? i : -1)).filter((i) => i >= 0).reverse()
  turned.forEach((i, k) => {
    tl.to(anim.leaves[i], { p: 0, duration: 0.55, ease: 'power2.inOut' }, t)
    tl.call(() => bus.emit('flip'), [], t + 0.05)
    t += Math.max(0.12, 0.3 - k * 0.03)
  })
  tl.to(anim.cam, { open: 0, duration: 1.6, ease: 'power2.inOut' }, Math.max(0.4, t - 0.8))
  if (a.outfit !== b.outfit) {
    anim.milo.spin = 0
    tl.to(anim.milo, { spin: 1, duration: 0.9, ease: 'power2.inOut' }, 0.5)
    tl.call(() => setOutfit(b.outfit), [], 0.95)
  }
  tl.call(() => bus.emit('milo', 'wave'), [], t + 0.4)
  tl.call(done, [], t + 0.6)
  return tl
}

/**
 * Which spreads are mounted: the settled spread and its neighbours (plus the
 * target while a turn is running). Everything else is unmounted so its
 * textures can be freed — important on iPad. The window only slides once a
 * turn's whole animation (pop-ups, world) has played out, so the next pages
 * are loaded and warmed up (scene/Prewarm) while nothing is moving.
 */
export function useNearSpreads(): (i: number) => boolean {
  const spread = useBook((s) => s.spread)
  const settled = useBook((s) => s.settled)
  return (i) => Math.abs(i - settled) <= 1 || i === spread
}
