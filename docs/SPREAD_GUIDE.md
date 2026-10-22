# Building a spread — guide for workers

> **Read [`../AGENTS.md`](../AGENTS.md) first** (rules, commands, testing). How the engine
> works: [`ARCHITECTURE.md`](ARCHITECTURE.md). The current story and text of every spread:
> [`STORY.md`](STORY.md).
>
> **Status:** all 9 spreads (0–8) are built, gated and committed. The original brief is kept
> below because it's still the way to build or rework a spread. Where it disagrees with
> the code, the code wins. Known stale details: the text pace is now ~17 letters/s, and
> there is also a `scribble` sound.

Project: `/Users/jsonwebdev/src/milo-book` — "Milo to the Rescue!", a code-only (no model files)
interactive 3D **pop-up book** for Milo (age 5), built with Vite + React 19 + TypeScript +
three.js / @react-three/fiber + gsap. Every picture is hand-written **SVG** rasterised to textures.

Audience: a 5-year-old on an **iPad (landscape, 1180×820)** or desktop. Big, bright, tappable,
funny. Very little reading.

## The finished spreads ARE the quality bar — read them first

- `src/story/pages/reading.tsx` (spread 1, "Story time")
- `src/story/pages/tools.tsx` (spread 2, "Fix-it Milo") — also the template for drag interactions

Study how they're structured and copy that structure: painted full-spread art, three layers of
pop-ups (back / middle / front), V-folds, `Part` animations, pull tabs / drags, escapes into the
world, a `Director` that resets spread-local state, and a world diorama made of `Cutout`s.

Quality bar = a professional paper-engineered pop-up book (reference: a "Dinosaur Pop-Up Book"
made in code): **painted pages, 10–20 layered pieces per spread, inner detail with ink outlines,
cut edges, highlights and shading, pull tabs, V-folds, contact shadows**. Not clip-art: every piece
should have shading, a highlight, texture lines, small details (rivets, bolts, grass tufts, dents,
stickers, labels). Look at e.g. `bookshelf`, `couch`, `Robo`, `pegboard` in the two files.

## Rules

1. **Only edit your own file** `src/story/pages/<yours>.tsx`. You may also create NEW files that
   only you use (e.g. `src/art/<yours>.ts` for big SVG helpers). **Do not edit any shared file**
   (`spreads.ts`, `palettes.ts`, `Piece.tsx`, `DragPiece.tsx`, `PullTab.tsx`, `Milo.tsx`, `sfx.ts`,
   `bus.ts`, `kit.ts`, `style.ts`, `tools.ts`, `family.ts`, camera, book, etc.). Other workers are
   editing other spreads at the same time. If you need an engine change or a new sound, work around
   it inside your file and **list the request in your final report**.
2. Keep your file's exports and the world id exactly as in the placeholder (they're already
   registered in `src/story/spreads.ts`).
3. Story text is already written in the placeholder — keep it (you may fix a word if the art
   needs it, and say so in your report). Max 3 short lines. `*word*` = bold accent colour.
4. No external assets, no fonts besides Fredoka (`font-family="Fredoka, sans-serif"`), no network.
5. Never draw the girl from any reference photo. Family = Milo, Mom (Jen), Dad (Brett) only
   (`src/art/family.ts` has `momSitting`, `dadSitting`, `miloSitting` and the face helpers;
   import them, don't edit them).
6. Figures: slim storybook proportions (the user dislikes fat/short figures).
7. Typecheck without stomping on others: `npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep pages/<yours>`
   (other files may be mid-edit by other workers; only your file's errors matter). Strict mode:
   `noUnusedLocals`, `noUnusedParameters`.
8. Don't commit to git. The lead will commit.

## Running & looking at it

- Dev server is already running: `http://127.0.0.1:5179/?page=N` jumps to spread N
  (cover 0, reading 1, tools 2, **digging 3, building 4, firefighter 5, superhero 6, home 7**).
  Don't start another server. Vite hot-reloads your file.
- Use your preview tools (`preview_navigate`, `preview_screenshot`) — your own browser. Set up for
  iPad landscape if possible (1180×820). Check `preview_console` for errors.
- Wait ~6–8 s after load for the pop-ups to rise before judging a screenshot.
- Testing drags with synthetic events: React-three-fiber reads `offsetX/offsetY`, which synthetic
  `PointerEvent`s don't set reliably. Dispatch on the `<canvas>` and define them:
  ```js
  const el = document.querySelector('canvas'), R = el.getBoundingClientRect()
  const ev = (t, x, y) => { const e = new PointerEvent(t, { clientX: x, clientY: y, bubbles: true,
    pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: t === 'pointerup' ? 0 : 1 })
    Object.defineProperty(e, 'offsetX', { value: x - R.left }); Object.defineProperty(e, 'offsetY', { value: y - R.top })
    el.dispatchEvent(e) }
  ```
  The camera parallaxes toward the pointer — send a `pointermove` to the start spot and wait ~3 s
  before pressing, or your coordinates drift.

## Engine cheat-sheet

**Art** (`src/art/texture.ts`): `svgDoc(w, h, body, { cut, defs, grain, edge })` wraps SVG body in a
die-cut paper piece (paper grain, cream cut edge, dark rim). `cut` = the outline path for the die
cut. Ink colour `INK = '#3b2a20'` from `src/art/style.ts` (also `limb`, `rand(seed)`, `woodGrain`).
`src/art/kit.ts`: `starPath(cx,cy,R,r,n,rot)`, `star`, `sparkle`, `heart`, `cloud`, `hill`, `tree`,
`pine`, `bush`, `puff`. `src/art/tools.ts`: hammer, wrench, saw, hardHat, goggles, etc.
Use `px={1024|2048}` on big pieces for sharpness.

**Spread art**: `spreadArt` = one 2560×1760 SVG printed across both pages (spine at x=1280, top =
far edge of the book). Paint a full scene (sky/ground/props/stickers/doodles) — see
`readingSpreadArt` and `toolsSpreadArt`. The story text card stands up on the left page front
automatically (`textCard` position optional) — keep the lower-left area of the left page free of
important pop-ups (roughly x −1.5…−0.2, z 0.3…1.1).

**Pop-ups** (book space, inside `Popups`):
- `PopCard` props: `art`, `size [w,h]`, `at [x,z]` (x −1.6…1.6, spine at 0; z −1.1 far … 1.1 near),
  `y`, `delay` 0…0.55 (stagger rising), `hinge` ('back'|'front'|'spring'|'rise'|'drop'|'left'|'right'),
  `lean`, `rotY`, `idle` ('bob'|'sway'|'spin'|'float'|'flicker'|'rock'|'drift'), `tap`
  ('jump'|'wiggle'|'spin'|'none'), `onTap`, `vfold` (radians, V-fold across the gutter),
  `emissive`, `escape` `{ to:[x,y,z] world-space, arc, scale, duration, spin, wait, on:'busId' }`,
  `contact`, `flat`, children.
- `Part` (inside a PopCard): a sub-piece with its own pivot/animation — see Robo's arms in tools.tsx.
- `PullTab` (`src/popup/PullTab.tsx`): a paper tab the child pulls; emits bus `'pull'` with its id
  (pieces with `escape.on === id` fly out into the world / back).
- `DragPiece` (`src/popup/DragPiece.tsx`): pick up and drop on / hold over a target
  (`target {at, r, y}`, `hold` seconds, `consume`, `onDone`, `onHolding(p)`, `state`).
- `useSpread()` → `{ index, baseY }`; `anim.raise[index].v` = how open this spread is (0..1).
  Spread-local mutable state lives in module objects reset by a `Director` component when the page
  turns away (see `ToolsDirector`).

**World** (behind the book, the "real world" the story bleeds into): your `XxxWorld` FC returns
`Cutout`s (`src/world/Cutout.tsx`): `at [x,y,z]` world space, `size`, `hinge`, `delay`, `flat`,
`rotY`, `tap`, `emissive`, `px`, `shadow`. The book sits around the origin; the world is behind at
negative z (back wall ~z −10.5, wide ~±17). Milo stands at x −2.5 in front-left. Fill the frame:
far backdrop, mid props left and right, a floor/ground piece. `useWorldLevel(delay)` gives the
world's presence for custom animated bits. Look at `WorkshopWorld` / `RoomWorld`.
Palette (sky/ground/light colours) comes from `src/story/palettes.ts` — already chosen for you.

**Events** (`src/bus.ts`): `bus.emit('sfx', name)` — available sounds: flip, pop, giggle, sparkle,
whirr, beep, siren, whoosh, drill, powerup, robot, snap, boing, zoom, scribble. `bus.emit('milo', 'wave'|'cheer'|'point'|'jump')`
makes the Milo paper doll react. `bus.emit('pull', id)` toggles escapes.

## Story so far (for continuity)

1 reading: Milo reads with Mom & Dad, the book GLOWS, stars fly out (pull tab).
2 tools: Milo lands in his workshop, puts a battery in Robo the robot (drag) → Robo wakes up and
walks into the world; drills wheels onto a cardboard box car (hold) → it zooms off.
3 digging → 4 building → 5 firefighter → 6 superhero → 7 home (bedtime) → 8 back cover.
The full, current version is in [`STORY.md`](STORY.md).
Small recurring friends are welcome (Robo the teal robot from tools.tsx can cameo).

## Final report (keep it short)

What you built (layers, interaction, world), screenshots you checked, anything that doesn't work,
any shared-file change you need from the lead, and the exact test steps for your interaction.

## Update from the lead (after code review)

- Story timelines: if you chain `gsap.timeline()`s with `.add(() => bus.emit(...))` callbacks, keep
  them in a module-level array and `kill()` them in your Director when the page turns away (see
  `story()` / `timelines` in `tools.tsx`), otherwise sounds and escapes fire on the next page.
- `DragPiece` has a new optional prop `holdSfx` (sound repeated while holding over the target,
  default `'drill'`), e.g. `holdSfx="whoosh"` for a hose.
- DragPiece and PullTab now track the finger that grabbed them and release on pointercancel and on
  page turn. No API change.
- The machine is heavily loaded with several browsers open. Keep screenshots few and close/blank
  your preview when you're not looking at it.

---

## Update 3 — finish-the-page gating, self-writing text, before/after paragraphs

The next-page arrow is now **locked until the page is finished**: every
interaction done *and* all of the story text written. Text is written onto the
card by a pencil at read-aloud pace (~12.5 letters/s, pauses after commas and
sentences) — it cannot be skipped. Engine: `src/progress.ts`, `src/book/StoryCard.tsx`.

### What a spread must do

1. Declare how many interactions ("beats") it has, in its `SpreadDef`:
   ```ts
   beats: 2,
   ```
2. Call `beat(id, n)` when the reader completes interaction n (1-based):
   ```ts
   import { beat } from '../../progress'
   beat('tools', 1)   // e.g. when the battery snaps into Robo
   ```
   - Call it at the *story moment* the result is shown (usually right as the
     reward animation starts), not at the end of a 6-second timeline.
   - Calling it twice / with a lower n is harmless. Beats reset automatically
     every time the spread is turned to (your Director already resets the
     pop-up state when the page is turned away — keep it that way).
   - Beats can be ordered (beat 2 only possible after 1) or not — if the reader
     can do things in any order, count completions and call `beat(id, count)`.
3. Split the text into **before** and **after** paragraphs:
   ```ts
   text: [
     'Robo the robot was fast asleep. His *battery* was empty!',     // written as the page opens
     { after: 1, text: '*Click!* Beep boop — Robo woke up!' },        // waits for beat 1
     { after: 2, text: 'Bzzzt! Milo drilled the wheels on. *Vroom!*' }, // waits for beat 2
   ],
   ```
   - Before-text = sets the scene and tells the child what to do (gently).
     After-text = what happened. Every `after: n` must be ≤ `beats`.
   - Paragraphs are written strictly in order; an `after` paragraph starts once
     its beat is done *and* everything above it has been written.
   - The page unlocks when all beats are done and the last paragraph is written.
4. **Keep it short.** A 5-year-old's picture book: ~35–50 words per spread in
   total, short sentences, *emphasis* on the fun words. Long text = long wait.

### The card is sized for ALL paragraphs from the start

The card's height now includes the after-paragraphs, so it's taller than
before. Check that at its final size it doesn't hide anything important on
your spread (move `textCard`, or move your pop-ups). The card is a pop-up
standing at the front of the left page, x ≈ −1.6…−0.4 (for `w: 0.8`).

### Hints

The show-me hand waits until the pencil stops writing. Interactions themselves
are live the whole time (a child may tap before the text is done — that's fine).

### Testing

- `?page=N` → watch: text writes in, arrow stays grey; do the interactions →
  after-text writes in → arrow pops and glows.
- Turn away and back: text rewrites from the start, interactions reset, arrow
  stays unlocked (a finished page stays finished).
