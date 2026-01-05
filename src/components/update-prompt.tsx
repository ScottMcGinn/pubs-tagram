import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from '../constants/colors';

interface UpdatePromptProps {
  visible: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
  isLoading?: boolean;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  visible,
  onDismiss,
  onUpdate,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of Pubs-tagram is available. Update now to get the
            latest features and improvements.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={onDismiss}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={onUpdate}
              disabled={isLoading}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? 'Updating...' : 'Update Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 8,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  message: {
    color: colors.mediumGray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.shadowOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: colors.backgroundGray,
  },
  skipButtonText: {
    color: colors.mediumGray,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  updateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
