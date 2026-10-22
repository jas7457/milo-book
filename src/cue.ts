import { bus } from './bus'

/**
 * Text cues: which words the story card has finished writing on this visit.
 * Lets a page time things to the story, e.g. the battery starts to glow once
 * the card has written "empty":
 *
 *   hint={() => heard('tools', 'empty') && !robo.awake}
 *
 * Words are matched case-insensitively, ignoring punctuation and the `*`
 * accent marks ("*GLOW!*" matches 'glow'). The list resets whenever the card
 * folds away, so cues replay on every visit. Also emitted as
 * bus 'cue' { id, word } the moment each word is written.
 */
const words: Record<string, Set<string>> = {}

export const normWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '')

export function hearWord(id: string, word: string) {
  const w = normWord(word)
  if (!w) return
  ;(words[id] ??= new Set()).add(w)
  bus.emit('cue', { id, word: w })
}

export function clearHeard(id: string) {
  words[id]?.clear()
}

/** has the card for spread `id` written `word` yet (this visit)? */
export function heard(id: string, word: string) {
  return words[id]?.has(normWord(word)) ?? false
}
