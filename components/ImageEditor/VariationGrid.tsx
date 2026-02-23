import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

type VariationGridProps = {
  variations: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLoading?: boolean;
  onGenerate?: () => void;
  disabled?: boolean;
};

export function VariationGrid({
  variations,
  selectedIndex,
  onSelect,
  isLoading,
  onGenerate,
  disabled,
}: VariationGridProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Variations</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating 4 variations...</Text>
        </View>
      </View>
    );
  }

  if (variations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Variations</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Generate different product photo styles</Text>
          <TouchableOpacity
            style={[styles.generateButton, disabled && styles.generateButtonDisabled]}
            onPress={onGenerate}
            disabled={disabled}
          >
            <Text style={styles.generateButtonText}>Generate 4 Variations</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Variations</Text>
        <Text style={styles.subtitle}>Tap to select</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {variations.map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.variationItem,
                selectedIndex === index && styles.variationItemSelected,
              ]}
              onPress={() => onSelect(index)}
            >
              <Image source={{ uri }} style={styles.variationImage} resizeMode="cover" />
              <View style={styles.variationLabel}>
                <Text style={styles.variationLabelText}>
                  {index === 0 && 'Warm'}
                  {index === 1 && 'Cool'}
                  {index === 2 && 'Lifestyle'}
                  {index === 3 && 'Flat Lay'}
                </Text>
              </View>
              {selectedIndex === index && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {onGenerate && (
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={onGenerate}
          disabled={disabled}
        >
          <Text style={styles.regenerateButtonText}>Regenerate</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  variationItem: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  variationItemSelected: {
    borderColor: '#007AFF',
  },
  variationImage: {
    width: '100%',
    height: '100%',
  },
  variationLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  variationLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  regenerateButton: {
    margin: 12,
    marginTop: 0,
    padding: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
