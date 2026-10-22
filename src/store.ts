import { create } from 'zustand'
import gsap from 'gsap'
import { T } from './config'
import { anim, type Outfit, type Palette } from './state'
import { spreads } from './story/spreads'
import { bus } from './bus'
import { mixPalette } from './story/palettes'
import { isDone, resetProgress } from './progress'

type Store = {
  spread: number
  busy: boolean
  outfit: Outfit
  started: boolean
  go: (dir: 1 | -1) => void
  start: () => void
}

export const useBook = create<Store>((set, get) => ({
  spread: 0,
  busy: false,
  started: false,
  outfit: spreads[0].outfit,
  start: () => set({ started: true }),
  go: (dir) => {
    const { spread: from, busy } = get()
    const to = from + dir
    if (busy || to < 0 || to >= spreads.length) return
    // you have to finish a page (its interactions + its story) before moving on
    if (dir > 0 && !isDone(spreads[from].id)) return
    resetProgress(spreads[to].id)
    set({ busy: true, spread: to })
    turn(from, to, () => set({ busy: false }), (outfit) => set({ outfit }))
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

  // the page itself
  tl.to(anim.leaves[leaf], { p: dir > 0 ? 1 : 0, duration: T.turn, ease: 'power2.inOut' }, T.turnAt)
  tl.call(() => bus.emit('flip'), [], T.turnAt + 0.05)

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

  tl.call(done, [], T.turnAt + T.turn)
}

/**
 * Which spreads are mounted: the settled spread and its neighbours (plus the
 * target while a turn is running). Everything else is unmounted so its
 * textures can be freed — important on iPad. The window only slides once a
 * turn has finished, so new pages are prepared while nothing is animating.
 */
let settled = -1
export function useNearSpreads(): (i: number) => boolean {
  const spread = useBook((s) => s.spread)
  const busy = useBook((s) => s.busy)
  if (!busy || settled < 0) settled = spread
  const a = settled
  return (i) => Math.abs(i - a) <= 1 || i === spread
}
