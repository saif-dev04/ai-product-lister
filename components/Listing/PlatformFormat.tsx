import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlatformFormat as PlatformFormatType } from '../../store';

type PlatformFormatProps = {
  selected: PlatformFormatType;
  onSelect: (platform: PlatformFormatType) => void;
};

const PLATFORMS: { value: PlatformFormatType; label: string; icon: string; limits: string }[] = [
  { value: 'etsy', label: 'Etsy', icon: '🧡', limits: '140 chars, 13 tags' },
  { value: 'ebay', label: 'eBay', icon: '🛒', limits: '80 chars, 30 tags' },
  { value: 'amazon', label: 'Amazon', icon: '📦', limits: '200 chars, 250 keywords' },
  { value: 'shopify', label: 'Shopify', icon: '🛍️', limits: 'No limits' },
];

export function PlatformFormat({ selected, onSelect }: PlatformFormatProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Platform Format</Text>
      <Text style={styles.hint}>Adjusts title length and tag formatting</Text>

      <View style={styles.platformGrid}>
        {PLATFORMS.map((platform) => (
          <TouchableOpacity
            key={platform.value}
            style={[
              styles.platformCard,
              selected === platform.value && styles.platformCardSelected,
            ]}
            onPress={() => onSelect(platform.value)}
          >
            <Text style={styles.platformIcon}>{platform.icon}</Text>
            <Text
              style={[
                styles.platformLabel,
                selected === platform.value && styles.platformLabelSelected,
              ]}
            >
              {platform.label}
            </Text>
            <Text style={styles.platformLimits}>{platform.limits}</Text>
            {selected === platform.value && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function getPlatformLimits(platform: PlatformFormatType) {
  switch (platform) {
    case 'etsy':
      return { titleLength: 140, maxTags: 13 };
    case 'ebay':
      return { titleLength: 80, maxTags: 30 };
    case 'amazon':
      return { titleLength: 200, maxTags: 250 };
    case 'shopify':
      return { titleLength: 999, maxTags: 999 };
    default:
      return { titleLength: 140, maxTags: 13 };
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 16,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    width: '47%',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  platformCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F0FE',
  },
  platformIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  platformLabelSelected: {
    color: '#007AFF',
  },
  platformLimits: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
