import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { anim, ui } from '../state'
import { windowed } from '../anim/ease'
import { useSpread } from './SpreadContext'
import { bus } from '../bus'
import { FONT, waitFonts } from '../book/pageTextures'
import { Glow } from './Glow'
import { HintHand } from './HintHand'

/* Labels are drawn with canvas 2D (SVG images can't use the page's web font). */

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  waitFonts().then(() => {
    draw(c.getContext('2d')!)
    tex.needsUpdate = true
  })
  return tex
}

function labelTex(text: string, sub: string, accent: string) {
  return canvasTex(640, 260, (ctx) => {
    ctx.save()
    ctx.shadowColor = 'rgba(60,35,15,0.45)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = '#fdf8ec'
    ctx.beginPath()
    ctx.roundRect(24, 20, 592, 210, 18)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = accent
    ctx.globalAlpha = 0.6
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(38, 34, 564, 182, 12)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.textAlign = 'center'
    ctx.fillStyle = '#3d2b1f'
    ctx.font = `700 70px ${FONT}`
    ctx.fillText(text, 320, 128)
    ctx.fillStyle = accent
    ctx.font = `500 34px ${FONT}`
    ctx.fillText(sub, 320, 182)
  })
}

function tabTex(color: string) {
  return canvasTex(512, 160, (ctx) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(4, 14, 500, 132, [10, 66, 66, 10])
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.beginPath()
    ctx.roundRect(14, 22, 470, 34, 17)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `700 64px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('PULL', 300, 102)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(408, 52)
    ctx.lineTo(440, 80)
    ctx.lineTo(408, 108)
    ctx.stroke()
  })
}

/**
 * A pull-tab, printed label on top and a paper tab that slides out from under
 * it. Drag it (or just tap it): it emits `bus 'pull' id`, then springs back.
 * `at` is [x, z] on the spread, like PopCard. The tab pulls toward +x.
 */
export function PullTab({
  id,
  label,
  sub = 'pull the tab',
  at,
  color = '#d8432b',
  accent = '#b0412a',
  delay = 0.5,
  onPull,
}: {
  id: string
  label: string
  sub?: string
  at: [number, number]
  color?: string
  accent?: string
  delay?: number
  onPull?: () => void
}) {
  const { index, baseY } = useSpread()
  const LW = 0.62
  const LH = 0.25
  const TW = 0.4
  const TH = 0.125
  const SLIDE = 0.26
  const rest = LW / 2 - TW / 2 + 0.17 // tab end pokes out past the label

  const mats = useMemo(() => {
    const m = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({ map, transparent: true, roughness: 0.9, depthWrite: false, alphaTest: 0.02 })
    return { label: m(labelTex(label, sub, accent)), tab: m(tabTex(color)) }
  }, [label, sub, accent, color])

  const root = useRef<THREE.Group>(null!)
  const tab = useRef<THREE.Group>(null!)
  const st = useMemo(() => ({ off: 0, pulled: false, t0: 0 }), [])
  const drag = useRef<{ x: number; moved: number; id: number } | null>(null)
  const live = () => windowed(anim.raise[index].v, delay) >= 0.99
  const onPullRef = useRef(onPull)
  onPullRef.current = onPull

  const fire = () => {
    // the page turned during the slide-out: don't fire on the wrong page
    if (!live()) return
    st.pulled = true
    bus.emit('pull', id)
    bus.emit('sfx', 'whoosh')
    onPullRef.current?.()
    gsap.to(st, { off: 0, duration: 0.9, delay: 0.25, ease: 'elastic.out(1, 0.45)' })
  }

  /** let go of the tab (pull = false: cancelled, slides back) */
  const release = (pull: boolean) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    ui.dragging = false
    ui.grab = false
    document.body.style.cursor = ''
    if (pull && live() && d.moved < 10) {
      // a tap: slide it out for them
      gsap.to(st, { off: SLIDE, duration: 0.22, ease: 'power2.out', onComplete: fire })
    } else if (pull && live() && st.off > SLIDE * 0.55) {
      gsap.to(st, { off: SLIDE, duration: 0.08, onComplete: fire })
    } else gsap.to(st, { off: 0, duration: 0.5, ease: 'back.out(2)' })
  }

  const handlers = useRef({ move: (_e: PointerEvent) => {}, up: (_e: PointerEvent) => {}, cancel: () => {} })
  handlers.current.move = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    if (e.pointerType === 'mouse' && e.buttons === 0) return release(false)
    const dx = e.clientX - d.x
    d.moved = Math.max(d.moved, Math.abs(dx))
    st.off = Math.min(SLIDE, Math.max(0, (dx / 170) * SLIDE))
  }
  handlers.current.up = (e) => {
    if (drag.current && e.pointerId === drag.current.id) release(true)
  }
  handlers.current.cancel = () => release(false)
  useEffect(() => {
    const move = (e: PointerEvent) => handlers.current.move(e)
    const up = (e: PointerEvent) => handlers.current.up(e)
    const cancel = (e: PointerEvent) => drag.current && e.pointerId === drag.current.id && handlers.current.cancel()
    const blur = () => handlers.current.cancel()
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('blur', blur)
      handlers.current.cancel()
    }
  }, [])

  const down = (e: ThreeEvent<PointerEvent>) => {
    // hidden or still rising: let the tap fall through to whatever is there
    if (!root.current.visible || !live() || drag.current) return
    e.stopPropagation()
    ui.grab = true
    ui.dragging = true
    gsap.killTweensOf(st)
    drag.current = { x: e.nativeEvent.clientX, moved: 0, id: e.nativeEvent.pointerId }
    document.body.style.cursor = 'grabbing'
  }

  useFrame((s) => {
    const l = windowed(anim.raise[index].v, delay, 0.3)
    root.current.visible = l > 0.01
    root.current.scale.setScalar(0.6 + 0.4 * l)
    mats.label.opacity = mats.tab.opacity = l
    if (l < 0.5) st.pulled = false
    if (drag.current && l < 0.99) release(false)
    // until it has been pulled once, the tab peeks out now and then
    const t = s.clock.elapsedTime
    const hint = !st.pulled && !drag.current && l >= 1 ? Math.pow(Math.max(0, Math.sin(t * 1.7)), 8) * 0.07 : 0
    tab.current.position.x = rest + st.off + hint
  })

  // until it has been pulled: glow, and a show-me hand that pulls it a little
  const want = () => !st.pulled && !drag.current && live() && root.current?.visible
  const demo = (k: number) => {
    if (drag.current || st.pulled || gsap.isTweening(st)) return
    st.off = k * SLIDE * 0.85
  }
  const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

  const hover = {
    onPointerOver: () => {
      if (root.current.visible && !ui.dragging) document.body.style.cursor = 'grab'
    },
    onPointerOut: () => {
      if (!ui.dragging) document.body.style.cursor = ''
    },
  }

  return (
    <group ref={root} position={[at[0], baseY + 0.002, at[1]]}>
      <HintHand
        mode="drag"
        want={want}
        from={() => [rest + TW * 0.22, 0.015, 0]}
        to={() => [rest + TW * 0.22 + SLIDE * 0.85, 0.015, 0]}
        dwell={0.3}
        onMove={demo}
      />
      <Glow map={mats.label.map!} w={LW} h={LH} pad={0.035} on={want} rotation={FLAT} position={[0, 0.003, 0]} />
      <group ref={tab}>
        <Glow map={mats.tab.map!} w={TW} h={TH} pad={0.04} on={want} rotation={FLAT} position={[0, -0.001, 0]} />
        <mesh material={mats.tab} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={down} {...hover} receiveShadow>
          <planeGeometry args={[TW, TH]} />
        </mesh>
        {/* a generous invisible grab area for small fingers */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TW * 0.3, 0.001, 0]} onPointerDown={down} {...hover}>
          <planeGeometry args={[TW * 0.8, 0.3]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
      <mesh material={mats.label} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} onPointerDown={down} {...hover} receiveShadow>
        <planeGeometry args={[LW, LH]} />
      </mesh>
    </group>
  )
}
