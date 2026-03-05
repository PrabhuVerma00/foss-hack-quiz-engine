---
# VitePress Hero / Home Page
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "LocalFlux"
  text: "Zero-Latency LAN Events."
  tagline: >
    A bare-metal, self-hosted multiplayer trivia framework. No cloud.
    No spinning wheels of death. Just raw LAN speed — from the host's
    laptop to every player in the room.
  image:
    src: /hero-illustration.svg
    alt: LocalFlux network diagram
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Unknownbeliek/foss-hack-quiz-engine

features:
  - 
    title: Dumb Client Security
    details: >
      Players never see the question bank. Correct answers live
      exclusively in server RAM and are only broadcast at the exact
      millisecond a round ends — making pre-game scraping structurally
      impossible.

  - 
    title: The VIP Bouncer
    details: >
      A two-tier admission system (soft cap 40 / hard cap 50) prevents
      your cheap consumer router from choking under a flood of simultaneous
      WebSocket handshakes. Latecomers queue in purgatory and are
      drained in order as slots open.

  - 
    title: Deck Studio
    details: >
      A browser-based question forge built into the Host Dashboard.
      Import a CSV or paste raw data, attach WebP image assets from
      the local vault, and export a validated .json deck — no external
      tooling required.
---

## Why LocalFlux?

Commercial trivia platforms (Kahoot, Mentimeter, Jackbox) assume a stable
cloud uplink. In high-density venues — college hackathons, rural classrooms,
basement LAN parties — the local router is the first bottleneck to collapse.

**LocalFlux treats the LAN as infrastructure**, not an afterthought.

```
Player A ──┐
Player B ──┤──► Wi-Fi Router ──► Node.js Server  (localhost:3001)
Player C ──┘         ↑                  │
                  NO internet      Socket.io WS
                  required!        ↓ ↓ ↓ ↓ ↓
                              All game state
                              served from RAM
```

The server auto-discovers its own LAN IP on boot and prints a scannable
address so the host can share it as a QR code in seconds.

## Accolades Engine

Every match ends with auto-computed post-game badges that reward more than
just the top score:

| Badge | Trigger |
|---|---|
|  **Ironclad** | Every single answer correct |
|  **Speed Demon** | Fastest average answer time |
|  **Comeback Kid** | Dead last at halftime → top 3 finish |
|  **Underdog Champion** | Triggered 3× bounty multiplier AND finished top 3 |
|  **Ghost** | Never answered a single question |
