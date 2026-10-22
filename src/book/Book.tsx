import { useNearSpreads } from '../store'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BOARD_T, LEAF_GAP, PAGE_H, PAGE_W } from '../config'
import { anim } from '../state'
import { spreads, cover } from '../story/spreads'
import { bendLeaf, createLeafGeometry } from './leafGeometry'
import { blankPageTexture, coverTexture, leftPageTexture, rightPageTexture } from './pageTextures'
import { SpreadProvider } from '../popup/SpreadContext'
import { addGrain } from '../art/texture'
import { StoryCard } from './StoryCard'

const N = spreads.length
/** the last open spread (spreads after it are closed views, e.g. the back cover) */
const LAST = spreads.reduce((m, s, i) => (s.closed ? m : i), 0)
const BACK = spreads.find((s) => s.closed === 'back')
const COVER_W = PAGE_W + 0.07
const COVER_H = PAGE_H + 0.14
const CLOTH = '#b02e28'

const rightY = (i: number) => BOARD_T + (N - i) * LEAF_GAP
const leftY = (i: number) => BOARD_T + i * LEAF_GAP

function paperMat(map: THREE.Texture, side: THREE.Side) {
  // matte paper: Lambert looks the same as Standard at roughness 0.9 and costs much less per pixel
  return addGrain(new THREE.MeshLambertMaterial({ map, side }), map)
}

/** One paper leaf (front = right page of spread i, back = left page of spread i+1). */
function Leaf({ i }: { i: number }) {
  const geo = useMemo(createLeafGeometry, [])
  const [front, back] = useMemo(() => {
    const f = rightPageTexture(spreads[i], i)
    const b = i + 1 < N && !spreads[i + 1].closed ? leftPageTexture(spreads[i + 1], i + 1, true) : blankPageTexture(true, i)
    return [paperMat(f, THREE.FrontSide), paperMat(b, THREE.BackSide)]
  }, [i])
  const last = useRef(-1)
  const dir = useRef<1 | -1>(1)
  useFrame(() => {
    const p = anim.leaves[i].p
    if (p === last.current && !(i === LAST && anim.back.v > 0 && anim.back.v < 1)) return
    if (last.current >= 0 && p !== last.current) dir.current = p > last.current ? 1 : -1
    // closing the back of the book: the last leaf travels stiffly with the board
    const stiff = i === LAST && anim.back.v > 0.001 ? 0 : 1
    bendLeaf(geo, p, rightY(i), leftY(i), dir.current, stiff)
    last.current = p
  })
  return (
    <group>
      <mesh geometry={geo} material={front} castShadow receiveShadow />
      <mesh geometry={geo} material={back} receiveShadow />
    </group>
  )
}

/** The hard front cover — rigid, hinged at the spine. */
function Cover() {
  const ref = useRef<THREE.Group>(null!)
  const { top, inner, edge } = useMemo(() => {
    const topMap = coverTexture(cover.art, cover.title, cover.subtitle)
    const top = addGrain(new THREE.MeshStandardMaterial({ map: topMap, roughness: 0.8 }), topMap)
    const innerMap = leftPageTexture(spreads[1], 1, false)
    const inner = addGrain(new THREE.MeshStandardMaterial({ map: innerMap, roughness: 0.9 }), innerMap)
    const edge = new THREE.MeshStandardMaterial({ color: CLOTH, roughness: 0.85 })
    return { top, inner, edge }
  }, [])
  useFrame(() => {
    const p = anim.leaves[0].p
    const lift = Math.sin(p * Math.PI)
    ref.current.rotation.z = p * Math.PI
    // closed: board sits on top of the stack. open: board lies flat under the left pages.
    const top = BOARD_T + N * LEAF_GAP
    ref.current.position.y = top + (BOARD_T - top) * p + lift * 0.05
  })
  return (
    <group ref={ref}>
      <group position={[COVER_W / 2, BOARD_T / 2, 0]}>
        <mesh material={edge} castShadow receiveShadow>
          <boxGeometry args={[COVER_W, BOARD_T, COVER_H]} />
        </mesh>
        <mesh material={top} position={[0, BOARD_T / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[COVER_W - 0.01, COVER_H - 0.01]} />
        </mesh>
        {/* inside of the cover = left page of the first spread */}
        <mesh material={inner} position={[0.02, -BOARD_T / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The hard back board. It lies under the right-hand pages; at the end of the
 * story it swings over (with the last leaf) onto the left stack, showing the
 * back cover on its outside.
 */
function BackBoard() {
  const ref = useRef<THREE.Group>(null!)
  const { edge, outside } = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: CLOTH, roughness: 0.85 })
    const outMap = BACK?.cover ? coverTexture(BACK.cover.art, BACK.cover.title, BACK.cover.subtitle) : null
    const outside = addGrain(new THREE.MeshStandardMaterial({ map: outMap, color: BACK?.cover ? '#ffffff' : CLOTH, roughness: 0.8 }), outMap)
    return { edge, outside }
  }, [])
  useFrame(() => {
    const v = anim.back.v
    ref.current.rotation.z = v * Math.PI
    // flipped over, the board's outside faces up: rest it on top of the left stack
    const top = BOARD_T + (LAST + 1) * LEAF_GAP + BOARD_T + 0.004
    ref.current.position.y = top * v + Math.sin(v * Math.PI) * 0.05
  })
  return (
    <group ref={ref}>
      <group position={[COVER_W / 2, BOARD_T / 2, 0]}>
        <mesh material={edge} castShadow receiveShadow>
          <boxGeometry args={[COVER_W, BOARD_T, COVER_H]} />
        </mesh>
        <mesh material={outside} position={[0, -BOARD_T / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, Math.PI]}>
          <planeGeometry args={[COVER_W - 0.01, COVER_H - 0.01]} />
        </mesh>
      </group>
    </group>
  )
}

/** Page blocks: the visible thickness of the paper stacks, plus spine and back board. */
function Blocks() {
  const right = useRef<THREE.Mesh>(null!)
  const left = useRef<THREE.Mesh>(null!)
  const spine = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    let r = 0
    for (let i = 1; i <= LAST; i++) r += 1 - anim.leaves[i].p
    const l = LAST - r
    const rh = Math.max(0.001, (r - 0.5) * LEAF_GAP)
    const lh = Math.max(0.001, (l - 0.5) * LEAF_GAP)
    right.current.visible = r > 0.6
    left.current.visible = l > 0.6
    right.current.scale.y = rh
    right.current.position.y = BOARD_T + rh / 2
    left.current.scale.y = lh
    left.current.position.y = BOARD_T + lh / 2
    const closed = Math.max(1 - anim.leaves[0].p, anim.back.v)
    const sh = BOARD_T * 2 + N * LEAF_GAP
    spine.current.scale.y = 0.02 + closed * sh
    spine.current.position.y = spine.current.scale.y / 2
  })
  const paperEdge = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f1e6cf', roughness: 1 }), [])
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: CLOTH, roughness: 0.85 }), [])
  return (
    <group>
      <mesh ref={right} material={paperEdge} position={[PAGE_W / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[PAGE_W - 0.01, 1, PAGE_H - 0.01]} />
      </mesh>
      <mesh ref={left} material={paperEdge} position={[-PAGE_W / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[PAGE_W - 0.01, 1, PAGE_H - 0.01]} />
      </mesh>
      <mesh ref={spine} material={cloth} position={[-0.015, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 1, COVER_H]} />
      </mesh>
    </group>
  )
}

/** The book is propped up toward the reader (like resting on a lap or a stand). */
export const BOOK_TILT = 0.3

export function Book() {
  const near = useNearSpreads()
  const slide = useRef<THREE.Group>(null!)
  // the closed-at-the-back book lies left of the spine: slide it right into view
  useFrame(() => {
    slide.current.position.x = anim.back.slide * COVER_W
  })
  return (
    <group ref={slide}>
    <group rotation={[BOOK_TILT, 0, 0]} position={[0, Math.sin(BOOK_TILT) * (PAGE_H / 2 + 0.07) + 0.01, 0.15]}>
      <Cover />
      {spreads.slice(1, LAST + 1).map((_, k) => (
        <Leaf key={k + 1} i={k + 1} />
      ))}
      <Blocks />
      <BackBoard />
      {spreads.map((s, i) =>
        s.Popups && near(i) ? (
          <SpreadProvider key={s.id} index={i} baseY={BOARD_T + Math.max(i, N - i) * LEAF_GAP + 0.003}>
            <s.Popups />
            {s.text?.length ? <StoryCard spread={s} /> : null}
          </SpreadProvider>
        ) : null,
      )}
    </group>
    </group>
  )
}
