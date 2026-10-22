import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { svgDoc } from '../art/texture'
import { useSvgTexture } from '../art/useSvgTexture'
import { INK } from '../art/style'
import { HAND_AFTER, handTurn, idleSecs, lastInputAt, newHintId, wantHand } from './hint'
import { useProgress } from '../progress'

/* A friendly white cartoon glove, pointing down; the fingertip is the bottom centre. */
const HAND_W = 220
const HAND_H = 284
const handArt = svgDoc(
  HAND_W,
  HAND_H,
  `<g stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
    <rect x="64" y="8" width="108" height="46" rx="16" fill="#ffd34d"/>
    <path d="M84 20 L84 42 M104 20 L104 42 M124 20 L124 42 M144 20 L144 42" stroke="#e0a92a" stroke-width="5"/>
    <path d="M58 72 Q56 50 80 50 L158 50 Q184 52 182 78 L180 150 Q178 186 146 188 L92 188 Q60 184 58 150 Z" fill="#fff"/>
    <ellipse cx="56" cy="130" rx="21" ry="40" transform="rotate(-24 56 130)" fill="#fff"/>
    <circle cx="176" cy="150" r="17" fill="#fff"/>
    <circle cx="164" cy="170" r="18" fill="#fff"/>
    <circle cx="146" cy="182" r="18" fill="#fff"/>
    <rect x="91" y="104" width="38" height="172" rx="19" fill="#fff"/>
    <path d="M100 236 Q110 241 120 236" fill="none" stroke="#c9bfb4" stroke-width="5"/>
    <path d="M100 196 Q110 201 120 196" fill="none" stroke="#c9bfb4" stroke-width="5"/>
    <path d="M80 70 Q120 64 160 70" fill="none" stroke="#e3ddd6" stroke-width="6"/>
  </g>`,
  { cut: 5 },
)

type V3 = [number, number, number]
export type HandMode = 'drag' | 'tap'

/**
 * A show-me hand. Once nobody has touched anything for a few seconds it
 * appears and demonstrates the move:
 *  - 'drag': presses at `from`, carries to `to`, waits `dwell` s, lets go
 *  - 'tap':  taps `from` twice
 * `onMove(k, press)` is called every frame while it runs (k 0..1 = how far
 * along the carry, back to 0 when it is over) so the owner can move the real
 * piece with it. Any touch stops it at once. Only one hand plays at a time.
 * All positions are in the parent's space.
 */
export function HintHand({
  mode,
  from,
  to,
  want,
  dwell = 0.35,
  size = 0.25,
  onMove,
}: {
  mode: HandMode
  from: () => V3
  to?: () => V3
  want: () => boolean
  dwell?: number
  size?: number
  onMove?: (k: number, press: number) => void
}) {
  const id = useMemo(() => newHintId(), [])
  useEffect(() => () => wantHand(id, false), [id])
  const tex = useSvgTexture(handArt, 512)
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0 }),
    [tex],
  )
  useEffect(() => () => mat.dispose(), [mat])
  const g = useRef<THREE.Group>(null!)
  const hand = useRef<THREE.Group>(null!)
  const st = useMemo(() => ({ phase: 'off' as 'off' | 'run' | 'abort', t: 0, wantT: 0, rest: 99, start: 0, k: 0, press: 0, hk: 0 }), [])
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])

  // timings
  const CARRY0 = 0.65
  const CARRY1 = 1.95
  const end = mode === 'tap' ? 1.8 : CARRY1 + dwell + 0.75

  useFrame((_, dt) => {
    const w = want()
    wantHand(id, w)
    st.wantT = w ? st.wantT + dt : 0
    st.rest += dt

    if (st.phase === 'off') {
      if (w && handTurn(id) && st.wantT > HAND_AFTER && idleSecs() > HAND_AFTER && st.rest > 3.2 && !useProgress.getState().writing) {
        st.phase = 'run'
        st.t = 0
        st.hk = 0
        st.start = performance.now()
      }
    } else if (st.phase === 'run') {
      if (!w || lastInputAt() > st.start) st.phase = 'abort'
    }

    let op = 0
    let lift = 0
    let handK = 0
    if (st.phase === 'run') {
      const t = (st.t += dt)
      op = Math.min(1, t / 0.35) * (1 - THREE.MathUtils.clamp((t - (end - 0.4)) / 0.4, 0, 1))
      lift = Math.max(0, 1 - t / 0.45) * 0.22
      if (mode === 'tap') {
        const tap = (t0: number) => Math.max(0, Math.sin(THREE.MathUtils.clamp((t - t0) / 0.28, 0, 1) * Math.PI))
        st.press = Math.max(tap(0.5), tap(0.95))
        st.k = 0
        if (t > 1.3) lift = (t - 1.3) * 0.3
      } else {
        const c = THREE.MathUtils.clamp((t - CARRY0) / (CARRY1 - CARRY0), 0, 1)
        const carry = c * c * (3 - 2 * c)
        const back = THREE.MathUtils.clamp((t - CARRY1 - dwell) / 0.7, 0, 1)
        st.k = carry * (1 - back * back * (3 - 2 * back))
        handK = st.hk = carry
        st.press = THREE.MathUtils.clamp((t - 0.4) / 0.2, 0, 1) * (1 - THREE.MathUtils.clamp((t - CARRY1 - dwell) / 0.15, 0, 1))
        if (t > CARRY1 + dwell) lift = (t - CARRY1 - dwell) * 0.35
      }
      if (t >= end) {
        st.phase = 'off'
        st.rest = 0
        st.k = 0
        st.press = 0
      }
      onMove?.(st.k, st.press)
    } else if (st.phase === 'abort') {
      mat.opacity = Math.max(0, mat.opacity - dt * 5)
      st.k = Math.max(0, st.k - dt * 2.2)
      st.press = 0
      onMove?.(st.k, 0)
      if (st.k <= 0 && mat.opacity <= 0) {
        st.phase = 'off'
        st.rest = 0
      }
      op = mat.opacity
      handK = st.hk
    }

    if (st.phase !== 'abort') mat.opacity = op
    g.current.visible = mat.opacity > 0.01
    if (!g.current.visible) return
    a.set(...from())
    if (to && mode === 'drag') a.lerp(b.set(...to()), handK)
    g.current.position.copy(a)
    g.current.position.y += lift - st.press * 0.02
    hand.current.scale.set(size * (1 + st.press * 0.04), size * (1 - st.press * 0.1), 1)
  })

  return (
    <group ref={g} visible={false}>
      <group ref={hand} rotation={[-0.25, 0, 0.12]}>
        <mesh material={mat} position={[0, HAND_H / HAND_W / 2, 0.02]} renderOrder={30} raycast={() => null}>
          <planeGeometry args={[1, HAND_H / HAND_W]} />
        </mesh>
      </group>
    </group>
  )
}
