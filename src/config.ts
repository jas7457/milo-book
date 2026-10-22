// Book dimensions in world units. The book lies flat on the ground (XZ plane),
// spine along the Z axis at x = 0. Right pages span x ∈ [0, PAGE_W].
export const PAGE_W = 1.6
export const PAGE_H = 2.2
export const LEAF_GAP = 0.0055
export const BOARD_T = 0.035 // cover board thickness
export const BOOK_Y = 0.0 // book rests on the ground

// Pop-up "printing" surface height (top of the page stacks, roughly)
export const POP_Y = 0.09

// Page texture resolution
export const PAGE_TEX_W = 1024
export const PAGE_TEX_H = Math.round((PAGE_TEX_W * PAGE_H) / PAGE_W)

// Timing of a page turn (seconds) — the orchestration lives in store.ts
export const T = {
  popDown: 0.65,
  turnAt: 0.4,
  turn: 1.35,
  worldOut: 1.3,
  envAt: 0.35,
  env: 2.6,
  worldInAt: 1.25,
  worldIn: 2.6,
  popUpAt: 1.45,
  popUp: 1.7,
}
