import { useEffect } from 'react'
import { useBook } from '../store'
import { spreads } from '../story/spreads'
import { unlockAudio } from '../sfx'
import { ui } from '../state'
import { useProgress } from '../progress'

/** Big friendly page-turn buttons, page dots, keyboard + swipe. */
export function Controls() {
  const spread = useBook((s) => s.spread)
  const busy = useBook((s) => s.busy)
  const go = useBook((s) => s.go)
  const restart = useBook((s) => s.restart)
  const done = useProgress((p) => !!p.done[spreads[spread].id])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    // one entry per finger; a swipe only counts for a single, free finger
    // (not one that picked up a pop-up piece, and not part of a multi-touch)
    const touches = new Map<number, { x: number; y: number; grab: boolean }>()
    let multi = false
    const down = (e: PointerEvent) => {
      unlockAudio()
      // pop-up widgets handle the event on the canvas first, so ui.grab is already set
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY, grab: ui.grab })
      if (touches.size > 1) multi = true
    }
    const up = (e: PointerEvent) => {
      const s = touches.get(e.pointerId)
      touches.delete(e.pointerId)
      const wasMulti = multi
      if (touches.size === 0) multi = false
      if (!s || s.grab || wasMulti) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
    }
    const cancel = (e: PointerEvent) => {
      touches.delete(e.pointerId)
      if (touches.size === 0) multi = false
    }
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('keydown', key)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [go])

  const last = spreads.length - 1
  return (
    <div className="ui">
      <button
        className="turn prev"
        aria-label="Previous page"
        disabled={spread === 0 || busy}
        onClick={() => go(-1)}
      >
        <svg viewBox="0 0 40 40"><path d="M25 8 L12 20 L25 32" /></svg>
      </button>
      <button
        className={
          'turn next' + (spread === 0 ? ' hint' : '') + (!done ? ' locked' : spread > 0 && spread < last ? ' ready' : '')
        }
        aria-label={done ? 'Next page' : 'Finish this page first'}
        disabled={spread === last || busy || !done}
        onClick={() => go(1)}
      >
        <svg viewBox="0 0 40 40"><path d="M15 8 L28 20 L15 32" /></svg>
      </button>
      <div className="dots">
        {spreads.map((s, i) => (
          <span key={s.id} className={i === spread ? 'on' : ''} />
        ))}
      </div>
      {spread === 0 && <div className="open-hint">Tap the arrow to open the book!</div>}
      {spreads[spread].closed === 'back' && !busy && (
        <button className="again" onClick={restart}>
          <svg viewBox="0 0 40 40"><path d="M30 20 A10 10 0 1 1 26 12 M26 5 V12 H19" /></svg>
          Read again
        </button>
      )}
    </div>
  )
}
