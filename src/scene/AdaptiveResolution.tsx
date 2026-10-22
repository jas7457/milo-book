import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useBook } from '../store'

/** never render below this pixel ratio (on a retina iPad 1.25 still looks sharp) */
const MIN_DPR = 1.25
/** one step down */
const STEP = 0.25
/** a measuring window: this long (ms) and at least MIN_FRAMES frames */
const WINDOW_MS = 2000
const MIN_FRAMES = 20
/** a window whose median frame is slower than this (ms) means "can't keep up": below ~48 fps */
const SLOW_MS = 21

/**
 * Lowers the render resolution a step when the device can't keep up its frame
 * rate (the iPad's GPU fills ~4 million retina pixels per frame, plus bloom
 * and shadows). Desktops and fast iPads never step down.
 *
 * - It only judges calm moments: not behind the loading screen, not during a
 *   page turn (texture loading hitches would skew it). And it uses the median
 *   frame time of a window, so a single hitch doesn't count.
 * - It only steps down, never back up: on a 60 Hz screen frames can't come in
 *   faster than 16.7 ms, so spare capacity can't be measured, and flipping
 *   back and forth would resize the render targets each time (a hitch).
 */
export function AdaptiveResolution() {
  const setDpr = useThree((s) => s.setDpr)
  const dpr = useThree((s) => s.viewport.dpr)
  const times = useRef<number[]>([])
  const spent = useRef(0)

  useFrame((_, dt) => {
    const calm = !useBook.getState().busy && !document.getElementById('loader')
    if (!calm) {
      times.current.length = 0
      spent.current = 0
      return
    }
    times.current.push(dt * 1000)
    spent.current += dt * 1000
    if (spent.current < WINDOW_MS || times.current.length < MIN_FRAMES) return
    spent.current = 0
    const sorted = times.current.sort((a, b) => a - b)
    const median = sorted[sorted.length >> 1]
    times.current = []
    if (median > SLOW_MS && dpr > MIN_DPR) setDpr(Math.max(MIN_DPR, dpr - STEP))
  })
  return null
}
