import { useImperativeHandle, useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * A fixed pool of lights that never leaves the scene.
 *
 * three.js bakes the NUMBER of lights into every shader. If a light is added,
 * removed or hidden (a spread mounting, a world folding away), every material
 * recompiles on the next frame, which froze page turns for ~0.4 s. So spreads
 * and worlds never put real lights in the scene. They use <PoolPointLight> and
 * <PoolSpotLight> instead: same props as <pointLight>/<spotLight>, and the ref
 * is a light object you set `intensity` on as usual. It's a stand-in; before
 * each render its settings and world position are copied onto a pooled light
 * (or 0 intensity while it, or a parent, is hidden).
 *
 * Most lights mounted at once: about 5 point + 2 spot (bedtime + back cover).
 */
const POINTS = 6
const SPOTS = 2

type Claim<L extends THREE.Light> = { light: L; anchor: THREE.Object3D; target?: THREE.Object3D }
type Slot<L extends THREE.Light> = { light: L; claim: Claim<L> | null }

// made once, up front, so a spread can claim a light before the pool has rendered
const pointSlots: Slot<THREE.PointLight>[] = Array.from({ length: POINTS }, () => ({ light: new THREE.PointLight('#ffffff', 0), claim: null }))
const spotSlots: Slot<THREE.SpotLight>[] = Array.from({ length: SPOTS }, () => ({ light: new THREE.SpotLight('#ffffff', 0), claim: null }))

function claim<L extends THREE.Light>(slots: Slot<L>[], c: Claim<L>) {
  const slot = slots.find((s) => !s.claim)
  if (!slot) {
    console.warn('lightPool: out of lights; raise POINTS/SPOTS in scene/lightPool.tsx')
    return () => {}
  }
  slot.claim = c
  return () => {
    if (slot.claim === c) slot.claim = null
    slot.light.intensity = 0
  }
}

function shown(o: THREE.Object3D | null) {
  for (; o; o = o.parent) if (!o.visible) return false
  return true
}

function sync() {
  for (const s of pointSlots) {
    const c = s.claim
    const l = s.light
    if (!c || !shown(c.anchor)) {
      l.intensity = 0
      continue
    }
    l.intensity = c.light.intensity
    l.color.copy(c.light.color)
    l.distance = c.light.distance
    l.decay = c.light.decay
    l.position.setFromMatrixPosition(c.anchor.matrixWorld)
    l.updateMatrixWorld()
  }
  for (const s of spotSlots) {
    const c = s.claim
    const l = s.light
    if (!c || !shown(c.anchor)) {
      l.intensity = 0
      continue
    }
    l.intensity = c.light.intensity
    l.color.copy(c.light.color)
    l.distance = c.light.distance
    l.decay = c.light.decay
    l.angle = c.light.angle
    l.penumbra = c.light.penumbra
    l.position.setFromMatrixPosition(c.anchor.matrixWorld)
    l.updateMatrixWorld()
    if (c.target) l.target.position.setFromMatrixPosition(c.target.matrixWorld)
    l.target.updateMatrixWorld()
  }
}

/** Mount once, near the top of the scene. */
export function LightPool() {
  const scene = useThree((s) => s.scene)
  const points = pointSlots.map((s) => s.light)
  const spots = spotSlots.map((s) => s.light)
  useLayoutEffect(() => {
    const prev = scene.onBeforeRender
    scene.onBeforeRender = sync
    return () => {
      scene.onBeforeRender = prev
    }
  }, [scene])
  return (
    <>
      {points.map((l, i) => (
        <primitive key={'p' + i} object={l} />
      ))}
      {spots.map((l, i) => (
        <group key={'s' + i}>
          <primitive object={l} />
          <primitive object={l.target} />
        </group>
      ))}
    </>
  )
}

type Vec3 = [number, number, number]
type Common = { position: Vec3; color?: THREE.ColorRepresentation; intensity?: number; distance?: number; decay?: number }

/** Drop-in for <pointLight>: borrows a light from the pool while mounted. */
export function PoolPointLight({ ref, position, color = '#ffffff', intensity = 1, distance = 0, decay = 2 }: Common & { ref?: Ref<THREE.PointLight> }) {
  const light = useMemo(() => new THREE.PointLight(), [])
  const anchor = useRef<THREE.Group>(null!)
  useImperativeHandle(ref, () => light, [light])
  useLayoutEffect(() => {
    light.color.set(color)
    light.distance = distance
    light.decay = decay
  }, [light, color, distance, decay])
  useLayoutEffect(() => {
    light.intensity = intensity
  }, [light, intensity])
  useLayoutEffect(() => claim(pointSlots, { light, anchor: anchor.current }), [light])
  return <group ref={anchor} position={position} />
}

/** Drop-in for <spotLight>: borrows a spot light from the pool while mounted. `target` is an object in the scene. */
export function PoolSpotLight({
  ref, position, target, color = '#ffffff', intensity = 1, distance = 0, decay = 2, angle = Math.PI / 3, penumbra = 0,
}: Common & { ref?: Ref<THREE.SpotLight>; target?: THREE.Object3D; angle?: number; penumbra?: number }) {
  const light = useMemo(() => new THREE.SpotLight(), [])
  const anchor = useRef<THREE.Group>(null!)
  useImperativeHandle(ref, () => light, [light])
  useLayoutEffect(() => {
    light.color.set(color)
    light.distance = distance
    light.decay = decay
    light.angle = angle
    light.penumbra = penumbra
  }, [light, color, distance, decay, angle, penumbra])
  useLayoutEffect(() => {
    light.intensity = intensity
  }, [light, intensity])
  useLayoutEffect(() => claim(spotSlots, { light, anchor: anchor.current, target }), [light, target])
  return <group ref={anchor} position={position} />
}
