export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureTeamId(team = {}) {
  return { ...team, id: team.id || createId() };
}

// Storage versioning point for rounds.
// Current round schema:
// - a, b: main round score for each team
// - bonusA, bonusB: persisted raw bonus totals for display/backward compatibility
// - bonusCountA, bonusCountB: Paso Corrido counts
// - tenCountA, tenCountB: +10 bonus counts
export function migrateRound(r = {}) {
  const bonusA = Number(r.bonusA || 0);
  const bonusB = Number(r.bonusB || 0);
  const hasPasoCountA = r.bonusCountA != null;
  const hasPasoCountB = r.bonusCountB != null;
  const hasTenCountA = r.tenCountA != null;
  const hasTenCountB = r.tenCountB != null;

  return {
    a: Number(r.a || 0),
    b: Number(r.b || 0),
    bonusA,
    bonusB,
    bonusCountA: hasPasoCountA ? Math.max(0, Number(r.bonusCountA) || 0) : 0,
    bonusCountB: hasPasoCountB ? Math.max(0, Number(r.bonusCountB) || 0) : 0,
    tenCountA: hasTenCountA ? Math.max(0, Number(r.tenCountA) || 0) : 0,
    tenCountB: hasTenCountB ? Math.max(0, Number(r.tenCountB) || 0) : 0,
    legacyBonusA: !hasPasoCountA && !hasTenCountA && bonusA > 0 ? bonusA : r.legacyBonusA,
    legacyBonusB: !hasPasoCountB && !hasTenCountB && bonusB > 0 ? bonusB : r.legacyBonusB,
  };
}

export function bonusTotal({ pasoCount = 0, tenCount = 0, pasoValue = 25, bonus10Value = 10 }) {
  return Math.max(0, Number(pasoCount) || 0) * pasoValue
    + Math.max(0, Number(tenCount) || 0) * bonus10Value;
}

export function roundTotals(rounds = []) {
  return rounds.reduce((totals, round) => ({
    totalA: totals.totalA + Number(round.a || 0) + Number(round.bonusA || 0),
    totalB: totals.totalB + Number(round.b || 0) + Number(round.bonusB || 0),
  }), { totalA: 0, totalB: 0 });
}

export function winnerSide({ totalA, totalB, target }) {
  if (totalA >= target && totalA > totalB) return 'a';
  if (totalB >= target && totalB > totalA) return 'b';
  return null;
}

export function shouldIncrementSet({ bestOf, setsA, setsB, winner }) {
  if (bestOf <= 1 || !winner) return false;
  const setsToWin = Math.ceil(bestOf / 2);
  return setsA < setsToWin && setsB < setsToWin;
}

export function incrementSets({ bestOf, setsA, setsB, winner }) {
  if (!shouldIncrementSet({ bestOf, setsA, setsB, winner })) {
    return { setsA, setsB };
  }
  return {
    setsA: winner === 'a' ? setsA + 1 : setsA,
    setsB: winner === 'b' ? setsB + 1 : setsB,
  };
}

export function applyModeChange(state, nextBestOf) {
  const bestOf = Number(nextBestOf) || 1;
  const modeChanged = state.bestOf !== bestOf;
  const resetSets = modeChanged || bestOf === 1;
  return {
    ...state,
    bestOf,
    setsA: resetSets ? 0 : state.setsA,
    setsB: resetSets ? 0 : state.setsB,
    teamA: modeChanged ? ensureTeamId({ ...state.teamA, id: createId() }) : ensureTeamId(state.teamA),
    teamB: modeChanged ? ensureTeamId({ ...state.teamB, id: createId() }) : ensureTeamId(state.teamB),
  };
}

export function saveFingerprint({ rounds, totalA, totalB }) {
  return JSON.stringify({ rounds, totalA, totalB });
}

export function isDuplicateSave(history = [], fingerprint) {
  return !!fingerprint && history[0]?.fingerprint === fingerprint;
}
