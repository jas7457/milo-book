import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pumpTextures, texturesPending } from '../art/texture'
import { useBook } from '../store'
import { startIntro } from '../intro'

/** give up waiting for a perfectly smooth start after this long (s) and show the book anyway */
const LOAD_MAX = 12
/** frames in a row that must come in under 1/30 s before the loading screen goes */
const SMOOTH_FRAMES = 6

/** Every texture used by a material in the scene (including hidden pieces and shader uniforms). */
function sceneTextures(scene: THREE.Object3D) {
  const out = new Set<THREE.Texture>()
  const add = (v: unknown) => {
    if (v && (v as THREE.Texture).isTexture) out.add(v as THREE.Texture)
  }
  scene.traverse((o) => {
    const m = (o as THREE.Mesh).material
    if (!m) return
    for (const mat of Array.isArray(m) ? m : [m]) {
      for (const k of ['map', 'emissiveMap', 'alphaMap'] as const) add((mat as THREE.MeshStandardMaterial)[k])
      const u = (mat as THREE.ShaderMaterial).uniforms
      if (u) for (const k in u) add(u[k].value)
    }
  })
  return [...out]
}

/**
 * Keeps page turns smooth by doing the heavy GPU work ahead of time:
 *  - paints newly decoded SVG art and uploads it, a few textures per frame;
 *  - once the neighbouring spreads have mounted (after a turn has fully played
 *    out), compiles the shaders of everything in the scene, hidden pieces
 *    included, and uploads every texture that isn't on the GPU yet (story
 *    cards, pull tabs…), so nothing compiles or uploads when it first shows.
 */
export function Prewarm() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const settled = useBook((s) => s.settled)
  const want = useRef(0) // time (s) after which to warm up, 0 = nothing pending
  const clock = useRef(0)
  const uploads = useRef<THREE.Texture[]>([])
  // start-up behind the loading screen: paint → compile → wait for smooth frames → intro
  const boot = useRef<{ phase: 'paint' | 'compile' | 'smooth' | 'done'; frames: number }>({ phase: 'paint', frames: 0 })

  useEffect(() => {
    want.current = clock.current + 0.6 // let the newly mounted spreads make their pieces and cards first
  }, [settled])

  useFrame((s, dt) => {
    clock.current = s.clock.elapsedTime
    const b = boot.current
    if (b.phase !== 'done') {
      // behind the loading screen there's nothing to protect: paint everything at once
      pumpTextures((t) => gl.initTexture(t), Infinity)
      b.frames++
      if (clock.current > LOAD_MAX) b.phase = 'smooth'
      if (b.phase === 'paint' && texturesPending() === 0 && b.frames > 2) {
        b.phase = 'compile'
        want.current = 0
        for (const t of sceneTextures(scene)) gl.initTexture(t)
        gl.compileAsync(scene, camera)
          .catch(() => {})
          .then(() => {
            b.phase = 'smooth'
            b.frames = 0
          })
      } else if (b.phase === 'smooth') {
        // the first frames after the uploads can still be slow (the GPU catching up)
        b.frames = dt < 1 / 30 ? b.frames + 1 : 0
        if (b.frames >= SMOOTH_FRAMES || clock.current > LOAD_MAX) {
          b.phase = 'done'
          startIntro(useBook.getState().spread)
        }
      }
      return
    }
    // after that, about two pieces per frame so the animations keep their frame rate
    if (pumpTextures((t) => gl.initTexture(t), 2_000_000) > 0) return
    // a couple of the other textures per frame (initTexture is a no-op for ones already up)
    for (let i = 0; i < 2 && uploads.current.length; i++) gl.initTexture(uploads.current.pop()!)
    if (!want.current || clock.current < want.current) return
    want.current = 0
    uploads.current = sceneTextures(scene)
    gl.compileAsync(scene, camera).catch(() => {})
  })
  return null
}
