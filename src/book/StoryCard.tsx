import { useEffect, useState } from 'react'
import type * as THREE from 'three'
import { storyCardTexture } from './pageTextures'
import { PopCard } from '../popup/PopCard'
import type { SpreadDef } from '../story/types'

/** Card width on the page (world units); the left page is 1.6 wide. */
const CARD_W = 1.2
/**
 * How far the card leans back from upright once open. Together with the book
 * tilt and the camera height this turns it to face the reader, like a little
 * reading stand, so the text isn't foreshortened.
 */
const LEAN = 0.72

/**
 * The spread's story text, printed on a cream card that folds up off the
 * front of the left page. It's the first piece up and the last one down.
 */
export function StoryCard({ spread }: { spread: SpreadDef }) {
  const [card, setCard] = useState<{ tex: THREE.Texture; aspect: number } | null>(null)
  useEffect(() => {
    let live = true
    storyCardTexture(spread).then((c) => live && setCard(c))
    return () => {
      live = false
    }
  }, [spread])
  if (!card) return null
  const box = spread.textCard ?? { x: 0.1, y: 0, w: 0.8 }
  const cx = -1.6 + (box.x + box.w / 2) * 1.6
  const h = CARD_W / card.aspect
  return (
    <PopCard
      art=""
      map={card.tex}
      size={[CARD_W, h]}
      at={[cx, 0.98]}
      lean={LEAN}
      delay={0.02}
      emissive={0.1}
      tap="none"
    />
  )
}
