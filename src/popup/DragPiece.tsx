import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { anim, ui } from '../state'
import { windowed } from '../anim/ease'
import { bus } from '../bus'
import { useSpread } from './SpreadContext'
import { Piece, type PieceProps } from './Piece'
import { HintHand } from './HintHand'

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
  holdSfx = 'drill',
  hint: hintProp,
  disabled,
  ...piece
}: Omit<PieceProps, 'position' | 'hint'> & {
  /**
   * When to show the "touch me" glow, the target ring and the show-me hand
   * (default: always, until done). E.g. wait for a text cue:
   * `hint={() => heard('tools', 'empty')}`. The piece can still be dragged.
   */
  hint?: () => boolean
  /** can't be picked up yet (a tap just wiggles it); no glow, ring or hand */
  disabled?: () => boolean
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
  /** sound repeated while holding over the target (default 'drill') */
  holdSfx?: string
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
  // drops are forgiving: anywhere near the ring counts (small fingers, wobbly aim)
  const reach = r * 1.4 + 0.14
  const [pw, ph] = piece.size
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const n = useMemo(() => new THREE.Vector3(), [])
  const grab = useRef<{ dx: number; dz: number; id: number } | null>(null)
  const sfxT = useRef(0)
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const hitV = useMemo(() => new THREE.Vector3(), [])
  // latest props for the window listeners (registered once)
  const props = useRef({ hold, onDone, consume, target, at })
  props.current = { hold, onDone, consume, target, at }
  const hintGate = useRef(hintProp)
  hintGate.current = hintProp
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const isOff = () => !!disabledRef.current?.()
  const hinting = () => !isOff() && (hintGate.current ? hintGate.current() : true)

  /** pointer → point on the page (in the book's local space) */
  const pagePoint = (cx: number, cy: number) => {
    const parent = outer.current?.parent
    if (!parent) return null
    const rect = gl.domElement.getBoundingClientRect()
    ray.setFromCamera(ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1), camera)
    parent.updateWorldMatrix(true, false)
    n.set(0, 1, 0).transformDirection(parent.matrixWorld)
    v.set(0, baseY, 0).applyMatrix4(parent.matrixWorld)
    plane.setFromNormalAndCoplanarPoint(n, v)
    const hit = ray.ray.intersectPlane(plane, hitV)
    return hit ? parent.worldToLocal(hit) : null
  }

  const goHome = () => {
    const [x, z] = props.current.at
    gsap.to(pos, { x, z, lift: 0, tilt: 0, duration: 0.6, ease: 'back.out(1.6)' })
  }

  /** let go of the piece (drop = false: cancelled, never counts as a drop) */
  const release = (drop: boolean) => {
    if (!grab.current) return
    grab.current = null
    st.held = false
    ui.dragging = false
    ui.grab = false
    document.body.style.cursor = ''
    if (drop && !st.done && props.current.hold === 0 && st.over && level() >= 0.99) finish()
    else {
      st.over = false
      if (!st.done) st.progress = 0
      goHome()
    }
  }

  const finish = () => {
    const { onDone, consume, target } = props.current
    st.done = true
    st.over = false
    grab.current = null
    st.held = false
    ui.dragging = false
    ui.grab = false
    document.body.style.cursor = ''
    onDone?.()
    if (consume) {
      gsap.to(pos, { x: target.at[0], z: target.at[1], lift: target.y ?? 0.25, duration: 0.25, ease: 'power2.out' })
      gsap.to(pos, { s: 0, duration: 0.3, delay: 0.2, ease: 'back.in(2)' })
    } else goHome()
  }

  // window listeners, once. Only the finger that picked the piece up moves or drops it.
  const handlers = useRef({ move: (_e: PointerEvent) => {}, up: (_e: PointerEvent) => {}, cancel: () => {} })
  handlers.current.move = (e) => {
    const g = grab.current
    if (!g || e.pointerId !== g.id) return
    // desktop: button released outside the window
    if (e.pointerType === 'mouse' && e.buttons === 0) return release(false)
    const p = pagePoint(e.clientX, e.clientY)
    if (!p) return
    // keep it on the open book
    pos.x = THREE.MathUtils.clamp(p.x + g.dx, -1.5, 1.5)
    pos.z = THREE.MathUtils.clamp(p.z + g.dz, -1.0, 1.05)
  }
  handlers.current.up = (e) => {
    if (grab.current && e.pointerId === grab.current.id) release(true)
  }
  handlers.current.cancel = () => release(false)
  useEffect(() => {
    const move = (e: PointerEvent) => handlers.current.move(e)
    const up = (e: PointerEvent) => handlers.current.up(e)
    const cancel = (e: PointerEvent) => grab.current && e.pointerId === grab.current.id && handlers.current.cancel()
    const blur = () => handlers.current.cancel()
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', blur)
      handlers.current.cancel()
      ringMat.dispose()
    }
  }, [ringMat])

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (level() < 0.99 || grab.current) return
    e.stopPropagation()
    if (st.done || isOff()) {
      // already used / not yet: a happy little wiggle
      gsap.fromTo(pos, { tilt: 0.6 }, { tilt: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      bus.emit('sfx', 'boing')
      return
    }
    ui.grab = true
    ui.dragging = true
    gsap.killTweensOf(pos)
    const p = pagePoint(e.nativeEvent.clientX, e.nativeEvent.clientY)
    grab.current = { dx: p ? pos.x - p.x : 0, dz: p ? pos.z - p.z : 0, id: e.nativeEvent.pointerId }
    st.held = true
    bus.emit('sfx', 'pop')
    gsap.to(pos, { lift: 0.14, tilt: 0.25, duration: 0.2, ease: 'power2.out' })
    document.body.style.cursor = 'grabbing'
  }

  useFrame((s, dt) => {
    const l = level()
    // the page started turning while it was held: let go
    if (grab.current && l < 0.99) release(false)
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
    st.over = !!grab.current && !st.done && d < reach
    if (st.over && hold > 0) {
      // working: shake in the hand
      m.position.x += (Math.random() - 0.5) * 0.014
      m.position.y += (Math.random() - 0.5) * 0.01
      m.rotation.z = (Math.random() - 0.5) * 0.06
      st.progress = Math.min(1, st.progress + dt / hold)
      onHolding?.(st.progress)
      sfxT.current -= dt
      if (sfxT.current <= 0) {
        bus.emit('sfx', holdSfx)
        sfxT.current = 0.42
      }
      if (st.progress >= 1) finish()
    } else {
      sfxT.current = 0
      m.rotation.z = 0
    }

    // target ring: a gentle pulse, brighter while you carry the piece
    const t = s.clock.elapsedTime
    const show = st.done ? 0 : l >= 1 ? (grab.current ? (st.over ? 1 : 0.75) : hinting() ? 0.35 + Math.sin(t * 3) * 0.15 : 0) : 0
    ringMat.opacity += (show - ringMat.opacity) * Math.min(1, dt * 8)
    const k = r * 2.3 * (1 + Math.sin(t * 4) * 0.05 + (st.over ? 0.12 : 0))
    ringM.current.scale.set(k, k, 1)
    ringM.current.rotation.z = t * 0.4
    ringM.current.visible = ringMat.opacity > 0.01
  })


  const want = () => !st.done && !grab.current && level() >= 0.999 && pos.s === 1 && hinting()
  // the show-me hand carries the real piece to the target and back
  const demo = (k: number, press: number) => {
    if (grab.current || st.done) return
    const [x, z] = props.current.at
    const [tx, tz] = props.current.target.at
    pos.x = x + (tx - x) * k
    pos.z = z + (tz - z) * k
    // rise toward the drop height as it arrives (like a real drop does)
    pos.lift = press * 0.12 + k * k * (props.current.target.y ?? 0) * 0.8
    pos.tilt = press * 0.2
  }
  const padDown = (e: ThreeEvent<PointerEvent>) => {
    if (!mover.current.visible || !outer.current.parent) return
    down(e)
  }
  /** pressing where the piece lives always picks it up, even mid-demo */
  const homeDown = (e: ThreeEvent<PointerEvent>) => {
    if (st.done || grab.current || isOff() || level() < 0.99) return
    if (Math.hypot(pos.x - at[0], pos.z - at[1]) < 0.02) return // it's here: its own pad handles it
    gsap.killTweensOf(pos)
    Object.assign(pos, { x: at[0], z: at[1], lift: 0, tilt: 0 })
    down(e)
  }

  return (
    <>
      <HintHand
        mode="drag"
        want={want}
        from={() => [at[0], baseY + ph * 0.5, at[1] + 0.05]}
        to={() => [target.at[0], baseY + ph * 0.5 + (target.y ?? 0) * 0.8, target.at[1] + 0.05]}
        dwell={hold > 0 ? 1.1 : 0.4}
        onMove={demo}
      />
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
          <Piece {...piece} tap="none" onGrab={down} hint={() => !st.done && !grab.current && hinting()} position={[0, baseY, 0]} level={level} />
          {/* a generous grab area on the page around the piece, for small fingers */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY + 0.003, 0.04]} onPointerDown={padDown}>
            <planeGeometry args={[Math.max(pw, 0.3) + 0.24, 0.42]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </group>
        {/* the piece's home spot stays grabbable while the show-me hand carries it away */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY + 0.002, 0.04]} onPointerDown={homeDown}>
          <planeGeometry args={[Math.max(pw, 0.3) + 0.24, 0.42]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </>
  )
}
