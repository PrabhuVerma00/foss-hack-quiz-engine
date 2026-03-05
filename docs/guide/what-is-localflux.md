# What is LocalFlux?

LocalFlux is a **bare-metal, self-hosted multiplayer trivia framework** designed
to run entirely on a Local Area Network (LAN) — no internet connection required.

## The Problem It Solves

Every cloud-based quiz platform shares the same fatal flaw: they assume a stable
uplink. Drop 50 phones onto a cheap venue router and you will see the infamous
"spinning wheel of death" within minutes.

LocalFlux sidesteps the cloud entirely. The host machine **is** the server.
Players connect directly to it over Wi-Fi, keeping all WebSocket traffic on the
local subnet — latency measured in single-digit milliseconds, not hundreds.

## Core Principles

| Principle | What it means in practice |
|---|---|
| **LAN-first** | The server binds to `0.0.0.0` and auto-detects its LAN IP on boot. |
| **Server-authoritative** | Answers, scores, and game state live exclusively in server RAM. |
| **Infrastructure-agnostic** | No database, no cloud account, no Docker required — just Node.js. |
| **Content-agnostic** | Drop any `.json` deck into `data/decks/` and it's playable instantly. |

## Key Features

-  **Dumb Client Security** — correct answers never leave the server until reveal
-  **VIP Bouncer** — traffic queuing prevents router saturation
-  **Difficulty Engine** — four modes from `easy` to `chaos`
-  **Accolades System** — five post-game achievement badges
-  **JIT Image Delivery** — images served as Base64 over WebSocket, never as public URLs
-  **In-Room Chat** — real-time system and player messages throughout the match
-  **Deck Studio** — browser-based deck builder built into the Host Dashboard
