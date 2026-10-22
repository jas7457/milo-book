import type { FC } from 'react'
import type { SpreadDef } from './types'
import { coverArt, coverSpread, RoomWorld } from './pages/room'
import { readingSpread } from './pages/reading'

/**
 * The book, in order. Spread 0 is the closed cover.
 * Draft story: "Milo to the Rescue!" — reading → tools → digging → building →
 * firefighter → superhero → home.
 */
export const spreads: SpreadDef[] = [coverSpread, readingSpread]

export const worlds: Record<string, FC> = {
  room: RoomWorld,
}

export const cover = {
  art: coverArt,
  title: ['Milo', 'to the Rescue!'],
  subtitle: 'a pop-up adventure',
}
