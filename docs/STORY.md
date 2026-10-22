# The story — "Milo to the Rescue!"

The content bible: who is in the book, what happens on every spread, and the
exact story text. **If you change anything here in code, update this file, and
show the user any new story text verbatim.**

The text below is copied from `src/story/pages/*.tsx`. `*word*` = an accent
word, drawn bold and coloured on the card.

## Who it's for

Milo, age 5. The book was made for him by his family. Mom (Jen) chose his five
big interests, and each one has a spread:

| Interest | Spread |
|---|---|
| Reading | 1 Story time |
| Using tools (fixing things, changing batteries, drilling holes in cardboard) | 2 Fix-it Milo |
| Digging (excavators, bulldozers) | 3 Dig, dig, dig! |
| Building | 4 Bridge builder |
| Rescuing | 5 Fire rescue! and 6 Super Milo |

The book ends at home at bedtime (7), and then on the back cover (8).

Answers still wanted from Jen (optional): Milo's favourite toy, stuffed animal
or pet, and favourite colour. Until then the book uses its own choices (Robo
the robot, the kitten, red and gold).

## Characters

**Milo** is the paper doll beside the book, and also appears inside the pop-ups.
- **Look:** dark tousled hair, big brown eyes, rosy cheeks.
- **Everyday outfit:** grey tank top and shorts, white socks.
- **Outfit per spread:**

  | Outfit | Spreads |
  |---|---|
  | `plain` | cover, reading |
  | `tools` (tool belt) | 2 |
  | `hardhat` (hard hat + hi-vis vest) | 3, 4 |
  | `firefighter` | 5 |
  | `superhero` (blue mask, red cape, "M" badge) | 6 |
  | `pajamas` (blue with stars) | 7, back cover |

- **Reactions:** wave, cheer, point, jump.

**Mom (Jen):**
- **Hair:** long, loose, wavy dark-brown hair that lightens to caramel at the
  ends, parted near the centre.
- **Face:** warm light-tan skin, a big laughing smile, crinkly crescent eyes.
- **Clothes:** oatmeal turtleneck, brown trousers, cognac ankle boots.

**Dad (Brett):**
- **Hair:** short brown hair, short at the sides and swept up on top. A short
  trimmed full beard.
- **Face:** fair skin, a big toothy grin.
- **Clothes:** light-grey henley, light-wash jeans, tan boots.

**Figures:** slim storybook proportions, head ≈ 1/4.5 of the height. Never fat
or short. Parents are drawn in a slim three-quarter view. Art is in
`src/art/family.ts` and `src/art/homeFamily.ts`.

**Robo** is a teal toy robot Milo wakes up in the workshop. He is a recurring
friend: he drives the dump truck at the dig site and is a cutout on the back
cover.

**Side characters:** the baker (fire rescue), the ginger kitten (Super Milo),
and a teddy bear (bedtime).

**Never in the book:** the girl from the family reference photo.

## The spreads

The arrow on each spread unlocks once the interactions are done and the text
has finished writing.

| # | id | Heading | World | Palette | Beats |
|---|---|---|---|---|---|
| 0 | `cover` | — | `room` | livingRoom | 0 |
| 1 | `reading` | Story time | `room` | glowRoom | 1 |
| 2 | `tools` | Fix-it Milo | `workshop` | workshop | 3 |
| 3 | `digging` | Dig, dig, dig! | `digsite` | digSite | 2 |
| 4 | `building` | Bridge builder | `bridge` | building | 3 |
| 5 | `firefighter` | Fire rescue! | `firetown` | fire | 1 |
| 6 | `superhero` | Super Milo | `skyline` | sky | 1 |
| 7 | `home` | Home again | `bedroom` | bedtime | 1 |
| 8 | `back` | (back cover) | `house` | eveningRoom | 0 |

### 0 — Cover (`pages/room.tsx`)

- **Book:** the closed book lies on the living-room rug.
  - Cover art: Super Milo waving, with the title "Milo / to the Rescue!" and
    the subtitle "a pop-up adventure".
- **World:** the living room, with a sofa and toy blocks spelling M-I-L-O.
- **Interaction:** tap the arrow to open the book. It is unlocked from the
  start, and a bubble says "Tap the arrow to open the book!".

### 1 — Story time (`pages/reading.tsx`)

- **Pop-ups:** Milo reading on the sofa with Mom and Dad, a glowing book, 4
  big twinkling stars, and a toy fire truck.
- **The glow waits for the words:** until the card writes "the book began to
  *GLOW!*", the book is plain: no burst, no stars, no light, no pull tab. On
  that word the burst springs up, the book lights, the stars pop out one by one,
  and then the pull tab appears.
- **Interaction:** the **"Let them out!" pull tab**. It sends the 4 stars flying
  out into the living room, where they land in front of the sofa in view.
  Beat 1 fires on the pull.
- **Text:**
  > This is *Milo*. He LOVES books! Every night he reads with *Mom* and *Dad*... but tonight, the book began to *GLOW!* Pull the tab!
  >
  > *(after 1)* *Whoosh!* Out flew the stars, twinkling all around the room!

### 2 — Fix-it Milo (`pages/tools.tsx`)

- **Pop-ups:** a workshop pegboard full of tools, sleeping Robo, a battery, a
  drill, a cardboard box, and two loose wheels.
- **Interactions:**
  1. **Drag the battery into Robo's chest.** It only starts to glow once the
     card writes "*empty*". Robo powers up, waves, says "BEEP BOOP", and walks
     out into the world.
  2. **Hold the drill on the box** (the drill only appears once Robo is awake).
     It drills two holes.
  3. **Drag the two wheels onto the holes** (either wheel, either hole). The
     wheels are inert until the holes are drilled and light up on "*wheels!*".
     Snap, snap, the flag pops up, and the box car zooms off.
- **Text:**
  > *Whoosh!* Milo landed in his *workshop!* Robo the robot was fast asleep. His battery was *empty*.
  >
  > *(after 1)* *Click!* In went the battery. *Beep boop!* Robo woke up and waved.
  >
  > *(after 2)* *Bzzz!* Milo drilled two holes in a box. Now pop on the *wheels!*
  >
  > *(after 3)* *Snap, snap!* *Vroom!* Off zoomed the box car!

### 3 — Dig, dig, dig! (`pages/digging.tsx`, art `art/dig.ts`, `art/digWorld.ts`)

- **Pop-ups:** a "DIG SITE · MILO'S CREW" banner, a yellow excavator with Milo
  in the cab, Robo's blue dump truck, and a dirt pile with a dashed tap-ring
  and a "TAP!" bubble.
- **Interactions:** **tap the dirt twice.** The dashed ring, the "TAP!" bubble
  and the glow only appear once the card writes "Tap the *dirt!*".
  1. The arm scoops and dumps into Robo's truck.
  2. The pile is cleared, and a **treasure map** pops up: parchment, an island
     with a palm tree, a compass, a dotted trail and a red X. The map twirls
     out to the upper right of the world and lands standing straight, and the
     truck drives off.
- **Text:**
  > Robo zoomed off to the *dig site*, and Milo raced after him! Hop in the big yellow *excavator*. Tap the dirt!
  >
  > *(after 1)* *Scoop!* Milo dumped the dirt in Robo's truck. *Thump!*
  >
  > *(after 2)* *Scoop!* Look! Under the dirt... a *treasure map!*

### 4 — Bridge builder (`pages/building.tsx`, art `art/bridge/*`)

- **Pop-ups:** a river with a broken bridge and a "NO BRIDGE!" sign, a crane,
  the treasure map, a truck waiting on the left bank, and three coloured arch
  blocks.
- **Interactions:** **drag the three blocks into their gaps**, in any order.
  - Red goes in the left gap, yellow in the middle and green on the right (green, not blue, so it stands out against the river).
  - Each gap has a dashed outline and a bouncing arrow in its block's colour.
    They (and the blocks' glow) only appear once the card writes "Pop the
    blocks in the *gaps!*".
  - The blocks start side by side in a row: red, yellow, green.
  - When all three are in, the bridge is built in the book *and* in the world.
    Confetti flies, the sign changes to "HOORAY", and the truck drives across.
  - The beat count is the number of blocks placed.
- **Text:**
  > The shiny thing was a *treasure map!* The path crossed a river... but there was *no bridge!* "Let's build one!" said Milo. Pop the blocks in the gaps!
  >
  > *(after 1)* *Click!* The first block fit.
  >
  > *(after 3)* Two blocks, three blocks... the bridge went *all the way across!*

### 5 — Fire rescue! (`pages/firefighter.tsx`, art `art/fireArt*.ts`, `art/fireWorldArt.ts`)

- **Pop-ups:** a fire station, a clock tower, the bakery with a fire in its
  oven house, a big red fire truck with Milo and a dalmatian, a hydrant, a
  hose nozzle, and the baker ("My buns!").
- **Interaction:** **drag the hose nozzle onto the fire and hold it there.**
  - The fire goes out.
  - A rainbow pops up, the baker cheers ("HOORAY!"), and the fire truck drives
    out into the street.
  - Beat 1 fires when the fire goes out.
- **Text:**
  > *Ding-ding-ding!* Smoke over the bakery! Firefighter Milo jumped on the big red *fire truck.* Quick, aim the *hose!*
  >
  > *(after 1)* *SPLOOSH!* The fire went out. The baker cheered, and a *rainbow* popped up!

### 6 — Super Milo (`pages/superhero.tsx`, art `art/hero.ts`)

- **Pop-ups:** a calm town square (no printed map or stickers) with
  box-folded buildings at different depths: the Sky Cafe, a brick block, and
  the Tallest Tower with the kitten stuck on top. Super Milo stands upright on
  the roof of a little bakery at the front, cape fluttering.
- **Interaction:** the **"Fly, Milo!" pull tab** (it lights up on "*fly*!").
  1. A "ZOOM!" pops up as Milo takes off and scoops the kitten off the tower.
  2. He loops the loop.
  3. He lands back on his roof; the kitten and hearts float out to a cloud in
     the sky world.

  Beat 1 fires at the landing. Pulling again replays the flight.
- **Text:**
  > Oh no! A tiny kitten was stuck on the *tallest tower*! *"Meow!"* Milo put on his cape. Help him *fly*!
  >
  > *(after 1)* *Up, up and away!* Milo scooped her up, looped the loop, and landed *safe and sound*.

### 7 — Home again (`pages/home.tsx`, art `art/homeRoom.ts`, `art/homeFamily.ts`, `art/homeWorld.ts`)

- **Pop-ups:** Milo's bedroom.
  - On the walls: shelves of books and toys (a little Robo, a wooden truck),
    a row of Milo's drawings of the adventures, a star mobile and a moon
    window.
  - Around the room: a "TOYS" chest, a bed, a big floor lamp and a teddy bear.
  - In the middle: Mom and Dad kneeling and hugging pyjama Milo.
- **World:** the front yard of the house at night, with fireflies and a black
  cat.
- **Interaction:** **tap the big floor lamp** (it glows, with the show-me
  hand, from "*lights out*?" until it's off). There is no pull tab.
  - Click! The room goes dark and moonlight shines in through the window: a
    soft beam and the window's panes on the floor (like the back cover).
    Glow-stars come out, the mobile's stars float out over the yard, and Milo
    snoozes (Zzz).
  - Beat 1 fires on lights-out. Tapping again turns the lamp back on.
- **Text:**
  > Home at last! Mom and Dad gave Milo the biggest, squeeziest *hug*. Now it was time for bed. Can you turn the *lights out*?
  >
  > *(after 1)* The moon peeked in. The stars went *twinkle, twinkle*. "What an adventure!" yawned Milo. *Goodnight, Milo.*

### 8 — The back cover (`pages/backcover.tsx`, art `art/backcover.ts`)

- **The book:** it closes, and the back cover shows "The End".
  - In the middle: a gold medal with pyjama Milo, ringed by 7 badges (book,
    wrench, excavator, bridge, fire helmet, cape, moon).
  - Along the bottom: "Goodnight, Milo!", a star sticker and a smiley barcode.
- **World:** the living room in the evening, seen wide. Easter eggs:

  | Where | What |
  |---|---|
  | On the sofa | Mom and Dad |
  | Action figures | Firefighter Milo (shelf), fix-it Milo (side table), builder Milo (floor) |
  | Overhead | Super Milo toy on a string from a wall hook |
  | On the sofa arm | The kitten |
  | On the floor | Robo, the dump truck, the box car and the excavator |
  | On the wall | The treasure map and the glow-stars |

  Robo, the kitten and the map react when tapped. Also:
  - **The lamp is a light switch.** Tap it: the room goes dusky blue and
    moonlight shines in through the window onto the floor; the glow-stars
    shine brighter. Tap again for warm light.
  - **Mom and Dad sit on the sofa** (they giggle when tapped).
  - **Four blocks**: tap the tower and they tumble into a row reading
    **M-I-L-O**; tap again to restack. (Same blocks on the cover and Story
    time.)
  - **The costume Milos are action figures** on little display stands
    (firefighter on the shelf, fix-it on the side table, builder on the floor);
    Super Milo is a small toy hanging from a wall hook.
  - **The toy excavator digs** when tapped: reach, scoop, lift, dump.
- **Interaction:** the **"Read again"** button. The book flips back to the
  cover and every page locks again.

## Changes to the story so far

These are things that were in the text or the pages before and were taken out
on purpose. Ask the user before adding them back:
- "Milo is five" (reading)
- "I can fix it!" and "The stars zoomed off…" (tools)
- "The sky turned pink, then purple" (home)
- Fact cards anywhere
- The dark table backdrop
