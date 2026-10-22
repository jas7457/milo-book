import { PopCard } from '../../popup/PopCard'
import { Cutout } from '../../world/Cutout'
import { star } from '../../art/kit'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * PLACEHOLDER — Fire rescue!. Owned by one worker; replace everything in this file.
 * Keep the two exports (fireSpread, FireWorld) and the world id 'firetown'.
 */

function Popups() {
  return <PopCard art={star()} size={[0.5, 0.5]} at={[0.6, 0]} delay={0.1} hinge="spring" />
}

export function FireWorld() {
  return (
    <group>
      <Cutout art={star()} size={[3, 3]} at={[0, 0, -8]} delay={0.1} />
    </group>
  )
}

export const fireSpread: SpreadDef = {
  id: 'firefighter',
  world: 'firetown',
  palette: palettes.fire,
  outfit: 'firefighter',
  heading: 'Fire rescue!',
  text: [
    'Over the bridge, Milo saw *smoke!* Ding-ding-ding!',
    'Firefighter Milo jumped onto the big red *fire truck*.',
    'He aimed the hose... *SPLOOSH!* The fire went out!',
  ],
  Popups,
  miloReact: 'jump',
}
