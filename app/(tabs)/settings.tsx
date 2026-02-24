import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSettingsStore, ToneOfVoice } from '../../store';

const TONE_OPTIONS: { value: ToneOfVoice; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'edgy', label: 'Edgy' },
];

export default function SettingsScreen() {
  const {
    geminiApiKey,
    brandName,
    defaultTone,
    preferQuality,
    setGeminiApiKey,
    setBrandName,
    setDefaultTone,
    setPreferQuality,
  } = useSettingsStore();

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [brandNameInput, setBrandNameInput] = useState(brandName);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    Alert.alert('Saved', 'API key has been saved.');
  };

  const handleSaveBrandName = () => {
    setBrandName(brandNameInput.trim());
    Alert.alert('Saved', 'Brand name has been saved.');
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Gemini API Key</Text>
            <Text style={styles.hint}>
              Get your key at aistudio.google.com/apikey
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={showApiKey ? apiKeyInput : maskApiKey(apiKeyInput)}
                onChangeText={setApiKeyInput}
                placeholder="Enter your Gemini API key"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Text style={styles.eyeIcon}>{showApiKey ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiKey}>
              <Text style={styles.saveButtonText}>Save API Key</Text>
            </TouchableOpacity>
            {geminiApiKey && (
              <View style={styles.statusRow}>
                <Text style={styles.statusIcon}>✓</Text>
                <Text style={styles.statusText}>API key configured</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Quality</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.label}>Prefer Quality Mode</Text>
                <Text style={styles.hint}>
                  {preferQuality
                    ? 'Using gemini-3-pro-image-preview (higher quality)'
                    : 'Using gemini-2.5-flash-image (faster)'}
                </Text>
              </View>
              <Switch
                value={preferQuality}
                onValueChange={setPreferQuality}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Settings</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Brand Name</Text>
            <Text style={styles.hint}>
              Used for consistent AI-generated content
            </Text>
            <TextInput
              style={styles.input}
              value={brandNameInput}
              onChangeText={setBrandNameInput}
              placeholder="Enter your brand name"
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBrandName}>
              <Text style={styles.saveButtonText}>Save Brand Name</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tone of Voice</Text>
          <View style={styles.card}>
            <Text style={styles.hint}>
              Select the default tone for AI-generated listings
            </Text>
            <View style={styles.toneGrid}>
              {TONE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.toneButton,
                    defaultTone === option.value && styles.toneButtonActive,
                  ]}
                  onPress={() => setDefaultTone(option.value)}
                >
                  <Text
                    style={[
                      styles.toneButtonText,
                      defaultTone === option.value && styles.toneButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI Product Lister v1.0.0</Text>
          <Text style={styles.footerHint}>All data is stored locally on your device</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
    color: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#34C759',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toneButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneButtonActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#007AFF',
  },
  toneButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  toneButtonTextActive: {
    color: '#007AFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  footerHint: {
    fontSize: 12,
    color: '#C7C7CC',
  },
});
