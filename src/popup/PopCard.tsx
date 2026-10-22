import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { anim } from '../state'
import { windowed } from '../anim/ease'
import { paperMaterial } from '../art/texture'
import { useSvgTexture } from '../art/useSvgTexture'
import { useSpread } from './SpreadContext'
import { Piece, type PieceProps } from './Piece'

/**
 * A pop-up piece standing on the book. `at` is [x, z] on the open spread
 * (x: −1.6 … 1.6 across both pages, z: −1.1 far edge … 1.1 near edge).
 * `delay` (0 … 0.55) staggers it within the spread's pop-up sequence.
 */
export function PopCard(props: Omit<PieceProps, 'position'> & { at: [number, number]; y?: number; delay?: number }) {
  const { index, baseY } = useSpread()
  const { at, y = 0, delay = 0, contact, ...rest } = props
  const position = useMemo(() => [at[0], baseY + y, at[1]] as [number, number, number], [at[0], at[1], baseY, y])
  const level = useMemo(() => () => windowed(anim.raise[index].v, delay), [index, delay])
  return (
    <Piece
      {...rest}
      contact={contact ?? (y === 0 && !rest.escape && !rest.flat)}
      position={position}
      level={level}
    />
  )
}

/**
 * A sub-part attached to a piece (e.g. the excavator's arm). Pivot is given in
 * the parent piece's space; `animate` runs every frame for custom motion.
 */
export function Part({
  art, size, pivot = [0, 0, 0], offset = [0, 0], z = 0.004, px = 512, animate, children, emissive,
}: {
  art: string
  size: [number, number]
  /** pivot point in parent space */
  pivot?: [number, number, number]
  /** where the art's centre sits relative to the pivot */
  offset?: [number, number]
  z?: number
  px?: number
  emissive?: number
  animate?: (g: THREE.Group, t: number) => void
  children?: ReactNode
}) {
  const tex = useSvgTexture(art, px)
  const mat = useMemo(() => paperMaterial(tex, { emissive }), [tex, emissive])
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => animate?.(ref.current, s.clock.elapsedTime))
  return (
    <group ref={ref} position={[pivot[0], pivot[1], pivot[2] + z]}>
      <mesh material={mat} position={[offset[0], offset[1], 0]} castShadow receiveShadow>
        <planeGeometry args={size} />
      </mesh>
      {children}
    </group>
  )
}
