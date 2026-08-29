import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchView } from './src/components/MatchView';
import { PlayerPanel } from './src/components/PlayerPanel';
import { SettingsModal } from './src/components/SettingsModal';
import {
  CHANGE_COMMIT_DELAY_MS,
  DEFAULT_PREFERENCES,
  KEEP_AWAKE_TAG,
  PREFERENCES_STORAGE_KEY,
} from './src/constants';
import {
  applyLifeChange,
  clampStartingLife,
  commitPendingChange,
  createActiveGame,
  replacePlayer,
} from './src/lib/life';
import { ActiveGame, MatchState, PlayerIndex, Preferences } from './src/types';

type TogglePreference = 'haptics' | 'keepAwake';
type PlayerTimer = ReturnType<typeof setTimeout> | undefined;

function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PREFERENCES;
  }

  const stored = value as Partial<Preferences>;
  const colors: [string, string] = [...DEFAULT_PREFERENCES.playerColors];

  if (Array.isArray(stored.playerColors)) {
    if (typeof stored.playerColors[0] === 'string') colors[0] = stored.playerColors[0];
    if (typeof stored.playerColors[1] === 'string') colors[1] = stored.playerColors[1];
  }

  return {
    startingLife:
      typeof stored.startingLife === 'number'
        ? clampStartingLife(stored.startingLife)
        : DEFAULT_PREFERENCES.startingLife,
    playerColors: colors,
    haptics: typeof stored.haptics === 'boolean' ? stored.haptics : DEFAULT_PREFERENCES.haptics,
    keepAwake:
      typeof stored.keepAwake === 'boolean' ? stored.keepAwake : DEFAULT_PREFERENCES.keepAwake,
  };
}

function commitPlayer(activeGame: ActiveGame, playerIndex: PlayerIndex): ActiveGame {
  const committed = commitPendingChange(activeGame.players[playerIndex]);
  const players = replacePlayer(activeGame.players, playerIndex, committed.player);

  if (!committed.change) {
    return players === activeGame.players ? activeGame : { ...activeGame, players };
  }

  return {
    players,
    history: [
      ...activeGame.history,
      {
        id: `change-${activeGame.history.length + 1}`,
        playerIndex,
        before: committed.change.before,
        after: committed.change.after,
        delta: committed.change.delta,
        lifeTotals: [players[0].life, players[1].life],
      },
    ],
  };
}

function commitEveryPlayer(activeGame: ActiveGame): ActiveGame {
  return commitPlayer(commitPlayer(activeGame, 0), 1);
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [match, setMatch] = useState<MatchState>(() => ({
    activeGame: createActiveGame(DEFAULT_PREFERENCES.startingLife),
    completedGames: [],
  }));
  const [hydrated, setHydrated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState<[boolean, boolean]>([false, false]);
  const [centerExpanded, setCenterExpanded] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [matchViewVisible, setMatchViewVisible] = useState(false);
  const centerProgress = useRef(new Animated.Value(0)).current;
  const commitTimers = useRef<[PlayerTimer, PlayerTimer]>([undefined, undefined]);

  useEffect(() => {
    let mounted = true;

    async function restorePreferences() {
      try {
        const saved = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
        const nextPreferences = normalizePreferences(saved ? JSON.parse(saved) : null);
        if (!mounted) return;

        setPreferences(nextPreferences);
        setMatch({
          activeGame: createActiveGame(nextPreferences.startingLife),
          completedGames: [],
        });
      } catch {
        // A corrupt or unavailable preference record should never block match play.
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    void restorePreferences();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences)).catch(
      () => undefined,
    );
  }, [hydrated, preferences]);

  useEffect(() => {
    if (!hydrated) return;

    if (preferences.keepAwake) {
      void KeepAwake.activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    } else {
      void KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    }

    return () => {
      if (preferences.keepAwake) {
        void KeepAwake.deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
      }
    };
  }, [hydrated, preferences.keepAwake]);

  useEffect(
    () => () => {
      commitTimers.current.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    },
    [],
  );

  function feedback(kind: 'tap' | 'confirm' = 'tap') {
    if (!preferences.haptics) return;

    if (Platform.OS === 'android') {
      const androidKind =
        kind === 'confirm' ? Haptics.AndroidHaptics.Confirm : Haptics.AndroidHaptics.Virtual_Key;
      void Haptics.performAndroidHapticsAsync(androidKind).catch(() => undefined);
      return;
    }

    const style =
      kind === 'confirm' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
    void Haptics.impactAsync(style).catch(() => undefined);
  }

  function animateCenter(expanded: boolean) {
    setCenterExpanded(expanded);
    Animated.timing(centerProgress, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }

  function resetCenterControl() {
    centerProgress.stopAnimation();
    centerProgress.setValue(0);
    setCenterExpanded(false);
  }

  function clearCommitTimers() {
    commitTimers.current.forEach((timer, index) => {
      if (timer) clearTimeout(timer);
      commitTimers.current[index as PlayerIndex] = undefined;
    });
  }

  function scheduleCommit(playerIndex: PlayerIndex) {
    const activeTimer = commitTimers.current[playerIndex];
    if (activeTimer) clearTimeout(activeTimer);

    commitTimers.current[playerIndex] = setTimeout(() => {
      setMatch((current) => ({
        ...current,
        activeGame: commitPlayer(current.activeGame, playerIndex),
      }));
      commitTimers.current[playerIndex] = undefined;
    }, CHANGE_COMMIT_DELAY_MS);
  }

  function adjustLife(playerIndex: PlayerIndex, amount: number) {
    setMatch((current) => {
      const changedPlayer = applyLifeChange(current.activeGame.players[playerIndex], amount);
      return {
        ...current,
        activeGame: {
          ...current.activeGame,
          players: replacePlayer(current.activeGame.players, playerIndex, changedPlayer),
        },
      };
    });
    scheduleCommit(playerIndex);
    feedback('tap');
  }

  function startNextGame() {
    clearCommitTimers();
    setMatch((current) => {
      const finishedGame = commitEveryPlayer(current.activeGame);
      const gameNumber = current.completedGames.length + 1;

      return {
        activeGame: createActiveGame(preferences.startingLife),
        completedGames: [
          ...current.completedGames,
          {
            id: `game-${gameNumber}`,
            gameNumber,
            startingLife: finishedGame.players[0].startingLife,
            finalLife: [finishedGame.players[0].life, finishedGame.players[1].life],
            changeCount: finishedGame.history.length,
          },
        ],
      };
    });
    setHistoryOpen([false, false]);
    animateCenter(false);
    feedback('confirm');
  }

  function resetEntireMatch() {
    clearCommitTimers();
    setMatch({
      activeGame: createActiveGame(preferences.startingLife),
      completedGames: [],
    });
    setHistoryOpen([false, false]);
    setMatchViewVisible(false);
    resetCenterControl();
    feedback('confirm');
  }

  function toggleHistory(playerIndex: PlayerIndex) {
    setHistoryOpen((current) => {
      const next: [boolean, boolean] = [...current];
      next[playerIndex] = !next[playerIndex];
      return next;
    });
    feedback('tap');
  }

  function chooseColor(playerIndex: PlayerIndex, color: string) {
    setPreferences((current) => {
      const playerColors: [string, string] = [...current.playerColors];
      playerColors[playerIndex] = color;
      return { ...current, playerColors };
    });
    feedback('tap');
  }

  function togglePreference(key: TogglePreference) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  function setStartingLife(value: number) {
    setPreferences((current) => ({ ...current, startingLife: clampStartingLife(value) }));
    feedback('tap');
  }

  function openSettings() {
    animateCenter(false);
    setSettingsVisible(true);
    feedback('tap');
  }

  function openMatchView() {
    resetCenterControl();
    setHistoryOpen([false, false]);
    setMatchViewVisible(true);
    feedback('tap');
  }

  function closeMatchView() {
    resetCenterControl();
    setMatchViewVisible(false);
  }

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#D5BD78" />
      </View>
    );
  }

  const centerHeight = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 56],
  });
  const centerGoldRingSize = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [38, 56],
  });
  const centerGoldRingInset = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [9, 0],
  });
  const centerGoldRingRadius = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [19, 28],
  });
  const centerActionsOpacity = centerProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const leftActionsTranslate = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const rightActionsTranslate = centerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  return (
    <View
      style={[
        styles.safeFrame,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: Math.max(insets.top, 8),
        },
      ]}
    >
      {matchViewVisible ? (
        <MatchView
          activeGame={match.activeGame}
          completedGames={match.completedGames}
          onClose={closeMatchView}
          onResetMatch={resetEntireMatch}
        />
      ) : (
        <View style={styles.app}>
          <PlayerPanel
            centerRailProgress={centerProgress}
            color={preferences.playerColors[0]}
            flipped
            gameHistory={match.activeGame.history}
            historyOpen={historyOpen[0]}
            onAdjust={adjustLife}
            onChooseColor={chooseColor}
            onToggleHistory={toggleHistory}
            players={match.activeGame.players}
            playerIndex={0}
          />

          <Animated.View style={[styles.centerRail, { height: centerHeight }]}>
            <View pointerEvents="none" style={styles.centerLine} />

            <Animated.View
              accessibilityElementsHidden={!centerExpanded}
              importantForAccessibility={centerExpanded ? 'auto' : 'no-hide-descendants'}
              pointerEvents={centerExpanded ? 'box-none' : 'none'}
              style={[
                styles.leftActions,
                {
                  opacity: centerActionsOpacity,
                  transform: [{ translateX: leftActionsTranslate }],
                },
              ]}
            >
              <Pressable
                accessibilityHint="Press and hold to archive this game and reset both life totals"
                accessibilityLabel="Finish game and start next game"
                accessibilityRole="button"
                delayLongPress={650}
                onLongPress={startNextGame}
                style={({ pressed }) => [
                  styles.iconAction,
                  styles.newGameAction,
                  pressed && styles.iconActionPressed,
                ]}
              >
                <MaterialCommunityIcons color="#D9C27F" name="sync" size={25} />
              </Pressable>
              <Pressable
                accessibilityLabel="Open match history"
                accessibilityRole="button"
                onPress={openMatchView}
                style={({ pressed }) => [
                  styles.iconAction,
                  styles.matchViewAction,
                  pressed && styles.iconActionPressed,
                ]}
              >
                <Text style={styles.matchIcon}>≋</Text>
                {match.completedGames.length > 0 ? (
                  <View style={styles.matchCount}>
                    <Text style={styles.matchCountText}>{match.completedGames.length}</Text>
                  </View>
                ) : null}
              </Pressable>
            </Animated.View>

            <Animated.View
              accessibilityElementsHidden={!centerExpanded}
              importantForAccessibility={centerExpanded ? 'auto' : 'no-hide-descendants'}
              pointerEvents={centerExpanded ? 'auto' : 'none'}
              style={[
                styles.rightActions,
                {
                  opacity: centerActionsOpacity,
                  transform: [{ translateX: rightActionsTranslate }],
                },
              ]}
            >
              <Pressable
                accessibilityLabel="Open settings"
                accessibilityRole="button"
                onPress={openSettings}
                style={({ pressed }) => [styles.iconAction, pressed && styles.iconActionPressed]}
              >
                <MaterialCommunityIcons color="#D4D7DC" name="cog-outline" size={23} />
              </Pressable>
            </Animated.View>

            <View style={styles.centerButtonWrap}>
              <Pressable
                accessibilityHint="Shows next-game, match-history, and settings controls"
                accessibilityLabel={centerExpanded ? 'Close match controls' : 'Open match controls'}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  animateCenter(!centerExpanded);
                  feedback('tap');
                }}
                style={({ pressed }) => [styles.centerButton, pressed && styles.centerButtonPressed]}
              >
                <View pointerEvents="none" style={[styles.centerStaticRing, styles.centerOuterRing]} />
                <View pointerEvents="none" style={[styles.centerStaticRing, styles.centerInnerRing]} />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.centerGoldRing,
                    {
                      borderRadius: centerGoldRingRadius,
                      height: centerGoldRingSize,
                      left: centerGoldRingInset,
                      top: centerGoldRingInset,
                      width: centerGoldRingSize,
                    },
                  ]}
                />
                <View pointerEvents="none" style={styles.centerIconSlot}>
                  <MaterialCommunityIcons
                    color="#D9C27F"
                    name="star-four-points"
                    size={24}
                    style={centerExpanded ? styles.centerStarSelected : undefined}
                  />
                </View>
              </Pressable>
            </View>
          </Animated.View>

          <PlayerPanel
            centerRailProgress={centerProgress}
            color={preferences.playerColors[1]}
            gameHistory={match.activeGame.history}
            historyOpen={historyOpen[1]}
            onAdjust={adjustLife}
            onChooseColor={chooseColor}
            onToggleHistory={toggleHistory}
            players={match.activeGame.players}
            playerIndex={1}
          />
        </View>
      )}

      <SettingsModal
        onChooseColor={chooseColor}
        onDismiss={() => setSettingsVisible(false)}
        onSetStartingLife={setStartingLife}
        onToggle={togglePreference}
        preferences={preferences}
        visible={settingsVisible}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeFrame: {
    flex: 1,
    backgroundColor: '#090B0F',
  },
  app: {
    flex: 1,
    backgroundColor: '#090B0F',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090B0F',
  },
  centerRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0F14',
    overflow: 'visible',
    zIndex: 10,
    elevation: 10,
  },
  centerLine: {
    position: 'absolute',
    left: 30,
    right: 30,
    top: '50%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3A3324',
  },
  centerButtonWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -28,
    marginTop: -28,
    width: 56,
    height: 56,
    zIndex: 3,
    elevation: 3,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0F14',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 10,
  },
  centerButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: '#1A1A18',
  },
  centerStaticRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#3C414B',
  },
  centerOuterRing: {
    left: 0,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  centerInnerRing: {
    left: 9,
    top: 9,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  centerGoldRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#BFA45B',
    zIndex: 2,
  },
  centerIconSlot: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  centerStarSelected: {
    transform: [{ rotate: '45deg' }],
  },
  leftActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -22,
    height: 44,
  },
  newGameAction: {
    position: 'absolute',
    left: 20,
  },
  matchViewAction: {
    position: 'absolute',
    left: '25%',
    marginLeft: -4,
  },
  rightActions: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -22,
    flexDirection: 'row',
    gap: 9,
  },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B1E25',
    borderWidth: 1,
    borderColor: '#333842',
  },
  iconActionPressed: {
    opacity: 0.62,
    transform: [{ scale: 0.94 }],
  },
  matchIcon: {
    color: '#D4D7DC',
    width: 44,
    height: 44,
    fontSize: 23,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 44,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  matchCount: {
    position: 'absolute',
    right: -3,
    top: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8C482',
    borderWidth: 2,
    borderColor: '#0D0F14',
  },
  matchCountText: {
    color: '#242018',
    fontSize: 8,
    fontWeight: '900',
  },
});
