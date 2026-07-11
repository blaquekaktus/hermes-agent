# Pulse

A tiny private-messenger demo with a **Signal / Snapchat** flavour — dark UI,
a chat list, conversation view, ephemeral ("disappearing") messages, and
24-hour stories. Pure HTML/CSS/JS, no build step, no backend.

## Run it

Just open `index.html` in a browser:

```sh
# from this folder
open index.html        # macOS
xdg-open index.html    # Linux
# or serve it
python3 -m http.server 8000   # then visit http://localhost:8000
```

On a desktop the app renders inside a phone frame; on mobile it fills the screen.

## What's in it

- **Chat list** with avatars, online dots, unread badges and last-message previews
- **Conversation view** with bubbles, timestamps, read receipts (✓✓) and a typing indicator
- **Auto-replies** — the other side answers so the demo feels alive
- **Disappearing messages** (⏱) — toggle per chat; ephemeral messages burn after you've viewed them and leave the conversation
- **Stories** — tap a story ring to watch; add your own from the "Your story" bubble; auto-advancing progress bars like Snapchat/Instagram
- **Snap button** (⊕) with a camera-flash effect
- **Settings** — change your display name and avatar, set disappearing-by-default, toggle read receipts, and reset the demo
- **Search** to filter your chats
- **Local persistence** — everything is saved to `localStorage` under the `pulse.v1` key

## Notes

This is a front-end prototype for look-and-feel. There is no real
cryptography, networking, or server — "end-to-end nothing", as the footer
says. The aesthetic is inspired by the uploaded NoxVoid prototype.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `styles.css` | All styling / theming |
| `app.js` | State, screens, and interactions |
