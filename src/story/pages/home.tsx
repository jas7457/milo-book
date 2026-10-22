import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { paperMaterial } from '../../art/texture'
import { useSvgTexture } from '../../art/useSvgTexture'
import { clamp01, windowed } from '../../anim/ease'
import { HUG, MILO_EYES, hugGroup, hugPx, miloEyesClosed, miloEyesOpen } from '../../art/homeFamily'
import {
  BED, LAMP, MOBILE, WALL, WINDOW, bed, bedroomWall, glowStarOff, glowStarOn, homeSpreadArt, lamp, lampLit, nightWindow,
  sleepyStar, slippers, starMobile, teddy, teddyEyesClosed, teddyEyesOpen, toyChest, windowNightOverlay, zzz,
} from '../../art/homeRoom'
import {
  HOUSE, WINDOWS, bigMoon, boxCarToy, bushNight, cat, eaveLights, farHills, fence, firefly, house, lantern, lawn, mailbox,
  nightTree, skyDecor, smokePuff, streetLamp, townline, windowDark, windowLit,
} from '../../art/homeWorld'
import { Part, PopCard } from '../../popup/PopCard'
import { PullTab } from '../../popup/PullTab'
import { useSpread } from '../../popup/SpreadContext'
import { Cutout, useWorldLevel } from '../../world/Cutout'
import { anim } from '../../state'
import { bus } from '../../bus'
import { beat } from '../../progress'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 7 — "Home again". Bedtime.
 *   back:   Milo's bedroom wall (V-fold): shelf with Robo + the box car, the
 *           day's drawings on a clothesline, a cape on its peg · the window · the
 *           star mobile · glow-in-the-dark stars · a toy chest (toys put away)
 *   middle: Milo's bed · Mom and Dad hugging Milo (the biggest, squeeziest hug)
 *   front:  teddy · slippers · the little bedside lamp
 * Pull the "Lights out" tab (or tap the lamp): the room dims, the lamp goes out,
 * the moon and stars come out, the mobile's stars drift off into the world,
 * Milo's eyes close and a sleepy Zzz floats up. Do it again for the light.
 */

/* ------------------------------------------------- spread behaviour -- */

/** `dark` is 0 (lamp on) … 1 (lights out); `target` is where it is heading. */
const night = { dark: 0, target: 0 }
const calls: gsap.core.Animation[] = []

function resetNight() {
  gsap.killTweensOf(night)
  calls.splice(0).forEach((c) => c.kill())
  night.dark = 0
  night.target = 0
}

function toggleLights(index: number) {
  if (anim.raise[index].v < 0.9) return
  const off = night.target === 0
  night.target = off ? 1 : 0
  gsap.killTweensOf(night)
  gsap.to(night, { dark: night.target, duration: off ? 1.7 : 0.9, ease: 'power2.inOut' })
  if (off) {
    beat('home', 1) // lights out: the bedtime ending can be written
    bus.emit('sfx', 'sparkle')
    bus.emit('milo', 'wave')
    calls.push(gsap.delayedCall(0.9, () => bus.emit('sfx', 'sparkle')))
  } else {
    bus.emit('sfx', 'pop')
    bus.emit('milo', 'jump')
  }
}

/** Resets this spread's state when the page is turned away; listens for the lights toggle. */
function HomeDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  useEffect(() => {
    const off = bus.on('pull', (id) => id === 'lights' && toggleLights(index))
    return () => {
      off()
      resetNight()
    }
  }, [index])
  useFrame(() => {
    const away = anim.raise[index].v < 0.5
    if (away && live.current) {
      live.current = false
      resetNight()
    } else if (!away) live.current = true
  })
  return null
}


/* ----------------------------------------------- little light helpers -- */

let glowTexture: THREE.CanvasTexture | null = null
function glowTex() {
  if (glowTexture) return glowTexture
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  glowTexture = new THREE.CanvasTexture(c)
  return glowTexture
}

/** A soft additive glow: opacity comes from `level()` every frame. */
function Glow({ position, size, color, level, flat = false }: {
  position: [number, number, number]
  size: [number, number]
  color: string
  level: () => number
  flat?: boolean
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTex(), color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
      }),
    [color],
  )
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const o = level()
    mat.opacity = o
    ref.current.visible = o > 0.01
  })
  return (
    <mesh ref={ref} material={mat} position={position} rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} renderOrder={4}>
      <planeGeometry args={size} />
    </mesh>
  )
}

/** A painted overlay (same box as its parent piece) that fades in with `level()` — unlit, so it glows. */
function Fade({ art, size, pivot = [0, 0, 0], offset = [0, 0], z = 0.006, px = 512, level }: {
  art: string
  size: [number, number]
  pivot?: [number, number, number]
  offset?: [number, number]
  z?: number
  px?: number
  level: () => number
}) {
  const tex = useSvgTexture(art, px)
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }),
    [tex],
  )
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const o = level()
    mat.opacity = o
    ref.current.visible = o > 0.01
  })
  return (
    <group position={[pivot[0], pivot[1], pivot[2] + z]}>
      <mesh ref={ref} material={mat} position={[offset[0], offset[1], 0]} renderOrder={5}>
        <planeGeometry args={size} />
      </mesh>
    </group>
  )
}

const dark = () => night.dark
const lit = () => 1 - night.dark

/** Darkens the paper pieces as the room dims (tints their shared materials). */
function Dim({ specs }: { specs: { art: string; px: number }[] }) {
  const texs = specs.map((s) => useSvgTexture(s.art, s.px))
  useFrame(() => {
    const d = night.dark
    for (const t of texs) paperMaterial(t).color.setRGB(1 - 0.5 * d, 1 - 0.46 * d, 1 - 0.2 * d)
  })
  return null
}

/** The page darkens, the lamp's pool of light fades, moonlight comes in; point lights follow. */
function NightFx() {
  const { index, baseY } = useSpread()
  const veil = useRef<THREE.Mesh>(null!)
  const lampLight = useRef<THREE.PointLight>(null!)
  const moonLight = useRef<THREE.PointLight>(null!)
  const veilMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#0a1040', transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false }),
    [],
  )
  useFrame((s) => {
    const open = windowed(anim.raise[index].v, 0.3, 0.3)
    const d = night.dark
    veilMat.opacity = d * 0.5 * open
    veil.current.visible = veilMat.opacity > 0.005
    lampLight.current.intensity = open * (1 - d) * (1.5 + Math.sin(s.clock.elapsedTime * 2.1) * 0.08)
    moonLight.current.intensity = open * d * 1.7
  })
  const open = () => windowed(anim.raise[index].v, 0.3, 0.3)
  return (
    <>
      <mesh ref={veil} material={veilMat} position={[0, baseY + 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[3.2, 2.2]} />
      </mesh>
      <Glow position={[1.15, baseY + 0.005, 0.4]} size={[2.2, 1.5]} color="#ffb860" level={() => open() * lit() * 0.55} flat />
      <Glow position={[0.95, baseY + 0.005, -0.1]} size={[1.5, 1.0]} color="#9fb6ff" level={() => open() * dark() * 0.5} flat />
      <pointLight ref={lampLight} position={[1.45, baseY + 0.45, 0.3]} color="#ffc878" distance={2.6} decay={1.4} />
      <pointLight ref={moonLight} position={[0.8, baseY + 1.0, -0.4]} color="#8fa8ff" distance={3.4} decay={1.3} />
    </>
  )
}

/* ------------------------------------------------------- positions -- */

const FOLD = 0.2
const WALL_Z = -0.92

/** A spot on the V-folded wall: u = distance along the wall from the spine, h = height. */
function onWall(u: number, h: number, d = 0.014) {
  const s = Math.sin(FOLD)
  const c = Math.cos(FOLD)
  return u >= 0
    ? { at: [u * c - d * s, WALL_Z + u * s + d * c] as [number, number], y: h, rotY: -FOLD }
    : { at: [u * c + d * s, WALL_Z - u * s + d * c] as [number, number], y: h, rotY: FOLD }
}

const HUG_AT: [number, number] = [0.22, 0.42]
const HUG_SIZE: [number, number] = [1.75, 1.0]
const HK = HUG_SIZE[0] / HUG.w
/** a point on the hug art grid → pivot in the piece's space */
const hugPivot = (x: number, y: number): [number, number, number] => {
  const [px, py] = hugPx(x, y)
  return [(px - HUG.w / 2) * HK, (HUG.h - py) * HK, 0]
}
const LAMP_AT: [number, number] = [1.45, 0.3]
const TEDDY = { w: 0.3, h: 0.386 }
const TK = TEDDY.w / 420

const GLOW_STARS: [number, number, number][] = [
  [-1.32, 1.18, 0.1], [-1.1, 1.24, 0.07], [-0.72, 1.26, 0.09], [-0.42, 1.2, 0.06], [-0.1, 1.23, 0.1], [0.12, 1.12, 0.07],
  [0.36, 1.26, 0.08], [1.26, 1.2, 0.09], [1.38, 1.02, 0.06], [-0.9, 0.52, 0.07], [0.3, 0.98, 0.06], [-1.4, 0.9, 0.06],
]

/** world-space places the mobile's stars drift off to */
const STAR_FLIGHTS: { dx: number; y: number; to: [number, number, number]; s: number }[] = [
  { dx: -0.26, y: 0.84, to: [-4.2, 1.2, -3.0], s: 0.16 },
  { dx: -0.12, y: 0.72, to: [-2.8, 1.5, -4.0], s: 0.14 },
  { dx: 0.12, y: 0.74, to: [-0.8, 1.2, -3.0], s: 0.15 },
  { dx: 0.26, y: 0.86, to: [-5.2, 0.8, -2.4], s: 0.17 },
]

const DIM_SPECS = [
  { art: bedroomWall, px: 2048 },
  { art: nightWindow, px: 1024 },
  { art: bed, px: 1024 },
  { art: hugGroup(), px: 2048 },
  { art: teddy, px: 768 },
  { art: slippers, px: 768 },
  { art: lamp, px: 768 },
  { art: toyChest, px: 768 },
  { art: starMobile, px: 768 },
]
const HUG_ART = DIM_SPECS[3].art

/* ----------------------------------------------------------- pop-ups -- */

const pjEyesOpen = miloEyesOpen()
const pjEyesClosed = miloEyesClosed()
const starArt = sleepyStar()
const glowSizes = GLOW_STARS.map(([u, h, s]) => ({ ...onWall(u, h), s }))

function Hug() {
  const eyeW = 260 * MILO_EYES.s * HK
  const eyeH = 100 * MILO_EYES.s * HK
  const eyePivot = hugPivot(MILO_EYES.cx, MILO_EYES.cy)
  return (
    <PopCard
      art={HUG_ART}
      size={HUG_SIZE}
      at={HUG_AT}
      delay={0.2}
      rotY={0.06}
      px={2048}
      idle="sway"
      idleAmp={0.25}
      tap="wiggle"
      onTap={() => bus.emit('sfx', 'giggle')}
    >
      <Part
        art={pjEyesOpen}
        size={[eyeW, eyeH]}
        pivot={eyePivot}
        animate={(g, t) => {
          const d = night.dark
          g.visible = d < 0.8
          const droop = clamp01((d - 0.08) / 0.6)
          const blink = Math.sin(t * 1.3 + 2) > 0.985 ? 0.15 : 1
          g.scale.set(1, Math.max(0.06, 1 - droop * 0.92) * blink, 1)
        }}
      />
      <Part
        art={pjEyesClosed}
        size={[eyeW, eyeH]}
        pivot={eyePivot}
        animate={(g) => {
          const k = clamp01((night.dark - 0.7) / 0.15)
          g.visible = k > 0.01
          g.scale.setScalar(Math.max(0.001, k))
        }}
      />
      <Part
        art={zzz}
        size={[0.2, 0.2]}
        pivot={hugPivot(MILO_EYES.cx + 130, 250)}
        animate={(g, t) => {
          const k = clamp01((night.dark - 0.85) / 0.15)
          g.visible = k > 0.01
          const c = (t * 0.4) % 1
          g.position.y = hugPivot(0, 250)[1] + c * 0.16
          g.position.x = hugPivot(MILO_EYES.cx + 130, 250)[0] + Math.sin(c * 6) * 0.015
          g.scale.setScalar(Math.max(0.001, k * (0.5 + Math.sin(c * Math.PI) * 0.7)))
        }}
      />
    </PopCard>
  )
}

function Teddy() {
  const eyeSize: [number, number] = [160 * TK, 50 * TK]
  const pivot: [number, number, number] = [0, (540 - 165) * TK, 0]
  return (
    <PopCard art={teddy} size={[TEDDY.w, TEDDY.h]} at={[1.2, 0.66]} delay={0.38} rotY={-0.2} px={768} tap="jump" idle="bob" idleAmp={0.4} onTap={() => bus.emit('sfx', 'giggle')}>
      <Part
        art={teddyEyesOpen}
        size={eyeSize}
        pivot={pivot}
        animate={(g) => {
          g.visible = night.dark < 0.5
        }}
      />
      <Part
        art={teddyEyesClosed}
        size={eyeSize}
        pivot={pivot}
        animate={(g) => {
          g.visible = night.dark >= 0.5
        }}
      />
    </PopCard>
  )
}

function Lamp() {
  const { index } = useSpread()
  const open = () => windowed(anim.raise[index].v, 0.4, 0.3)
  const k = LAMP.w / 360
  return (
    <PopCard
      art={lamp}
      size={[LAMP.w, LAMP.h]}
      at={LAMP_AT}
      delay={0.4}
      rotY={-0.25}
      px={768}
      tap="wiggle"
      onTap={() => bus.emit('pull', 'lights')}
    >
      <Fade art={lampLit} size={[LAMP.w, LAMP.h]} pivot={[0, LAMP.h / 2, 0]} px={768} level={() => open() * lit()} />
      <Glow position={[0, (560 - 200) * k, -0.004]} size={[1.0, 1.0]} color="#ffcf80" level={() => open() * lit() * 0.6} />
    </PopCard>
  )
}

function GlowStar({ at, y, rotY, s, i }: { at: [number, number]; y: number; rotY: number; s: number; i: number }) {
  return (
    <PopCard art={glowStarOff} size={[s, s]} at={at} y={y} rotY={rotY} delay={0.3 + (i % 5) * 0.025} hinge="spring" tap="none" contact={false} shadow={false}>
      <Part
        art={glowStarOn}
        size={[s, s]}
        pivot={[0, s / 2, 0]}
        emissive={1}
        animate={(g, t) => {
          const d = night.dark
          g.visible = d > 0.03
          g.scale.setScalar(Math.max(0.001, d * (1 + Math.sin(t * 2.2 + i * 1.7) * 0.12)))
        }}
      />
      <Glow position={[0, s / 2, 0.003]} size={[s * 3.6, s * 3.6]} color="#d8ff8a" level={() => dark() * (0.55 + Math.sin(i * 2.3) * 0.1)} />
    </PopCard>
  )
}

function LightsTab() {
  const [off, setOff] = useState(false)
  const last = useRef(false)
  useFrame(() => {
    const now = night.target === 1
    if (now !== last.current) {
      last.current = now
      setOff(now)
    }
  })
  return (
    <PullTab
      id="lights"
      label={off ? 'Lights on' : 'Lights out'}
      sub={off ? 'pull again' : 'pull the tab'}
      at={[0.52, 1.0]}
      accent={off ? '#c98a1a' : '#4a4a9a'}
      color={off ? '#e9a23b' : '#6a6ad0'}
      delay={0.5}
    />
  )
}

function HomePopups() {
  return (
    <>
      <HomeDirector />
      <Dim specs={DIM_SPECS} />
      <NightFx />
      {/* back: the wall, the window, the mobile, the toys put away */}
      <PopCard art={bedroomWall} size={[WALL.w, WALL.h]} at={[0, WALL_Z]} vfold={FOLD} delay={0} px={2048} tap="none" />
      <PopCard
        art={nightWindow}
        size={[WINDOW.w, WINDOW.h]}
        {...onWall(0.8, 0.5, 0.02)}
        delay={0.08}
        px={1024}
        tap="none"
        contact={false}
      >
        <Fade art={windowNightOverlay} size={[WINDOW.w, WINDOW.h]} pivot={[0, WINDOW.h / 2, 0]} px={1024} level={dark} />
        <Glow position={[0.13, 0.576, 0.01]} size={[0.8, 0.8]} color="#fff4c4" level={() => dark() * 0.7} />
      </PopCard>
      <PopCard art={toyChest} size={[0.6, 0.44]} at={[-0.52, -0.8]} delay={0.14} rotY={0.1} px={768} tap="wiggle" />
      {glowSizes.map((g, i) => (
        <GlowStar key={i} at={g.at} y={g.y} rotY={g.rotY} s={g.s} i={i} />
      ))}
      {/* middle: the bed and the hug */}
      <PopCard art={bed} size={[BED.w * 0.92, BED.h * 0.92]} at={[1.1, -0.62]} delay={0.14} rotY={-FOLD} px={1024} tap="wiggle" />
      <Hug />
      {/* the star mobile over the bed: its stars drift off into the world when the lights go out */}
      <PopCard art={starMobile} size={[MOBILE.w, MOBILE.h]} at={[0.18, -0.4]} y={0.6} delay={0.28} hinge="drop" idle="sway" idleAmp={0.3} px={768} tap="wiggle" contact={false} />
      {STAR_FLIGHTS.map((f, i) => (
        <PopCard
          key={i}
          art={starArt}
          size={[f.s, f.s]}
          at={[0.18 + f.dx, -0.39]}
          y={f.y}
          delay={0.36 + i * 0.02}
          hinge="spring"
          emissive={0.55}
          idle="float"
          idleAmp={0.5}
          tap="spin"
          contact={false}
          escape={{ to: f.to, arc: 0.7, scale: 3.2, duration: 2.2 + i * 0.25, spin: Math.PI * 2, on: 'lights' }}
        />
      ))}
      {/* front */}
      <Teddy />
      <PopCard art={slippers} size={[0.42, 0.186]} at={[0.62, 0.9]} delay={0.36} rotY={0.1} px={768} tap="jump" />
      <Lamp />
      <LightsTab />
    </>
  )
}

/* ---------------------------------------------------------- the world -- */

/** house art px → world position on the house front */
const HOUSE_AT: [number, number, number] = [2.4, 0, -6.4]
const hp = (x: number, y: number, z = 0.03): [number, number, number] => [
  HOUSE_AT[0] + (x - HOUSE.w / 2) * HOUSE.units,
  (HOUSE.h - y) * HOUSE.units,
  HOUSE_AT[2] + z,
]

const FIREFLIES: [number, number, number][] = [
  [-3.2, 1.2, -2.6], [-1.6, 2.1, -4.4], [0.9, 1.5, -3.2], [3.6, 2.4, -5.6], [5.4, 1.1, -3.4], [-5.4, 2.6, -5.2], [7.2, 2.0, -4.6], [-7.2, 1.2, -3.0],
]

const worldTrees = [
  { art: nightTree('#2f6b55', '#3c8068', 3), at: [-6.6, 0, -6.4] as [number, number, number], size: [4.4, 6.3] as [number, number] },
  { art: nightTree('#2b5f66', '#357a80', 9), at: [-10.4, 0, -8.5] as [number, number, number], size: [3.8, 5.4] as [number, number] },
  { art: nightTree('#38645a', '#46806f', 5), at: [8.6, 0, -6.6] as [number, number, number], size: [4.2, 6.0] as [number, number] },
  { art: nightTree('#2f6b55', '#3c8068', 12), at: [12.2, 0, -9] as [number, number, number], size: [3.6, 5.2] as [number, number] },
]

function WorldGlow() {
  const lvl = useWorldLevel(0.25)
  return (
    <>
      <Glow position={[-6.5, 3.9, -13.2]} size={[11, 11]} color="#ffe9a0" level={() => lvl() * 0.6} />
      <Glow position={[2.4, 1.8, -6.0]} size={[9, 5]} color="#ffb860" level={() => lvl() * 0.35} />
    </>
  )
}

function WorldLights() {
  const porch = useRef<THREE.PointLight>(null!)
  const lamp = useRef<THREE.PointLight>(null!)
  const lvl = useWorldLevel(0.3)
  useFrame((s) => {
    porch.current.intensity = lvl() * (9 + Math.sin(s.clock.elapsedTime * 2.2) * 0.3)
    lamp.current.intensity = lvl() * 8
  })
  return (
    <>
      <pointLight ref={porch} position={[3.2, 1.4, -5.4]} color="#ffcf8a" distance={12} decay={1.5} />
      <pointLight ref={lamp} position={[-5.0, 3.2, -4.2]} color="#ffe3a0" distance={11} decay={1.5} />
    </>
  )
}

/** Milo's house at dusk: lit windows, string lights, a sleepy moon. Milo's window goes dark with the lights. */
export function BedroomWorld() {
  const lvlWin = () => 1
  return (
    <group>
      {/* sky, moon, hills, the neighbourhood */}
      <Cutout art={skyDecor} size={[46, 15.3]} at={[0, 0.8, -16]} hinge="rise" delay={0.02} emissive={0.75} shadow={false} px={2048} />
      <Cutout art={bigMoon} size={[4.6, 4.6]} at={[-6.5, 1.6, -13]} hinge="rise" delay={0.08} emissive={0.7} idle="float" idleAmp={0.15} shadow={false} px={1024} />
      <Cutout art={farHills('#4a3f86', '#3b3272')} size={[32, 9.6]} at={[-8, 0, -15]} hinge="rise" delay={0.04} shadow={false} px={1024} />
      <Cutout art={farHills('#4a3f86', '#3b3272')} size={[32, 9.6]} at={[22, 0, -15]} hinge="rise" delay={0.04} shadow={false} px={1024} />
      <Cutout art={townline} size={[16, 2.6]} at={[-12, 0, -13.4]} hinge="rise" delay={0.08} emissive={0.25} shadow={false} />
      <Cutout art={farHills('#3a3070', '#2c2560', 1200, 300)} size={[26, 6.5]} at={[-14, 0, -12.6]} hinge="rise" delay={0.08} shadow={false} />
      <Cutout art={farHills('#3a3070', '#2c2560', 1200, 300)} size={[26, 6.5]} at={[14, 0, -12.4]} hinge="rise" delay={0.08} shadow={false} />
      <WorldGlow />
      {/* the garden */}
      <Cutout art={lawn} size={[30, 12]} at={[1.65, 0.004, -1.5]} flat delay={0} shadow={false} px={2048} />
      {worldTrees.map((t, i) => (
        <Cutout key={i} art={t.art} size={t.size} at={t.at} delay={0.18 + i * 0.03} shadow={false} tap="wiggle" />
      ))}
      {/* the house */}
      <Cutout art={house} size={[HOUSE.w * HOUSE.units, HOUSE.h * HOUSE.units]} at={HOUSE_AT} hinge="rise" delay={0.12} px={2048} shadow={false} />
      {WINDOWS.map((w) => {
        const cx = w.x + w.w / 2
        const cy = w.y + w.h
        const sw = w.w * HOUSE.units
        const sh = w.h * HOUSE.units
        return (
          <Cutout key={w.id} art={windowLit(w.w, w.h, w.id === 'milo' ? 'milo' : 'plain')} size={[sw, sh]} at={hp(cx, cy)} hinge="rise" delay={0.2} emissive={1} shadow={false}>
            {w.id === 'milo' && <Fade art={windowDark(w.w, w.h)} size={[sw, sh]} pivot={[0, sh / 2, 0]} z={0.004} level={() => dark() * lvlWin()} />}
          </Cutout>
        )
      })}
      <Cutout art={eaveLights} size={[6.6, 0.9]} at={hp(450, 382, 0.06)} hinge="rise" delay={0.22} emissive={0.9} shadow={false} />
      <Cutout art={lantern} size={[0.6, 1.0]} at={hp(604, 540, 0.06)} hinge="rise" delay={0.24} emissive={1} shadow={false} />
      {[0, 1, 2].map((i) => (
        <Cutout key={i} art={smokePuff} size={[0.7 + i * 0.25, 0.7 + i * 0.25]} at={[4.0 + i * 0.45, 4.2 + i * 0.7, -6.3]} hinge="spring" delay={0.3 + i * 0.04} idle="drift" shadow={false} />
      ))}
      <Cutout art={bushNight} size={[2.6, 1.4]} at={[0.0, 0, -5.8]} delay={0.2} shadow={false} />
      <Cutout art={bushNight} size={[2.6, 1.4]} at={[5.0, 0, -5.8]} delay={0.22} shadow={false} />
      <Cutout art={cat} size={[0.75, 0.87]} at={[3.4, 0, -4.8]} rotY={-0.25} delay={0.3} tap="jump" />
      {/* street */}
      <Cutout art={fence} size={[10, 1.85]} at={[-8.5, 0, -3.0]} rotY={0.12} delay={0.2} shadow={false} />
      <Cutout art={fence} size={[10, 1.85]} at={[11.0, 0, -3.2]} rotY={-0.1} delay={0.2} shadow={false} />
      <Cutout art={mailbox} size={[0.8, 1.52]} at={[5.4, 0, -3.4]} rotY={-0.3} delay={0.26} tap="wiggle" />
      <Cutout art={streetLamp} size={[0.9, 3.6]} at={[-5.0, 0, -4.4]} delay={0.26} emissive={0.45} shadow={false} />
      <Cutout art={boxCarToy} size={[1.5, 1.07]} at={[-4.0, 0, -3.2]} rotY={0.5} delay={0.3} tap="jump" />
      {FIREFLIES.map((p, i) => (
        <Cutout key={i} art={firefly} size={[0.26, 0.26]} at={p} hinge="spring" delay={0.34 + i * 0.02} emissive={1} idle="float" idleSpeed={0.7 + (i % 3) * 0.2} idleAmp={1.6} shadow={false} />
      ))}
      <WorldLights />
    </group>
  )
}

export const homeSpread: SpreadDef = {
  id: 'home',
  world: 'bedroom',
  palette: palettes.bedtime,
  outfit: 'pajamas',
  heading: 'Home again',
  beats: 1,
  textCard: { x: 0, y: 0.56, w: 0.75 },
  text: [
    'Home at last! Mom and Dad gave Milo the biggest, squeeziest *hug*. Now it was time for bed. Can you turn the *lights out*?',
    { after: 1, text: `The moon peeked in. The stars went *twinkle, twinkle*. "What an adventure!" yawned Milo. *Goodnight, Milo.*` },
  ],
  spreadArt: homeSpreadArt,
  Popups: HomePopups,
  miloReact: 'wave',
}
