import { spreads, worlds } from '../story/spreads'
import { WorldCtx } from './Cutout'
import { useNearSpreads } from '../store'

/**
 * Worlds of the nearby spreads are mounted (see useNearSpreads); each one shows
 * itself according to its presence.
 */
export function Worlds() {
  const near = useNearSpreads()
  const ids = [...new Set(spreads.filter((_, i) => near(i)).map((s) => s.world))]
  return (
    <>
      {ids.map((id) => {
        const W = worlds[id]
        return W ? (
          <WorldCtx.Provider key={id} value={id}>
            <W />
          </WorldCtx.Provider>
        ) : null
      })}
    </>
  )
}
