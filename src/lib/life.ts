import { ActiveGame, PlayerIndex, PlayerState } from '../types';

export function createPlayer(startingLife: number): PlayerState {
  return {
    life: startingLife,
    startingLife,
    pendingDelta: 0,
    pendingFrom: null,
  };
}

export function createActiveGame(startingLife: number): ActiveGame {
  return {
    players: [createPlayer(startingLife), createPlayer(startingLife)],
    history: [],
  };
}

export function applyLifeChange(player: PlayerState, amount: number): PlayerState {
  return {
    ...player,
    life: player.life + amount,
    pendingDelta: player.pendingDelta + amount,
    pendingFrom: player.pendingFrom ?? player.life,
  };
}

export type CommittedChange = {
  before: number;
  after: number;
  delta: number;
};

export function commitPendingChange(player: PlayerState): {
  change: CommittedChange | null;
  player: PlayerState;
} {
  if (player.pendingFrom === null) {
    return { change: null, player };
  }

  const clearedPlayer = {
    ...player,
    pendingDelta: 0,
    pendingFrom: null,
  };

  if (player.pendingDelta === 0) {
    return { change: null, player: clearedPlayer };
  }

  return {
    change: {
      before: player.pendingFrom,
      after: player.life,
      delta: player.pendingDelta,
    },
    player: clearedPlayer,
  };
}

export function replacePlayer(
  players: [PlayerState, PlayerState],
  playerIndex: PlayerIndex,
  player: PlayerState,
): [PlayerState, PlayerState] {
  return playerIndex === 0 ? [player, players[1]] : [players[0], player];
}

export function clampStartingLife(value: number): number {
  return Math.max(1, Math.min(999, Math.round(value)));
}
