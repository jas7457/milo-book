import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { svgTexture } from '../../art/texture'
import { sparkle } from '../../art/kit'
import * as A from '../../art/dig'
import * as W from '../../art/digWorld'
import { Part, PopCard } from '../../popup/PopCard'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { windowed } from '../../anim/ease'
import { bus } from '../../bus'
import { Cutout } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 3 — "Dig, dig, dig!". Milo drives the big yellow excavator.
 *   back:   the DIG SITE gantry + dirt mounds (V-fold) · a swaying tower crane
 *   middle: the excavator (jointed boom / stick / bucket with hydraulic rams, a
 *           cab with Milo at the controls) · Robo's dump truck · pipes · barrel
 *   front:  the dirt pile (three scoops tall) · cones · barrier · shovel · rocks
 * Tap the excavator (or the pile): scoop → swing → dump into the truck. Three
 * scoops and the pile is gone — a shiny treasure map pops out of the hole, the
 * truck drives off into the world, and the map flies away to the next adventure.
 */

const K = A.EK
const PK = 0.00127
const rad = (d: number) => (d * Math.PI) / 180
const rot = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]

/* ----------------------------------------------------------------- layout -- */

const EX_AT: [number, number] = [-0.1, -0.4]
const TRUCK_AT: [number, number] = [-1.04, -0.62]
const PILE_AT: [number, number] = [1.12, -0.3]
const MAP_AT: [number, number] = [1.12, -0.3]
const MAP_TO: [number, number, number] = [2.2, 1.9, -3.4]
const TRUCK_TO: [number, number, number] = [-1.6, 0, -5.0]

/* the machine's joints, in house space (origin = turntable centre, y up) */
const HOUSE_Y = (A.EX.h - A.EX.ty) * K
const BOOM_P: [number, number] = [206 * K, 68 * K]
const TIP_ART = -0.702 // direction of the bucket's teeth in its own art (radians)

const pose = (boomDeg: number, stickDeg: number, tipDeg: number) => ({
  boom: rad(boomDeg),
  stick: rad(stickDeg - boomDeg),
  bucket: rad(tipDeg) - TIP_ART - rad(stickDeg),
})
const REST = pose(48, -78, -105)
const REACH = pose(22, -50, -78)
const DIGEND = pose(28, -102, -222)
const LIFT = pose(62, -92, -222)
const DUMPPOSE = pose(62, -56, -222)
const DUMPED = pose(62, -52, -100)

/** Live state shared by every piece of this spread (reset when the page turns away). */
const fresh = () => ({
  swing: 0,
  ...REST,
  carry: 0,
  load: 0,
  pile: [1, 1, 1],
  scoops: 0,
  busy: false,
  queued: 0,
  tapped: false,
  glint: 0,
  found: 0,
  mapSent: false,
  roll: 0,
  jolt: 0,
  rumble: 0,
  honk: 0,
})
const dig = fresh()
const timelines: gsap.core.Timeline[] = []

function joints() {
  const bA = dig.boom
  const sA = bA + dig.stick
  const kA = sA + dig.bucket
  const at = (o: [number, number], a: number, lx: number, ly: number): [number, number] => {
    const [x, y] = rot(lx * K, ly * K, a)
    return [o[0] + x, o[1] + y]
  }
  const sP = at(BOOM_P, bA, A.BOOM.len, 0)
  const kP = at(sP, sA, A.STICK.len, 0)
  return {
    boomPt: (lx: number, ly: number) => at(BOOM_P, bA, lx, ly),
    stickPt: (lx: number, ly: number) => at(sP, sA, lx, ly),
    bucketPt: (lx: number, ly: number) => at(kP, kA, lx, ly),
  }
}
type V2 = [number, number]

/* ---------------------------------------------------------- the particles -- */

type Burst = { x: number; y: number; z: number; n: number; kind: 'dirt' | 'spark'; up?: number; spread?: number }
const bursts: Burst[] = []
const addBurst = (b: Burst) => bursts.push(b)

/** Chunks of dirt and golden sparkles, flying in book space. */
function Bits() {
  const { baseY } = useSpread()
  const ND = 90
  const NS = 60
  const dirt = useRef<THREE.InstancedMesh>(null!)
  const spark = useRef<THREE.InstancedMesh>(null!)
  const mk = (n: number) => Array.from({ length: n }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0, vr: 0, s: 1 }))
  const dd = useMemo(() => mk(ND), [])
  const ss = useMemo(() => mk(NS), [])
  const o = useMemo(() => new THREE.Object3D(), [])
  const dMat = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), [])
  const sMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffe27a', side: THREE.DoubleSide, toneMapped: false }), [])
  const sGeo = useMemo(() => {
    const sh = new THREE.Shape()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2
      const rr = i % 2 ? 0.35 : 1
      sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr)
    }
    return new THREE.ShapeGeometry(sh)
  }, [])
  const cols = useMemo(() => ['#7a4a26', '#9a6334', '#5d3a1c', '#b27a3d'].map((c) => new THREE.Color(c)), [])
  const gold = useMemo(() => ['#ffe27a', '#fff6c8', '#ffb02e', '#ffffff'].map((c) => new THREE.Color(c)), [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    while (bursts.length) {
      const b = bursts.shift()!
      const pool = b.kind === 'dirt' ? dd : ss
      let made = 0
      for (let i = 0; i < pool.length && made < b.n; i++) {
        const q = pool[i]
        if (q.life > 0) continue
        made++
        q.max = q.life = b.kind === 'dirt' ? 0.7 + Math.random() * 0.5 : 0.9 + Math.random() * 0.7
        q.p.set(b.x + (Math.random() - 0.5) * 0.05, b.y, b.z)
        const sp = b.spread ?? 0.5
        if (b.kind === 'dirt') q.v.set((Math.random() - 0.5) * sp, (b.up ?? 0.4) + Math.random() * 0.5, (Math.random() - 0.3) * sp * 0.6)
        else q.v.set((Math.random() - 0.5) * sp * 2.2, (b.up ?? 1) + Math.random() * 1.0, (Math.random() - 0.35) * sp * 1.6)
        q.r = Math.random() * 6
        q.vr = (Math.random() - 0.5) * 12
        q.s = b.kind === 'dirt' ? 0.7 + Math.random() * 0.8 : 0.5 + Math.random() * 0.9
        if (b.kind === 'dirt') dirt.current.setColorAt(i, cols[Math.floor(Math.random() * cols.length)])
        else spark.current.setColorAt(i, gold[Math.floor(Math.random() * gold.length)])
      }
    }
    const run = (pool: typeof dd, mesh: THREE.InstancedMesh, isDirt: boolean) => {
      pool.forEach((q, i) => {
        if (q.life > 0) {
          q.life -= dt
          q.v.y -= (isDirt ? 3.2 : 1.6) * dt
          q.p.addScaledVector(q.v, dt)
          if (isDirt && q.p.y < baseY + 0.006) {
            q.p.y = baseY + 0.006
            q.v.set(0, 0, 0)
            q.vr = 0
          }
          q.r += q.vr * dt
        }
        const k = q.life > 0 ? Math.min(1, q.life * 3, ((q.max - q.life) / q.max) * 8 + 0.2) : 0
        o.position.copy(q.p)
        o.rotation.set(isDirt ? q.r * 0.5 : 0, 0, q.r)
        o.scale.setScalar(Math.max(0.0001, k * q.s * (isDirt ? 0.03 : 0.05)))
        o.updateMatrix()
        mesh.setMatrixAt(i, o.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    run(dd, dirt.current, true)
    run(ss, spark.current, false)
  })
  return (
    <>
      <instancedMesh ref={dirt} args={[undefined, undefined, ND]} material={dMat} frustumCulled={false}>
        <planeGeometry args={[1, 0.7]} />
      </instancedMesh>
      <instancedMesh ref={spark} args={[undefined, undefined, NS]} material={sMat} geometry={sGeo} frustumCulled={false} />
    </>
  )
}

/* ------------------------------------------------------------- behaviour -- */

/** Where the bucket's teeth / mouth are, in book space (y without baseY). */
function bucketWorld(mouth = false): [number, number, number] {
  const j = joints()
  const [x, y] = mouth ? j.bucketPt(85, -135) : j.bucketPt(192, -162)
  const s = Math.cos(Math.PI * dig.swing)
  return [EX_AT[0] + s * x, HOUSE_Y + y, EX_AT[1] + 0.03]
}

let baseYNow = 0

function reveal() {
  bus.emit('sfx', 'sparkle')
  bus.emit('milo', 'cheer')
  const [x, , z] = [MAP_AT[0], 0, MAP_AT[1]]
  addBurst({ x, y: baseYNow + 0.12, z: z + 0.1, n: 40, kind: 'spark', up: 1.4, spread: 0.7 })
  const tl = gsap.timeline()
  timelines.push(tl)
  tl.to(dig, { found: 1, duration: 0.9, ease: 'back.out(1.6)' })
    .to(dig, { glint: 0, duration: 0.4 }, 0)
    .add(() => bus.emit('sfx', 'powerup'), 0.15)
    .add(() => addBurst({ x, y: baseYNow + 0.3, z: z + 0.1, n: 24, kind: 'spark', up: 1.2, spread: 0.6 }), 0.5)
    // Robo honks and drives the full dump truck away
    .add(() => bus.emit('sfx', 'beep'), 1.0)
    .add(() => {
      dig.honk = 1
      bus.emit('sfx', 'zoom')
      bus.emit('pull', 'truck')
      gsap.to(dig, { roll: 1, duration: 0.6 })
    }, 1.5)
    // and if nobody taps the treasure, it flies off to the next adventure by itself
    .add(() => {
      if (!dig.mapSent) sendMap()
    }, 6.5)
}

function sendMap() {
  if (dig.mapSent) return
  dig.mapSent = true
  bus.emit('sfx', 'whoosh')
  bus.emit('milo', 'jump')
  bus.emit('pull', 'map')
}

function scoop() {
  if (dig.scoops + (dig.busy ? 1 : 0) + dig.queued >= 3) {
    if (!dig.busy) {
      bus.emit('sfx', 'sparkle')
      bus.emit('milo', 'cheer')
    }
    return
  }
  if (dig.busy) {
    dig.queued++
    return
  }
  dig.busy = true
  dig.tapped = true
  const n = dig.scoops
  const last = n === 2
  const layer = String(2 - n)
  const tl = gsap.timeline({
    onComplete: () => {
      dig.scoops++
      dig.busy = false
      dig.rumble = 0
      if (last) reveal()
      else if (dig.queued > 0) {
        dig.queued--
        scoop()
      }
    },
  })
  timelines.push(tl)
  const ease = 'power2.inOut'
  tl.add(() => {
    bus.emit('sfx', 'whirr')
    if (n === 0) bus.emit('milo', 'point')
  }, 0)
    .to(dig, { rumble: 1, duration: 0.2 }, 0)
    .to(dig, { ...REACH, duration: 0.65, ease }, 0)
    // dig in
    .add(() => {
      bus.emit('sfx', 'drill')
      const [x, y, z] = bucketWorld()
      addBurst({ x, y: baseYNow + y + 0.02, z: z + 0.2, n: 14, kind: 'dirt', up: 0.9, spread: 1.0 })
    }, 0.72)
    .to(dig, { ...DIGEND, duration: 0.9, ease }, 0.65)
    .to(dig, { carry: 1, duration: 0.35, ease: 'back.out(2)' }, 0.85)
    .to(dig.pile, { [layer]: 0, duration: 0.55, ease: 'power2.in' }, 0.85)
    .add(() => {
      const [x, y, z] = bucketWorld()
      addBurst({ x, y: baseYNow + y + 0.05, z: z + 0.2, n: 10, kind: 'dirt', up: 1.2, spread: 0.8 })
    }, 1.2)
  if (last) tl.to(dig, { glint: 1, duration: 0.5 }, 1.45).add(() => bus.emit('sfx', 'sparkle'), 1.5)
  // lift + swing round to the truck
  tl.to(dig, { ...LIFT, duration: 0.4, ease }, 1.6)
    .add(() => bus.emit('sfx', 'whirr'), 1.9)
    .to(dig, { swing: 1, ...DUMPPOSE, duration: 0.8, ease: 'power1.inOut' }, 1.95)
    // dump!
    .to(dig, { ...DUMPED, duration: 0.5, ease: 'power2.in' }, 2.85)
    .add(() => {
      const [x, y, z] = bucketWorld(true)
      addBurst({ x, y: baseYNow + y, z: z - 0.03, n: 22, kind: 'dirt', up: -0.1, spread: 0.5 })
      bus.emit('sfx', 'boing')
    }, 3.1)
    .to(dig, { carry: 0, duration: 0.3 }, 3.1)
    .to(dig, { load: n + 1, duration: 0.55, ease: 'back.out(2.2)' }, 3.3)
    .fromTo(dig, { jolt: 0 }, { jolt: 1, duration: 0.05 }, 3.35)
    .to(dig, { jolt: 0, duration: 0.7, ease: 'elastic.out(1,0.35)' }, 3.4)
    // back to rest
    .to(dig, { swing: 0, ...REST, duration: 0.85, ease: 'power1.inOut' }, 3.7)
    .add(() => bus.emit('sfx', 'whirr'), 3.75)
    .to(dig, { rumble: 0, duration: 0.3 }, 4.2)
}

/** Resets this spread's state when the page is turned away. */
function DigDirector() {
  const { index, baseY } = useSpread()
  const live = useRef(true)
  baseYNow = baseY
  useFrame(() => {
    const away = anim.raise[index].v < 0.5
    if (away && live.current) {
      live.current = false
      timelines.splice(0).forEach((t) => t.kill())
      gsap.killTweensOf(dig)
      gsap.killTweensOf(dig.pile)
      Object.assign(dig, fresh())
      dig.pile = [1, 1, 1]
      bursts.length = 0
    } else if (!away) live.current = true
  })
  return null
}

/* ------------------------------------------------------------ the pieces -- */

/** A group that pops up from a spot (scale + lift) when `dig.found` rises. */
function Reveal({ at, children }: { at: [number, number]; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  useFrame(() => {
    const f = dig.found
    g.current.visible = f > 0.001
    g.current.scale.setScalar(Math.max(0.0001, f))
    g.current.position.y = -0.12 * (1 - Math.min(1, f))
  })
  return (
    <group ref={g} position={[at[0], 0, at[1]]}>
      {children}
    </group>
  )
}

/** A dashed ring on the page: "dig here!" */
function HintRing() {
  const { baseY, index } = useSpread()
  const tex = useMemo(() => svgTexture(A.hintRing, 256), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false }), [tex])
  const m = useRef<THREE.Mesh>(null!)
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const open = windowed(anim.raise[index].v, 0.5) >= 1
    const show = open && !dig.busy && dig.scoops < 3 ? 0.8 + Math.sin(t * 4) * 0.2 : 0
    mat.opacity += (show - mat.opacity) * Math.min(1, dt * 8)
    const k = 0.86 * (1 + Math.sin(t * 3) * 0.05)
    m.current.scale.set(k, k, 1)
    m.current.rotation.set(-Math.PI / 2, 0, t * 0.5)
    m.current.visible = mat.opacity > 0.01
  })
  return (
    <mesh ref={m} material={mat} position={[PILE_AT[0], baseY + 0.006, PILE_AT[1] + 0.1]} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}

function Ram({ a, b, z }: { a: () => V2; b: () => V2; z: number }) {
  const L = 300 * K
  const place = (g: THREE.Group, from: V2, to: V2, share: number, flip: boolean) => {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const d = Math.hypot(dx, dy)
    g.position.x = from[0]
    g.position.y = from[1]
    g.rotation.z = Math.atan2(dy, dx) + (flip ? 0 : 0)
    g.scale.x = (d * share) / L
  }
  return (
    <>
      <Part art={A.ramRod} size={[L, 24 * K]} offset={[L / 2, 0]} z={z} px={512} animate={(g) => place(g, b(), a(), 0.6, true)} />
      <Part art={A.ramBarrel} size={[L, 40 * K]} offset={[L / 2, 0]} z={z + 0.0006} px={512} animate={(g) => place(g, a(), b(), 0.6, false)} />
    </>
  )
}

function Excavator() {
  const J = () => joints()
  const puff = (i: number) => (
    <Part
      key={i}
      art={A.smokePuff}
      size={[0.1, 0.083]}
      pivot={[-88 * K, 238 * K, 0.02]}
      px={256}
      animate={(g, t) => {
        const c = (t * (0.5 + dig.rumble * 0.7) + i / 3) % 1
        g.position.y = 238 * K + c * 0.28
        g.position.x = -88 * K - c * 0.08 + Math.sin(c * 6 + i) * 0.015
        g.scale.setScalar(Math.max(0.001, Math.sin(c * Math.PI) * (0.5 + c * 0.9)))
      }}
    />
  )
  return (
    <PopCard
      art={A.excavatorHost}
      size={[A.EX.w * K, A.EX.h * K]}
      at={EX_AT}
      delay={0.16}
      px={1024}
      tap="none"
      contact={false}
      onTap={() => scoop()}
    >
      {/* the turning upper structure: flips round when the arm swings to the truck */}
      <Part
        art={A.excavatorHouse}
        size={[A.HS.w * K, A.HS.h * K]}
        pivot={[0, HOUSE_Y, 0]}
        offset={[0, (A.HS.h / 2) * K]}
        px={1024}
        animate={(g, t) => {
          const k = dig.rumble
          g.scale.x = Math.cos(Math.PI * dig.swing) || 0.0001
          g.position.y = HOUSE_Y + Math.sin(t * 38) * 0.0016 * k + Math.sin(t * 1.6) * 0.0012
          g.rotation.z = Math.sin(t * 29) * 0.004 * k
        }}
      >
        {/* inside the cab */}
        <Part art={A.cabInterior} size={[A.WIN.w * K, A.WIN.h * K]} pivot={[(A.WIN.x + A.WIN.w / 2 - 280) * K, (380 - A.WIN.y - A.WIN.h / 2) * K, 0]} z={-0.005} px={256} />
        <Part
          art={A.miloAtWheel}
          size={[A.WIN.w * K, A.WIN.h * K]}
          pivot={[(A.WIN.x + A.WIN.w / 2 - 280) * K, (380 - A.WIN.y - A.WIN.h / 2) * K, 0]}
          z={-0.002}
          px={512}
          animate={(g, t) => {
            const base = (380 - A.WIN.y - A.WIN.h / 2) * K
            g.position.y = base + Math.sin(t * 2.2) * 0.003 + Math.abs(Math.sin(t * 9)) * 0.004 * dig.rumble
            g.rotation.z = Math.sin(t * 1.3) * 0.03 + Math.sin(t * 6) * 0.03 * dig.rumble
          }}
        />
        {/* beacon on the roof */}
        <Part
          art={A.beaconGlow}
          size={[0.07, 0.07]}
          pivot={[(371 - 280) * K, (380 - 40) * K, 0.012]}
          emissive={1}
          px={128}
          animate={(g, t) => {
            const on = Math.sin(t * 7) > -0.2 ? 1 : 0.55
            g.scale.setScalar(0.9 * on + 0.1)
          }}
        />
        {[0, 1, 2].map(puff)}
        {/* the arm */}
        <Part
          art={A.boomArt}
          size={[A.BOOM.w * K, A.BOOM.h * K]}
          pivot={[BOOM_P[0], BOOM_P[1], 0]}
          offset={[(A.BOOM.w / 2 - A.BOOM.px) * K, (A.BOOM.py - A.BOOM.h / 2) * K]}
          px={1024}
          animate={(g) => (g.rotation.z = dig.boom)}
        >
          <Part
            art={A.stickArt}
            size={[A.STICK.w * K, A.STICK.h * K]}
            pivot={[A.BOOM.len * K, 0, 0]}
            offset={[(A.STICK.w / 2 - A.STICK.px) * K, (A.STICK.py - A.STICK.h / 2) * K]}
            px={1024}
            animate={(g) => (g.rotation.z = dig.stick)}
          >
            <Part
              art={A.bucketArt}
              size={[A.BUCKET.w * K, A.BUCKET.h * K]}
              pivot={[A.STICK.len * K, 0, 0]}
              offset={[(A.BUCKET.w / 2 - A.BUCKET.px) * K, (A.BUCKET.py - A.BUCKET.h / 2) * K]}
              px={1024}
              animate={(g) => (g.rotation.z = dig.bucket)}
            >
              <Part
                art={A.bucketDirt}
                size={[240 * K * 0.9, 130 * K * 0.9]}
                pivot={[85 * K, -135 * K, 0]}
                offset={[0, -43 * K * 0.9]}
                z={-0.002}
                px={512}
                animate={(g, t) => {
                  g.rotation.z = -0.185
                  const c = dig.carry
                  g.visible = c > 0.01
                  g.scale.set(Math.max(0.001, c), Math.max(0.001, c * (1 + Math.sin(t * 20) * 0.02 * dig.rumble)), 1)
                }}
              />
            </Part>
          </Part>
        </Part>
        {/* hydraulic rams: barrel + rod stretch between the joints */}
        <Ram a={() => [172 * K, 40 * K]} b={() => J().boomPt(148, -54)} z={0.0055} />
        <Ram a={() => J().boomPt(230, 124)} b={() => J().stickPt(40, 61)} z={0.0105} />
        <Ram a={() => J().stickPt(130, 55)} b={() => J().bucketPt(-24, -46)} z={0.0135} />
      </Part>
    </PopCard>
  )
}
const useSpreadIndex = { v: 0 }

const PILE_HOST = { w: 700, h: 380 }

function DirtPile() {
  return (
    <PopCard
      art={A.blankArt}
      size={[PILE_HOST.w * PK, PILE_HOST.h * PK]}
      at={PILE_AT}
      delay={0.34}
      tap="none"
      contact={false}
      onTap={() => scoop()}
    >
      {A.pileLayers.map((l, i) => (
        <Part
          key={i}
          art={l.art}
          size={[l.w * PK, l.h * PK]}
          pivot={[0, l.y * PK, 0]}
          offset={[0, (l.h / 2) * PK]}
          z={0.004 + i * 0.004}
          px={512}
          animate={(g, t) => {
            const v = dig.pile[i]
            g.visible = v > 0.01
            const wob = dig.busy && v > 0.01 && v < 1 ? Math.sin(t * 40) * 0.01 : 0
            g.scale.set((0.85 + 0.15 * v) * (1 + wob), Math.max(0.001, v), 1)
          }}
        />
      ))}
      {/* a bouncing "TAP!" bubble over the cab until the child has tried it */}
      <Part
        art={A.tapBubble}
        size={[0.44, 0.28]}
        pivot={[0.0, 0.62, 0.05]}
        offset={[0.04, 0.13]}
        px={256}
        animate={(g, t) => {
          const u = g.userData as { s?: number }
          const open = windowed(anim.raise[useSpreadIndex.v].v, 0.5) >= 1
          const want = open && !dig.busy && dig.scoops < 3 ? 1 : 0
          u.s = (u.s ?? 0) + (want - (u.s ?? 0)) * 0.15
          g.scale.setScalar(Math.max(0.001, u.s * (1 + Math.sin(t * 6) * 0.07)))
          g.position.y = 0.62 + Math.sin(t * 4) * 0.02
          g.rotation.z = Math.sin(t * 3) * 0.05
        }}
      />
      {/* "something shiny" glinting in the hole */}
      <Part
        art={A.holeGlint}
        size={[0.2, 0.2]}
        pivot={[0, 0.07, 0.04]}
        emissive={1}
        px={128}
        animate={(g, t) => {
          g.visible = dig.glint > 0.01
          g.scale.setScalar(Math.max(0.001, dig.glint * (0.75 + Math.sin(t * 7) * 0.3)))
          g.rotation.z = t * 0.8
        }}
      />
    </PopCard>
  )
}

function Truck() {
  const L = 124 * K
  const hinge: [number, number] = [(730 - 390) * K, (440 - 318) * K]
  return (
    <PopCard
      art={A.truckBody}
      size={[A.TRUCK.w * A.TK, A.TRUCK.h * A.TK]}
      at={TRUCK_AT}
      delay={0.2}
      rotY={0.1}
      px={1024}
      tap="jump"
      onTap={() => {
        bus.emit('sfx', 'beep')
        dig.honk = 1
        gsap.to(dig, { honk: 0, duration: 0.6 })
      }}
      escape={{ to: TRUCK_TO, arc: 0.2, scale: 2.1, duration: 2.8, spin: 0.35, on: 'truck' }}
    >
      {A.TRUCK_WHEELS.map(([x, y], i) => (
        <Part
          key={i}
          art={A.truckWheel}
          size={[L, L]}
          pivot={[(x - 390) * A.TK, (440 - y) * A.TK, 0]}
          z={0.006}
          px={256}
          animate={(g, t) => {
            g.rotation.z = -t * 14 * dig.roll - dig.jolt * 0.2
            g.position.y = (440 - y) * A.TK - dig.jolt * 0.006
          }}
        />
      ))}
      <Part
        art={A.truckBed}
        size={[A.BED.w * A.TK, A.BED.h * A.TK]}
        pivot={[hinge[0], hinge[1], 0]}
        offset={[(A.BED.w / 2 - A.BED.px) * A.TK, (A.BED.py - A.BED.h / 2) * A.TK]}
        z={0.004}
        px={1024}
        animate={(g, t) => {
          g.rotation.z = -dig.jolt * 0.03 - dig.roll * Math.abs(Math.sin(t * 9)) * 0.01
          g.position.y = hinge[1] - dig.jolt * 0.012
        }}
      >
        <Part
          art={A.truckLoad}
          size={[440 * A.TK, 150 * A.TK]}
          pivot={[-225 * A.TK, 128 * A.TK, 0]}
          offset={[0, 75 * A.TK]}
          z={-0.002}
          px={512}
          animate={(g) => {
            const lv = dig.load
            const s = lv <= 0 ? 0 : lv <= 1 ? 0.45 * lv : lv <= 2 ? 0.45 + 0.3 * (lv - 1) : 0.75 + 0.25 * Math.min(1, lv - 2)
            g.visible = s > 0.01
            g.scale.set(0.82 + 0.18 * s, Math.max(0.001, s), 1)
          }}
        />
      </Part>
    </PopCard>
  )
}

function Crane() {
  const k = 0.00107
  return (
    <PopCard art={A.crane} size={[700 * k, 1500 * k]} at={[1.05, -1.04]} delay={0.02} px={1024} tap="none" contact={false} idle="sway" idleAmp={0.12}>
      <Part
        art={A.craneHook}
        size={[200 * k, 400 * k]}
        pivot={[(520 - 350) * k, (1500 - 232) * k, 0]}
        offset={[0, -200 * k]}
        px={256}
        animate={(g, t) => (g.rotation.z = Math.sin(t * 1.1) * 0.09)}
      />
    </PopCard>
  )
}

function Popups() {
  const { index } = useSpread()
  useSpreadIndex.v = index
  return (
    <>
      <DigDirector />
      {/* back */}
      <Crane />
      <PopCard art={A.backPanel} size={[2.7, 1.09]} at={[0, -0.93]} vfold={0.2} delay={0} px={2048} tap="none" />
      {/* middle */}
      <PopCard art={A.pipeStack} size={[0.5, 0.295]} at={[-1.28, -0.74]} delay={0.1} rotY={0.1} tap="wiggle" />
      <PopCard art={A.barrel} size={[0.17, 0.236]} at={[-0.34, -0.8]} delay={0.12} tap="wiggle" />
      <Truck />
      <Excavator />
      <DirtPile />
      <Reveal at={MAP_AT}>
        <PopCard
          art={A.treasureMap}
          size={[0.7, 0.544]}
          at={[0, 0.12]}
          y={0.02}
          delay={0}
          idle="float"
          tap="jump"
          emissive={0.55}
          px={1024}
          contact={false}
          onTap={() => sendMap()}
          escape={{ to: MAP_TO, arc: 1.6, scale: 2.6, duration: 2.6, spin: 0.5, wait: 0, on: 'map' }}
        />
      </Reveal>
      <Bits />
      <HintRing />
      {/* front */}
      <PopCard art={A.wheelbarrow} size={[0.46, 0.292]} at={[1.36, 0.36]} delay={0.4} rotY={-0.35} tap="wiggle" />
      <PopCard art={A.barrier} size={[0.38, 0.226]} at={[0.52, 0.7]} delay={0.44} rotY={0.12} tap="wiggle" />
      <PopCard art={A.coneArt} size={[0.15, 0.232]} at={[1.12, 0.62]} delay={0.46} tap="jump" />
      <PopCard art={A.coneArt} size={[0.13, 0.2]} at={[1.46, 0.86]} delay={0.48} tap="jump" />
      <PopCard art={A.coneArt} size={[0.14, 0.217]} at={[0.18, 0.84]} delay={0.5} tap="jump" />
      <PopCard art={A.shovel} size={[0.18, 0.5]} at={[0.34, 0.5]} delay={0.42} lean={0.2} rotY={0.3} tap="wiggle" />
      <PopCard art={A.smallRock('#a9a6a0', '#86837d')} size={[0.14, 0.108]} at={[0.8, 0.9]} delay={0.5} tap="jump" />
      <PopCard art={A.smallRock('#b5a99a', '#948679')} size={[0.1, 0.077]} at={[1.0, 0.18]} delay={0.5} tap="jump" />
      <PopCard art={A.hardHatProp} size={[0.16, 0.092]} at={[0.64, 0.48]} delay={0.52} tap="jump" />
      <PopCard art={sparkle()} size={[0.11, 0.11]} at={[0.82, 0.62]} y={0.2} delay={0.52} hinge="spring" idle="float" emissive={0.8} tap="spin" />
    </>
  )
}

/* ---------------------------------------------------------------- world -- */

export function DigSiteWorld() {
  return (
    <group>
      {/* the far backdrop: painted sky, skyline, hills */}
      <Cutout art={W.backdrop} size={[38, 12.1]} at={[0, 0, -11]} hinge="rise" delay={0.02} px={2048} shadow={false} />
      <Cutout art={A.crane} size={[2.2, 4.7]} at={[-6.4, 0, -9.0]} delay={0.2} px={1024} rotY={0.2} idle="sway" idleAmp={0.1} />
      <Cutout art={A.crane} size={[1.8, 3.85]} at={[6.6, 0, -9.4]} delay={0.25} px={1024} rotY={-0.2} />
      <Cutout art={W.mound(true)} size={[6.2, 2.64]} at={[-3.6, 0, -8.8]} delay={0.12} px={1024} />
      <Cutout art={W.mound(false)} size={[7, 3.0]} at={[3.4, 0, -9.0]} delay={0.14} px={1024} rotY={-0.08} />
      <Cutout art={W.lightTower} size={[0.9, 2.15]} at={[-1.0, 0, -8.6]} delay={0.16} />
      <Cutout art={W.lightTower} size={[0.8, 1.9]} at={[0.9, 0, -9.0]} delay={0.18} />
      <Cutout art={W.bulldozer} size={[4.4, 2.55]} at={[5.0, 0, -5.4]} rotY={-0.3} delay={0.2} px={1024} tap="wiggle" />
      <Cutout art={W.trailer} size={[4.2, 2.5]} at={[-5.6, 0, -6.4]} rotY={0.3} delay={0.18} px={1024} />
      <Cutout art={W.fenceWorld} size={[4.4, 0.97]} at={[-2.6, 0, -7.3]} delay={0.15} px={1024} shadow={false} />
      <Cutout art={W.fenceWorld} size={[4.4, 0.97]} at={[1.8, 0, -7.5]} delay={0.17} px={1024} shadow={false} />
      <Cutout art={A.pipeStack} size={[1.9, 1.12]} at={[-5.2, 0, -3.8]} rotY={0.25} delay={0.22} />
      <Cutout art={A.pipeStack} size={[2.2, 1.3]} at={[7.0, 0, -3.0]} rotY={-0.4} delay={0.3} />
      <Cutout art={W.sandbags} size={[1.5, 0.75]} at={[2.9, 0, -4.4]} rotY={-0.1} delay={0.24} />
      <Cutout art={A.barrel} size={[0.55, 0.75]} at={[1.7, 0, -5.4]} delay={0.2} tap="wiggle" />
      <Cutout art={A.barrel} size={[0.55, 0.75]} at={[2.3, 0, -5.8]} delay={0.22} tap="wiggle" />
      <Cutout art={A.wheelbarrow} size={[1.6, 1.02]} at={[-4.6, 0, -2.4]} rotY={0.5} delay={0.26} tap="wiggle" />
      <Cutout art={A.barrier} size={[1.5, 0.89]} at={[3.4, 0, -2.9]} rotY={-0.15} delay={0.2} tap="wiggle" />
      <Cutout art={W.dangerSign} size={[1.0, 1.6]} at={[5.4, 0, -3.2]} rotY={-0.35} delay={0.22} tap="wiggle" />
      <Cutout art={W.dangerSign} size={[0.9, 1.43]} at={[-6.8, 0, -4.4]} rotY={0.5} delay={0.3} />
      {[
        [-3.7, -2.4, 0.8],
        [-3.1, -2.7, 0.7],
        [-0.6, -3.4, 0.7],
        [3.7, -2.2, 0.8],
        [6.2, -2.0, 0.9],
        [-5.8, -2.2, 0.9],
      ].map(([x, z, s], i) => (
        <Cutout key={i} art={A.coneArt} size={[0.5 * s, 0.77 * s]} at={[x, 0, z]} delay={0.2 + i * 0.02} tap="jump" />
      ))}
      <Cutout art={W.groundDecal} size={[12, 6.7]} at={[0.5, 0.01, -3.4]} flat delay={0.02} shadow={false} />
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
  spreadArt: A.digSpreadArt,
  Popups,
  miloReact: 'cheer',
}
