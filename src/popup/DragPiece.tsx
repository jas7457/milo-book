import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { anim, ui } from '../state'
import { windowed } from '../anim/ease'
import { bus } from '../bus'
import { useSpread } from './SpreadContext'
import { Piece, type PieceProps } from './Piece'

/* A soft glowing ring, shared by every drop target. */
let ringTex: THREE.CanvasTexture | null = null
function ring() {
  if (ringTex) return ringTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 126)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  ctx.setLineDash([26, 18])
  ctx.lineWidth = 7
  ctx.strokeStyle = 'rgba(255,255,255,1)'
  ctx.beginPath()
  ctx.arc(128, 128, 84, 0, Math.PI * 2)
  ctx.stroke()
  ringTex = new THREE.CanvasTexture(c)
  return ringTex
}

export type DragState = {
  /** 0..1 progress of a hold (e.g. drilling) */
  progress: number
  /** true while the piece is held over its target */
  over: boolean
  /** true once the job is done (until the page is turned away) */
  done: boolean
  /** true while held */
  held: boolean
}

/**
 * A pop-up piece the reader can pick up and move across the page, then drop on
 * (or hold over) a target. `at` and `target.at` are [x, z] on the spread, like
 * PopCard.
 *  - `hold` 0: dropping it on the target finishes the job (e.g. a battery).
 *  - `hold` > 0: keep it over the target for that many seconds (e.g. a drill).
 *  - `consume`: the piece is used up (it shrinks into the target).
 * The returned `state` object is live (read it in useFrame for effects).
 */
export function DragPiece({
  at,
  delay = 0,
  target,
  hold = 0,
  consume = false,
  onDone,
  onHolding,
  state: ext,
  color = '#ffe27a',
  ...piece
}: Omit<PieceProps, 'position'> & {
  at: [number, number]
  delay?: number
  target: { at: [number, number]; r?: number; y?: number }
  hold?: number
  consume?: boolean
  onDone?: () => void
  /** called every frame while holding over the target, with progress 0..1 */
  onHolding?: (p: number) => void
  state?: DragState
  /** colour of the target ring */
  color?: string
}) {
  const { index, baseY } = useSpread()
  const { camera, gl } = useThree()
  const st = useMemo<DragState>(() => ext ?? { progress: 0, over: false, done: false, held: false }, [ext])
  const pos = useMemo(() => ({ x: at[0], z: at[1], lift: 0, s: 1, tilt: 0 }), [at[0], at[1]])
  const outer = useRef<THREE.Group>(null!)
  const mover = useRef<THREE.Group>(null!)
  const ringM = useRef<THREE.Mesh>(null!)
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: ring(), color, transparent: true, depthWrite: false, opacity: 0 }),
    [color],
  )
  const level = useMemo(() => () => windowed(anim.raise[index].v, delay), [index, delay])
  const r = target.r ?? 0.3
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const n = useMemo(() => new THREE.Vector3(), [])
  const grab = useRef<{ dx: number; dz: number } | null>(null)
  const sfxT = useRef(0)

  /** pointer → point on the page (in the book's local space) */
  const pagePoint = (cx: number, cy: number) => {
    const parent = outer.current?.parent
    if (!parent) return null
    const rect = gl.domElement.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1), camera)
    parent.updateWorldMatrix(true, false)
    n.set(0, 1, 0).transformDirection(parent.matrixWorld)
    v.set(0, baseY, 0).applyMatrix4(parent.matrixWorld)
    plane.setFromNormalAndCoplanarPoint(n, v)
    const hit = ray.ray.intersectPlane(plane, new THREE.Vector3())
    return hit ? parent.worldToLocal(hit) : null
  }

  const goHome = () => {
    gsap.to(pos, { x: at[0], z: at[1], lift: 0, tilt: 0, duration: 0.6, ease: 'back.out(1.6)' })
  }

  const finish = () => {
    st.done = true
    st.over = false
    grab.current = null
    st.held = false
    ui.dragging = false
    document.body.style.cursor = ''
    onDone?.()
    if (consume) {
      gsap.to(pos, { x: target.at[0], z: target.at[1], lift: target.y ?? 0.25, duration: 0.25, ease: 'power2.out' })
      gsap.to(pos, { s: 0, duration: 0.3, delay: 0.2, ease: 'back.in(2)' })
    } else goHome()
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!grab.current) return
      const p = pagePoint(e.clientX, e.clientY)
      if (!p) return
      // keep it on the open book
      pos.x = THREE.MathUtils.clamp(p.x + grab.current.dx, -1.5, 1.5)
      pos.z = THREE.MathUtils.clamp(p.z + grab.current.dz, -1.0, 1.05)
    }
    const up = () => {
      if (!grab.current) return
      grab.current = null
      st.held = false
      ui.dragging = false
      document.body.style.cursor = ''
      if (!st.done && hold === 0 && st.over) finish()
      else {
        st.over = false
        if (!st.done) st.progress = 0
        goHome()
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  })

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (st.done || level() < 0.99) return
    e.stopPropagation()
    ui.grab = true
    ui.dragging = true
    gsap.killTweensOf(pos)
    const p = pagePoint(e.nativeEvent.clientX, e.nativeEvent.clientY)
    grab.current = { dx: p ? pos.x - p.x : 0, dz: p ? pos.z - p.z : 0 }
    st.held = true
    bus.emit('sfx', 'pop')
    gsap.to(pos, { lift: 0.14, tilt: 0.25, duration: 0.2, ease: 'power2.out' })
    document.body.style.cursor = 'grabbing'
  }

  useFrame((s, dt) => {
    const l = level()
    // page turned away: put everything back for next time
    if (l < 0.5 && (st.done || pos.s !== 1)) {
      gsap.killTweensOf(pos)
      Object.assign(st, { progress: 0, over: false, done: false, held: false })
      Object.assign(pos, { x: at[0], z: at[1], lift: 0, s: 1, tilt: 0 })
    }
    const m = mover.current
    m.position.set(pos.x - at[0], pos.lift, pos.z - at[1])
    m.scale.setScalar(Math.max(0.0001, pos.s))
    m.rotation.x = -pos.tilt * 0.3
    m.visible = pos.s > 0.001

    // over the target?
    const d = Math.hypot(pos.x - target.at[0], pos.z - target.at[1])
    st.over = !!grab.current && !st.done && d < r
    if (st.over && hold > 0) {
      // working: shake in the hand
      m.position.x += (Math.random() - 0.5) * 0.014
      m.position.y += (Math.random() - 0.5) * 0.01
      m.rotation.z = (Math.random() - 0.5) * 0.06
      st.progress = Math.min(1, st.progress + dt / hold)
      onHolding?.(st.progress)
      sfxT.current -= dt
      if (sfxT.current <= 0) {
        bus.emit('sfx', 'drill')
        sfxT.current = 0.42
      }
      if (st.progress >= 1) finish()
    } else {
      sfxT.current = 0
      m.rotation.z = 0
    }

    // target ring: a gentle pulse, brighter while you carry the piece
    const t = s.clock.elapsedTime
    const show = st.done ? 0 : l >= 1 ? (grab.current ? (st.over ? 1 : 0.75) : 0.35 + Math.sin(t * 3) * 0.15) : 0
    ringMat.opacity += (show - ringMat.opacity) * Math.min(1, dt * 8)
    const k = r * 2.3 * (1 + Math.sin(t * 4) * 0.05 + (st.over ? 0.12 : 0))
    ringM.current.scale.set(k, k, 1)
    ringM.current.rotation.z = t * 0.4
    ringM.current.visible = ringMat.opacity > 0.01
  })


  return (
    <>
      <mesh
        ref={ringM}
        material={ringMat}
        position={[target.at[0], baseY + 0.004, target.at[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={outer} position={[at[0], 0, at[1]]}>
        <group ref={mover}>
          <Piece {...piece} tap="none" onGrab={down} position={[0, baseY, 0]} level={level} />
        </group>
      </group>
    </>
  )
}
