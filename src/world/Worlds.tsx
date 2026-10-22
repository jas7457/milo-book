import { spreads, worlds } from '../story/spreads'
import { WorldCtx } from './Cutout'

/** Every world is mounted once; each one shows itself according to its presence. */
export function Worlds() {
  const ids = [...new Set(spreads.map((s) => s.world))]
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
