/* ============================================================================
   VOID BOUND: NOX — World Data
   ----------------------------------------------------------------------------
   All static game content lives here: classes, factions, the contacts you
   speak to over the NoxVoid comms-slate, their branching dialogue trees, the
   Notice Wall contracts, and the loot table.

   The engine (game.js) reads everything below. Nothing here touches the DOM.
   ============================================================================ */

const VB = {};

/* ---- The six factions of the Spire City -------------------------------- */
VB.factions = {
  dominion: { name: 'Dominion Eternal', sigil: '☩', color: '#4A6FA5', blurb: 'The Vigil hunts. The Devoted pray. Imperial authority over the Spire.' },
  rift:     { name: 'Rift Hosts',       sigil: '🜨', color: '#9B59B6', blurb: 'Four cults beneath the city, each serving one of the Unraveling.' },
  dreaming: { name: 'Dreaming Ones',    sigil: '☾', color: '#2A8A6A', blurb: 'A dynasty waking from the Dreaming Hollow. Sixty million years of patience.' },
  weavers:  { name: 'The Weavers',      sigil: '⟁', color: '#C4A24A', blurb: 'A hidden Veil-Path outpost in the Old Ruins. Beautiful and ending.' },
  brood:    { name: 'Brood-Veil',       sigil: '⌬', color: '#8E5AA8', blurb: 'A single Hunger cell beneath the Underhive. The swarm is coming.' },
  forsaken: { name: 'The Forsaken',     sigil: '◈', color: '#B08D57', blurb: "The Underhive's mercenary economy. Your first natural ally." },
};

/* ---- The four playable classes ----------------------------------------- */
VB.classes = [
  {
    id: 'warden', name: 'Ironborn Warden', sigil: '◆', color: '#4A6FA5',
    line: 'Heavy melee. Covenant abilities.',
    desc: 'You bear the weight of stone and oath. The Vigil respects strength; the Forsaken fear it. Doors open when you stand in them.',
    perk: 'Start trusted by the Dominion. Threats land harder.',
    start: { dominion: 6, forsaken: -2 },
  },
  {
    id: 'seer', name: 'Void-Seer', sigil: '🜂', color: '#9B59B6',
    line: 'Psychic glass cannon. Real Peril.',
    desc: 'You read the residue of the dead and hear the Rift breathe. Power at the cost of your own unraveling — every Edict you cast risks Peril.',
    perk: 'Can read the history bound to Mythical items. The Rift listens when you speak.',
    start: { rift: 5, dominion: -3 },
  },
  {
    id: 'inquisitor', name: 'Seeker-Inquisitor', sigil: '☩', color: '#C4A24A',
    line: 'Social class. Void-Cast Edict authority.',
    desc: 'You speak with the Emperor’s borrowed voice. Words are your weapon; the Libram your court. People confess to you before they mean to.',
    perk: 'Persuasion options unlocked others cannot take. The Devoted listen.',
    start: { dominion: 4, weavers: 2 },
  },
  {
    id: 'navigator', name: 'Rogue Navigator', sigil: '✧', color: '#2A8A6A',
    line: 'Explorer and skirmisher.',
    desc: 'You walk the seams between districts. No fixed allegiance, every door a maybe. The Veil Mesh sings loudest for your kind.',
    perk: 'The Veil Mesh reveals more. The Forsaken open their ledgers to you.',
    start: { forsaken: 6, weavers: 2 },
  },
];

/* ---- Loot table (the six tiers from the concept) ----------------------- */
VB.loot = {
  spire_ration:   { name: 'Spire Ration',          tier: 'common',    color: '#888', glow: 0, note: 'Keeps the cold out. Nothing more.' },
  warded_charm:   { name: 'Warded Charm',          tier: 'uncommon',  color: '#4A8A4A', glow: 1, note: 'A minor ward against the Rift’s whisper.' },
  vigil_seal:     { name: 'Vigil Writ of Passage', tier: 'rare',      color: '#2A6AAA', glow: 2, note: 'Patrols wave you through. Mostly.' },
  forsaken_mark:  { name: 'Forsaken Cipher-Mark',  tier: 'epic',      color: '#6A2A9A', glow: 3, note: 'Opens off-grid ledgers across the Underhive.' },
  aldric_relic:   { name: 'Reliquary of the Flame',tier: 'legendary', color: '#C4A24A', glow: 4, note: 'Named. The Devoted recognise who carries it.' },
  whispering_edge:{ name: 'The Whispering Edge',   tier: 'mythical',  color: '#C0392B', glow: 5, note: 'Three named owners across 200 years. All dead. It does not yet know what you will be.' },
};

/* ============================================================================
   CONTACTS  —  the people and cells who reach you over NoxVoid.
   Each contact carries a branching dialogue tree. Choices apply effects:
     deed     : string  -> written into the Libram of Deeds
     rep      : {faction:delta} -> shifts faction standing
     loot     : lootKey -> added to your relics
     unlock   : contactId -> reveals a hidden contact in Comms
     flag     : 'name' -> sets a world flag other nodes can read
     needFlag : 'name' -> choice only shown if flag set
     needClass: 'id'   -> choice only for a class
     verifyTrap: true  -> this choice is the bait if contact is an impostor
     goto     : nodeId -> next node (or 'END' to close the thread)
   ============================================================================ */
VB.contacts = [
  /* 1 ───────────────────────── Vael · the merchant (recognition scene) ── */
  {
    id: 'vael', name: 'Vael · Middle Reach', initials: 'VL', faction: 'forsaken',
    verified: true, online: true, introducer: 'Verity Accord', pinned: true,
    mark: 'pgYZ 8mQ3 vN2b X9Lk', tags: [],
    blurb: 'Stall-keeper. Owes you her life and has not forgotten.',
    scroll: [
      { who: 'sys', text: 'Identity verified via SAS · 3 cycles ago', ic: '🔒' },
      { who: 'in', text: 'You. The slate said you were back in the Reach.' },
      { who: 'in', text: 'I have been keeping something for you since the Forsaken nearly took my stall.', sm: true },
    ],
    start: 'open',
    nodes: {
      open: {
        choices: [
          { text: 'You owe me nothing, Vael. Keep it.', deed: 'Refused Vael’s gift, asking nothing in return.', rep: { forsaken: 3, weavers: 1 }, goto: 'gift_refused' },
          { text: 'I’ll take what’s mine. What is it?', goto: 'gift_take' },
          { text: 'Things have changed. I need a favour now.', goto: 'favour' },
        ],
      },
      gift_refused: {
        in: [ 'Then you are the rare kind. The Reach remembers rare things.', 'Take the charm anyway. Not payment. A ward. The Rift has been loud lately.' ],
        choices: [ { text: 'Accept the ward.', loot: 'warded_charm', deed: 'Vael gifted a Warded Charm out of gratitude.', flag: 'vael_ally', goto: 'END' } ],
      },
      gift_take: {
        in: [ 'A Writ of Passage. Forged, but the seal is real enough for a tired patrol.', 'Use it before someone notices the date.' ],
        choices: [
          { text: 'Take it. My thanks.', loot: 'vigil_seal', deed: 'Took Vael’s forged Writ of Passage.', flag: 'vael_ally', rep: { forsaken: 1 }, goto: 'END' },
          { text: 'Forged? That’s a noose, Vael. Burn it.', deed: 'Warned Vael to destroy a forged Vigil seal.', rep: { dominion: 2, forsaken: 1 }, flag: 'vael_ally', goto: 'END' },
        ],
      },
      favour: {
        in: [ 'A favour. Of course. Everyone in the Reach wants one eventually.', 'Name it. For you the price is only listening.' ],
        choices: [
          { text: 'Who moves Rift-glass through your district?', deed: 'Pressed Vael for Rift-trade intelligence.', rep: { dominion: 2, rift: -2 }, flag: 'knows_rift_route', goto: 'favour_rift' },
          { text: 'Nothing. I misspoke. Stay safe.', deed: 'Chose not to lean on a grateful friend.', rep: { forsaken: 2 }, flag: 'vael_ally', goto: 'END' },
        ],
      },
      favour_rift: {
        in: [ 'A man called the Tally. Forsaken broker. He posts the work nobody signs.', 'I’ll send his handle. Tell him I vouched — or don’t, if you value my stall.' ],
        choices: [ { text: 'I’ll keep your name out of it.', deed: 'Promised to shield Vael’s name from the Forsaken.', rep: { forsaken: 1 }, unlock: 'tally', flag: 'vael_ally', goto: 'END' } ],
      },
    },
  },

  /* 2 ──────────────────────── Brother Aldric · the betrayal scene ──────── */
  {
    id: 'aldric', name: 'Brother Aldric', initials: 'BA', faction: 'dominion',
    verified: true, online: false, introducer: null, mark: 'qX7n P2vK 8mY3 jL5r',
    tags: [], blurb: 'A Devoted priest of the Eternal Flame. Hiding something.',
    scroll: [
      { who: 'sys', text: 'Encrypted thread · Conclave Quarter relay', ic: '◆' },
      { who: 'in', text: 'They told me you could be trusted. I have to believe that now.' },
      { who: 'in', text: 'The Order is rotten from the cloister down. I have proof. And the Vigil will burn me for holding it.', sm: true },
    ],
    start: 'open',
    nodes: {
      open: {
        choices: [
          { text: 'Give me the proof. I’ll shield you.', deed: 'Swore to shelter Brother Aldric and his evidence.', goto: 'shield' },
          { text: 'Corruption is the Vigil’s business. I should report you.', goto: 'report' },
          { text: 'What’s the proof worth — to the right buyer?', needClass: 'navigator', goto: 'sell' },
        ],
      },
      shield: {
        in: [ 'Then there is one honest blade left in this city.', 'Take this. My family’s reliquary. If I fall, the Devoted will know you carried the truth, not the knife.' ],
        choices: [ { text: 'I’ll carry it. Disappear, brother.', loot: 'aldric_relic', deed: 'Shielded Aldric; received the Reliquary of the Flame.', rep: { dominion: -8, weavers: 4, forsaken: 2 }, flag: 'aldric_shielded', unlock: 'asha', goto: 'END' } ],
      },
      report: {
        in: [ 'I see. I misjudged the shape of you.', 'Do what you must. The Eye sees us both now.' ],
        choices: [ { text: 'Report him to the Vigil.', deed: 'Reported Brother Aldric to the Vigil. He was bound, marked with the Stigma, and led from the Cathedral.', rep: { dominion: 12, weavers: -6, forsaken: -3 }, flag: 'aldric_reported', unlock: 'asha', goto: 'aftermath' } ],
      },
      aftermath: {
        in: [ '[ The thread goes dark. Two cycles later the Wall posts the verdict: execution at dawn. ]' ],
        choices: [ { text: 'Close the thread.', goto: 'END' } ],
      },
      sell: {
        in: [ 'You… would sell it. Of course you would.', 'There is a buyer. There is always a buyer. But know the Libram writes this down too.' ],
        choices: [ { text: 'Everything’s for sale in the Spire.', loot: 'forsaken_mark', deed: 'Sold Aldric’s evidence to the highest bidder. The Libram noted the price.', rep: { forsaken: 6, dominion: -4, weavers: -8 }, flag: 'aldric_sold', unlock: 'asha', goto: 'END' } ],
      },
    },
  },

  /* 3 ──────────────────────── The Tally · Forsaken broker (the hub) ────── */
  {
    id: 'tally', name: 'The Tally · Forsaken', initials: 'TY', faction: 'forsaken',
    verified: true, online: true, introducer: 'Vael', mark: 'tF8c R3pW 2yK6 jN4q',
    tags: ['burner'], ttl: '24h', hidden: true,
    blurb: 'The broker who posts the work nobody signs. Burner thread.',
    scroll: [
      { who: 'sys', text: 'BURNER thread · TTL 24h · forward secrecy', ic: '⌖', warn: true },
      { who: 'in', text: 'Vael vouched. That buys you one honest conversation. Spend it well.' },
    ],
    start: 'open',
    nodes: {
      open: {
        in: [ 'I run the Notice Wall. Vigil bounties, escort work, scholar errands. No markers, no maps. You take it or you don’t.' ],
        choices: [
          { text: 'Open the Wall. Show me the work.', deed: 'Gained access to the Forsaken Notice Wall.', flag: 'wall_open', rep: { forsaken: 3 }, goto: 'wall' },
          { text: 'I don’t work for ledgers I can’t read.', deed: 'Refused the Forsaken’s contracts.', rep: { forsaken: -2 }, goto: 'END' },
        ],
      },
      wall: {
        in: [ 'Then the Wall is yours. Accept what you like. Ignore the rest — the city finds someone else, or it doesn’t.', 'And keep your slate warded. There’s a handle sniffing around new contractors. Calls itself nothing. I don’t trust nothing.' ],
        choices: [ { text: 'A handle calling itself nothing?', deed: 'The Tally warned of an unverified handle hunting new contractors.', flag: 'warned_impostor', unlock: 'unknown', goto: 'END' } ],
      },
    },
  },

  /* 4 ──────────────────────── Sister Asha · the successor scene ────────── */
  {
    id: 'asha', name: 'Sister Asha', initials: 'SA', faction: 'dominion',
    verified: true, online: false, introducer: null, mark: 'aB3x K7nL 2pM5 qR9v',
    tags: [], hidden: true,
    blurb: 'Of the Eternal Flame. Aldric’s order. She inherits what was done to him.',
    scroll: [ { who: 'sys', text: 'Conclave Quarter · Cathedral relay', ic: '☩' } ],
    start: 'open',
    /* Asha's opening is chosen at runtime from the aldric_* flag (engine handles dynamicStart). */
    dynamicStart: function (flags) {
      if (flags.aldric_reported || flags.aldric_sold) return 'cold';
      if (flags.aldric_shielded) return 'warm';
      return 'neutral';
    },
    nodes: {
      warm: {
        in: [ 'You carried the truth and not the knife. Brother Aldric’s reliquary answers to you now — I feel it from here.', 'The Order is split, but those of us who still pray for honest things will remember the friend who sheltered him.' ],
        choices: [
          { text: 'He may yet live. Keep faith, Sister.', deed: 'Gave Sister Asha hope for the sheltered Aldric.', rep: { weavers: 2, dominion: 1 }, flag: 'asha_warm', goto: 'END' },
        ],
      },
      cold: {
        in: [ 'I know what you did. The whole cloister knows. The rumour reached us before you did.', 'I will not bless your weapons. I do not need to say why. The Libram already has.' ],
        choices: [
          { text: 'I had my reasons.', deed: 'Faced Sister Asha’s refusal over Aldric’s fate.', rep: { dominion: 1 }, goto: 'END' },
          { text: 'Then we are enemies. So be it.', deed: 'Declared open enmity with the Devoted Order.', rep: { dominion: -3, rift: 2 }, flag: 'asha_cold', goto: 'END' },
        ],
      },
      neutral: {
        in: [ 'You don’t know me, and I don’t know your shape yet. The Cathedral is watchful. State your business.' ],
        choices: [ { text: 'Only paying respects.', deed: 'Made first contact with Sister Asha of the Eternal Flame.', goto: 'END' } ],
      },
    },
  },

  /* 5 ──────────────────────── ⟁ Unknown handle · the IMPOSTOR (SAS) ────── */
  {
    id: 'unknown', name: '⟁ unknown handle', initials: '??', faction: 'dominion',
    verified: false, online: true, introducer: null, mark: '⟁⟁⟁⟁ ⟁⟁⟁⟁ ⟁⟁⟁⟁',
    tags: ['unverified', 'burner'], ttl: '1h', hidden: true, impostor: true,
    blurb: 'No name. No vouch. Wants what you know.',
    scroll: [
      { who: 'sys', text: 'NEW CONTACT · identity NOT verified', ic: '!', warn: true },
      { who: 'in', text: 'i hear you took the Tally’s work. good. i pay better.' },
      { who: 'in', text: 'tell me the Rift route Vael gave you and there’s a Cipher-Mark in it for you. names. now.', sm: true },
    ],
    start: 'open',
    nodes: {
      open: {
        choices: [
          { text: '[Verify identity by SAS before you say a word]', goto: 'SAS' }, // engine intercepts 'SAS'
          { text: 'Sure. The route runs through Vael’s stall in the Reach—', verifyTrap: true, deed: 'Handed a Rift route to an unverified handle. It was a Vigil sting. Vael’s stall was raided at dawn.', rep: { dominion: -4, forsaken: -8, rift: -2 }, flag: 'vael_burned', goto: 'burned' },
          { text: 'I don’t deal with handles that won’t show their Mark.', deed: 'Refused an unverified handle outright.', rep: { forsaken: 2 }, goto: 'END' },
        ],
      },
      burned: {
        in: [ '[ The handle goes dark mid-sentence. No Cipher-Mark arrives. ]', '[ Hours later the Wall posts it: Vael’s stall, burned. You gave the route to the Vigil. ]' ],
        choices: [ { text: 'Close the thread.', goto: 'END' } ],
      },
      /* reached only after SAS catches the mismatch */
      caught: {
        in: [ 'i— that’s not— [ the handle drops the link ]', '[ The sigils did not match. There was a third party on the wire. You just dodged a Vigil sting. ]' ],
        choices: [ { text: 'Burn the thread and warn the Tally.', deed: 'Caught a man-in-the-middle Vigil sting via SAS and warned the Forsaken.', rep: { forsaken: 6, dominion: -1 }, flag: 'impostor_caught', goto: 'END' } ],
      },
    },
  },

  /* 6 ──────────────────────── The Spire Pact · your crew (MLS group) ───── */
  {
    id: 'pact', name: 'The Spire Pact', initials: 'SP', faction: 'weavers',
    verified: true, online: true, isGroup: true, adminGated: true, epoch: 247,
    members: ['Kestrel', 'Wren', 'you'], mark: 'group/mls',
    blurb: 'Your cell. Sealed group thread, forward secrecy, admin-gated.',
    scroll: [
      { who: 'sys', text: 'MLS group · 3 members · admin-gated · Epoch #247', ic: '◆' },
      { who: 'in', name: 'Kestrel', text: 'slate check. everyone warded?' },
      { who: 'in', name: 'Wren', text: 'warded. the Reach is crawling with Vigil tonight. keep it tight.' },
    ],
    start: 'open',
    nodes: {
      open: {
        choices: [
          { text: 'Status. What do we actually want from this city?', goto: 'creed' },
          { text: 'There’s a sting on the wire. Stay off unverified handles.', needFlag: 'impostor_caught', deed: 'Warned the Pact about the Vigil sting.', rep: { weavers: 3 }, goto: 'tight' },
          { text: 'Quiet for now.', goto: 'END' },
        ],
      },
      creed: {
        in: [ 'Kestrel: we want out from under the Dominion’s thumb without the Rift eating what’s left.', 'Wren: small steps. earn the Weavers. they hold the seams between districts. earn them and we move freely.' ],
        choices: [ { text: 'Then we earn the Weavers. Together.', deed: 'Committed the Spire Pact to the Weavers’ path.', rep: { weavers: 4 }, flag: 'pact_creed', goto: 'END' } ],
      },
      tight: {
        in: [ 'Kestrel: good catch. logging it to the shared Libram.', 'Wren: this is why we verify. always.' ],
        choices: [ { text: 'Always.', goto: 'END' } ],
      },
    },
  },

  /* 7 ──────────────────────── Loom · hidden Weaver (Mesh / Old Ruins) ──── */
  {
    id: 'loom', name: 'Loom · Old Ruins', initials: 'LM', faction: 'weavers',
    verified: true, online: false, introducer: 'Veil Mesh', mark: 'wv7L 3kP9 2nR4 8mX1',
    tags: [], hidden: true,
    blurb: 'A voice from the hidden Weaver outpost. Reached only off-grid.',
    scroll: [ { who: 'sys', text: 'Reached via Veil Mesh · off-grid · no relay', ic: '↯' } ],
    start: 'open',
    nodes: {
      open: {
        in: [ 'You found us through the Mesh. Few do. The Veil-Path notices that.', 'There is a pre-Fracture inscription in the Old Ruins the Vigil would erase. Recover it and the seams open to you.' ],
        choices: [
          { text: 'I’ll recover the inscription.', deed: 'Accepted the Weavers’ charge to recover a pre-Fracture inscription.', rep: { weavers: 6 }, flag: 'has_inscription', loot: 'forsaken_mark', goto: 'after' },
          { text: 'The Old Ruins are a grave. Not yet.', deed: 'Declined the Weavers’ inscription charge — for now.', goto: 'END' },
        ],
      },
      after: {
        in: [ 'The inscription is yours. The seams remember those who carry the old words.', 'When the Sleeping Lion stirs, you will need the Weavers at your back. That hour is closer than the Dominion knows.' ],
        choices: [ { text: 'I’ll be ready.', flag: 'lion_foretold', goto: 'END' } ],
      },
    },
  },

  /* 8 ──────────────────────── The Sleeping Lion · the final choice ─────── */
  {
    id: 'lion', name: 'The Sleeping Lion', initials: '☾', faction: 'dreaming',
    verified: true, online: true, mark: 'dream/ascendant', hidden: true,
    blurb: 'A voice from the Dreaming Hollow. The Libram has been preparing this for your whole campaign.',
    scroll: [ { who: 'sys', text: 'The Dreaming Hollow answers · Epoch unknown', ic: '☾' } ],
    start: 'open',
    nodes: {
      open: {
        in: [ 'You have a name in the Libram now. Loud enough to wake me.', 'Wake me fully and I restore an Ascendant to a galaxy that needs one — and the Iron Paragon’s agents turn their full eye on this city, on the people you have come to carry.', 'Leave me buried and the city stays small, and safe, and forgotten. Choose. The Libram closes either way.' ],
        choices: [
          { text: 'Wake. The galaxy needs an Ascendant.', deed: 'THE FINAL CHOICE — Woke the Sleeping Lion. The Iron Paragon now turns toward the Spire.', rep: { dreaming: 10, dominion: -4 }, flag: 'ending_wake', goto: 'wake' },
          { text: 'Sleep. I won’t trade them for a galaxy.', deed: 'THE FINAL CHOICE — Left the Sleeping Lion buried to protect the Spire and its people.', rep: { dreaming: -2, weavers: 4, forsaken: 4 }, flag: 'ending_sleep', goto: 'sleep' },
        ],
      },
      wake: { in: [ '[ The Hollow blazes. Somewhere very far away, an iron eye opens. The Fracture Chronicles begin in earnest. ]' ], choices: [ { text: '— End of the vertical slice —', goto: 'END' } ] },
      sleep:{ in: [ '[ The Hollow dims. The city breathes on, small and unwatched. You kept them safe. For now, that is enough. ]' ], choices: [ { text: '— End of the vertical slice —', goto: 'END' } ] },
    },
  },
];

/* ============================================================================
   THE NOTICE WALL  —  contracts from the concept. Accept, ignore; the world
   continues either way, and the Libram records the choice.
   ============================================================================ */
VB.wall = [
  {
    id: 'bounty', faction: 'dominion', title: 'Vigil Bounty · Rift Cultist',
    place: 'The Underhive', body: 'A Rift cultist seeds Unraveling-glyphs beneath the Underhive. The Vigil pays well for a quiet end.',
    accept: { deed: 'Accepted a Vigil bounty on a Rift cultist in the Underhive.', rep: { dominion: 6, rift: -5 }, loot: 'vigil_seal' },
    ignore: { deed: 'Left a Vigil bounty unanswered. The cultist works on.', rep: { rift: 1 } },
  },
  {
    id: 'escort', faction: 'forsaken', title: 'Forsaken Contract · Smuggler Escort',
    place: 'Boneward Plains', body: 'Walk a smuggler through the Boneward Plains. No questions about the cargo. Half now, half if you both arrive breathing.',
    accept: { deed: 'Escorted a Forsaken smuggler across the Boneward Plains.', rep: { forsaken: 6, dominion: -3 }, loot: 'forsaken_mark' },
    ignore: { deed: 'Declined the Forsaken escort. The smuggler walked alone.', rep: { forsaken: -2 } },
  },
  {
    id: 'inscription', faction: 'weavers', title: 'Verity Accord · Recover Inscription',
    place: 'The Old Ruins', body: 'A Verity Accord scholar needs a pre-Fracture inscription pulled from the Old Ruins before the Vigil scrubs it. She will find someone else if you don’t answer.',
    accept: { deed: 'Answered the Verity Accord’s call to the Old Ruins.', rep: { weavers: 6, dominion: -1 }, flag: 'wall_inscription' },
    ignore: { deed: 'Ignored the Verity Accord. The scholar found someone else — or no one.', rep: { weavers: -2 } },
  },
];

/* ============================================================================
   THE WARDING  —  reskin of the NoxVoid Safety Center / progressive
   disclosure. Each ward you raise hardens your slate against the Dominion.
   ============================================================================ */
VB.wards = [
  { key: 'cipher',   tier: 1, name: 'Cipher set',        desc: '6-glyph slate cipher. Forced at binding.', locked: true },
  { key: 'sigil',    tier: 1, name: 'Sigil-Phrase',      desc: '12-glyph recovery phrase, confirmed.',      locked: true },
  { key: 'trust',    tier: 2, name: 'Trusted hand',      desc: 'A verified contact for the dark hour.',     wizard: 'trust' },
  { key: 'distress', tier: 2, name: 'Distress sigil',    desc: 'Who is warned when you are taken.',          wizard: 'distress' },
  { key: 'burner',   tier: 3, name: 'Burner default',    desc: 'How fast ephemeral threads turn to ash.',    wizard: 'burner' },
  { key: 'mixnet',   tier: 3, name: 'The Hush (Mixnet)', desc: 'High-latency cover against the Eye.',        wizard: 'mixnet' },
  { key: 'panic',    tier: 3, name: 'Panic glyphs',      desc: 'Three glyphs that crypto-shred under duress.',wizard: 'panic' },
  { key: 'decoy',    tier: 3, name: 'Decoy vault',       desc: 'A plausible false slate for the checkpoint.',wizard: 'decoy' },
  { key: 'hardware', tier: 3, name: 'Bound talisman',    desc: 'A physical second key (FIDO2).',             wizard: 'hardware' },
];

/* The grimdark word-lists used for the Sigil-Phrase and SAS verification. */
VB.glyphWords = ['ash','ember','vellum','spire','rift','vigil','flame','hollow','onyx','warden','seer','veil','dawn','stigma','reliquary','brood','dominion','forsaken','weaver','lion','fracture','conclave','underhive','boneward','dreaming','glyph','cipher','ward','marrow','crucible','phaeron','unraveling','tithe','sigil','requiem','obsidian','candle','bastion','threnody','gloaming'];

/* boot lines for the comms-slate awakening */
VB.bootLines = [
  ['ok', 'Slate seal',          'sha256 verified'],
  ['ok', 'Cipher stack',        'libsignal · PQXDH'],
  ['ok', 'Mark of binding',     'ed25519 + ML-DSA-65'],
  ['ok', 'Warded storage',      'sqlcipher · envelope'],
  ['ok', 'The Hush',            'tor · obfs4 ready'],
  ['wt', 'Mixnet',              'standby · opt-in'],
  ['ok', 'Veil Mesh',           'ble · wi-fi aware'],
  ['ok', 'Warrant canary',      'sealed · Conclave 14th'],
];

if (typeof module !== 'undefined') module.exports = VB;
