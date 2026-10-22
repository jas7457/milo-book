# AGENTS.md — Milo to the Rescue!

Instructions for any coding agent (or person) working in this repo. Read this
first, then the doc that fits your task (see **Docs** at the bottom).

## What this is

An interactive **3D pop-up book** for Milo, age 5, in the browser. It is built
entirely in code: no 3D models, no image files, no fonts besides Fredoka.

- Pages turn and pop-ups fold up out of the paper. Some pop-ups fly out of the
  book into a paper-craft **world diorama** behind it, so the story "bleeds into
  the real world".
- Milo stands next to the book as an animated paper doll in each page's outfit.
- Each page has one to three small interactions: pull a tab, drag, tap, or hold.
  The next-page arrow stays locked until the page's interactions are done and
  its story text has finished writing.

The quality bar is a professional paper-engineered pop-up book: painted pages,
10–20 layered die-cut pieces per spread, ink outlines, shading and highlights.

**Stack:**
- Vite 8, React 19, TypeScript (strict)
- three.js 0.186, @react-three/fiber 9, drei 10, postprocessing
- gsap 3 (all choreography), zustand 5 (UI state)
- WebAudio-synthesised sound effects

## Commands

```bash
npm install
npx vite --port 5179 --host 127.0.0.1      # dev server (the usual port in this project)
npx tsc -p tsconfig.app.json --noEmit       # typecheck — must be clean before every commit
npm run lint                                # oxlint
npm run build                               # tsc -b && vite build
```

The dev server may already be running; check before you start another one with
`lsof -i :5179`.

**URL switches** (dev and prod; never on by default):

| Switch | Effect |
|---|---|
| `?page=N` | Open at spread N (0 cover … 8 back cover) |
| `&fast` | Story text writes 8× faster |
| `&unlock` | Every next-arrow is unlocked from the start |

Example: `http://127.0.0.1:5179/?page=4&fast&unlock`.

## Deploy

- **Live site:** **https://jas7457.github.io/milo-book/**
- **Repo:** `github.com/jas7457/milo-book`
- **How it deploys:** every push to `main` runs
  `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages
  in about 40 s. Check it with `gh run list -L 1`.
- **Base path:** builds use `base: '/milo-book/'` (`vite.config.ts`).
  - Never hard-code absolute `/...` asset paths.
  - Test a build locally under that path, e.g. copy `dist` to
    `/tmp/pages/milo-book` and run `python3 -m http.server`.
  - Note: `vite preview` returned 404s to the browser here.

`art.html` (`/art.html`) is a scratch page for looking at single SVG art pieces
(currently the family figures).

## Non-negotiable product rules

These come from the family (Mom is Jen, Dad is Brett) and the user. Don't break them.

1. **Audience and devices:** a 5-year-old on an **iPad in landscape (1180×820)**
   or on desktop. Not phones. Test at 1180×820. Everything big, bright,
   tappable and readable.
2. **No more than 10 spreads.** There are 9 now: cover, reading, tools,
   digging, building, firefighter, superhero, home, back cover.
3. **Everything in code:** SVG art rasterised to textures, plus shaders. No
   model, image or audio files. No network access. Fredoka is the only font.
4. **Who is in the book:** only Milo, Mom (Jen) and Dad (Brett), plus invented
   side characters (Robo, the baker, the kitten…). Never draw the girl from the
   family reference photo. Character looks are in [`docs/STORY.md`](docs/STORY.md).
5. **Figures use slim storybook proportions** (head ≈ 1/4.5 of the height). The
   user dislikes figures that look fat or short.
6. **Text** must be easy to read. Story text is short, about 35–50 words per
   spread. `*word*` marks the coloured accent words.
   - **When you change story text, show the user the final wording verbatim.**
7. **Pacing:**
   - Text writes itself in at read-aloud pace and can't be skipped.
   - A page must be finished before the next arrow unlocks.
   - A finished page stays unlocked when you come back to it, but its pop-ups
     and text replay.
   - "Read again" relocks every page.
8. **Debug aids** (buttons, key hooks, overlays) only behind a URL debug switch
   (`src/debug.ts`). Never leave them on by default, and remove temporary ones
   before you report.
9. **Leave these out of the book:** fact cards, and the dark table backdrop.

## Working with the user

- **Notes workflow:** when the user gives feedback notes, collect them in
  [`docs/NOTES.md`](docs/NOTES.md) (numbered, with the files each one touches)
  and **don't act until the user says "go"**.
- After each finished piece of work, send a short **plain-language update** (no
  jargon) of what changed and what was tested, with screenshots when useful.
- When you're unsure about the story or the art, ask. The user is the
  storyteller.

## Repo map

```
src/
  main.tsx            boot: initAnim, initProgress, ?page=N jump
  App.tsx             <Canvas> + <Controls>
  config.ts           book dimensions + page-turn timing T
  state.ts            `anim` (mutable per-frame values), `ui` (pointer flags), Palette, Outfit
  store.ts            zustand `useBook`: go(dir) / restart() + the page-turn GSAP choreography, useNearSpreads
  progress.ts         beats / written paragraphs / done → gates the next arrow
  bus.ts              tiny event bus ('sfx', 'milo', 'pull', 'turn', 'flip', …)
  sfx.ts              WebAudio synthesised sounds (listens to bus 'sfx')
  debug.ts            ?fast / ?unlock
  book/               the book: leaves, boards, page textures, the self-writing StoryCard
  popup/              pop-up engine: Piece, PopCard/Part, PullTab, DragPiece, hints (Glow, HintHand)
  world/              world dioramas behind the book: Cutout, Environment (sky/ground/lights), Worlds
  scene/              Scene, CameraRig, BookLight
  milo/               the paper-doll Milo rig + outfit art
  ui/Controls.tsx     DOM arrows, page dots, swipe/keys, "Read again"
  art/                SVG art: texture.ts (svgDoc → texture), style.ts (INK…), kit.ts (stars,
                      clouds, trees…), family.ts (Mom/Dad/Milo), tools.ts, + per-spread art files
  story/
    spreads.ts        THE BOOK: ordered list of SpreadDefs + world registry
    types.ts          SpreadDef, Para
    palettes.ts       colour moods per world
    pages/*.tsx       one file per spread: SpreadDef + Popups + Director + World
docs/                 see below
debug/, art.html      art preview page
```

## Architecture in one paragraph

One three.js scene holds both the book and the world, which is what lets
pop-ups escape out of the book.

- All motion is driven by GSAP tweening plain mutable numbers in `anim`
  (`state.ts`), which `useFrame` loops read every frame. There are no React
  re-renders per frame.
- A page turn is one GSAP timeline in `store.ts`, in this order:
  1. pop-ups fold down;
  2. the world folds away;
  3. the palette bleeds into the next one;
  4. the leaf bends over;
  5. the new world rises, nearest pieces first;
  6. the new pop-ups spring up and Milo twirls into his new outfit.
- Each spread is a `SpreadDef` in `src/story/pages/<name>.tsx`. Its state lives
  in module-level objects, and a `Director` component resets them when the
  page turns away.
- Only nearby spreads are mounted, and textures are ref-counted, to keep iPad
  memory down.

Full detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Conventions

- **Coordinates:**
  - **Book space** (pop-ups): `PopCard at=[x, z]`, with x −1.6…1.6 (spine at 0)
    and z −1.1 (far edge) … 1.1 (near edge).
  - **World space** (cutouts): the world is behind the book at negative z (back
    wall ≈ z −10.5, about ±17 wide). Milo stands at x −2.5, front left.
- **The story card** stands on the left page at x ≈ −1.6…−0.4 and is sized for
  all paragraphs from the start. Keep important pop-ups clear of it. Only
  `textCard.x` and `.w` are used, to centre it; the card width is fixed and `y`
  is ignored.
- **Art:** `svgDoc(w, h, body, { cut })` builds a die-cut paper piece. Use
  `INK #3b2a20` for outlines, and give every piece shading, a highlight and small
  details. Use `px={1024|2048}` on big pieces.
- **Spread-local state:** keep it in module objects (`const robo = { power: 0 }`).
  Reset it in the spread's `Director` when `anim.raise[index].v` drops. Keep GSAP
  timelines in a module array and `kill()` them there too, or sounds fire on the
  next page.
- **Highlights wait for the story** (user rule): glows, rings, bubbles, hint
  hands and pull tabs switch on only once the card has written the words that
  ask for them. Use `heard(spreadId, word)` from `src/cue.ts` with the `hint` /
  `gate` props (see ARCHITECTURE §5 "Text cues").
- **Gating:** declare `beats: n` and call `beat(id, k)` at the story moment the
  result appears. Split the text into before and after paragraphs
  (`{ after: k, text }`).
- **Reusable mechanics:**
  - `PullTab` emits `bus 'pull' id`;
  - `DragPiece` handles drop and hold-over-target;
  - `Piece` `hint` gives the glow, wiggle and show-me hand.

  Reuse these instead of writing new pointer code.
- **Sounds:** `bus.emit('sfx', name)`. The available names are listed in
  `src/sfx.ts`. Add new ones there; they are synthesised, not files.
- **Milo reactions:** `bus.emit('milo', 'wave' | 'cheer' | 'point' | 'jump')`.
- **TypeScript is strict** (`noUnusedLocals`, `noUnusedParameters`).

## Testing in the browser

Always look at the real thing. Screenshot at 1180×820, wait 7–10 s after
loading for the pop-ups to rise, and test interactions with real pointer
input, not by calling the handler.

r3f reads `offsetX`/`offsetY`, so synthetic events need them defined:

```js
const c = document.querySelector('canvas')
const ev = (t, x, y) => { const e = new PointerEvent(t, { bubbles: true, pointerId: 1,
  pointerType: 'touch', isPrimary: true, button: 0, buttons: t === 'pointerup' ? 0 : 1,
  clientX: x, clientY: y })
  Object.defineProperty(e, 'offsetX', { get: () => x }); Object.defineProperty(e, 'offsetY', { get: () => y })
  c.dispatchEvent(e) }
// drag: pointermove to start → wait 200 ms → pointerdown → ~20 pointermoves (30 ms apart) → pointerup
// hold: keep sending pointermoves at the target (~40 × 80 ms) before pointerup
```

- **The camera parallaxes toward the pointer.** Send a `pointermove` to the
  start point and wait before pressing.
- **Hint hands:** wait for the show-me hand to finish its demo before you
  drag, or the drag misses.
- **Useful hooks from a page script:**
  - `(await import('/src/store.ts')).useBook.getState()`
  - `(await import('/src/progress.ts')).useProgress.getState()`
  - Monkeypatch `bus.emit` from `/src/bus.ts` to log events.
  - The arrow's state is `document.querySelector('.turn.next').className`:
    `locked` or `ready`.
- **Checklist for every spread:**
  1. The text writes in and the arrow stays grey.
  2. Do each interaction: its after-text writes in and the arrow pops and glows.
  3. Turn away and back: everything resets, the text rewrites, and the arrow
     stays unlocked.
  4. Nothing important is hidden behind the card.
  5. Pieces that fly out land inside the 1180×820 frame.
- **Hot reloads:** Vite reloads the page whenever a file is saved. If several
  agents are editing, expect "Execution context was destroyed"; reload and retry.

## Parallel work (sub-agents)

- **Who owns what:** workers own only their spread file
  (`src/story/pages/<x>.tsx`) and new art files only they use
  (`src/art/<x>.ts`). Shared files belong to the lead:
  - `spreads.ts`, `palettes.ts`, `types.ts`, `store.ts`, `progress.ts`;
  - everything in `popup/`, `book/`, `scene/` and `milo/`;
  - `sfx.ts`, `bus.ts`, `kit.ts`, `style.ts`, `family.ts`, `tools.ts`.

  Workers list the shared changes they need in their report.
- **Commits:** workers don't commit; the lead reviews, tests and commits each
  piece of work separately.
- **Spread guide:** [`docs/SPREAD_GUIDE.md`](docs/SPREAD_GUIDE.md) is the brief
  given to spread workers.

## Known issues / backlog

See the "Backlog" section of [`docs/NOTES.md`](docs/NOTES.md).

## Docs

| File | What it's for |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the engine works: scene, animation model, page turn, pop-ups, worlds, camera, gating, memory |
| [`docs/STORY.md`](docs/STORY.md) | The book's content: characters, every spread's interactions, beats, text (verbatim), worlds |
| [`docs/SPREAD_GUIDE.md`](docs/SPREAD_GUIDE.md) | How to build or change a spread (worker brief + engine cheat sheet) |
| [`docs/NOTES.md`](docs/NOTES.md) | The user's notes inbox (collect, wait for "go") + backlog |
