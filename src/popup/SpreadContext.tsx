import { createContext, useContext, type ReactNode } from 'react'

type Ctx = { index: number; baseY: number }
const SpreadCtx = createContext<Ctx>({ index: 0, baseY: 0 })

export function SpreadProvider({ index, baseY, children }: Ctx & { children: ReactNode }) {
  return <SpreadCtx.Provider value={{ index, baseY }}>{children}</SpreadCtx.Provider>
}
export const useSpread = () => useContext(SpreadCtx)
