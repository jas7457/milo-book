import { PopCard } from '../../popup/PopCard'
import { Cutout } from '../../world/Cutout'
import { star } from '../../art/kit'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * PLACEHOLDER — Super Milo. Owned by one worker; replace everything in this file.
 * Keep the two exports (heroSpread, SkyWorld) and the world id 'skyline'.
 */

function Popups() {
  return <PopCard art={star()} size={[0.5, 0.5]} at={[0.6, 0]} delay={0.1} hinge="spring" />
}

export function SkyWorld() {
  return (
    <group>
      <Cutout art={star()} size={[3, 3]} at={[0, 0, -8]} delay={0.1} />
    </group>
  )
}

export const heroSpread: SpreadDef = {
  id: 'superhero',
  world: 'skyline',
  palette: palettes.sky,
  outfit: 'superhero',
  heading: 'Super Milo',
  text: [
    `Then... *"Meow!"* A tiny kitten was stuck on the tallest tower!`,
    'Milo put on his cape. *Up, up and away!*',
    'He scooped her up and flew her *safe and sound*.',
  ],
  Popups,
  miloReact: 'cheer',
}
