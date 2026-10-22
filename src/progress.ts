import { create } from 'zustand'
import type { Para, SpreadDef } from './story/types'

/*
 * Reading progress — what gates the "next page" arrow.
 *
 *  - beats: each spread declares how many interactions (`beats`) the reader
 *    must complete. A spread calls `beat(id, n)` when its n-th one is done
 *    (1-based; calling with a lower n, or twice, is harmless).
 *  - text: paragraphs are written in one after another; a paragraph with
 *    `after: n` waits until beat n is done (see StoryCard).
 *  - a spread is complete once every beat is done AND every paragraph has
 *    finished writing. Completed spreads stay unlocked forever (`done`),
 *    even though their pop-ups replay when you come back.
 */

type P = {
  /** beats done on the spread's current visit */
  stage: Record<string, number>
  /** paragraphs fully written on the current visit */
  written: Record<string, number>
  /** completed at least once → its next arrow is unlocked */
  done: Record<string, boolean>
  /** the spread whose text is being written right now ('' = none) */
  writing: string
}

export const useProgress = create<P>(() => ({ stage: {}, written: {}, done: {}, writing: '' }))

const defs = new Map<string, SpreadDef>()
/** called once with the book's spreads (see main.tsx) */
export function registerSpreads(list: SpreadDef[]) {
  for (const s of list) defs.set(s.id, s)
}

export const paraText = (p: Para) => (typeof p === 'string' ? p : p.text)
export const paraAfter = (p: Para) => (typeof p === 'string' ? 0 : p.after)

function check(id: string) {
  const s = defs.get(id)
  if (!s) return
  const st = useProgress.getState()
  if (st.done[id]) return
  const beats = s.beats ?? 0
  const paras = s.text?.length ?? 0
  if ((st.stage[id] ?? 0) >= beats && (st.written[id] ?? 0) >= paras)
    useProgress.setState({ done: { ...st.done, [id]: true } })
}

/** The reader finished interaction `n` (1-based) of spread `id`. */
export function beat(id: string, n: number) {
  const st = useProgress.getState()
  if ((st.stage[id] ?? 0) >= n) return
  useProgress.setState({ stage: { ...st.stage, [id]: n } })
  check(id)
}

/** StoryCard: `count` paragraphs of spread `id` are fully written. */
export function markWritten(id: string, count: number) {
  const st = useProgress.getState()
  if ((st.written[id] ?? 0) >= count) return
  useProgress.setState({ written: { ...st.written, [id]: count } })
  check(id)
}

export function setWriting(id: string) {
  if (useProgress.getState().writing !== id) useProgress.setState({ writing: id })
}

/** A fresh visit: beats and text start over (the spread's pop-ups reset too). */
export function resetProgress(id: string) {
  const st = useProgress.getState()
  useProgress.setState({ stage: { ...st.stage, [id]: 0 }, written: { ...st.written, [id]: 0 } })
  check(id)
}

export const stageOf = (id: string) => useProgress.getState().stage[id] ?? 0
export const isDone = (id: string) => !!useProgress.getState().done[id]

/** Spreads without beats or text (the cover) are complete from the start. */
export function initProgress(list: SpreadDef[]) {
  registerSpreads(list)
  for (const s of list) check(s.id)
}
