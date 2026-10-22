import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { sparkle, heart } from '../../art/kit'
import { svgTexture } from '../../art/texture'
import {
  CAPE_ART, HERO, HERO_K, KITTEN, TOWER, TOWER_KITTEN, TOWER_LIGHT, antennaLight, arrowHint, balloon, brickBlock, cloudSea,
  flockV, foregroundRoof, glassOffice, heroCape, heroSpreadArt, kitten, meowBubble, puffyCloud, skylineFar, skylineNear, worldSkyFar, worldSkyNear,
  songBird, speedLines, sunBig, sunGlow, superMilo, tallTower, worldTower,
} from '../../art/hero'
import { Part, PopCard } from '../../popup/PopCard'
import { PullTab } from '../../popup/PullTab'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { clamp01, easeOutBack } from '../../anim/ease'
import { bus } from '../../bus'
import { Cutout } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 6 — "Super Milo". A kitten is stuck on the tallest tower!
 *   back:   hazy skyline (two V-folded layers) · sunset cloud streaks
 *   middle: glass office · brick block · THE TALL TOWER (kitten on top!)
 *   front:  Super-Milo, ready to fly · clouds · birds
 * Pull the red tab: Milo zooms up the tower, scoops the kitten, loops the
 * loop and lands safely. Hearts pop out; the kitten and hearts float away
 * into the sky world behind the book.
 */

/* ------------------------------------------------------ the layout -- */

const TOWER_AT: [number, number] = [0.82, -0.42]
const TOWER_SIZE: [number, number] = [TOWER.w / 1000, TOWER.h / 1000]
const KITTEN_SIZE: [number, number] = [(KITTEN.w / 1000) * 0.92, (KITTEN.h / 1000) * 0.92]

const HERO_SCALE = 1.2
const START = new THREE.Vector3(0.3, 0.3, 0.5)
const GRAB = new THREE.Vector3(0.46, 1.62, -0.3)
const LAND = new THREE.Vector3(1.1, 0.3, 0.55)
const SAFE_AT: [number, number] = [1.3, 0.8]
const HEARTS: { dx: number; dz: number; y: number; to: [number, number, number]; s: number }[] = [
  { dx: -0.18, dz: 0.02, y: 0.34, to: [-3.0, 1.7, -5], s: 0.15 },
  { dx: -0.08, dz: -0.04, y: 0.5, to: [-1.0, 2.1, -6], s: 0.2 },
  { dx: 0.0, dz: 0.04, y: 0.42, to: [1.4, 1.8, -6], s: 0.17 },
  { dx: 0.1, dz: -0.04, y: 0.54, to: [3.2, 2.2, -7], s: 0.2 },
  { dx: 0.18, dz: 0.02, y: 0.36, to: [5.0, 1.6, -5], s: 0.15 },
]
const KITTEN_WORLD: [number, number, number] = [3.8, 0.55, -4.2]

/* ----------------------------------------------- spread behaviour -- */

type Phase = 'idle' | 'run' | 'done'
/** Live state of this spread (reset when you turn the page away). */
const fl = {
  phase: 'idle' as Phase,
  x: START.x, y: START.y, z: START.z, rot: 0.1,
  speed: 0, // speed lines + sparkle trail
  carry: 0, // the kitten is in Milo's arms
  onTower: 1, // the kitten is up on the tower
  meow: 0, // speech bubble
  safe: 0, // the rescued kitten on the landing pad
  hearts: 0,
  crouch: 0, // wind-up squash
  pulse: 0, // happy bounce
  hint: 1, // the "pull me" arrow
  escaped: false,
  nextMeow: 3,
  kRz: 0, // kitten tap wobble
}

const pt = new THREE.Vector3()
const tg = new THREE.Vector3()
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const ang = (v: THREE.Vector3) => Math.atan2(v.y, Math.max(Math.abs(v.x), 0.02))

const asc = new THREE.CatmullRomCurve3([
  START,
  new THREE.Vector3(0.38, 0.4, 0.4),
  new THREE.Vector3(0.36, 0.85, 0.2),
  new THREE.Vector3(0.42, 1.25, -0.08),
  GRAB,
])
const toLoop = new THREE.CatmullRomCurve3([
  GRAB,
  new THREE.Vector3(0.68, 1.5, -0.28),
  new THREE.Vector3(0.84, 1.38, -0.26),
  new THREE.Vector3(0.98, 1.3, -0.24),
])
const LOOP = { cx: 0.98, cy: 1.5, r: 0.2, drift: 0.14 }
const descend = new THREE.CubicBezierCurve3(
  new THREE.Vector3(LOOP.cx + LOOP.drift, 1.3, -0.14),
  new THREE.Vector3(1.46, 1.28, 0.0),
  new THREE.Vector3(1.5, 0.7, 0.34),
  LAND,
)

function place(p: THREE.Vector3, rot: number) {
  fl.x = p.x
  fl.y = p.y
  fl.z = p.z
  fl.rot = rot
}

function resetState() {
  Object.assign(fl, {
    phase: 'idle', x: START.x, y: START.y, z: START.z, rot: 0.1, speed: 0, carry: 0, onTower: 1, meow: 0, safe: 0,
    hearts: 0, crouch: 0, pulse: 0, hint: 1, escaped: false, nextMeow: 3, kRz: 0,
  })
}

/** every story timeline, so the Director can kill them when the page turns away */
const timelines: gsap.core.Timeline[] = []
function story(vars?: gsap.TimelineVars) {
  const tl = gsap.timeline(vars)
  timelines.push(tl)
  return tl
}
function killAll() {
  timelines.splice(0).forEach((t) => t.kill())
  gsap.killTweensOf(fl)
}

/** Show the speech bubble for a moment. */
function meow(hold = 1.5) {
  gsap.killTweensOf(fl, 'meow')
  gsap.fromTo(fl, { meow: 0 }, { meow: 1, duration: 0.3, ease: 'back.out(2.4)', overwrite: false })
  gsap.to(fl, { meow: 0, duration: 0.25, delay: 0.3 + hold, overwrite: false })
}

function runFlight() {
  fl.phase = 'run'
  killAll()
  gsap.to(fl, { hint: 0, duration: 0.3 })
  const u = { v: 0 }
  const tl = story()
  // 1. wind-up: crouch back
  tl.to(fl, { crouch: 1, rot: -0.4, y: START.y - 0.04, duration: 0.42, ease: 'power2.out' })
    .add(() => {
      bus.emit('sfx', 'zoom')
      fl.speed = 1
    })
    // 2. up, up and away!
    .set(u, { v: 0 })
    .to(fl, { crouch: 0, duration: 0.2 }, '<')
    .to(u, {
      v: 1,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        asc.getPoint(u.v, pt)
        asc.getTangent(u.v, tg)
        const a = Math.min(1.25, ang(tg))
        const k = smooth(0.0, 0.2, u.v)
        place(pt, lerp(-0.4, lerp(a, 0.22, smooth(0.72, 1, u.v)), k))
      },
    })
    // 3. scoop the kitten
    .add(() => {
      fl.speed = 0
      bus.emit('sfx', 'pop')
    })
    .to(fl, { onTower: 0, carry: 1, duration: 0.3, ease: 'back.out(2)' })
    .add(() => {
      bus.emit('sfx', 'giggle')
      meow(1.2)
    }, '<')
    .to(fl, { y: GRAB.y + 0.05, rot: 0.1, duration: 0.5, ease: 'sine.inOut' }, '<')
    .to({}, { duration: 0.3 })
    // 4. glide to the loop
    .add(() => {
      fl.speed = 1
      bus.emit('sfx', 'whoosh')
    })
    .set(u, { v: 0 })
    .to(u, {
      v: 1,
      duration: 0.8,
      ease: 'power1.in',
      onUpdate: () => {
        toLoop.getPoint(u.v, pt)
        toLoop.getTangent(u.v, tg)
        place(pt, lerp(0.1, ang(tg), smooth(0, 0.4, u.v)))
      },
    })
    // 5. loop-the-loop!
    .set(u, { v: 0 })
    .add(() => bus.emit('sfx', 'boing'))
    .to(u, {
      v: 1,
      duration: 1.4,
      ease: 'sine.inOut',
      onUpdate: () => {
        const phi = -Math.PI / 2 + u.v * Math.PI * 2
        pt.set(
          LOOP.cx + Math.cos(phi) * LOOP.r + LOOP.drift * u.v,
          LOOP.cy + Math.sin(phi) * LOOP.r,
          lerp(-0.24, -0.14, u.v),
        )
        place(pt, phi + Math.PI / 2 + ang(new THREE.Vector3(1, -0.08, 0)) * (1 - u.v))
      },
      onComplete: () => {
        fl.rot -= Math.PI * 2
      },
    })
    // 6. dive down to the landing pad
    .set(u, { v: 0 })
    .to(u, {
      v: 1,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        descend.getPoint(u.v, pt)
        descend.getTangent(u.v, tg)
        const a = Math.max(-1.1, ang(tg))
        place(pt, lerp(fl.rot * (1 - smooth(0, 0.25, u.v)) + a * smooth(0, 0.25, u.v), 0.05, smooth(0.45, 1, u.v)))
      },
    })
    // 7. landed! safe and sound
    .add(() => {
      fl.speed = 0
      bus.emit('sfx', 'sparkle')
      bus.emit('milo', 'cheer')
    })
    .to(fl, { carry: 0, safe: 1, duration: 0.45, ease: 'back.out(2.2)' })
    .to(fl, { pulse: 1, duration: 0.2, ease: 'power2.out' }, '<')
    .to(fl, { pulse: 0, duration: 0.6, ease: 'bounce.out' })
    .to(fl, { hearts: 1, duration: 0.9, ease: 'none' }, '-=0.3')
    .add(() => bus.emit('sfx', 'giggle'), '<0.1')
    .add(() => {
      fl.phase = 'done'
      gsap.to(fl, { hint: 1, duration: 0.5, delay: 4 })
    }, '+=0.6')
    // 8. the hearts and the kitten float off into the sky
    .add(() => {
      if (fl.phase !== 'done') return
      bus.emit('pull', 'hearts')
      bus.emit('pull', 'kitten')
      bus.emit('sfx', 'whoosh')
      bus.emit('milo', 'cheer')
      fl.escaped = true
    }, '+=0.9')
}

/** Put everything back at the start (for another go). */
function rewind(then: () => void) {
  killAll()
  if (fl.escaped) {
    bus.emit('pull', 'hearts')
    bus.emit('pull', 'kitten')
    fl.escaped = false
  }
  const tl = story({ onComplete: then })
  tl.to(fl, { hearts: 0, safe: 0, carry: 0, duration: 0.35, delay: 1.2 })
    .to(fl, { x: START.x, y: START.y + 0.5, z: START.z, rot: 0.1, duration: 0.7, ease: 'power2.inOut' }, '<')
    .to(fl, { y: START.y, duration: 0.3 })
    .to(fl, { onTower: 1, duration: 0.45, ease: 'back.out(2)' }, '<')
  void tl
}

function fly() {
  if (fl.phase === 'run') return
  if (fl.phase === 'done') {
    fl.phase = 'run'
    rewind(runFlight)
  } else runFlight()
}

/** Resets this spread's state when the page is turned away; timers for the kitten's "Meow!". */
function SkyDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  useFrame((s) => {
    const v = anim.raise[index].v
    if (v < 0.5) {
      if (live.current) {
        live.current = false
        killAll()
        resetState()
      }
      return
    }
    live.current = true
    const t = s.clock.elapsedTime
    if (v > 0.95 && fl.phase === 'idle' && fl.onTower > 0.9 && fl.meow < 0.01 && !gsap.isTweening(fl)) {
      if (fl.nextMeow === 0 || fl.nextMeow > t + 20) fl.nextMeow = t + 1.5
      if (t > fl.nextMeow) {
        fl.nextMeow = t + 7
        meow(1.6)
      }
    }
  })
  return null
}

/* ------------------------------------------------- tiny helpers -- */

/** Scales its children in (a pop) from fl[key]; hidden pieces can't be tapped. */
function PopIn({ at, k, children }: { at: [number, number]; k: () => number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame(() => {
    const e = easeOutBack(clamp01(k()), 1.7)
    g.current.scale.setScalar(Math.max(0.0001, k() <= 0.001 ? 0 : e))
  })
  return (
    <group ref={g} position={[at[0], 0, at[1]]}>
      {children}
    </group>
  )
}

let blobTex: THREE.CanvasTexture | null = null
function blob() {
  if (blobTex) return blobTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.5, 'rgba(0,0,0,.5)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return (blobTex = new THREE.CanvasTexture(c))
}

/** Milo's shadow on the page below, and the sparkle trail behind him. */
function FlightFx() {
  const { index, baseY } = useSpread()
  const sh = useRef<THREE.Mesh>(null!)
  const shMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: blob(), color: '#2a1a4a', transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 }),
    [],
  )
  const N = 14
  const tex = useMemo(() => svgTexture(sparkle('#fff6b0'), 256), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, alphaTest: 0.05 }), [tex])
  const group = useRef<THREE.Group>(null!)
  const trail = useMemo(() => Array.from({ length: N }, () => ({ p: new THREE.Vector3(), life: 0 })), [])
  const acc = useRef(0)
  const head = useRef(0)
  useFrame((_, dt) => {
    const open = anim.raise[index].v > 0.55
    const lift = Math.max(0, fl.y)
    shMat.opacity = open ? 0.34 / (1 + lift * 2.6) : 0
    sh.current.position.set(fl.x, baseY + 0.004, fl.z + 0.02)
    const s = 0.7 / (1 + lift * 0.9)
    sh.current.scale.set(s, s * 0.5, 1)
    acc.current += dt
    if (fl.speed > 0.5 && acc.current > 0.045) {
      acc.current = 0
      const q = trail[head.current++ % N]
      q.p.set(fl.x - Math.cos(fl.rot) * 0.3 + (Math.random() - 0.5) * 0.12, fl.y + Math.sin(fl.rot) * -0.3 + (Math.random() - 0.5) * 0.12, fl.z + 0.02)
      q.life = 1
    }
    group.current.children.forEach((m, i) => {
      const q = trail[i]
      q.life = Math.max(0, q.life - dt * 1.6)
      m.visible = q.life > 0
      m.position.set(q.p.x, baseY + q.p.y, q.p.z)
      m.scale.setScalar(0.02 + q.life * 0.1)
      m.rotation.z += dt * 3
    })
  })
  return (
    <>
      <mesh ref={sh} material={shMat} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={group}>
        {trail.map((_, i) => (
          <mesh key={i} material={mat}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>
    </>
  )
}

/* ------------------------------------------------------ the pieces -- */

const hk = (x: number, y: number): [number, number, number] => [(x - HERO.w / 2) * HERO_K, (HERO.h - y) * HERO_K, 0]

const kittenScared = kitten('scared')
const kittenHappy = kitten('happy')
const dusk = [puffyCloud(560, 260, 1, '#ffe2cc', '#ff9fb4'), puffyCloud(520, 240, 2, '#ffd6dc', '#f08fb0')]
const cloudA = puffyCloud(520, 270, 3)
const cloudB = puffyCloud(520, 250, 8)

/** Super-Milo, a flying paper figure that follows `fl`. */
function SuperMilo() {
  const wrap = useRef<THREE.Group>(null!)
  const capeA = CAPE_ART
  useFrame((s) => {
    const t = s.clock.elapsedTime
    const g = wrap.current
    const idle = fl.phase === 'run' ? 0 : 1
    const bob = fl.phase === 'run' ? 0 : Math.sin(t * 2.2) * 0.02 + fl.pulse * 0.1
    g.position.set(fl.x, fl.y + bob, fl.z)
    g.rotation.z = fl.rot + idle * Math.sin(t * 1.3) * 0.03
    const q = HERO_SCALE * (1 + fl.pulse * 0.1)
    g.scale.set(q * (1 - fl.crouch * 0.05), q * (1 + fl.crouch * 0.06), 1)
  })
  return (
    <group ref={wrap}>
      <PopCard
        art={superMilo}
        size={[HERO.w * HERO_K, HERO.h * HERO_K]}
        at={[0, 0]}
        y={-(HERO.h * HERO_K) / 2}
        delay={0.42}
        hinge="spring"
        contact={false}
        px={1536}
        tap="none"
        onTap={() => {
          if (fl.phase !== 'run') {
            bus.emit('sfx', 'zoom')
            bus.emit('milo', 'jump')
            gsap.fromTo(fl, { pulse: 0 }, { pulse: 1, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
          }
        }}
      >
        <Part
          art={heroCape}
          size={[capeA.w * HERO_K, capeA.h * HERO_K]}
          pivot={hk(456, 196)}
          offset={[(capeA.w / 2 - capeA.ax) * HERO_K, -(capeA.h / 2 - capeA.ay) * HERO_K]}
          z={-0.012}
          px={1024}
          animate={(g, t) => {
            const f = 0.35 + fl.speed * 1.0
            g.rotation.z = Math.sin(t * 9) * 0.05 * f + Math.sin(t * 2.3) * 0.03 + fl.speed * 0.07
            g.scale.set(1 + Math.sin(t * 13) * 0.04 * f, 1 + Math.sin(t * 11) * 0.06 * f, 1)
          }}
        />
        <Part
          art={speedLines}
          size={[0.36, 0.2]}
          pivot={hk(210, 240)}
          offset={[-0.2, 0]}
          z={-0.014}
          animate={(g, t) => {
            g.visible = fl.speed > 0.1
            g.scale.set(1 + Math.sin(t * 20) * 0.1, 1, 1)
          }}
        />
        <Part
          art={kittenHappy}
          size={[0.13, 0.152]}
          pivot={hk(588, 322)}
          z={0.014}
          animate={(g, t) => {
            const c = Math.max(0.0001, fl.carry)
            g.visible = fl.carry > 0.01
            g.scale.setScalar(c)
            g.rotation.z = Math.sin(t * 7) * 0.05
          }}
        />
      </PopCard>
    </group>
  )
}

/** The kitten on top of the tower: wobbles, and meows when you tap her. */
function TowerKitten() {
  const px = (TOWER_KITTEN.x - TOWER.w / 2) / 1000
  const py = (TOWER.h - TOWER_KITTEN.y) / 1000
  const down = (e: ThreeEvent<PointerEvent>) => {
    if (fl.onTower < 0.5) return
    e.stopPropagation()
    bus.emit('sfx', 'giggle')
    meow(1.3)
    gsap.timeline()
      .to(fl, { kRz: 0.3, duration: 0.09 })
      .to(fl, { kRz: -0.25, duration: 0.12 })
      .to(fl, { kRz: 0.15, duration: 0.1 })
      .to(fl, { kRz: 0, duration: 0.12 })
  }
  return (
    <>
      <Part
        art={kittenScared}
        size={KITTEN_SIZE}
        pivot={[px, py, 0.012]}
        offset={[0, KITTEN_SIZE[1] / 2 - 0.004]}
        px={512}
        animate={(g, t) => {
          const k = fl.onTower
          g.visible = k > 0.01
          g.scale.set(Math.max(0.001, k), Math.max(0.001, k), 1)
          // scared little shivers, worst when the bubble is up
          const shake = 0.025 + fl.meow * 0.03
          g.rotation.z = Math.sin(t * 4.1) * 0.045 + Math.sin(t * 17) * shake * 0.5 + fl.kRz
          g.position.x = px + Math.sin(t * 23) * 0.002 * (1 + fl.meow * 2)
        }}
      >
        <mesh position={[0, KITTEN_SIZE[1] / 2, 0.01]} onPointerDown={down} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
          <planeGeometry args={[KITTEN_SIZE[0] * 1.3, KITTEN_SIZE[1] * 1.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </Part>
      <Part
        art={meowBubble}
        size={[0.34, 0.19]}
        pivot={[px - 0.02, py + 0.3, 0.02]}
        offset={[-0.16, 0.08]}
        px={512}
        animate={(g, t) => {
          g.visible = fl.meow > 0.01
          g.scale.setScalar(Math.max(0.001, fl.meow) * (1 + Math.sin(t * 9) * 0.02))
          g.rotation.z = 0.05 + Math.sin(t * 6) * 0.03
        }}
      />
      <Part
        art={antennaLight}
        size={[0.1, 0.1]}
        pivot={[(TOWER_LIGHT.x - TOWER.w / 2) / 1000, (TOWER.h - TOWER_LIGHT.y) / 1000, 0.01]}
        emissive={1}
        animate={(g, t) => {
          const on = Math.sin(t * 3.6) > -0.2 ? 1 : 0.15
          g.scale.setScalar(0.5 + on * 0.7)
        }}
      />
    </>
  )
}

function HeroPopups() {
  return (
    <>
      <SkyDirector />
      {/* ---- back: sunset streaks, hazy far skyline, dusky near skyline ---- */}
      <PopCard art={dusk[0]} size={[0.95, 0.44]} at={[-0.95, -1.08]} y={0.7} hinge="spring" delay={0} idle="drift" idleAmp={0.5} tap="jump" contact={false} emissive={0.6} />
      <PopCard art={dusk[1]} size={[0.7, 0.32]} at={[0.15, -1.08]} y={1.1} hinge="spring" delay={0.02} idle="drift" idleAmp={0.5} idleSpeed={0.8} tap="jump" contact={false} emissive={0.6} />
      <PopCard art={dusk[0]} size={[0.6, 0.28]} at={[1.35, -1.08]} y={0.5} hinge="spring" delay={0.04} idle="drift" idleAmp={0.5} idleSpeed={0.7} tap="jump" contact={false} emissive={0.6} />
      <PopCard art={skylineFar} size={[3.0, 0.9]} at={[0, -1.04]} vfold={0.14} delay={0.02} px={2048} tap="none" />
      <PopCard art={skylineNear} size={[3.0, 0.8]} at={[0, -0.9]} vfold={0.26} delay={0.06} px={2048} tap="none" />
      <PopCard art={songBird} size={[0.17, 0.13]} at={[-0.4, -0.7]} y={1.0} hinge="spring" delay={0.5} idle="float" idleAmp={1.4} tap="jump" onTap={() => bus.emit('sfx', 'giggle')} />
      <PopCard art={songBird} size={[0.12, 0.092]} at={[1.38, -0.5]} y={1.35} hinge="spring" delay={0.52} idle="float" idleAmp={1.2} idleSpeed={1.3} tap="jump" onTap={() => bus.emit('sfx', 'giggle')} />
      {/* ---- middle: the city + THE TALL TOWER ---- */}
      <PopCard art={glassOffice} size={[0.7, 1.05]} at={[-1.0, -0.56]} delay={0.1} rotY={0.14} px={1024} tap="wiggle" />
      <PopCard art={brickBlock} size={[0.56, 0.86]} at={[-0.3, -0.66]} delay={0.14} rotY={-0.1} px={1024} tap="wiggle" />
      <PopCard art={brickBlock} size={[0.4, 0.62]} at={[1.42, -0.78]} delay={0.16} rotY={-0.22} px={768} tap="wiggle" />
      <PopCard art={tallTower} size={TOWER_SIZE} at={TOWER_AT} delay={0.2} px={2048} tap="none" rotY={-0.05} hinge="back">
        <TowerKitten />
      </PopCard>
      <PopCard art={sparkle()} size={[0.12, 0.12]} at={[1.18, -0.3]} y={1.9} hinge="spring" delay={0.55} idle="float" emissive={0.8} tap="spin" />
      <PopCard art={sparkle()} size={[0.08, 0.08]} at={[1.12, -0.3]} y={1.5} hinge="spring" delay={0.58} idle="float" idleSpeed={1.4} emissive={0.8} tap="spin" />
      {/* ---- front: Super-Milo, clouds, hearts, the rescued kitten ---- */}
      <PopCard art={cloudA} size={[0.52, 0.27]} at={[-0.12, 0.98]} delay={0.36} emissive={0.5} hinge="spring" idle="bob" tap="jump" />
      <PopCard art={cloudB} size={[0.42, 0.2]} at={[1.4, 0.98]} delay={0.4} emissive={0.5} hinge="spring" idle="bob" idleSpeed={0.8} tap="jump" />
      <SuperMilo />
      <FlightFx />
      <PopIn at={SAFE_AT} k={() => fl.safe}>
        <PopCard
          art={kittenHappy}
          size={[0.27, 0.315]}
          at={[0, 0]}
          delay={0.1}
          hinge="spring"
          idle="bob"
          tap="jump"
          onTap={() => bus.emit('sfx', 'giggle')}
          escape={{ to: KITTEN_WORLD, arc: 1.4, scale: 3.2, duration: 2.4, spin: -0.25, on: 'kitten' }}
        />
      </PopIn>
      {HEARTS.map((h, i) => (
        <PopIn key={i} at={[SAFE_AT[0] + h.dx - 0.04, SAFE_AT[1] + h.dz]} k={() => fl.hearts * 1.05 - i * 0.1}>
          <PopCard
            art={heart(i % 2 ? '#ff5a7a' : '#ff7ab0')}
            size={[h.s * 1.15, h.s * 1.1]}
            at={[0, 0]}
            y={h.y}
            hinge="spring"
            delay={0.05}
            idle="float"
            idleSpeed={1 + i * 0.1}
            emissive={0.6}
            tap="spin"
            escape={{ to: h.to, arc: 1.2, scale: 2.8, duration: 1.8 + i * 0.15, spin: Math.PI * 1.5, on: 'hearts' }}
          />
        </PopIn>
      ))}
      {/* the "pull me!" arrow, until you've pulled */}
      <PopIn at={[0.42, 0.8]} k={() => fl.hint}>
        <PopCard art={arrowHint} size={[0.11, 0.135]} at={[0, 0]} delay={0.6} hinge="spring" idle="bob" idleAmp={2.4} idleSpeed={1.8} tap="none" contact={false} emissive={0.4} />
      </PopIn>
      <PullTab
        id="fly"
        label="Fly, Milo!"
        sub="pull the tab"
        at={[0.42, 0.95]}
        color="#d8261c"
        accent="#a8160f"
        delay={0.55}
        onPull={fly}
      />
    </>
  )
}

/* ---------------------------------------------------------- the world -- */

const T = (w: number, h: number, body: string, shade: string, rim: string, crown: Parameters<typeof worldTower>[0]['crown'], seed: number, lit = 0.5, bands?: string) =>
  worldTower({ w, h, body, shade, rim, crown, seed, lit, bands })

const towers = {
  a: T(280, 1000, '#ec9c88', '#d9937a', '#fff0d2', 'spire', 3, 0.5, '#d9937a'),
  b: T(240, 1200, '#8672cc', '#9e8ad8', '#ece4ff', 'antenna', 4, 0.4),
  c: T(320, 820, '#6fa8dc', '#78b4e0', '#e0f4ff', 'dome', 5, 0.55, '#78b4e0'),
  d: T(260, 1400, '#dc7490', '#e0808e', '#ffe0e6', 'stepped', 6, 0.45, '#e0808e'),
  e: T(340, 900, '#f2b85e', '#e8b45a', '#fff6d8', 'pyramid', 7, 0.5),
  f: T(260, 1100, '#5cb496', '#86c8a8', '#eafff2', 'spire', 8, 0.5, '#86c8a8'),
  g: T(300, 760, '#b67ac0', '#d888b4', '#ffe4f2', 'flat', 9, 0.5),
}
const roofL = foregroundRoof(2)
const roofR = foregroundRoof(5, true)
const wCloud = [puffyCloud(600, 260, 11), puffyCloud(520, 240, 12, '#fff4f8', '#f0b8d4'), puffyCloud(700, 280, 13, '#ffffff', '#f2c4e4'), puffyCloud(480, 220, 14, '#fff0f4', '#e8b4d8')]

/** A tower whose top pokes out of the cloud sea: `top` = height of its roof above the clouds. */
function Tw({ art, w, h, x, z, top, delay, shadow = false }: { art: string; w: number; h: number; x: number; z: number; top: number; delay: number; shadow?: boolean }) {
  const c = wCloud[Math.floor(x * 7 + z) & 3 & 3] ?? wCloud[0]
  return (
    <>
      <Cutout art={art} size={[w, h]} at={[x, top - h, z]} hinge="rise" delay={delay} px={1024} shadow={shadow} emissive={0.15} />
      <Cutout art={c} size={[w * 1.5, w * 0.6]} at={[x + 0.1, -0.32, z + 0.15]} hinge="spring" delay={delay + 0.1} shadow={false} idle="drift" idleAmp={0.3} emissive={0.6} />
    </>
  )
}

export function SkyWorld() {
  const E = 0.6
  return (
    <group>
      {/* the sea of clouds under everything */}
      <Cutout art={cloudSea} size={[50, 25]} at={[0, 0.012, 3]} flat delay={0} shadow={false} px={2048} emissive={0.35} />
      {/* the big sunset sun, sinking into the clouds behind the city */}
      <Cutout art={sunGlow} size={[17, 17]} at={[-5.6, -6, -12]} hinge="rise" delay={0.0} shadow={false} emissive={0.9} px={512} />
      <Cutout art={sunBig} size={[4.6, 4.6]} at={[-5.6, -2.0, -11.5]} hinge="rise" delay={0.02} shadow={false} emissive={0.9} px={1024} />
      {/* far skylines: hazy rows on the horizon */}
      <Cutout art={worldSkyFar} size={[56, 7.1]} at={[0, -0.4, -24]} hinge="rise" delay={0.04} shadow={false} px={2048} emissive={0.3} />
      <Cutout art={worldSkyNear} size={[46, 5.2]} at={[1, -0.5, -17]} hinge="rise" delay={0.08} shadow={false} px={2048} emissive={0.3} />
      {/* skyscrapers of different heights, receding (tallest ones run out of the frame) */}
      <Tw art={towers.d} w={2.6} h={14} x={4.6} z={-13} top={3.6} delay={0.1} />
      <Tw art={towers.b} w={2.4} h={12} x={-10.8} z={-10.5} top={3.2} delay={0.12} />
      <Tw art={towers.f} w={2.6} h={11} x={9.6} z={-10.5} top={3.0} delay={0.14} />
      <Tw art={towers.c} w={3.2} h={8.2} x={-4.4} z={-9.5} top={1.9} delay={0.16} />
      <Tw art={towers.a} w={2.8} h={10} x={-7.8} z={-6.5} top={2.2} delay={0.2} />
      <Tw art={towers.e} w={3.4} h={9} x={7.6} z={-7.2} top={1.9} delay={0.22} />
      <Tw art={towers.g} w={3.0} h={7.6} x={2.0} z={-10.5} top={1.6} delay={0.24} />
      <Tw art={towers.e} w={2.4} h={7} x={-1.4} z={-14} top={1.4} delay={0.26} />
      {/* cloud banks around the bases: layered at different depths */}
      <Cutout art={wCloud[1]} size={[4.5, 1.9]} at={[-10.5, -0.3, -6]} delay={0.2} shadow={false} idle="drift" idleAmp={0.5} emissive={E} />
      <Cutout art={wCloud[2]} size={[5, 2]} at={[9.8, -0.3, -6]} delay={0.22} shadow={false} idle="drift" idleAmp={0.5} idleSpeed={0.7} emissive={E} />
      <Cutout art={wCloud[0]} size={[3.4, 1.4]} at={[-5.6, -0.3, -5.5]} delay={0.26} shadow={false} idle="drift" idleAmp={0.6} emissive={E} />
      <Cutout art={wCloud[3]} size={[3.2, 1.4]} at={[5.6, -0.3, -4.8]} delay={0.28} shadow={false} idle="drift" idleAmp={0.8} idleSpeed={0.8} emissive={E} />
      <Cutout art={wCloud[2]} size={[6, 2.2]} at={[-1.5, -0.4, -15]} delay={0.3} shadow={false} idle="drift" idleAmp={0.4} emissive={E} />
      {/* a few clouds floating higher */}
      <Cutout art={wCloud[1]} size={[2.2, 0.95]} at={[-2.8, 1.0, -8]} hinge="spring" delay={0.34} shadow={false} idle="drift" emissive={E} />
      <Cutout art={wCloud[3]} size={[1.9, 0.85]} at={[5.0, 1.2, -8]} hinge="spring" delay={0.38} shadow={false} idle="drift" idleSpeed={0.9} emissive={E} />
      {/* a hot air balloon, and a flock of birds */}
      <Cutout art={balloon} size={[1.5, 2.3]} at={[-8.6, 0.0, -2.6]} hinge="spring" delay={0.4} idle="float" idleAmp={1.8} idleSpeed={0.5} tap="wiggle" />
      <Cutout art={balloon} size={[0.9, 1.4]} at={[8.8, 0.3, -9]} hinge="spring" delay={0.46} idle="float" idleAmp={1.6} idleSpeed={0.4} shadow={false} />
      <Cutout art={flockV(5)} size={[2.0, 1.2]} at={[1.0, 1.1, -7]} hinge="spring" delay={0.5} idle="drift" idleAmp={1.6} shadow={false} />
      <Cutout art={flockV(3, 9)} size={[1.4, 0.84]} at={[-4.6, 1.2, -7]} hinge="spring" delay={0.54} idle="drift" idleAmp={1.2} idleSpeed={1.2} shadow={false} />
      {/* near rooftops frame the book on both sides */}
      <Cutout art={roofL} size={[2.0, 3.4]} at={[-6.6, -1.5, -2.2]} rotY={0.4} delay={0.3} px={1024} />
      <Cutout art={roofR} size={[2.0, 3.4]} at={[5.6, -1.5, -2.2]} rotY={-0.4} delay={0.32} px={1024} />
      {/* a cloud for the rescued kitten to sit on */}
      <Cutout art={wCloud[2]} size={[3.0, 1.25]} at={[KITTEN_WORLD[0], 0, KITTEN_WORLD[2] - 0.1]} hinge="spring" delay={0.4} shadow={false} idle="float" idleAmp={0.5} emissive={E} />
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
  spreadArt: heroSpreadArt,
  Popups: HeroPopups,
  miloReact: 'cheer',
}
