import { PopCard } from '../../popup/PopCard'
import { Cutout } from '../../world/Cutout'
import { star } from '../../art/kit'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * PLACEHOLDER — Home again. Owned by one worker; replace everything in this file.
 * Keep the two exports (homeSpread, BedroomWorld) and the world id 'bedroom'.
 */

function Popups() {
  return <PopCard art={star()} size={[0.5, 0.5]} at={[0.6, 0]} delay={0.1} hinge="spring" />
}

export function BedroomWorld() {
  return (
    <group>
      <Cutout art={star()} size={[3, 3]} at={[0, 0, -8]} delay={0.1} />
    </group>
  )
}

export const homeSpread: SpreadDef = {
  id: 'home',
  world: 'bedroom',
  palette: palettes.bedtime,
  outfit: 'pajamas',
  heading: 'Home again',
  text: [
    'The sky turned pink, then purple. Time to go *home*.',
    'Mom and Dad gave Milo the biggest, squeeziest *hug*.',
    `"What an adventure!" Milo yawned. *Goodnight, Milo.*`,
  ],
  Popups,
  miloReact: 'wave',
}
