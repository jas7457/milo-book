import { useEffect, useRef } from 'react'
import { useBook } from '../store'
import { spreads } from '../story/spreads'
import { unlockAudio } from '../sfx'
import { ui } from '../state'

/** Big friendly page-turn buttons, page dots, keyboard + swipe. */
export function Controls() {
  const spread = useBook((s) => s.spread)
  const busy = useBook((s) => s.busy)
  const go = useBook((s) => s.go)
  const touch = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const down = (e: PointerEvent) => {
      unlockAudio()
      touch.current = { x: e.clientX, y: e.clientY }
    }
    const up = (e: PointerEvent) => {
      const s = touch.current
      touch.current = null
      if (ui.grab) {
        ui.grab = false
        return
      }
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
    }
    window.addEventListener('keydown', key)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
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
        className={'turn next' + (spread === 0 ? ' hint' : '')}
        aria-label="Next page"
        disabled={spread === last || busy}
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
    </div>
  )
}
