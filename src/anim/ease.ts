export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

export function easeOutBack(x: number, s = 1.70158) {
  const c3 = s + 1
  return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2)
}
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)

/** Where a piece is inside its own rise window, given a master 0..1 value. */
export function windowed(master: number, delay: number, length = 0.45) {
  return clamp01((master - delay) / length)
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}
