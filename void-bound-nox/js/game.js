/* ============================================================================
   VOID BOUND: NOX — Game Engine
   ----------------------------------------------------------------------------
   Drives every screen of the NoxVoid comms-slate and wires each chat function
   into an RPG system:

     Comms (chats)        -> branching dialogue with NPCs & faction cells
     SAS verification     -> anti-impostor mechanic (catch the Vigil sting)
     Veil mode (vault)    -> mask previews when patrols are near
     Decoy / Panic glyphs -> duress story tools (crypto-shred your threads)
     Veil Mesh radar      -> discover hidden off-grid contacts
     The Warding (safety) -> progressive hardening = progression
     The Libram of Deeds  -> persistent memory: every deed, every faction shift
     The Notice Wall      -> contracts you accept or ignore

   State persists to localStorage so a designer can close the tab and resume.
   ============================================================================ */
(function () {
'use strict';

const SAVE_KEY = 'voidbound_nox_save_v1';
const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ state -- */
function freshState() {
  return {
    screen: 'boot', prev: [], started: false,
    classId: null, handle: '', cipher: '', cipherTemp: '',
    sigil: [], sigilChallenge: null, sigilAnswers: [null, null],
    rep: { dominion: 0, rift: 0, dreaming: 0, weavers: 0, brood: 0, forsaken: 0 },
    deeds: [],                 // {n, deed, time}
    relics: [],                // lootKeys owned
    flags: {},                 // world flags
    nodePtr: {},               // contactId -> current node id
    threadDone: {},            // contactId -> true once a choice closed it
    unread: {},                // contactId -> count
    revealed: {},              // contactId -> true once unlocked/visible
    burned: {},                // contactId -> true (crypto-shredded)
    msgs: {},                  // contactId -> appended live messages
    wallState: {},             // wall id -> 'accept' | 'ignore'
    activeChatId: null,
    inVeil: false, inDecoy: false, inMesh: false, realWiped: false,
    wards: { cipher: true, sigil: true, trust: false, distress: false, burner: false, mixnet: false, panic: false, decoy: false, hardware: false },
    burnerDefault: '24h', decoyCipher: '555555',
    meshNodes: 0, meshList: [], meshLog: [],
    sasWords: [], sasContact: null, _callInt: null, _wiz: null,
    decoyContacts: [
      { id: 'd1', name: 'Quartermaster', initials: 'QM', faction: 'dominion', verified: false, scroll: [
        { who: 'in', text: 'rations restocked at the Reach depot.' }, { who: 'out', text: 'noted, thanks.' } ], plain: true },
      { id: 'd2', name: 'Watch Roster', initials: 'WR', faction: 'dominion', verified: false, scroll: [
        { who: 'in', text: 'you have gate-watch, dawn bell, north stair.' } ], plain: true },
    ],
  };
}
let S = load() || freshState();

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(stripState(S))); } catch (e) {} }
function stripState(s) { const c = JSON.parse(JSON.stringify(s)); delete c._callInt; delete c._wiz; return c; }
function load() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }

/* --------------------------------------------------------------- helpers -- */
const cls = () => VB.classes.find((c) => c.id === S.classId) || VB.classes[0];
function clock() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function go(scr) { if (S.screen === scr) return; S.prev.push(S.screen); S.screen = scr; render(); }
function back() { if (!S.prev.length) return; S.screen = S.prev.pop(); render(); }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/* live contact list, respecting decoy / wipe / hidden / reveal state */
function contacts() {
  if (S.inDecoy) return S.decoyContacts;
  if (S.realWiped) return [];
  return VB.contacts.filter((c) => !c.hidden || S.revealed[c.id]).filter((c) => !S.burned[c.id]);
}
function findContact(id) {
  return (S.inDecoy ? S.decoyContacts : VB.contacts).find((c) => c.id === id);
}
function node(c, nid) { return c.nodes && c.nodes[nid]; }
function curNodeId(c) {
  if (S.nodePtr[c.id]) return S.nodePtr[c.id];
  if (typeof c.dynamicStart === 'function') return c.dynamicStart(S.flags);
  return c.start;
}

/* toast / flash / sheet --------------------------------------------------- */
function toast(body, kind, ms) {
  kind = kind || 'ok'; ms = ms || 3200;
  const wrap = $('tst'); const d = document.createElement('div');
  d.className = 'tt ' + (kind === 'warn' ? 'w' : kind === 'danger' ? 'd' : '');
  const ic = { ok: '✓', warn: '!', danger: '×' }[kind] || '✓';
  d.innerHTML = `<div class="tt-i">${ic}</div><div class="tt-c">${body}</div>`;
  wrap.appendChild(d); setTimeout(() => d.remove(), ms);
}
function flash() { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 360); }
function showSheet(html) { $('sh').innerHTML = '<div class="shc">' + html + '</div>'; $('sh').classList.add('s'); }
function hideSheet() { $('sh').classList.remove('s'); }
window.hideSheet = hideSheet; window.go = go;

/* ---------------------------------------------------- effect application -- */
function applyEffects(fx, ctx) {
  if (!fx) return;
  if (fx.deed) recordDeed(fx.deed);
  if (fx.rep) for (const f in fx.rep) { S.rep[f] = (S.rep[f] || 0) + fx.rep[f]; }
  if (fx.loot && !S.relics.includes(fx.loot)) { S.relics.push(fx.loot); const L = VB.loot[fx.loot]; toast(`Relic acquired · <b>${esc(L.name)}</b>`, 'ok', 4200); }
  if (fx.flag) S.flags[fx.flag] = true;
  if (fx.unlock && !S.revealed[fx.unlock]) {
    S.revealed[fx.unlock] = true; S.unread[fx.unlock] = (S.unread[fx.unlock] || 0) + 1;
    const nc = VB.contacts.find((c) => c.id === fx.unlock);
    if (nc) toast(`New comms thread · <b>${esc(nc.name)}</b>`, 'ok', 4200);
  }
  save();
}
function recordDeed(text) {
  S.deeds.push({ n: S.deeds.length + 1, deed: text, time: clock() });
  if (S.screen !== 'libram') toast('✒ Deed written to the Libram', 'ok', 2600);
  checkEndgame();
}
function repTotal() { return Object.values(S.rep).reduce((a, b) => a + Math.abs(b), 0); }
function keyDeeds() { return S.deeds.filter((d) => /Aldric|Final|Lion|sting|inscription|bounty|Escort|smuggler/i.test(d.deed)).length; }

/* Sleeping Lion (endgame) wakes once the player has a loud enough name. */
function checkEndgame() {
  if (S.revealed.lion || S.flags.ending_wake || S.flags.ending_sleep) return;
  if (S.deeds.length >= 7 && (S.flags.lion_foretold || repTotal() >= 22)) {
    S.revealed.lion = true; S.unread.lion = (S.unread.lion || 0) + 1;
    toast('☾ <b>The Dreaming Hollow stirs.</b> A new thread opens…', 'warn', 5200);
  }
}

/* ============================================================ RENDER ===== */
function render() {
  document.body.classList.toggle('veil', S.inVeil);
  document.body.classList.toggle('decoy', S.inDecoy);
  document.body.classList.toggle('mesh', S.inMesh);
  document.body.dataset.cls = S.classId || '';
  let h;
  switch (S.screen) {
    case 'boot': h = sBoot(); break;
    case 'welcome': h = sWelcome(); break;
    case 'cc-class': h = sClass(); break;
    case 'cc-handle': h = sHandle(); break;
    case 'cc-cipher': h = sCipher(); break;
    case 'cc-cipher2': h = sCipher2(); break;
    case 'cc-keygen': h = sKeygen(); break;
    case 'cc-sigil': h = sSigil(); break;
    case 'cc-sigil2': h = sSigil2(); break;
    case 'cc-done': h = sDone(); break;
    case 'lock': h = sLock(); break;
    case 'chats': h = sChats(); break;
    case 'chat': h = sChat(); break;
    case 'ident': h = sIdent(); break;
    case 'group': h = sGroup(); break;
    case 'sas': h = sSAS(); break;
    case 'libram': h = sLibram(); break;
    case 'wall': h = sWall(); break;
    case 'mesh': h = sMesh(); break;
    case 'warding': h = sWarding(); break;
    case 'settings': h = sSettings(); break;
    case 'wiz': h = sWizard(); break;
    default: h = sChats();
  }
  $('stk').innerHTML = '<div class="scr in">' + h + '</div>';
  bind();
}

/* status bar + nav + helpers --------------------------------------------- */
function sb() {
  return `<div class="sb"><div class="l"><span>${clock()}</span></div><div class="r"><span class="net">${S.inMesh ? '↯ mesh' : S.inVeil ? '⊘ hush' : 'the hush'}</span><span class="sb-batt">87<span class="sb-batt-ic"><span class="sb-batt-fill"></span></span></span></div></div>`;
}
function nav(active) {
  const items = [
    { id: 'chats', l: 'Comms', i: '◫' },
    { id: 'libram', l: 'Libram', i: '✒' },
    { id: 'wall', l: 'Wall', i: '▦' },
    { id: 'mesh', l: 'Mesh', i: '↯' },
    { id: 'warding', l: 'Warding', i: '✦', b: wardsLeft() },
  ];
  return `<div class="bnav">${items.map((i) => {
    const a = i.id === 'chats' ? 'enter-app' : 'go:' + i.id;
    const badge = i.b ? `<span class="bni-bg">${i.b}</span>` : '';
    return `<button class="bni ${active === i.id ? 'on' : ''}" data-a="${a}"><span class="bni-ic">${i.i}</span>${i.l}${badge}</button>`;
  }).join('')}</div>`;
}
function wardsLeft() { return Object.values(S.wards).filter((v) => !v).length; }
function keypad() {
  const rows = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  let h = '<div class="kp">';
  rows.forEach((r) => r.forEach((n) => (h += `<button class="k" data-a="pin:${n}">${n}</button>`)));
  h += '<button class="k fn" data-a="pin:clear">CLR</button><button class="k" data-a="pin:0">0</button><button class="k fn" data-a="pin:back">⌫</button></div>';
  return h;
}
function ccProg(step) {
  return `<div class="cc-prog">${[1, 2, 3, 4, 5].map((n) => `<span class="${n < step ? 'dn' : n === step ? 'now' : ''}"></span>`).join('')}</div>`;
}
function shHdr(t, dest) {
  return `<div class="sh-hdr"><button class="back" data-a="${dest ? 'go:' + dest : 'back'}">←</button><div class="sh-hdr-t">${t}</div><span style="width:40px"></span></div>`;
}

/* ----------------------------------------------------------------- boot -- */
function sBoot() {
  setTimeout(animBoot, 160);
  return `<div class="boot"><div class="boot-logo"><div class="boot-mark">${MARK}</div><div class="boot-name">VOID <span class="g">BOUND</span></div><div class="boot-sub">: NOX · the comms-slate awakens</div></div><div class="boot-log" id="bl"></div><div class="boot-bot">Spire build · sealed <span class="g">Conclave 14th</span> · the Libram remembers all</div></div>`;
}
function animBoot() {
  const log = $('bl'); if (!log) return; let i = 0;
  (function nxt() {
    if (i >= VB.bootLines.length) { setTimeout(() => go(S.started ? 'lock' : 'welcome'), 650); return; }
    const [ok, lbl, det] = VB.bootLines[i];
    const el = document.createElement('div'); el.className = 'boot-ln ' + ok;
    el.innerHTML = `<span class="ic">${ok === 'ok' ? '✓' : '…'}</span><span class="lbl">${lbl}</span><span class="det">${det}</span>`;
    log.appendChild(el); i++; setTimeout(nxt, 230);
  })();
}

/* -------------------------------------------------------------- welcome -- */
function sWelcome() {
  return `${sb()}<div class="welc"><div class="w-hero"><div class="w-mark">${MARK}</div><div class="w-name">VOID <span class="g">BOUND</span></div><div class="w-tag">: NOX · THE FRACTURE CHRONICLES</div>
  <div class="w-body">You arrive in the <em>Spire City</em> with nothing but a NoxVoid comms-slate — the only voice the Dominion cannot read. Everything you do is written into <strong>the Libram of Deeds</strong>. Everyone remembers.</div></div>
  <div class="w-feats">
    <div class="wf"><div class="wf-ic">✒</div><div class="wf-t">The Libram</div><div class="wf-d">Every deed recorded. NPCs remember.</div></div>
    <div class="wf"><div class="wf-ic">☩</div><div class="wf-t">Verify or burn</div><div class="wf-d">SAS-check a handle or walk into a sting.</div></div>
    <div class="wf"><div class="wf-ic">◈</div><div class="wf-t">Six factions</div><div class="wf-d">Earn the seams. Choose your enemies.</div></div>
    <div class="wf"><div class="wf-ic">⌖</div><div class="wf-t">Warded slate</div><div class="wf-d">Veil mode · decoy vault · panic glyphs.</div></div>
  </div>
  <div class="w-act"><button class="btn" data-a="go:cc-class">Bind your slate</button>${S.started ? '<button class="btn sec" data-a="go:lock">Resume — unlock vault</button>' : ''}<button class="btn ghost" data-a="reset">Wipe & start over</button></div>
  <div class="w-foot">A playable vertical slice · ~10 min · Lechner Studios</div></div>`;
}

/* ------------------------------------------------ character creation ----- */
function sClass() {
  return `${sb()}${ccProg(1)}<div class="cnt">
  <div class="lbl">Binding · 1 / 5</div><div class="h1">Choose your path.</div>
  <div class="lede">Four ways to walk the Spire. Your class shapes who trusts you, what doors open, and what the Libram first writes of you.</div>
  <div class="cls-grid">${VB.classes.map((c) => `<button class="cls ${S.classId === c.id ? 'sel' : ''}" data-a="pick-class:${c.id}" style="--cc:${c.color}">
    <div class="cls-sig">${c.sigil}</div><div class="cls-n">${c.name}</div><div class="cls-l">${c.line}</div></button>`).join('')}</div>
  ${S.classId ? `<div class="cls-detail"><div class="cls-desc">${cls().desc}</div><div class="cls-perk"><b>Edge:</b> ${cls().perk}</div></div>` : ''}
  <div class="as"><button class="btn" data-a="go:cc-handle" ${S.classId ? '' : 'disabled'}>Continue</button></div></div>`;
}
function sHandle() {
  return `${sb()}${ccProg(2)}<div class="cnt">
  <div class="lbl">Identity · 2 / 5</div><div class="h1">Choose your handle.</div>
  <div class="lede">The name the Libram writes beside your deeds. <strong>Not your true name</strong> — a discovery-hint, hashed and rotatable. The Dominion cannot enumerate it.</div>
  <div class="inp-w"><input id="hi" class="input" placeholder="handle_of_the_spire" maxlength="22" autocomplete="off" spellcheck="false" value="${esc(S.handle)}"><span class="inp-st" id="hs"></span></div>
  <div class="help">3–22 glyphs · no spaces · <b>oblivious lookup</b></div>
  <div class="as"><button id="hn" class="btn" ${S.handle.length >= 3 ? '' : 'disabled'} data-a="go:cc-cipher">Continue</button></div></div>`;
}
function sCipher() {
  const l = S.cipherTemp.length;
  return `${sb()}${ccProg(3)}<div class="cnt">
  <div class="lbl">The Vault · 3 / 5</div><div class="h1">Set your slate-cipher.</div>
  <div class="lede">Six glyphs guarding your real vault. <strong>No birthdays</strong>, no obvious runs. You alone hold this.</div>
  <div class="pd">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="pd-d ${i < l ? 'fl' : ''}"></span>`).join('')}</div>
  <div class="ps">${l === 0 ? 'enter 6 glyphs' : l + ' / 6'}</div>${keypad()}</div>`;
}
function sCipher2() {
  const l = S.cipherTemp.length;
  return `${sb()}${ccProg(3)}<div class="cnt">
  <div class="lbl">Confirm · 3 / 5</div><div class="h1">Repeat the cipher.</div>
  <div class="lede">So no slip of the hand locks you out.</div>
  <div class="pd">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="pd-d ${i < l ? 'fl' : ''}"></span>`).join('')}</div>
  <div class="ps">${l === 0 ? 'enter again' : l + ' / 6'}</div>${keypad()}</div>`;
}
function sKeygen() {
  setTimeout(animKeygen, 220);
  return `${sb()}${ccProg(4)}<div class="cnt">
  <div class="lbl">The Mark · 4 / 5</div><div class="h1">Bind your Mark to the Void.</div>
  <div class="lede">Hybrid <strong>Ed25519 + ML-DSA-65</strong>. Post-quantum, harvest-now-proof. It never leaves this slate.</div>
  <div class="kg"><div class="kg-v"><span class="kg-r r1"></span><span class="kg-r r2"></span><span class="kg-r r3"></span><span class="kg-c">${cls().sigil}</span></div><div class="kg-s" id="kgs"></div></div></div>`;
}
function animKeygen() {
  const lines = [['init', 'prng', 'ChaCha20'], ['sample', 'ed25519', 'clamped'], ['derive', 'ed25519.pub', '32 bytes'], ['init', 'mldsa65', 'rho/zeta'], ['expand', 'matrix_A', '10×10'], ['sample', 'vec_s1', 'η=2'], ['pack', 'pub', '1.95 KB'], ['pack', 'priv', '3.30 KB'], ['commit', 'kt-log', 'inclusion-proof'], ['sign', 'mark', 'hybrid'], ['verify', 'self-test', 'both valid']];
  const el = $('kgs'); if (!el) return; let i = 0;
  (function tick() {
    if (i >= lines.length) { setTimeout(() => go('cc-sigil'), 560); return; }
    const d = document.createElement('div'); d.className = 'kg-l';
    d.innerHTML = `<span class="a">▸</span><span class="k">${lines[i][0]}</span><span class="v">${lines[i][1]}</span><span class="m">${lines[i][2]}</span>`;
    el.appendChild(d); el.scrollTop = el.scrollHeight; i++; setTimeout(tick, 190);
  })();
}
function sSigil() {
  if (!S.sigil.length) S.sigil = [...VB.glyphWords].sort(() => Math.random() - 0.5).slice(0, 12);
  return `${sb()}${ccProg(5)}<div class="cnt">
  <div class="lbl">Recovery · 5 / 5</div><div class="h1">Your Sigil-Phrase. Write it down.</div>
  <div class="wb"><span class="wb-ic">!</span><div><b>Do not</b> capture this. <em>Do not</em> store it on any slate. Ink it on <b>vellum</b> and hide it well. This phrase is your only road back.</div></div>
  <div class="ph-g">${S.sigil.map((w, i) => `<div class="ph-w"><span class="ph-n">${String(i + 1).padStart(2, '0')}</span>${w}</div>`).join('')}</div>
  <div class="as"><button class="btn" data-a="go:cc-sigil2">I have inked it</button></div></div>`;
}
function sSigil2() {
  if (!S.sigilChallenge) {
    const p1 = Math.floor(Math.random() * 6); let p2; do { p2 = 6 + Math.floor(Math.random() * 6); } while (p2 === p1);
    const mk = (p) => { const correct = S.sigil[p]; const dec = VB.glyphWords.filter((w) => !S.sigil.includes(w)).sort(() => Math.random() - 0.5).slice(0, 3); return [correct, ...dec].sort(() => Math.random() - 0.5); };
    S.sigilChallenge = { pos: [p1, p2], correct: [S.sigil[p1], S.sigil[p2]], choices: [mk(p1), mk(p2)] };
    S.sigilAnswers = [null, null];
  }
  const ch = S.sigilChallenge;
  return `${sb()}${ccProg(5)}<div class="cnt">
  <div class="lbl">Verify · 5 / 5</div><div class="h1">Which glyph stands…</div>
  ${ch.pos.map((p, idx) => `<div style="margin-bottom:22px"><div class="lbl g">at position ${String(p + 1).padStart(2, '0')}?</div><div class="ch-r">${ch.choices[idx].map((w) => `<button class="ch-b ${S.sigilAnswers[idx] === w ? 'sel' : ''}" data-a="sigil-pick:${idx}:${w}">${w}</button>`).join('')}</div></div>`).join('')}
  <button class="btn" data-a="sigil-confirm" ${S.sigilAnswers.some((a) => !a) ? 'disabled' : ''}>Seal the binding</button></div>`;
}
function sDone() {
  return `${sb()}<div class="cnt cc-done">
  <div class="done-mark">${cls().sigil}</div>
  <div class="lbl">Binding complete</div><div class="h1" style="text-align:center">Welcome to the Spire, ${esc(S.handle)}.</div>
  <div class="lede" style="text-align:center;max-width:300px">You are a <em>${cls().name}</em>. Your Mark is bound, your vault sealed, your Sigil-Phrase inked.<br><br>The comms-slate is live. Someone is already trying to reach you.</div>
  <div class="as" style="max-width:300px;width:100%"><button class="btn" data-a="enter-app">Enter the Spire</button><button class="btn sec" data-a="go:warding">Open the Warding</button></div></div>`;
}

/* ----------------------------------------------------------------- lock -- */
function sLock() {
  const l = S.cipherTemp.length;
  return `${sb()}<div class="lk">
  <div class="lk-lg"><div class="lk-m">${MARK}</div><div class="lk-n">VOID <span class="g">BOUND</span></div><div class="lk-b">vault sealed</div></div>
  <div class="lk-p">Enter your slate-cipher</div>
  <div class="pd">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="pd-d ${i < l ? 'fl' : ''}"></span>`).join('')}</div>
  <div class="ps">${l === 0 ? '6 glyphs' : l + ' / 6'}</div>${keypad()}
  <div class="lk-h"><b>Demo ciphers:</b> real <code>${esc(S.cipher)}</code>${S.wards.decoy ? ` · decoy <code>${esc(S.decoyCipher)}</code>` : ''}${S.wards.panic ? '<br>panic glyphs <code>911000</code> · <code>911111</code>' : ''}${S.wards.distress ? ' · distress <code>911999</code>' : ''}</div></div>`;
}

/* ---------------------------------------------------------------- chats -- */
function sChats() {
  const ls = contacts();
  return `${sb()}<div class="hdr">
  <div><div class="hdr-tt">${S.inDecoy ? 'Slate' : 'VOID <span class="g">BOUND</span>'}</div><div class="hdr-sub">${S.inDecoy ? 'DECOY VAULT' : 'REAL VAULT'} <span class="dot">·</span> ${ls.length} threads</div></div>
  <div class="hdr-act"><button class="hbtn ${S.inVeil ? 'warn' : ''}" data-a="toggle-veil">${S.inVeil ? '◐' : '◑'} Veil</button><button class="hbtn icon" data-a="lock-vault">⊘</button></div></div>
  ${S.inVeil ? '<div class="bnr v"><span class="dot"></span>Veil mode · previews masked, no wake-pings</div>' : ''}
  ${S.inDecoy ? '<div class="bnr d"><span class="dot"></span>Decoy vault · plausible deniability</div>' : ''}
  ${S.inMesh ? `<div class="bnr m"><span class="dot"></span>Veil Mesh active · ${S.meshNodes} nodes</div>` : ''}
  <div class="cnt flush">
  ${ls.length === 0 ? `<div class="cl-em"><div class="ic">∅</div>${S.realWiped ? 'Real vault crypto-shredded via panic glyph.<br>Decoys remain intact.' : 'No threads.'}</div>`
      : '<div class="cl-srch">⌕ &nbsp; Search threads</div>' + ls.map(renderChatRow).join('')}
  </div>${nav('chats')}`;
}
function renderChatRow(c) {
  const fac = VB.factions[c.faction];
  const last = lastMsg(c);
  const unread = S.unread[c.id] || 0;
  const facDot = fac && !S.inVeil ? `style="--fc:${fac.color}"` : '';
  return `<div class="cl ${c.pinned ? 'pn' : ''}" data-a="open:${c.id}" ${facDot}>
  <div class="av ${c.isGroup ? 'gr' : ''} ${!c.verified ? 'uv' : ''}">${c.initials}${c.online && !S.inVeil ? '<span class="av-st"></span>' : ''}</div>
  <div class="cl-i"><div class="cl-t"><div class="cl-n">${c.verified ? '<span class="vfy">✓</span>' : ''}<span class="nm">${esc(c.name)}</span></div><div class="cl-tm">${last.t || ''}</div></div>
  <div class="cl-b"><div class="cl-p">${esc(last.text)}</div>${unread ? `<span class="cl-u">${unread}</span>` : ''}</div>
  ${(c.tags && c.tags.length) || c.isGroup ? `<div class="cl-tg">${c.isGroup ? '<span class="tg gr">cell</span>' : ''}${(c.tags || []).map((t) => `<span class="tg ${t === 'burner' ? 'br' : t === 'unverified' ? 'uvg' : 'ttl'}">${t === 'unverified' ? 'unverified' : t}</span>`).join('')}${c.ttl ? `<span class="tg ttl">TTL ${c.ttl}</span>` : ''}</div>` : ''}
  </div></div>`;
}
function lastMsg(c) {
  const live = S.msgs[c.id] || [];
  const all = [...(c.scroll || []), ...live];
  if (S.threadDone[c.id] === false || true) { /* include current node intro for preview */ }
  if (!all.length) { const cur = !c.plain && node(c, curNodeId(c)); if (cur && cur.in && cur.in.length) return { text: cur.in[0].slice(0, 64), t: '' }; return { text: '—', t: '' }; }
  const m = all[all.length - 1];
  if (m.who === 'sys') return { text: m.text, t: m.t || '' };
  let p = c.isGroup && m.who === 'in' && m.name ? m.name + ': ' : '';
  return { text: (p + (m.text || '')).slice(0, 64), t: m.t || '' };
}

/* --------------------------------------------------------------- chat view */
function sChat() {
  const c = findContact(S.activeChatId);
  if (!c) { S.screen = 'chats'; return sChats(); }
  S.unread[c.id] = 0;
  const fac = VB.factions[c.faction];
  const live = S.msgs[c.id] || [];
  const cur = !c.plain && !S.threadDone[c.id] ? node(c, curNodeId(c)) : null;
  // assemble messages: scroll + live + (current node intro, if not yet shown)
  let body = (c.scroll || []).map((m) => renderMsg(m, c)).join('') + live.map((m) => renderMsg(m, c)).join('');
  // choices
  let choicesHtml = '';
  if (c.plain) {
    choicesHtml = '<div class="cv-note">Decoy thread · harmless by design.</div>';
  } else if (cur) {
    if (cur.in && !S.msgs[c.id + ':introshown:' + curNodeId(c)]) {
      // intro lines render as incoming bubbles inline (already part of node) — show them
      body += cur.in.map((t) => renderMsg({ who: 'in', text: t }, c)).join('');
    }
    const opts = (cur.choices || []).filter((o) => choiceVisible(o, c));
    choicesHtml = '<div class="cv-choices">' + opts.map((o, i) => `<button class="choice" data-a="choose:${c.id}:${curNodeId(c)}:${i}">${esc(o.text)}</button>`).join('') + '</div>';
  } else {
    choicesHtml = '<div class="cv-note">Thread closed. The Libram has it.</div>';
  }
  return `${sb()}<div class="cv-h">
  <button class="back" data-a="back-chats">←</button>
  <div class="av ${c.isGroup ? 'gr' : ''} ${!c.verified ? 'uv' : ''}" style="width:36px;height:36px;font-size:12px">${c.initials}</div>
  <div class="cv-i" data-a="${c.isGroup ? 'go:group' : 'go:ident'}"><div class="cv-n">${c.verified ? '<span class="vfy">✓</span>' : ''}${esc(c.name)}</div><div class="cv-st ${!c.verified ? 'uv' : ''}">${fac ? esc(fac.name) : ''} <span class="sep">·</span> ${c.verified ? 'verified · e2ee' : 'NOT verified'}</div></div>
  <div class="cv-a">${!c.plain && !c.isGroup ? `<button data-a="sas-call:${c.id}" title="Verify by SAS">☎</button>` : ''}</div></div>
  <div class="msgs" id="ms">${body}</div>
  ${choicesHtml}`;
}
function choiceVisible(o, c) {
  if (o.needFlag && !S.flags[o.needFlag]) return false;
  if (o.needClass && S.classId !== o.needClass) return false;
  return true;
}
function renderMsg(m, c) {
  if (m.who === 'sys') return `<div class="msg-s ${m.warn ? 'wr' : ''}">${m.ic ? `<span class="ic">${m.ic}</span>` : ''}${esc(m.text)}</div>`;
  const name = c.isGroup && m.who === 'in' && m.name ? `<div class="msg-gn">${esc(m.name)}</div>` : '';
  const tick = m.who === 'out' ? '<span class="rd">✓✓</span>' : '';
  return `<div class="msg ${m.who === 'out' ? 'out' : 'in'} ${m.sm ? 'sm' : ''}">${name}${esc(m.text)}<span class="msg-t">${m.t || ''} ${tick}</span></div>`;
}

/* choosing a dialogue option -------------------------------------------- */
function choose(cid, nid, idx) {
  const c = findContact(cid); if (!c) return;
  const nd = node(c, nid); if (!nd) return;
  const opts = (nd.choices || []).filter((o) => choiceVisible(o, c));
  const o = opts[idx]; if (!o) return;

  // SAS gate: a choice can route into verification
  if (o.goto === 'SAS') { S.sasContact = cid; S.sasWords = pickSas(); go('sas'); return; }

  // push the player's spoken line
  S.msgs[cid] = S.msgs[cid] || [];
  S.msgs[cid].push({ who: 'out', text: o.text, t: clock() });
  applyEffects(o, c);

  // advance
  if (o.goto === 'END' || !o.goto) {
    S.threadDone[cid] = true;
  } else {
    S.nodePtr[cid] = o.goto;
    S.threadDone[cid] = false;
  }
  save(); render();
}

/* ---------------------------------------------------- identity / SAS ---- */
function sIdent() {
  const c = findContact(S.activeChatId); if (!c) return sChats();
  const fac = VB.factions[c.faction];
  return `${sb()}${shHdr('Contact Identity')}<div class="cnt">
  <div class="id"><div class="id-a ${!c.verified ? 'uv' : ''}">${c.initials}</div><div class="id-n">${esc(c.name)}</div><div class="id-s ${!c.verified ? 'uv' : ''}">${c.verified ? 'Mark verified' : 'NOT verified'}</div></div>
  <div class="st-l">Mark fingerprint</div><div class="id-f">${esc(c.mark || '----')}</div>
  <div class="help" style="text-align:center;margin-top:8px">Hybrid Ed25519 + ML-DSA-65 · ${fac ? esc(fac.name) : ''}</div>
  <div class="st-l" style="margin-top:22px">Chain of trust</div>
  ${c.introducer ? `<div class="st-r"><div class="st-i"><div class="st-n">↗ Introduced by ${esc(c.introducer)}</div><div class="st-d">Signed introduction · verified chain</div></div><div class="st-v on">✓</div></div>` : `<div class="st-r"><div class="st-i"><div class="st-n">Direct first contact</div><div class="st-d">No introducer · QR / handle</div></div></div>`}
  <div class="st-r"><div class="st-i"><div class="st-n">KT inclusion-proof</div><div class="st-d">Key Transparency log</div></div><div class="st-v ${c.verified ? 'on' : ''}">${c.verified ? '✓ OK' : 'pending'}</div></div>
  ${c.verified
      ? `<div class="as" style="margin-top:22px"><button class="btn sec" data-a="sas-call:${c.id}">Re-verify (voice / SAS)</button></div>`
      : `<div class="nt w" style="margin-top:20px"><b>Unverified.</b> Run an SAS voice-check before you trust this handle with anything. A man-in-the-middle reads a different phrase than you do.</div><div class="as"><button class="btn wr" data-a="sas-call:${c.id}">Verify now</button></div>`}
  </div>`;
}
function sGroup() {
  const c = findContact(S.activeChatId); if (!c || !c.isGroup) return sChats();
  return `${sb()}${shHdr('Cell · Group')}<div class="cnt">
  <div class="id"><div class="id-a gr">${c.initials}</div><div class="id-n">${esc(c.name)}</div><div class="id-s">MLS group · ${c.members.length} members</div></div>
  <div class="st-l">Members</div>
  ${c.members.map((m, i) => `<div class="mm"><div class="mm-a">${m.slice(0, 2).toUpperCase()}</div><div class="mm-i"><div class="mm-n">${esc(m)}${m === 'you' ? '<span class="you">· you</span>' : ''}</div><div class="mm-r ${i === 0 ? 'ad' : ''}">${i === 0 ? 'Admin' : 'Member'}</div></div></div>`).join('')}
  <div class="st-l" style="margin-top:20px">Cell wards</div>
  <div class="st-r"><div class="st-i"><div class="st-n">Admin-gated</div><div class="st-d">Only admins add members</div></div><div class="tog ${c.adminGated ? 'on' : ''}"></div></div>
  <div class="st-r"><div class="st-i"><div class="st-n">MLS epoch</div><div class="st-d">Forward secrecy active</div></div><div class="st-v on">#${c.epoch}</div></div>
  </div>`;
}
function pickSas() { return [0, 0, 0, 0].map(() => VB.glyphWords[Math.floor(Math.random() * VB.glyphWords.length)]); }
function sSAS() {
  const c = findContact(S.sasContact);
  if (!S.sasWords.length) S.sasWords = pickSas();
  startCall();
  const impostor = c && c.impostor;
  const remote = impostor ? pickSas() : S.sasWords; // MITM reads a different phrase
  return `${sb()}<div class="hdr" style="background:transparent"><button class="back" data-a="hangup">← Hang up</button><div></div><div class="hdr-sub" style="margin:0">SAS verify</div></div>
  <div class="sas">
  <div class="sas-tp"><div class="sas-pl"><span class="sas-pr"></span><span class="sas-pr"></span><span class="sas-pr"></span><span class="sas-pc">☎</span></div>
  <div class="sas-st"><span class="dt"></span>Connected · end-to-end</div>
  <div class="sas-wh">${c ? esc(c.name) : '—'}</div><div class="sas-du" id="cd">00:00</div></div>
  <div class="sas-ex">Read the <strong>4 sigil-words aloud</strong>. Both sides must see the <em>same</em> — if not, there is a third party on the wire.</div>
  <div class="sas-cols">
    <div class="sas-col"><div class="sas-cl">You read</div><div class="sas-ws">${S.sasWords.map((w, i) => `<div class="sas-w"><span class="sas-wn">${String(i + 1).padStart(2, '0')}</span>${w}</div>`).join('')}</div></div>
    <div class="sas-col"><div class="sas-cl">They read back</div><div class="sas-ws">${remote.map((w, i) => `<div class="sas-w ${impostor ? 'bad' : ''}"><span class="sas-wn">${String(i + 1).padStart(2, '0')}</span>${w}</div>`).join('')}</div></div>
  </div>
  <div class="sas-q">Do the phrases match?</div>
  <div class="sas-ac"><button class="btn dg" data-a="sas:no">They don’t match</button><button class="btn" data-a="sas:yes">They match ✓</button></div></div>`;
}
function startCall() { if (S._callInt) clearInterval(S._callInt); S.callDuration = 0; S._callInt = setInterval(() => { S.callDuration++; const el = $('cd'); if (el) { const m = String(Math.floor(S.callDuration / 60)).padStart(2, '0'); const s = String(S.callDuration % 60).padStart(2, '0'); el.textContent = m + ':' + s; } }, 1000); }
function stopCall() { if (S._callInt) { clearInterval(S._callInt); S._callInt = null; } }

/* --------------------------------------------------------------- libram -- */
function sLibram() {
  const facs = Object.keys(VB.factions);
  const maxAbs = Math.max(6, ...facs.map((f) => Math.abs(S.rep[f] || 0)));
  return `${sb()}<div class="hdr"><div><div class="hdr-tt">The Libram</div><div class="hdr-sub">${S.deeds.length} deeds <span class="dot">·</span> ${S.relics.length} relics</div></div><div class="hdr-act"><button class="hbtn" data-a="enter-app">←</button></div></div>
  <div class="cnt">
  <div class="lib-hero"><div class="lib-quote">“A chronicler who never sleeps. Every NPC in the Spire can read this book.”</div>
  <div class="lib-id"><span class="lib-sig" style="color:${cls().color}">${cls().sigil}</span> <b>${esc(S.handle || 'unbound')}</b> · ${cls().name}</div></div>

  <div class="sc-g">Standing across the six factions</div>
  ${facs.map((f) => { const v = S.rep[f] || 0; const w = Math.round((Math.abs(v) / maxAbs) * 50); const pos = v >= 0; const fac = VB.factions[f];
    return `<div class="rep"><div class="rep-h"><span class="rep-n"><span style="color:${fac.color}">${fac.sigil}</span> ${esc(fac.name)}</span><span class="rep-v ${pos ? 'p' : 'n'}">${v > 0 ? '+' : ''}${v}</span></div>
    <div class="rep-bar"><span class="rep-mid"></span><span class="rep-fl ${pos ? 'p' : 'n'}" style="width:${w}%;background:${fac.color}"></span></div></div>`; }).join('')}

  <div class="sc-g" style="margin-top:24px">Relics carried</div>
  ${S.relics.length ? S.relics.map((k) => { const L = VB.loot[k]; return `<div class="relic" style="--lc:${L.color};--lg:${L.glow}"><span class="relic-beam"></span><div class="relic-i"><div class="relic-n" style="color:${L.color}">${esc(L.name)}</div><div class="relic-t">${L.tier}</div><div class="relic-note">${esc(L.note)}</div></div></div>`; }).join('') : '<div class="lib-empty">No relics yet. The Spire is generous to the bold.</div>'}

  <div class="sc-g" style="margin-top:24px">Thread of deeds</div>
  ${S.deeds.length ? [...S.deeds].reverse().map((d) => `<div class="deed"><div class="deed-n">Deed ${String(d.n).padStart(4, '0')}</div><div class="deed-b">${esc(d.deed)}</div></div>`).join('') : '<div class="lib-empty">The page is blank. Go and do something the city will remember.</div>'}
  </div>${nav('libram')}`;
}

/* --------------------------------------------------------------- wall ---- */
function sWall() {
  if (!S.flags.wall_open) {
    return `${sb()}<div class="hdr"><div><div class="hdr-tt">Notice Wall</div><div class="hdr-sub">Forsaken contracts</div></div><div class="hdr-act"><button class="hbtn" data-a="enter-app">←</button></div></div>
    <div class="cnt"><div class="wall-locked"><div class="ic">▦</div><div class="h2">The Wall is sealed.</div><div class="lede">Find <b>the Tally</b> — the Forsaken broker — over Comms and earn access. Vael in the Middle Reach can point you to him.</div></div></div>${nav('wall')}`;
  }
  return `${sb()}<div class="hdr"><div><div class="hdr-tt">Notice Wall</div><div class="hdr-sub">No markers · no maps · the city continues either way</div></div><div class="hdr-act"><button class="hbtn" data-a="enter-app">←</button></div></div>
  <div class="cnt">${VB.wall.map((w) => { const fac = VB.factions[w.faction]; const st = S.wallState[w.id];
    return `<div class="notice ${st ? 'done' : ''}" style="--fc:${fac.color}">
    <div class="notice-h"><span class="notice-sig" style="color:${fac.color}">${fac.sigil}</span><div><div class="notice-t">${esc(w.title)}</div><div class="notice-p">${esc(w.place)} · ${esc(fac.name)}</div></div></div>
    <div class="notice-b">${esc(w.body)}</div>
    ${st ? `<div class="notice-st ${st}">${st === 'accept' ? '✓ Accepted — written to the Libram' : '○ Ignored — the city found another way'}</div>`
        : `<div class="notice-a"><button class="btn sec btn-sm" data-a="wall:${w.id}:ignore">Ignore</button><button class="btn btn-sm" data-a="wall:${w.id}:accept">Accept</button></div>`}
    </div>`; }).join('')}</div>${nav('wall')}`;
}

/* --------------------------------------------------------------- mesh ---- */
function sMesh() {
  const nodes = S.meshList.map((n, i) => { const x = 120 + Math.cos(n.a) * n.d; const y = 120 + Math.sin(n.a) * n.d; return `<span class="mr-nd" style="left:${x - 6}px;top:${y - 6}px;animation-delay:${i * 110}ms"></span>`; }).join('');
  return `${sb()}<div class="hdr"><div><div class="hdr-tt">Veil Mesh</div><div class="hdr-sub">BLE <span class="dot">·</span> Wi-Fi Aware <span class="dot">·</span> off-grid</div></div><div class="hdr-act"><button class="hbtn" data-a="enter-app">←</button></div></div>
  ${S.inMesh ? `<div class="bnr m"><span class="dot"></span>Mesh live · foreground service running</div>` : ''}
  <div class="cnt flush" style="padding-bottom:8px">
  <div class="mr-w"><div class="mr-o"><div class="mr-c"><span class="mr-rg r1"></span><span class="mr-rg r2"></span><span class="mr-ax v"></span><span class="mr-ax h"></span>${S.inMesh ? '<span class="mr-sw"></span>' : ''}${S.inMesh ? nodes : ''}<span class="mr-ct"></span></div></div>
  <div class="mr-lb"><span class="n">${String(S.meshNodes).padStart(2, '0')}</span><span class="l">nodes in range</span></div>
  <div class="mr-cd">Underhive sub-level · 47.2680°N 11.4040°E</div></div>
  <div class="mr-ss">
    <div class="mr-s"><div class="mr-s-l">Carried blobs</div><div class="mr-s-v">${S.inMesh ? '2.4' : '0'}<span class="sm">/ 50 MB</span></div></div>
    <div class="mr-s"><div class="mr-s-l">PoW verify</div><div class="mr-s-v">4.2<span class="sm">ms</span></div></div>
    <div class="mr-s"><div class="mr-s-l">Argon2id</div><div class="mr-s-v">16<span class="sm">MB · 2it</span></div></div>
    <div class="mr-s"><div class="mr-s-l">Cull queue</div><div class="mr-s-v">0<span class="sm">blobs</span></div></div>
  </div>
  <div class="mr-lg">${S.meshLog.length ? S.meshLog.slice(-7).map((l) => `<div><span class="ts">[${l.t}]</span> <span class="${l.k}">${esc(l.msg)}</span></div>`).join('') : '<div class="mut">Mesh idle · activate to sweep for off-grid contacts in the Old Ruins.</div>'}</div>
  <div class="mr-ac"><button class="btn sec" data-a="mesh-toggle">${S.inMesh ? 'Deactivate' : 'Activate'}</button><button class="btn sec" data-a="mesh-scan" ${S.inMesh ? '' : 'disabled'}>Sweep</button></div>
  </div>${nav('mesh')}`;
}

/* ------------------------------------------------------------- warding --- */
function sWarding() {
  const done = Object.values(S.wards).filter((v) => v).length;
  const total = Object.keys(S.wards).length;
  const pct = Math.round((done / total) * 100);
  const tier = (t) => VB.wards.filter((w) => w.tier === t);
  const item = (w) => { const dn = S.wards[w.key]; const cl = dn ? 'dn' : w.wizard ? 'rc' : ''; return `<div class="sc-it ${cl}" ${w.wizard && !dn ? `data-a="wiz:${w.wizard}"` : ''}><div class="sc-ck">${dn ? '✓' : w.wizard ? '!' : '○'}</div><div class="sc-tx"><div class="sc-tt">${esc(w.name)}</div><div class="sc-de">${esc(w.desc)}</div></div><div class="sc-ar">${dn ? '' : '›'}</div></div>`; };
  return `${sb()}<div class="hdr"><div><div class="hdr-tt">The Warding</div><div class="hdr-sub">${done} / ${total} wards raised</div></div><div class="hdr-act"><button class="hbtn" data-a="enter-app">←</button></div></div>
  <div class="cnt">
  <div class="sc-hero"><div class="sc-l">How hard you are to read</div><div class="sc-r"><span class="sc-sc">${done}</span><span class="sc-mx">/ ${total}</span></div>
  <div class="sc-bar"><span class="sc-fl" style="width:${pct}%"></span></div>
  <div class="sc-note">Security is never a premium. Every ward is free. The Dominion just hopes you never raise them.</div></div>
  <div class="sc-g">Tier 1 · forced at binding</div>${tier(1).map(item).join('')}
  <div class="sc-g">Tier 2 · recommended</div>${tier(2).map(item).join('')}
  <div class="sc-g">Tier 3 · opt-in hardening</div>${tier(3).map(item).join('')}
  <div class="as" style="margin-top:18px"><button class="btn sec" data-a="go:settings">Slate configuration ›</button></div>
  </div>${nav('warding')}`;
}

/* ------------------------------------------------------------- settings -- */
function sSettings() {
  return `${sb()}${shHdr('Slate Configuration', 'warding')}<div class="cnt">
  <div class="vc"><div class="vc-h"><div><div class="vc-t">Veil mode</div><div class="vc-s">${S.inVeil ? 'Active · wake-pings off' : 'Inactive'}</div></div><div class="vc-sw ${S.inVeil ? 'on' : ''}" data-a="toggle-veil"></div></div><div class="vc-d">No wake-pings, previews hidden, threads pulled only when you open the slate. Use it when patrols are near.</div></div>
  <div class="st-s"><div class="st-l">Transport</div>
  <div class="st-r"><div class="st-i"><div class="st-n">The Hush</div><div class="st-d">Tor + pluggable transports</div></div><div class="st-v on">on</div></div>
  <div class="st-r" data-a="wiz:mixnet"><div class="st-i"><div class="st-n">Mixnet</div><div class="st-d">High latency, max metadata-resistance</div></div><div class="tog ${S.wards.mixnet ? 'on' : ''}"></div></div>
  <div class="st-r" data-a="go:mesh"><div class="st-i"><div class="st-n">Veil Mesh</div><div class="st-d">BLE + Wi-Fi Aware · off-grid</div></div><div class="st-v ${S.inMesh ? 'on' : ''}">${S.inMesh ? 'live' : 'idle'}</div></div></div>
  <div class="st-s"><div class="st-l">Identity</div>
  <div class="st-r"><div class="st-i"><div class="st-n">Handle</div><div class="st-d">@${esc(S.handle || '—')}</div></div><div class="st-v">${cls().name}</div></div>
  <div class="st-r"><div class="st-i"><div class="st-n">Your Mark</div><div class="st-d mono">${cls().sigil} ${esc((S.handle || 'void').slice(0, 4).toUpperCase())} · 9B2E · D4C8 · 6A91</div></div></div>
  <div class="st-r"><div class="st-i"><div class="st-n">Key Transparency</div><div class="st-d">Inclusion-proof · sealed</div></div><div class="st-v on">✓ OK</div></div></div>
  <div class="st-s"><div class="st-l">Storage & seal</div>
  <div class="st-r"><div class="st-i"><div class="st-n">Local vault</div><div class="st-d">SQLCipher · envelope-encrypted</div></div><div class="st-v on">✓</div></div>
  <div class="st-r"><div class="st-i"><div class="st-n">Burner default</div><div class="st-d">Ephemeral threads</div></div><div class="st-v ${S.wards.burner ? 'on' : ''}">${S.burnerDefault}</div></div>
  <div class="st-r"><div class="st-i"><div class="st-n">Warrant canary</div><div class="st-d">Sealed · Conclave 14th</div></div><div class="st-v on">✓ active</div></div></div>
  <div class="st-s"><button class="btn ghost" data-a="reset">Wipe slate & restart</button></div>
  <div class="cfg-foot">VOID BOUND: NOX · vertical slice<br>the Libram remembers all</div>
  </div>`;
}

/* ------------------------------------------------------------- wizards --- */
function sWizard() {
  const w = S._wiz; if (!w) return sWarding();
  return `${sb()}${shHdr(w.title, 'warding')}<div class="cnt">
  <div class="lbl g">${w.tier}</div><div class="h1">${w.title}</div>${w.body}
  <div class="ar"><button class="btn sec" data-a="go:warding">Cancel</button><button class="btn ${w.danger ? 'dg' : ''}" data-a="wiz-confirm">${w.cta || 'Raise ward'}</button></div></div>`;
}
const WIZ = {
  trust: { key: 'trust', tier: 'Tier 2', title: 'Trusted hand', body: `<div class="lede">A verified contact warned the moment you are taken. The dark-hour failsafe.</div><div class="wz"><div class="wz-i"><span class="wz-ic">✓</span><div><div class="wz-n">Wren · Spire Pact</div><div class="wz-d">Mark verified · SAS 4 cycles ago</div></div></div><div class="wz-i"><span class="wz-ic">✓</span><div><div class="wz-n">Kestrel · Spire Pact</div><div class="wz-d">Mark verified</div></div></div></div>`, on: () => { S.wards.trust = true; toast('Trusted hands sworn'); } },
  distress: { key: 'distress', tier: 'Tier 2', title: 'Distress sigil', body: `<div class="lede">Who is warned under duress? <strong>Position + a word</strong> — never live audio.</div><div class="nt w"><b>Trigger:</b> glyph <code>911999</code> on the lock screen sends your position to the Pact.</div>`, on: () => { S.wards.distress = true; toast('Distress sigil armed · <b>911999</b>'); } },
  burner: { key: 'burner', tier: 'Tier 3', title: 'Burner default', body: `<div class="lede">How fast ephemeral threads turn to ash. Per-thread overridable.</div><div class="ttl-p">${['1h', '24h', '7d', '30d'].map((t) => `<button class="ttl ${S.burnerDefault === t ? 'on' : ''}" data-a="set-ttl:${t}">${t}</button>`).join('')}</div><div class="nt">Current: <b id="ttlv">${S.burnerDefault}</b> · message-key destroyed at expiry (crypto-erasure).</div>`, on: () => { S.wards.burner = true; toast('Burner default · ' + S.burnerDefault); } },
  mixnet: { key: 'mixnet', tier: 'Tier 3', title: 'Mixnet', body: `<div class="nt w"><b>Trade-off.</b> The mixnet defeats global traffic-analysis but adds seconds-to-minutes latency and battery cost.</div><div class="lede">Recommended: <strong>opt-in per message</strong> for the most sensitive threads.</div>`, on: () => { S.wards.mixnet = true; toast('Mixnet available as an option'); } },
  panic: { key: 'panic', tier: 'Tier 3', title: 'Panic glyphs', body: `<div class="nt d"><b>Silent execution.</b> Warned only at setup, never at trigger.</div><div class="wz"><div class="wz-i"><span class="wz-ic">⌖</span><div><div class="wz-n">Real shred <code>911000</code></div><div class="wz-d">Crypto-shred the real vault · decoy survives</div></div></div><div class="wz-i"><span class="wz-ic wr">◐</span><div><div class="wz-n">Decoy shred <code>911111</code></div><div class="wz-d">Wipe the current decoy</div></div></div></div><div class="nt">On the lock screen these show “wrong cipher” while the shred runs atomically beneath.</div>`, cta: 'Arm glyphs', danger: true, on: () => { S.wards.panic = true; toast('Panic glyphs armed', 'warn'); } },
  decoy: { key: 'decoy', tier: 'Tier 3', title: 'Decoy vault', body: `<div class="nt w"><b>Plausible deniability.</b> A second vault, its own cipher, harmless contents, cryptographically independent.</div><div class="st-r"><div class="st-i"><div class="st-n">Demo decoy-cipher</div><div class="st-d">In the real app: you set it</div></div><div class="st-v on mono">${esc(S.decoyCipher)}</div></div><div class="nt">After this: enter <code>${esc(S.decoyCipher)}</code> at the lock screen → a different, innocent thread list.</div>`, on: () => { S.wards.decoy = true; toast('Decoy vault sealed'); } },
  hardware: { key: 'hardware', tier: 'Tier 3', title: 'Bound talisman', body: `<div class="lede">An external token (FIDO2 / YubiKey) as a second factor. Token-agnostic. Loss ≠ account loss.</div><div class="wz"><div class="wz-i"><span class="wz-ic">▸</span><div><div class="wz-n">Vault unlock factor</div><div class="wz-d">Per vault · never the decoy</div></div></div><div class="wz-i"><span class="wz-ic">▸</span><div><div class="wz-n">New-device auth</div><div class="wz-d">A new slate needs the talisman</div></div></div></div>`, on: () => { S.wards.hardware = true; toast('Talisman bound · YubiKey 5C'); } },
};

/* ================================================================ BIND === */
function bind() {
  document.querySelectorAll('[data-a]').forEach((el) => { el.onclick = (e) => { e.stopPropagation(); handle(el.dataset.a); }; });
  const hi = $('hi');
  if (hi) {
    setTimeout(() => hi.focus(), 80);
    let tmr; hi.addEventListener('input', () => {
      const v = hi.value.trim(); const st = $('hs'); const btn = $('hn'); clearTimeout(tmr);
      if (!v.length) { st.textContent = ''; st.className = 'inp-st'; btn.disabled = true; S.handle = ''; }
      else if (v.length < 3) { st.textContent = 'too short'; st.className = 'inp-st bd'; btn.disabled = true; }
      else if (v.includes(' ')) { st.textContent = 'no spaces'; st.className = 'inp-st bd'; btn.disabled = true; }
      else { st.textContent = 'checking…'; st.className = 'inp-st ck'; btn.disabled = true; tmr = setTimeout(() => { st.textContent = '✓ free'; st.className = 'inp-st ok'; S.handle = v; btn.disabled = false; save(); }, 500); }
    });
  }
  const ms = $('ms'); if (ms) setTimeout(() => (ms.scrollTop = ms.scrollHeight), 40);
}

/* ============================================================== HANDLE === */
function handle(action) {
  const [type, ...rest] = action.split(':'); const arg = rest.join(':');
  switch (type) {
    case 'go': go(arg); break;
    case 'back': back(); break;
    case 'reset': confirmReset(); break;
    case 'pick-class': S.classId = arg; save(); render(); break;
    case 'pin': handlePin(arg); break;
    case 'sigil-pick': { const [i, w] = arg.split(':'); S.sigilAnswers[+i] = w; render(); break; }
    case 'sigil-confirm': {
      const ch = S.sigilChallenge;
      if (S.sigilAnswers[0] === ch.correct[0] && S.sigilAnswers[1] === ch.correct[1]) { toast('Sigil verified · <b>Mark committed to the KT-log</b>'); S.started = true; save(); go('cc-done'); }
      else { toast('At least one glyph is wrong.', 'warn'); S.sigilAnswers = [null, null]; S.sigilChallenge = null; render(); }
      break;
    }
    case 'enter-app': S.screen = 'chats'; S.activeChatId = null; save(); render(); break;
    case 'open': { S.activeChatId = arg; S.unread[arg] = 0; save(); go('chat'); break; }
    case 'back-chats': S.activeChatId = null; go('chats'); break;
    case 'choose': { const [cid, nid, idx] = arg.split(':'); choose(cid, nid, +idx); break; }
    case 'toggle-veil': S.inVeil = !S.inVeil; flash(); toast(S.inVeil ? 'Veil mode on · wake-pings off' : 'Veil mode off', S.inVeil ? 'warn' : 'ok'); save(); render(); break;
    case 'lock-vault': S.cipherTemp = ''; go('lock'); break;
    case 'sas-call': S.sasContact = arg; S.sasWords = pickSas(); go('sas'); break;
    case 'sas': handleSas(arg); break;
    case 'hangup': stopCall(); back(); break;
    case 'wall': { const [wid, act] = arg.split(':'); handleWall(wid, act); break; }
    case 'mesh-toggle': toggleMesh(); break;
    case 'mesh-scan': if (S.inMesh) startMesh(); break;
    case 'wiz': openWizard(arg); break;
    case 'wiz-confirm': if (S._wiz && S._wiz.on) { S._wiz.on(); save(); go('warding'); } break;
    case 'set-ttl': S.burnerDefault = arg; { const v = $('ttlv'); if (v) v.textContent = arg; } document.querySelectorAll('.ttl').forEach((b) => b.classList.toggle('on', b.dataset.a === 'set-ttl:' + arg)); break;
  }
}

/* SAS resolution: the heart of the anti-impostor mechanic ---------------- */
function handleSas(ans) {
  stopCall();
  const c = findContact(S.sasContact);
  const impostor = c && c.impostor;
  if (ans === 'yes') {
    if (impostor) {
      // player confirmed a mismatched phrase → walked into the sting
      toast('You confirmed a <b>mismatched</b> phrase. There was a third party on the wire.', 'danger', 5200);
      if (c) { S.flags.vael_burned = true; recordDeed('Confirmed a bad SAS phrase against an impostor handle. The sting succeeded.'); S.rep.forsaken -= 6; }
      back();
    } else {
      if (c) c.verified = true;
      toast('Identity verified · <b>no man-in-the-middle</b>');
      back();
    }
  } else {
    // "they don't match" → caller rejected
    if (impostor) {
      toast('Good. You caught it — that was a Vigil sting.', 'ok', 4600);
      S.nodePtr[c.id] = 'caught'; S.threadDone[c.id] = false; save();
      S.screen = 'chat'; S.activeChatId = c.id; S.prev = S.prev.filter((p) => p !== 'sas'); render();
      return;
    } else {
      toast('Call aborted · phrases differed (MITM suspected).', 'danger');
      back();
    }
  }
}

/* Notice Wall ------------------------------------------------------------ */
function handleWall(wid, act) {
  const w = VB.wall.find((x) => x.id === wid); if (!w || S.wallState[wid]) return;
  S.wallState[wid] = act;
  applyEffects(w[act], w);
  toast(act === 'accept' ? 'Contract accepted' : 'Notice ignored', act === 'accept' ? 'ok' : 'warn');
  save(); render();
}

/* Wizards ---------------------------------------------------------------- */
function openWizard(key) { S._wiz = WIZ[key]; if (S._wiz) go('wiz'); }

/* PIN / cipher handling -------------------------------------------------- */
function handlePin(k) {
  if (k === 'clear') { S.cipherTemp = ''; render(); return; }
  if (k === 'back') { S.cipherTemp = S.cipherTemp.slice(0, -1); render(); return; }
  if (S.cipherTemp.length >= 6) return;
  S.cipherTemp += k;
  if (S.cipherTemp.length === 6) {
    if (S.screen === 'cc-cipher') { S.cipher = S.cipherTemp; S.cipherTemp = ''; setTimeout(() => go('cc-cipher2'), 260); render(); return; }
    if (S.screen === 'cc-cipher2') {
      if (S.cipherTemp === S.cipher) { S.cipherTemp = ''; save(); setTimeout(() => go('cc-keygen'), 300); render(); }
      else { S.cipherTemp = ''; render(); setTimeout(() => document.querySelectorAll('.pd-d').forEach((d) => d.classList.add('er')), 30); toast('Ciphers do not match', 'warn'); setTimeout(() => { S.cipher = ''; go('cc-cipher'); }, 850); }
      return;
    }
    if (S.screen === 'lock') {
      const e = S.cipherTemp; S.cipherTemp = '';
      if (e === S.cipher) { S.inDecoy = false; flash(); toast('Real vault unsealed'); setTimeout(() => { S.screen = 'chats'; save(); render(); }, 280); render(); return; }
      if (S.wards.decoy && e === S.decoyCipher) { S.inDecoy = true; flash(); toast('Vault unsealed'); setTimeout(() => { S.screen = 'chats'; save(); render(); }, 280); render(); return; }
      if (S.wards.panic && e === '911000') { lockShake(); toast('Wrong cipher', 'warn'); setTimeout(() => { S.realWiped = true; S.msgs = {}; toast('<b>[SILENT]</b> Real vault crypto-shredded · decoys intact', 'danger', 5200); render(); }, 800); save(); return; }
      if (S.wards.panic && e === '911111') { lockShake(); toast('Wrong cipher', 'warn'); setTimeout(() => { S.decoyContacts.forEach((c) => (c.scroll = [])); toast('<b>[SILENT]</b> Current decoy crypto-shredded', 'danger', 5000); }, 800); return; }
      if (S.wards.distress && e === '911999') { lockShake(); toast('Wrong cipher', 'warn'); setTimeout(() => toast('<b>[SILENT]</b> Distress sent to <b>the Spire Pact</b> · position + word', 'danger', 5200), 800); return; }
      lockShake(); toast('Wrong cipher', 'warn'); setTimeout(render, 650); return;
    }
  }
  render();
}
function lockShake() { document.querySelectorAll('.pd-d').forEach((d) => d.classList.add('er')); }

/* Mesh ------------------------------------------------------------------- */
function toggleMesh() {
  S.inMesh = !S.inMesh;
  if (S.inMesh) { startMesh(); toast('Veil Mesh active · foreground service running'); }
  else { S.meshNodes = 0; S.meshList = []; S.meshLog = []; toast('Veil Mesh deactivated'); }
  save(); render();
}
function tstamp() { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map((x) => String(x).padStart(2, '0')).join(':'); }
function startMesh() {
  S.meshNodes = 0; S.meshList = [];
  S.meshLog = [{ t: tstamp(), k: 'if', msg: 'BLE discovery initialised · neverForLocation' }, { t: tstamp(), k: 'if', msg: 'Wi-Fi Aware NAN session opened' }];
  const targets = 3 + Math.floor(Math.random() * 3); let count = 0;
  const tick = () => {
    if (count >= targets) {
      S.meshLog.push({ t: tstamp(), k: 'ok', msg: `Discovery stable · ${S.meshNodes} nodes · PoW ✓` });
      // discovering the mesh reveals the hidden Weaver, Loom
      if (!S.revealed.loom) { S.revealed.loom = true; S.unread.loom = (S.unread.loom || 0) + 1; S.meshLog.push({ t: tstamp(), k: 'ok', msg: 'off-grid contact resolved · LOOM · Old Ruins' }); toast('↯ Off-grid contact found · <b>Loom · Old Ruins</b>', 'ok', 4600); }
      save(); render(); return;
    }
    S.meshList.push({ a: (count / targets) * Math.PI * 2 + Math.random() * 0.8, d: 45 + Math.random() * 75 });
    S.meshNodes++;
    S.meshLog.push({ t: tstamp(), k: 'ok', msg: `Node ${'ABCDEFGH'[count]}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')} · PoW ✓ · RSSI -${50 + Math.floor(Math.random() * 30)}dBm` });
    count++; render(); setTimeout(tick, 600 + Math.random() * 600);
  };
  setTimeout(tick, 450);
}

/* reset ------------------------------------------------------------------ */
function confirmReset() {
  showSheet(`<div class="sh-hd"></div><div class="sh-tt">Wipe the slate?</div><div class="sh-b">This crypto-shreds your save — deeds, relics, standing, all of it. There is no recovery. The Spire forgets you and you start fresh.</div><div class="sh-a"><button class="btn sec" data-a-sheet="cancel">Keep my slate</button><button class="btn dg" data-a-sheet="reset">Wipe everything</button></div>`);
  document.querySelectorAll('[data-a-sheet]').forEach((el) => { el.onclick = () => { if (el.dataset.aSheet === 'reset') { localStorage.removeItem(SAVE_KEY); if (S._callInt) clearInterval(S._callInt); S = freshState(); hideSheet(); render(); } else hideSheet(); }; });
}

/* logo mark -------------------------------------------------------------- */
const MARK = `<svg viewBox="0 0 64 64" fill="none"><path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" stroke="var(--gold)" stroke-width="2"/><path d="M32 12 L48 21 L48 43 L32 52 L16 43 L16 21 Z" fill="var(--gold)" opacity="0.14"/><path d="M22 24 L32 30 L42 24 M22 38 L32 32 L42 38 M32 30 L32 44" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="30" r="3" fill="var(--gold)"/></svg>`;

/* boot ------------------------------------------------------------------- */
render();
setInterval(() => document.querySelectorAll('.sb .l span').forEach((el) => (el.textContent = clock())), 30000);
window.addEventListener('beforeunload', save);

})();
