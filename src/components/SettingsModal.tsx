import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { COLOR_PALETTE } from '../constants';
import { PlayerIndex, Preferences } from '../types';
import { OverlayCard } from './OverlayCard';

type TogglePreference = 'haptics' | 'keepAwake';

type SettingsModalProps = {
  onChooseColor: (playerIndex: PlayerIndex, color: string) => void;
  onDismiss: () => void;
  onSetStartingLife: (value: number) => void;
  onToggle: (key: TogglePreference) => void;
  preferences: Preferences;
  visible: boolean;
};

type SettingRowProps = {
  body: string;
  label: string;
  onValueChange: () => void;
  value: boolean;
};

function SettingRow({ body, label, onValueChange, value }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingBody}>{body}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor="#F4F1E8"
        trackColor={{ false: '#343944', true: '#8B7138' }}
        value={value}
      />
    </View>
  );
}

export function SettingsModal({
  onChooseColor,
  onDismiss,
  onSetStartingLife,
  onToggle,
  preferences,
  visible,
}: SettingsModalProps) {
  return (
    <OverlayCard onDismiss={onDismiss} visible={visible}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MATCH PREFERENCES</Text>
          <Text style={styles.title}>Settings</Text>
        </View>
        <Pressable
          accessibilityLabel="Close settings"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onDismiss}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Text style={styles.sectionLabel}>STARTING LIFE</Text>
        <View style={styles.lifeControls}>
          <Pressable
            accessibilityLabel="Decrease starting life"
            accessibilityRole="button"
            onPress={() => onSetStartingLife(preferences.startingLife - 1)}
            style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <View style={styles.lifeValueWrap}>
            <Text style={styles.lifeValue}>{preferences.startingLife}</Text>
            <Text style={styles.lifeUnit}>NEXT GAME</Text>
          </View>
          <Pressable
            accessibilityLabel="Increase starting life"
            accessibilityRole="button"
            onPress={() => onSetStartingLife(preferences.startingLife + 1)}
            style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.presets}>
          {[20, 30, 40].map((value) => {
            const selected = value === preferences.startingLife;
            return (
              <Pressable
                accessibilityLabel={`Set starting life to ${value}`}
                accessibilityRole="button"
                key={value}
                onPress={() => onSetStartingLife(value)}
                style={({ pressed }) => [
                  styles.preset,
                  selected && styles.presetSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.presetText, selected && styles.presetTextSelected]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>PLAYER COLORS</Text>
        {([0, 1] as const).map((playerIndex) => (
          <View key={playerIndex} style={styles.playerColorRow}>
            <View style={styles.colorRowTitle}>
              <View
                style={[
                  styles.currentColor,
                  { backgroundColor: preferences.playerColors[playerIndex] },
                ]}
              />
              <Text style={styles.playerColorLabel}>PLAYER {playerIndex + 1}</Text>
            </View>
            <View style={styles.palette}>
              {COLOR_PALETTE.map((option) => {
                const selected = preferences.playerColors[playerIndex] === option.value;
                return (
                  <Pressable
                    accessibilityLabel={`Player ${playerIndex + 1}: ${option.name}${
                      selected ? ', selected' : ''
                    }`}
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => onChooseColor(playerIndex, option.value)}
                    style={({ pressed }) => [
                      styles.colorOption,
                      { backgroundColor: option.value },
                      selected && styles.colorOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {selected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.settingsList}>
          <SettingRow
            body="Give a subtle response when life changes."
            label="Haptic feedback"
            onValueChange={() => onToggle('haptics')}
            value={preferences.haptics}
          />
          <SettingRow
            body="Prevent the display from sleeping during a match."
            label="Keep screen awake"
            onValueChange={() => onToggle('keepAwake')}
            value={preferences.keepAwake}
          />
        </View>
        <Text style={styles.note}>Starting life and colors are saved on this device.</Text>
      </ScrollView>
    </OverlayCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#9B8A5D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  title: {
    color: '#F7F6F2',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252932',
  },
  closeText: {
    color: '#D3D6DC',
    fontSize: 25,
    lineHeight: 27,
  },
  pressed: {
    opacity: 0.62,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  scroll: {
    flexShrink: 1,
  },
  sectionLabel: {
    color: '#8C929E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  lifeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 4,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252A33',
    borderWidth: 1,
    borderColor: '#343A45',
  },
  stepText: {
    color: '#F4F2EC',
    fontSize: 27,
    fontWeight: '400',
    lineHeight: 30,
  },
  lifeValueWrap: {
    width: 96,
    alignItems: 'center',
  },
  lifeValue: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  lifeUnit: {
    color: '#747B87',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: -2,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  preset: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22262E',
    borderWidth: 1,
    borderColor: '#303641',
  },
  presetSelected: {
    backgroundColor: '#7C6738',
    borderColor: '#AD9252',
  },
  presetText: {
    color: '#AAB0BB',
    fontSize: 14,
    fontWeight: '800',
  },
  presetTextSelected: {
    color: '#FFFFFF',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#30343D',
    marginVertical: 20,
  },
  playerColorRow: {
    marginBottom: 16,
  },
  colorRowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  currentColor: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  playerColorLabel: {
    color: '#D5D7DC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  palette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.50)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  settingsList: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#20242C',
    borderWidth: 1,
    borderColor: '#2E333D',
  },
  settingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#373C46',
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    color: '#F0EFEB',
    fontSize: 14,
    fontWeight: '700',
  },
  settingBody: {
    color: '#818895',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  note: {
    color: '#6F7682',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 16,
  },
});
