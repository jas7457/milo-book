import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { paperMaterial } from '../art/texture'
import { useSvgTexture } from '../art/useSvgTexture'
import { easeInOut, easeOutBack } from '../anim/ease'
import { bus } from '../bus'
import { ui } from '../state'
import { Glow } from './Glow'
import { HintHand } from './HintHand'

export type Hinge = 'back' | 'front' | 'spring' | 'rise' | 'drop' | 'left' | 'right'
export type Idle = 'none' | 'bob' | 'sway' | 'spin' | 'float' | 'flicker' | 'rock' | 'drift'
export type Tap = 'jump' | 'wiggle' | 'spin' | 'none'
export type Escape = {
  /** where the piece flies to (same space as `position`) */
  to: [number, number, number]
  arc?: number
  scale?: number
  /** seconds to wait after fully popped up */
  wait?: number
  duration?: number
  spin?: number
  /**
   * Bus event that sends the piece flying (e.g. a pull-tab id). Each event
   * toggles: out into the world, then back into the book.
   */
  on?: string
}

export type PieceProps = {
  art: string
  /** a ready-made texture instead of SVG art (e.g. the canvas story card) */
  map?: THREE.Texture
  /** width, height in world units; the pivot is the bottom-centre of the art */
  size: [number, number]
  position: [number, number, number]
  rotY?: number
  hinge?: Hinge
  /** final lean back (radians) */
  lean?: number
  idle?: Idle
  idleAmp?: number
  idleSpeed?: number
  tap?: Tap
  onTap?: () => void
  /** raw pointer-down on the piece (used by DragPiece to pick it up) */
  onGrab?: (e: ThreeEvent<PointerEvent>) => void
  /**
   * "Touch me!": a pulsing glow around the piece, a little wiggle now and then
   * and (for tap pieces) a show-me hand when the reader is idle. Pass a
   * function to switch it off once the job is done, e.g. `hint={() => !dug}`.
   */
  hint?: boolean | (() => boolean)
  escape?: Escape
  emissive?: number
  px?: number
  shadow?: boolean
  /** flat on the ground / page instead of standing up */
  flat?: boolean
  /**
   * V-fold: the art is folded down its vertical centre line and both halves
   * swing forward by this angle (radians) once open, like a real pop-up glued
   * across the gutter. Closed, the halves are pressed together.
   */
  vfold?: number
  /** soft contact shadow on the surface under the piece (default: on unless flat) */
  contact?: boolean
  children?: ReactNode
}

/* A soft radial blob, shared by every contact shadow. */
let blobTex: THREE.CanvasTexture | null = null
function blob() {
  if (blobTex) return blobTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.6)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  blobTex = new THREE.CanvasTexture(c)
  return blobTex
}

function halfPlane(w: number, h: number, half: 0 | 1) {
  const g = new THREE.PlaneGeometry(w / 2, h)
  const uv = g.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.5 + half * 0.5)
  return g
}

/**
 * A die-cut paper piece that folds up on its bottom edge. Its 0..1 `level`
 * comes from whoever owns it (a book spread or a world).
 */
export function Piece(props: PieceProps & { level: () => number }) {
  const {
    art, size, position, rotY = 0, hinge = 'back', lean = 0, idle = 'none', idleAmp = 1, idleSpeed = 1,
    tap = 'jump', onTap, onGrab, escape, emissive, px = 768, map, shadow = true, flat = false, level, children, vfold,
    contact = !flat, hint,
  } = props
  const [w, h] = size
  const tex = useSvgTexture(art, px, map)
  const mat = useMemo(() => paperMaterial(tex, { emissive }), [tex, emissive])
  const outer = useRef<THREE.Group>(null!)
  const hingeG = useRef<THREE.Group>(null!)
  const idleG = useRef<THREE.Group>(null!)
  const tapS = useMemo(() => ({ y: 0, rz: 0, ry: 0, s: 1 }), [])
  const esc = useRef(-1)
  const seed = useMemo(() => Math.random() * 100, [])
  const base = useMemo(() => new THREE.Vector3(...position), [position])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmp2 = useMemo(() => new THREE.Vector3(), [])
  const halves = useMemo(() => (vfold != null ? [halfPlane(w, h, 0), halfPlane(w, h, 1)] : null), [vfold, w, h])
  const leftH = useRef<THREE.Group>(null!)
  const rightH = useRef<THREE.Group>(null!)
  const shadowM = useRef<THREE.Mesh>(null!)
  const shadowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: blob(),
        color: '#2a1a0c',
        transparent: true,
        depthWrite: false,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [],
  )
  const armed = useRef(false)
  const hintOn = useMemo(
    () => () =>
      !!(typeof hint === 'function' ? hint() : hint) && level() >= 0.999 && !!outer.current?.visible && esc.current <= 0,
    [hint, level],
  )
  useEffect(() => {
    if (!escape?.on) return
    return bus.on('pull', (id) => {
      if (id === escape.on && level() >= 0.999) armed.current = !armed.current
    })
  }, [escape?.on, level])

  useFrame((state, dt) => {
    const l = level()
    const g = outer.current
    const vis = l > 0.002
    g.visible = vis
    if (!vis) {
      esc.current = escape?.on ? 0 : -(escape?.wait ?? 0.4)
      armed.current = false
      g.position.copy(base)
      g.scale.setScalar(1)
      return
    }
    const e = easeOutBack(l, 1.3)
    const hg = hingeG.current
    hg.rotation.set(0, 0, 0)
    hg.position.set(0, 0, 0)
    hg.scale.setScalar(1)
    const restX = flat ? -Math.PI / 2 : 0
    switch (hinge) {
      case 'back':
        hg.rotation.x = restX - (1 - e) * (Math.PI / 2) * (flat ? 0 : 1) - lean * e
        if (flat) hg.scale.setScalar(Math.max(0.001, e))
        break
      case 'front':
        hg.rotation.x = restX + (1 - e) * (Math.PI / 2) - lean * e
        break
      case 'left':
        hg.rotation.x = restX - lean * e
        hg.rotation.z = (1 - e) * (Math.PI / 2)
        break
      case 'right':
        hg.rotation.x = restX - lean * e
        hg.rotation.z = -(1 - e) * (Math.PI / 2)
        break
      case 'spring':
        hg.rotation.x = restX - lean
        hg.scale.setScalar(Math.max(0.001, e))
        break
      case 'rise':
        hg.rotation.x = restX - lean
        hg.position.y = -(1 - Math.min(1, e)) * h * 1.05
        break
      case 'drop':
        hg.rotation.x = restX - lean
        hg.position.y = (1 - e) * 5
        break
    }

    if (halves) {
      const closed = Math.PI / 2 - 0.04
      const a = vfold! + (closed - vfold!) * (1 - Math.min(1, e))
      leftH.current.rotation.y = a
      rightH.current.rotation.y = -a
    }

    // idle motion, faded in as the piece settles
    const t = state.clock.elapsedTime * idleSpeed + seed
    const k = Math.min(1, l) * idleAmp
    const ig = idleG.current
    ig.position.set(0, tapS.y, 0)
    ig.rotation.set(0, tapS.ry, tapS.rz)
    ig.scale.set(tapS.s, tapS.s, tapS.s)
    // "touch me": a little wiggle every few seconds
    if (hint && hintOn()) {
      const ph = (state.clock.elapsedTime + seed) % 3.6
      if (ph < 0.6) {
        const q = ph / 0.6
        ig.rotation.z += Math.sin(q * Math.PI * 4) * 0.07 * (1 - q)
        ig.position.y += Math.sin(q * Math.PI) * 0.025
      }
    }
    switch (idle) {
      case 'bob':
        ig.position.y += Math.sin(t * 2.2) * 0.02 * k
        break
      case 'float':
        ig.position.y += (Math.sin(t * 1.3) * 0.06 + 0.03) * k
        ig.rotation.z += Math.sin(t * 0.9) * 0.05 * k
        break
      case 'sway':
        ig.rotation.z += Math.sin(t * 1.6) * 0.05 * k
        break
      case 'rock':
        ig.rotation.z += Math.sin(t * 3.2) * 0.035 * k
        ig.position.y += Math.abs(Math.sin(t * 3.2)) * 0.012 * k
        break
      case 'spin':
        ig.rotation.y += t * 0.8 * k
        break
      case 'flicker':
        ig.scale.y *= 1 + (Math.sin(t * 13) * 0.05 + Math.sin(t * 7.3) * 0.04) * k
        ig.scale.x *= 1 + Math.sin(t * 9.1) * 0.03 * k
        ig.rotation.z += Math.sin(t * 5.3) * 0.04 * k
        break
      case 'drift':
        ig.position.x += Math.sin(t * 0.35) * 0.25 * k
        ig.position.y += Math.sin(t * 0.8) * 0.04 * k
        break
    }

    // escape: leave the page and fly into the world
    if (escape) {
      const dur = escape.duration ?? 1.6
      if (l < 0.999) armed.current = false
      if (escape.on) {
        const target = armed.current ? 1 : 0
        esc.current += Math.sign(target - esc.current) * Math.min(Math.abs(target - esc.current), dt / (target ? dur : dur * 0.8))
      } else if (l >= 0.999) esc.current = Math.min(1, esc.current + dt / dur)
      else esc.current = Math.max(Math.min(esc.current, 0), esc.current - dt * 2.5)
      const s = easeInOut(Math.max(0, esc.current))
      // `to` is in world space; convert into our parent's space (the book is tilted)
      const wt = tmp2.set(...escape.to)
      g.parent?.worldToLocal(wt)
      const to = [wt.x, wt.y, wt.z]
      const arc = escape.arc ?? 1.5
      // quadratic bezier base → (mid + arc) → to
      const mx = (base.x + to[0]) / 2
      const my = Math.max(base.y, to[1]) + arc
      const mz = (base.z + to[2]) / 2
      const a = 1 - s
      tmp.set(
        a * a * base.x + 2 * a * s * mx + s * s * to[0],
        a * a * base.y + 2 * a * s * my + s * s * to[1],
        a * a * base.z + 2 * a * s * mz + s * s * to[2],
      )
      g.position.copy(tmp)
      const sc = 1 + ((escape.scale ?? 1) - 1) * s
      g.scale.setScalar(sc)
      g.rotation.y = rotY + (escape.spin ?? 0) * s
    }

    if (contact) {
      const sm = shadowM.current
      const away = escape ? 1 - Math.min(1, Math.max(0, esc.current) * 3) : 1
      shadowMat.opacity = 0.42 * Math.min(1, l * 1.4) * away
      const d = Math.min(Math.max(h * 0.28, 0.07), 1.4)
      sm.scale.set(w * 1.08 * (0.6 + 0.4 * Math.min(1, l)), d, 1)
      sm.position.set(0, 0.0015, -d * 0.22)
    }
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    // hidden pieces (other worlds, folded spreads) are still in the scene: ignore them
    if (!outer.current.visible || level() < 0.5) return
    if (onGrab) return onGrab(e)
    if (tap === 'none' && !onTap) return
    e.stopPropagation()
    bus.emit('sfx', 'pop')
    onTap?.()
    if (gsap.isTweening(tapS)) return
    if (tap === 'jump') {
      gsap.timeline()
        .to(tapS, { y: h * 0.25, s: 1.06, duration: 0.18, ease: 'power2.out' })
        .to(tapS, { y: 0, s: 1, duration: 0.5, ease: 'bounce.out' })
    } else if (tap === 'wiggle') {
      gsap.timeline()
        .to(tapS, { rz: 0.18, duration: 0.1 })
        .to(tapS, { rz: -0.15, duration: 0.14 })
        .to(tapS, { rz: 0.1, duration: 0.12 })
        .to(tapS, { rz: -0.05, duration: 0.1 })
        .to(tapS, { rz: 0, duration: 0.1 })
    } else if (tap === 'spin') {
      gsap.fromTo(tapS, { ry: 0 }, { ry: Math.PI * 2, duration: 0.8, ease: 'power2.inOut' })
    }
  }

  const ptr = {
    onPointerDown: onDown,
    onPointerOver: () => {
      if (!outer.current.visible || ui.dragging) return
      if (onGrab) document.body.style.cursor = 'grab'
      else if (tap !== 'none' || onTap) document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      if (!ui.dragging) document.body.style.cursor = ''
    },
  }

  return (
    <group ref={outer} position={position} rotation={[0, rotY, 0]}>
      <group ref={hingeG}>
        <group ref={idleG}>
          {halves ? (
            <>
              <group ref={leftH}>
                <mesh material={mat} geometry={halves[0]} position={[-w / 4, h / 2, 0]} castShadow={shadow} receiveShadow {...ptr} />
              </group>
              <group ref={rightH}>
                <mesh material={mat} geometry={halves[1]} position={[w / 4, h / 2, 0]} castShadow={shadow} receiveShadow {...ptr} />
              </group>
            </>
          ) : (
            <mesh material={mat} position={[0, h / 2, 0]} castShadow={shadow} receiveShadow {...ptr}>
              <planeGeometry args={[w, h]} />
            </mesh>
          )}
          {hint && !halves && <Glow map={tex} w={w} h={h} on={hintOn} position={[0, h / 2, flat ? 0.002 : -0.004]} />}
          {children}
        </group>
      </group>
      {hint && !onGrab && (onTap || tap !== 'none') && (
        <HintHand mode="tap" from={() => (flat ? [0, 0.02, -h / 2] : [0, h * 0.5, 0.04])} want={hintOn} />
      )}
      {contact && (
        <mesh ref={shadowM} material={shadowMat} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      )}
    </group>
  )
}
