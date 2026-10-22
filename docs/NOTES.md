# User notes — collected, NOT actioned until user says "go"

How this file works: when the user gives notes, add them here, numbered, with
the files each one touches, and wait for "go". Once a round is done, mark it
DONE and leave the history in place. Open items live in the **Backlog** at the
bottom.

---
# Round 1 (notes 1–13) — DONE

All 13 notes were actioned, tested in the browser at 1180×820 and committed.

## 1. Page 1 (reading) — pull tab looks bad  [shared: PullTab.tsx]
- The purple PULL strip draws ON TOP of the "Let them…" label and cuts its text off
  ("Let them [fly]" / "pull the tab" are hidden). The strip should sit BEHIND the label
  (slide out from under it, like a real paper pull-tab sleeve).
- At rest it should still stick out far enough that the word "PULL >" is fully readable.
- CONFIRMED by user: applies to EVERY pull tab (reading "Let them fly", hero "Fly, Milo!", home "Lights out", any others) — fix in the shared PullTab component and check each one.

## 2. Page 1 (reading) — too many stars, crowded  [reading.tsx]
- The star cluster bursting out of the open book is too busy; can't tell what's going on.
  Fewer, larger, clearer stars; the scene should read at a glance.

## 3. Page 1 (reading) — stars fly out of the viewport on pull  [reading.tsx]
- After pulling, the stars escape off-screen, so the end state of the animation is never seen.
  Their flight targets / end positions must stay inside the camera view (iPad 1180×820),
  and the final resting state should be clearly visible.

## 4. Page 2 (tools) — Robo is hidden behind the story card  [tools.tsx]
- Robo's lower body/legs are covered by the text card, so it's not obvious the battery goes into him.
  Move Robo up/back (higher on the page, clear of the card) so his whole body — especially the
  battery slot on his chest — is visible. Re-aim the battery drop target + world escape to match.
- Also check the drag show-me hand: its demo currently ends half-hidden behind the card edge.

## 5. Page 2 (tools) — "BEEP BOOP" bubble clipped on the left  [tools.tsx / art/tools.ts]
- The left edge of the "BEEP" speech bubble is cut off (SVG viewBox/canvas too tight, or it
  sits behind something). Give the bubble art enough padding / reposition so it's fully visible.

## 6. Page 3 (digging) — tap ring is off-centre  [digging.tsx]
- The dashed "tap here" ring sits well below/in front of the dirt pile instead of around it.
  Centre it on the pile (pile stands up from its base, so the ring should be at the pile's
  footprint centre / visually around it). Same for the pile's glow/hand if offset.

## 7. Page 3 (digging) — 2 taps instead of 3  [digging.tsx]
- Finish after 2 scoops (dig.scoops >= 2): map pop-up, truck escape, hint conditions, queue cap,
  pile shrink stages, any "3" assumptions in text/art.

## 8. Page 3 (digging) — treasure map doesn't read as a map  [art/dig.ts]
- Redraw: classic treasure map — aged parchment with torn/curled edges, dashed trail,
  big red X, little palm/hills/compass rose, maybe rolled ends. Must read as "MAP!" instantly to a 5-year-old.

## 9. Page 3 (digging) — map clipped while hovering  [digging.tsx]
- When the map pops out and hovers, it gets cut off by the foreground (book/card/near plane).
  Move its hover position up and to the right so it's fully visible, then check its fly-to-world
  landing (MAP_TO) still lands in view.

---
# Across-the-board changes (all spreads)

## 10. Must finish the page's interactions before moving on  [shared: store/Controls + every spread]
- The "next" arrow is disabled (greyed, not clickable) until every required interaction on the
  current spread is done. Swipe-to-next and keyboard → also blocked. "Back" stays enabled.
- Needs a shared "spread complete" signal (e.g. each spread declares its required steps and marks
  them done; the store holds `done[spread]`). Once completed, a spread stays unlocked when revisited.
- When it unlocks, make the arrow come alive (pop/glow/wiggle) so the child knows to tap it.
- Cover (0) and any spread with no interaction count as complete immediately.

## 11. Story text "writes itself" into the book  [shared: StoryCard.tsx]
- Text should not just be there when the page opens; it appears as if being handwritten/inked in
  — letters/words revealed progressively along the line (pen-stroke / ink-wipe reveal, maybe a
  small pen nib or ink sparkle leading it), drop cap first.
- Must stay very readable (Fredoka). ANSWERED: read-aloud pace; NO skip-ahead (tapping does not finish it).

## 12. Text split into before-action / after-action parts  [StoryCard + every spread's text]
- Some sentences describe what the child is about to do (shown first, as the prompt);
  sentences describing the result appear (written in, per #11) only AFTER the action is completed.
- Each spread's text needs splitting into stages tied to its interactions, e.g.
  tools: "Robo was fast asleep. His battery was empty." → (battery in) → "Beep boop! Robo woke up!" …
  The card must have room for the full final text (or grow), and the after-text should write in
  as part of the reward moment. Ties into #10's completion signal.
- ANSWERED: OK to reword text so it splits cleanly (draft it, user reviews).
- #10: page unlocks only once its after-text has finished writing too (no skip-ahead).
- ANSWERED: cover stays unlocked from the start.

## 13. NEW final screen: back of the book, back home  [new spread 8 + Book.tsx + world]
- After the last spread (home/bedtime), the book closes and we see its BACK COVER
  (designed back cover art: e.g. title echo, little blurb/"The End", small Milo icon, barcode-style joke).
- The world returns to the house (Milo's real home/living room diorama, like the reading-page world).
- Easter eggs in the background world: the different versions of Milo from the story as paper
  cutouts around the house — builder Milo (hard hat/vest), firefighter Milo, Super Milo (cape),
  digger Milo, fix-it Milo with tools/belt — plus callbacks (Robo, the kitten, the treasure map, the
  box car, the glow stars, the truck). Maybe they wave/react when tapped.
- Keeps total pages within the 10-page limit (this makes 9 spreads incl. cover).
- Paper-doll Milo on the left in his everyday outfit (or pyjamas), waving goodbye.

---
# Round 2 (notes 1–11) — DONE

All built, tested end to end at 1180×820 and deployed. Highlights now wait
for their cue word in the story text (`src/cue.ts`).

1. **The writing starts too late on a new page.** The card sits blank too long after a turn.
   - Cause: the pencil waits for the whole turn to finish (`busy` false, ~3.2 s after the
     tap), then for the card to be fully up (`raise > 0.98`), then another `START_DELAY` 0.6 s.
     That's about 4 s of blank card.
   - Plan: start writing as soon as the card has popped up (~1.5–2 s in), not after the
     whole turn. Drop or shorten `START_DELAY`. Maybe show the heading and the big first
     letter right away, so the card is never empty.
   - Files: `src/book/StoryCard.tsx` (the `here` / `START_DELAY` check); maybe `src/store.ts`
     timing.

2. **Story time: the glow and the stars should only appear once the text says "the book began
   to *GLOW!*"** Right now they pop up with everything else, before the words are written.
   - Plan: add a general **text cue**. The card announces when a chosen word has been
     written (e.g. a bus event `'cue'` with the spread id and word). Spreads can then time
     things to the words.
   - Story time listens for the cue on "GLOW!". Until then the storybook lies shut and dark,
     and the stars, the light burst, the sparkles and the warm book light stay hidden. On the
     cue: the book glows, the burst springs open, the stars pop up one by one, with a sparkle
     sound.
   - The floor glow is painted into the page itself, so it is there from the start. Either
     leave it, or move it into a separate glowing layer that fades in with the rest.
   - **User: yes.** The "Let them out!" pull tab (and its hint hand) stays hidden until the
     glow. It pops up after the stars, by the time "Pull the tab!" is written.
   - Files: `src/book/StoryCard.tsx` (cue events), `src/story/pages/reading.tsx`; maybe
     `src/story/types.ts` (a way to mark cue words in the text) and `src/popup/Piece.tsx` (a
     `show` gate for pieces).


3. **The show-me hand looks bad. Redraw it.** Today it is a white cartoon glove with a yellow
   cuff (`handArt` in `src/popup/HintHand.tsx`).
   - Plan: draw a new, friendlier hand in the book's paper style. Mock up two or three
     options on `art.html` and let the user pick before wiring it in.
   - Files: `src/popup/HintHand.tsx`; `debug/art.ts` for the preview.

4. **The demo must get out of the way the moment the child reaches for the piece.** If you
   hover over a piece (or touch it) while the hand is showing the move, the demo should stop
   at once. The piece should jump back to where it started, so you can grab and drag it
   straight away instead of waiting for the demo to finish.
   - Today: only a pointer *press* (or a key) cancels the hand. Hovering does nothing. During
     a drag demo the hand carries the *real* piece, so a child pressing where the piece
     started finds it isn't there. The press also misses, as seen when testing the bridge.
   - Plan:
     - Cancel the demo on any pointer move, as well as any press.
     - On cancel, snap the piece back to its start in about 0.15 s.
     - Keep its grab area at the start spot during the demo, so pressing there always picks
       it up.
     - Also let a press on the piece mid-demo grab it right where it is.
     - Applies everywhere the hand demos a drag or a tap: the battery and drill (tools), the
       bridge blocks, the hose (fire), the dirt pile (dig), and the pull tabs.
   - Files: `src/popup/hint.ts` (count pointer moves as input), `src/popup/HintHand.tsx`
     (abort), `src/popup/DragPiece.tsx` (snap back, grab during demo),
     `src/popup/PullTab.tsx` (same for the tab's strip).


5. **Fix-it Milo: wheels you put on yourself.** Today the drill makes two holes in the box,
   and then the wheels just appear on their own. New flow:
   1. Hold the drill on the box: it drills the **two holes** (and the wheels do *not* appear).
   2. Then **drag the two wheels** onto the holes. They clip on with a *snap*, and the flag
      pops up. Then *Vroom!* the box car zooms off into the workshop like now.
   - The two wheels sit on the page from the start, e.g. lying by the box at the front right,
     clear of the card. They stay inert until both holes are drilled: no glow, no hint hand,
     and they can't be picked up (a tap gives a little wiggle). Once the holes are drilled,
     they light up, and the show-me hand demos one.
   - Either wheel fits either hole (easier for a 5-year-old). Each hole shows a dashed ring
     while it is empty.
   - Beats go from 2 to 3: 1 = battery in, 2 = holes drilled, 3 = both wheels on.
   - **Story text change: APPROVED by the user** (paragraphs 1–2 unchanged):
     - after 2: "*Bzzz!* Milo drilled two holes in a box. Now pop on the *wheels!*"
     - after 3: "*Snap, snap!* *Vroom!* Off zoomed the box car!"
   - Needs the `DragPiece` `disabled` prop from the backlog, which would also replace the
     `WakeGate` workaround for the drill.
   - Files: `src/story/pages/tools.tsx` (flow, beats, text, wheel pieces),
     `src/popup/DragPiece.tsx` (`disabled`), `docs/STORY.md`.


6. **Fix-it Milo: the battery only starts to glow when the text says "His battery was
   *empty*."** Right now its glow (and the hint hand) are on from the moment the page opens.
   Starting the glow on that word catches the child's eye exactly when the story tells them
   what to do.
   - Uses the same text cue as note 2: the card announces "empty", and the battery's `hint`
     switches on then. Before that it is a plain battery. It can still be dragged early, if a
     child finds it on their own.
   - Proposal (ask the user): make this the rule on **every** page. Each glow and hint hand
     waits for the words that ask for it:
     - "Pull the tab!" (Story time)
     - "Tap the dirt!" (Dig)
     - "Pop the blocks in the gaps!" (Bridge)
     - "Quick, aim the *hose!*" (Fire)
     - "Help him *fly*!" (Super Milo)
     - "Can you turn the *lights out*?" (Home)
     - the wheels after "Now pop on the *wheels!*" (note 5)
   - Files: `src/book/StoryCard.tsx` (cue), `src/popup/hint.ts` / `Piece.tsx` /
     `DragPiece.tsx` / `PullTab.tsx` (a hint can wait for a cue), `src/story/pages/tools.tsx`
     (and the other pages if the rule applies everywhere).


7. **Dig: the "TAP!" bubble and the dashed ring around the dirt pile only appear once the
   text says "Tap the dirt!"** The pile's glow and hint hand wait for that too. Before that,
   it is just a dirt pile.
   - Same text cue as notes 2 and 6. This is the second page where the user wants it, so
     treat the note 6 proposal ("every glow, ring, bubble and hint hand waits for the words
     that ask for it") as the likely rule. Confirm with the user.
   - Files: `src/story/pages/digging.tsx` (`HintRing`, the "TAP!" bubble, the pile's `hint`),
     plus the shared cue from note 6.


8. **Dig: the treasure map lands tilted a lot after it flies out into the world.** It looks
   wrong sitting crooked behind the foreground.
   - Likely cause, two tilts stacking up:
     - The map's escape ends with a sideways turn (`spin: 0.5` rad ≈ 30°).
     - The map is still attached to the book, so it keeps the book's 0.3 rad (≈ 17°) lean
       toward the reader even when it is out in the world.
     - The idle float adds a little rock on top.
   - Plan:
     - Make it land upright, facing the camera, with only a gentle sway.
     - Add an escape option to `Piece` (e.g. `upright`) that gradually cancels the book's
       tilt and the spin as the piece flies, so it ends level in the world.
     - Then check the other pieces that fly out the same way: Robo's truck (`spin 0.35`),
       the box car, the Story time stars, the bedtime stars and the Super Milo kitten.
   - Files: `src/popup/Piece.tsx` (escape rotation), `src/story/pages/digging.tsx` (map
     escape settings).


9. **Bridge: the blocks and their slots only light up once the text asks for them ("Pop the
   blocks in the gaps!").** Until then there are no glows, coloured ghosts or bouncing arrows
   in the gaps, and no hint hand.
   - **This settles the rule from note 6 for the whole book** (the user asked for it on
     tools, dig and bridge): every glow, ring, bubble, ghost, arrow and hint hand waits for
     the words that ask for it. Build it once, in the shared code (a hint can wait for a
     text cue), and use it on every page, including fire ("aim the *hose!*"), Super Milo
     ("Help him *fly*!") and home ("turn the *lights out*?").
   - Files: `src/story/pages/building.tsx` (block `hint`s, the ghost and arrow parts in the
     gaps), plus the shared cue from note 6.

10. **Super Milo looks weird: too flat, too busy, confusing.** The user likes the buildings in
    the background world. The ones in the book look too flat, and there is too much going on.
    - What the lead sees (live screenshot, page 6):
      - The printed pages are a **top-down city map** (rooftops, roads, pools, AC units) in
        purple and pink. It fights with the upright skyline, and the eye can't tell what's
        up and what's flat.
      - A pile of flat stickers lies on the page: the "ZOOM!" burst, "UP, UP!", "WHOOSH",
        dotted flight-path loops, the **M** and heart target badges, and an arrow.
      - Flying Milo lies flat on the page among them.
      - The skyline pop-up is one mostly flat row of cut-out fronts, with no depth between
        the buildings.
    - Plan (show the user a mock-up screenshot before building it all):
      - **Calm the printed page.** Replace the map with a simple street scene in perspective,
        or a soft sky and park, with a few big shapes and a quiet palette. It should be
        background, not pattern.
      - **Remove the clutter:** the dotted loops, the target badges, the arrow, and most of
        the sound-word stickers. Keep at most one "ZOOM!" that pops up *when Milo flies*.
      - **Give the buildings real depth.** Make them box-folded pop-ups with a front and a
        side face at an angle, like the background world's, staggered over 2–3 rows at
        different depths and heights. Use fewer, bigger buildings: the Sky Cafe, the Tallest
        Tower with the kitten, and two or three others.
      - **Milo stands upright** on a low rooftop at the front, cape fluttering, ready to fly,
        instead of lying flat. The pull tab launches him from there.
      - Keep the flight, the loop, the kitten landing on the cloud and the hearts.
    - Files: `src/story/pages/superhero.tsx`, `src/art/hero.ts` (page art, buildings, Milo
      pose); maybe a shared box-fold helper in `src/popup/` if the buildings need side faces.

11. **Back cover (the living room at the end): make the room playful.** Six parts:
    - **a. The lamp is a light switch.** Tapping the floor lamp turns it off and on.
      - When off: the room goes dusky blue, the lamp shade stops glowing, and **moonlight
        comes in through the window**: a soft blue-white beam from the window (top right of
        the back wall) with a pale pool of light on the floor. The glow-stars glow brighter.
      - Tap again for warm lamp light.
      - Needs a scene-wide light dimmer that `Environment` and `BookLight` both follow. This
        is the same piece the bedtime "Lights out" needs (backlog), so build it once.
      - Files: `src/story/pages/backcover.tsx`, `src/story/pages/room.tsx` (lamp,
        window); `src/world/Environment.tsx`, `src/scene/BookLight.tsx`, `src/state.ts`
        (dimmer).
    - **b. Mom and Dad sit on the couch.** Use slim sitting figures in their everyday
      clothes (from `family.ts`), scaled to the room, smiling at the book.
      - The firefighter and builder Milos currently sit on the sofa; they move as part of d.
      - Maybe they wave when tapped.
      - Files: `src/story/pages/backcover.tsx`, `src/art/family.ts` (world-size versions if
        needed).
    - **c. Knock-over blocks that spell MILO.** Make the toy-block stack **four blocks**
      (today it's a 3-block pile reading M, I, L). Tapping it knocks the tower over with a
      clatter, and the blocks tumble and land in a row reading **M-I-L-O**. Tap again to
      restack.
      - Draw the letters as paths, not SVG text (same font problem as the cover title).
      - Question: the blocks are part of the shared living room, which also appears on the
        cover and Story time. Make them knockable there too, or only on the back cover?
      - Files: `src/story/pages/room.tsx` (`toyBlocks` → 4 separate block pieces) and/or
        `backcover.tsx`.
    - **d. The costume Milos become action figures.** Shrink them from life-size (today
      2.0 tall, the same as the real Milo) to toy size, about a third of that. Put each on a
      little plastic display stand, maybe with a bit of shine, so they read as toys.
      - Firefighter, builder and fix-it Milo go on the side table, the shelf and the rug.
        Super Milo is a small toy on a string.
      - Files: `src/story/pages/backcover.tsx`.
    - **e. The toy excavator digs when tapped.** Tapping it makes its arm and bucket do a
      scoop: down, curl, up, dump, with a little dirt puff and a sound.
      - The digger is one flat picture today (`toyDigger` in `room.tsx`). Split it into a
        body, an arm and a bucket on hinges (`Part`).
      - Files: `src/story/pages/room.tsx` (and possibly `src/art/dig.ts` for reuse).
    - **f.** Check the ending camera still frames all of this on iPad (1180×820).

---
# Backlog (not yet actioned — open items, from the lead's review)

Decisions waiting on the user:
- Optional answers from Jen: Milo's favourite toy, stuffed animal or pet, and favourite colour.

Consistency / polish:
- Embed Fredoka in `svgDoc`: SVG text rasterised from data URLs can't see page fonts.
- Page 5 (fire): the palette has a heavy red cast.
- Cover: the squished "to the Rescue!" title (same Fredoka fix as above).
- Cover: the MILO block tower is cropped at the right edge (`room.tsx`, group at x=3.1).
- Back cover: the moonbeam is hard-edged (tune `MoonBeam` 0.06/0.95). The toy excavator could use the new `thud` sfx.
- Page 4 world: clipping.
- Back cover: tune the camera for the iPad aspect; the sofa is too dark.
- StoryCard: `textCard.y` is ignored and the card width is fixed (`CARD_W 1.2`). Make `y`/`w` work to free space on the left page.
- Tools: the drill still uses a local `WakeGate`; it could move to `DragPiece disabled`.

Performance / tech:
- `Milo.tsx` uses bare `svgTexture`, so its textures are never freed. Switch it to `useSvgTexture`.
- Do a performance and memory pass on a real iPad.
- ~~Add a loading screen~~ (done: M-I-L-O blocks screen + cover intro). Particles still open.
- Fix the favicon 404, and the THREE.Clock deprecation warning.
- Optional: drag to rotate the camera.
- Ximena once saw the right page's printed art render blank white under heavy machine load. Not reproduced; watch for it.
