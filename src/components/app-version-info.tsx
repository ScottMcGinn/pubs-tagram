import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { colors } from '../constants/colors';

interface AppVersionInfoProps {
  updateAvailable?: boolean;
  isCheckingUpdates?: boolean;
  onCheckUpdates?: () => void;
  lastChecked?: Date;
}

export const AppVersionInfo: React.FC<AppVersionInfoProps> = ({
  updateAvailable = false,
  isCheckingUpdates = false,
  onCheckUpdates,
  lastChecked,
}) => {
  const [versionInfo, setVersionInfo] = useState<{
    appVersion: string | null;
    buildVersion: string | null;
  }>({
    appVersion: null,
    buildVersion: null,
  });

  useEffect(() => {
    try {
      const appVersion = Constants.expoConfig?.version || 'Unknown';
      const buildVersion =
        Constants.expoConfig?.extra?.eas?.projectId || 'Development';

      setVersionInfo({
        appVersion: appVersion as string,
        buildVersion: buildVersion as string,
      });
    } catch (error) {
      console.warn('[AppVersionInfo] Error loading version info:', error);
    }
  }, []);

  const formatLastChecked = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.versionSection}>
          <Text style={styles.label}>App Version:</Text>
          <Text style={styles.value}>{versionInfo.appVersion}</Text>
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.label}>Build Version:</Text>
          <Text style={styles.value}>{versionInfo.buildVersion}</Text>
        </View>

        {updateAvailable && (
          <View style={[styles.versionSection, styles.updateAvailableBadge]}>
            <Text style={styles.updateAvailableText}>✓ Update Available</Text>
          </View>
        )}
      </View>

      {onCheckUpdates && (
        <TouchableOpacity
          style={[
            styles.checkButton,
            isCheckingUpdates && styles.checkButtonDisabled,
          ]}
          onPress={onCheckUpdates}
          disabled={isCheckingUpdates}
        >
          {isCheckingUpdates ? (
            <>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.checkButtonText}>Checking...</Text>
            </>
          ) : (
            <Text style={styles.checkButtonText}>Check for Updates</Text>
          )}
        </TouchableOpacity>
      )}

      {lastChecked && onCheckUpdates && (
        <Text style={styles.lastChecked}>
          Last checked: {formatLastChecked(lastChecked)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  checkButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  content: {
    marginBottom: 12,
  },
  label: {
    color: colors.mediumGray,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lastChecked: {
    color: colors.gray,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  updateAvailableBadge: {
    backgroundColor: colors.successLight,
    borderRadius: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  updateAvailableText: {
    color: colors.successDark,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  versionSection: {
    marginBottom: 12,
  },
});
