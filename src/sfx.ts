import { bus } from './bus'

/**
 * Tiny synthesised sound effects (no audio files needed). Narration can be
 * added later as real audio per spread alongside these.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null

export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

function flip() {
  if (!ctx || !master) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx, 0.7)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.8
  bp.frequency.setValueAtTime(900, t)
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.25)
  bp.frequency.exponentialRampToValueAtTime(600, t + 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
}

function tone(freq: number, to: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, delay = 0) {
  if (!ctx || !master) return
  const t = ctx.currentTime + delay
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.05)
}

/** a soft pencil scratch, one per written word */
function scribble() {
  if (!ctx || !master) return
  const t = ctx.currentTime
  const dur = 0.12 + Math.random() * 0.1
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx, dur + 0.05)
  const hp = ctx.createBiquadFilter()
  hp.type = 'bandpass'
  hp.frequency.value = 2600 + Math.random() * 1400
  hp.Q.value = 0.9
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.02)
  g.gain.setValueAtTime(0.05 * (0.6 + Math.random() * 0.4), t + dur * 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(hp).connect(g).connect(master)
  src.start(t)
  src.stop(t + dur + 0.05)
}

const sounds: Record<string, () => void> = {
  scribble,
  flip,
  pop: () => tone(420 + Math.random() * 200, 900, 0.14, 'sine', 0.35),
  giggle: () => {
    for (let i = 0; i < 4; i++) tone(700 + i * 60, 900 + i * 60, 0.09, 'triangle', 0.18, i * 0.1)
  },
  sparkle: () => {
    ;[1046, 1318, 1568, 2093].forEach((f, i) => tone(f, f * 1.01, 0.25, 'sine', 0.12, i * 0.07))
  },
  whirr: () => tone(180, 520, 0.6, 'sawtooth', 0.08),
  /** one burst of a toy drill (played on repeat while drilling) */
  drill: () => {
    tone(260, 300, 0.42, 'sawtooth', 0.06)
    tone(520, 610, 0.42, 'square', 0.025)
  },
  /** batteries in: a rising power-up chime */
  powerup: () => {
    tone(160, 900, 0.5, 'square', 0.05)
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.14, 0.35 + i * 0.09))
  },
  /** a robot's happy chatter */
  robot: () => {
    ;[880, 660, 990, 740, 1180].forEach((f, i) => tone(f, f * (i % 2 ? 0.9 : 1.1), 0.08, 'square', 0.06, i * 0.09))
  },
  snap: () => tone(1400, 500, 0.06, 'square', 0.12),
  boing: () => tone(220, 660, 0.35, 'sine', 0.3),
  zoom: () => {
    tone(300, 1200, 0.5, 'sawtooth', 0.05)
    sounds.whoosh()
  },
  beep: () => {
    tone(880, 880, 0.12, 'square', 0.08)
    tone(880, 880, 0.12, 'square', 0.08, 0.2)
  },
  siren: () => {
    for (let i = 0; i < 3; i++) {
      tone(700, 1000, 0.3, 'triangle', 0.1, i * 0.6)
      tone(1000, 700, 0.3, 'triangle', 0.1, i * 0.6 + 0.3)
    }
  },
  whoosh: () => {
    if (!ctx || !master) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, 1)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(300, t)
    lp.frequency.exponentialRampToValueAtTime(2500, t + 0.4)
    lp.frequency.exponentialRampToValueAtTime(200, t + 0.9)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95)
    src.connect(lp).connect(g).connect(master)
    src.start(t)
  },
}

bus.on('sfx', (name) => sounds[name as string]?.())
bus.on('flip', () => sounds.flip())
