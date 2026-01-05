import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { UserProfile } from '../../types';
import { colors } from '../../constants/colors';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
  error?: Error | null;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSave,
  loading = false,
  error,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        displayName,
        bio,
        updatedAt: new Date(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isChanged = displayName !== profile.displayName || bio !== profile.bio;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        {/* Display Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            editable={!loading && !isSaving}
            maxLength={50}
          />
          <Text style={styles.charCount}>{displayName.length}/50</Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself"
            multiline
            numberOfLines={4}
            editable={!loading && !isSaving}
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isChanged || loading || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isChanged || loading || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  container: {
    backgroundColor: colors.lightGray,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.borderGray,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 24,
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
});
