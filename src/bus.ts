type Handler = (payload?: unknown) => void
const handlers = new Map<string, Set<Handler>>()

/** Tiny event bus for one-off moments (Milo reactions, sounds, sparkles). */
export const bus = {
  on(evt: string, fn: Handler) {
    let s = handlers.get(evt)
    if (!s) handlers.set(evt, (s = new Set()))
    s.add(fn)
    return () => void s!.delete(fn)
  },
  emit(evt: string, payload?: unknown) {
    handlers.get(evt)?.forEach((fn) => fn(payload))
  },
}
