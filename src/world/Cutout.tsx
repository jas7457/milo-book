import { createContext, useContext, useMemo } from 'react'
import { anim } from '../state'
import { windowed } from '../anim/ease'
import { Piece, type PieceProps } from '../popup/Piece'

export const WorldCtx = createContext('room')
export const useWorldId = () => useContext(WorldCtx)

/** Read the current presence (0..1) of this world, windowed by a delay. */
export function useWorldLevel(delay = 0, length = 0.4) {
  const id = useWorldId()
  return () => windowed(anim.presence[id]?.v ?? 0, delay, length)
}

/**
 * A paper set piece in the world diorama. It folds up out of the ground when
 * its world arrives; things nearer the book rise first, so the world appears
 * to spread outward from the book.
 */
export function Cutout(props: Omit<PieceProps, 'position'> & { at: [number, number, number]; delay?: number }) {
  const id = useWorldId()
  const { at, delay, tap = 'none', ...rest } = props
  const d = useMemo(() => delay ?? Math.min(0.6, Math.hypot(at[0], at[2]) / 30), [delay, at[0], at[2]])
  return (
    <Piece
      {...rest}
      tap={tap}
      position={at}
      level={() => windowed(anim.presence[id]?.v ?? 0, d, 0.4)}
    />
  )
}
