---
name: Shubhanshu Pandey Portfolio
description: A mountain farmhouse at dusk that the visitor walks through; lamps are lit only for projects that are answering right now.
colors:
  cedar-950: "#120e0c"
  cedar-900: "#1a1512"
  cedar-800: "#241d19"
  cedar-700: "#32281f"
  cedar-600: "#4a3b2e"
  ai-700: "#1f3559"
  ai-300: "#9db2d2"
  ai-200: "#c6d2e7"
  washi: "#ede7d9"
  washi-dim: "#d8cfbc"
  washi-warm: "#f6e7c3"
  paper-unlit: "#a39a8a"
  sumi: "#1f1b18"
  sumi-2: "#4a4239"
  sumi-3: "#665c50"
  ash: "#bdb3a2"
  ash-dim: "#978d7e"
  shu: "#d5462b"
  shu-bright: "#ea5e41"
  shu-deep: "#b0341d"
  lamp: "#f2b866"
  blossom-light: "#fbe4e4"
  blossom: "#f1bcc6"
  blossom-deep: "#e39aab"
  border: "rgb(237 231 217 / 0.14)"
  border-strong: "rgb(237 231 217 / 0.28)"
typography:
  display:
    fontFamily: "'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif"
    fontSize: "clamp(2.9rem, 13.4vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif"
    fontSize: "clamp(2.25rem, 4.6vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.15rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  quote:
    fontFamily: "'Shippori Mincho B1', 'Hiragino Mincho ProN', 'Yu Mincho', serif"
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  body-long:
    fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.5
  brush:
    fontFamily: "'Yuji Boku', 'Shippori Mincho B1', 'Hiragino Mincho ProN', serif"
    fontSize: "2.6rem"
    fontWeight: 400
    lineHeight: 1
  code:
    fontFamily: "'M PLUS 1 Code', ui-monospace, 'Cascadia Code', Consolas, monospace"
    fontSize: "0.88em"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  none: "0"
  tag: "2px"
  pole: "0.3rem"
  round: "50%"
spacing:
  seam: "3px"
  tag-gap: "0.75rem"
  pane-sm: "1.5rem"
  pane-md: "2.5rem"
  pane-lg: "3.5rem"
  bay: "2.5rem"
  beam: "3.75rem"
  gutter: "clamp(1.25rem, 4vw, 3.5rem)"
  room: "clamp(4rem, 8vw, 7rem)"
  room-deep: "clamp(5rem, 11vw, 9.5rem)"
components:
  tag:
    backgroundColor: "{colors.washi}"
    textColor: "{colors.sumi}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "0.55rem 1.15rem 0.6rem"
    height: "2.75rem"
  tag-shu:
    backgroundColor: "{colors.shu-deep}"
    textColor: "{colors.washi}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "0.55rem 1.15rem 0.6rem"
    height: "2.75rem"
  tag-wood:
    backgroundColor: "{colors.cedar-700}"
    textColor: "{colors.washi}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "0.55rem 1.15rem 0.6rem"
    height: "2.75rem"
  beam:
    backgroundColor: "{colors.cedar-800}"
    textColor: "{colors.ash}"
    height: "{spacing.beam}"
  beam-link-current:
    textColor: "{colors.washi}"
  paper:
    backgroundColor: "{colors.washi}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
    padding: "{spacing.pane-lg}"
  cloth:
    backgroundColor: "{colors.ai-700}"
    textColor: "{colors.washi}"
    rounded: "{rounded.none}"
    padding: "{spacing.pane-lg}"
  plaque:
    backgroundColor: "{colors.cedar-950}"
    textColor: "{colors.washi}"
    rounded: "{rounded.none}"
    padding: "0.375rem 0.75rem"
  lamp-paper-unlit:
    backgroundColor: "{colors.paper-unlit}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
  lamp-paper-lit:
    backgroundColor: "{colors.washi-warm}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
  drawer-label:
    backgroundColor: "{colors.washi}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.6rem 0.25rem"
  seal:
    backgroundColor: "{colors.shu-deep}"
    textColor: "{colors.washi}"
    typography: "{typography.brush}"
  panel:
    backgroundColor: "{colors.cedar-800}"
    textColor: "{colors.washi}"
    rounded: "{rounded.none}"
---

# Design System: Shubhanshu Pandey Portfolio

## Overview

**Creative North Star: "The House at Dusk"**

The site is one building and one valley. A visitor arrives under a cedar beam, reads a name dyed into an indigo cloth, sees paper lanterns by the door, and walks through: the cloth lifts, a veranda rises over the valley, lamps stand in a workroom, a chest of drawers holds the tools, and the visit ends at a gate after dark where a red postbox waits. Every surface is one of the house's own materials. Layout is carpentry: beams, posts, sills and rails do the work that rules, cards and dividers do elsewhere.

The claim the house makes is that the owner ships things that run, and the lighting is the proof. A lantern at the door and a standing lamp in the workroom are lit only when that project's live address has just answered the visitor's own browser. A lamp that did not answer is plainly dark, says so in words, and its link to the live site steps back from vermilion to plain wood. The wording is deliberately modest ("Answering now", "2 of 3 answering right now") because a reply is all the check proves.

There is one scene shown at two hours, dusk at the entrance and night at the gate. There is no light theme and no theme switch; the beam carries a pause-motion control instead. Density is low and physical: large objects, generous dark wall between them, and long text only ever on lit paper.

**Key Characteristics:**
- Four materials: soot-dark cedar (ground and structure), indigo cotton (whole fields), lit paper (the reading surface), vermilion lacquer (the one accent).
- Light means live. Lamp amber appears where something is lit or marked, never as decoration.
- Two scripts with two jobs: English carries the information, Japanese carries the atmosphere.
- Large kanji are brush-written stroke by stroke in true stroke order.
- Square timber forms, tiled paper and wood-grain textures, a printed-woodblock valley.
- Constant slow motion (cloth, lanterns, petals) that one control stops.

## Colors

A night-and-lamplight palette: near-black browns for the house, one deep indigo for cloth, warm paper for reading, a single lacquer red, and amber only where light falls.

### Primary
- **Vermilion Lacquer, deep** (`shu-deep`): the working accent. The primary action tag, the "open" face of the shop sign, the seal on the scroll, links and list markers on paper, the brushed numeral on a lit lamp, text selection on the dark wall.
- **Vermilion Lacquer** (`shu`): the 3px bar under the current room in the beam, and the lacquer of the torii in the valley.
- **Vermilion, bright** (`shu-bright`): the text caret, and the accent the admin screens are written against.

### Secondary
- **Indigo Cotton** (`ai-700`): the entrance cloth, every doorway cloth, the phone menu, the mounting bands of the hanging scroll. It always carries a plain-weave texture and a soft highlight from the upper left, and it owns whole fields rather than appearing as a tint.
- **Faded Indigo** (`ai-200`, `ai-300`): secondary text on cloth (`ai-200`) and the brushed kanji beside menu items (`ai-300`).

### Tertiary
- **Lamp Amber** (`lamp`): the "Answering now" status, the glow a lit lamp throws on the wall, the report-card grade marks on the tool chest, and the keyboard focus ring on dark surfaces.
- **Blossom** (`blossom-light`, `blossom`, `blossom-deep`): the cherry tree and its falling petals. Nowhere else.

### Neutral
- **Soot Cedar** (`cedar-950` to `cedar-600`): the wall (`cedar-900`, with vertical grain), beams and boards (`cedar-800`, horizontal grain), posts and wooden tags (`cedar-700`), roof boards and sills (`cedar-600`), and the hard underside edge of every board (`cedar-950`).
- **Washi** (`washi`): lit paper panes, the default tag, and all text on cedar and cloth. `washi-dim` backs the lattice transom; `washi-warm` is the paper of a lamp once lit.
- **Unlit Paper** (`paper-unlit`): the flat grey paper of a lamp whose project did not answer. All ink on it is set at full `sumi` strength so it stays readable.
- **Sumi Ink** (`sumi`, `sumi-2`, `sumi-3`): text on paper only. Headings and values in `sumi`, running text in `sumi-2`, dates and field labels in `sumi-3`.
- **Ash** (`ash`, `ash-dim`): secondary and tertiary text on cedar: idle beam links, captions, the footer.
- **Border** (`border`, `border-strong`): hairlines on the admin's plain boards and fields only.

### Named Rules
**The Lit Paper Rule.** Long text is set in ink on paper and nowhere else. Cedar and cloth carry titles, a sentence or two, labels and status; a paragraph belongs on a pane.

**The One Lacquer Rule.** Vermilion is the only accent for actions and for the sign. Blossom pink is never used for interface: not for a link, a state, a border or a highlight.

**The Honest Lamp Rule.** A lamp is lit only when its project's live address answered this visitor's browser. Amber and warm paper are never applied to make something look better; unlit is a real, designed state with its own contrast-checked inks.

## Typography

**Display Font:** Shippori Mincho B1 (with Hiragino Mincho ProN, Yu Mincho, serif), weights 500 and 800
**Body Font:** Zen Kaku Gothic New (with Hiragino Kaku Gothic ProN, Yu Gothic, system-ui, sans-serif), weights 400, 500, 700
**Brush Font:** Yuji Boku (Japanese subset only), weight 400
**Code Font:** M PLUS 1 Code, weights 400 and 500

All four are self-hosted and subset; the Japanese subsets contain only the characters the site's static copy uses, so new Japanese text means regenerating the fonts.

**Character:** An ink-bled mincho with heavy, slightly swollen strokes for names and room titles, against a quiet, open Japanese gothic for reading. The brush face and the stroke-written kanji supply the hand.

### Hierarchy
- **Display** (800, `clamp(2.9rem, 13.4vw, 4.75rem)` on phones and `clamp(3rem, min(7.4vw, 23.7svh - 4.3rem), 6rem)` from 64rem up, line-height 1.02, tracking -0.02em): the name dyed on the entrance cloth, one word per line. Sized against viewport height as well as width so it always clears the hem.
- **Headline** (800, `clamp(2.25rem, 4.6vw, 3.6rem)`, 1.02): a room's English title beside its brushed kanji. Page-level variants on secondary routes run up to `clamp(2.5rem, 6vw, 4.5rem)`.
- **Title** (800, `clamp(1.6rem, 2.6vw, 2.15rem)`, 1.02): a project name on a lamp, a journal entry title. Long-form headings inside an article step 1.75rem, 1.4rem, 1.15rem at line-height 1.15.
- **Quote** (500, 1.4rem, snug): the owner's tagline on the veranda pane; article blockquotes use the same face at 1.3rem.
- **Body** (400, 1.0625rem, 1.65): default reading size. Capped at 62ch.
- **Body, long-form** (400, 1.125rem, 1.75 to 1.8): the bio and journal articles, on paper.
- **Label** (700, 0.95rem, 1.2): tags, beam links (500), inline actions, tool-chest tier names.
- **Caption** (500, 0.85rem to 0.9rem): fact labels, dates, footer credits. The status line under a name on an entrance name plate is set smaller, at 0.78rem.
- **Brush** (Yuji Boku 400, 2.6rem to 2.75rem, line-height 1): formal numerals on lamps and lanterns, tier marks on the chest, the shop sign, the farewell in the footer.
- **Code** (M PLUS 1 Code, 0.88em inline, 0.92rem in blocks): code inside journal articles.

### Named Rules
**The Two Scripts Rule.** English carries every piece of information and every action; Japanese carries atmosphere. A Japanese word is never the only label on something a visitor must understand or press. Each brushed room name sits with its kana reading set vertically beside it, furigana-style, and its English title alongside.

**The Written Hand Rule.** Kanji at display size are drawn from stroke data and written in true stroke order when their room opens, then stay written. The brush font is for small marks only (numerals, tier marks, signs).

**The Upright Rule.** Japanese set as a column runs top to bottom with upright glyphs and 0.08em tracking. Latin text is never rotated to match.

## Layout

A centred shell (max 82rem) with a fluid gutter (`gutter`) that also respects device safe areas. From 64rem up, rooms use a 12-column grid with 2.5rem to 3.5rem gaps and deliberately uneven bays: a 7-column pane beside a 3-column hanging scroll on the veranda; lamps in the workroom alternating 7 and 5 columns, the narrower one set 8rem lower, so no two stand level. Below 64rem everything is one column. Rooms are separated by dark wall (`room`, `room-deep`), never by a line.

The beam is fixed at the top (`beam`, 3.75rem tall) on every route and never moves; anchored scrolling leaves room for it. Layers are a four-step scale: scene 0, rooms 10, beam 40, menu 50. Nothing else sets a stacking level above 10.

The entrance is a pinned full-height screen followed by about 72svh of travel. From 64rem up the cloth takes the left 74% of the width and `min(62svh, 41rem)` of height, the lanterns hang in the remaining column to its right, and the action tags hang on cords under the hem. Below 64rem the cloth spans the full width and is `max(19rem, 42svh, the height its lettering needs)`; everything else stacks in a column under it in order of importance: tags, lanterns with the sign, the count, the list of names. On a screen shorter than 30rem (a phone on its side) the name runs on one line, the supporting line is dropped, and the pieces under the cloth sit in a single row.

Breakpoints in use: 40rem, 48rem, 64rem, and the 30rem height threshold. The entrance is also a size container: at 51rem tall or more each name shows its status; below that only the exceptions are named and the count covers the rest.

### Named Rules
**The Hem Rule.** The strips of the entrance cloth part over its lowest 22%. All lettering stays above that line at every viewport size: the cloth grows to fit its words, and the name shrinks before the words are crowded. No letter ever sits on a slit.

**The Whole Piece Rule.** When the screen is too short for everything under the cloth, whole pieces are dropped from the end of the list, and dropped pieces leave the tab order. Nothing is ever shown cut in half.

**The Carpentry Rule.** Structure is built from house parts: beam, post, sill, rail, pole. The only drawn rule is a 3px kumiko bar, dark on cedar and mid-brown on paper.

## Elevation & Depth

Depth is physical and layered rather than abstract. The valley is the far plane; the house stands in front of it; objects hang or stand in front of the wall. Every solid object shows its thickness as a hard dark underside edge with a deep, soft, close shadow beneath it. Light is a separate vocabulary: warm radial glows that sit behind content.

### Shadow Vocabulary
- **Board edge** (`0 2px 0 #120e0c` on tags, `0 3px 0` on the beam and roof boards, `0 4px 0` on the sill): the visible thickness of a piece of wood. Always paired with a soft drop below; never used alone as a graphic offset.
- **Hanging drop** (`0 14px 22px -12px rgb(0 0 0 / 0.8)`, rising to `0 22px 26px -14px rgb(0 0 0 / 0.85)` on hover): under tags and name plates.
- **Beam drop** (`0 18px 30px -12px rgb(0 0 0 / 0.85)`): under the beam, sills and rails.
- **Pane frame** (`0 0 0 5px #120e0c, 0 0 0 6px #4a3b2e, 0 36px 70px -34px rgb(0 0 0 / 0.85), 0 0 110px -36px rgb(242 184 102 / 0.4)`, with an inner warm vignette `inset 0 0 70px rgb(120 86 40 / 0.14)`): a lit paper pane in its wooden frame, with a faint spill of lamplight.
- **Lamp glow** (`radial-gradient(closest-side, rgb(242 184 102 / 0.5), rgb(242 184 102 / 0.16) 52%, transparent)`): thrown on the wall behind a lit lamp or lantern. Fades in over 900ms.
- **Fold** (inset side shadows on cloth strips and tails): creases, so a seam reads as cloth and not as a step in brightness.

### Named Rules
**The Light Is A Layer Rule.** Lamplight is its own layer behind the text. The wick may flicker; the words never do.

**The Brightest Thing Rule.** At the entrance the lit lantern paper is the brightest element. Name plates beside it are dark and solid on purpose; do not put a light surface next to a lantern.

## Shapes

Timber is square. Panes, cloths, plaques, drawers, boards and images have no corner radius. The one softened edge is the wooden tag (2px). Curves are reserved for things that are turned or round in the real house: the bamboo pole and the scroll's roller (fully rounded ends), the iron ring pull on a drawer, the crest ring, the lantern body, the postbox, and the sun or moon as a plain disc with no rays.

Cloth has its own geometry: strips sewn together for 78% of their length, then tapering by 3px a side to the hem. Images, where the CMS supplies them, are framed by a 3px or 4px cedar surround rather than rounded. The asanoha (hemp-leaf) kumiko lattice appears as a transom along the top edge of a paper pane and nowhere else.

## Components

### Buttons (wooden tags)
Every button and button-like link is a wooden tag, as if hung by the door.
- **Shape:** near-square (2px), at least 2.75rem tall, bold 0.95rem label that never wraps, paper-tooth texture.
- **Default:** washi with sumi ink. Used for Resume and for the second action in a pair.
- **Primary (vermilion):** `shu-deep` with washi text. One per group: See the work, Open it live.
- **Wood:** `cedar-700` with horizontal grain and washi text. Onward links, social links, and the live link of a lamp that did not answer.
- **Cord:** at the entrance, tags hang from a 1px cord rising 1.3rem from the upper left.
- **Hover / Active:** lifts 2px with a longer shadow (160ms, strong ease-out), on fine pointers only; pressing sinks it 2px, scales to 0.98 and collapses the board edge. Focus is a 2px lamp-amber outline offset 3px, switching to `shu-deep` on paper.
- **Icons:** Phosphor (regular weight) on public pages, placed after the label for onward arrows and before it for brand marks.

### Text links
Underlined in the current text colour, 1px thick with a 0.28em offset; on hover the underline thickens to 3px and the colour does not change. In journal articles links are `shu-deep`. Journal entry titles draw a 3px vermilion underline from the left on hover.

### Navigation (the beam)
- **Style:** a fixed cedar beam with horizontal grain, a hard underside edge and a deep drop. Left: the crest (initials in a ring) and the name. Right: room links, the Resume tag, the pause-motion control.
- **States:** links are ash at weight 500, washi on hover; the current room is washi with a 3px vermilion bar that grows from the left (200ms).
- **Pause control:** a 44px icon button that stops every self-running animation. It is always present, on every viewport.
- **Mobile:** below 48rem the links become a second indigo cloth let down from the beam (300ms clip reveal). Each item is the English name at display scale with its brushed kanji at the right; Escape closes it and page scroll is locked while it is open.

### Cards / Containers
- **Lit paper pane:** washi with fibre and tooth textures and a warm centre, framed in cedar (see Pane frame). Square corners. Padding 1.5rem on phones, 2.5rem from 40rem, 3.5rem from 48rem. Optional asanoha transom across the top. Slides open like a screen once when its room is reached.
- **Doorway cloth:** a band of indigo on a bamboo pole with seven tails that stir in the draught; it carries a room's title. One per room.
- **Name plate:** `cedar-950`, square, a faint inner hairline; small bold name with a status line under it. Used beside lanterns and for the count.
- **Admin board:** plain `cedar-800` with vertical grain, a hairline border and a 2px board edge. The admin area uses this and nothing more ornate.

### Room title
The kanji for the room, brush-written in a column (6.5rem tall on phones, 10rem from 48rem; taller for three characters), its kana reading set vertically beside it at 0.7rem, and the English heading alongside with an optional sentence under it. Ink changes with the surface: washi and ash on cedar, sumi on paper, resist-dyed washi with a slight bleed on cloth.

### Paper lantern (signature)
One per project at the entrance, each carrying a formal numeral (壱, 弐, 参) and linking to that project's lamp. Unlit: grey-brown paper, dull red bands. Lit: cream-to-amber paper, bright bands, and a wide amber halo that breathes slowly. Each swings a few degrees on its own period. Beside them hangs the shop sign, a board that turns over from 準備中 (preparing) to 営業中 (open, on vermilion) once the checks have settled and at least one project answered.

### Standing lamp (signature)
A project as an andon: roof board overhanging the frame, two posts, a paper window, a foot rail and two legs. The paper window is the reading surface: numeral and status across the top, title, category, description, an expandable longer story, the stack as a sentence ("Made with ..."), a 3px bar, then the tags. It lights only when the project answered and the lamp has scrolled into view, with a wick-catching flicker of the light layer (900ms) and a glow on the wall. Status wording is fixed: "Answering now", "Checking the live site…", "Not answering right now", "Source only".

### Tool chest (signature)
A tansu with one tier per skill category and one drawer per tool. Each tier has a cedar end-board with a brushed category character and the English name; drawers are dark grained fronts separated by 3px seams, each with a paper label and an iron ring pull, and they stretch to fill their row. Proficiency is shown with the marks of a Japanese report card (◎ core, ○ comfortable, △ learning) in lamp amber at the drawer's upper right, with a legend below the chest and the grade spoken to assistive tech. Drawers lift 5px on hover.

### Hanging scroll and seal
A narrow kakejiku that unrolls from its roller (1100ms) on a veranda post, with an idiom brushed down it after it opens and a vermilion seal pressed slightly off square at the lower left. Its caption sits on a small cedar board below.

### Hanging sign (empty and error states)
A cedar board on two cords, swinging slightly, with a brushed word and a short English sentence. Used wherever a page has nothing to show or could not load, with a "Try again" text link where retrying is possible. Loading placeholders are the same object at 60% opacity with nothing written on it.

### The valley (scene)
A flat-colour, print-like landscape on a 1600 by 900 sheet anchored to the lower right, where the sun, the torii and the cherry tree are: terraced fields, farmhouses with lit windows, layered ridges, banded mist, paper tooth over everything. Dusk at the entrance, night at the gate, switched by a single attribute that swaps the whole scene palette. At dusk petals fall from the tree; at night fireflies drift and the sun is replaced by a small pale moon. As the visitor scrolls the entrance, the cloth strips lift from the middle outward, the fittings by the door fade, and the sun goes down behind the ridge.

### Motion
- **Looping, slow, small:** cloth sway (7.5s), doorway tails (5.6s to 7.8s), lantern and sign pendulum (about 5s to 8s, ±1.6°), lamp flame, drifting cloud (90s), weeping boughs.
- **Once per room:** the sliding screen (900ms), the unrolling scroll (1100ms), the brush writing, the lamp catching.
- **Easing:** strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for reveals and presses; `cubic-bezier(0.77, 0, 0.175, 1)` for the sign turning; `cubic-bezier(0.32, 0.72, 0, 1)` for the menu cloth.

**The Stillness Rule.** Everything that moves by itself stops when the visitor presses pause in the beam, and under reduced motion it never starts: loops are removed, reveals become a 300ms fade, kanji appear already written, petals hold one frame, and the cloth cross-fades instead of lifting.

## Do's and Don'ts

### Do:
- **Do** build new surfaces from the four materials: cedar wall, indigo cloth, lit paper, vermilion lacquer. Give each a texture (grain, weave, tooth) as the build does; no flat untextured fills for house surfaces.
- **Do** set anything longer than a couple of sentences in sumi ink on a paper pane, capped at 62ch.
- **Do** light a lamp or lantern only from the live check, and word the status as what the check proves: "Answering now", "N of M answering right now".
- **Do** pair every Japanese word with English beside it, or hide it from assistive tech when it is purely atmospheric, and mark it as Japanese.
- **Do** keep one vermilion tag per group of actions; make the rest washi or wood.
- **Do** give every solid object a hard dark underside edge plus a soft close shadow, and keep corners square (2px on tags only).
- **Do** design the unlit, loading, empty and failed states as house objects: a dark lamp, a blank pane, a hanging sign.
- **Do** make every self-running animation answer to the pause control and to reduced motion.
- **Do** keep lettering on the entrance cloth above the line where the strips part, and drop whole pieces rather than clip one when a screen is short.
- **Do** use Phosphor icons on public pages, always beside a text label or with an accessible name.

### Don't:
- **Don't** add a light theme or a theme switch. The scene has two hours, dusk and night, and they are places on the page, not a setting.
- **Don't** use blossom pink for interface. It belongs to the cherry tree and its petals.
- **Don't** use lamp amber or warm paper as decoration; it means lit, live, marked or focused.
- **Don't** claim more than the check knows. No "online", "healthy", "up" or uptime figures.
- **Don't** draw rays on the sun. It is a plain disc, and the moon is a smaller one.
- **Don't** round the corners of panes, plaques, drawers or images, and don't put a light surface beside a lit lantern.
- **Don't** separate rooms with lines or boxes. Use dark wall, a doorway cloth, a sill or a 3px bar.
- **Don't** let a Japanese word be the only label on an action, and don't rotate Latin text to imitate vertical setting.
- **Don't** add Japanese text without regenerating the font subsets and the stroke data; unsupported characters fall back to system faces.
- **Don't** introduce a second accent hue, gradients on text, or glass and blur effects on public pages; none exist in the house.
