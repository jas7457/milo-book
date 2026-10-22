import { PopCard } from '../../popup/PopCard'
import { Cutout } from '../../world/Cutout'
import { star } from '../../art/kit'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * PLACEHOLDER — Bridge builder. Owned by one worker; replace everything in this file.
 * Keep the two exports (buildSpread, BridgeWorld) and the world id 'bridge'.
 */

function Popups() {
  return <PopCard art={star()} size={[0.5, 0.5]} at={[0.6, 0]} delay={0.1} hinge="spring" />
}

export function BridgeWorld() {
  return (
    <group>
      <Cutout art={star()} size={[3, 3]} at={[0, 0, -8]} delay={0.1} />
    </group>
  )
}

export const buildSpread: SpreadDef = {
  id: 'building',
  world: 'bridge',
  palette: palettes.building,
  outfit: 'hardhat',
  heading: 'Bridge builder',
  text: [
    'The shiny thing was a *treasure map!* The path went over the river.',
    `But there was no bridge. *"Let's build one!"* said Milo.`,
    'One block, two blocks... the bridge stretched *all the way across!*',
  ],
  Popups,
  miloReact: 'point',
}
