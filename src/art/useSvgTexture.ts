import { useEffect, useMemo } from 'react'
import type * as THREE from 'three'
import { releaseTexture, retainTexture, svgTexture } from './texture'

/** svgTexture() for components: freed again once no mounted component uses it. */
export function useSvgTexture(svg: string, px = 1024, map?: THREE.Texture) {
  const tex = useMemo(() => map ?? svgTexture(svg, px), [map, svg, px])
  useEffect(() => {
    if (map) return
    retainTexture(tex)
    return () => releaseTexture(tex)
  }, [tex, map])
  return tex
}
