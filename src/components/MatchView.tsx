import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActiveGame, CompletedGame } from '../types';

type MatchViewProps = {
  activeGame: ActiveGame;
  completedGames: CompletedGame[];
  onClose: () => void;
  onResetMatch: () => void;
};

export function MatchView({
  activeGame,
  completedGames,
  onClose,
  onResetMatch,
}: MatchViewProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>GAME {completedGames.length + 1} ACTIVE</Text>
          <Text style={styles.title}>Match history</Text>
        </View>
        <Pressable
          accessibilityLabel="Return to life counters"
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <View style={styles.currentGame}>
        <Text style={styles.currentLabel}>CURRENT GAME</Text>
        <View style={styles.currentScores}>
          <View style={styles.currentScore}>
            <Text style={styles.playerLabel}>P1</Text>
            <Text style={styles.currentLife}>{activeGame.players[0].life}</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.currentScore}>
            <Text style={styles.playerLabel}>P2</Text>
            <Text style={styles.currentLife}>{activeGame.players[1].life}</Text>
          </View>
        </View>
        <Text style={styles.changeCount}>{activeGame.history.length} recorded changes</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PREVIOUS GAMES</Text>
        <Text style={styles.sectionCount}>{completedGames.length}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gameListContent}
        showsVerticalScrollIndicator={false}
        style={styles.gameList}
      >
        {completedGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>≋</Text>
            <Text style={styles.emptyTitle}>No finished games yet</Text>
            <Text style={styles.emptyBody}>
              Use the next-game icon in the center bar to archive the current game.
            </Text>
          </View>
        ) : (
          [...completedGames].reverse().map((game) => (
            <View key={game.id} style={styles.gameRow}>
              <View style={styles.gameNumber}>
                <Text style={styles.gameNumberLabel}>GAME</Text>
                <Text style={styles.gameNumberValue}>{game.gameNumber}</Text>
              </View>
              <View style={styles.finalScore}>
                <Text style={styles.finalLabel}>P1</Text>
                <Text style={styles.finalLife}>{game.finalLife[0]}</Text>
              </View>
              <Text style={styles.scoreDash}>—</Text>
              <View style={styles.finalScore}>
                <Text style={styles.finalLabel}>P2</Text>
                <Text style={styles.finalLife}>{game.finalLife[1]}</Text>
              </View>
              <View style={styles.gameMeta}>
                <Text style={styles.gameMetaValue}>{game.changeCount}</Text>
                <Text style={styles.gameMetaLabel}>CHANGES</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        accessibilityHint="Clears every completed game and the current game"
        accessibilityLabel="Reset entire match"
        accessibilityRole="button"
        onPress={onResetMatch}
        style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
      >
        <Text style={styles.resetIcon}>↺</Text>
        <View>
          <Text style={styles.resetLabel}>RESET ENTIRE MATCH</Text>
          <Text style={styles.resetBody}>Clear every game and return both players to starting life</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#101218',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#9B8A5D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  title: {
    color: '#F7F6F2',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252932',
  },
  closeText: {
    color: '#D3D6DC',
    fontSize: 26,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.62,
  },
  currentGame: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#1C2028',
    borderWidth: 1,
    borderColor: '#313640',
  },
  currentLabel: {
    color: '#858C98',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  currentScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  currentScore: {
    flex: 1,
    alignItems: 'center',
  },
  playerLabel: {
    color: '#A8ADB7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  currentLife: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  scoreDivider: {
    width: StyleSheet.hairlineWidth,
    height: 42,
    backgroundColor: '#393E47',
  },
  changeCount: {
    color: '#767D89',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 9,
  },
  sectionTitle: {
    color: '#8C929E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionCount: {
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    marginLeft: 8,
    color: '#D8DADE',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 19,
    textAlign: 'center',
    backgroundColor: '#2A2E37',
  },
  gameList: {
    flex: 1,
  },
  gameListContent: {
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: 18,
    backgroundColor: '#171A21',
    borderWidth: 1,
    borderColor: '#292E37',
  },
  emptyIcon: {
    color: '#8E7A49',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 7,
  },
  emptyTitle: {
    color: '#E7E6E2',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBody: {
    color: '#7F8692',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  gameRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 17,
    backgroundColor: '#1C2028',
    borderWidth: 1,
    borderColor: '#2D323C',
  },
  gameNumber: {
    width: 48,
  },
  gameNumberLabel: {
    color: '#767D89',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gameNumberValue: {
    color: '#D7C27F',
    fontSize: 22,
    fontWeight: '900',
  },
  finalScore: {
    alignItems: 'center',
    paddingHorizontal: 11,
  },
  finalLabel: {
    color: '#747B87',
    fontSize: 8,
    fontWeight: '900',
  },
  finalLife: {
    color: '#F5F4F0',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreDash: {
    color: '#555B66',
    fontSize: 14,
  },
  gameMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gameMetaValue: {
    color: '#D0D3D8',
    fontSize: 15,
    fontWeight: '800',
  },
  gameMetaLabel: {
    color: '#6E7581',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  resetButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#251B1B',
    borderWidth: 1,
    borderColor: '#4A2C29',
  },
  resetButtonPressed: {
    opacity: 0.66,
    transform: [{ scale: 0.99 }],
  },
  resetIcon: {
    color: '#D9AAA2',
    fontSize: 23,
    fontWeight: '700',
  },
  resetLabel: {
    color: '#E2B5AE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resetBody: {
    color: '#8F7370',
    fontSize: 9,
    marginTop: 3,
  },
});
