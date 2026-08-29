import { Preferences } from './types';

export const CHANGE_COMMIT_DELAY_MS = 1300;
export const PREFERENCES_STORAGE_KEY = '@life-ledger/preferences-v1';
export const KEEP_AWAKE_TAG = 'life-ledger-match';

export const DEFAULT_PREFERENCES: Preferences = {
  startingLife: 20,
  playerColors: ['#244F6B', '#8A3F35'],
  haptics: true,
  keepAwake: true,
};

export const COLOR_PALETTE = [
  { name: 'Tide', value: '#244F6B' },
  { name: 'Ember', value: '#8A3F35' },
  { name: 'Forest', value: '#356044' },
  { name: 'Amethyst', value: '#624675' },
  { name: 'Ochre', value: '#80602D' },
  { name: 'Slate', value: '#465362' },
  { name: 'Rose', value: '#7A3E58' },
  { name: 'Onyx', value: '#292D36' },
] as const;
