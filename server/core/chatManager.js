/*
 * chatManager.js
 *
 * Server-side Chat Manager for LocalFlux
 * - FREE: free text with rate-limiter + profanity blocking (auto-mute after warnings)
 * - RESTRICTED: pre-canned message IDs only
 * - OFF: completely ignore chat events
 *
 * Designed to be transport-agnostic (accepts socket and io but emits using io)
 */

'use strict';

const leoProfanity = require('leo-profanity');
const { z } = require('zod');

const DEFAULT_ALLOWED = [
  { id: 'shout_yes', text: 'Nice one! 🎉' },
  { id: 'clap', text: '👏 Great!' },
  { id: 'laugh', text: 'Haha! 😄' },
  { id: 'thumbs_up', text: '👍 Good call' },
  { id: 'oops', text: 'Oops! 😅' },
  { id: 'wow', text: 'Wow! 😲' },
  { id: 'ready', text: "I'm ready ✅" },
  { id: 'cheer', text: "Let's go! 🚀" },
];

class ChatManager {
  constructor(io, opts = {}) {
    this.io = io;
    this.mode = opts.mode || 'FREE'; // FREE | RESTRICTED | OFF
    this.allowed = opts.allowedMessages || DEFAULT_ALLOWED;
    this.rateMap = new Map(); // socketId -> { tokens, last }
    this.warns = new Map();

    this.MAX_WARN = opts.maxWarnings || 3;
    this.TOKEN_REFILL_MS = opts.tokenRefillMs || 2000; // refill interval
    this.TOKEN_CAP = opts.tokenCap || 1;

    this.GC_INTERVAL_MS = 60_000;
    this.STALE_MS = 10 * 60_000; // 10 minutes

    this.freeSchema = z.object({ roomPin: z.string(), text: z.string().min(1).max(300) });
    this.preSchema = z.object({ roomPin: z.string(), id: z.string() });

    // load profanity dictionary
    leoProfanity.loadDictionary();

    this.gcHandle = setInterval(() => this.gc(), this.GC_INTERVAL_MS);
  }

  setMode(m) {
    if (!['FREE', 'RESTRICTED', 'OFF'].includes(m)) throw new Error('invalid mode');
    this.mode = m;
    this.io.emit('chat:mode', { mode: this.mode, allowed: this.allowed });
  }

  allowSend(socketId) {
    const now = Date.now();
    let b = this.rateMap.get(socketId);
    if (!b) {
      b = { tokens: this.TOKEN_CAP, last: now };
      this.rateMap.set(socketId, b);
    }
    const elapsed = now - b.last;
    const refill = Math.floor(elapsed / this.TOKEN_REFILL_MS);
    if (refill > 0) {
      b.tokens = Math.min(this.TOKEN_CAP, b.tokens + refill);
      b.last = now;
    }
    if (b.tokens > 0) {
      b.tokens -= 1;
      return true;
    }
    return false;
  }

  sanitizeText(text) {
    if (leoProfanity.check(text)) return null; // block entirely
    return leoProfanity.clean(text);
  }

  handleFreeMessage(socket, payload, ack) {
    const valid = this.freeSchema.safeParse(payload);
    if (!valid.success) return ack?.({ ok: false, reason: 'invalid_payload' });
    if (!this.allowSend(socket.id)) return ack?.({ ok: false, reason: 'rate_limited' });
    const clean = this.sanitizeText(valid.data.text);
    if (!clean) {
      const w = (this.warns.get(socket.id) || 0) + 1;
      this.warns.set(socket.id, w);
      if (w >= this.MAX_WARN) {
        // notify host for moderation; we don't disconnect forcibly
        this.io.to(socket.id).emit('chat:muted', { reason: 'profanity' });
      }
      return ack?.({ ok: false, reason: 'profanity' });
    }
    const msg = { from: socket.id, name: socket.playerName || 'Player', text: clean, ts: Date.now() };
    this.io.to(valid.data.roomPin).emit('chat:message', msg);
    ack?.({ ok: true });
  }

  handlePreCanned(socket, payload, ack) {
    const valid = this.preSchema.safeParse(payload);
    if (!valid.success) return ack?.({ ok: false, reason: 'invalid' });
    if (this.mode !== 'RESTRICTED') return ack?.({ ok: false, reason: 'wrong_mode' });
    const allowed = this.allowed.find((a) => a.id === valid.data.id);
    if (!allowed) return ack?.({ ok: false, reason: 'not_allowed' });
    const msg = { from: socket.id, name: socket.playerName || 'Player', text: allowed.text, cannedId: allowed.id, ts: Date.now() };
    this.io.to(valid.data.roomPin).emit('chat:message', msg);
    ack?.({ ok: true });
  }

  handleEvent(socket, event, payload, ack) {
    if (this.mode === 'OFF') return ack?.({ ok: false, reason: 'chat_off' });
    if (event === 'chat:free') return this.handleFreeMessage(socket, payload, ack);
    if (event === 'chat:pre') return this.handlePreCanned(socket, payload, ack);
    return ack?.({ ok: false, reason: 'unknown_event' });
  }

  onDisconnect(socketId) {
    this.rateMap.delete(socketId);
    this.warns.delete(socketId);
  }

  gc() {
    const now = Date.now();
    for (const [id, b] of this.rateMap) {
      if (now - b.last > this.STALE_MS) this.rateMap.delete(id);
    }
    for (const [id, w] of this.warns) {
      // clear warnings for idle sockets
      const last = this.rateMap.get(id)?.last || 0;
      if (now - last > this.STALE_MS) this.warns.delete(id);
    }
  }

  stop() {
    clearInterval(this.gcHandle);
  }
}

module.exports = { ChatManager };
