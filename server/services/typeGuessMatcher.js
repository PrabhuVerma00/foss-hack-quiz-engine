'use strict';

const stringSimilarity = require('string-similarity');
const {
  normalizeGuessText,
  normalizeCompact,
  makeAcronym,
} = require('../utils/textNormalization');

const MIN_FUZZY_LEN = 4;

function normalizeAcceptedAnswers(acceptedAnswers) {
  if (!Array.isArray(acceptedAnswers)) return [];

  const seen = new Set();
  const normalized = [];

  for (const raw of acceptedAnswers) {
    const text = String(raw || '').trim();
    const normalizedText = normalizeGuessText(text);
    if (!normalizedText) continue;
    if (seen.has(normalizedText)) continue;

    seen.add(normalizedText);
    normalized.push({
      raw: text,
      normalized: normalizedText,
      compact: normalizeCompact(text),
      acronym: makeAcronym(text),
    });
  }

  return normalized;
}

function evaluateTypeGuess({ guessText, acceptedAnswers, threshold = 0.85 }) {
  const normalizedGuess = normalizeGuessText(guessText);
  if (!normalizedGuess) {
    return { matched: false, reason: 'empty_guess', score: 0, matchType: null, matchedAnswer: null };
  }

  const normalizedAccepted = normalizeAcceptedAnswers(acceptedAnswers);
  if (normalizedAccepted.length === 0) {
    return { matched: false, reason: 'no_answers', score: 0, matchType: null, matchedAnswer: null };
  }

  const compactGuess = normalizeCompact(guessText);

  for (const candidate of normalizedAccepted) {
    if (candidate.normalized === normalizedGuess || (candidate.compact && candidate.compact === compactGuess)) {
      return {
        matched: true,
        reason: 'exact',
        score: 1,
        matchType: 'exact',
        matchedAnswer: candidate.raw,
      };
    }
    if (candidate.acronym && candidate.acronym === compactGuess) {
      return {
        matched: true,
        reason: 'acronym',
        score: 1,
        matchType: 'acronym',
        matchedAnswer: candidate.raw,
      };
    }
  }

  const guessAcronym = makeAcronym(guessText);
  if (guessAcronym) {
    for (const candidate of normalizedAccepted) {
      if (!candidate.acronym) continue;
      if (candidate.acronym === guessAcronym) {
        return {
          matched: true,
          reason: 'acronym',
          score: 1,
          matchType: 'acronym',
          matchedAnswer: candidate.raw,
        };
      }
    }
  }

  if (normalizedGuess.length < MIN_FUZZY_LEN) {
    return {
      matched: false,
      reason: 'too_short_for_fuzzy',
      score: 0,
      matchType: null,
      matchedAnswer: null,
    };
  }

  let best = { score: 0, candidate: null };
  for (const candidate of normalizedAccepted) {
    const score = stringSimilarity.compareTwoStrings(normalizedGuess, candidate.normalized);
    if (score > best.score) {
      best = { score, candidate };
    }
  }

  if (best.candidate && best.score >= Number(threshold || 0.85)) {
    return {
      matched: true,
      reason: 'fuzzy',
      score: best.score,
      matchType: 'fuzzy',
      matchedAnswer: best.candidate.raw,
    };
  }

  return {
    matched: false,
    reason: 'no_match',
    score: best.score,
    matchType: null,
    matchedAnswer: null,
  };
}

module.exports = {
  evaluateTypeGuess,
};
