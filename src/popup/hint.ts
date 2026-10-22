/*
 * "What can I touch?" hints, shared by every interactive piece.
 *
 *  - idleness: seconds since the reader last touched anything
 *  - the hand queue: only one show-me hand plays at a time (first come, first
 *    served); a piece leaves the queue once its job is done.
 */

let lastInput = performance.now()
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => (lastInput = performance.now()), true)
  // moving the mouse counts too (a real move, not a stray event): reaching for
  // a piece stops its show-me demo at once
  let lx = 0
  let ly = 0
  window.addEventListener(
    'pointermove',
    (e) => {
      if (Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly) > 3) lastInput = performance.now()
      lx = e.clientX
      ly = e.clientY
    },
    true,
  )
  window.addEventListener('keydown', () => (lastInput = performance.now()), true)
}

/** performance.now() of the last touch / click / key / mouse move */
export const lastInputAt = () => lastInput
/** seconds since the last touch */
export const idleSecs = () => (performance.now() - lastInput) / 1000

let nextId = 1
export const newHintId = () => nextId++

const queue: number[] = []
export function wantHand(id: number, want: boolean) {
  const i = queue.indexOf(id)
  if (want && i < 0) queue.push(id)
  else if (!want && i >= 0) queue.splice(i, 1)
}
export const handTurn = (id: number) => queue[0] === id

/** seconds of no touching before the show-me hand appears */
export const HAND_AFTER = 4.5
/** colour of the "touch me" glow */
export const GLOW = '#ffe45c'
