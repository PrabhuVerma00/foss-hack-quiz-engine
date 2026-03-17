# Get Started

This guide gets LocalFlux running locally in about 5 minutes.

## Prerequisites

- Node.js 20+ (recommended) or 18+
- npm 9+
- A terminal with two tabs/windows

Check your versions:

```bash
node -v
npm -v
```

## 1) Clone the repository

```bash
git clone https://github.com/Unknownbeliek/localflux.git
cd localflux
```

## 2) Install dependencies

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

## 3) Configure frontend backend URL (optional but recommended)

Create a frontend env file at `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

If you are running in Codespaces, use your forwarded backend URL instead.

## 4) Start the backend

From `server/`:

```bash
npm run dev
```

Expected result:

- Server starts on port 3000
- Decks are loaded from `data/decks/`

## 5) Start the frontend

In a second terminal, from `client/`:

```bash
npm run dev
```

Open the printed Vite URL in your browser.

## 6) Verify end-to-end flow

- Open Home screen
- Click Host and create a room
- Join from another tab/device with room PIN
- Start game and answer at least one question

## 7) Run tests (server)

From repository root:

```bash
npm run test --prefix server
```

Expected result: all test suites pass.

## Common issues

### Frontend stuck at connecting

- Confirm backend is running on port 3000
- Verify `VITE_BACKEND_URL` points to the backend
- Restart frontend dev server after env changes

### Address already in use (EADDRINUSE)

A previous server process may still be running.

```bash
# Linux/macOS
lsof -i :3000
# Then stop the process by PID
kill <PID>
```

### Cannot install dependencies due to peer dependency resolution

If npm fails with `ERESOLVE`, retry:

```bash
npm install --legacy-peer-deps
```

Use this only when needed.

## Next steps

- Learn architecture: [Architecture](/guide/architecture)
- Understand deck format: [Deck Schema](/guide/deck-schema)
- Validate quality gates: [Testing](/guide/testing)
