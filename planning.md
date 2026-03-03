# LocalFlux: FOSS Hack 2026 Roadmap & Planning

LocalFlux is being developed over a 1-month sprint for FOSS Hack 2026. To maintain discipline and ensure a production-ready submission, we are strictly following a 4-Phase Readme-Driven and Test-Driven Development (TDD) cycle. 

This document outlines our architectural planning and the detailed backlog of technical issues we are currently executing.

---

##  The 4-Phase Sprint Strategy

* **Phase 1: Architecture & Specs (Days 1 - 5) 📍 *[CURRENT PHASE]***
  * Define data structures (`.flux` schema), map out the Socket.io event dictionary, and set up the monorepo workspace. No game logic is written until the blueprints are merged.
* **Phase 2: Core Engine & Testing (Days 6 - 14)**
  * Build the Node.js backend (`deckManager.js`, Fisher-Yates shuffle). Write Vitest automated tests to prove math and queue logic *before* UI integration.
* **Phase 3: Frontend Shell & Integration (Days 15 - 23)**
  * Build the React/Tailwind UI for the Host Dashboard and Mobile Player view. Wire components to the Socket.io server to achieve 0ms LAN latency.
* **Phase 4: The Storefront & Polish (Days 24 - 30)**
  * Finalize the VitePress documentation site, record the demonstration video, and prepare the 60-second Quick Start commands.

---

##  Detailed Task Backlog (Phase 1 & 2)

*The following issues represent our immediate engineering backlog. Each task must be checked out into its own branch, completed, and merged via a Pull Request.*

###  Architecture & Planning

**Issue #1: Finalize Host vs. Player State Shape**
* **Context:** We need to explicitly define the JSON object that the server holds in RAM versus the payload sent to the React clients.
* **Acceptance Criteria:**
  * Define `ServerGameState`: Must include `correctAnswer`, `currentTimer`, and `playerScores`.
  * Define `PlayerPayload`: Must strictly exclude `correctAnswer` to enforce our "Dumb Client" anti-cheat architecture.
  * Document these shapes in `docs/guide/architecture.md`.

**Issue #2: Draft VIP Bouncer Networking Limits**
* **Context:** Venue Wi-Fi routers crash when flooded. We need to document our mathematical limits for Socket.io connections.
* **Acceptance Criteria:**
  * Define the **Soft-Cap (e.g., 40 players):** Subsequent connections receive a `queue_wait` event.
  * Define the **Hard-Cap (e.g., 50 players):** Subsequent connections receive a `connection_rejected` event to protect the host's hardware.

###  Infrastructure & Workspace

**Issue #3: Restructure Monorepo & Isolate Backend Data**
* **Context:** The current folder tree violates separation of concerns. The React frontend should never have geographical access to the trivia decks.
* **Acceptance Criteria:**
  * Resolve the accidental `server/server/` nested directory.
  * Move the root `data/` folder inside the `server/` directory (`server/data/decks/`).
  * Initialize an empty `server/tests/` folder for Vitest.

**Issue #4: Configure Root 'Concurrently' Dev Script**
* **Context:** FOSS Hack judges need to boot the entire framework in one command.
* **Acceptance Criteria:**
  * Install `concurrently` in the root `package.json`.
  * Create an `npm run dev` script that simultaneously triggers the Express server and the Vite React frontend.

###  Core Engine Development

**Issue #5: Build `deckManager` parser for `.flux` schemas**
* **Context:** The Node.js server needs to ingest the trivia data dynamically.
* **Acceptance Criteria:**
  * Create `server/core/deckManager.js`.
  * Implement a function using Node's `fs` module to read `.flux` or `.json` files from `server/data/decks/`.
  * Add error handling for malformed JSON uploads.

**Issue #6: Implement Fisher-Yates Shuffle with Vitest**
* **Context:** Game rounds must be randomized without mutating the master deck or dropping questions.
* **Acceptance Criteria:**
  * Write the pure JS shuffle function in `server/core/shuffle.js`.
  * Write `server/tests/engine.test.js`.
  * The test must assert that array length remains identical and no elements are lost.

**Issue #7: Initialize Express and Socket.io LAN Boilerplate**
* **Context:** LocalFlux must bypass the WAN. The server needs to listen on the local network.
* **Acceptance Criteria:**
  * Configure Express/Socket.io to bind to `0.0.0.0` instead of just `localhost`.
  * Add a console log on boot that prints the Host's IPv4 address so players know exactly where to connect.

###  Frontend Shell

**Issue #8: Scaffold Mobile Player "Squash" UI**
* **Context:** Mobile keyboards destroy standard CSS layouts. The player view must be resilient.
* **Acceptance Criteria:**
  * Build the React component using `100dvh` (Dynamic Viewport Height) instead of `100vh`.
  * Ensure the text input field remains visible and the submit button does not get pushed off-screen when the iOS/Android keyboard opens.