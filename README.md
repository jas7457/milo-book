# Milo to the Rescue! — a pop-up adventure

An interactive 3D pop-up book for Milo (age 5), made entirely in code: no 3D
models, no images, no sound files.

- Pages turn, and paper pop-ups fold up out of them.
- Some pop-ups fly out of the book into a paper diorama behind it, which
  changes on every page, so the story spills into the "real world".
- Milo stands beside the book as a paper doll and changes outfit for each
  adventure.

There are nine spreads: cover → Story time → Fix-it Milo → Dig, dig, dig! →
Bridge builder → Fire rescue! → Super Milo → Home again → The End.

It is made for iPad in landscape and for desktop.

**Play it:** https://jas7457.github.io/milo-book/. Every push to `main`
redeploys it automatically.

## Run it

```bash
npm install
npm run dev          # or: npx vite --port 5179 --host 127.0.0.1
npm run build        # production build in dist/
```

Open the printed URL. Useful switches:

| Switch | Effect |
|---|---|
| `?page=N` | Open at spread N (0–8) |
| `&fast` | Text writes 8× faster |
| `&unlock` | All pages unlocked |

## How to read it

Tap the arrow to open the book. Each page tells its story on a little card;
the words write themselves in. On each page, do the thing the card asks:

| Page | Action |
|---|---|
| Story time | Pull the tab |
| Fix-it Milo | Drag the battery into Robo, then hold the drill on the box |
| Dig, dig, dig! | Tap the dirt pile twice |
| Bridge builder | Drag the three blocks into the gaps |
| Fire rescue! | Drag the hose onto the fire and hold it |
| Super Milo | Pull the tab |
| Home again | Pull the tab or tap the lamp |

When you've done it, the rest of the story writes in and the arrow lights up.
A glowing outline and a little hand show what to touch if you get stuck. At
the end, "Read again" starts over.

## Built with

Vite, React 19, TypeScript, three.js with @react-three/fiber and
postprocessing, GSAP, zustand, WebAudio, and the Fredoka font.

## Docs

- [`AGENTS.md`](AGENTS.md): start here if you're changing the code
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how the engine works
- [`docs/STORY.md`](docs/STORY.md): characters, spreads and text
- [`docs/SPREAD_GUIDE.md`](docs/SPREAD_GUIDE.md): building a spread
- [`docs/NOTES.md`](docs/NOTES.md): feedback notes and backlog
