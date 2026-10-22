import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anim } from '../state'
import { damp } from '../anim/ease'

/**
 * Frames the closed book (centred on the cover) or the open book with Milo
 * beside it. Adds a gentle parallax with the pointer so the paper layers of
 * the diorama shift against each other, and a small "dive in" on page turns.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const look = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const cur = useMemo(() => ({ look: new THREE.Vector3(0.8, 0.2, 0), pos: new THREE.Vector3(0.8, 6, 7), px: 0, py: 0 }), [])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const o = anim.cam.open
    const aspect = state.size.width / state.size.height
    // Fit a target box to the screen: closed = the cover; open = Milo + the
    // open book with its pop-ups, leaving the world visible above.
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const halfW = 1.25 + (3.15 - 1.25) * o
    const halfH = 1.35 + (1.75 - 1.35) * o
    const dist = Math.max(halfW / (t * aspect), halfH / t, 4.2) * 1.08
    look.set(0.8 + (-0.6 - 0.8) * o, 0.6 + 0.12 * o, -0.1 - 0.1 * o)
    const elev = 0.5 - 0.06 * o // radians above horizontal
    pos.set(look.x, look.y + Math.sin(elev) * dist, look.z + Math.cos(elev) * dist)
    // dive in during page turns
    pos.lerp(look, anim.cam.push * 0.12)
    pos.y += anim.cam.push * 0.25

    cur.px = damp(cur.px, state.pointer.x, 2.5, dt)
    cur.py = damp(cur.py, state.pointer.y, 2.5, dt)
    pos.x += cur.px * 0.45
    pos.y += cur.py * 0.22

    cur.pos.x = damp(cur.pos.x, pos.x, 3, dt)
    cur.pos.y = damp(cur.pos.y, pos.y, 3, dt)
    cur.pos.z = damp(cur.pos.z, pos.z, 3, dt)
    cur.look.x = damp(cur.look.x, look.x, 3, dt)
    cur.look.y = damp(cur.look.y, look.y, 3, dt)
    cur.look.z = damp(cur.look.z, look.z, 3, dt)
    camera.position.copy(cur.pos)
    camera.lookAt(v.copy(cur.look))
  })
  return null
}
