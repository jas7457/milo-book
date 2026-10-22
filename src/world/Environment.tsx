import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { anim } from '../state'
import { spreads } from '../story/spreads'

const NOISE = /* glsl */ `
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash21(i), b = hash21(i+vec2(1,0)), c = hash21(i+vec2(0,1)), d = hash21(i+vec2(1,1));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<5;i++){ v += a*vnoise(p); p *= 2.03; a *= 0.5; } return v; }
`

type Uniforms = {
  uTopA: { value: THREE.Color }
  uBotA: { value: THREE.Color }
  uTopB: { value: THREE.Color }
  uBotB: { value: THREE.Color }
  uT: { value: number }
  uTime: { value: number }
}

/**
 * Sky dome. The new world's sky "bleeds" in like ink soaking through paper,
 * starting behind the book and spreading out, with a bright wet edge.
 */
function Sky({ u }: { u: Uniforms }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: u,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main(){
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTopA, uBotA, uTopB, uBotB; uniform float uT, uTime;
          varying vec3 vDir;
          ${NOISE}
          void main(){
            vec3 d = normalize(vDir);
            float h = smoothstep(-0.02, 0.55, d.y);
            vec3 a = mix(uBotA, uTopA, h);
            vec3 b = mix(uBotB, uTopB, h);
            float ang = acos(clamp(dot(d, normalize(vec3(0.0, 0.15, -1.0))), -1.0, 1.0)) / 3.14159;
            vec2 q = vec2(atan(d.x, -d.z) * 2.0, d.y * 3.0);
            float n = fbm(q * 1.7 + uTime * 0.03);
            float field = ang + (n - 0.5) * 0.35;
            float edge = uT * 1.45 - 0.2;
            float m = smoothstep(edge + 0.05, edge - 0.05, field);
            vec3 col = mix(a, b, m);
            float band = smoothstep(0.06, 0.0, abs(field - edge)) * step(0.001, uT) * step(uT, 0.999);
            col += band * 0.12;
            // soft painterly mottling so the sky looks like a printed wash
            col *= 0.97 + 0.06 * fbm(q * 4.0);
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [u],
  )
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[80, 48, 24]} />
    </mesh>
  )
}

/** Ground disc. Same ink-bleed, spreading outward from the book. */
function Ground({ u }: { u: Uniforms & { uG2A: { value: THREE.Color }; uG2B: { value: THREE.Color } } }) {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 })
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;')
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
           varying vec3 vWP;
           uniform vec3 uTopA, uBotA, uTopB, uBotB, uG2A, uG2B; uniform float uT, uTime;
           ${NOISE}`,
        )
        .replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `float dist = length(vWP.xz * vec2(1.0, 1.0));
           float n = fbm(vWP.xz * 0.22);
           float field = dist + (n - 0.5) * 7.0;
           float edge = uT * 46.0 - 3.0;
           float m = smoothstep(edge + 1.0, edge - 1.0, field);
           float sp = smoothstep(0.52, 0.72, fbm(vWP.xz * 0.9 + 7.0));
           vec3 ca = mix(uTopA, uG2A, sp);
           vec3 cb = mix(uTopB, uG2B, sp);
           vec3 col = mix(ca, cb, m);
           float band = smoothstep(1.4, 0.0, abs(field - edge)) * step(0.001, uT) * step(uT, 0.999);
           col = mix(col, cb * 1.25 + 0.05, band * 0.6);
           vec4 diffuseColor = vec4(col, opacity);`,
        )
    }
    return m
  }, [u])
  return (
    <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <circleGeometry args={[70, 96]} />
    </mesh>
  )
}

/**
 * The environment that every world shares: sky, ground, fog and lighting,
 * all blending between the previous and next world's palette.
 */
export function Environment() {
  const scene = useThree((s) => s.scene)
  const start = spreads[0].palette
  const sky = useMemo<Uniforms>(
    () => ({
      uTopA: { value: new THREE.Color(start.skyTop) },
      uBotA: { value: new THREE.Color(start.skyBottom) },
      uTopB: { value: new THREE.Color(start.skyTop) },
      uBotB: { value: new THREE.Color(start.skyBottom) },
      uT: { value: 1 },
      uTime: { value: 0 },
    }),
    [start],
  )
  const ground = useMemo(
    () => ({
      uTopA: { value: new THREE.Color(start.ground) },
      uBotA: { value: new THREE.Color(start.ground) },
      uTopB: { value: new THREE.Color(start.ground) },
      uBotB: { value: new THREE.Color(start.ground) },
      uG2A: { value: new THREE.Color(start.ground2) },
      uG2B: { value: new THREE.Color(start.ground2) },
      uT: { value: 1 },
      uTime: { value: 0 },
    }),
    [start],
  )
  const fog = useMemo(() => new THREE.Fog(start.skyBottom, start.fogNear, start.fogFar), [start])
  scene.fog = fog
  const sun = useRef<THREE.DirectionalLight>(null!)
  const hemi = useRef<THREE.HemisphereLight>(null!)
  const lastFrom = useRef<unknown>(null)
  const ca = useMemo(() => new THREE.Color(), [])
  const cb = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    const t = anim.env.t
    const a = anim.envFrom ?? start
    const b = anim.envTo ?? start
    sky.uTime.value = state.clock.elapsedTime
    ground.uTime.value = state.clock.elapsedTime
    if (lastFrom.current !== a) {
      lastFrom.current = a
      sky.uTopA.value.set(a.skyTop)
      sky.uBotA.value.set(a.skyBottom)
      sky.uTopB.value.set(b.skyTop)
      sky.uBotB.value.set(b.skyBottom)
      ground.uTopA.value.set(a.ground)
      ground.uG2A.value.set(a.ground2)
      ground.uTopB.value.set(b.ground)
      ground.uG2B.value.set(b.ground2)
    }
    sky.uT.value = t
    ground.uT.value = Math.min(1, t * 1.1)
    const k = t * t * (3 - 2 * t)
    fog.color.copy(ca.set(a.skyBottom).lerp(cb.set(b.skyBottom), k))
    fog.near = a.fogNear + (b.fogNear - a.fogNear) * k
    fog.far = a.fogFar + (b.fogFar - a.fogFar) * k
    sun.current.color.copy(ca.set(a.sun).lerp(cb.set(b.sun), k))
    sun.current.intensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * k
    hemi.current.color.copy(ca.set(a.hemiSky).lerp(cb.set(b.hemiSky), k))
    hemi.current.groundColor.copy(ca.set(a.hemiGround).lerp(cb.set(b.hemiGround), k))
    hemi.current.intensity = a.hemiIntensity + (b.hemiIntensity - a.hemiIntensity) * k
  })

  return (
    <>
      <Sky u={sky} />
      <Ground u={ground} />
      <hemisphereLight ref={hemi} args={[start.hemiSky, start.hemiGround, start.hemiIntensity]} />
      <directionalLight
        ref={sun}
        position={[4, 9, 6]}
        intensity={start.sunIntensity}
        color={start.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  )
}
