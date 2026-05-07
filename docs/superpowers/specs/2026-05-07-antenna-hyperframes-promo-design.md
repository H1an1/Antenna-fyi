# Antenna HyperFrames Promo Design

Date: 2026-05-07

## Goal

Create an 18-second HyperFrames promo for Antenna that starts from the real dashboard experience and opens into a cinematic 11-video identity universe.

The film should feel like a product surface becoming mythic signal: grounded in the actual `/me` dashboard first, then expanding into the archetype videos, then resolving into the Antenna wordmark.

## Locked Direction

Use the selected B direction: cinematic image film.

Important refinement: Scene 01-03 must still use the real, currently rendered dashboard at `localhost:3001/me`. The dashboard is the user's personal control console, independent from the Greek/archetype identity system. Do not redesign it, mock it, flatten it into a generic brand dashboard, or use the visual companion sketch as source art.

Only the profile card content changes for the video:

- Display name: `Antenna`
- Line 1: `Maps the room through your agent network.`
- Line 2: `Turns profiles, events, and context into live signal.`
- Line 3: `Finds the people worth meeting before the moment passes.`

## Format

- Aspect ratio: 16:9 landscape
- Resolution: 1920x1080
- Duration target: 18 seconds
- Style: music-driven, no narration
- Text: minimal. Keep profile copy and final wordmark/tagline only.
- Source surface: live local dashboard at `http://localhost:3001/me`

## Visual Identity

Use the current dashboard's real visual identity:

- Background: black-green console gradient from `.antenna-console-shell`
- Text and UI chrome: muted parchment, soft gray, and ochre-gold
- Wordmark: `public/brand/antenna.svg`
- Typography: existing dashboard serif and mono font pairing
- Motion tone: quiet product surface at first, then sharper cinematic expansion

Avoid introducing a new palette, generic tech gradients, fake landing-page visuals, or a separate brand treatment for the dashboard portion.

## Source Assets

Dashboard source:

- `http://localhost:3001/me`, captured at the actual rendered state
- The capture must preserve the live layout, background, header, side panels, profile card shape, card styling, and current product atmosphere

Current profile card back video:

- `public/profile-assets/ascii-profile-back.mp4`

Archetype profile back videos:

- `public/profile-archetypes/profile-back/01-Hermes-赫尔墨斯.mp4`
- `public/profile-archetypes/profile-back/02-Athena-雅典娜.mp4`
- `public/profile-archetypes/profile-back/03-Prometheus-普罗米修斯.mp4`
- `public/profile-archetypes/profile-back/04-Apollo-阿波罗.mp4`
- `public/profile-archetypes/profile-back/05-Artemis-阿尔忒弥斯.mp4`
- `public/profile-archetypes/profile-back/06-Aphrodite-阿佛洛狄忒.mp4`
- `public/profile-archetypes/profile-back/07-Dionysus-狄俄尼索斯.mp4`
- `public/profile-archetypes/profile-back/08-Hades-哈迪斯.mp4`
- `public/profile-archetypes/profile-back/09-Persephone-珀耳塞福涅.mp4`
- `public/profile-archetypes/profile-back/10-Odysseus-奥德修斯.mp4`

Final mark:

- `public/brand/antenna.svg`

## Storyboard

### Scene 01: Real Dashboard Entrance, 0.0-3.0s

Start on the actual `localhost:3001/me` dashboard at 1920x1080. The camera has a restrained cinematic push, as if the real product surface is waking up.

The dashboard must remain recognizable as the user's current personal console. Do not replace it with a replica layout. The only planned content change is inside the profile card.

### Scene 02: Profile Card Focus, 3.0-6.2s

The camera eases toward the profile card. The card content reads as Antenna's identity card:

- Name: `Antenna`
- Three profile lines from the locked copy above

The surrounding dashboard remains visible enough to preserve product context, but softened by depth, scale, or vignette.

### Scene 03: Cursor Flip, 6.2-8.4s

A cursor moves to the existing card flip control and clicks it. The card performs the same conceptual 3D flip as the product UI, revealing the current profile back video.

The revealed video is `public/profile-assets/ascii-profile-back.mp4`. This is the bridge between the real dashboard and the cinematic video field.

### Scene 04: 11-Video Expansion, 8.4-14.5s

The current card back video expands outward and becomes the lead tile in an 11-video array. The 10 archetype back videos join it, forming a living grid or constellation.

The array should feel cinematic, not like a static gallery. Use staggered scale, z-depth, subtle drift, light pulses, and timing offsets between videos.

The 11 sources are:

- 1 current profile back video
- 10 archetype profile back videos

### Scene 05: Wordmark Merge, 14.5-18.0s

The 11 videos accelerate toward the center, compressing into signal bands or masked strokes that resolve into the Antenna wordmark.

End on `public/brand/antenna.svg`, centered on the same dark console atmosphere. Leave a clean final beat long enough to read the mark.

Optional final tagline:

`Signal for the room.`

## Implementation Constraints

- Do not modify the real `/me` product page just to make the video.
- If profile text needs to differ for capture, inject or overlay it in the HyperFrames/video capture layer, or use a video-only capture fixture that imports the same dashboard components and CSS while matching the actual rendered dashboard.
- The first three scenes must be verified against a screenshot of the actual live dashboard, not the visual companion sketch.
- Use HyperFrames timelines with deterministic GSAP animation.
- All video elements in HyperFrames must be muted and `playsinline`; audio, if added later, must be a separate track.
- Avoid empty timeline tweens, infinite repeats, async timeline construction, and animation conflicts.

## Validation

Before handoff:

- Confirm `localhost:3001/me` is reachable and visually matches the expected live dashboard.
- Capture/preview the first dashboard scene and compare it to the actual page.
- Verify all 11 video sources load.
- Run HyperFrames lint and validate commands for the promo project.
- Preview in HyperFrames Studio and provide the Studio URL.

MP4 render is out of scope unless explicitly requested after the Studio preview is approved.
