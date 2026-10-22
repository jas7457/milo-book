import gsap from 'gsap'
import { anim } from './state'
import { T } from './config'
import { bus } from './bus'
import { spreads } from './story/spreads'

/**
 * The loading screen (`#loader`, plain HTML in index.html so it shows before
 * any script has loaded) covers the book while Prewarm paints the art, uploads
 * it and compiles the shaders. When everything is ready, `startIntro` fades the
 * screen away and pops the first spread up: the world rises and the pop-ups
 * spring out, like a page turn without the turn. Nothing has to load or compile
 * any more while it plays, so the first thing Milo sees is smooth.
 */
let started = false

export function startIntro(start: number) {
  if (started) return
  started = true
  const el = document.getElementById('loader')
  const s = spreads[start]
  // the scene rendered fully raised while loading (so every piece got its
  // shaders and textures ready); fold it flat under the screen, then pop it up
  anim.raise[start].v = 0
  anim.presence[s.world].v = 0
  const tl = gsap.timeline()
  tl.call(() => el?.classList.add('done'), [], 0.05)
  tl.to(anim.presence[s.world], { v: 1, duration: T.worldIn, ease: 'power1.out' }, 0.2)
  tl.to(anim.raise[start], { v: 1, duration: T.popUp, ease: 'none' }, 0.55)
  tl.call(() => bus.emit('milo', s.miloReact ?? 'wave'), [], 1.1)
  tl.call(() => el?.remove(), [], 1.2)
}
