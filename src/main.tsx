import { createRoot } from 'react-dom/client'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './index.css'
import './sfx'
import { spreads } from './story/spreads'
import { anim, initAnim } from './state'
import App from './App'

initAnim(spreads.length, [...new Set(spreads.map((s) => s.world))])
import { useBook } from './store'
import { initProgress } from './progress'
initProgress(spreads)

// ?page=N jumps straight to a spread (handy while authoring)
const start = Math.min(spreads.length - 1, Math.max(0, Number(new URLSearchParams(location.search).get('page') ?? 0) || 0))
for (let i = 0; i < start; i++) anim.leaves[i].p = 1
anim.presence[spreads[start].world].v = 1
anim.raise[start].v = 1
anim.cam.open = start > 0 ? 1 : 0
anim.envFrom = anim.envTo = spreads[start].palette
useBook.setState({ spread: start, outfit: spreads[start].outfit })

createRoot(document.getElementById('root')!).render(<App />)
