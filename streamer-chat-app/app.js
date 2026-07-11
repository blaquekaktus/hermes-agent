/* Pulse — a small private messenger (Signal / Snapchat-flavoured) demo.
   Vanilla JS, no build step. State persists to localStorage.        */
(function () {
  'use strict';

  var STORE_KEY = 'pulse.v1';
  var AVATAR_COLORS = ['🦊', '🐙', '🦉', '🐢', '🦋', '🐧', '🦄', '🐝'];

  /* ---------- seed data ---------- */
  function seed() {
    return {
      me: { name: 'You', handle: 'PULSE-7F3A-9B2E', avatar: '🦊', ephemeralDefault: false, readReceipts: true },
      stories: [
        { id: 's1', name: 'Mara', av: 'M', seen: false, cards: ['just landed ✈️', 'the light here is unreal'], t: '2h' },
        { id: 's2', name: 'Theo', av: 'T', seen: false, cards: ['studio day', 'new track drops friday 🎧'], t: '4h' },
        { id: 's3', name: 'Ravi', av: 'R', seen: true, cards: ['coffee #3'], t: '7h' }
      ],
      chats: [
        {
          id: 'c1', name: 'Mara', av: 'M', verified: true, online: true, ephemeral: false, unread: 2,
          messages: [
            { dir: 'in', text: 'hey! you around this weekend?', t: '14:02' },
            { dir: 'out', text: 'yeah, free saturday. what\'s up?', t: '14:05' },
            { dir: 'in', text: 'thinking of a little trip. i\'ll send details', t: '14:06' },
            { dir: 'in', text: 'bring the camera 📷', t: '14:06' }
          ]
        },
        {
          id: 'c2', name: 'Theo', av: 'T', verified: true, online: false, ephemeral: true, unread: 0,
          messages: [
            { dir: 'system', text: 'Disappearing messages are on · 24h' },
            { dir: 'in', text: 'sent you the mix, lmk what you think', t: 'yesterday' },
            { dir: 'out', text: 'on it tonight 🔊', t: 'yesterday' }
          ]
        },
        {
          id: 'c3', name: 'Design Crew', av: 'D', group: true, verified: false, online: true, ephemeral: false, unread: 5,
          messages: [
            { dir: 'system', text: 'Group · 4 members' },
            { dir: 'in', gn: 'Ravi', text: 'pushed the new mockups', t: '11:42' },
            { dir: 'in', gn: 'Lena', text: 'love the dark variant 🖤', t: '11:48' },
            { dir: 'out', text: 'shipping it', t: '13:02' }
          ]
        },
        {
          id: 'c4', name: 'Ravi', av: 'R', verified: false, online: false, ephemeral: false, unread: 0,
          messages: [
            { dir: 'in', text: 'ping me when you\'re free', t: 'Mon' }
          ]
        }
      ]
    };
  }

  /* ---------- persistence ---------- */
  var state, view = { screen: 'chats', chatId: null, story: null, tab: 'chats' };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      state = raw ? JSON.parse(raw) : seed();
    } catch (e) { state = seed(); }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function now() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function chatById(id) { for (var i = 0; i < state.chats.length; i++) if (state.chats[i].id === id) return state.chats[i]; return null; }
  function lastMsg(c) { for (var i = c.messages.length - 1; i >= 0; i--) if (c.messages[i].dir !== 'system') return c.messages[i]; return null; }

  function toast(body, ms) {
    var wrap = $('#toast');
    var d = document.createElement('div');
    d.className = 'tt';
    d.innerHTML = '<div class="tt-i">✓</div><div class="tt-c">' + body + '</div>';
    wrap.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, ms || 2600);
  }
  function flash() { var f = $('#flash'); f.classList.add('on'); setTimeout(function () { f.classList.remove('on'); }, 300); }

  /* ---------- sheet ---------- */
  function showSheet(html) { $('#sheet').innerHTML = '<div class="shc"><div class="sh-hd"></div>' + html + '</div>'; $('#sheet').classList.add('s'); }
  function hideSheet() { $('#sheet').classList.remove('s'); }

  /* ---------- status bar ---------- */
  function sb() {
    return '<div class="sb"><div class="l">' + now() + '</div>' +
      '<div class="r"><span style="font-size:12px">5G</span>' +
      '<span class="sb-batt">82<span class="sb-batt-ic"><span class="sb-batt-fill"></span></span></span></div></div>';
  }

  /* ---------- screens ---------- */
  function render() {
    var html;
    if (view.screen === 'chat') html = screenChat();
    else if (view.screen === 'profile') html = screenProfile();
    else html = screenChats();
    $('#stk').innerHTML = '<div class="scr in">' + html + '</div>';
    bind();
    if (view.screen === 'chat') { var m = $('.msgs'); if (m) m.scrollTop = m.scrollHeight; }
  }

  function screenChats() {
    var stories = '<div class="stories">' +
      '<div class="story" data-act="add-story"><div class="story-ring me"><div class="story-av story-add">' + state.me.avatar + '</div></div><div class="story-nm">Your story</div></div>' +
      state.stories.map(function (s) {
        return '<div class="story" data-act="story" data-id="' + s.id + '">' +
          '<div class="story-ring ' + (s.seen ? 'seen' : '') + '"><div class="story-av">' + esc(s.av) + '</div></div>' +
          '<div class="story-nm">' + esc(s.name) + '</div></div>';
      }).join('') + '</div>';

    var rows = state.chats.map(function (c) {
      var lm = lastMsg(c);
      var preview = lm ? ((lm.dir === 'out' ? 'You: ' : (lm.gn ? lm.gn + ': ' : '')) + (lm.text || '')) : 'Tap to start chatting';
      var burn = c.ephemeral ? '<span class="burn">⏱</span>' : '';
      return '<div class="cl" data-act="open" data-id="' + c.id + '">' +
        '<div class="av ' + (c.group ? 'gr' : '') + '">' + esc(c.av) + (c.online ? '<span class="av-st"></span>' : '') + '</div>' +
        '<div class="cl-i"><div class="cl-t"><span class="cl-n">' +
        (c.verified ? '<span class="vfy">✓</span>' : '') + '<span>' + esc(c.name) + '</span></span>' +
        '<span class="cl-tm">' + (lm ? esc(lm.t || '') : '') + '</span></div>' +
        '<div class="cl-b"><span class="cl-p">' + burn + esc(preview) + '</span>' +
        (c.unread ? '<span class="cl-u">' + c.unread + '</span>' : '') + '</div></div></div>';
    }).join('');

    if (!state.chats.length) {
      rows = '<div class="cl-em"><div class="ic">💬</div>No chats yet.<br>Tap + to start a conversation.</div>';
    }

    return sb() +
      '<div class="hdr"><div class="hdr-tt">Pul<span class="sl">se</span></div>' +
      '<div class="hdr-act"><button class="hbtn icon" data-act="profile">☰</button></div></div>' +
      stories +
      '<div class="search"><span class="ic">⌕</span><input placeholder="Search" data-act="search" oninput="App.filter(this.value)"></div>' +
      '<div class="cnt" id="chatlist">' + rows + '</div>' +
      '<button class="fab" data-act="new">+</button>' +
      navbar('chats');
  }

  function navbar(tab) {
    var unread = state.chats.reduce(function (n, c) { return n + (c.unread || 0); }, 0);
    var items = [
      { id: 'chats', ic: '💬', l: 'Chats', b: unread },
      { id: 'stories', ic: '◎', l: 'Stories' },
      { id: 'profile', ic: '◇', l: 'You' }
    ];
    return '<div class="bnav">' + items.map(function (i) {
      return '<button class="bni ' + (tab === i.id ? 'on' : '') + '" data-act="nav" data-id="' + i.id + '">' +
        '<span class="bni-ic">' + i.ic + '</span>' + i.l +
        (i.b ? '<span class="bni-bg">' + i.b + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }

  function screenChat() {
    var c = chatById(view.chatId);
    if (!c) { view.screen = 'chats'; return screenChats(); }
    c.unread = 0;

    var body = c.messages.map(function (m) {
      if (m.dir === 'system') return '<div class="msg-s">' + esc(m.text) + '</div>';
      if (m.burned) return '<div class="msg-burn">⏱ message expired</div>';
      var cls = 'msg ' + (m.dir === 'out' ? 'out' : 'in') + (m.ephemeral ? ' ephem' : '');
      var gn = (m.dir === 'in' && m.gn) ? '<div class="msg-gn">' + esc(m.gn) + '</div>' : '';
      var tick = m.dir === 'out' ? '<span>' + (m.read ? '✓✓' : '✓') + '</span>' : '';
      var burn = m.ephemeral ? '⏱ ' : '';
      return '<div class="' + cls + '">' + gn + esc(m.text) +
        '<div class="msg-t">' + burn + esc(m.t || '') + ' ' + tick + '</div></div>';
    }).join('');

    var banner = c.ephemeral ? '<div class="ephem-banner">⏱ Disappearing messages on · vanish after viewing</div>' : '';

    return sb() +
      '<div class="cv-h"><button class="back" data-act="back">←</button>' +
      '<div class="av ' + (c.group ? 'gr' : '') + '" style="width:38px;height:38px;font-size:14px">' + esc(c.av) + '</div>' +
      '<div class="cv-i" data-act="info"><div class="cv-n">' + (c.verified ? '<span class="vfy">✓</span>' : '') + esc(c.name) + '</div>' +
      '<div class="cv-st ' + (c.online ? '' : 'off') + '">' + (c.online ? 'online' : 'last seen recently') + '</div></div>' +
      '<div class="cv-a"><button data-act="toggle-ephem" class="' + (c.ephemeral ? 'on' : '') + '" title="Disappearing messages">⏱</button>' +
      '<button data-act="call">📞</button></div></div>' +
      banner +
      '<div class="msgs" id="msgs">' + body + '</div>' +
      '<div class="cv-in"><button class="cv-at" data-act="snap">⊕</button>' +
      '<input id="composer" placeholder="' + (c.ephemeral ? 'Disappearing message…' : 'Message…') + '" ' +
      'onkeydown="if(event.key===\'Enter\')App.send()" autocomplete="off">' +
      '<button class="cv-sn" data-act="send">↑</button></div>';
  }

  function screenProfile() {
    var me = state.me;
    var rowTog = function (act, name, desc, on) {
      return '<div class="st-r" data-act="' + act + '"><div class="st-i"><div class="st-n">' + name + '</div><div class="st-d">' + desc + '</div></div>' +
        '<div class="tog ' + (on ? 'on' : '') + '"></div></div>';
    };
    return sb() +
      '<div class="cv-h"><button class="back" data-act="back">←</button><div class="cv-i"><div class="cv-n">Settings</div></div></div>' +
      '<div class="cnt">' +
      '<div class="id"><div class="id-a">' + me.avatar + '</div>' +
      '<div class="id-n">' + esc(me.name) + '</div><div class="id-s">' + esc(me.handle) + '</div></div>' +
      '<div class="st-s"><div class="st-l">PROFILE</div>' +
      '<div class="st-r" data-act="edit-name"><div class="st-i"><div class="st-n">Display name</div><div class="st-d">' + esc(me.name) + '</div></div><span style="color:var(--tm)">›</span></div>' +
      '<div class="st-r" data-act="edit-avatar"><div class="st-i"><div class="st-n">Avatar</div><div class="st-d">Tap to change</div></div><span style="font-size:20px">' + me.avatar + '</span></div></div>' +
      '<div class="st-s"><div class="st-l">PRIVACY</div>' +
      rowTog('tog-ephem', 'Disappearing by default', 'New chats start ephemeral', me.ephemeralDefault) +
      rowTog('tog-read', 'Read receipts', 'Let others see ✓✓', me.readReceipts) +
      '</div>' +
      '<div class="st-s"><div class="st-l">DATA</div>' +
      '<div class="st-r" data-act="reset"><div class="st-i"><div class="st-n" style="color:var(--dg)">Reset demo</div><div class="st-d">Clear all chats &amp; restore samples</div></div><span style="color:var(--tm)">›</span></div></div>' +
      '<div style="text-align:center;color:var(--tm);font-size:11px;padding:8px 0 28px">Pulse · local demo · end-to-end nothing</div>' +
      '</div>';
  }

  /* ---------- actions ---------- */
  function send() {
    var c = chatById(view.chatId); if (!c) return;
    var inp = $('#composer'); if (!inp) return;
    var text = inp.value.trim(); if (!text) return;
    inp.value = '';
    c.messages.push({ dir: 'out', text: text, t: now(), read: false, ephemeral: !!c.ephemeral });
    save();
    appendAndScroll();
    setTimeout(function () { autoReply(c); }, 700 + Math.random() * 800);
  }

  function appendAndScroll() { render(); }

  function autoReply(c) {
    var msgs = $('#msgs'); if (!msgs || view.chatId !== c.id) return;
    // typing indicator
    var t = document.createElement('div');
    t.className = 'typing'; t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;

    var replies = [
      'haha for sure', 'sounds good 👍', 'tell me more', 'omw', 'love that',
      'can\'t wait', 'one sec', 'sending now', 'agreed 💯', 'let\'s do it'
    ];
    var reply = replies[Math.floor(Math.random() * replies.length)];
    var gn = c.group ? ['Ravi', 'Lena'][Math.floor(Math.random() * 2)] : null;

    setTimeout(function () {
      if (view.chatId !== c.id) { c.messages.push(mk()); c.unread = (c.unread || 0) + 1; save(); return; }
      // mark our last outgoing as read
      for (var i = c.messages.length - 1; i >= 0; i--) { if (c.messages[i].dir === 'out') { c.messages[i].read = state.me.readReceipts; break; } }
      c.messages.push(mk());
      save();
      render();
    }, 1100 + Math.random() * 700);

    function mk() { var o = { dir: 'in', text: reply, t: now(), ephemeral: !!c.ephemeral }; if (gn) o.gn = gn; return o; }
  }

  function openChat(id) {
    var c = chatById(id); if (!c) return;
    // burn previously-viewed ephemeral incoming messages from earlier visits
    burnExpired(c);
    view.screen = 'chat'; view.chatId = id;
    c.unread = 0; save(); render();
    // mark ephemeral incoming as viewed -> they will burn next open
    c.messages.forEach(function (m) { if (m.ephemeral && m.dir === 'in' && !m.viewed) m.viewed = true; });
    save();
  }

  function burnExpired(c) {
    c.messages.forEach(function (m) { if (m.ephemeral && m.viewed && !m.burned) m.burned = true; });
  }

  function toggleEphem() {
    var c = chatById(view.chatId); if (!c) return;
    c.ephemeral = !c.ephemeral;
    c.messages.push({ dir: 'system', text: c.ephemeral ? 'You turned on disappearing messages · vanish after viewing' : 'You turned off disappearing messages' });
    save(); render();
    toast(c.ephemeral ? '⏱ Disappearing messages <b>on</b>' : 'Disappearing messages off');
  }

  function newChat() {
    showSheet('<div class="sh-tt">New chat</div>' +
      '<div class="sh-b">Add someone by name. This is a local demo, so they\'ll reply automatically.</div>' +
      '<input class="sh-in" id="newName" placeholder="Name" autocomplete="off">' +
      '<div class="sh-a"><button class="btn sec" data-act="sheet-cancel">Cancel</button>' +
      '<button class="btn" data-act="sheet-create">Start chat</button></div>');
    setTimeout(function () { var n = $('#newName'); if (n) n.focus(); }, 100);
  }

  function createChat() {
    var n = $('#newName'); var name = n ? n.value.trim() : '';
    if (!name) { toast('Enter a name'); return; }
    var av = name.charAt(0).toUpperCase();
    var c = { id: 'c' + Date.now(), name: name, av: av, verified: false, online: Math.random() > 0.5, ephemeral: state.me.ephemeralDefault, unread: 0, messages: [] };
    state.chats.unshift(c); save(); hideSheet();
    view.screen = 'chat'; view.chatId = c.id; render();
  }

  function addStory() {
    showSheet('<div class="sh-tt">Add to your story</div>' +
      '<div class="sh-b">Share a quick update. Stories are visible for 24h.</div>' +
      '<input class="sh-in" id="storyText" placeholder="What\'s happening?" autocomplete="off">' +
      '<div class="sh-a"><button class="btn sec" data-act="sheet-cancel">Cancel</button>' +
      '<button class="btn" data-act="sheet-story">Share</button></div>');
    setTimeout(function () { var s = $('#storyText'); if (s) s.focus(); }, 100);
  }
  function postStory() {
    var s = $('#storyText'); var txt = s ? s.value.trim() : '';
    if (!txt) { toast('Write something first'); return; }
    var mine = null;
    for (var i = 0; i < state.stories.length; i++) if (state.stories[i].id === 'me') mine = state.stories[i];
    if (!mine) { mine = { id: 'me', name: 'You', av: state.me.avatar, seen: false, cards: [], t: 'now' }; state.stories.unshift(mine); }
    mine.cards.push(txt); mine.t = 'now';
    save(); hideSheet(); flash(); toast('Posted to your story ✨');
  }

  /* ---------- story viewer ---------- */
  function viewStory(id) {
    var s = null; for (var i = 0; i < state.stories.length; i++) if (state.stories[i].id === id) s = state.stories[i];
    if (!s) return;
    s.seen = true; save();
    view.story = { story: s, idx: 0 };
    renderStory();
  }
  function renderStory() {
    var vs = view.story; if (!vs) return;
    var s = vs.story;
    var existing = $('.sv'); if (existing) existing.parentNode.removeChild(existing);
    var bars = s.cards.map(function (_, i) {
      var cls = i < vs.idx ? 'done' : (i === vs.idx ? 'now' : '');
      return '<div class="sv-bar ' + cls + '"><div class="fl"></div></div>';
    }).join('');
    var el = document.createElement('div');
    el.className = 'sv';
    el.innerHTML = '<div class="sv-bars">' + bars + '</div>' +
      '<div class="sv-hd"><div class="sv-av">' + esc(s.av) + '</div><div class="sv-nm">' + esc(s.name) + '</div>' +
      '<div class="sv-tm">' + esc(s.t) + '</div><button class="sv-x" data-act="story-close">✕</button></div>' +
      '<div class="sv-nav"><div class="z" data-act="story-prev"></div><div class="z" data-act="story-next"></div></div>' +
      '<div class="sv-body"><div class="sv-card">' + esc(s.cards[vs.idx]) + '</div></div>';
    $('#app').appendChild(el);
    bindStory(el);
    clearTimeout(view._storyTimer);
    view._storyTimer = setTimeout(function () { storyNext(); }, 4000);
  }
  function storyNext() {
    var vs = view.story; if (!vs) return;
    if (vs.idx < vs.story.cards.length - 1) { vs.idx++; renderStory(); }
    else closeStory();
  }
  function storyPrev() {
    var vs = view.story; if (!vs) return;
    if (vs.idx > 0) { vs.idx--; renderStory(); } else closeStory();
  }
  function closeStory() {
    clearTimeout(view._storyTimer);
    var el = $('.sv'); if (el) el.parentNode.removeChild(el);
    view.story = null; render();
  }
  function bindStory(el) {
    el.querySelectorAll('[data-act]').forEach(function (n) {
      n.addEventListener('click', function (e) {
        e.stopPropagation();
        var a = n.getAttribute('data-act');
        if (a === 'story-close') closeStory();
        else if (a === 'story-next') storyNext();
        else if (a === 'story-prev') storyPrev();
      });
    });
  }

  /* ---------- profile actions ---------- */
  function editName() {
    showSheet('<div class="sh-tt">Display name</div>' +
      '<input class="sh-in" id="nm" value="' + esc(state.me.name) + '" autocomplete="off">' +
      '<div class="sh-a"><button class="btn sec" data-act="sheet-cancel">Cancel</button>' +
      '<button class="btn" data-act="sheet-name">Save</button></div>');
    setTimeout(function () { var n = $('#nm'); if (n) { n.focus(); n.select(); } }, 100);
  }
  function saveName() {
    var n = $('#nm'); var v = n ? n.value.trim() : '';
    if (v) { state.me.name = v; save(); }
    hideSheet(); render(); toast('Name updated');
  }
  function editAvatar() {
    var picks = AVATAR_COLORS.map(function (a) {
      return '<div class="pick ' + (a === state.me.avatar ? 'sel' : '') + '" data-act="pick-avatar" data-id="' + a + '">' + a + '</div>';
    }).join('');
    showSheet('<div class="sh-tt">Choose avatar</div><div class="picker">' + picks + '</div>' +
      '<button class="btn sec" data-act="sheet-cancel">Done</button>');
  }
  function resetDemo() {
    showSheet('<div class="sh-tt">Reset demo?</div>' +
      '<div class="sh-b">This clears your chats and stories and restores the sample data. Can\'t be undone.</div>' +
      '<div class="sh-a"><button class="btn sec" data-act="sheet-cancel">Cancel</button>' +
      '<button class="btn" style="background:var(--dg);color:#fff" data-act="sheet-reset">Reset</button></div>');
  }

  /* ---------- event binding ---------- */
  function bind() {
    document.querySelectorAll('[data-act]').forEach(function (n) {
      if (n.tagName === 'INPUT') return;
      n.addEventListener('click', function (e) {
        var a = n.getAttribute('data-act');
        var id = n.getAttribute('data-id');
        handle(a, id, e);
      });
    });
  }

  function handle(a, id, e) {
    switch (a) {
      case 'open': openChat(id); break;
      case 'back': view.screen = 'chats'; render(); break;
      case 'send': send(); break;
      case 'toggle-ephem': toggleEphem(); break;
      case 'call': toast('📞 Calls aren\'t part of this demo'); break;
      case 'snap': flash(); toast('📸 Snap captured (demo)'); break;
      case 'info': { var c = chatById(view.chatId); toast('<b>' + esc(c.name) + '</b> · ' + (c.verified ? 'verified' : 'not verified')); break; }
      case 'new': newChat(); break;
      case 'profile': view.screen = 'profile'; render(); break;
      case 'nav':
        if (id === 'chats') { view.screen = 'chats'; render(); }
        else if (id === 'profile') { view.screen = 'profile'; render(); }
        else if (id === 'stories') { if (state.stories[0]) viewStory(state.stories[0].id); }
        break;
      case 'story': viewStory(id); break;
      case 'add-story': addStory(); break;
      case 'sheet-cancel': hideSheet(); break;
      case 'sheet-create': createChat(); break;
      case 'sheet-story': postStory(); break;
      case 'sheet-name': saveName(); break;
      case 'sheet-reset': state = seed(); save(); hideSheet(); view.screen = 'chats'; render(); toast('Demo reset'); break;
      case 'edit-name': editName(); break;
      case 'edit-avatar': editAvatar(); break;
      case 'pick-avatar': state.me.avatar = id; save(); hideSheet(); render(); toast('Avatar updated'); break;
      case 'tog-ephem': state.me.ephemeralDefault = !state.me.ephemeralDefault; save(); render(); break;
      case 'tog-read': state.me.readReceipts = !state.me.readReceipts; save(); render(); break;
      case 'reset': resetDemo(); break;
    }
  }

  function filter(q) {
    q = (q || '').toLowerCase();
    var rows = document.querySelectorAll('#chatlist .cl');
    rows.forEach(function (r) {
      var name = (r.querySelector('.cl-n') || {}).textContent || '';
      r.style.display = name.toLowerCase().indexOf(q) > -1 ? '' : 'none';
    });
  }

  /* ---------- boot ---------- */
  load();
  render();

  window.App = { send: send, filter: filter, hideSheet: hideSheet };
})();
