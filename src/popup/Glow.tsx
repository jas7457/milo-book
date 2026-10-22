import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOW } from './hint'

/**
 * A soft glowing outline that follows the die-cut shape of a piece's art (the
 * texture's alpha, dilated). Sits just behind the art. `on()` says whether it
 * should be lit; it pulses gently while on and fades in/out.
 */
export function Glow({
  map,
  w,
  h,
  on,
  pad = 0.045,
  color = GLOW,
  position = [0, h / 2, -0.004],
  rotation,
}: {
  map: THREE.Texture
  w: number
  h: number
  on: () => boolean
  pad?: number
  color?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          map: { value: map },
          color: { value: new THREE.Color(color) },
          opacity: { value: 0 },
          scale: { value: new THREE.Vector2((w + pad * 2) / w, (h + pad * 2) / h) },
          rad: { value: new THREE.Vector2((pad * 0.9) / w, (pad * 0.9) / h) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D map;
          uniform vec3 color;
          uniform float opacity;
          uniform vec2 scale;
          uniform vec2 rad;
          varying vec2 vUv;
          float A(vec2 u) {
            if (u.x < 0.0 || u.x > 1.0 || u.y < 0.0 || u.y > 1.0) return 0.0;
            return texture2D(map, u).a;
          }
          void main() {
            vec2 u = (vUv - 0.5) * scale + 0.5;
            float a = A(u);
            float g = 0.0;
            for (int i = 0; i < 16; i++) {
              float an = float(i) * 0.3927;
              vec2 d = vec2(cos(an), sin(an)) * rad;
              g = max(g, A(u + d) * 0.55);
              g = max(g, A(u + d * 0.55));
            }
            // only the halo outside the art (the art itself covers the rest)
            float halo = max(0.0, g - a * 0.9);
            gl_FragColor = vec4(color, halo * opacity);
          }`,
      }),
    [map, w, h, pad, color],
  )
  useEffect(() => () => mat.dispose(), [mat])
  const mesh = useRef<THREE.Mesh>(null!)
  const seed = useMemo(() => Math.random() * 10, [])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime + seed
    const want = on() ? 0.75 + Math.sin(t * 3.6) * 0.25 : 0
    const u = mat.uniforms.opacity
    u.value += (want - u.value) * Math.min(1, dt * 6)
    mesh.current.visible = u.value > 0.01
  })

  return (
    <mesh ref={mesh} material={mat} position={position} rotation={rotation} renderOrder={-1} raycast={() => null}>
      <planeGeometry args={[w + pad * 2, h + pad * 2]} />
    </mesh>
  )
}
