# HANDOFF: How we built "Milo to the Rescue!" (and how to build your own)

This file explains, end to end, how this interactive 3D pop-up book was made,
so someone else can build one for their own child with their own coding agent.

- **Live example:** https://jas7457.github.io/milo-book/
- **Source:** https://github.com/jas7457/milo-book. Reading the code is the
  best reference; every file named below exists in this repo.
- **Audience for this doc:** a parent working with an AI coding agent. Give the
  agent this whole file. Part A is the "what and why", Part B is the
  technical deep dive, Part C is the phased build plan, Part D lists the
  traps we fell into, and Part E is a prompt template to start your agent.

---

# Part A: What it is

An interactive **3D pop-up book** that runs in the browser (iPad landscape and
desktop). It is built **entirely in code**: no 3D models, no image files, no
audio files. Every picture is an SVG string written in TypeScript, turned into
a texture at runtime. Every sound is synthesised with WebAudio.

What the reader experiences:

1. **A closed book** lies on a rug in a paper-craft room. They tap the arrow and
   the cover swings open.
2. **Each spread** (two facing pages) has a painted background printed across
   both pages, plus 10–20 die-cut paper pieces that **fold up out of the page**
   like a real pop-up book (V-folds across the spine, pieces that spring,
   rise, drop, swing in from the side).
3. **The story bleeds into the real world.** Behind the book, a large paper
   diorama (a workshop, a dig site, a river valley, a town on fire…) unfolds
   out of the floor, and its sky "soaks" into the new colour like ink through
   paper. Some pop-ups **fly off the page** into that diorama.
4. **The child is the hero.** A paper-doll version of the child stands next to
   the book in each page's outfit (hard hat, firefighter coat, cape,
   pajamas) and twirls into the next outfit when the page turns.
5. **Each page has one to three small interactions:** pull a tab, drag a piece
   onto a target, tap something, hold something in place. The story text
   **writes itself in** with a pencil at read-aloud pace. The next-page arrow
   stays locked until the interactions are done and the text has finished.
6. **An ending**: the book closes, slides over, and the camera pulls back to
   reveal a cosy room full of Easter eggs from every page.

The quality bar we aimed for: a professionally paper-engineered pop-up book.
Ink outlines, shading, highlights, paper grain, a cream die-cut edge on every
piece, soft shadows.

### The product rules that shaped everything

These came from the family and are worth adopting (or consciously replacing):

- **Audience:** a 5-year-old on an iPad in landscape (1180×820) or a desktop.
  Not phones. Everything big, bright, tappable, readable.
- **At most 10 spreads.** We have 9: cover, 7 story spreads, back cover.
- **Everything in code.** SVG art rasterised to textures, plus shaders. No
  model/image/audio files, no network access at runtime, one font (Fredoka).
- **Only the family plus invented side characters.** Character looks were
  written down in detail (hair, skin, clothes) and kept consistent.
- **Slim storybook proportions** for people (head about 1/4.5 of height).
  Squat, chubby figures were rejected.
- **Short text:** 35–50 words per spread, accent words in colour.
- **Pacing:** text can't be skipped; the page must be finished before the
  arrow unlocks; a finished page stays unlocked if you come back, but its
  pop-ups and text replay; "Read again" relocks everything.
- **Every highlight waits for the story.** Glows, hint hands, target rings and
  pull tabs only appear once the text has asked for the action ("Pull the
  tab!").
- **Debug aids only behind URL switches** (`?page=N`, `&fast`, `&unlock`).

---

# Part B: How it works (technical deep dive)

## B1. Technology

| Piece | Version | Why |
|---|---|---|
| **Vite** | 8 | Dev server with instant hot reload; static production build |
| **React** | 19 | Component structure for pages and pieces |
| **TypeScript** | strict (`noUnusedLocals`, `noUnusedParameters`) | Large codebase written mostly by agents; strictness catches their mistakes |
| **three.js** | 0.186 | The 3D renderer |
| **@react-three/fiber (r3f)** | 9 | three.js as React components; `useFrame` per-frame hooks |
| **@react-three/drei** | 10 | Small helpers |
| **@react-three/postprocessing / postprocessing** | 3 / 6 | Bloom, vignette, tone mapping |
| **GSAP** | 3 | ALL choreography (page turns, reactions, timelines) |
| **zustand** | 5 | Small UI state stores (current page, progress) |
| **@fontsource/fredoka** | 5 | The one font, bundled (no network) |
| **WebAudio** | browser | Synthesised sound effects |
| **oxlint** | 1 | Fast linting |
| **GitHub Actions + GitHub Pages** | | Free hosting; every push to `main` deploys in ~40 s |

No backend. The whole thing is a static site of about 2 MB.

## B2. The big picture

```
<App>
 ├─ <Scene>  (r3f <Canvas>: ONE three.js scene for everything)
 │   ├─ CameraRig      fits the camera to the book / child / ending room
 │   ├─ Environment    sky dome, ground, sun, hemisphere light, fog (blended between palettes)
 │   ├─ BookLight      warm spotlight on the book (crisp pop-up shadows)
 │   ├─ LightPool      fixed set of point/spot lights that pages borrow
 │   ├─ Prewarm        paints/uploads textures and compiles shaders ahead of time
 │   ├─ Worlds         the diorama(s) behind the book
 │   ├─ Book           cover, bending page leaves, back board, page-edge blocks
 │   │    └─ per nearby spread: spread.Popups + <StoryCard>
 │   ├─ Milo           the paper-doll child
 │   └─ EffectComposer Bloom, Vignette, neutral tone mapping
 └─ <Controls>  (plain DOM) prev/next arrows, page dots, swipe/keys, "Read again"
```

**Why one scene:** the book and the world share coordinates, so a pop-up can
lift off the page and fly to a spot in the diorama. That single decision is what
makes "the story bleeds into the real world" possible.

**Repo map:**

```
index.html            includes the loading screen (plain HTML/CSS)
src/
  main.tsx            boot: init anim values, progress, ?page=N jump, render
  App.tsx             <Scene> + <Controls>
  config.ts           book dimensions + page-turn timing table T
  state.ts            `anim` (mutable per-frame values), `ui` flags, Palette, Outfit types
  store.ts            zustand `useBook`: go(dir) / restart() + the page-turn GSAP timeline
  progress.ts         beats / written paragraphs / done → gates the next arrow
  cue.ts              "has the text written word X yet?" (drives highlights)
  bus.ts              tiny event bus ('sfx', 'milo', 'pull', 'turn', 'flip', 'cue')
  sfx.ts              WebAudio sound synth
  intro.ts            fades the loading screen and pops the first page up
  debug.ts            ?fast / ?unlock
  book/               Book.tsx, leafGeometry.ts (page bending), pageTextures.ts, StoryCard.tsx
  popup/              Piece, PopCard/Part, PullTab, DragPiece, Glow, HintHand, hint.ts
  world/              Cutout, Environment, Worlds
  scene/              Scene, CameraRig, BookLight, lightPool, Prewarm
  milo/               the paper-doll rig + outfit art
  ui/Controls.tsx     DOM arrows, dots, swipe, "Read again"
  art/                texture.ts (svgDoc → texture), style.ts, kit.ts (shared shapes),
                      family.ts (people), tools.ts, + one art file per spread
  story/
    spreads.ts        THE BOOK: ordered list of spreads + world registry
    types.ts          SpreadDef, Para
    palettes.ts       colour moods per world
    pages/*.tsx       one file per spread: SpreadDef + Popups + Director + World
docs/                 ARCHITECTURE, STORY, SPREAD_GUIDE, NOTES
```

## B3. The animation model (the most important idea)

There are two kinds of state, and keeping them apart is what keeps it smooth:

| Kind | Where | Changed by | Read by |
|---|---|---|---|
| **Per-frame values** | `anim` in `state.ts`: plain mutable JS objects | GSAP tweens | `useFrame` loops (no React re-render) |
| **App/UI state** | zustand stores (`useBook`, `useProgress`) | actions | React components, DOM controls |

`anim` holds numbers like:

```ts
export const anim = {
  leaves:   [{ p: 0 }, ...],   // turn progress of each leaf (0 right … 1 turned left)
  raise:    [{ v: 0 }, ...],   // how popped-up each spread's pieces are (0..1)
  presence: { room: { v: 0 }, workshop: { v: 0 }, ... }, // how unfolded each world is
  env: { t: 0 }, envFrom, envTo, // palette blend for sky/ground/lights/fog
  cam: { open: 0, push: 0 },     // closed vs open framing, dive-in during turns
  back: { v: 0, slide: 0 },      // the ending
  milo: { spin: 0 },             // outfit-change twirl
  lights: { dark: 0 },           // room dimmer (0 normal … 1 lights out)
}
```

- **GSAP tweens these numbers.** Every piece reads them in `useFrame` and
  derives its pose. React never re-renders per frame.
- **Any state can be jumped to** by setting the numbers. `?page=4` just sets
  `leaves[0..3].p = 1`, `raise[4].v = 1`, etc. in `main.tsx`.
- **One-off moments go through an event bus** (`bus.emit('sfx', 'pop')`,
  `bus.emit('milo', 'cheer')`, `bus.emit('pull', 'lights')`).

## B4. Asset pipeline: "loading" art that is written in code

There are no image files. Every picture is an SVG string. The pipeline:

```
SVG body (TS template string)
  → svgDoc(w, h, body, { cut })      wraps it as a die-cut paper piece
  → svgTexture(svg, maxPx)            returns a THREE.CanvasTexture immediately (blank)
  → <img src="data:image/svg+xml…">   browser decodes the SVG (async)
  → queued paint job                  drawImage into the canvas
  → pumpTextures() (each frame)       paints a budget of jobs + uploads them to the GPU
  → paperMaterial(texture)            MeshLambertMaterial + GPU paper grain, on a thin plane
```

### `svgDoc`: making SVG look like printed, die-cut paper

`svgDoc(w, h, body, { cut, grain, edge, defs })` wraps the art (see
`src/art/texture.ts`):

1. **Paper grain: on the GPU, not in the SVG.** `svgDoc` only records
   `data-grain="1"`. The paper material multiplies in a small shared tiling
   noise texture (fine fibres ≈ 900 cells across a piece, soft blotches ≈ 12
   cells): `color *= 1 − 0.2g + 0.3g·(0.45·fibres + 0.55·blotches)`.
   - We first did this with SVG `feTurbulence`. It looked great and was fast
     in Chrome, but **Safari took 100–400 ms to paint each big piece**, which
     froze the iPad for seconds after every page turn. Moving it to the shader
     cut the frozen time per turn by ~20× in WebKit. Don't put noise filters
     in SVGs.
2. **Die-cut edge:** the art's alpha is blurred once (`feGaussianBlur`), then
   thresholded twice (`feComponentTransfer`) to grow it outward: once for a
   cream paper border, once more for a thin dark rim. The art is merged on top.
   - Do NOT use `feMorphology dilate` for this. It looks the same but was
     ~10× slower to paint and stalled page turns on iPad.
3. **Deterministic output.** The same piece must always produce the same SVG
   string, so it hits the texture cache. **Never put a counter or
   `Math.random()` into an SVG string built during render.** Every re-render
   would repaint and re-upload it. We had this bug, and it caused hitches.

Art conventions we used:
- Ink outlines in one colour (`INK = #3b2a20`), stroke width 4–6 px at
  1000 px/unit scale.
- Every piece gets a base colour, a darker shading shape, a lighter highlight
  shape, and small details. Flat single-colour shapes look cheap.
- Shared shapes in `kit.ts` (stars, clouds, trees, puffs), people in
  `family.ts`, then one art file per spread.
- A scratch page (`art.html`) renders single art pieces for quick review.

### `svgTexture` and the paint queue

```ts
export function svgTexture(svg: string, maxPx = 1024): THREE.CanvasTexture {
  // 1. cache by (maxPx + svg); return the cached texture if there is one
  // 2. make a canvas sized to maxPx on the long side, wrap it in a CanvasTexture
  // 3. decode the SVG into an <img> (cached promise per svg string)
  // 4. when decoded, push a job { tex, run: drawImage + needsUpdate } onto rasterQueue
  return tex  // blank until painted
}

export function pumpTextures(upload, budgetPx = 2_000_000) {
  // paint + upload jobs until ~budgetPx pixels have been painted this frame
}
export const texturesPending = () => decoding + rasterQueue.length
```

- **Why a queue:** painting a 2048 px SVG with filters can take tens of ms.
  Doing it the moment the image decodes caused random freezes mid-animation.
  Instead `Prewarm` calls `pumpTextures(gl.initTexture)` every frame, which
  paints and uploads for at most ~6 ms per frame (always at least one).
- **Safari quirks:** Safari rasterises an SVG image **at its declared
  `width`/`height`**, then scales it, and only does so lazily when the canvas
  is uploaded. So: declare SVGs at (or below) the texture size, and budget the
  queue by time, not pixels.
- **Texture sizes:** most pieces 512–1024 px; big pieces opt in to
  `px={2048}`. Page backgrounds are one 2560×1760 SVG across both pages.
- **Memory:** `useSvgTexture` ref-counts textures (`retainTexture` /
  `releaseTexture`) and disposes them when no mounted component uses them.
  Only nearby spreads are mounted (see B11).
- **Fonts:** Fredoka is bundled via `@fontsource`. Text drawn on a canvas
  (the story card) waits for `document.fonts.load(...)`. Caveat: SVGs
  rasterised from data URLs **can't see page fonts**, so text inside SVG art
  may fall back to another font. Use paths for important lettering, or embed
  the font as base64 in the SVG.

### `paperMaterial`

```ts
new THREE.MeshLambertMaterial({
  map,
  alphaTest: 0.5,           // die-cut silhouette, no sorting problems
  side: THREE.DoubleSide,
})
// onBeforeCompile: if (!gl_FrontFacing) diffuseColor.rgb = uBack;  → plain cream paper back
//                  then the paper grain (GRAIN_APPLY)
```

Lambert, not Standard: matte paper looks identical, and every pixel of every
piece runs the light loop, so the cheaper lighting model matters on an iPad.

Cached per (texture, options), so identical pieces share one material.
Optional `emissive` (uses the map as an emissive map) makes things glow under
bloom.

## B5. The book

All in `src/book/`. Book space: the book lies in the XZ plane, spine along Z
at x = 0, tilted toward the reader (`BOOK_TILT = 0.3` rad). Pages are
`1.6 × 2.2` units.

- **Leaf** (`leafGeometry.ts`): each paper leaf is a 28×3 subdivided grid.
  Its front is the right page of spread i; its back is the left page of
  spread i+1. `bendLeaf(g, p, …)` bends it for turn progress `p`: the angle is
  `p·π`, and a curl of `0.95·sin(p·π)` makes the part near the spine lead and
  the outer edge lag, like a page lifted by its corner. It flattens perfectly
  at rest. The geometry is only rebuilt when `p` changes.
- **Cover / back board:** rigid boards (`BOARD_T 0.035` thick) hinged at the
  spine, with cover art drawn from SVG.
- **Page-edge blocks:** boxes on each side whose thickness shows how many
  pages are on that side.
- **Page textures** (`pageTextures.ts`): one 2560×1760 painting per spread
  printed across both pages (spine at x = 1280).

### The self-writing story card (`StoryCard.tsx`)

- A pop-up card on the left page, leaning back so it faces the reader. Its
  height is sized for **all** paragraphs up front, so the layout never jumps.
- Text is laid out on a canvas (Fredoka), and each word's box is recorded.
  `*word*` in the story text marks a coloured accent word.
- A schedule gives each word a start and end time: ~25 letters/s, plus small
  pauses after words, commas and sentences, and a gap between paragraphs. One
  `SPEED` constant scales all of it.
- **Time-map texture:** for every texel, the moment its ink appears. The
  shader reveals ink where `uClock ≥ time` (with a short soft ramp and a
  "wet ink" tint that dries), so letters wipe in left to right.
- A paper pencil follows the writing point and plays a scribble sound.
- Paragraphs can be gated: `{ after: 1, text: '…' }` waits until interaction 1
  is done. So the text can describe what the child just did.
- Each written word is reported to `cue.ts` (`heard('tools', 'empty')`), which
  drives the "highlights wait for the story" rule.

## B6. Pop-ups: how pieces fold up when a page opens

Everything visible on a page is a **`Piece`** (`src/popup/Piece.tsx`): a thin
plane with a paper texture, nested in a few groups (position → hinge → idle →
mesh) so each kind of motion has its own transform.

### The rise

Each spread has one master value, `anim.raise[i].v`, tweened 0 → 1 over
`T.popUp` (1.7 s) during a page turn. Each piece has a `delay` (0 … 0.55) and
computes its own local progress:

```ts
const windowed = (master, delay, length = 0.45) => clamp01((master - delay) / length)
const l = windowed(anim.raise[index].v, delay)
const e = easeOutBack(l, 1.3)   // overshoots a little, like paper springing up
```

Then the **hinge** decides what `e` means:

| hinge | Motion |
|---|---|
| `back` | lies flat (rotated −90° on X) and swings up to standing; then leans back by `lean` |
| `front` | swings up from the near side |
| `left` / `right` | swings in around Z from the side |
| `spring` | scales up from zero (good for small things, stars) |
| `rise` | slides up out of the page (good for things "behind" a slot) |
| `drop` | falls in from above |

- **V-fold** (`vfold={angle}`): the piece is split into two halves that swing
  forward around the spine, like paper glued across the gutter. They stand at
  `angle` when open and fold flat (`π/2 − 0.04`) when closed.
- **Idle motion** fades in as the piece settles: `bob`, `sway`, `float`,
  `spin`, `rock`, `drift`, `flicker`.
- **Tap reactions:** `jump`, `wiggle`, `spin` (plus an `onTap` callback).
- **Hidden when folded:** `visible = l > 0.002`, so folded pieces cost nothing.
- **Staggering** by `delay` is what makes a page feel alive. Back pieces first
  (0–0.1), middle (0.1–0.25), front and small decorations last (0.3–0.5).

Wrappers:
- **`PopCard`**: a Piece in book space, `at={[x, z]}` (x −1.6…1.6, spine at 0;
  z −1.1 far edge … 1.1 near edge).
- **`Part`**: a sub-piece inside a PopCard with its own pivot and `animate(g, t)`
  callback (windmill blades, wheels, arms).
- **`Cutout`**: a Piece in world space for the diorama (`at={[x, y, z]}`).

### Escape: pop-ups that fly out of the book

```ts
escape={{ to: [x, y, z], arc: 1.5, scale: 3, duration: 1.6, spin: 1, wait: 0.4, on: 'stars-fly', upright: true }}
```

After the piece has risen, it flies along a parabolic arc from its book spot
to a world position (computed in world space, so it leaves the tilted book),
scaling up as it goes. With `on`, a bus event toggles it out and back.
`upright` works off the book's tilt during the flight so the piece lands
standing straight and facing the camera.

### Spread-local state: Directors

Each spread keeps its state (robot's battery, blocks placed, scoops dug) in
module-level objects, plus a module array of its GSAP timelines. A
`Director` component watches `anim.raise[index].v`. When the page folds away,
it resets the objects and **kills the timelines**. Otherwise sounds and
animations fire on the next page.

## B7. The page turn (`store.ts`)

`useBook.go(dir)` refuses if a turn is running, or if going forward and the
current page isn't `done`. Otherwise it runs one GSAP timeline (times in
seconds, from the `T` table in `config.ts`):

```
0.00  current pop-ups fold down          raise[from] → 0   (0.65 s)
0.00  old world folds away                presence[old] → 0 (1.3 s, only if the world changes)
0.00  room lights back to normal          lights.dark → 0
0.20  camera re-frames                    cam.open
0.30  small dive-in and back out          cam.push
0.35  sky/ground/light palette bleeds     env.t → 1 (2.6 s)
0.40  the leaf lifts and turns            leaves[i].p → 1 (1.35 s), 'flip' sound
0.70  child twirls; outfit swaps at 1.15  milo.spin
1.25  new world unfolds, nearest first    presence[new] → 1 (2.6 s)
1.45  new pop-ups spring up               raise[to] → 1 (1.7 s); child reacts at +0.6
end   `settled = to`                      neighbouring pages mount only now (see B11)
```

The order is what sells it: the old page collapses, the world dissolves, the
sky changes colour like soaking ink, the page turns, and then everything new
grows outward from the book.

## B8. Worlds and environment (`src/world/`)

- **`Worlds`** mounts the world component for each nearby spread (registry in
  `spreads.ts`; consecutive spreads may share a world).
- **`Cutout`** pieces rise with their world's presence. Their default delay is
  their distance from the book / 30, so **the world spreads outward from the
  book**.
- World layout: behind the book at negative z (back wall at about z −10.5,
  about ±17 wide). Big flat ground decals (`flat`) for paths, rivers, rugs.
  Far backdrops (mountains, skylines) as huge cutouts with `shadow={false}`.
- **`Environment`:**
  - **Sky dome shader:** a gradient (top/bottom colour) per palette. During
    a turn, the new palette **bleeds in like ink soaking through paper**: an
    fBm noise field plus distance from the book, compared to a moving edge
    (`smoothstep`), with a bright "wet" band along the edge.
  - **Ground disc:** same ink-bleed, spreading outward along the floor.
  - **Lights and fog** lerp between `envFrom` and `envTo` by `env.t`.
- **Palettes** (`story/palettes.ts`): per world, `skyTop`, `skyBottom`,
  `ground`, `ground2`, `sun` + intensity, `hemiSky`/`hemiGround` + intensity,
  `fogNear`/`fogFar`, page `accent`.

## B9. Lighting (how the scene is lit)

The look is "warm storybook paper", built from a few layers:

1. **Hemisphere light** (sky colour / ground colour per palette): soft fill so
   nothing goes black.
2. **Directional "sun"** per palette: casts the world's shadows. 2048² PCF
   shadow map covering about 18×15 units, `shadow-bias -0.0004`,
   `normalBias 0.02`.
3. **BookLight**: a warm spotlight (`#fff1dc`, angle 0.36, penumbra 0.75,
   decay 0) from above-left, aimed at the book, with its **own tight 2048²
   shadow map**. The sun's shadow map is spread over the whole world, so on
   its own its shadows are too blurry for small pop-ups. This light gives
   crisp, soft-edged shadows of the pop-ups on the page. It fades up as the
   book opens.
4. **Paper material**: Lambert (pure diffuse), so light reads as matte
   paper, at a fraction of the per-pixel cost of the physical material.
5. **Post-processing**: `Bloom` (mipmapBlur, intensity 0.55, threshold 0.82),
   `Vignette`, and `ToneMapping NEUTRAL`. Only bright/emissive things bloom:
   stars, lamp shades, fire, glows.
6. **"Fake light" shapes**: much of the glow is not real lighting:
   - `Glow`: a blurred, additive halo of a piece's own die-cut shape, behind
     it (hints, magic objects).
   - Emissive pieces (`emissive={0.8}`) for stars and flames.
   - Cross-fading a lit version of the art over the unlit one (a lamp turning
     on).
   - Additive geometry for beams: the bedtime moonbeam is a quad projected
     from the window glass corners to the floor, with a blurred pool of window
     panes on the floor.
7. **The room dimmer** (`anim.lights.dark`): one scene-wide value. Environment
   and BookLight dim and shift toward moon-blue as it rises. A spread tweens
   it ("lights out"); every page turn returns it to 0.
8. **Local lights** (lamps, fire glow, a glowing book) use the **light pool**.

### The light pool (important for smoothness)

three.js bakes the **number of lights** into every shader. If a page mounts,
unmounts or hides a light, **every material recompiles**, and the screen
froze for ~0.4–0.5 s mid-turn. So pages never add real lights:

```tsx
// scene/lightPool.tsx
const POINTS = 6, SPOTS = 2   // created once at module load, always in the scene
<PoolPointLight color="#ffb35c" intensity={2} distance={3} position={[…]} />
// a stand-in object: before each render (scene.onBeforeRender) its settings and
// world position are copied onto a free pooled light (or intensity 0 while hidden)
```

Same props and refs as `<pointLight>` / `<spotLight>`. It warns in the
console if the pool runs out.

## B10. Camera (`scene/CameraRig.tsx`)

- **Fits a target box to the screen aspect.** Closed: the cover. Open: the
  child figure plus the open book and its pop-ups, with the world visible
  above. It works on any aspect without per-device numbers.
- **Parallax:** it drifts gently toward the pointer (damped), so the paper
  layers shift against each other and the scene feels 3D. It freezes while
  dragging.
- **Dive-in** (`cam.push`) during turns, and a blend to a wide low room view
  for the ending.
- FOV 38, `dpr` clamped to [1, 2], canvas `antialias: false` (the
  post-processing composer does its own MSAA).
- **Adaptive resolution:** if the median frame over a calm 2 s window is
  slower than 21 ms, the pixel ratio steps down by 0.25 (min 1.25). Fast
  devices never change.

## B11. Mounting, memory and smoothness

- **Only nearby spreads are mounted:** the settled spread, its neighbours,
  and the target of a running turn. Everything else unmounts and frees its
  textures. This keeps iPad memory in check.
- **The window only slides after a turn's whole timeline has finished**
  (`settled`, set in the timeline's `onComplete`). Mounting a page means
  building pieces and starting texture work, which must not happen while
  things are moving.
- **Prewarm** (`scene/Prewarm.tsx`): every frame, paint and upload about
  2 megapixels of queued textures. 0.6 s after each settle, upload every
  texture in the scene and call `gl.compileAsync(scene, camera)`, so pieces of
  the next pages are compiled and on the GPU before they ever show.
- **Loading screen + intro** (`index.html` `#loader`, `src/intro.ts`): the
  first page has nothing to hide its start-up work behind, which caused 0.5 s
  freezes as the cover appeared. So:
  1. `index.html` contains a plain HTML/CSS loading screen (bouncing letter
     blocks spelling the child's name). It shows before any script loads. Its
     letters wait for the font, to avoid a flash of a fallback font.
  2. Behind it, the scene renders fully raised while Prewarm paints
     **everything** with no budget, uploads it, runs `compileAsync`, then waits
     for 6 frames in a row without a hitch (< 50 ms; at most 1.5 s; overall cap
     10 s).
  3. `startIntro()` folds the first page flat, fades the screen, and pops the
     world and the pieces up like the end of a page turn.
- **Rule of thumb: a page turn must never compile a shader or upload a
  texture.** Everything above serves that rule.

## B12. Interactions and gating

- **Progress** (`progress.ts`): per spread, `beats` (interactions required)
  and paragraphs written. `beat(id, k)` marks interaction k done. `done` =
  all beats + all text written, and it persists (the page stays unlocked when
  revisited). "Read again" (`resetAll`) clears it.
- **Reusable mechanics** (use these instead of writing new pointer code):
  - **`PullTab`:** a printed label with a paper strip that slides out from
    under it ("PULL ›"). Drag or tap. Emits `bus 'pull' id`, then springs
    back.
  - **`DragPiece`:** pick a piece up, drop it on a target or **hold** it over
    the target for N seconds (drilling, spraying a hose). Generous grab pads,
    forgiving drops, follows the finger that grabbed it, releases on
    pointercancel or a page turn. Sets `ui.grab` so the drag doesn't count as
    a page swipe, and `ui.dragging` so the camera parallax freezes.
  - **Tappable `PopCard`s** with `onTap`: often nicer than a pull tab, e.g.
    "tap the big lamp" to turn the lights out.
- **Hints:**
  - A pulsing glow around the die-cut shape, plus an occasional wiggle.
  - After 4.5 s idle, a **show-me hand** demonstrates the action. For drags, it
    carries the real piece.
  - Only one hand plays at a time, and any input cancels it.
  - Hints only switch on once the story text has written the cue word:
    `hint={() => heard('tools', 'empty')}`.
- **Controls** (`ui/Controls.tsx`): DOM arrows (grey "locked", pops and glows
  when "ready"), page dots, swipe and keys through the same `go()` check.
  Back always works.

## B13. The child character (`src/milo/`)

- A 2D paper-doll rig: separate planes for body, head, eyes, arms, legs,
  each an SVG with a die-cut edge, in a group that stands in world space
  front-left of the book.
- Idle breathing, a blink. Reactions via `bus.emit('milo', 'wave' | 'cheer' |
  'point' | 'jump')`, each a short GSAP timeline on a `pose` object (arm angles,
  jump height, squash).
- Outfits are art layers toggled per page (hard hat, vest, tool belt, coat,
  cape, mask, pajamas). The turn timeline spins him (`anim.milo.spin`) and
  swaps the outfit at the midpoint of the twirl.
- Tap him and he does a random reaction.

## B14. Sound (`src/sfx.ts`)

Everything is synthesised: a `tone(fromHz, toHz, seconds, wave, gain, delay)`
helper (oscillator + gain envelope with a frequency sweep), plus filtered
noise for whooshes and thuds. Examples:

```ts
pop:     () => tone(420 + Math.random() * 200, 900, 0.14, 'sine', 0.35),
sparkle: () => [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, f * 1.01, 0.25, 'sine', 0.12, i * 0.07)),
drill:   () => { tone(260, 300, 0.42, 'sawtooth', 0.06); tone(520, 610, 0.42, 'square', 0.025) },
```

Triggered with `bus.emit('sfx', name)`. The AudioContext is created on first
use and resumed after a user gesture (browsers block audio before one).

## B15. The spread contract

A whole page is one file, `src/story/pages/<name>.tsx`, exporting a
`SpreadDef`:

```ts
export const digSpread: SpreadDef = {
  id: 'digging',
  world: 'digsite',               // which diorama shows behind the book
  palette: palettes.digSite,      // sky/ground/light mood
  outfit: 'hardhat',              // what the child wears
  heading: 'Dig, dig, dig!',
  beats: 2,                       // interactions required
  text: [
    'Robo zoomed off to the *dig site*… Tap the dirt!',
    { after: 1, text: '*Scoop!* Milo dumped the dirt in Robo\'s truck.' },
    { after: 2, text: '*Scoop!* Look! Under the dirt… a *treasure map!*' },
  ],
  spreadArt: A.digSpreadArt,      // the 2560×1760 painting across both pages
  Popups,                         // component: Director + PopCards + interactions
  miloReact: 'cheer',             // reaction when the page opens
}
```

The same file exports the page's `World` component (Cutouts), registered in
`spreads.ts`. Adding a page means writing one file plus its art file and adding
two lines to `spreads.ts`.

## B16. Deploy

- `vite.config.ts`: `base: '/<repo-name>/'` for GitHub Pages. Never hard-code
  absolute `/…` asset paths.
- `.github/workflows/deploy.yml`: on push to `main`, `npm ci`, `npm run build`,
  upload `dist`, deploy to Pages (~40 s). Enable Pages → "GitHub Actions" in
  the repo settings.
- Test a production build locally under the same base path: copy `dist` to
  `/tmp/pages/<repo-name>` and run `python3 -m http.server` in `/tmp/pages`.

---

# Part C: Build it in phases

Each phase ends with something you can **see in the browser**. Don't let the
agent move on until the "done when" is true, with screenshots. Have the agent
commit after each phase.

### Phase 0: Write the story brief (no code)

Before any code, write `docs/STORY.md` with:
- The child's name, age, and **5 things they love** (ours: building, rescuing
  as a firefighter/superhero, reading, digging machines, fixing things with
  tools).
- How each family member looks, in detail: hair, skin, eyes, clothes, shoes,
  and a signature expression. Decide who must NOT appear.
- Any invented side characters (a robot friend, a kitten…).
- The arc: ~7 story spreads + cover + back cover, ≤ 10 total. Each spread: a
  setting (= a world behind the book), an outfit for the child, 1–3
  interactions, and 35–50 words of text split into before/after paragraphs.
- The devices (iPad landscape? desktop?) and the rules from Part A you want
  to keep.

**Done when:** you can read STORY.md aloud and it sounds like a book.

### Phase 1: Install and scaffold

1. `npm create vite@latest my-book -- --template react-ts`
2. `npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap zustand @fontsource/fredoka`
3. `npm i -D @types/three oxlint`
4. Turn on strict TS (`noUnusedLocals`, `noUnusedParameters`).
5. Set up the folder layout from B2 (empty files are fine).
6. Write `AGENTS.md` with the rules, commands, and URL switches. Agents read it
   every session.
7. Create the GitHub repo, add the Pages workflow and the `base` path, push.

**Done when:** a blank page deploys to `https://<you>.github.io/<repo>/`, and
`npx tsc --noEmit` is clean.

### Phase 2: Render framework and the art pipeline

1. `<Canvas>` with shadows (PCF), `dpr [1,2]`, FOV 38, a simple camera.
2. `Environment` with a gradient sky dome, a ground disc, hemisphere + sun
   (static palette for now), and fog.
3. `BookLight` spotlight. Post-processing: Bloom, Vignette, neutral tone
   mapping.
4. `texture.ts`: `svgDoc` (grain + die-cut edge, deterministic seed),
   `svgTexture` with cache + paint queue, `pumpTextures`, `paperMaterial`
   (cream back face, alphaTest).
5. A `Prewarm` component that pumps the queue each frame.
6. Render ONE test piece: a tree SVG standing on the ground.

**Done when:** a screenshot shows a die-cut paper tree with grain, a cream
edge, a soft shadow, under a gradient sky.

### Phase 3: The book

1. `config.ts` with the book dimensions and `T` timing table. `state.ts` with
   `anim`.
2. The book lying on the ground: cover, back board, page-edge blocks.
3. Leaf geometry with `bendLeaf`. Drive a leaf's `p` from a GSAP tween and
   watch it curl over.
4. `useBook` store with `go(dir)` and a first version of the turn timeline.
   DOM arrows in `Controls`.
5. `CameraRig` that fits the closed cover, then the open book.

**Done when:** you tap "next" and the cover opens with a real page-curl, the
camera reframes, and "back" closes it.

### Phase 4: One spread renders

1. `SpreadDef` type, `spreads.ts` with cover + spread 1.
2. Spread 1's painted background (2560×1760 SVG) printed across both pages.
3. `Piece` with hinges, `easeOutBack`, `windowed` delays, idle motion, tap
   reactions. `PopCard` and `Part` wrappers. V-fold.
4. 10–20 pop-up pieces on spread 1, staggered back to front.
5. `StoryCard`: canvas text layout, the time-map shader, the pencil.

**Done when:** opening the book makes spread 1's pieces spring up in a
staggered wave, and the text writes itself in on the card.

### Phase 5: The world behind the book

1. `Cutout` (world-space Piece) with distance-based delay. `Worlds` registry
   and `anim.presence`.
2. Build spread 1's world: back wall or backdrop, floor decal, 10–20 cutouts.
3. Palettes and the ink-bleed sky/ground shader.
4. One `escape` piece that flies from the page into the world.

**Done when:** the world unfolds outward from the book as the page opens, and
one pop-up visibly leaves the book and lands in the diorama.

### Phase 6: A second page and the full turn

1. Spread 2 with different art, world, palette and outfit (placeholder
   outfit art is fine).
2. The complete turn timeline from B7: fold down → world out → palette bleed →
   leaf turn → world in → pop-ups up.
3. `useNearSpreads` + `settled`: only mount neighbours, and only after the
   turn finishes. Texture ref-counting.
4. Directors that reset spread state and kill timelines when a page folds
   away.
5. `?page=N`, `&fast` and `&unlock` switches.

**Done when:** you can go cover → 1 → 2 → 1 → 2 and everything replays
cleanly, with no leftover sounds or pieces.

### Phase 7: Interactions and gating

1. `progress.ts` (beats, written, done), `cue.ts` (`heard`).
2. `PullTab`, `DragPiece` (drop and hold), tappable pieces.
3. Hints: `Glow`, wiggle, `HintHand` with the one-at-a-time queue. Everything
   waits for its cue word.
4. Locked/ready arrows. Swipe and keys go through the same check.
5. Make spread 1's and 2's interactions real.

**Done when:** on each spread, the arrow stays grey until you do the
interactions and the text finishes. Turning away and back replays everything
but keeps the arrow unlocked.

### Phase 8: The child character

1. Paper-doll rig with idle breathing and reactions on the bus.
2. Outfits, and the twirl-and-swap during turns.
3. Iterate on the face and proportions with the family (this took several
   rounds for us; slim proportions, big expressive eyes).

**Done when:** the family says "that's him!"

### Phase 9: Sound

`sfx.ts` with the synth `tone` helper and noise. Wire `flip`, `pop`,
`sparkle`, `whoosh`, plus one sound per interaction.

**Done when:** every tap, pull and turn makes a fitting little sound, and
nothing plays on the wrong page.

### Phase 10: The rest of the book

1. Write the remaining spreads. These parallelise well: give each sub-agent
   ONE spread file + its own art file, plus `docs/SPREAD_GUIDE.md` (a brief
   with the engine cheat-sheet; ours is in this repo). Shared engine files
   belong to the lead agent only, and sub-agents list the shared changes they
   need in their report.
2. Back cover / ending, "Read again".
3. A full read-through by the parent: collect notes in `docs/NOTES.md` and
   fix them in rounds.

**Done when:** the whole book reads start to finish on the iPad.

### Phase 11: Performance pass

1. Swap every local light for the light pool.
2. Prewarm: compile and upload after each settle.
3. Make sure no SVG string uses counters or random numbers at render time.
4. Cheap filters only (blur + threshold, not morphology).
5. The loading screen + intro.
6. Measure: record frame times (`requestAnimationFrame` deltas) across eight
   page turns; aim for no frames over ~60 ms. Use Chrome's 4× CPU throttle as
   a rough iPad stand-in, then test on the real iPad.

**Done when:** page turns don't hitch, and the first page appears smoothly.

### Phase 12: Polish and ship

Docs (`ARCHITECTURE.md`, `STORY.md`, `SPREAD_GUIDE.md`, `NOTES.md`), final
deploy, and a pass on a real iPad.

---

# Part D: Lessons learned (the traps)

**Performance**
- Adding/removing/hiding lights recompiles every shader → freezes. Use a fixed
  light pool.
- Mounting new pages mid-animation causes hitches. Mount after the turn's
  timeline completes.
- Painting big SVGs at decode time causes random freezes. Queue and budget
  them.
- Non-deterministic SVG strings (counters, `Math.random()`) defeat the cache.
- `feMorphology` is very slow to paint; use blur + threshold.
- `compileAsync` only sees visible objects. Shared materials help (one
  compiled program serves every paper piece).
- Cold first load is slower than a normal reload. Measure both.
- **Measure in Safari's engine, not just Chrome.** Chrome on a fast Mac hid
  our worst problem completely: Safari painted SVG noise filters 10–50× slower,
  and the iPad froze for 1–3 s after every page turn. Playwright's WebKit
  (`npm i playwright` in a scratch folder, then `webkit.launch()`) runs the real
  engine on a Mac: turn through the whole book and log every
  `requestAnimationFrame` gap over 50 ms.
- Put paper grain / noise in a shader, not in SVG filters.
- Matte paper doesn't need `MeshStandardMaterial`; `MeshLambertMaterial`
  looks the same and is much cheaper per pixel.

**Layout and art**
- Keep important pop-ups clear of the story card; it's tall because it's
  sized for all paragraphs.
- Tall pieces at the back of a spread can be hidden by a V-folded backdrop:
  place them in front of the fold, not behind it.
- Colour contrast matters for targets: our blue bridge block vanished on blue
  water; we made it green.
- Pieces that fly out must land inside the 1180×820 frame.
- Check every figure for anything that could read as a rude gesture (raised
  single fingers).
- SVG text can't see page fonts when rasterised from a data URL.

**Interaction**
- A drag that misses its piece becomes a page swipe. Grab pads must be
  generous, and `ui.grab` must block swipes.
- Kill a spread's GSAP timelines when it folds away, or its sounds fire on
  the next page.
- Highlights shown before the text asks for them confuse a 5-year-old. Gate
  them on cue words.
- Read-aloud pacing: we started at ~12 letters/s, then 17, and finally ~25
  letters/s. Too slow is boring for the parent reading along.

**Process**
- Collect feedback notes in a numbered file and fix them in batches.
- Always verify by looking: screenshots at the target size after waiting
  7–10 s for pop-ups to rise.
- For interaction tests, use real pointer events on the canvas. r3f reads
  `offsetX`/`offsetY`, so define them on synthetic events. Move the pointer
  first and wait, because the camera parallaxes toward it.
- When changing story text, show the parent the final wording verbatim.

---

# Part E: Prompt template for your agent

Copy this, fill in the brackets, and give it to your agent together with this
file (and ideally a clone of https://github.com/jas7457/milo-book as a
reference implementation).

```
I want to build an interactive 3D pop-up storybook for my child, in the
browser, entirely in code (no model, image, or audio files). Read HANDOFF.md
first: it describes a finished book built this way, its architecture, and a
phased build plan. Use the same stack and architecture unless you have a
strong reason not to. The reference repo is at github.com/jas7457/milo-book;
read its code when HANDOFF.md isn't specific enough, but write our own art and
story.

About my child:
- Name: [NAME], age [AGE]
- Things they love: [1] [2] [3] [4] [5]
- How they look: [hair, eyes, skin, typical clothes, signature expression]
- Favourite toy / stuffed animal / pet / colour: [...]

Who else is in the book:
- [Parent 1: name, detailed look]
- [Parent 2: name, detailed look]
- Invented side characters are fine (a robot friend, an animal sidekick…).
- Never include: [anyone who must not appear]

Devices: [iPad landscape 1180×820 / desktop / ...]. Test at that size.

Story idea: [one paragraph, e.g. "a book in their room starts to glow and
pulls them into adventures in each thing they love, ending back home at
bedtime"]. Up to 10 spreads total including the cover and back cover.

How I want to work:
- Start with Phase 0: write docs/STORY.md with every spread's setting, world,
  outfit, interactions and text (35–50 words per spread), and show it to me
  before writing code.
- Then go phase by phase from HANDOFF.md Part C. After each phase, show me a
  screenshot and a plain-language summary, and commit.
- When I give feedback notes, collect them in docs/NOTES.md and wait for me
  to say "go".
- Show me any story text changes verbatim.
- Deploy to GitHub Pages under my account [GITHUB USER] / repo [REPO NAME].
```

Good luck, and have fun with it. The best moments came from small, specific
details of the child's real life hidden in the pages.
