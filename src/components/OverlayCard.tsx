import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OverlayCardProps = PropsWithChildren<{
  flipped?: boolean;
  onDismiss: () => void;
  visible: boolean;
}>;

export function OverlayCard({ children, flipped = false, onDismiss, visible }: OverlayCardProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.scrim}>
        <Pressable
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.card, flipped && styles.flipped]}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(4, 5, 8, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '78%',
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#171A20',
    borderWidth: 1,
    borderColor: '#30343E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 18,
  },
  flipped: {
    transform: [{ rotate: '180deg' }],
  },
});
