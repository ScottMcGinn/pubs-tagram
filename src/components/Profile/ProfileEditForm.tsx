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
          <Text style={styles.charCount}>
            {displayName.length}/50
          </Text>
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
          <Text style={styles.charCount}>
            {bio.length}/200
          </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
