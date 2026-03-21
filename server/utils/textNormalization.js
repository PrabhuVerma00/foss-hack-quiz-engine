'use strict';

function normalizeGuessText(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompact(input) {
  return normalizeGuessText(input).replace(/\s+/g, '');
}

function makeAcronym(input) {
  const words = normalizeGuessText(input).split(' ').filter(Boolean);
  if (words.length < 2) return '';
  return words.map((word) => word[0]).join('');
}

module.exports = {
  normalizeGuessText,
  normalizeCompact,
  makeAcronym,
};
