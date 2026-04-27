import { test, expect } from '@playwright/test';
import {
  applyModeChange,
  bonusTotal,
  createId,
  incrementSets,
  isDuplicateSave,
  migrateRound,
  roundTotals,
  saveFingerprint,
} from '../src/scoring.js';

test.describe('scoring domain helpers', () => {
  test('round totals include paso and +10 bonus totals', () => {
    const rounds = [
      { a: 30, b: 0, bonusA: bonusTotal({ pasoCount: 1, tenCount: 1, pasoValue: 25, bonus10Value: 10 }), bonusB: 0 },
      { a: 0, b: 40, bonusA: 0, bonusB: bonusTotal({ pasoCount: 2, tenCount: 0, pasoValue: 25, bonus10Value: 10 }) },
    ];

    expect(roundTotals(rounds)).toEqual({ totalA: 65, totalB: 90 });
  });

  test('set increment in best-of-3 stops at clinch', () => {
    expect(incrementSets({ bestOf: 3, setsA: 0, setsB: 0, winner: 'a' })).toEqual({ setsA: 1, setsB: 0 });
    expect(incrementSets({ bestOf: 3, setsA: 1, setsB: 0, winner: 'a' })).toEqual({ setsA: 2, setsB: 0 });
    expect(incrementSets({ bestOf: 3, setsA: 2, setsB: 0, winner: 'a' })).toEqual({ setsA: 2, setsB: 0 });
    expect(incrementSets({ bestOf: 1, setsA: 0, setsB: 0, winner: 'a' })).toEqual({ setsA: 0, setsB: 0 });
  });

  test('mode change semantics keep same mode and reset different modes', () => {
    const state = {
      bestOf: 3,
      setsA: 1,
      setsB: 0,
      teamA: { id: createId(), name: 'Nosotros' },
      teamB: { id: createId(), name: 'Ellos' },
    };

    const same = applyModeChange(state, 3);
    expect(same.setsA).toBe(1);
    expect(same.setsB).toBe(0);
    expect(same.teamA.id).toBe(state.teamA.id);

    const different = applyModeChange(state, 5);
    expect(different.setsA).toBe(0);
    expect(different.setsB).toBe(0);
    expect(different.teamA.id).not.toBe(state.teamA.id);

    const single = applyModeChange(state, 1);
    expect(single.setsA).toBe(0);
    expect(single.setsB).toBe(0);
  });

  test('duplicate save fingerprint guard only checks the latest history entry', () => {
    const fingerprint = saveFingerprint({ rounds: [{ a: 200, b: 0 }], totalA: 200, totalB: 0 });

    expect(isDuplicateSave([{ fingerprint }], fingerprint)).toBe(true);
    expect(isDuplicateSave([{ fingerprint: 'other' }, { fingerprint }], fingerprint)).toBe(false);
  });

  test('migrateRound defaults missing +10 counts while preserving raw legacy bonus totals', () => {
    const migrated = migrateRound({ a: 20, b: 0, bonusA: 35 });

    expect(migrated).toMatchObject({
      a: 20,
      b: 0,
      bonusA: 35,
      bonusB: 0,
      bonusCountA: 0,
      bonusCountB: 0,
      tenCountA: 0,
      tenCountB: 0,
      legacyBonusA: 35,
    });
  });
});
