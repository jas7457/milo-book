import type { FC } from 'react'
import type { Outfit, Palette } from '../state'

/**
 * One story paragraph. A plain string is written in as soon as the page opens;
 * `{ after: n, text }` waits until the reader has done interaction n
 * (see `beat()` in progress.ts), so the words can describe what just happened.
 */
export type Para = string | { after: number; text: string }

/**
 * A spread = what you see when the book is open at one place:
 * left page (text) + right page (printed backdrop) + pop-ups + a world.
 * Spread 0 is the closed cover.
 */
export type SpreadDef = {
  id: string
  /** world id (see worlds/index.ts). Consecutive spreads may share a world. */
  world: string
  palette: Palette
  outfit: Outfit
  /**
   * Story text (one entry per paragraph), written onto a card on the left
   * page at read-aloud pace. The card is sized for ALL paragraphs up front.
   */
  text?: Para[]
  /**
   * How many interactions the reader must complete before the next-page arrow
   * unlocks. Call `beat(id, n)` (progress.ts) as each one is done. Default 0.
   */
  beats?: number
  /**
   * Where the text card sits on the left page, in 0..1 page units
   * (x, y = top-left, w = width; height fits the text). Default: lower left.
   */
  textCard?: { x: number; y: number; w: number }
  /** a small heading above the story text, e.g. "Bedtime" */
  heading?: string
  /**
   * One painting printed across BOTH pages (2560×1760 SVG; the spine is at
   * x = 1280, the far edge of the book is at the top).
   */
  spreadArt?: string
  /** pop-up pieces, rendered in book space inside a SpreadProvider */
  Popups?: FC
  /** what Milo does when this spread opens */
  miloReact?: 'wave' | 'cheer' | 'point' | 'jump'
}
