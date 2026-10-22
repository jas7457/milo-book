import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anim } from '../state'

/**
 * A warm "reading lamp" spot aimed at the open book. Whatever the world's
 * mood, the pages stay clean and bright, and its tight shadow map gives the
 * pop-ups crisp, soft-edged shadows on the paper (the sun's map is spread
 * over the whole world, so on its own it's too blurry for small pieces).
 */
export function BookLight() {
  const ref = useRef<THREE.SpotLight>(null!)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const l = ref.current
    l.target.position.set(0.1, 0.2, -0.1)
    scene.add(l.target)
    return () => void scene.remove(l.target)
  }, [scene])
  useFrame(() => {
    // fades up as the book opens
    ref.current.intensity = (0.4 + 0.85 * anim.cam.open) * (1 - 0.7 * anim.lights.dark)
  })
  return (
    <spotLight
      ref={ref}
      position={[-2.2, 6.5, 3.6]}
      color="#fff1dc"
      angle={0.36}
      penumbra={0.75}
      decay={0}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0002}
      shadow-normalBias={0.012}
      shadow-camera-near={4}
      shadow-camera-far={12}
    />
  )
}
