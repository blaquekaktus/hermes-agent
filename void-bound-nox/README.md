# VOID BOUND: NOX

> *A grimdark indie RPG you play through a secure comms-slate. The Libram remembers all.*

**Void Bound: Nox** fuses two prototypes into one playable game:

- **VOID BOUND** — the grimdark action-RPG world (Spire City, six factions, four
  classes, the *Libram of Deeds*, six loot tiers).
- **NoxVoid** — the post-quantum encrypted messenger (onboarding, vault, SAS
  identity verification, decoy vault, panic glyphs, Veil Mesh, the Warding).

In the Spire City the Dominion reads everything — except your NoxVoid slate. So
you play the *whole RPG through the comms-slate*: you talk to NPCs and faction
cells over encrypted threads, your choices are written into the Libram, and
every chat function is a real game mechanic.

## ▶ Play it

Open **`index.html`** in any modern browser. No build step, no server, no
dependencies. Your progress saves to the browser automatically.

```
void-bound-nox/
├── index.html        ← open this
├── css/styles.css
└── js/
    ├── data.js        ← world content (classes, factions, NPCs, dialogue, loot)
    └── game.js        ← engine (screens, dialogue, Libram, SAS, save/load)
```

## The loop

1. **Bind your slate** — pick one of four classes, choose a handle, set a
   6-glyph cipher, bind your Mark (Ed25519 + ML-DSA-65), ink a 12-glyph
   Sigil-Phrase and confirm it. Your class decides who trusts you on day one.
2. **Enter the Spire** — threads start arriving. Talk to Vael, Brother Aldric,
   the Forsaken broker, your cell *the Spire Pact*.
3. **Choose** — every dialogue choice can write a **Deed**, shift **faction
   standing**, drop **loot**, or **unlock** a new contact. There are no quest
   markers. The city continues whether you act or not.
4. **The Libram remembers** — open it any time to see your deeds, your standing
   across all six factions, and the relics you carry. NPCs read it before they
   speak to you. Betray a priest and his successor refuses to bless your blade.
5. **The Final Choice** — once your name is loud enough in the Libram, the
   Sleeping Lion wakes and offers the choice the game has been preparing for.

## Every NoxVoid chat function → a game mechanic

| Chat function | In-game |
|---|---|
| Onboarding (handle / PIN / keygen / recovery) | **Character creation** — class, handle, cipher, Mark, Sigil-Phrase |
| Contacts & chat threads | **Branching dialogue** with NPCs and faction cells |
| **SAS identity verification** | **Catch the impostor** — an unverified handle is a Vigil sting; SAS-verify and the read-back phrase *won't match* (a man-in-the-middle). Catch it or get burned. |
| Group / MLS info | **Faction cell** (the Spire Pact) — admin-gated, forward secrecy |
| Vault / Veil mode | **Mask previews** when patrols are near |
| Decoy vault | A plausible false slate for the checkpoint (different cipher → innocent threads) |
| Panic glyphs | **Crypto-shred** your real vault under duress (`911000`); distress sigil (`911999`) warns your cell |
| Veil Mesh radar | **Discover hidden off-grid contacts** (find *Loom* of the Weavers in the Old Ruins) |
| Safety Center | **The Warding** — progressive hardening = progression |
| Settings (transport / identity / canary) | **Slate configuration** — the Hush (Tor), mixnet, your Mark |
| — | **The Libram of Deeds** — persistent memory of every deed, faction, relic |
| — | **The Notice Wall** — Forsaken contracts you accept or ignore |

## Demo ciphers (shown on the lock screen)

- **Real cipher** — whatever you set during binding.
- **Decoy cipher** `555555` — only after you raise the Decoy ward.
- **Panic** `911000` / `911111` — only after you arm Panic glyphs.
- **Distress** `911999` — only after you set the Distress sigil.

## The four classes

| Class | Sigil | Starts trusted by | Edge |
|---|---|---|---|
| **Ironborn Warden** | ◆ | Dominion | Threats land harder |
| **Void-Seer** | 🜂 | Rift Hosts | Reads the history bound to Mythical relics |
| **Seeker-Inquisitor** | ☩ | Dominion + Weavers | Persuasion options others can't take |
| **Rogue Navigator** | ✧ | Forsaken + Weavers | The Veil Mesh reveals more |

## Notes

- This is a **playable vertical slice** (~10 minutes for one path; replay as
  different classes for different doors). The dialogue graph, faction math,
  Libram, loot, SAS mechanic, and all chat functions are fully wired.
- Pure client-side; save lives in `localStorage` under `voidbound_nox_save_v1`.
  "Wipe slate & restart" crypto-shreds it.
- Security framing follows the NoxVoid principle: **security is never a premium**
  — every ward is free.

*Lechner Studios · The Fracture Chronicles · ⚜ The Libram Remembers All ⚜*
