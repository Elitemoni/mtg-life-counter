import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_PALETTE } from '../constants';
import { CUSTOM_COLOR_GRID, isLightColor } from '../lib/color';
import { GameHistoryEntry, PlayerIndex, PlayerState } from '../types';

type PlayerPanelProps = {
  centerRailProgress: Animated.Value;
  color: string;
  flipped?: boolean;
  gameHistory: GameHistoryEntry[];
  historyOpen: boolean;
  players: [PlayerState, PlayerState];
  playerIndex: PlayerIndex;
  onAdjust: (playerIndex: PlayerIndex, amount: number) => void;
  onChooseColor: (playerIndex: PlayerIndex, color: string) => void;
  onToggleHistory: (playerIndex: PlayerIndex) => void;
};

export function PlayerPanel({
  centerRailProgress,
  color,
  flipped = false,
  gameHistory,
  historyOpen,
  players,
  playerIndex,
  onAdjust,
  onChooseColor,
  onToggleHistory,
}: PlayerPanelProps) {
  const player = players[playerIndex];
  const historyProgress = useRef(new Animated.Value(historyOpen ? 1 : 0)).current;
  const [panelSize, setPanelSize] = useState({ height: 400, width: 360 });
  const [historyContentMounted, setHistoryContentMounted] = useState(historyOpen);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [customGridOpen, setCustomGridOpen] = useState(false);
  const deltaLabel = player.pendingDelta > 0 ? `+${player.pendingDelta}` : `${player.pendingDelta}`;
  const lightPanel = isLightColor(color);
  const panelInk = lightPanel ? '#17191E' : '#FFFFFF';

  useEffect(() => {
    if (historyOpen) setHistoryContentMounted(true);
    if (historyOpen) {
      setColorsOpen(false);
      setCustomGridOpen(false);
    }

    Animated.timing(historyProgress, {
      toValue: historyOpen ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !historyOpen) setHistoryContentMounted(false);
    });
  }, [historyOpen, historyProgress]);

  const counterOpacity = historyProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });
  const historyOpacity = historyProgress.interpolate({
    inputRange: [0, 0.38, 1],
    outputRange: [0, 0, 1],
  });
  const lifeTranslateX = historyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36 - panelSize.width / 2],
  });
  const lifeTranslateY = historyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36 - panelSize.height / 2],
  });
  const lifeScale = historyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.25],
  });
  const ringBorderWidth = historyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3.3],
  });
  const ringScale = historyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });
  const railCenterOffset = centerRailProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const railHistoryOffset = Animated.multiply(centerRailProgress, historyProgress).interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const stationaryCounterTranslateY = Animated.add(railCenterOffset, railHistoryOffset);
  const anchoredLifeTranslateY = Animated.add(lifeTranslateY, stationaryCounterTranslateY);

  return (
    <View
      onLayout={(event) => {
        const { height, width } = event.nativeEvent.layout;
        setPanelSize({ height, width });
      }}
      style={[styles.panel, { backgroundColor: color }]}
    >
      <View style={[StyleSheet.absoluteFill, flipped && styles.flipped]}>
        <Animated.View
          accessibilityElementsHidden={historyOpen}
          importantForAccessibility={historyOpen ? 'no-hide-descendants' : 'auto'}
          pointerEvents={historyOpen ? 'none' : 'auto'}
          style={[StyleSheet.absoluteFill, styles.counterLayer, { opacity: counterOpacity }]}
        >
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.counterControls,
              { transform: [{ translateY: stationaryCounterTranslateY }] },
            ]}
          >
            <Pressable
              accessibilityHint="Subtracts one life"
              accessibilityLabel={`Player ${playerIndex + 1}, subtract one life`}
              accessibilityRole="button"
              onPress={() => onAdjust(playerIndex, -1)}
              style={styles.lifeButton}
            >
              <Text
                style={[
                  styles.adjustLabel,
                  { color: lightPanel ? 'rgba(23,25,30,0.38)' : 'rgba(255,255,255,0.30)' },
                ]}
              >
                −
              </Text>
            </Pressable>

            <Pressable
              accessibilityHint="Adds one life"
              accessibilityLabel={`Player ${playerIndex + 1}, add one life`}
              accessibilityRole="button"
              onPress={() => onAdjust(playerIndex, 1)}
              style={styles.lifeButton}
            >
              <Text
                style={[
                  styles.adjustLabel,
                  { color: lightPanel ? 'rgba(23,25,30,0.38)' : 'rgba(255,255,255,0.30)' },
                ]}
              >
                +
              </Text>
            </Pressable>
          </Animated.View>

          <Pressable
            accessibilityLabel={`Open Player ${playerIndex + 1} life history`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onToggleHistory(playerIndex)}
            style={({ pressed }) => [styles.historyButton, pressed && styles.controlPressed]}
          >
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="book-open-page-variant-outline"
              size={20}
            />
          </Pressable>

          <View pointerEvents="box-none" style={styles.paletteDock}>
            <Pressable
              accessibilityLabel={`Choose Player ${playerIndex + 1} color`}
              accessibilityRole="button"
              onPress={() =>
                setColorsOpen((current) => {
                  if (current) setCustomGridOpen(false);
                  return !current;
                })
              }
              style={({ pressed }) => [styles.paintButton, pressed && styles.controlPressed]}
            >
              <MaterialCommunityIcons color="#F4F1E8" name="brush" size={23} />
            </Pressable>

            {colorsOpen ? (
              <View style={styles.colorRow}>
                <Pressable
                  accessibilityLabel="Open precision color grid"
                  accessibilityRole="button"
                  onPress={() => setCustomGridOpen((current) => !current)}
                  style={({ pressed }) => [
                    styles.colorSwatch,
                    styles.rainbowSwatch,
                    customGridOpen && styles.colorSwatchSelected,
                    pressed && styles.colorSwatchPressed,
                  ]}
                >
                  <LinearGradient
                    colors={['#FF4D4D', '#FFB84D', '#F3EE55', '#4FD67A', '#48B8F2', '#7257E8', '#D852C8']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <MaterialCommunityIcons color="#FFFFFF" name="eyedropper" size={11} />
                </Pressable>
                {[...COLOR_PALETTE].reverse().map((option) => {
                  const selected = option.value === color;
                  return (
                    <Pressable
                      accessibilityLabel={`${option.name}${selected ? ', selected' : ''}`}
                      accessibilityRole="button"
                      key={option.value}
                      onPress={() => {
                        onChooseColor(playerIndex, option.value);
                        setColorsOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.colorSwatch,
                        { backgroundColor: option.value },
                        selected && styles.colorSwatchSelected,
                        pressed && styles.colorSwatchPressed,
                      ]}
                    >
                      {selected ? <View style={styles.selectedDot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          {colorsOpen && customGridOpen ? (
            <View style={styles.customPicker}>
              <View style={styles.customPickerHeader}>
                <Text style={styles.customPickerTitle}>PRECISION COLOR</Text>
                <View style={[styles.customPreview, { backgroundColor: color }]} />
              </View>
              <View style={styles.customGrid}>
                {CUSTOM_COLOR_GRID.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.customGridRow}>
                    {row.map((gridColor) => {
                      const selected = gridColor === color.toUpperCase();
                      return (
                        <Pressable
                          accessibilityLabel={`Choose custom color ${gridColor}${
                            selected ? ', selected' : ''
                          }`}
                          accessibilityRole="button"
                          key={gridColor}
                          onPress={() => onChooseColor(playerIndex, gridColor)}
                          style={({ pressed }) => [
                            styles.customColorCell,
                            { backgroundColor: gridColor },
                            selected && styles.customColorCellSelected,
                            pressed && styles.customColorCellPressed,
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>

        {historyContentMounted ? (
          <Animated.View
            pointerEvents={historyOpen ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, { opacity: historyOpacity }]}
          >
            <Pressable
              accessibilityLabel={`Close Player ${playerIndex + 1} life history`}
              accessibilityRole="button"
              onPress={() => onToggleHistory(playerIndex)}
              style={({ pressed }) => [styles.counterButton, pressed && styles.controlPressed]}
            >
              <MaterialCommunityIcons color="#FFFFFF" name="heart-outline" size={20} />
            </Pressable>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableHeaderText, styles.numberColumn]}>#</Text>
                <Text style={[styles.tableHeaderText, styles.lifeColumn]}>P1</Text>
                <Text style={[styles.tableHeaderText, styles.lifeColumn]}>P2</Text>
                <Text style={[styles.tableHeaderText, styles.changeColumn]}>CHANGE</Text>
              </View>
              <ScrollView
                contentContainerStyle={styles.tableContent}
                showsVerticalScrollIndicator={false}
                style={styles.tableScroll}
              >
                <View style={styles.tableRow}>
                  <Text style={[styles.tableIndex, styles.numberColumn]}>0</Text>
                  <Text style={[styles.tableLife, styles.lifeColumn]}>{players[0].startingLife}</Text>
                  <Text style={[styles.tableLife, styles.lifeColumn]}>{players[1].startingLife}</Text>
                  <Text style={[styles.tableStart, styles.changeColumn]}>START</Text>
                </View>
                {gameHistory.map((entry, index) => (
                  <View key={entry.id} style={styles.tableRow}>
                    <Text style={[styles.tableIndex, styles.numberColumn]}>{index + 1}</Text>
                    <Text style={[styles.tableLife, styles.lifeColumn]}>{entry.lifeTotals[0]}</Text>
                    <Text style={[styles.tableLife, styles.lifeColumn]}>{entry.lifeTotals[1]}</Text>
                    <Text
                      style={[
                        styles.tableChange,
                        styles.changeColumn,
                        entry.delta > 0 ? styles.gain : styles.loss,
                      ]}
                    >
                      P{entry.playerIndex + 1} {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.lifeOverlay,
            {
              transform: [
                { translateX: lifeTranslateX },
                { translateY: anchoredLifeTranslateY },
                { scale: lifeScale },
              ],
            },
          ]}
        >
          <View style={styles.lifeGroup}>
            <Animated.View
              style={[
                styles.lifeRing,
                {
                  borderColor: lightPanel ? 'rgba(23,25,30,0.13)' : 'rgba(255,255,255,0.10)',
                  borderWidth: ringBorderWidth,
                  transform: [{ scale: ringScale }],
                },
              ]}
            />
            <Text
              accessibilityLabel={`Player ${playerIndex + 1} life total, ${player.life}`}
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                styles.lifeTotal,
                {
                  color: panelInk,
                  textShadowColor: lightPanel ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.18)',
                },
              ]}
            >
              {player.life}
            </Text>
            {player.pendingFrom !== null && player.pendingDelta !== 0 ? (
              <View
                style={[
                  styles.deltaBadge,
                  player.pendingDelta > 0 ? styles.deltaPositive : styles.deltaNegative,
                ]}
              >
                <Text style={styles.deltaText}>{deltaLabel}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    overflow: 'hidden',
  },
  flipped: {
    transform: [{ rotate: '180deg' }],
  },
  counterControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 150,
    marginTop: -75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterLayer: {
    zIndex: 6,
  },
  lifeButton: {
    width: 94,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustLabel: {
    fontSize: 62,
    fontWeight: '300',
    includeFontPadding: false,
    lineHeight: 66,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  historyButton: {
    position: 'absolute',
    right: 18,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,9,12,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  controlPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
  paletteDock: {
    position: 'absolute',
    right: 18,
    bottom: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  paintButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,9,12,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  colorRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(8,10,14,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  colorSwatch: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    overflow: 'hidden',
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  colorSwatchPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.9 }],
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  rainbowSwatch: {
    backgroundColor: '#3B3D45',
  },
  customPicker: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 58,
    padding: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(8,10,14,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 8,
    elevation: 8,
  },
  customPickerHeader: {
    height: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  customPickerTitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  customPreview: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  customGrid: {
    gap: 3,
  },
  customGridRow: {
    height: 18,
    flexDirection: 'row',
    gap: 3,
  },
  customColorCell: {
    flex: 1,
    borderRadius: 3,
  },
  customColorCellSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  customColorCellPressed: {
    opacity: 0.55,
  },
  counterButton: {
    position: 'absolute',
    right: 18,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,9,12,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 7,
  },
  lifeOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  lifeGroup: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifeRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
  },
  lifeTotal: {
    fontSize: 104,
    fontWeight: '700',
    letterSpacing: -6,
    lineHeight: 112,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  deltaBadge: {
    position: 'absolute',
    top: 60,
    minWidth: 50,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(8,10,14,0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  deltaPositive: {
    right: 8,
  },
  deltaNegative: {
    left: 8,
  },
  deltaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  table: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 66,
    bottom: 12,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: 'rgba(8,10,14,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  tableHeader: {
    backgroundColor: 'rgba(8,10,14,0.28)',
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  tableScroll: {
    flex: 1,
  },
  tableContent: {
    paddingBottom: 4,
  },
  tableRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.11)',
  },
  numberColumn: {
    width: '14%',
  },
  lifeColumn: {
    width: '21%',
  },
  changeColumn: {
    width: '44%',
    textAlign: 'right',
  },
  tableHeaderText: {
    color: 'rgba(255,255,255,0.57)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  tableIndex: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tableLife: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tableChange: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tableStart: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gain: {
    color: '#BFE7C8',
  },
  loss: {
    color: '#F2C1BA',
  },
});
