import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { paperMaterial, svgTexture } from '../art/texture'
import { anim, type Outfit } from '../state'
import { useBook } from '../store'
import { bus } from '../bus'
import * as art from './art'

const S = 0.002 // body px → units
const HS = 0.0024 // head px → units

function Plane({ svg, w, h, px = 512, position = [0, 0, 0], visible = true }: {
  svg: string
  w: number
  h: number
  px?: number
  position?: [number, number, number]
  visible?: boolean
}) {
  const mat = useMemo(() => paperMaterial(svgTexture(svg, px)), [svg, px])
  return (
    <mesh material={mat} position={position} castShadow visible={visible}>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

/**
 * Milo as a rigged paper doll standing beside the book. He idles (breathes,
 * sways, blinks), reacts when pages open or pop-ups are tapped, and twirls
 * into a new outfit when the story needs one.
 */
export function Milo({ position = [-2.5, 0, 0.45] as [number, number, number], rotY = 0.38 }) {
  const outfit = useBook((s) => s.outfit)
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const eyes = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const pose = useMemo(() => ({ l: 0, r: 0, jump: 0, tilt: 0, squash: 0 }), [])
  const blink = useRef({ next: 2, t: -1 })

  const svgs = useMemo(
    () => ({
      head: art.miloHead(),
      eyes: art.miloEyes(),
      body: art.miloBody(),
      arm: art.miloArm(),
      hardHat: art.hardHat(),
      fireHelmet: art.fireHelmet(),
      fireCoat: art.fireCoat(),
      vest: art.safetyVest(),
      belt: art.toolBelt(),
      cape: art.cape(),
      mask: art.heroMask(),
      emblem: art.heroEmblem(),
      pjs: art.pajamas(),
    }),
    [],
  )

  // reactions
  useEffect(() => {
    const play = (kind: unknown) => {
      gsap.killTweensOf(pose)
      const tl = gsap.timeline()
      switch (kind) {
        case 'wave':
          tl.to(pose, { r: 2.5, duration: 0.35, ease: 'power2.out' })
            .to(pose, { r: 2.1, duration: 0.18, repeat: 4, yoyo: true, ease: 'sine.inOut' })
            .to(pose, { r: 0, duration: 0.5, ease: 'power2.inOut' })
          break
        case 'cheer':
          tl.to(pose, { l: 2.6, r: 2.6, jump: 1, squash: 0, duration: 0.3, ease: 'power2.out' })
            .to(pose, { jump: 0, duration: 0.45, ease: 'bounce.out' })
            .to(pose, { jump: 0.6, duration: 0.22, ease: 'power2.out' })
            .to(pose, { jump: 0, duration: 0.4, ease: 'bounce.out' })
            .to(pose, { l: 0, r: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.2')
          break
        case 'point':
          tl.to(pose, { r: 1.55, tilt: -0.12, duration: 0.4, ease: 'back.out(2)' })
            .to(pose, { r: 1.45, duration: 0.25, repeat: 3, yoyo: true })
            .to(pose, { r: 0, tilt: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.6')
          break
        case 'jump':
          tl.to(pose, { squash: 1, duration: 0.12 })
            .to(pose, { squash: 0, jump: 1.2, l: 0.8, r: 0.8, duration: 0.3, ease: 'power2.out' })
            .to(pose, { jump: 0, duration: 0.55, ease: 'bounce.out' })
            .to(pose, { l: 0, r: 0, duration: 0.4 }, '-=0.3')
          break
      }
    }
    return bus.on('milo', play)
  }, [pose])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    // twirl into new outfit
    root.current.rotation.y = rotY + anim.milo.spin * Math.PI * 2
    // breathing + bounce
    const b = body.current
    b.position.y = pose.jump * 0.28
    b.scale.set(1 + pose.squash * 0.06, 1 + Math.sin(t * 2.1) * 0.012 - pose.squash * 0.08, 1)
    head.current.rotation.z = Math.sin(t * 0.8) * 0.05 + pose.tilt + state.pointer.x * 0.06
    head.current.rotation.x = -state.pointer.y * 0.05
    armL.current.rotation.z = -(0.14 + Math.sin(t * 1.3) * 0.035) - pose.l
    armR.current.rotation.z = 0.14 + Math.sin(t * 1.3 + 1) * 0.035 + pose.r
    // blink
    const bl = blink.current
    if (bl.t < 0 && t > bl.next) bl.t = 0
    if (bl.t >= 0) {
      bl.t += dt
      const k = bl.t / 0.16
      eyes.current.scale.y = k < 1 ? Math.max(0.08, Math.abs(1 - 2 * k)) : 1
      if (k >= 1) {
        bl.t = -1
        bl.next = t + 2 + Math.random() * 3.5
      }
    }
  })

  const onTap = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    bus.emit('sfx', 'giggle')
    bus.emit('milo', ['jump', 'cheer', 'wave'][Math.floor(Math.random() * 3)])
  }

  const is = (...o: Outfit[]) => o.includes(outfit)
  const neckY = 1.04
  const headC = 0.358

  return (
    <group ref={root} position={position} onPointerDown={onTap}>
      <group ref={body}>
        {/* cape behind everything */}
        <Plane svg={svgs.cape} w={480 * S} h={600 * S} position={[0, 0.5, -0.03]} visible={is('superhero')} />
        {/* arms (pivot at the shoulder) */}
        <group ref={armL} position={[-0.164, 0.93, -0.012]}>
          <Plane svg={svgs.arm} w={0.24} h={0.6} px={256} position={[0, -0.24, 0]} />
        </group>
        <group ref={armR} position={[0.164, 0.93, -0.012]} scale={[-1, 1, 1]}>
          <Plane svg={svgs.arm} w={0.24} h={0.6} px={256} position={[0, -0.24, 0]} />
        </group>
        <Plane svg={svgs.body} w={0.8} h={1.12} position={[0, 0.56, 0]} />
        <Plane svg={svgs.vest} w={0.8} h={1.12} position={[0, 0.56, 0.006]} visible={is('hardhat')} />
        <Plane svg={svgs.fireCoat} w={0.8} h={1.12} position={[0, 0.56, 0.006]} visible={is('firefighter')} />
        <Plane svg={svgs.pjs} w={0.8} h={1.12} position={[0, 0.56, 0.006]} visible={is('pajamas')} />
        <Plane svg={svgs.belt} w={0.8} h={0.38} position={[0, 0.51, 0.012]} visible={is('tools', 'hardhat')} />
        <Plane svg={svgs.emblem} w={0.22} h={0.22} px={256} position={[0, 0.74, 0.012]} visible={is('superhero')} />
        {/* head (pivot at the neck) */}
        <group ref={head} position={[0, neckY, 0.02]}>
          <Plane svg={svgs.head} w={400 * HS} h={420 * HS} px={768} position={[0, headC, 0]} />
          <Plane svg={svgs.mask} w={300 * HS} h={110 * HS} px={256} position={[0, headC - 0.0, 0.004]} visible={is('superhero')} />
          <group ref={eyes} position={[0, headC - 0.012, 0.008]}>
            <Plane svg={svgs.eyes} w={260 * HS} h={100 * HS} px={512} />
          </group>
          <Plane svg={svgs.hardHat} w={400 * HS} h={230 * HS} position={[0, headC + 0.348, 0.012]} visible={is('hardhat')} />
          <Plane svg={svgs.fireHelmet} w={420 * HS} h={260 * HS} position={[0, headC + 0.33, 0.012]} visible={is('firefighter')} />
        </group>
      </group>
    </group>
  )
}
