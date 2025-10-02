import type { Session, BigToss, Game, TeamSlot } from '../types/models';

function getCurrentBigToss(session: Session): BigToss | null {
  if (session.bigTosses.length === 0) return null;
  // Use latest scheduled or last in list
  for (let i = session.bigTosses.length - 1; i >= 0; i--) {
    if (session.bigTosses[i].status === 'scheduled') return session.bigTosses[i];
  }
  return session.bigTosses[session.bigTosses.length - 1] ?? null;
}

function gatherAllGames(session: Session): Game[] {
  return session.bigTosses.flatMap(bt => bt.games);
}

function countReservedAndBonusInGames(games: Game[]): Map<string, { reserved: number; bonus: number; appearances: number }> {
  const map = new Map<string, { reserved: number; bonus: number; appearances: number }>();
  games.forEach(g => {
    const all: TeamSlot[] = [...g.teams.teamA, ...g.teams.teamB];
    all.forEach(slot => {
      const rec = map.get(slot.playerId) ?? { reserved: 0, bonus: 0, appearances: 0 };
      rec.appearances += 1;
      if (slot.slotType === 'reserved') rec.reserved += 1;
      else rec.bonus += 1;
      map.set(slot.playerId, rec);
    });
  });
  return map;
}

function computeAssignedRefCounts(games: Game[]): Map<string, number> {
  const map = new Map<string, number>();
  games.forEach(g => {
    if (g.refs.mainId) map.set(g.refs.mainId, (map.get(g.refs.mainId) ?? 0) + 1);
    if (g.refs.assistantId) map.set(g.refs.assistantId, (map.get(g.refs.assistantId) ?? 0) + 1);
  });
  return map;
}

export interface PerPlayerSessionRow {
  playerId: string;
  name: string;
  gamesPlayed: number;
  reservedCount: number;
  bonusCount: number;
  refsMainAssigned: number;
  refsAssistantAssigned: number;
  totalRefsAssigned: number;
  lastPlayedAt: number | null;
  lastRefedAt: number | null;
  benchWait: number;
  consecutiveGamesPlayed: number;
  fairnessIndicator: 'underplayed' | 'balanced' | 'bonus' | 'ref';
}

export function selectPerPlayerSessionStats(session: Session): PerPlayerSessionRow[] {
  const allGames = gatherAllGames(session);
  const perGameCounts = countReservedAndBonusInGames(allGames);
  const refAssignedCounts = computeAssignedRefCounts(allGames);

  // Compute medians for fairness indicators
  const reservedCounts: number[] = session.players.map(p => perGameCounts.get(p.id)?.reserved ?? 0);
  const bonusCounts: number[] = session.players.map(p => perGameCounts.get(p.id)?.bonus ?? 0);
  const refCounts: number[] = session.players.map(p => refAssignedCounts.get(p.id) ?? 0);
  const median = (arr: number[]): number => {
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 === 0 ? (a[mid - 1] + a[mid]) / 2 : a[mid];
  };
  const medianReserved = median(reservedCounts);
  const medianBonus = median(bonusCounts);
  const medianRefs = median(refCounts);

  // Bench wait and consecutive streak: compute on latest scheduled Big Toss only for simplicity
  const currentBT = getCurrentBigToss(session);
  const btGames = currentBT ? currentBT.games : [];
  const lastAppearanceIndex = new Map<string, number | null>();
  const endStreak = new Map<string, number>();
  session.players.forEach(p => { lastAppearanceIndex.set(p.id, null); endStreak.set(p.id, 0); });
  btGames.forEach((g, idx) => {
    const all: TeamSlot[] = [...g.teams.teamA, ...g.teams.teamB];
    const ids = new Set(all.map(s => s.playerId));
    session.players.forEach(p => {
      if (ids.has(p.id)) {
        lastAppearanceIndex.set(p.id, idx);
        const prev = endStreak.get(p.id) ?? 0;
        // Increment streak if also in previous game, else reset to 1
        const wasPrev = idx > 0 && [...btGames[idx - 1].teams.teamA, ...btGames[idx - 1].teams.teamB].some(s => s.playerId === p.id);
        endStreak.set(p.id, wasPrev ? prev + 1 : 1);
      } else {
        // if not in this game and previous streak counted, keep streak if last game included, else reset 0
        if ((endStreak.get(p.id) ?? 0) > 0) {
          // streak continues only while appearing; do nothing
        }
      }
    });
  });

  return session.players.map(p => {
    const gameCounts = perGameCounts.get(p.id) ?? { reserved: 0, bonus: 0, appearances: 0 };
    const refsAssigned = refAssignedCounts.get(p.id) ?? 0;
    const refsMainAssigned = allGames.filter(g => g.refs.mainId === p.id).length;
    const refsAssistantAssigned = allGames.filter(g => g.refs.assistantId === p.id).length;
    const fairnessIndicator: PerPlayerSessionRow['fairnessIndicator'] =
      gameCounts.reserved < medianReserved ? 'underplayed' :
      (gameCounts.bonus > medianBonus ? 'bonus' : (refsAssigned > medianRefs ? 'ref' : 'balanced'));

    const lastIdx = lastAppearanceIndex.get(p.id);
    const benchWait = lastIdx == null ? btGames.length : Math.max(0, (btGames.length - 1) - lastIdx);
    const consecutive = endStreak.get(p.id) ?? 0;

    return {
      playerId: p.id,
      name: p.name,
      gamesPlayed: gameCounts.appearances,
      reservedCount: gameCounts.reserved,
      bonusCount: gameCounts.bonus,
      refsMainAssigned,
      refsAssistantAssigned,
      totalRefsAssigned: refsAssigned,
      lastPlayedAt: p.sessionStats.lastPlayedAt,
      lastRefedAt: p.sessionStats.lastRefedAt,
      benchWait,
      consecutiveGamesPlayed: consecutive,
      fairnessIndicator,
    };
  });
}

export interface PerPlayerBigTossRow {
  playerId: string;
  name: string;
  gamesInBigToss: number;
  hasReserved: boolean;
  bonusInBigToss: number;
  eligibleToRefNow: { eligible: boolean; reason?: string };
}

export function selectPerPlayerBigTossStats(session: Session, bigTossId?: string): PerPlayerBigTossRow[] {
  const bt = bigTossId ? session.bigTosses.find(b => b.id === bigTossId) ?? null : getCurrentBigToss(session);
  const games = bt ? bt.games : [];
  const counts = countReservedAndBonusInGames(games);

  return session.players.map(p => {
    const c = counts.get(p.id) ?? { reserved: 0, bonus: 0, appearances: 0 };
    const inAnyGame = games.some(g => [...g.teams.teamA, ...g.teams.teamB].some(s => s.playerId === p.id));
    const eligible = p.active && p.available && !inAnyGame;
    const reason = eligible ? undefined : (!p.active || !p.available ? 'unavailable' : 'playing');
    return {
      playerId: p.id,
      name: p.name,
      gamesInBigToss: c.appearances,
      hasReserved: c.reserved > 0,
      bonusInBigToss: c.bonus,
      eligibleToRefNow: { eligible, reason },
    };
  });
}

export interface BigTossSummary {
  numGames: number;
  totalBonusSlots: number;
  playersWithoutBonus: string[];
  reservedVsBonusPerPlayer: Array<{ playerId: string; name: string; reserved: number; bonus: number }>;
}

export function selectBigTossSummary(session: Session, bigTossId?: string): BigTossSummary {
  const bt = bigTossId ? session.bigTosses.find(b => b.id === bigTossId) ?? null : getCurrentBigToss(session);
  const games = bt ? bt.games : [];
  const counts = countReservedAndBonusInGames(games);
  let totalBonus = 0;
  const reservedVsBonus: Array<{ playerId: string; name: string; reserved: number; bonus: number }> = [];
  const playersWithoutBonus: string[] = [];
  session.players.forEach(p => {
    const c = counts.get(p.id) ?? { reserved: 0, bonus: 0, appearances: 0 };
    totalBonus += c.bonus;
    reservedVsBonus.push({ playerId: p.id, name: p.name, reserved: c.reserved, bonus: c.bonus });
    if (c.appearances > 0 && c.bonus === 0) playersWithoutBonus.push(p.name);
  });
  return { numGames: games.length, totalBonusSlots: totalBonus, playersWithoutBonus, reservedVsBonusPerPlayer: reservedVsBonus };
}

export interface RefDistributionSummary {
  fullyStaffed: number;
  missingMain: number;
  missingAssistant: number;
  refLoadByPlayer: Array<{ playerId: string; name: string; assigned: number }>;
  zeroRefPlayers: string[];
}

export function selectRefDistribution(session: Session, bigTossId?: string): RefDistributionSummary {
  const bt = bigTossId ? session.bigTosses.find(b => b.id === bigTossId) ?? null : getCurrentBigToss(session);
  const games = bt ? bt.games : [];
  let fully = 0, missMain = 0, missAsst = 0;
  const load = new Map<string, number>();
  games.forEach(g => {
    if (g.refs.mainId && g.refs.assistantId) fully += 1;
    else {
      if (!g.refs.mainId) missMain += 1;
      if (!g.refs.assistantId) missAsst += 1;
    }
    if (g.refs.mainId) load.set(g.refs.mainId, (load.get(g.refs.mainId) ?? 0) + 1);
    if (g.refs.assistantId) load.set(g.refs.assistantId, (load.get(g.refs.assistantId) ?? 0) + 1);
  });
  const refLoadByPlayer = session.players.map(p => ({ playerId: p.id, name: p.name, assigned: load.get(p.id) ?? 0 }));
  const zeroRefPlayers = refLoadByPlayer.filter(r => r.assigned === 0).map(r => r.name);
  return { fullyStaffed: fully, missingMain: missMain, missingAssistant: missAsst, refLoadByPlayer, zeroRefPlayers };
}

export interface PairFrequency {
  pair: [string, string]; // [playerIdA, playerIdB] sorted by name for stability
  count: number;
}

export function selectPairingMetrics(session: Session, bigTossId?: string): { teammatePairs: PairFrequency[] } {
  const bt = bigTossId ? session.bigTosses.find(b => b.id === bigTossId) ?? null : getCurrentBigToss(session);
  const games = bt ? bt.games : [];
  const pairCounts = new Map<string, number>();
  games.forEach(g => {
    const teams = [g.teams.teamA, g.teams.teamB];
    teams.forEach(team => {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          const a = team[i].playerId;
          const b = team[j].playerId;
          const key = a < b ? `${a}|${b}` : `${b}|${a}`;
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
      }
    });
  });
  const teammatePairs: PairFrequency[] = [];
  pairCounts.forEach((count, key) => {
    const [a, b] = key.split('|');
    teammatePairs.push({ pair: [a, b], count });
  });
  // sort descending by count
  teammatePairs.sort((x, y) => y.count - x.count);
  return { teammatePairs };
}
