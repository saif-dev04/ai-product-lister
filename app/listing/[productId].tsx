import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useProductStore, useSettingsStore, PlatformFormat as PlatformFormatType } from '../../store';
import {
  TitleSelector,
  DescriptionEditor,
  TagManager,
  PlatformFormat,
  CopyAllButton,
  getPlatformLimits,
} from '../../components/Listing';
import { generateListing, ListingData } from '../../lib/gemini';
import { loadImageAsBase64, getFileUri } from '../../lib/imageStorage';

export default function ListingGeneratorScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();

  const { geminiApiKey, brandName, defaultTone } = useSettingsStore();
  const { getProduct, updateProduct } = useProductStore();

  const product = getProduct(productId || '');

  const [isLoading, setIsLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [description, setDescription] = useState<ListingData['description'] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ low: 0, high: 0 });
  const [platform, setPlatform] = useState<PlatformFormatType>(product?.platformFormat || 'etsy');

  useEffect(() => {
    if (product) {
      // Load existing data if available
      if (product.title) {
        setTitles([product.title]);
      }
      if (product.tags.length > 0) {
        setTags(product.tags);
      }
      if (product.category) {
        setCategory(product.category);
      }
      if (product.suggestedPriceLow > 0 || product.suggestedPriceHigh > 0) {
        setPriceRange({ low: product.suggestedPriceLow, high: product.suggestedPriceHigh });
      }
      setPlatform(product.platformFormat);
    }
  }, [product]);

  const handleGenerate = async () => {
    if (!geminiApiKey) {
      Alert.alert('API Key Required', 'Please add your Gemini API key in Settings.', [
        { text: 'Cancel' },
        { text: 'Go to Settings', onPress: () => router.push('/settings') },
      ]);
      return;
    }

    if (!product || product.imagePaths.length === 0) {
      Alert.alert('No Image', 'Please add an image to the product first.');
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = product.imagePaths[product.primaryImageIndex];
      const imageBase64 = await loadImageAsBase64(imagePath);

      const result = await generateListing(geminiApiKey, imageBase64, brandName, defaultTone);

      if ('error' in result) {
        Alert.alert('Error', result.error);
      } else {
        setTitles(result.titles);
        setSelectedTitleIndex(0);
        setDescription(result.description);
        setTags(result.tags);
        setCategory(result.category);
        setPriceRange(result.priceRange);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!product) return;

    const limits = getPlatformLimits(platform);
    const finalTitle = titles[selectedTitleIndex]?.slice(0, limits.titleLength) || '';
    const finalTags = tags.slice(0, limits.maxTags);

    updateProduct(product.id, {
      title: finalTitle,
      description: description
        ? `${description.overview}\n\nFeatures:\n${description.features.map((f) => `• ${f}`).join('\n')}\n\nMaterials:\n${description.materials}\n\nCare:\n${description.care}`
        : '',
      tags: finalTags,
      category,
      suggestedPriceLow: priceRange.low,
      suggestedPriceHigh: priceRange.high,
      platformFormat: platform,
    });

    Alert.alert('Saved', 'Listing has been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const primaryImage = product.imagePaths[product.primaryImageIndex];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Generate Listing',
          headerRight: () => (
            <Text style={styles.saveButton} onPress={handleSave}>
              Save
            </Text>
          ),
        }}
      />

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
        {primaryImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: getFileUri(primaryImage) }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing product and generating listing...</Text>
          </View>
        ) : titles.length === 0 ? (
          <View style={styles.generateContainer}>
            <Text style={styles.generateTitle}>Generate AI Listing</Text>
            <Text style={styles.generateDescription}>
              Let AI analyze your product image and create an optimized listing with title, description, and tags.
            </Text>
            <Text style={styles.generateButton} onPress={handleGenerate}>
              Generate Listing
            </Text>
          </View>
        ) : (
          <>
            <PlatformFormat selected={platform} onSelect={setPlatform} />

            <TitleSelector
              titles={titles}
              selectedIndex={selectedTitleIndex}
              onSelect={setSelectedTitleIndex}
              onEdit={(title) => {
                const newTitles = [...titles];
                newTitles[selectedTitleIndex] = title;
                setTitles(newTitles);
              }}
            />

            <DescriptionEditor description={description} onUpdate={setDescription} />

            <TagManager
              tags={tags}
              onUpdate={setTags}
              maxTags={getPlatformLimits(platform).maxTags}
            />

            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{category || 'Not set'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Suggested Price</Text>
                <Text style={styles.metaValue}>
                  {priceRange.low > 0 || priceRange.high > 0
                    ? `$${priceRange.low} - $${priceRange.high}`
                    : 'Not set'}
                </Text>
              </View>
            </View>

            <CopyAllButton
              listing={{
                title: titles[selectedTitleIndex] || '',
                description,
                tags,
                category,
                priceRange,
              }}
              platform={platform}
            />

            <Text style={styles.regenerateButton} onPress={handleGenerate}>
              Regenerate Listing
            </Text>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
    gap: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  imagePreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  generateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  generateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  generateDescription: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  metaValue: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  regenerateButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
