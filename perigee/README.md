# Perigee

> *The point of closest approach* — the verified, real-life-first way to meet real
> people near you, where the good stuff is always free.

Perigee is a proximity-based **social-discovery** app for connection *beyond dating* —
finding friends, hobby partners, and going-out companions nearby. Verified humans only,
core-free-forever, real-life-first.

This directory contains a self-contained, runnable front-end of the adults (18+) app —
a working interactive prototype of the full flow, plus the build brief that serves as the
product source of truth.

## What's here

| File | Purpose |
|---|---|
| `index.html` | The app. A self-contained, dependency-free interactive prototype. |
| `BRIEF.md` | The full product & brand build brief — concept, mechanics, verification, compliance, roadmap. |

## Run it

`index.html` has no build step and no dependencies (fonts load from Google Fonts when
online). Open it directly, or serve the folder:

```bash
# from the perigee/ directory
python3 -m http.server 8000
# then open http://localhost:8000
```

On a phone-width viewport it runs full-bleed; on desktop it renders inside a device frame.

## The flow

`Welcome → Our promise → Verify (ID/passport → NFC → face/liveness → verified) → Home`

Home surfaces:

- **Discover** — a proximity "radar" map of nearby verified people (opt-in pins) and an
  equivalent feed view. Tap a pin to open its card; wave to say hi.
- **Events** — same-band meetups near you.
- **Free Now** (the center action) — broadcast that you're up for something
  (Friends / Hobby / Going out), time-boxed and auto-expiring.
- **Chats** — connections you've unlocked via the mutual-accept handshake.
- **You** — your verified profile, premium (amplify-only), and privacy controls.

## Design language

Cosmic, warm, premium. Deep near-black space, an amber→coral horizon glow (the light of
closest approach), a dense starfield, gold as the luxury accent, and iOS-style frosted
"liquid glass" surfaces. Verified = green. UI set in **Outfit**.

Palette: space `#05040E`–`#0B0920` · ink `#FBF6EC` · amber `#FFB877` · coral `#FF8E78` ·
gold `#E6B765` · verified green `#65E0AE` · violet `#B6A6FF` · blue `#A6C4FF`.

## Status

Concept v0 — front-end prototype. The production target (per `BRIEF.md`) is React Native
+ Supabase with pgvector matching; identity/age verification via an established
eMRTD/identity vendor SDK. A separate, stripped, guardian-gated teen tier is specced in
the brief and is **not** part of this prototype.

Compliance notes in the brief are not legal advice; confirm with Austrian/EU counsel
before launch.
