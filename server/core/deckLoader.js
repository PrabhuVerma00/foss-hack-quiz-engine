/**
 * deckLoader.js
 *
 * Loads a quiz deck from disk and exposes the question list.
 * Keeps all file-system concerns isolated from game logic.
 */

'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Load a deck JSON file and return its questions array.
 *
 * @param {string} deckPath - Absolute path to the deck JSON file.
 * @returns {{ questions: object[] }} Parsed deck with a `questions` array.
 * @throws {Error} If the file cannot be read or is missing the `questions` key.
 */
function loadDeck(deckPath) {
  if (!fs.existsSync(deckPath)) {
    throw new Error(`Deck not found: ${deckPath}`);
  }

  const raw = fs.readFileSync(deckPath, 'utf-8');
  let deck;
  try {
    deck = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in deck at ${deckPath}: ${err.message}`);
  }

  if (!Array.isArray(deck.questions)) {
    throw new Error(`Deck at "${deckPath}" is missing a "questions" array.`);
  }

  return deck;
}

/**
 * Remove answer-critical fields before broadcasting a question to players.
 * Uses an allowlist of safe fields instead of blocklist for better security.
 * Only sends: q_id, type, prompt, options, time_limit_ms, image_url, video_url.
 *
 * @param {object} question - A raw question object from the deck.
 * @returns {object} A safe copy with only whitelisted fields.
 */
function sanitizeQuestion(question) {
  const SAFE_FIELDS = ['q_id', 'type', 'prompt', 'options', 'time_limit_ms', 'image_url', 'video_url'];
  const safe = {};
  SAFE_FIELDS.forEach(field => {
    if (field in question) safe[field] = question[field];
  });
  return safe;
}

const DEFAULT_DECK_PATH = path.join(__dirname, '..', '..', 'data', 'decks', 'movie.json');

module.exports = { loadDeck, sanitizeQuestion, DEFAULT_DECK_PATH };
