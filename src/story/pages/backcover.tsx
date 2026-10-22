import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { bus } from '../../bus'
import { anim } from '../../state'
import { Cutout, useWorldId } from '../../world/Cutout'
import { RoomWorld, DUSK } from './room'
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
  figureStand,
  STAND,
  wallHook,
} from '../../art/backcover'
import { momSitting, dadSitting } from '../../art/family'
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

// Mom and Dad on the couch (made once, so their textures are shared)
const mom = momSitting()
const dad = dadSitting()

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

/** a soft round glow, shared by every star halo */
let haloTex: THREE.CanvasTexture | null = null
function halo() {
  if (haloTex) return haloTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(235,255,170,1)')
  g.addColorStop(0.3, 'rgba(210,255,120,0.45)')
  g.addColorStop(1, 'rgba(200,255,100,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  haloTex = new THREE.CanvasTexture(c)
  haloTex.colorSpace = THREE.SRGBColorSpace
  return haloTex
}

/** When the lights go out, the glow-in-the-dark stars shine out of the dusk. */
function StarHalos() {
  const id = useWorldId()
  const refs = useRef<THREE.Mesh[]>([])
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: halo(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }),
    [],
  )
  useEffect(() => () => mat.dispose(), [mat])
  useFrame((s) => {
    const m = Math.min(1, anim.lights.dark / DUSK) * (anim.presence[id]?.v ?? 0)
    mat.opacity = 0.6 * m
    refs.current.forEach((r, i) => {
      if (!r) return
      r.visible = m > 0.003
      const pulse = 1 + Math.sin(s.clock.elapsedTime * 1.7 + i * 1.3) * 0.12
      r.scale.setScalar(pulse)
    })
  })
  return (
    <>
      {stars.map(([x, y, sz], i) => (
        <mesh key={i} ref={(m) => (refs.current[i] = m!)} material={mat} position={[x, y + sz * 0.7, -10.25]} visible={false}>
          <planeGeometry args={[sz * 3.6, sz * 3.6]} />
        </mesh>
      ))}
    </>
  )
}

/** A toy Milo on his little plastic display stand. (x, y, z) is where the stand sits. */
function ActionFigure({
  art,
  at,
  rotY = 0,
  h = 0.84,
  accent,
  delay,
  onTap,
}: {
  art: string
  at: [number, number, number]
  rotY?: number
  h?: number
  accent: string
  delay: number
  onTap: () => void
}) {
  const sw = 0.72
  const sh = (sw * STAND.h) / STAND.w
  const dz = 0.03 // the figure stands a hair in front of the stand's plane, along its facing
  const fx = at[0] + Math.sin(rotY) * dz
  const fz = at[2] + Math.cos(rotY) * dz
  return (
    <>
      <Cutout art={figureStand(accent)} size={[sw, sh]} at={at} rotY={rotY} delay={delay} hinge="spring" />
      <Cutout
        art={art}
        size={byH(art, h)}
        at={[fx, at[1] + sh * STAND.foot, fz]}
        rotY={rotY}
        delay={delay + 0.05}
        hinge="spring"
        tap="jump"
        onTap={onTap}
      />
    </>
  )
}

/**
 * Milo's living room from page one — Mom and Dad on the couch, and every Milo
 * he has been, as little action figures around the room. Tap to say hello.
 * Tap the lamp for lights out and moonlight!
 */
export function HouseWorld() {
  const kit = kitten('happy')
  const superSize = byH(flyingMilo, 1.1)
  const knotX = (flyingKnot.x - 0.5) * superSize[0]
  const knotY = (1 - flyingKnot.y) * superSize[1]
  const SX = -6.7
  const SY = 5.5
  const HOOK_Y = 7.45 // the hook the string hangs from
  const stringTop = HOOK_Y + 0.08
  const stringLen = stringTop - (SY + knotY)
  const S = 0.0031 // sitting grown-ups: units per art pixel
  const SEAT = 1.42 // top of the couch cushions
  return (
    <group>
      <RoomWorld switchable />
      <StarHalos />

      {/* Mom and Dad on the couch, smiling at the book */}
      <Cutout art={mom} size={[600 * S, 930 * S]} at={[-0.85, SEAT - 342 * S, -6.32]} delay={0.5} hinge="spring" tap="jump" px={1024} onTap={tapSfx('giggle', 'wave')} idle="sway" idleAmp={0.25} />
      <Cutout art={dad} size={[640 * S, 990 * S]} at={[2.05, SEAT - 358 * S, -6.32]} delay={0.55} hinge="spring" tap="jump" px={1024} onTap={tapSfx('giggle', 'cheer')} idle="sway" idleAmp={0.25} />

      {/* Milo's costumes, as action figures on display stands */}
      <ActionFigure art={fighter} at={[8.05, 4.3, -7.45]} rotY={-0.4} accent="#e8322b" delay={0.5} onTap={tapSfx('siren', 'cheer')} />
      <ActionFigure art={builder} at={[6.0, 0.01, 1.0]} accent="#f4b400" delay={0.55} onTap={tapSfx('giggle', 'cheer')} />
      <ActionFigure art={fixer} at={[6.1, 1.22, -5.25]} accent="#3a6fd8" delay={0.6} onTap={tapSfx('snap', 'wave')} />

      {/* Super Milo, a toy plane-style figure hanging on a string from a hook */}
      <Cutout art={wallHook} size={[0.3, 0.45]} at={[SX + knotX, HOOK_Y - 0.12, -8.55]} delay={0.65} hinge="spring" contact={false} />
      <Cutout art={hangString} size={[0.1, stringLen]} at={[SX + knotX, SY + knotY, -8.52]} delay={0.65} hinge="drop" shadow={false} contact={false} />
      <Cutout art={flyingMilo} size={superSize} at={[SX, SY, -8.5]} delay={0.65} hinge="drop" tap="spin" onTap={tapSfx('whoosh', 'jump')} idle="float" idleAmp={0.3} />

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
