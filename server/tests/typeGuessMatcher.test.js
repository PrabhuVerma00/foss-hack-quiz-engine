'use strict';

const { evaluateTypeGuess } = require('../services/typeGuessMatcher');

describe('typeGuessMatcher', () => {
  test('matches exact answer', () => {
    const result = evaluateTypeGuess({
      guessText: 'Interstellar',
      acceptedAnswers: ['Interstellar'],
      threshold: 0.85,
    });

    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('exact');
  });

  test('matches acronym answer', () => {
    const result = evaluateTypeGuess({
      guessText: 'LOTR',
      acceptedAnswers: ['Lord of the Rings'],
      threshold: 0.85,
    });

    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('acronym');
  });

  test('rejects non-matching short input', () => {
    const result = evaluateTypeGuess({
      guessText: 'no',
      acceptedAnswers: ['Interstellar'],
      threshold: 0.85,
    });

    expect(result.matched).toBe(false);
  });
});
