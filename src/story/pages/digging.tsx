import { PopCard } from '../../popup/PopCard'
import { Cutout } from '../../world/Cutout'
import { star } from '../../art/kit'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * PLACEHOLDER — Dig, dig, dig!. Owned by one worker; replace everything in this file.
 * Keep the two exports (digSpread, DigSiteWorld) and the world id 'digsite'.
 */

function Popups() {
  return <PopCard art={star()} size={[0.5, 0.5]} at={[0.6, 0]} delay={0.1} hinge="spring" />
}

export function DigSiteWorld() {
  return (
    <group>
      <Cutout art={star()} size={[3, 3]} at={[0, 0, -8]} delay={0.1} />
    </group>
  )
}

export const digSpread: SpreadDef = {
  id: 'digging',
  world: 'digsite',
  palette: palettes.digSite,
  outfit: 'hardhat',
  heading: 'Dig, dig, dig!',
  text: [
    'Robo zoomed out the door... *beep beep!* Milo raced after him to the *dig site*.',
    'Milo climbed into the big yellow *excavator*. Scoop! Dump! Scoop!',
    'Under all that dirt... something *shiny!*',
  ],
  Popups,
  miloReact: 'cheer',
}
