# Perigee — Build Brief

> **Perigee** — *the point of closest approach.* Status: concept locked, ready for Claude Code scaffolding.
> Region: EU (Austria) — GDPR + DSA apply.
> Architecture: **Perigee** (adults — this brief) + a separate, stripped, guardian-gated **teen app** (§4).

---

## A. Brand & identity

**Name:** Perigee — Greek *peri* (near) + *gē* (earth): the point in an orbit of closest approach. The whole product in one word — the people nearest you. Pronounced *PER-ih-jee*.

**Positioning (the wedge):** not another dating app. Incumbents are bleeding users to swipe fatigue, paywall fatigue, bots/scams, and a flight back to real life. Perigee answers each:
- **Verified humans only** (ID/NFC/face, §5.12) — kills the bots/fakes/AI-photo/scam problem the category can't solve.
- **Core is free, forever** — premium only amplifies; never pay-lock connection or safety.
- **Real-life-first & plural intent** — friends, hobbies, going-out, spontaneity ("Free Now"), not an endless swipe deck.
- **AI for safety only** — never to fake or automate human interaction.

One line: *the verified, real-life-first way to meet real people near you, where the good stuff is always free.*

**Brand promises (canon):**
1. Privacy & security, first — minimum collection, encryption, the user controls every share.
2. You matter more than money — core connection & safety free forever; data never sold.
3. Real humans only — verified at the door.
4. AI on your side — works only to keep you safe.

**Design language:** cosmic, warm, premium ("Y2K luxe"). Deep near-black space, a warm amber→coral horizon glow (the light of closest approach), a dense starfield, and gold as the luxury accent. Surfaces use iOS-style frosted "liquid glass." Wordmark + UI in a sleek geometric sans (Outfit). Verified = green. The orbital/proximity motif (you at the centre, people at their true distances) is the signature — used literally in the home "radar" map.

**Palette:** space `#05040E`–`#0B0920`; ink `#FBF6EC`; amber `#FFB877`; coral `#FF8E78`; gold `#E6B765`; verified green `#65E0AE`; cool accents violet `#B6A6FF` / blue `#A6C4FF`.

**Domain / trademark:** `perigee.com` and `perigee.software` are taken by B2B software firms; secure an alternative (`perigee.app`, `getperigee.com`, `.at`). No consumer-social Perigee found, but run a formal EUIPO trademark search (Nice classes 9 / 38 / 45) before brand spend. Not legal clearance.

---

## 1. Concept

A proximity-based **social-discovery** app for connection *beyond dating* — finding friends, hobby partners, and going-out companions nearby. It blends dating-app matching mechanics with Snapchat's camera-first, ephemeral, map-centric feel.

The product position is the inverse of Tinder: **intent is explicit and plural** (Friends / Hobbies / Going Out, with Dating optional), the camera and the map are the home surfaces, and the core utility is never paywalled.

---

## 2. Target users & intent modes

Every user picks one or more **intent modes**. The same person can present a different profile per mode.

- **Friends** — open-ended new connections
- **Hobbies** — partners for a specific activity (climbing, languages, gaming, etc.)
- **Going Out** — spontaneous companions for tonight/this week
- **Dating** *(optional, off by default)*

Intent mode filters discovery: you only surface to people whose active modes overlap yours.

---

## 3. Core mechanics

### 3.1 Hybrid discovery
Two discovery surfaces, same underlying graph:

1. **Swipe + mutual match** — a curated deck of same-age-band, interest-matched profiles. A connection forms only on mutual interest.
2. **Map discovery** — a Snap-Map-style view of nearby people.

### 3.2 Map privacy (opt-in pins)
- A stranger's **profile picture only appears on the map if they have opted in** to map visibility.
- Non-opted-in users are never shown to strangers on the map.
- Accepted friends are always visible to each other on the map per their location-sharing setting (see §6).

### 3.3 Mutual-accept handshake (opt-in gate)
- Connecting is gated by a **lightweight mutual-accept handshake**.
- The handshake is **opt-in**: until both parties accept, chat and any location sharing stay locked.
- On acceptance, the pair unlocks messaging and the option to share location with each other.

---

## 4. Age cohorts & mixing

Verified birthdate (§5.12) assigns every user to a cohort. Two cohorts never cross: **Adults** and **Minors**.

**Adults (18+):** one pool, mix freely. Age is a soft, user-controlled discovery filter, not a wall.

**Minors (13–17):** hard-walled from all adults in both directions, enforced at the data layer against NFC/ID-verified birthdate. Within minors, users are split into **tight, non-mixing bands** so older teens can never reach younger ones:

| Minor band | Range |
|---|---|
| Young teens | 13–14 |
| Mid teens | 15–16 |
| Older teens | 17 |

**No minor band communicates with any other minor band.** A 17-year-old therefore cannot reach a 13- or 14-year-old by any path — discovery, chat, community, voice, anything. (Tradeoff: tight bands mean smaller pools; for minors, safety outranks liquidity.)

### 4.1 Teen tier is a separate, stripped product

The teen tier shares branding but not the risky mechanics. Its purpose is shared-interest connection and moderated community — not locating strangers or meeting them. Every feature is evaluated for grooming/abuse potential and removed or constrained for minors (§4.3).

### 4.2 Guardian onboarding & consent (required)

- A minor account **cannot be created or activated without a verified guardian**.
- Flow: guardian creates and **identity-verifies their own adult account** (ID/NFC/face, §5.12) → guardian initiates the minor account and sets it up → guardian gives consent → minor completes their own verification → account activates.
- Consent is **mandatory below the digital-consent age** and applied through 17. Austria sets the GDPR Art. 8 digital-consent age at **14** (EU default is 16; member states range 13–16). Make the threshold **configurable per jurisdiction** and confirm with counsel.
- The guardian can suspend or delete the minor account at any time.

### 4.3 Feature lockdown — adults-only vs. teen

| Feature | Adults | Teens |
|---|---|---|
| Geo stranger-discovery / map pins | ✓ | ✗ removed |
| Live location | ✓ | ✗ removed |
| Ephemeral / disappearing snaps & messages | ✓ | ✗ removed — teen content is retained & auditable |
| Meetup / event facilitation with strangers | ✓ | ✗ removed |
| "Free now" broadcast | ✓ | ✗ removed |
| Visibility boosts (premium) | ✓ | ✗ never amplify a minor |
| Open DMs from non-connections | ✓ | ✗ same-band connections only |
| Voice / video calls | ✓ | constrained: same-band connections, monitored |
| Camera / photos | ✓ | ✓ with on-device content safety (§4.4) |
| Interest & community matching | ✓ | ✓ same-band, moderated |

Anything not demonstrably safe for a minor defaults to **off** for minors.

### 4.4 On-device content safety (nudity / CSAM)

Goal: stop sexual imagery involving minors at the source, and never let the platform become a conduit for it.

- **On-device detection.** Nudity/sexual-content classification runs **on the device, before send** (Apple's Communication Safety on-device model is the reference pattern). The flagged image is ideally never uploaded.
- **Teen sending:** flagged → send **blocked**; the teen sees a clear message ("This looks like a nude or sexual image — sending it isn't allowed, and it isn't safe."); guardian notified that a **content-safety event** occurred, **without** the image.
- **Teen receiving:** incoming flagged media is **blurred** with a warning and a one-tap report/block; guardian notified of the event.
- **Repeat events:** escalating in-app friction and guardian notification. The guardian receives **incident records** — who, when, type, and surrounding **text** context — but **never** any explicit image.

> **Legal correction to the "send the images to the parent" idea:** explicit imagery of a minor may legally be **CSAM**, and forwarding it — even to a parent — can itself be a criminal offense and re-victimizes the child. The system must **never re-transmit the image** to a guardian. Confirmed CSAM is quarantined and reported through the lawful channel (national hotline / authorities) under mandatory-reporting duties. The guardian gets the incident and context, not the contraband.

### 4.5 AI risk detection & escalation

A safety classifier monitors minor conversations for **grooming, scam, and sextortion/blackmail** patterns: pressure to move off-platform, requests for secrecy, solicitation of images, age-inappropriate sexual content, gift/payment offers, threats. This monitoring is **disclosed and consented at onboarding**.

- Low signal → in-app nudge to the teen.
- Strong signal (likely grooming / sextortion / scam) → **immediate guardian alert** with relevant context, plus block/report tools, and the relevant thread is opened to the guardian.
- Severe (CSAM, credible threat) → **preserve evidence and report to authorities/hotline**, independent of guardian action.

### 4.6 Guardian visibility (graduated, privacy-aware)

- Default: the guardian sees the minor's **connections list and their profile pictures** — **not** chat contents.
- Chat contents open to the guardian **only** when §4.5 flags a serious risk. That flag is the trigger; routine chats stay private.
- Taper visibility as the teen nears 18 (older teens get more privacy). The monitoring model needs legal review — blanket surveillance of teen communications has its own legal and ethical limits.

---

## 5. Feature modules

### 5.1 Discovery & matching
- Swipe deck filtered by: same age band, overlapping intent mode, shared interest tags, proximity.
- Interest/hobby tags drive ranking; use vector similarity on interest embeddings (pgvector) + a distance term.
- "See who liked you" is **free** — never premium.

### 5.2 Map / location
- Snap-Map-style live map.
- Strangers shown only if opted in to map visibility (§3.2).
- Per-friend location scope: **Live**, **Current (static)**, or **Off**.
- **Ghost Mode** — hide from map entirely while still using the app.

### 5.3 Social graph & handshake
- Friend requests, friends list, mutual-accept handshake (§3.3).
- Unlock sequence: match/request → handshake accept → chat → optional location share.

### 5.4 Messaging & snaps
- **Ephemeral snaps** — photo/video that expires after viewing.
- **Disappearing text** messages.
- 1:1 and group chats.
- (See §5.10 for AR on the capture layer.)

### 5.5 Media & storage
- Camera-first capture.
- **Memories** — a private saved gallery, separate from ephemeral snaps.
- Profile photo gallery per intent mode.
- Base storage quota free; larger quota is a premium lever (§7).

### 5.6 "Free now" status
- A temporary availability broadcast: "free for a coffee," "anyone climbing tonight?"
- Time-boxed, auto-expires, visible to same-band users matching the intent.
- This is the signature feature for spontaneous socializing.

### 5.7 Events / meetups
- Create or RSVP to meetups ("going out tonight, who's in?").
- Same-band attendees only.
- Optional venue/location, time, capacity.

### 5.8 Hobby communities
- Discord-style rooms per interest (same-band).
- Many-to-many connection, not only 1:1.

### 5.9 Ice-breakers
- Hinge-style profile prompts and suggested openers to reduce first-message friction.

### 5.10 Streaks & gamification
- Snapchat-style streaks and light engagement rewards. Keep cosmetic; never gate utility.

### 5.11 AR lenses
- Camera filters/lenses on the capture layer for snaps and profile media.

### 5.12 Identity & age verification

Three-layer assurance at signup, completed **before any discovery access** is granted.

1. **Document capture** — government ID or passport; read the machine-readable zone (MRZ) and validate format.
2. **NFC chip read (eMRTD / ICAO 9303)** — where the phone has NFC and the document is an ePassport, read the contactless chip. This cryptographically validates the document via passive authentication (the chip data is signed by the issuing country) and returns the **verified portrait and birthdate** straight from the chip — far stronger than OCR, which can be forged. Requires an NFC-capable device + ePassport; fall back to document + liveness when unavailable.
3. **Face scan with liveness** — selfie plus an active/passive liveness check, matched against the chip or document portrait to bind the real, present person to the verified document.

**Outputs:** verified birthdate (drives the cohort wall in §4), verified badge, duplicate-account prevention, verified-only discovery filter.

**Data handling (GDPR):** store only the verification result + verified birthdate; do **not** retain raw document images or biometrics beyond the verification window. Use an established eMRTD/identity vendor SDK (Regula, Veriff, Onfido-class) rather than parsing passport chips from scratch.

### 5.13 Safety toolkit (non-optional)
- Block / report on every surface; moderation queue.
- Location blurred until mutual handshake.
- **Safety Walk / "share my journey"** — share a live route to a trusted friend when meeting someone new.
- Ghost Mode (§5.2).
- In-app meetup safety guidance.
- Rate-limiting and anti-spoofing on location.

---

## 6. Location data handling

- Location is treated as **sensitive personal data**.
- Explicit, per-scope consent for each share (Live / Current / Off), revocable instantly.
- Live location streams are not persisted beyond what's needed to render; ephemeral by default.
- Map pins for strangers require an explicit opt-in toggle, off by default.

---

## 7. Monetization — premium tier

**Ethos: premium only amplifies or adds convenience/cosmetics. No key feature is ever pay-locked. "See who liked you" is permanently free.**

**Premium includes:**
- **Boosts / Spotlight** — temporary visibility amplification in deck and map.
- **Advanced filters** — finer interest, distance, verified-only, mode filters.
- **Rewind** — undo last swipe.
- **Larger Memories storage** — bigger cloud quota for saved media.
- **Travel / Passport mode** — set discovery location elsewhere (convenience).
- **Premium AR lenses & profile themes** — cosmetic (align to brand aesthetic).
- **Ad-free** — if/when ads are introduced on the free tier.
- **Larger / featured events** — higher capacity, promoted placement in same-band event lists.

**Never premium (always free):** matching, swiping, mutual match, see-who-liked-you, messaging, snaps, map discovery, "free now" status, basic events, communities, core safety tools, verification.

---

## 8. Tech stack (proposed)

- **Client:** React Native (iOS + Android, single codebase). Optional web later.
- **Backend / data:** Supabase — Auth, Postgres, Realtime, Storage.
- **Matching:** pgvector for interest-embedding similarity + distance scoring.
- **Realtime:** Supabase Realtime (or a dedicated channel layer) for chat presence + live location.
- **Media:** object storage with signed URLs; **TTL/expiry** on ephemeral snaps; separate permanent bucket for Memories.
- **Push:** FCM / APNs for matches, messages, "free now" nearby, event reminders.

---

## 9. Data model sketch (key tables)

- `users` — auth, verified birthdate, derived `age_band`, verification status
- `profiles` — per `intent_mode`, bio, prompts, photos
- `interests` / `user_interests` — tags + embeddings
- `swipes` — actor, target, direction
- `matches` — pair, status
- `friendships` — pair, handshake state (`pending` / `accepted`), location scope
- `messages` — chat, sender, body, expiry
- `snaps` — sender, media ref, viewed_at, TTL
- `memories` — owner, media ref (permanent)
- `locations` — user, geo, scope, updated_at (ephemeral for live)
- `statuses` — "free now", intent, expiry
- `events` / `event_rsvps`
- `communities` / `community_members`
- `verifications`
- `reports` / `blocks`
- `subscriptions` — premium state

*Every discovery/comms query must enforce the same-`age_band` constraint at the data layer, not just the UI.*

---

## 10. Privacy & compliance (EU / Austria)

- **GDPR:** lawful basis + explicit consent for location and profile data; data minimization; right to erasure; EU data residency. Minors' data gets heightened protection; document the lawful basis for any monitoring of minor communications (§4.5) — EU rules here are evolving, so get legal review.
- **Digital-consent age:** Austria = **14** (configurable per jurisdiction); below it, guardian consent is mandatory (§4.2).
- **DSA:** platform moderation duties — reporting, notice-and-action, transparency.
- **Mandatory CSAM handling:** detect → block → quarantine → **report to the national hotline / authorities**. Never re-transmit the imagery to anyone, including guardians (§4.4).
- **Guardian-responsibility clause:** the ToS can place responsibility for a minor's conduct on the consenting guardian, which helps — but it does **not** waive the platform's own DSA, GDPR, and child-protection duties. It is not a liability shield. Have a lawyer draft it.
- **Serious incidents:** the platform's role is to **preserve evidence and refer to law enforcement / child-protection authorities** and support the family (e.g. signposting legal resources) — not to run private litigation on a user's behalf. Build the reporting/evidence-export pathway; treat "we'll sue them" as a case-by-case legal decision, not a product promise.
- Ephemeral data genuinely purged (adult tier); teen content retained and auditable per §4.3; retention policy documented.

*Not legal advice — confirm all of the above with Austrian/EU counsel before launch.*

---

## 11. Roadmap

**MVP**
- Auth + 18+ verification + age banding
- Profiles + intent modes + interest tags
- Swipe deck + mutual match (same-band)
- Mutual-accept handshake → chat
- Static location + Ghost Mode
- Safety toolkit (block/report/verification)

**v2**
- Map discovery + opt-in stranger pins
- Live location + Safety Walk
- Ephemeral snaps + Memories gallery
- "Free now" status
- Ice-breakers

**v3**
- Events / meetups
- Hobby communities
- AR lenses
- Streaks / gamification
- Premium tier

---

## 12. Open questions

1. **App name** — resolved: **Perigee** (§A). Remaining: secure an alternative domain and run the EUIPO trademark check.
2. **Adult age filter** — soft user-controlled filter is the default (§4). Anything finer needed?
3. **Dating mode** — ship it from day one or hold until friends/hobbies traction?
4. **Teen tier** — now specced (§4.1–4.6) as a separate, stripped, guardian-gated product. Open sub-questions: (a) launch with all three minor bands or hold 13–14 (smallest pool, highest risk) for later? (b) which jurisdictions at launch, given the consent-age and CSAM-reporting variations?
5. **Ads** — free-tier ad surface, or premium-only revenue? (No targeted ads to minors regardless.)
