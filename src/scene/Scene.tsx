import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { Book } from '../book/Book'
import { Environment } from '../world/Environment'
import { Worlds } from '../world/Worlds'
import { Milo } from '../milo/Milo'
import { CameraRig } from './CameraRig'
import { BookLight } from './BookLight'
import { setMaxAnisotropy } from '../art/texture'

export function Scene() {
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0.8, 4, 6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => setMaxAnisotropy(gl.capabilities.getMaxAnisotropy())}
    >
      <CameraRig />
      <Environment />
      <BookLight />
      <Worlds />
      <Book />
      <Milo />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
        <Vignette offset={0.32} darkness={0.38} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  )
}
