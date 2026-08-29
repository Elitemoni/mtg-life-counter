export type PlayerIndex = 0 | 1;

export type GameHistoryEntry = {
  id: string;
  playerIndex: PlayerIndex;
  before: number;
  after: number;
  delta: number;
  lifeTotals: [number, number];
};

export type PlayerState = {
  life: number;
  startingLife: number;
  pendingDelta: number;
  pendingFrom: number | null;
};

export type ActiveGame = {
  players: [PlayerState, PlayerState];
  history: GameHistoryEntry[];
};

export type CompletedGame = {
  id: string;
  gameNumber: number;
  startingLife: number;
  finalLife: [number, number];
  changeCount: number;
};

export type MatchState = {
  activeGame: ActiveGame;
  completedGames: CompletedGame[];
};

export type Preferences = {
  startingLife: number;
  playerColors: [string, string];
  haptics: boolean;
  keepAwake: boolean;
};
