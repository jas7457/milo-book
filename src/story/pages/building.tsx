import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { cloud, sparkle } from '../../art/kit'
import { Part, PopCard } from '../../popup/PopCard'
import { DragPiece } from '../../popup/DragPiece'
import { Piece } from '../../popup/Piece'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { clamp01 } from '../../anim/ease'
import { bus } from '../../bus'
import { beat } from '../../progress'
import { heard } from '../../cue'
import { Cutout, useWorldLevel } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'
import { buildingSpreadArt } from '../../art/bridge/spread'
import { bigPine, bigTree, castle, castleFlag, farHills, smallTree, windmill, windmillBlades } from '../../art/bridge/back'
import { FRAME, SEG, SLOT_X, VARIANTS, frameArt, ghostArt, pileArt, segmentArt } from '../../art/bridge/blocks'
import {
  CRANE, HOOK, TRUCK, TRUCK_WHEELS, craneArt, duckArt, frogArt, hookArt, hoorayArt, reedsArt, reedsArt2, signArt, smokePuff, truckArt, wheelArt,
} from '../../art/bridge/front'
import { FLOOR, birdBody, birdWing, boat, hillLeft, hillRight, mountains, valleyFloor } from '../../art/bridge/world'

/*
 * Spread 4 — "Bridge builder". The shiny thing was a treasure map; the path crosses a river with no bridge.
 *   back:   far hills (V-fold) with the river valley · the castle town · windmill · trees
 *   middle: the two banks with a GAP · a crane · a waiting toy truck · the NO BRIDGE sign
 *   front:  a pile of toy blocks (3 you can pick up) · ducks · a frog · reeds
 * Drag the 3 blocks, each into its own colour-coded dashed slot of the gap (any order): the bridge grows.
 * Beats: the number of blocks placed (1..3). When it's done there's confetti and the truck drives across and off.
 */

const spreadArt = buildingSpreadArt

/* ------------------------------------------------- spread behaviour -- */

const BRIDGE_Z = -0.15
/** the bridge frame is drawn BS× bigger than its art's native size so the gap reads clearly */
const BS = 1.2
const FRAME_X = 0.52 // book x of the frame centre
const WORLD_FRAME_X = FRAME.w / 2000 + FRAME.x0 // (0.65) the world copy is not scaled
const DECK = 0.24 * BS
/** book x of a point of the frame art (px) */
const artX = (px: number) => FRAME_X + ((px - FRAME.w / 2) * BS) / 1000
/** book x of slot k (centre of the block that fills it) */
const slotX = (k: number) => FRAME_X + (k - 1) * (SEG.w / 1000) * BS
const slotAt = (k: number): [number, number] => [slotX(k), -0.1]

/** Live state shared by the pieces of this spread (reset when you leave it). */
const bridge = {
  count: 0,
  slots: [-1, -1, -1],
  seg: [0, 0, 0],
  hook: 0,
  drive: 0,
  cheer: 0,
  wind: 0,
  frog: 0,
}
const timelines: gsap.core.Timeline[] = []
type Burst = { kind: 'dust' | 'confetti'; x: number; y: number; z: number }
const bursts: Burst[] = []

function story() {
  const tl = gsap.timeline()
  timelines.push(tl)
  return tl
}

function resetAll() {
  timelines.splice(0).forEach((t) => t.kill())
  gsap.killTweensOf(bridge)
  gsap.killTweensOf(bridge.seg)
  Object.assign(bridge, { count: 0, hook: 0, drive: 0, cheer: 0, wind: 0, frog: 0 })
  bridge.slots = [-1, -1, -1]
  bridge.seg = [0, 0, 0]
  bursts.length = 0
}

/** Resets this spread's state when the page is turned away. */
function BuildDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  useFrame(() => {
    const away = anim.raise[index].v < 0.5
    if (away && live.current) {
      live.current = false
      resetAll()
    } else if (!away) live.current = true
  })
  return null
}

/** block `k` (red, yellow, blue) goes into its own slot `k`, in any order */
function place(k: number) {
  if (bridge.slots[k] >= 0) return
  bridge.slots[k] = k
  bridge.count++
  beat('building', bridge.count)
  bus.emit('sfx', 'snap')
  gsap.to(bridge.seg, { [k]: 1, duration: 0.55, ease: 'back.out(2.2)' })
  gsap.timeline().to(bridge, { hook: 1, duration: 0.2, ease: 'power2.out' }).to(bridge, { hook: 0, duration: 0.5, ease: 'power2.inOut' })
  bursts.push({ kind: 'dust', x: slotX(k), y: DECK, z: BRIDGE_Z + 0.04 })
  if (bridge.count === 3) finish()
}

function finish() {
  const tl = story()
  tl.add(() => {
    bursts.push({ kind: 'confetti', x: FRAME_X, y: DECK + 0.25, z: BRIDGE_Z + 0.1 })
    bus.emit('sfx', 'sparkle')
    bus.emit('milo', 'cheer')
  }, 0.5)
    .to(bridge, { cheer: 1, duration: 0.5, ease: 'back.out(2)' }, 0.6)
    .add(() => bus.emit('sfx', 'beep'), 1.4)
    .add(() => bus.emit('sfx', 'zoom'), 1.8)
    .to(bridge, { drive: 1, duration: 3.4, ease: 'power1.inOut' }, 1.8)
    .add(() => {
      bursts.push({ kind: 'confetti', x: 1.2, y: DECK + 0.2, z: BRIDGE_Z + 0.1 })
      bus.emit('sfx', 'whoosh')
      bus.emit('pull', 'truckgo')
    }, 5.2)
    .add(() => bus.emit('sfx', 'sparkle'), 6.0)
}

/* --------------------------------------------- confetti and dust puffs -- */

const CONFETTI = ['#e8322b', '#ffc21a', '#3a8be0', '#2f9a4a', '#ff8ac0', '#ffffff', '#8a6cd8']

function Fx() {
  const { baseY } = useSpread()
  const DN = 36
  const CN = 150
  const dustM = useRef<THREE.InstancedMesh>(null!)
  const confM = useRef<THREE.InstancedMesh>(null!)
  const dust = useMemo(() => Array.from({ length: DN }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3() })), [])
  const conf = useMemo(() => Array.from({ length: CN }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Vector3(), w: new THREE.Vector3() })), [])
  const m = useMemo(() => new THREE.Object3D(), [])
  const dustMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0e4c4', roughness: 1, flatShading: true }), [])
  const confMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0.15 }), [])
  useEffect(() => {
    const c = new THREE.Color()
    for (let i = 0; i < CN; i++) confM.current.setColorAt(i, c.set(CONFETTI[i % CONFETTI.length]))
    confM.current.instanceColor!.needsUpdate = true
  }, [])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    while (bursts.length) {
      const b = bursts.shift()!
      if (b.kind === 'dust') {
        let n = 0
        for (const q of dust) {
          if (q.life > 0 || n >= 12) continue
          n++
          q.max = q.life = 0.55 + Math.random() * 0.35
          q.p.set(b.x + (Math.random() - 0.5) * 0.28, baseY + b.y - 0.02, b.z + (Math.random() - 0.3) * 0.1)
          q.v.set((Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 0.5, 0.15 + Math.random() * 0.35)
        }
      } else {
        for (const q of conf) {
          q.life = 2.2 + Math.random() * 1.2
          q.p.set(b.x + (Math.random() - 0.5) * 0.3, baseY + b.y, b.z + (Math.random() - 0.5) * 0.2)
          const a = Math.random() * Math.PI * 2
          const sp = 0.4 + Math.random() * 1.1
          q.v.set(Math.cos(a) * sp, 1.5 + Math.random() * 1.8, Math.sin(a) * sp * 0.6 + 0.4)
          q.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6)
          q.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14)
        }
      }
    }
    dust.forEach((q, i) => {
      if (q.life > 0) {
        q.life -= dt
        q.v.multiplyScalar(1 - dt * 1.6)
        q.p.addScaledVector(q.v, dt)
      }
      const k = q.life > 0 ? q.life / q.max : 0
      m.position.copy(q.p)
      m.rotation.set(0, 0, 0)
      m.scale.setScalar(k > 0 ? 0.012 + (1 - k) * 0.045 * Math.min(1, k * 4) + 0.01 * Math.sin(k * 3) : 0.0001)
      m.updateMatrix()
      dustM.current.setMatrixAt(i, m.matrix)
    })
    dustM.current.instanceMatrix.needsUpdate = true
    conf.forEach((q, i) => {
      if (q.life > 0) {
        q.life -= dt
        q.v.y -= 3.2 * dt
        q.v.x *= 1 - dt * 0.4
        q.p.addScaledVector(q.v, dt)
        if (q.p.y < baseY + 0.004) {
          q.p.y = baseY + 0.004
          q.v.set(0, 0, 0)
          q.w.multiplyScalar(0.2)
        }
        q.r.addScaledVector(q.w, dt)
      }
      m.position.copy(q.p)
      m.rotation.set(q.r.x, q.r.y, q.r.z)
      m.scale.setScalar(q.life > 0 ? Math.min(1, q.life * 2) : 0.0001)
      m.updateMatrix()
      confM.current.setMatrixAt(i, m.matrix)
    })
    confM.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={dustM} args={[undefined, undefined, DN]} material={dustMat} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh ref={confM} args={[undefined, undefined, CN]} material={confMat} frustumCulled={false}>
        <planeGeometry args={[0.044, 0.064]} />
      </instancedMesh>
    </>
  )
}

/* ------------------------------------------------------- the pieces -- */

const GHOST_ART = [0, 1, 2].map(ghostArt)
const SEG_ART = [0, 1, 2].map(segmentArt)
const SEG_SIZE: [number, number] = [(SEG.w / 1000) * BS, (SEG.h / 1000) * BS]
const SEG_Y = ((FRAME.h - 630) / 1000) * BS // centre of a block, above the frame's base

/** the story asks for the blocks ("Pop the blocks in the gaps!"): only then do the gaps and blocks light up */
const asked = () => heard('building', 'gaps')

/** the two banks + the empty slots + the blocks as they arrive */
function BridgeFrame() {
  return (
    <PopCard art={frameArt} size={[(FRAME.w / 1000) * BS, (FRAME.h / 1000) * BS]} at={[FRAME_X, BRIDGE_Z]} delay={0.12} px={2048} tap="none">
      {[0, 1, 2].map((k) => {
        const rel = slotX(k) - FRAME_X
        return (
          <group key={k}>
            <Part
              art={GHOST_ART[k]}
              size={SEG_SIZE}
              pivot={[rel, SEG_Y, 0]}
              z={0.01}
              emissive={0.35}
              animate={(g, t) => {
                // the coloured ghost + arrow pop in once the story asks, one after another
                const u = g.userData as { s?: number; at?: number }
                if (!asked()) u.at = undefined
                else u.at ??= t
                const want = bridge.slots[k] < 0 && u.at !== undefined && t - u.at > k * 0.18 ? 1 : 0
                u.s = (u.s ?? 0) + (want - (u.s ?? 0)) * 0.18
                g.visible = u.s > 0.01
                g.scale.setScalar(Math.max(0.001, u.s) * (1 + Math.sin(t * 4 + k * 1.3) * 0.04))
                g.position.y = SEG_Y + Math.sin(t * 3 + k * 1.3) * 0.012
              }}
            />
            {SEG_ART.map((art, v) => (
              <Part
                key={v}
                art={art}
                size={SEG_SIZE}
                pivot={[rel, SEG_Y, 0]}
                z={0.014}
                animate={(g) => {
                  const s = bridge.seg[k]
                  g.visible = bridge.slots[k] === v && s > 0.001
                  g.position.y = SEG_Y + (1 - s) * 0.4
                  g.scale.set(1 + Math.max(0, s - 1) * 0.5, 1 - Math.max(0, s - 1) * 0.5, 1)
                }}
              />
            ))}
          </group>
        )
      })}
    </PopCard>
  )
}

function Crane() {
  const K = 0.001
  return (
    <PopCard
      art={craneArt}
      size={[CRANE.w * K, CRANE.h * K]}
      at={[0.1, -0.5]}
      delay={0.16}
      px={1536}
      tap="wiggle"
      onTap={() => bus.emit('sfx', 'beep')}
    >
      <Part
        art={hookArt}
        size={[HOOK.w * K, HOOK.h * K]}
        pivot={[(800 - CRANE.w / 2) * K, (CRANE.h - 178) * K, 0]}
        offset={[0, (-HOOK.h / 2) * K]}
        z={0.01}
        animate={(g, t) => {
          g.rotation.z = Math.sin(t * 1.3) * 0.05 + Math.sin(t * 3.1) * 0.01
          g.scale.y = 0.92 + bridge.hook * 0.16
        }}
      />
    </PopCard>
  )
}

/** the toy truck waits on the near bank; when the bridge is done it drives over and off into the world */
const profile = (x: number) => {
  return x < artX(50) ? 0 : x < artX(300) ? (DECK * (x - artX(50))) / (artX(300) - artX(50)) : x < artX(1500) ? DECK : x < artX(1750) ? (DECK * (artX(1750) - x)) / (artX(1750) - artX(1500)) : 0
}
const TK = 0.5 / TRUCK.w
const TP = (x: number, y: number) => [(x - TRUCK.w / 2) * TK, (TRUCK.h - y) * TK] as const

function Truck() {
  const ref = useRef<THREE.Group>(null!)
  const X0 = artX(380)
  useFrame((s) => {
    const x = X0 + bridge.drive * (artX(1330) - X0)
    const a = profile(x - 0.17)
    const b = profile(x + 0.17)
    const moving = bridge.drive > 0.001 && bridge.drive < 0.999 ? 1 : 0
    ref.current.position.set(x, (a + b) / 2 + moving * Math.abs(Math.sin(s.clock.elapsedTime * 15)) * 0.008, -0.08)
    ref.current.rotation.z = Math.atan2(b - a, 0.34)
  })
  return (
    <group ref={ref} position={[X0, 0, -0.08]}>
      <PopCard
        art={truckArt}
        size={[TRUCK.w * TK, TRUCK.h * TK]}
        at={[0, 0]}
        delay={0.22}
        px={1024}
        idle="rock"
        idleAmp={0.35}
        idleSpeed={1.6}
        tap="none"
        onTap={() => bus.emit('sfx', 'beep')}
        escape={{ to: [2.7, 1.0, -6.0], arc: 1.2, scale: 2.6, duration: 2.6, spin: -0.12, on: 'truckgo', upright: true }}
      >
        {TRUCK_WHEELS.map(([x, y], i) => {
          const [px, py] = TP(x, y)
          return (
            <Part
              key={i}
              art={wheelArt}
              size={[130 * TK, 130 * TK]}
              pivot={[px, py, 0]}
              z={0.008}
              animate={(g) => {
                g.rotation.z = -bridge.drive * 24
              }}
            />
          )
        })}
        {[0, 0.5].map((ph) => {
          const [px, py] = TP(407, 24)
          return (
            <Part
              key={ph}
              art={smokePuff}
              size={[120 * TK, 100 * TK]}
              pivot={[px, py, 0]}
              z={-0.004}
              animate={(g, t) => {
                const c = (t * (bridge.drive > 0 ? 1.1 : 0.45) + ph) % 1
                g.position.y = py + c * 0.16
                g.position.x = px - c * 0.05
                g.scale.setScalar(0.25 + c * 0.7)
                g.visible = c < 0.95
              }}
            />
          )
        })}
      </PopCard>
    </group>
  )
}

function Sign() {
  const K = 0.4 / 440
  return (
    <PopCard art={signArt} size={[440 * K, 580 * K]} at={[1.45, 0.08]} delay={0.2} rotY={-0.25} tap="wiggle" onTap={() => bus.emit('sfx', 'pop')}>
      <Part
        art={hoorayArt}
        size={[440 * K, 290 * K]}
        pivot={[0, (580 - 145) * K, 0]}
        z={0.01}
        animate={(g, t) => {
          g.visible = bridge.cheer > 0.01
          g.scale.setScalar(Math.max(0.001, bridge.cheer) * (1 + Math.sin(t * 6) * 0.02))
        }}
      />
    </PopCard>
  )
}

function Windmill() {
  const K = 0.5 / 420
  return (
    <PopCard
      art={windmill}
      size={[420 * K, 640 * K]}
      at={[-0.74, -0.7]}
      delay={0.04}
      tap="wiggle"
      onTap={() => {
        bus.emit('sfx', 'whoosh')
        gsap.fromTo(bridge, { wind: 4 }, { wind: 0, duration: 2.5, ease: 'power2.out' })
      }}
    >
      <Part
        art={windmillBlades}
        size={[520 * K, 520 * K]}
        pivot={[0, (640 - 170) * K, 0]}
        z={0.012}
        animate={(g, t) => {
          g.rotation.z = -t * (0.5 + bridge.wind)
        }}
      />
    </PopCard>
  )
}

function Castle() {
  const K = 0.84 / 760
  return (
    <PopCard art={castle} size={[760 * K, 900 * K]} at={[1.16, -0.7]} delay={0.06} px={1024} tap="wiggle" onTap={() => bus.emit('sfx', 'pop')}>
      <Part
        art={castleFlag}
        size={[150 * K, 100 * K]}
        pivot={[0, (900 - 200) * K, 0]}
        offset={[(75 - 6) * K, 0]}
        z={0.004}
        animate={(g, t) => {
          g.scale.x = 0.88 + Math.sin(t * 6) * 0.12
          g.rotation.z = Math.sin(t * 3) * 0.06
        }}
      />
    </PopCard>
  )
}

/**
 * One row at the same depth with clear gaps (blocks are ~0.37 wide), in slot
 * order: red, yellow, blue left to right, so each reads as its own colour.
 */
const dragBlocks: { v: number; at: [number, number] }[] = [
  { v: 0, at: [0.62, 0.86] },
  { v: 1, at: [1.02, 0.86] },
  { v: 2, at: [1.42, 0.86] },
]

/** the three blocks to carry across: red, yellow and blue each fit the slot with their own colour */
function Blocks() {
  return (
    <>
      {dragBlocks.map(({ v, at }, i) => (
        <DragPiece
          key={v}
          art={SEG_ART[v]}
          size={SEG_SIZE}
          at={at}
          delay={0.36 + i * 0.04}
          rotY={-0.04 + i * 0.04}
          idle="bob"
          target={{ at: slotAt(v), r: 0.15, y: DECK + 0.02 }}
          consume
          color={VARIANTS[v].light}
          hint={asked}
          onDone={() => place(v)}
        />
      ))}
    </>
  )
}

function BuildPopups() {
  return (
    <>
      <BuildDirector />
      {/* back: the far bank */}
      <PopCard art={farHills} size={[3.1, 1.07]} at={[0, -1.02]} vfold={0.2} delay={0} px={2048} tap="none" />
      <PopCard art={bigTree} size={[0.5, 0.7]} at={[-1.42, -0.58]} delay={0.04} rotY={0.2} idle="sway" idleAmp={0.4} tap="wiggle" px={1024} />
      <PopCard art={bigPine} size={[0.4, 0.61]} at={[-1.12, -0.68]} delay={0.06} idle="sway" idleAmp={0.3} tap="wiggle" px={1024} />
      <Windmill />
      <Castle />
      <PopCard art={smallTree} size={[0.42, 0.58]} at={[1.52, -0.56]} delay={0.1} rotY={-0.25} idle="sway" idleAmp={0.4} tap="wiggle" px={1024} />
      {/* middle: the banks, the crane, the truck */}
      <Crane />
      <BridgeFrame />
      <Truck />
      <Sign />
      {/* front: toys, ducks and reeds */}
      <PopCard art={reedsArt2} size={[0.26, 0.38]} at={[-0.18, 0.05]} delay={0.3} idle="sway" idleAmp={0.5} tap="wiggle" />
      <PopCard art={reedsArt} size={[0.3, 0.44]} at={[0.68, 0.46]} delay={0.32} rotY={-0.15} idle="sway" idleAmp={0.5} tap="wiggle" />
      <PopCard art={pileArt} size={[0.78, 0.506]} at={[1.2, 0.24]} delay={0.3} rotY={-0.1} px={1024} tap="jump" onTap={() => bus.emit('sfx', 'boing')} />
      <PopCard
        art={duckArt()}
        size={[0.3, 0.262]}
        at={[0.16, 0.62]}
        delay={0.34}
        idle="drift"
        idleAmp={0.9}
        idleSpeed={0.9}
        tap="jump"
        onTap={() => bus.emit('sfx', 'giggle')}
      />
      <PopCard
        art={duckArt({ hat: true, flip: true, body: '#ffe066' })}
        size={[0.27, 0.236]}
        at={[0.42, 0.88]}
        delay={0.38}
        idle="drift"
        idleAmp={0.7}
        idleSpeed={0.7}
        tap="jump"
        onTap={() => bus.emit('sfx', 'giggle')}
      />
      <PopCard art={duckArt()} size={[0.14, 0.122]} at={[-0.03, 0.74]} delay={0.4} idle="drift" idleAmp={0.8} idleSpeed={0.9} tap="jump" onTap={() => bus.emit('sfx', 'pop')} />
      <PopCard art={duckArt({ flip: true })} size={[0.12, 0.105]} at={[0.3, 0.7]} delay={0.42} idle="bob" tap="jump" onTap={() => bus.emit('sfx', 'pop')} />
      <PopCard art={frogArt} size={[0.3, 0.225]} at={[0.46, 0.28]} delay={0.4} idle="bob" tap="jump" onTap={() => bus.emit('sfx', 'boing')} />
      <Blocks />
      <PopCard art={sparkle()} size={[0.1, 0.1]} at={[1.1, 0.62]} y={0.34} delay={0.46} hinge="spring" idle="float" emissive={0.8} tap="spin" />
      <PopCard art={sparkle()} size={[0.07, 0.07]} at={[1.38, 0.78]} y={0.3} delay={0.48} hinge="spring" idle="float" emissive={0.8} tap="spin" />
      <Fx />
    </>
  )
}

/* ---------------------------------------------------------- the world -- */

const WB = { x: 1.8, z: -6.4, s: 4 }
const WSEG: [number, number] = [(SEG.w / 1000) * WB.s, (SEG.h / 1000) * WB.s]

/** the real bridge, growing as the blocks go in (world pieces keyed to the book's progress) */
function WorldBridge() {
  const wl = useWorldLevel(0.3)
  return (
    <>
      {SLOT_X.map((sx, k) =>
        SEG_ART.map((art, v) => (
          <Piece
            key={`${k}-${v}`}
            art={art}
            size={WSEG}
            position={[WB.x + (sx - WORLD_FRAME_X) * WB.s, 0.13, WB.z + 0.08]}
            hinge="drop"
            tap="none"
            px={512}
            level={() => (bridge.slots[k] === v ? Math.min(wl(), clamp01(bridge.seg[k] * 1.4)) : 0)}
          />
        )),
      )}
    </>
  )
}

function WorldCrane() {
  const K = 0.0042
  return (
    <Cutout art={craneArt} size={[CRANE.w * K, CRANE.h * K]} at={[-0.4, 0, -7.7]} hinge="rise" delay={0.25} px={1024}>
      <Part
        art={hookArt}
        size={[HOOK.w * K, HOOK.h * K]}
        pivot={[(800 - CRANE.w / 2) * K, (CRANE.h - 178) * K, 0]}
        offset={[0, (-HOOK.h / 2) * K]}
        z={0.03}
        animate={(g, t) => {
          g.rotation.z = Math.sin(t * 1.1) * 0.05
          g.scale.y = 0.9 + bridge.hook * 0.15
        }}
      />
    </Cutout>
  )
}

function WorldWindmill() {
  const K = 0.012
  return (
    <Cutout art={windmill} size={[420 * K, 640 * K]} at={[-10.5, 0, -11]} hinge="rise" delay={0.3} px={1024}>
      <Part art={windmillBlades} size={[520 * K, 520 * K]} pivot={[0, (640 - 170) * K, 0]} z={0.05} animate={(g, t) => (g.rotation.z = -t * 0.45)} />
    </Cutout>
  )
}

function Bird({ at, s = 1, phase = 0 }: { at: [number, number, number]; s?: number; phase?: number }) {
  const K = 0.0085 * s
  return (
    <Cutout art={birdBody} size={[120 * K, 80 * K]} at={at} hinge="spring" delay={0.4} idle="drift" idleSpeed={0.5 + phase * 0.1} shadow={false}>
      {[1, -1].map((d) => (
        <Part
          key={d}
          art={birdWing}
          size={[100 * K, 70 * K]}
          pivot={[-0.02 * s, 44 * K, d * 0.02]}
          offset={[0, 30 * K]}
          z={0}
          animate={(g, t) => {
            g.rotation.x = d * Math.sin(t * 7 + phase) * 0.5
          }}
        />
      ))}
    </Cutout>
  )
}

/** A big river valley: the river flows in from the far hills, a bridge goes up with the blocks, the town waits beyond. */
export function BridgeWorld() {
  return (
    <group>
      {/* far backdrop */}
      <Cutout art={mountains} size={[44, 10.4]} at={[0, 0, -21]} hinge="rise" delay={0} px={2048} shadow={false} />
      <Cutout art={hillLeft} size={[12, 4.5]} at={[-10, 0, -11.5]} hinge="rise" delay={0.05} px={1536} shadow={false} />
      <Cutout art={hillRight} size={[12, 4.5]} at={[11.5, 0, -12.5]} hinge="rise" delay={0.08} px={1536} shadow={false} />
      <Cutout art={castle} size={[5.2, 6.1]} at={[7.8, 0, -12.8]} hinge="rise" delay={0.2} px={1024} tap="wiggle" />
      {/* the valley floor with its river and road */}
      <Cutout art={valleyFloor} size={[34, 15]} at={[0, 0.012, FLOOR.z0]} flat hinge="back" delay={0} px={2048} shadow={false} />
      {/* the bridge with its gap, and the crane */}
      <Cutout art={frameArt} size={[(FRAME.w / 1000) * WB.s, (FRAME.h / 1000) * WB.s]} at={[WB.x, 0, WB.z]} hinge="rise" delay={0.2} px={2048} />
      <WorldBridge />
      <WorldCrane />
      {/* things in the valley */}
      <WorldWindmill />
      <Cutout art={bigTree} size={[3.2, 4.5]} at={[-8.6, 0, -6.5]} hinge="rise" delay={0.3} rotY={0.25} idle="sway" idleAmp={0.4} px={1024} />
      <Cutout art={bigPine} size={[2.7, 4.1]} at={[-6.6, 0, -9.2]} hinge="rise" delay={0.32} idle="sway" idleAmp={0.3} px={1024} />
      <Cutout art={smallTree} size={[3.0, 4.2]} at={[9.2, 0, -7.2]} hinge="rise" delay={0.34} rotY={-0.25} idle="sway" idleAmp={0.4} px={1024} />
      <Cutout art={bigPine} size={[2.4, 3.7]} at={[11.6, 0, -9.6]} hinge="rise" delay={0.36} idle="sway" idleAmp={0.3} px={1024} />
      <Cutout art={bigTree} size={[2.6, 3.6]} at={[6.8, 0, -11.5]} hinge="rise" delay={0.38} px={1024} />
      <Cutout art={reedsArt} size={[1.0, 1.45]} at={[6.4, 0, -4.6]} hinge="spring" delay={0.3} idle="sway" idleAmp={0.5} />
      <Cutout art={reedsArt2} size={[0.9, 1.3]} at={[-1.0, 0, -4.0]} hinge="spring" delay={0.32} idle="sway" idleAmp={0.5} />
      <Cutout art={reedsArt} size={[0.9, 1.3]} at={[-0.3, 0, -9.0]} hinge="spring" delay={0.34} idle="sway" idleAmp={0.5} />
      <Cutout art={boat} size={[1.1, 1.1]} at={[1.6, 0.05, -4.2]} hinge="spring" delay={0.4} idle="rock" tap="wiggle" />
      <Cutout art={pileArt} size={[2.4, 1.56]} at={[4.0, 0, -2.9]} hinge="spring" delay={0.36} rotY={-0.3} tap="jump" px={1024} />
      <Cutout art={signArt} size={[1.2, 1.6]} at={[-4.6, 0, -5.6]} hinge="spring" delay={0.34} rotY={0.3} tap="wiggle" />
      {/* the sky */}
      <Cutout art={cloud()} size={[5.6, 2.8]} at={[-6, 5.6, -15]} hinge="spring" delay={0.1} idle="drift" idleSpeed={0.5} shadow={false} />
      <Cutout art={cloud()} size={[4.4, 2.2]} at={[3.5, 6.4, -16]} hinge="spring" delay={0.14} idle="drift" idleSpeed={0.4} shadow={false} />
      <Cutout art={cloud()} size={[3.4, 1.7]} at={[12, 4.6, -15]} hinge="spring" delay={0.18} idle="drift" idleSpeed={0.6} shadow={false} />
      <Cutout art={cloud()} size={[3.8, 1.9]} at={[-12.5, 4.8, -15]} hinge="spring" delay={0.2} idle="drift" idleSpeed={0.5} shadow={false} />
      <Bird at={[-3.4, 2.5, -5.5]} s={1.2} />
      <Bird at={[3.8, 2.7, -6]} s={1} phase={1.3} />
      <Bird at={[6.6, 2.2, -5]} s={0.8} phase={2.4} />
    </group>
  )
}

export const buildSpread: SpreadDef = {
  id: 'building',
  world: 'bridge',
  palette: palettes.building,
  outfit: 'hardhat',
  heading: 'Bridge builder',
  beats: 3,
  text: [
    `The shiny thing was a *treasure map!* The path crossed a river... but there was *no bridge!* "Let's build one!" said Milo. Pop the blocks in the gaps!`,
    { after: 1, text: '*Click!* The first block fit.' },
    { after: 3, text: 'Two blocks, three blocks... the bridge went *all the way across!*' },
  ],
  textCard: { x: 0, y: 0, w: 0.75 },
  spreadArt,
  Popups: BuildPopups,
  miloReact: 'point',
}
