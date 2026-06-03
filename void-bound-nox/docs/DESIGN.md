# Void Bound: Nox — Design Notes

Source material this build fuses:

- `NoxVoid_Prototype.html` — the secure-messenger UX (boot, onboarding, vault,
  SAS, decoy, panic, mesh, safety center, settings).
- `voidboundconcept.html` — the grimdark ARPG pitch (classes, factions,
  districts, the Libram of Deeds, six loot tiers).
- `NoxVoid_Roadmap_*` — the protocol/feature canon (PQXDH, hybrid signatures,
  Key Transparency, sealed sender, Argon2id PoW, progressive disclosure, the
  Lechner Studios ownership/world framing).

## The core idea

The Dominion surveils the Spire City totally — *except* the NoxVoid slate. So the
RPG is delivered diegetically through the messenger. Talking **is** playing.
Every messenger feature is reframed as a mechanic instead of being decoration.

## Systems

**Dialogue graph** (`data.js` → `VB.contacts[].nodes`). Each node has optional
NPC `in` lines and a list of `choices`. A choice can carry effects: `deed`,
`rep` (faction deltas), `loot`, `unlock` (reveal a hidden contact), `flag`,
gated by `needFlag` / `needClass`. `goto` walks the tree; `'SAS'` routes into
verification; `'END'` closes the thread.

**The Libram** is the persistent memory layer: an append-only deed log, a
six-axis faction-standing model, and the relics you carry. Some NPCs key their
opening line off prior flags (`dynamicStart`) — e.g. Sister Asha is warm, cold,
or neutral depending on what you did to Brother Aldric. That is the concept's
"successors carry the legacy" promise, realized.

**SAS as anti-impostor.** The unverified `⟁ unknown handle` is flagged
`impostor`. On the SAS screen the remote read-back column is randomized so the
phrases visibly *don't match* — the man-in-the-middle from the roadmap's P1-8.
Reject it → you catch a Vigil sting and the Forsaken reward you. Confirm it (or
skip SAS and just answer) → Vael's stall is raided and your standing burns.

**Duress tools are story tools.** Veil mode masks previews; the decoy vault
swaps in an innocent thread list; panic glyphs crypto-shred the real vault while
showing "wrong cipher"; the distress sigil pings your cell. All free — the
roadmap's non-negotiable "security is never a premium".

**The Notice Wall** is the concept's contract board: accept or ignore, the city
continues either way, and the Libram records the choice.

**The Veil Mesh** discovery sweep resolves a hidden off-grid contact (Loom of
the Weavers), echoing the roadmap's Swarm/BLE mesh.

## Endgame

`checkEndgame()` wakes the Sleeping Lion once the player has ≥7 deeds and either
the `lion_foretold` flag or enough total standing. That delivers the concept's
"Scene 5 · The Final Choice": wake an Ascendant and draw the Iron Paragon's eye,
or leave him buried to keep the city small and safe.

## Deliberate scope

A vertical slice, not the full campaign. The architecture (graph-driven
dialogue, flag-gated branches, faction math, save/load) is built to extend:
adding a contact or a Notice is pure data in `data.js`. No engine changes
needed to grow the world.
