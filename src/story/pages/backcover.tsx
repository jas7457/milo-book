import { bus } from '../../bus'
import { Cutout } from '../../world/Cutout'
import { RoomWorld } from './room'
import type { Palette } from '../../state'
import type { SpreadDef } from '../types'
import {
  backCoverArt,
  dims,
  miloStanding,
  flyingMilo,
  flyingKnot,
  hangString,
  roboToy,
  toyTruck,
} from '../../art/backcover'
import { treasureMap } from '../../art/dig'
import { kitten } from '../../art/hero'
import { boxCarToy } from '../../art/homeWorld'
import { glowStarOn } from '../../art/homeRoom'

/* ------------------------------------------------------------ back cover -- */

export const backCover = {
  art: backCoverArt,
  title: ['The End'],
  subtitle: 'Goodnight, Milo!',
}

/* --------------------------------------------------------------- palette -- */

/** the living room again, late in the evening: lamp-lit, cosy, a little dusky */
const eveningRoom: Palette = {
  skyTop: '#4a3f6e',
  skyBottom: '#e6b484',
  ground: '#b08a5e',
  ground2: '#9a774c',
  sun: '#ffc27a',
  sunIntensity: 1.35,
  hemiSky: '#ffd9a8',
  hemiGround: '#6a4a34',
  hemiIntensity: 0.82,
  fogNear: 14,
  fogFar: 42,
  accent: '#e9a23b',
}

/* ----------------------------------------------------------------- art ---- */

// Milo's costumes as little paper dolls
const fixer = miloStanding('tools', 'right')
const builder = miloStanding('builder', 'both')
const fighter = miloStanding('fire', 'left')

// glow-in-the-dark stars on the wall
const stars: [number, number, number][] = [
  [-8.4, 3.4, 0.5],
  [-3.2, 7.0, 0.4],
  [-5.0, 7.4, 0.34],
  [6.0, 6.6, 0.5],
  [3.6, 7.2, 0.36],
  [7.6, 3.6, 0.4],
]

const tapSfx = (sfx: string, milo?: string) => () => {
  bus.emit('sfx', sfx)
  if (milo) bus.emit('milo', milo)
}

/** size [w,h] from a height, keeping the art's proportions */
const byH = (art: string, h: number): [number, number] => {
  const [w, hh] = dims(art)
  return [(h * w) / hh, h]
}

/* ----------------------------------------------------------------- world -- */

/**
 * Milo's living room from page one — and every Milo he has been, hiding
 * around it as paper cutouts. Tap one to say hello.
 */
export function HouseWorld() {
  const kit = kitten('happy')
  const FH = 2.0 // a standing Milo's height
  const superSize = byH(flyingMilo, 2.7)
  const knotX = (flyingKnot.x - 0.5) * superSize[0]
  const knotY = (1 - flyingKnot.y) * superSize[1]
  const SX = -6.7
  const SY = 4.5
  return (
    <group>
      <RoomWorld />

      {/* on the sofa: Firefighter Milo and Builder Milo wave at the book */}
      <Cutout art={fighter} size={byH(fighter, FH)} at={[-1.5, 1.42, -6.35]} delay={0.5} hinge="spring" tap="jump" onTap={tapSfx('siren', 'cheer')} />
      <Cutout art={builder} size={byH(builder, FH)} at={[3.1, 1.42, -6.35]} delay={0.55} hinge="spring" tap="jump" onTap={tapSfx('giggle', 'cheer')} />
      {/* Fix-it Milo on the side table, next to the blue cup */}
      <Cutout art={fixer} size={byH(fixer, 1.7)} at={[6.0, 1.24, -5.1]} delay={0.6} hinge="spring" tap="wiggle" onTap={tapSfx('snap', 'wave')} />

      {/* Super Milo, flying on a string from the ceiling */}
      <Cutout art={hangString} size={[0.16, 5]} at={[SX + knotX, SY + knotY, -8.52]} delay={0.65} hinge="drop" shadow={false} contact={false} />
      <Cutout art={flyingMilo} size={superSize} at={[SX, SY, -8.5]} delay={0.65} hinge="drop" tap="spin" onTap={tapSfx('whoosh', 'jump')} idle="float" idleAmp={0.5} />

      {/* the kitten from the tower, asleep-ish on the sofa arm */}
      <Cutout art={kit} size={byH(kit, 0.95)} at={[-2.85, 2.08, -6.4]} delay={0.5} hinge="spring" tap="jump" onTap={tapSfx('sparkle')} idle="bob" idleAmp={0.4} />

      {/* Robo woke up for good and lives here now */}
      <Cutout art={roboToy} size={byH(roboToy, 1.85)} at={[3.5, 0, -2.5]} delay={0.4} rotY={-0.25} tap="jump" onTap={tapSfx('robot', 'wave')} />
      {/* Robo's truck, the box car and a treasure map */}
      <Cutout art={toyTruck} size={byH(toyTruck, 0.85)} at={[5.4, 0, -2.0]} delay={0.35} rotY={-0.5} tap="wiggle" onTap={tapSfx('zoom')} />
      <Cutout art={boxCarToy} size={byH(boxCarToy, 1.25)} at={[-3.7, 0, -3.7]} delay={0.35} rotY={0.4} tap="jump" onTap={tapSfx('boing')} />
      <Cutout art={treasureMap} size={byH(treasureMap, 1.8)} at={[4.9, 3.6, -10.3]} delay={0.5} hinge="spring" tap="wiggle" onTap={tapSfx('sparkle')} />

      {/* glow-in-the-dark stars */}
      {stars.map(([x, y, s], i) => (
        <Cutout key={i} art={glowStarOn} size={[s * 1.4, s * 1.4]} at={[x, y, -10.3]} delay={0.45 + i * 0.03} hinge="spring" emissive={1} tap="spin" onTap={tapSfx('sparkle')} idle="float" idleAmp={0.3} shadow={false} contact={false} />
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- spread -- */

export const backSpread: SpreadDef = {
  id: 'back',
  world: 'house',
  palette: eveningRoom,
  outfit: 'pajamas',
  closed: 'back',
  cover: backCover,
  miloReact: 'wave',
}
