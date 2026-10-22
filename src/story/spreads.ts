import type { FC } from 'react'
import type { SpreadDef } from './types'
import { coverArt, coverSpread, RoomWorld } from './pages/room'
import { readingSpread } from './pages/reading'
import { toolsSpread, WorkshopWorld } from './pages/tools'
import { digSpread, DigSiteWorld } from './pages/digging'
import { buildSpread, BridgeWorld } from './pages/building'
import { fireSpread, FireWorld } from './pages/firefighter'
import { heroSpread, SkyWorld } from './pages/superhero'
import { homeSpread, BedroomWorld } from './pages/home'

/**
 * The book, in order. Spread 0 is the closed cover.
 * Draft story: "Milo to the Rescue!" — reading → tools → digging → building →
 * firefighter → superhero → home.
 */
export const spreads: SpreadDef[] = [
  coverSpread,
  readingSpread,
  toolsSpread,
  digSpread,
  buildSpread,
  fireSpread,
  heroSpread,
  homeSpread,
]

export const worlds: Record<string, FC> = {
  room: RoomWorld,
  workshop: WorkshopWorld,
  digsite: DigSiteWorld,
  bridge: BridgeWorld,
  firetown: FireWorld,
  skyline: SkyWorld,
  bedroom: BedroomWorld,
}

export const cover = {
  art: coverArt,
  title: ['Milo', 'to the Rescue!'],
  subtitle: 'a pop-up adventure',
}
