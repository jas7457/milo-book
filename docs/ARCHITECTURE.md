# Architecture

How the engine behind "Milo to the Rescue!" works. For the book's content, see
[`STORY.md`](STORY.md). For how to add or change a spread, see
[`SPREAD_GUIDE.md`](SPREAD_GUIDE.md).

## 1. Big picture

```
<App>
 ├─ <Scene>  (r3f <Canvas>, one three.js scene)
 │   ├─ CameraRig      fits the camera to the book / Milo / the ending room
 │   ├─ Environment    sky dome, ground, lights, fog — blended between palettes
 │   ├─ BookLight      warm key light on the book
 │   ├─ Worlds         the diorama(s) behind the book (one per nearby spread's world)
 │   ├─ Book           cover, leaves, back board, page blocks
 │   │    └─ per nearby spread: <SpreadProvider> → spread.Popups + <StoryCard>
 │   ├─ Milo           the paper-doll character, front left
 │   └─ EffectComposer Bloom, Vignette, neutral tone mapping
 └─ <Controls>  (DOM) prev/next arrows, page dots, swipe + keys, "Read again"
```

**Why one scene:** the book and the world share the same space, so a pop-up can
lift off the page and fly to a spot in the diorama. The `escape` prop on any
piece does this. It is the core "the story bleeds into the real world" effect.

**Why the art is SVG:** every picture is an SVG string drawn in code. It is
rasterised to a canvas texture, given paper grain, a die-cut outline and a
cream cut edge, and mapped onto thin planes. No asset files exist.

## 2. The animation model

There are two kinds of state:

| Kind | Where | Changes | Read by |
|---|---|---|---|
| **Per-frame values** | `anim` in `src/state.ts`: plain mutable objects | GSAP tweens them | `useFrame` loops (no React re-render) |
| **UI/app state** | zustand stores: `useBook` (`store.ts`), `useProgress` (`progress.ts`) | actions | React components and DOM controls |

`anim` holds:

| Field | What it is |
|---|---|
| `leaves[i].p` | Turn progress of leaf i (0 = resting right, 1 = turned left) |
| `raise[i].v` | How popped up spread i's pop-ups are (0..1) |
| `presence[worldId].v` | How present a world is (0..1) |
| `env.t`, `envFrom`, `envTo` | Palette blend for the sky, ground, lights and fog |
| `cam.open`, `cam.push` | Camera framing: closed vs open book, and a dive-in during turns |
| `back.v`, `back.slide` | The ending: the back board swings over, then the closed book slides into view |
| `milo.spin` | Milo's outfit-change twirl |
| `lights.dark` | Room-lights dimmer, 0 normal … 1 lights out: Environment and BookLight dim and turn moon-blue. Spreads tween it; every page turn returns it to 0 |

Every animated piece derives its look from these numbers each frame. So any
state can be jumped to directly: `?page=N` just sets the numbers in `main.tsx`.

**One-off moments** go through the tiny event bus (`src/bus.ts`):

| Event | Payload | Who listens |
|---|---|---|
| `sfx` | sound name | `sfx.ts` (WebAudio synth) |
| `milo` | `'wave' \| 'cheer' \| 'point' \| 'jump'` | `Milo.tsx` |
| `pull` | tab id | Pieces with `escape.on === id`, and spread code |
| `turn` | `{ from, to }` | Anyone who must stop what they're doing |
| `flip` | — | Page-flip sound |

Spreads also use private bus ids (e.g. `'stars-fly'`) to trigger their own escapes.

## 3. The page turn (`src/store.ts`)

`useBook.go(dir)` checks two things:
- the store isn't `busy`;
- when going forward, the current spread is `done` (see §6).

It then resets the next spread's progress and runs `turn()`. That is one GSAP
timeline, with times in seconds from `T` in `config.ts`:

```
0.00  pop-ups of the current spread fold down (raise → 0, T.popDown)
0.00  old world folds away (presence → 0, T.worldOut)       — only if the world changes
0.35  environment palette starts bleeding to the new one (T.env)
0.40  the leaf lifts and turns (leaves[leaf].p, T.turn); 'flip' sound
0.20  camera re-frames (cam.open); 0.3–2.9 small dive-in (cam.push)
0.70  Milo twirls; outfit switches at 1.15                 — only if the outfit changes
1.25  new world unfolds, nearest pieces first (T.worldIn)
1.45  new pop-ups spring up (raise → 1, T.popUp); Milo reacts at +0.6
~1.75 busy = false
```

**The ending:** a spread with `closed: 'back'` is the closed book seen from
the back.
- **Going forward into it:** the last leaf and the back board swing over
  together, the leaf held stiff. Then the whole book slides +`COVER_W` into
  view (`back.slide`), and the camera blends to a wide room view.
- **Going back from it:** the slide reverses first.
- **"Read again" (`restart()` → `flipBack()`):**
  1. `resetAll()` relocks every page;
  2. the book slides back and the back board unflips;
  3. the leaves riffle back faster and faster, and the camera closes on the
     cover;
  4. Milo twirls into his cover outfit and waves.

**Which spreads are mounted (`useNearSpreads`):**
- the settled spread, its neighbours, and the target of a running turn;
- the window only slides once a turn's whole timeline has played out
  (`useBook.settled`, set on the timeline's `onComplete`), not when the input
  lock lifts, so new pages are built while nothing is animating;
- everything else is unmounted, so its textures can be freed.

## 4. The book (`src/book/`)

**Shape and placement:**
- The book lies in the XZ plane with the spine along Z at x = 0, and is tilted
  toward the reader by `BOOK_TILT = 0.3` rad.
- Pages are `PAGE_W 1.6 × PAGE_H 2.2`, leaves are `LEAF_GAP 0.0055` apart and
  boards are `BOARD_T 0.035` thick.

**Parts:**
- **`Leaf`:** one paper leaf. Its front is the right page of spread i and its
  back is the left page of spread i+1.
  - `leafGeometry.ts` bends a subdivided plane along a curl. `bendLeaf(g, p,
    yRight, yLeft, dir, stiffness)`.
  - The leaf only rebuilds when `p` changes.
  - Stiffness 0 makes it rigid, which is used when the back closes.
- **`Cover`:** a rigid board hinged at the spine. Its outside is
  `coverTexture()` of `cover` in `spreads.ts`.
- **`BackBoard`:** rotates by `back.v · π` onto the left stack. Its outside is
  the back spread's `cover` art.
- **`Blocks`:** the page-edge blocks. They show the stack thickness on either
  side.
- **`pageTextures.ts`:**
  - Builds page textures from each spread's `spreadArt`, one 2560×1760 SVG
    across both pages with the spine at x = 1280.
  - Builds the story card canvas (`storyCardTexture`, with per-word boxes).
  - Builds the cover textures.
  - `waitFonts()` waits for Fredoka before drawing any text.

### The self-writing story card (`StoryCard.tsx`)

**The card:**
- A pop-up card standing on the left page, leaning back by `LEAN 0.72` so it
  faces the reader.
- Its width is fixed (`CARD_W 1.2`) and centred at
  `x = −1.6 + (textCard.x + textCard.w/2) · 1.6`. `textCard.y` is currently
  ignored.
- Its height fits **all** paragraphs from the start, so the layout never
  jumps.

**How the writing works:**
- `storyCardTexture` lays out the words and returns their boxes.
- `schedule()` gives each word a start and end time:
  - pace `CPS` = 17 × `SPEED` 1.5 ≈ 25 letters/s (`SPEED` scales every pause too);
  - extra pauses `PAUSE [0.07, 0.22, 0.42]` after a word, comma or sentence;
  - `PARA_GAP 0.4` s between paragraphs.
- A **time-map texture** stores, per texel, the moment its ink appears. The
  shader reveals ink where `time ≤ uClock`, so letters wipe in left to right.
- A paper **pencil** follows the writing point and plays the `scribble` sound.

**Driving it:**
- The pencil starts `START_DELAY` 0.25 s after the card itself is up (it is
  the first piece to rise), about 2 s after the tap, not after the whole turn.
- `uClock` advances only while the paragraph's beat is done (`stageOf(id) ≥
  after`). It also never runs past the end of the last allowed paragraph.
- Finished paragraphs are reported with `markWritten(id, n)`.
- When the card folds away (`raise < 0.5`), it starts over.
- `?fast` runs the clock 8× faster.

## 5. The pop-up engine (`src/popup/`)

### `Piece`

The die-cut paper piece everything is built from: pop-ups, world cutouts and
the card.

| Prop | What it does |
|---|---|
| `art` (SVG), `map`, `material` | What's drawn |
| `size [w,h]` | Size; the pivot is at the bottom centre |
| `level()` | A 0..1 function from the owner (spread raise or world presence) |
| `hinge` | How it unfolds: `back` / `front` / `spring` / `rise` / `drop` / `left` / `right` |
| `lean`, `rotY` | Final pose |
| `idle` | Idle motion: `bob` / `sway` / `spin` / `float` / `flicker` / `rock` / `drift` |
| `tap`, `onTap` | Tap reaction: `jump` / `wiggle` / `spin` / `none`; `onTap` is the callback |
| `vfold` | A V-fold across the gutter: both halves swing forward by the angle, like real paper glued across the spine |
| `escape` | `{ to, arc, scale, duration, spin, wait, on, upright }` flies the piece out along an arc. With `on`, each bus event of that id toggles out and back. `upright` works off the book's tilt during the flight, so the piece lands standing straight and facing the camera (the spin becomes a twirl on the way) |
| `hint` | "Touch me": a pulsing `Glow` around the die-cut shape (renderOrder −1), an occasional wiggle, and a show-me `HintHand` after idling. Pass a function to switch it off when the job is done |
| `gate` | `() => boolean`: the piece stays folded until it turns true, then pops up with its hinge (e.g. on a text cue) |
| `contact`, `flat`, `emissive`, `px`, `shadow` | Contact shadow, lay flat, glow, texture size, cast shadow |

### Wrappers and mechanics

- **`PopCard`:** a `Piece` in book space. `at=[x, z]` sets the spot and `delay`
  0…0.55 staggers the rise.
- **`Part`:** a sub-piece inside a PopCard with its own pivot and animation, for
  arms, wheels and similar moving bits.
- **`SpreadProvider` / `useSpread()`:** gives `{ index, baseY }` to everything on
  a spread.
- **`PullTab`:** a printed label with a paper strip that slides out from under
  it toward +x.
  - **Layers:** the strip has renderOrder 1 and the label renderOrder 2, so the
    strip always sits *under* the label. The exposed end of the strip reads
    "PULL ›".
  - **Use:** drag it, or just tap it. It emits `bus 'pull' id`, calls
    `onPull`, then springs back.
  - **Hints:** it has its own glow and show-me hand. `hint={() => …}` decides
    when they show; `gate={() => …}` keeps the whole tab hidden until then.
- **`DragPiece`:** pick a piece up and drop it on a target, or hold it over the
  target.
  - **Props:** `target {at, r, y}`, `hold` seconds, `consume`, `onDone`,
    `onHolding(p)`, a shared `state`, a ring `color`, and `holdSfx`.
  - **Tracking:** it follows the finger that grabbed it and releases on
    pointercancel or a page turn.
  - **Forgiving input:** drops are forgiving and grab pads are bigger than the
    art.
  - **Flags:** sets `ui.grab`, so a swipe doesn't turn the page, and
    `ui.dragging`, so the camera parallax holds still.
  - **Gating:** `hint={() => …}` decides when the glow, the target ring and the
    show-me hand appear (the piece can still be dragged). `disabled={() => …}`
    means it can't be picked up yet (a tap wiggles it) and shows no highlights.
  - **Demo:** the show-me hand carries the real piece. Any input stops the
    demo and the piece snaps home, and its home spot stays grabbable during
    the demo.
- **Hints (`hint.ts`):**
  - Idleness is measured from the last pointer press, mouse move or key.
  - A hand queue makes sure **only one show-me hand plays at a time**, and
    any input cancels it.
  - The hand appears after `HAND_AFTER 4.5` s idle, and waits while the pencil
    is writing.

### Directors

Each spread keeps its state (Robo's power, scoop count, placed blocks…) in
module-level objects. A `Director` component in the spread's file watches
`anim.raise[index].v`. When the page folds away, it resets those objects and
kills that spread's GSAP timelines, so nothing fires on the next page.

### Text cues (`src/cue.ts`)

**Rule: every highlight waits until the story asks for it.** Glows, rings,
"TAP!" bubbles, ghosts, arrows, show-me hands and pull tabs only switch on
once the card has written the words that ask for them.

- The story card reports every word it finishes: `hearWord(id, word)`, also
  emitted as bus `'cue'` `{ id, word }`.
- `heard(spreadId, word)` is true once that word is written on this visit
  (case-insensitive, punctuation and `*` ignored). The list clears when the
  card folds away, so cues replay on every visit.
- Typical use: `hint={() => heard('tools', 'empty')}`,
  `gate={() => heard('reading', 'glow')}`.

| Spread | Cue word | What waits for it |
|---|---|---|
| reading | `glow` / `tab` | burst, stars, book light, then the pull tab / its hint |
| tools | `empty` / `wheels` | battery highlights / wheel highlights |
| digging | `dirt` | ring, "TAP!" bubble, pile glow |
| building | `gaps` | coloured ghosts + arrows, block highlights |
| firefighter | `hose` | nozzle highlights |
| superhero | `fly` | pull-tab highlights |
| home | `out` | floor-lamp glow + show-me hand |

## 6. Progress and gating (`src/progress.ts`)

- **`stage[id]`:** beats done on this visit. A spread calls `beat(id, n)`.
- **`written[id]`:** paragraphs fully written on this visit. `StoryCard` calls
  `markWritten`.
- **`done[id]`:** set once `stage ≥ beats` and `written ≥ paragraphs`. It
  **persists** across visits: the arrow stays unlocked when you return, even
  though the pop-ups and text replay.
- `resetProgress(id)` runs on every visit and resets `stage` and `written`.
  `resetAll()` ("Read again") also clears `done`, unless `?unlock` is on.
- Spreads with no beats and no text (the cover, the back cover) are done from
  the start.
- `Controls.tsx` reflects all this: the next arrow is `locked` or `ready`, with
  a pop and glow when it unlocks. Swipe and keyboard go through the same `go()`
  check. "Back" always works.

## 7. Worlds and environment (`src/world/`)

- **`Worlds`:** mounts the world component of each nearby spread (registry:
  `worlds` in `spreads.ts`). Consecutive spreads may share a world, e.g. cover
  and reading both use `room`.
- **`Cutout`:** a `Piece` in world space (`at=[x, y, z]`). It unfolds with its
  world's presence, and pieces nearer the origin rise first (`delay` defaults
  to their distance / 30), so the world seems to spread outward from the book.
  `useWorldLevel(delay)` gives the same signal for custom animated bits.
- **`Environment`:**
  - A sky-dome shader where the new palette **bleeds in like ink soaking
    through paper**, spreading from behind the book with a bright wet edge.
  - Ground, hemisphere light, sun and fog, all blended between `envFrom` and
    `envTo` by `env.t`.
  - Palettes are defined in `story/palettes.ts`.
- **World layout:** worlds sit behind the book at negative z (back wall ≈ z
  −10.5, about ±17 wide). Milo stands at x −2.5, front left.

## 8. Camera (`scene/CameraRig.tsx`)

The camera **fits a target box to the screen aspect**:
- **closed:** the cover;
- **open:** Milo plus the open book and its pop-ups, with the world visible
  above.

On top of that:
- It parallaxes gently toward the pointer, so the paper layers shift against
  each other. The parallax freezes while dragging.
- It dives in slightly during turns (`cam.push`).
- On the ending, a smoothstep of `back.slide` blends it to a wide, low view
  across the room (`backLook (0.4, 1.75, −5)`, `far = 17.5 · max(1, 1.6/aspect)`),
  so the Easter eggs on the walls are in frame.

## 9. Milo (`src/milo/`)

- **The rig:** a 2D paper-doll rig of separate planes (body, head, arms, legs)
  with idle breathing. Reactions come from bus `milo`.
- **Outfits:** `plain`, `tools`, `hardhat`, `firefighter`, `superhero`,
  `pajamas` (art in `milo/art.ts`). Outfit changes twirl on `anim.milo.spin`.
- **Not yet freed:** `Milo.tsx` still uses bare `svgTexture`, so its textures
  aren't ref-counted (see the backlog).

## 10. Art pipeline (`src/art/`)

- **`texture.ts`:**
  - `svgDoc(w, h, body, { cut, defs, grain, edge })` wraps an SVG body as a
    die-cut paper piece: a cream cut edge along the `cut` path, and a dark rim.
  - **Paper grain is not in the SVG.** `svgDoc` records `data-grain="g"` on
    the root; `svgTexture` stores it (and the art's aspect) in
    `tex.userData`; the material multiplies a shared 256² tiling noise texture
    in on the GPU (`grainTexture`, `GRAIN_APPLY`: fibres ≈ 900 cells and soft
    blotches ≈ 12 cells across the piece, same formula the old filter used).
    `paperMaterial` does this itself; other materials with a paper map use
    `addGrain(material, map)`; canvas textures use `setGrain(tex, g, w, h)`.
    As an SVG `feTurbulence` filter the grain cost 100–400 ms per big piece to
    paint in Safari (the main cause of iPad freezes after page turns).
  - Never put a counter or `Math.random()` into an SVG string built during
    render: every re-render would repaint and re-upload it.
  - The cut edge is one `feGaussianBlur` + two alpha thresholds (not
    `feMorphology`, which cost ~10× more to paint). It is now the main
    painting cost (~5–35 ms per big piece in WebKit).
  - `svgTexture(svg, maxPx)` returns a `CanvasTexture` at once; the painting
    and GPU upload are queued and done by `pumpTextures` (see §12). Safari
    rasterises an SVG at its own `width`/`height` and then scales it, so an SVG
    declared bigger than the texture is re-declared at the texture size
    (`sizeSvg`). Safari also rasterises lazily, at upload time, which is why
    the queue budget is time (6 ms per frame), not pixels.
  - `retainTexture`/`releaseTexture` ref-count textures, and `useSvgTexture`
    is the hook that does this automatically.
  - `paperMaterial(map)` is the standard paper material: a
    `MeshLambertMaterial` (matte paper looked identical to Standard at
    roughness 0.92, and costs much less per pixel per light), double-sided
    with a cream back face, `alphaTest 0.5`, plus the grain.
- **`style.ts`:** `INK #3b2a20`, `limb`, `rand(seed)`, `woodGrain`.
- **`kit.ts`:** shared shapes: stars, sparkles, hearts, clouds, hills, trees,
  pines, bushes, puffs.
- **`family.ts`:** Mom, Dad and Milo figures (`momSitting`, `dadSitting`,
  `miloSitting`) and face helpers (`happyEye`, `grin`, `adultHead`, `MOM`,
  `DAD`).
- **`tools.ts`:** hammer, wrench, saw, hard hat, goggles…
- **Per-spread art files:** `dig.ts`, `digWorld.ts`, `bridge/*`, `fireArt*.ts`,
  `hero.ts`, `homeRoom.ts`, `homeFamily.ts`, `homeWorld.ts`, `backcover.ts`.
- **Text in SVG:** use `font-family="Fredoka, sans-serif"`. Fredoka is loaded
  via @fontsource. Note: SVG images rasterised from data URLs can't see page
  fonts, so SVG text may fall back. Prefer paths, or embed the font (backlog).

## 11. Sound (`src/sfx.ts`)

- All sounds are synthesised with WebAudio oscillators and noise, triggered by
  `bus.emit('sfx', name)`.
- Names: `flip`, `pop`, `giggle`, `sparkle`, `whirr`, `beep`, `siren`,
  `whoosh`, `drill`, `powerup`, `robot`, `snap`, `boing`, `zoom`, `scribble`.
- The AudioContext is created on first use and resumed if it is suspended.
  Browsers only allow audio after a user gesture.

## 12. Memory and performance (iPad)

- Only nearby spreads and worlds are mounted (`useNearSpreads`).
- SVG textures are ref-counted and disposed on unmount (`useSvgTexture`).
- Big pieces opt into `px={2048}`; most use 1024 or less.
- `dpr` is clamped to `[1, 2]`, and shadows use PCF.
- **Adaptive resolution (`scene/AdaptiveResolution.tsx`).** If the median
  frame of a calm 2 s window (no loading screen, no turn) is slower than 21 ms,
  the pixel ratio steps down 0.25 (not below 1.25). Never back up (spare
  capacity can't be measured under 60 Hz vsync, and each change resizes the
  render targets). Fast devices never step down.
- The canvas has `antialias: false`: the EffectComposer renders into its own
  multisampled target, so canvas MSAA was a wasted second resolve.
- **Measuring Safari on a Mac:** Playwright's WebKit build (`npx playwright`
  in a scratch folder, `webkit.launch()`) runs the real Safari engine. Turning
  through the book there and logging `requestAnimationFrame` gaps > 50 ms is
  the best stand-in for the iPad we have. Chrome on a fast Mac hides Safari's
  slow SVG filter rasterisation completely.

**Smooth page turns.** A turn must never compile a shader or upload a texture.
- **Light pool (`scene/lightPool.tsx`).** three.js bakes the number of lights
  into every shader, so adding, removing or hiding a light recompiles every
  material (this froze turns for ~0.4 s). Spreads and worlds never put real
  lights in the scene: use `<PoolPointLight>` / `<PoolSpotLight>` (same props
  and refs as `<pointLight>` / `<spotLight>`). They borrow one of a fixed set
  (6 point, 2 spot) that never leaves the scene. If you need more, raise
  `POINTS`/`SPOTS` (it warns in the console when it runs out).
- **Loading screen + intro (`index.html` `#loader`, `src/intro.ts`).** The
  loading screen is plain HTML/CSS (the bouncing M-I-L-O blocks), so it shows
  before any script loads; its letters wait for Fredoka. Behind it the scene
  renders fully raised while Prewarm paints every texture with no limit
  (`texturesPending()` counts images still decoding plus the paint queue),
  uploads them, runs `gl.compileAsync`, then waits for 6 frames in a row
  without a hitch (< 50 ms; at most 1.5 s; overall cap 10 s). Then `startIntro` folds the start spread flat, fades the screen,
  and pops the world and the pop-ups up like the end of a page turn. All the
  start-up freezes (0.5–0.7 s) happen behind the screen.
- **Prewarm (`scene/Prewarm.tsx`).** After start-up, paints and uploads queued
  SVG textures about 2 MP per frame. After each settle it uploads every
  texture in the scene and calls `gl.compileAsync`, so hidden pieces of the
  next pages are ready before they first show.
- Known gaps (see the backlog): Milo's textures, and a performance and memory
  pass on a real iPad.
