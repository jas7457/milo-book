import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { cloud, sparkle, tree as kitTree } from '../../art/kit'
import {
  baker, bakerArm, bakerHappy, bakerWorry, bakery, bell, fireSpreadArt, fireStation, flame, hooray, houseDoc, loaf, miloDriver,
  ohNo, rainbow, shed, smokePuff, spark, townRow,
} from '../../art/fireArt'
import {
  NOZ, cone, dogEar, dogHead, hydrant, lamp, lightFlash, nozzle, truckBody, truckGlass, truckLadder, truckReel, truckWheel, worldTruck,
} from '../../art/fireArt2'
import { farTown, hedge, townTree, waterTower, worldRoad } from '../../art/fireWorldArt'
import { svgTexture } from '../../art/texture'
import { Part, PopCard } from '../../popup/PopCard'
import { DragPiece, type DragState } from '../../popup/DragPiece'
import { useSpread } from '../../popup/SpreadContext'
import { anim } from '../../state'
import { clamp01, easeOutBack, windowed } from '../../anim/ease'
import { bus } from '../../bus'
import { beat } from '../../progress'
import { heard } from '../../cue'
import { Cutout, useWorldLevel } from '../../world/Cutout'
import { palettes } from '../palettes'
import type { SpreadDef } from '../types'

/*
 * Spread 5 — "Fire rescue!". Smoke over the bridge: Milo hops onto the big
 * red fire truck and puts out a (very friendly) fire in the baker's oven shed.
 *   back:   the town row (V-fold, clock tower) · the fire station · the bakery
 *   middle: the fire truck (ladder, reel, Milo + the Dalmatian in the cab) ·
 *           the burning oven shed (flickering flames) · the baker
 *   front:  hydrant · cones · the hose nozzle you pick up
 * Hold the nozzle on the oven shed: water arcs out, the flames shrink and
 * steam puffs; the fire goes out, a rainbow bursts from the smoke, the baker
 * cheers and the truck drives off into the town.
 */

const K = 1 / 800
const TRUCK_AT: [number, number] = [-0.2, -0.2]
const TRUCK_SIZE: [number, number] = [1240 * K, 700 * K]
/** truck art (px) → pivot-relative position in the truck card */
const TP = (x: number, y: number): [number, number] => [(x - 620) * K, (700 - y) * K]
const SHED_AT: [number, number] = [1.12, -0.12]
const SHED_SIZE: [number, number] = [560 * K, 600 * K]
const SP = (x: number, y: number): [number, number] => [(x - 280) * K, (600 - y) * K]
const BAKERY_AT: [number, number] = [0.98, -0.76]
const BAKER_AT: [number, number] = [1.42, 0.14]
const NOZ_HOME: [number, number] = [0.5, 0.8]
const NOZ_TARGET: [number, number] = [0.5, 0.14]
const NOZ_SIZE: [number, number] = [0.62, 0.62 * (NOZ.h / NOZ.w)]
const NK = NOZ_SIZE[0] / NOZ.w
const TIP: [number, number] = [(NOZ.tip[0] - NOZ.w / 2) * NK, (NOZ.h - NOZ.tip[1]) * NK]
const BACK: [number, number] = [(NOZ.back[0] - NOZ.w / 2) * NK, (NOZ.h - NOZ.back[1]) * NK]

/* ------------------------------------------------- spread behaviour -- */

/** Live state shared by the pieces of this spread (reset when you leave it). */
const fire = {
  /** 1 = full flames … 0 = out */
  level: 1,
  /** 0 → 1 after the fire is out: smoke fades, rainbow + cheering */
  out: 0,
  done: false,
  ring: 0,
  ladder: 0,
  reel: 0,
  roll: 0,
  driving: false,
  hose: 1,
  burst: 0,
  steam: 0,
}
const hoseState: DragState = { progress: 0, over: false, done: false, held: false }
/** The nozzle's tip and the hose end, in book space (written by NozzleProbe). */
const probe = { tip: new THREE.Vector3(), back: new THREE.Vector3(), ok: false }
const bookRoot: { g: THREE.Object3D | null } = { g: null }

let timeline: gsap.core.Timeline | null = null

function resetFire() {
  timeline?.kill()
  timeline = null
  gsap.killTweensOf(fire)
  Object.assign(fire, { level: 1, out: 0, done: false, ring: 0, ladder: 0, reel: 0, roll: 0, driving: false, hose: 1, burst: 0, steam: 0 })
}

/** Resets this spread's state when the page is turned away; owns timers. */
function FireDirector() {
  const { index } = useSpread()
  const live = useRef(true)
  const greeted = useRef(false)
  const call = useRef<gsap.core.Tween | null>(null)
  useFrame((_, dt) => {
    const v = anim.raise[index].v
    const away = v < 0.5
    if (away && live.current) {
      live.current = false
      greeted.current = false
      call.current?.kill()
      resetFire()
    } else if (!away) live.current = true
    if (!live.current) return
    // ding-ding-ding: the alarm rings as the spread opens
    if (v > 0.92 && !greeted.current) {
      greeted.current = true
      call.current = gsap.delayedCall(0.5, () => {
        if (fire.done) return
        bus.emit('sfx', 'siren')
        gsap.fromTo(fire, { ring: 1 }, { ring: 0, duration: 2.4, ease: 'power1.out' })
      })
    }
    const spraying = hoseState.over && hoseState.held && !hoseState.done
    const target = fire.done ? 0 : spraying ? 1 - hoseState.progress : 1
    if (target < fire.level) fire.level = target
    else fire.level = Math.min(target, fire.level + dt * 0.1)
    const held = hoseState.held && !hoseState.done
    fire.ladder += ((held ? 0.3 : fire.done ? 0.12 : 0) - fire.ladder) * Math.min(1, dt * 3)
    if (held) fire.reel += dt * 5
    if (fire.driving) fire.roll += dt * 12
  })
  return null
}

function putOut() {
  fire.done = true
  beat('firefighter', 1)
  const tl = (timeline = gsap.timeline())
  tl.add(() => {
    bus.emit('sfx', 'sparkle')
    bus.emit('milo', 'cheer')
    fire.burst++
    fire.steam++
  }, 0.05)
    .to(fire, { level: 0, duration: 0.3 }, 0)
    .to(fire, { out: 1, duration: 1.8, ease: 'power2.out' }, 0.2)
    .add(() => bus.emit('sfx', 'giggle'), 0.8)
    .add(() => bus.emit('sfx', 'sparkle'), 1.4)
    .fromTo(fire, { ring: 0 }, { ring: 1, duration: 0.01 }, 2.4)
    .add(() => bus.emit('sfx', 'siren'), 2.5)
    .to(fire, { ring: 0, duration: 2.2 }, 2.6)
    .add(() => {
      fire.driving = true
      bus.emit('sfx', 'zoom')
      bus.emit('pull', 'truck')
    }, 5)
    .to(fire, { hose: 0, duration: 0.4 }, 4.9)
}

/* ------------------------------------------------------ small helpers -- */

const ease = (x: number) => easeOutBack(clamp01(x), 1.5)
const smooth = (x: number) => x * x * (3 - 2 * x)

function mkTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
let dropT: THREE.CanvasTexture | null = null
const dropTex = () =>
  (dropT ??= mkTex(64, (c, s) => {
    const g = c.createRadialGradient(s * 0.4, s * 0.38, 2, s / 2, s / 2, s * 0.46)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.35, '#bfe8ff')
    g.addColorStop(1, '#4aa8ff')
    c.fillStyle = g
    c.strokeStyle = '#2f86d0'
    c.lineWidth = 4
    c.beginPath()
    c.arc(s / 2, s / 2, s * 0.44, 0, Math.PI * 2)
    c.fill()
    c.stroke()
  }))
let softT: THREE.CanvasTexture | null = null
const softTex = () =>
  (softT ??= mkTex(128, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.6, 'rgba(240,244,250,0.6)')
    g.addColorStop(1, 'rgba(240,244,250,0)')
    c.fillStyle = g
    c.fillRect(0, 0, s, s)
  }))
let starT: THREE.CanvasTexture | null = null
const starTex = () =>
  (starT ??= mkTex(64, (c, s) => {
    c.fillStyle = '#fff'
    c.strokeStyle = 'rgba(60,40,30,0.7)'
    c.lineWidth = 3
    c.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      const r = i % 2 ? s * 0.18 : s * 0.44
      c.lineTo(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r)
    }
    c.closePath()
    c.fill()
    c.stroke()
  }))

/* ---------------------------------------------- nozzle, water, hose ---- */

/** Rides along inside the nozzle piece and reports where its tip and hose end are (book space). */
function NozzleProbe() {
  const a = useRef<THREE.Group>(null!)
  const b = useRef<THREE.Group>(null!)
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const r = bookRoot.g
    if (!r) return
    r.updateWorldMatrix(true, false)
    a.current.getWorldPosition(v)
    probe.tip.copy(r.worldToLocal(v))
    b.current.getWorldPosition(v)
    probe.back.copy(r.worldToLocal(v))
    probe.ok = true
  })
  return (
    <>
      <group ref={a} position={[TIP[0], TIP[1], 0.02]} />
      <group ref={b} position={[BACK[0], BACK[1], 0.02]} />
    </>
  )
}

/** The water jet, splashes, steam puffs and the victory confetti. */
function Water() {
  const { baseY } = useSpread()
  const N = 60
  const drops = useRef<THREE.InstancedMesh>(null!)
  const splashM = useRef<THREE.InstancedMesh>(null!)
  const confM = useRef<THREE.InstancedMesh>(null!)
  const steamM = useRef<(THREE.Mesh | null)[]>([])
  const o = useMemo(() => new THREE.Object3D(), [])
  const rnd = useMemo(() => Array.from({ length: N }, () => ({ a: Math.random(), b: Math.random() - 0.5, c: Math.random() - 0.5 })), [])
  const splash = useMemo(() => Array.from({ length: 36 }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3() })), [])
  const steam = useMemo(() => Array.from({ length: 12 }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), s: 0.2 })), [])
  const conf = useMemo(() => Array.from({ length: 46 }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0, vr: 0, s: 0.05 })), [])
  const dropMat = useMemo(() => new THREE.MeshBasicMaterial({ map: dropTex(), transparent: true, depthWrite: false }), [])
  const confMat = useMemo(() => new THREE.MeshBasicMaterial({ map: starTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide }), [])
  const steamMats = useMemo(() => steam.map(() => new THREE.MeshBasicMaterial({ map: softTex(), transparent: true, depthWrite: false, opacity: 0 })), [steam])
  const S = useRef({ sp: 0, aim: 0, sfx: 0, spawn: 0, steamT: 0, burst: 0, steamBurst: 0, colored: false })
  const A = useMemo(() => new THREE.Vector3(), [])
  const F = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const palette = useMemo(() => ['#ff5a5a', '#ffd34d', '#5cc96a', '#4aa8ff', '#ff9ec4', '#8a6cd8'].map((c) => new THREE.Color(c)), [])

  useFrame((state, dt) => {
    const st = S.current
    const t = state.clock.elapsedTime
    const live = anim.raise.length > 0 && probe.ok
    const held = live && hoseState.held && !hoseState.done
    st.sp += ((held ? 1 : 0) - st.sp) * Math.min(1, dt * 10)
    st.aim += ((hoseState.over && !hoseState.done ? 1 : 0) - st.aim) * Math.min(1, dt * 8)
    const tip = probe.tip
    F.set(SHED_AT[0] - 0.03, baseY + 0.27, SHED_AT[1] + 0.05)
    A.set(tip.x + 0.55, baseY + 0.012, tip.z - 0.05).lerp(F, st.aim)
    const dist = tip.distanceTo(A)
    const arc = 0.08 + dist * 0.16

    // the jet: a ribbon of droplets
    for (let i = 0; i < N; i++) {
      const r = rnd[i]
      const u = (t * 1.9 + i / N) % 1
      o.position.lerpVectors(tip, A, u)
      o.position.y += arc * 4 * u * (1 - u)
      o.position.x += r.b * 0.016 * u
      o.position.z += r.c * 0.016 * u
      o.position.y += r.c * 0.012 * u
      o.scale.setScalar(Math.max(0.0001, st.sp * (0.55 + r.a * 0.7) * (1 - u * 0.25)))
      o.rotation.set(0, 0, 0)
      o.updateMatrix()
      drops.current.setMatrixAt(i, o.matrix)
    }
    drops.current.instanceMatrix.needsUpdate = true

    // whoosh while spraying
    st.sfx -= dt
    if (held && !hoseState.over && st.sfx <= 0) {
      bus.emit('sfx', 'whoosh')
      st.sfx = 0.75
    }

    // splashes where the water lands
    st.spawn += dt * 46 * st.sp
    for (const q of splash) {
      if (st.spawn >= 1 && q.life <= 0) {
        st.spawn -= 1
        q.life = 0.5 + Math.random() * 0.4
        q.p.copy(A).add(tmp.set((Math.random() - 0.5) * 0.04, 0, (Math.random() - 0.5) * 0.04))
        q.v.set(-0.1 + (Math.random() - 0.5) * 0.7, 0.45 + Math.random() * 0.8, (Math.random() - 0.4) * 0.7)
      }
      if (q.life > 0) {
        q.life -= dt
        q.v.y -= 3.6 * dt
        q.p.addScaledVector(q.v, dt)
        if (q.p.y < baseY + 0.01) q.life = 0
      }
    }
    st.spawn = Math.min(st.spawn, 3)
    splash.forEach((q, i) => {
      o.position.copy(q.p)
      o.rotation.set(0, 0, 0)
      o.scale.setScalar(q.life > 0 ? Math.min(0.7, q.life * 2) : 0.0001)
      o.updateMatrix()
      splashM.current.setMatrixAt(i, o.matrix)
    })
    splashM.current.instanceMatrix.needsUpdate = true

    // steam where the water meets the flames, and a big puff when they go out
    if (fire.steam !== st.steamBurst) {
      st.steamBurst = fire.steam
      let n = 0
      for (const q of steam) if (q.life <= 0 && n++ < 8) Object.assign(q, { life: 1.6 + Math.random() * 0.6, max: 2.2, s: 0.3 + Math.random() * 0.3 }), q.p.set(F.x + (Math.random() - 0.5) * 0.3, F.y - 0.05 + Math.random() * 0.2, F.z + 0.05)
    }
    st.steamT += dt * (hoseState.over && !hoseState.done && held ? 2.5 + 9 * (1 - fire.level) : 0)
    for (const q of steam) {
      if (st.steamT >= 1 && q.life <= 0) {
        st.steamT -= 1
        q.max = q.life = 1.1 + Math.random() * 0.5
        q.s = 0.16 + Math.random() * 0.14
        q.p.set(F.x + (Math.random() - 0.5) * 0.28, F.y - 0.08 + Math.random() * 0.2, F.z + 0.07)
      }
      if (q.life > 0) {
        q.life -= dt
        q.p.y += dt * 0.2
        q.p.x += dt * 0.03
      }
    }
    st.steamT = Math.min(st.steamT, 3)
    steam.forEach((q, i) => {
      const m = steamM.current[i]
      if (!m) return
      const k = q.life > 0 ? 1 - q.life / q.max : 1
      m.visible = q.life > 0
      m.position.copy(q.p)
      m.scale.setScalar(q.s * (0.5 + k * 1.4))
      steamMats[i].opacity = Math.sin(Math.PI * Math.min(1, k)) * 0.8
    })

    // victory confetti
    if (!st.colored && confM.current) {
      st.colored = true
      conf.forEach((_, i) => confM.current.setColorAt(i, palette[i % palette.length]))
      confM.current.instanceColor!.needsUpdate = true
    }
    if (fire.burst !== st.burst) {
      st.burst = fire.burst
      for (const q of conf) {
        q.life = 2.4 + Math.random() * 1.2
        q.p.set(F.x + (Math.random() - 0.5) * 0.2, F.y + (Math.random() - 0.3) * 0.2, F.z + 0.1)
        q.v.set((Math.random() - 0.5) * 1.5, 1.2 + Math.random() * 1.5, (Math.random() - 0.2) * 1.2)
        q.vr = (Math.random() - 0.5) * 10
        q.s = 0.04 + Math.random() * 0.04
      }
    }
    conf.forEach((q, i) => {
      if (q.life > 0) {
        q.life -= dt
        q.v.y -= 2.4 * dt
        q.v.multiplyScalar(1 - dt * 0.6)
        q.p.addScaledVector(q.v, dt)
        q.r += q.vr * dt
        if (q.p.y < baseY + 0.01) {
          q.p.y = baseY + 0.01
          q.v.set(0, 0, 0)
          q.vr = 0
        }
      }
      o.position.copy(q.p)
      o.rotation.set(0, 0, q.r)
      o.scale.setScalar(q.life > 0 ? q.s * Math.min(1, q.life * 2) : 0.0001)
      o.updateMatrix()
      confM.current.setMatrixAt(i, o.matrix)
    })
    confM.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <group ref={(g) => void (bookRoot.g = g)} />
      <instancedMesh ref={drops} args={[undefined, undefined, N]} material={dropMat} frustumCulled={false} renderOrder={5}>
        <planeGeometry args={[0.042, 0.042]} />
      </instancedMesh>
      <instancedMesh ref={splashM} args={[undefined, undefined, 36]} material={dropMat} frustumCulled={false} renderOrder={5}>
        <planeGeometry args={[0.03, 0.03]} />
      </instancedMesh>
      {steam.map((_, i) => (
        <mesh key={i} ref={(m) => void (steamM.current[i] = m)} material={steamMats[i]} visible={false} renderOrder={6}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      <instancedMesh ref={confM} args={[undefined, undefined, 46]} material={confMat} frustumCulled={false} renderOrder={6}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  )
}

/** The red hose, from the truck's pump to the nozzle: a string of beads. */
function Hose() {
  const { index, baseY } = useSpread()
  const N = 52
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const o = useMemo(() => new THREE.Object3D(), [])
  const P = useMemo(() => [0, 1, 2, 3].map(() => new THREE.Vector3()), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e04030', roughness: 0.55 }), [])
  const gold = useMemo(() => new THREE.Color('#e8b43a'), [])
  const red = useMemo(() => new THREE.Color('#e04030'), [])
  const done = useRef(false)
  useFrame(() => {
    if (!done.current && mesh.current) {
      done.current = true
      for (let i = 0; i < N; i++) mesh.current.setColorAt(i, i < 3 || i > N - 4 ? gold : i % 9 === 0 ? gold : red)
      mesh.current.instanceColor!.needsUpdate = true
    }
    const vis = windowed(anim.raise[index].v, 0.5) * fire.hose
    const fy = baseY + 0.02
    const home = new THREE.Vector3(NOZ_HOME[0] + BACK[0], baseY + BACK[1] * 0.5 + 0.02, NOZ_HOME[1])
    const B = probe.ok ? probe.back : home
    P[0].set(TRUCK_AT[0] + (710 - 620) * K, baseY + (700 - 505) * K, TRUCK_AT[1] + 0.045)
    P[1].set(P[0].x + 0.1, fy, P[0].z + 0.34)
    P[2].set(B.x - 0.3, Math.max(fy, B.y - 0.1), B.z - 0.02)
    P[3].copy(B)
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1)
      const a = (1 - s) ** 3
      const b = 3 * s * (1 - s) ** 2
      const c = 3 * s * s * (1 - s)
      const d = s ** 3
      o.position.set(
        a * P[0].x + b * P[1].x + c * P[2].x + d * P[3].x,
        Math.max(fy - 0.004, a * P[0].y + b * P[1].y + c * P[2].y + d * P[3].y),
        a * P[0].z + b * P[1].z + c * P[2].z + d * P[3].z,
      )
      o.scale.setScalar(Math.max(0.0001, vis) * (i < 3 || i > N - 4 ? 1.25 : 1))
      o.updateMatrix()
      mesh.current.setMatrixAt(i, o.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} material={mat} frustumCulled={false} castShadow>
      <sphereGeometry args={[0.014, 10, 8]} />
    </instancedMesh>
  )
}

/** Red and blue warning lights splashing the page; a warm glow from the flames. */
function FireLights() {
  const { index, baseY } = useSpread()
  const red = useRef<THREE.PointLight>(null!)
  const flames = useRef<THREE.PointLight>(null!)
  useFrame((s) => {
    const l = windowed(anim.raise[index].v, 0.4)
    const t = s.clock.elapsedTime
    const away = 1 - clamp01(fire.driving ? (fire.roll / 12) * 1 : 0)
    const ph = Math.sin(t * (fire.done ? 9 : 6))
    red.current.color.set(ph > 0 ? '#ff3a2a' : '#3a7aff')
    red.current.intensity = l * away * (0.35 + Math.abs(ph) * 0.45)
    flames.current.intensity = l * fire.level * (0.55 + Math.sin(t * 12) * 0.1 + Math.sin(t * 7.3) * 0.08)
  })
  return (
    <>
      <pointLight ref={red} position={[TRUCK_AT[0] + 0.35, baseY + 0.75, TRUCK_AT[1] + 0.2]} distance={2.6} decay={1.6} />
      <pointLight ref={flames} position={[SHED_AT[0], baseY + 0.3, SHED_AT[1] + 0.3]} color="#ff8a3a" distance={1.8} decay={1.4} />
    </>
  )
}

/* ---------------------------------------------------- truck + parts -- */

function FireTruck() {
  const wheels = [TP(330, 574), TP(520, 574), TP(1010, 574)]
  return (
    <PopCard
      art={truckBody}
      size={TRUCK_SIZE}
      at={TRUCK_AT}
      delay={0.16}
      px={2048}
      tap="wiggle"
      onTap={() => bus.emit('sfx', 'siren')}
      escape={{ to: [3.4, 0, -4.4], arc: 1.1, scale: 2.7, duration: 3, spin: -0.12, on: 'truck', upright: true }}
    >
      {/* the ladder lifts while you spray */}
      <Part
        art={truckLadder}
        size={[740 * K, 60 * K]}
        pivot={[TP(50, 222)[0], TP(50, 222)[1], 0]}
        offset={[370 * K, 0]}
        px={1024}
        z={0.006}
        animate={(g, t) => {
          g.rotation.z = fire.ladder + Math.sin(t * 2) * 0.004 * fire.ladder
        }}
      />
      <Part
        art={truckReel}
        size={[190 * K, 190 * K]}
        pivot={[TP(190, 351)[0], TP(190, 351)[1], 0]}
        z={0.006}
        animate={(g) => {
          g.rotation.z = -fire.reel
        }}
      />
      {wheels.map(([x, y], i) => (
        <Part
          key={i}
          art={truckWheel}
          size={[160 * K, 160 * K]}
          pivot={[x, y, 0]}
          z={0.004}
          animate={(g, t) => {
            g.rotation.z = -fire.roll + (fire.driving ? 0 : Math.sin(t * 6 + i) * 0.002)
          }}
        />
      ))}
      {/* Firefighter Milo and the Dalmatian in the cab window */}
      <Part
        art={miloDriver}
        size={[132 * K, 137 * K]}
        pivot={[TP(905, 364)[0], TP(905, 364)[1], 0]}
        offset={[0, 68 * K]}
        z={0.005}
        animate={(g, t) => {
          const hop = fire.out * Math.abs(Math.sin(t * 7)) * 0.03
          g.position.y = TP(905, 364)[1] + hop + Math.sin(t * 2.3) * 0.004
          g.rotation.z = Math.sin(t * 1.7) * 0.03 + fire.out * Math.sin(t * 7) * 0.08
        }}
      />
      <Part
        art={dogHead}
        size={[144 * K, 153 * K]}
        pivot={[TP(1042, 364)[0], TP(1042, 364)[1], 0]}
        offset={[0, 76 * K]}
        z={0.0055}
        animate={(g, t) => {
          g.position.y = TP(1042, 364)[1] + fire.out * Math.abs(Math.sin(t * 8)) * 0.02
          g.rotation.z = Math.sin(t * 3.1) * 0.05 + (fire.level < 0.98 ? Math.sin(t * 11) * 0.03 : 0)
          g.scale.y = 1 + Math.sin(t * 9) * 0.012
        }}
      >
        {[-1, 1].map((d) => (
          <Part
            key={d}
            art={dogEar}
            size={[54 * K, 90 * K]}
            pivot={[d * 44 * 0.9 * K, 100 * 0.9 * K, 0]}
            offset={[0, -42 * K]}
            z={-0.0025}
            animate={(g, t) => {
              g.scale.x = d
              g.rotation.z = d * (0.12 + Math.sin(t * 5 + d) * 0.12 + fire.out * Math.sin(t * 12) * 0.2)
            }}
          />
        ))}
      </Part>
      <Part art={truckGlass} size={[360 * K, 170 * K]} pivot={[TP(1000, 290)[0], TP(1000, 290)[1], 0]} z={0.0085} px={1024} />
      {/* flashing lights */}
      <Part
        art={lightFlash('#ff5a4a', '#b8261c')}
        size={[150 * K, 150 * K]}
        pivot={[TP(920, 134)[0], TP(920, 134)[1], 0]}
        emissive={1}
        z={0.01}
        animate={(g, t) => {
          const on = Math.sin(t * (fire.done ? 9 : 6)) > 0
          g.visible = on
          g.rotation.z = t * 2
          g.scale.setScalar(0.9 + Math.sin(t * 20) * 0.1)
        }}
      />
      <Part
        art={lightFlash('#6aaaff', '#2a5ab8')}
        size={[150 * K, 150 * K]}
        pivot={[TP(1042, 134)[0], TP(1042, 134)[1], 0]}
        emissive={1}
        z={0.01}
        animate={(g, t) => {
          const on = Math.sin(t * (fire.done ? 9 : 6)) <= 0
          g.visible = on
          g.rotation.z = -t * 2
          g.scale.setScalar(0.9 + Math.sin(t * 20) * 0.1)
        }}
      />
      <Part
        art={lightFlash('#fff2a0', '#e8b43a')}
        size={[110 * K, 110 * K]}
        pivot={[TP(1190, 364)[0], TP(1190, 364)[1], 0]}
        emissive={1}
        z={0.01}
        animate={(g, t) => {
          g.rotation.z = t
          g.scale.setScalar(0.75 + Math.sin(t * 6) * 0.1)
        }}
      />
    </PopCard>
  )
}

/* ------------------------------------------------ the burning shed ---- */

const FLAMES: { at: [number, number]; s: number; gain: number; rot: number; ph: number }[] = [
  { at: [280, 556], s: 1.45, gain: 1, rot: 0, ph: 0 },
  { at: [200, 558], s: 1.0, gain: 1.15, rot: -0.12, ph: 1.7 },
  { at: [360, 558], s: 1.1, gain: 1.1, rot: 0.12, ph: 3.1 },
  { at: [462, 58], s: 0.62, gain: 1.7, rot: 0.05, ph: 4.4 },
  { at: [112, 194], s: 0.55, gain: 1.9, rot: -0.1, ph: 2.2 },
]

function Shed() {
  return (
    <PopCard art={shed} size={SHED_SIZE} at={SHED_AT} delay={0.26} px={1024} tap="wiggle" rotY={-0.05}>
      {FLAMES.map((f, i) => {
        const p = SP(f.at[0], f.at[1])
        return (
          <Part
            key={i}
            art={flame}
            size={[200 * K, 300 * K]}
            pivot={[p[0], p[1], 0]}
            offset={[0, 150 * K]}
            emissive={0.55}
            z={0.006 + i * 0.0006}
            animate={(g, t) => {
              const l = clamp01(f.gain * fire.level - (f.gain - 1))
              const k = smooth(l)
              g.visible = k > 0.01
              const w = 1 + Math.sin(t * 8.1 + f.ph) * 0.05
              g.scale.set(f.s * k * w, f.s * k * (1 + Math.sin(t * 11 + f.ph) * 0.07 + Math.sin(t * 5.3 + f.ph) * 0.05), 1)
              g.rotation.z = f.rot + Math.sin(t * 4.2 + f.ph) * 0.06
            }}
          />
        )
      })}
      {/* friendly little embers drifting up */}
      {[0, 1, 2].map((i) => (
        <Part
          key={i}
          art={spark}
          size={[0.055, 0.055]}
          pivot={[SP(240 + i * 40, 420)[0], SP(240 + i * 40, 420)[1], 0]}
          emissive={0.9}
          z={0.01}
          animate={(g, t) => {
            const c = (t * 0.4 + i / 3) % 1
            g.visible = fire.level > 0.2
            g.position.set(SP(240 + i * 40, 420)[0] + Math.sin(c * 6 + i) * 0.04, SP(240 + i * 40, 420)[1] + c * 0.34, 0.01)
            g.scale.setScalar(Math.sin(c * Math.PI) * fire.level)
            g.rotation.z = c * 6
          }}
        />
      ))}
    </PopCard>
  )
}

/* ---------------------------------------------------------- baker ----- */

function Baker() {
  const bx = (px: number, py: number): [number, number] => [(px - 160) * K, (600 - py) * K]
  const face = bx(160, 205)
  return (
    <PopCard art={baker} size={[320 * K, 600 * K]} at={BAKER_AT} delay={0.3} px={1024} tap="jump" rotY={-0.12} idle="rock" idleAmp={0.5} onTap={() => bus.emit('sfx', fire.done ? 'giggle' : 'pop')}>
      <Part
        art={bakerWorry}
        size={[150 * K, 130 * K]}
        pivot={[face[0], face[1], 0]}
        z={0.005}
        animate={(g) => (g.visible = fire.out < 0.35)}
      />
      <Part
        art={bakerHappy}
        size={[150 * K, 130 * K]}
        pivot={[face[0], face[1], 0]}
        z={0.005}
        animate={(g) => (g.visible = fire.out >= 0.35)}
      />
      {[-1, 1].map((d) => {
        const sh = bx(d < 0 ? 98 : 222, 256)
        return (
          <Part
            key={d}
            art={bakerArm}
            size={[80 * K, 240 * K]}
            pivot={[sh[0], sh[1], 0]}
            offset={[0, -104 * K]}
            z={0.007}
            animate={(g, t) => {
              const worried = 1 - clamp01(fire.out * 3)
              const up = 0.95 + Math.sin(t * 13) * 0.08
              const cheer = 2.6 + Math.sin(t * 9 + d) * 0.28
              g.rotation.z = d * (worried * up + (1 - worried) * cheer)
            }}
          >
            {d > 0 && (
              <Part
                art={loaf}
                size={[120 * K, 60 * K]}
                pivot={[0, -174 * K, 0]}
                z={0.003}
                animate={(g) => {
                  g.visible = fire.out > 0.35
                  g.rotation.z = -0.4
                }}
              />
            )}
          </Part>
        )
      })}
      <Part
        art={ohNo}
        size={[0.3, 0.17]}
        pivot={[-0.06, 0.78, 0]}
        offset={[-0.12, 0.06]}
        z={0.01}
        animate={(g, t) => {
          const k = clamp01(1 - fire.out * 4)
          g.visible = k > 0.01 && fire.level > 0.1
          g.scale.setScalar(Math.max(0.001, k) * (1 + Math.sin(t * 6) * 0.03))
        }}
      />
      <Part
        art={hooray}
        size={[0.3, 0.17]}
        pivot={[-0.06, 0.78, 0]}
        offset={[-0.12, 0.06]}
        z={0.01}
        animate={(g, t) => {
          const k = ease((fire.out - 0.3) * 2.5)
          g.visible = k > 0.01
          g.scale.setScalar(Math.max(0.001, k) * (1 + Math.sin(t * 8) * 0.04))
        }}
      />
    </PopCard>
  )
}

/* --------------------------------------------------- back buildings --- */

const BK = 1 / 800
const CHIM = [(726 - 440) * BK, (1000 - 124) * BK] as const

function Bakery() {
  return (
    <PopCard art={bakery} size={[880 * BK, 1000 * BK]} at={BAKERY_AT} delay={0.06} rotY={-0.1} px={1536} tap="wiggle" onTap={() => bus.emit('sfx', 'beep')}>
      {/* the chimney's smoke: friendly paper puffs that rise, then fade as the fire goes out */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Part
          key={i}
          art={smokePuff}
          size={[220 * BK, 180 * BK]}
          pivot={[CHIM[0], CHIM[1], 0]}
          z={0.004}
          animate={(g, t) => {
            const c = (t / 3.4 + i / 5) % 1
            const amount = (0.45 + 0.55 * fire.level) * (1 - clamp01(fire.out * 1.2))
            g.visible = amount > 0.02
            g.position.set(CHIM[0] - c * 0.2 + Math.sin(c * 5 + i * 2) * 0.03, CHIM[1] + 0.06 + c * 0.8, 0.004 + i * 0.0003)
            g.scale.setScalar(Math.max(0.001, (0.5 + c * 1.1) * Math.sin(Math.PI * Math.min(1, c * 0.92 + 0.04)) * amount))
          }}
        />
      ))}
      {/* the rainbow that grows out of the smoke */}
      <Part
        art={rainbow}
        size={[1.5, 0.75]}
        pivot={[-0.42, 1.12, 0]}
        offset={[0, 0.375]}
        emissive={0.35}
        z={0.002}
        px={1024}
        animate={(g, t) => {
          const k = ease(fire.out * 1.2 - 0.15)
          g.visible = k > 0.01
          g.scale.setScalar(Math.max(0.001, k))
          g.position.y = 1.12 + Math.sin(t * 1.2) * 0.008
        }}
      />
    </PopCard>
  )
}

function Station() {
  const bp = [(700 - 400) * K, (960 - 198) * K] as const
  return (
    <PopCard
      art={fireStation}
      size={[800 * K, 960 * K]}
      at={[-1.02, -0.8]}
      delay={0.02}
      rotY={0.12}
      px={1536}
      tap="wiggle"
      onTap={() => {
        bus.emit('sfx', 'beep')
        gsap.fromTo(fire, { ring: 1 }, { ring: 0, duration: 1.6, ease: 'power1.out' })
      }}
    >
      <Part
        art={bell}
        size={[90 * K, 100 * K]}
        pivot={[bp[0], bp[1], 0]}
        offset={[0, -48 * K]}
        z={0.003}
        animate={(g, t) => {
          g.rotation.z = Math.sin(t * 9) * 0.5 * fire.ring
        }}
      />
    </PopCard>
  )
}

/* ------------------------------------------------------------ popups -- */

function FirePopups() {
  return (
    <>
      <FireDirector />
      <Water />
      <Hose />
      <FireLights />
      {/* back */}
      <PopCard art={townRow} size={[3.1, 1.1]} at={[0, -1.03]} vfold={0.18} delay={0} px={2048} tap="none" />
      <Station />
      <Bakery />
      <PopCard art={lamp} size={[0.15, 0.74]} at={[-0.42, -0.72]} delay={0.1} emissive={0.4} tap="wiggle" px={512} />
      {/* middle */}
      <FireTruck />
      <Shed />
      <Baker />
      {/* front */}
      <PopCard art={hydrant} size={[0.2, 0.3]} at={[-0.02, 0.8]} delay={0.36} rotY={0.1} tap="jump" px={512} />
      <PopCard art={cone} size={[0.15, 0.21]} at={[1.3, 0.7]} delay={0.4} rotY={-0.2} tap="jump" />
      <PopCard art={cone} size={[0.13, 0.18]} at={[1.52, 0.5]} delay={0.43} rotY={-0.3} tap="jump" />
      <DragPiece
        art={nozzle}
        size={NOZ_SIZE}
        at={NOZ_HOME}
        delay={0.34}
        idle="bob"
        px={1024}
        target={{ at: NOZ_TARGET, r: 0.27 }}
        hold={2.6}
        holdSfx="whoosh"
        state={hoseState}
        color="#7fd4ff"
        hint={() => heard('firefighter', 'hose')}
        onDone={putOut}
      >
        <NozzleProbe />
      </DragPiece>
      <PopCard art={sparkle()} size={[0.12, 0.12]} at={[0.9, 0.55]} y={0.2} delay={0.5} hinge="spring" idle="float" emissive={0.8} tap="spin" />
    </>
  )
}

/* ---------------------------------------------------------- the world -- */

const house = (seed: number, w: number, h: number, wall: string, roof: string, kind: 'house' | 'shop' | 'flat', sign?: string) => houseDoc({ seed, w, h, wall, roof, kind, sign })
const H1 = house(3, 270, 500, '#f2c9a0', '#c4553b', 'house')
const H2 = house(4, 250, 600, '#9fd0c3', '#e8572b', 'shop', 'TOYS')
const H3 = house(6, 240, 650, '#f2a7b0', '#c4553b', 'flat')
const H4 = house(7, 250, 590, '#b7c9f0', '#2f9a4a', 'shop', 'BOOKS')
const H5 = house(9, 260, 640, '#c9e3a0', '#e8572b', 'shop', 'CAFE')
const H6 = house(5, 300, 470, '#f6e08a', '#3a6fd8', 'house')
const WS = 0.0088
const hs = (a: string, w: number, h: number): [string, [number, number]] => [a, [(w + 60) * WS, (h + 150) * WS]]

/** A tall column of smoke over the town and the big rainbow that replaces it. */
function WorldSky() {
  const lvl = useWorldLevel(0.5)
  const smokeTex = useMemo(() => svgTexture(smokePuff, 512), [])
  const rbTex = useMemo(() => svgTexture(rainbow, 1024), [])
  const puffs = useRef<(THREE.Mesh | null)[]>([])
  const rb = useRef<THREE.Mesh>(null!)
  const mats = useMemo(() => Array.from({ length: 9 }, () => new THREE.MeshBasicMaterial({ map: smokeTex, transparent: true, depthWrite: false, color: '#b8a8c8', opacity: 0 })), [smokeTex])
  const rbMat = useMemo(() => new THREE.MeshBasicMaterial({ map: rbTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), [rbTex])
  const O = useMemo(() => new THREE.Vector3(7.35, 6.3, -9.7), [])
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useFrame((s) => {
    const l = lvl()
    const t = s.clock.elapsedTime
    const amount = (0.4 + 0.6 * fire.level) * (1 - clamp01(fire.out * 1.1)) * clamp01(l * 2)
    mats.forEach((m, i) => {
      const c = (t / 9 + i / mats.length) % 1
      const p = puffs.current[i]
      if (!p) return
      p.visible = amount > 0.02
      p.position.set(O.x - c * 3.0 + Math.sin(c * 6 + i) * 0.4, O.y + c * 6, O.z)
      p.scale.setScalar((1.2 + c * 4.6) * Math.max(0.01, amount))
      m.opacity = Math.sin(Math.PI * c) ** 0.8 * 0.85 * amount
    })
    const k = ease(fire.out * 1.2 - 0.1) * clamp01(l * 2)
    rb.current.visible = k > 0.01
    rb.current.scale.setScalar(Math.max(0.001, k))
  })
  return (
    <>
      {mats.map((m, i) => (
        <mesh key={i} ref={(p) => void (puffs.current[i] = p)} material={m} visible={false} renderOrder={3}>
          <planeGeometry args={[2.2, 1.8]} />
        </mesh>
      ))}
      <mesh ref={rb} material={rbMat} position={[1.5, 7.2, -15]} visible={false}>
        <planeGeometry args={[28, 14]} />
      </mesh>
    </>
  )
}

export function FireWorld() {
  const [h1, h1s] = hs(H1, 270, 500)
  const [h2, h2s] = hs(H2, 250, 600)
  const [h3, h3s] = hs(H3, 240, 650)
  const [h4, h4s] = hs(H4, 250, 590)
  const [h5, h5s] = hs(H5, 260, 640)
  const [h6, h6s] = hs(H6, 300, 470)
  const cloudA = useMemo(() => cloud('#ffd9c4', '#f0b4a4'), [])
  return (
    <group>
      {/* far away */}
      <Cutout art={farTown} size={[46, 7.8]} at={[0, 0, -18.5]} delay={0} shadow={false} emissive={0.25} />
      <Cutout art={cloudA} size={[6, 3]} at={[-9, 11, -19]} delay={0.1} shadow={false} emissive={0.4} />
      <Cutout art={cloudA} size={[5, 2.5]} at={[7, 13, -20]} delay={0.12} shadow={false} emissive={0.4} />
      <Cutout art={waterTower} size={[4.2, 10]} at={[-9.6, 0, -14.5]} delay={0.2} px={1024} />
      <WorldSky />
      {/* the street */}
      <Cutout art={worldRoad} size={[40, 10.6]} at={[0, 0.006, -1.2]} flat delay={0} shadow={false} px={2048} />
      {/* the row of houses */}
      <Cutout art={h6} size={h6s} at={[-11.8, 0, -10.6]} delay={0.2} px={1024} />
      <Cutout art={h1} size={h1s} at={[-8.8, 0, -10.8]} delay={0.2} px={1024} />
      <Cutout art={h2} size={h2s} at={[-5.7, 0, -10.2]} delay={0.22} px={1024} />
      <Cutout art={fireStation} size={[6.6, 7.9]} at={[-0.5, 0, -10.4]} rotY={0.03} delay={0.18} px={2048} />
      <Cutout art={worldTruck} size={[3.0, 1.7]} at={[-1.4, 0.14, -9.7]} delay={0.3} px={1536} />
      <Cutout art={bakery} size={[6.2, 7.05]} at={[5.5, 0, -10.0]} rotY={-0.04} delay={0.28} px={1536} />
      <Cutout art={h4} size={h4s} at={[10.0, 0, -10.2]} delay={0.26} px={1024} />
      <Cutout art={h3} size={h3s} at={[13.0, 0, -10.6]} delay={0.24} px={1024} />
      <Cutout art={h5} size={h5s} at={[16.0, 0, -10.4]} delay={0.3} px={1024} />
      {/* greenery and street furniture */}
      <Cutout art={townTree('#5fae55', '#7fcf6a', '#e8322b')} size={[3.0, 3.8]} at={[3.2, 0, -8.0]} delay={0.34} px={1024} />
      <Cutout art={townTree('#4f9d4a', '#6cc06a')} size={[3.2, 4.0]} at={[-3.6, 0, -8.0]} delay={0.36} px={1024} />
      <Cutout art={kitTree()} size={[2.4, 3.3]} at={[8.4, 0, -8.3]} delay={0.38} />
      <Cutout art={hedge} size={[6, 1.0]} at={[-7.4, 0, -8.6]} delay={0.3} shadow={false} />
      <Cutout art={hedge} size={[6, 1.0]} at={[10.4, 0, -8.5]} delay={0.4} shadow={false} />
      <Cutout art={lamp} size={[0.9, 4.4]} at={[6.4, 0, -3.0]} delay={0.42} emissive={0.4} shadow={false} />
      <Cutout art={hydrant} size={[1.2, 1.8]} at={[7.4, 0, -3.3]} delay={0.46} tap="jump" />
      <Cutout art={cone} size={[0.9, 1.26]} at={[8.6, 0, -4.2]} delay={0.48} tap="jump" />
    </group>
  )
}

export const fireSpread: SpreadDef = {
  id: 'firefighter',
  world: 'firetown',
  palette: palettes.fire,
  outfit: 'firefighter',
  heading: 'Fire rescue!',
  beats: 1,
  text: [
    '*Ding-ding-ding!* Smoke over the bakery! Firefighter Milo jumped on the big red *fire truck.* Quick, aim the *hose!*',
    { after: 1, text: '*SPLOOSH!* The fire went out. The baker cheered, and a *rainbow* popped up!' },
  ],
  textCard: { x: 0, y: 0, w: 0.75 },
  spreadArt: fireSpreadArt,
  Popups: FirePopups,
  miloReact: 'jump',
}
