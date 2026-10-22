# User notes — collected, NOT actioned until user says "go"

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
