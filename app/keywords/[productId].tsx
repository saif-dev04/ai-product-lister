import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useProductStore, useSettingsStore } from '../../store';
import {
  ListingScore,
  KeywordTable,
  ImprovementsList,
  CompetitorInsights,
} from '../../components/Keywords';
import { analyzeSEO, SEOAnalysisResult } from '../../lib/gemini';
import { loadImageAsBase64, getFileUri } from '../../lib/imageStorage';

export default function SEODashboardScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();

  const { geminiApiKey } = useSettingsStore();
  const { getProduct, updateProduct } = useProductStore();

  const product = getProduct(productId || '');

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysisResult | null>(null);

  const handleAnalyze = async () => {
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

    if (!product.title) {
      Alert.alert('No Listing', 'Please generate a listing first before analyzing SEO.', [
        { text: 'Cancel' },
        { text: 'Generate Listing', onPress: () => router.push(`/listing/${product.id}`) },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = product.imagePaths[product.primaryImageIndex];
      const imageBase64 = await loadImageAsBase64(imagePath);

      const result = await analyzeSEO(
        geminiApiKey,
        imageBase64,
        product.title,
        product.description,
        product.tags
      );

      if ('error' in result) {
        Alert.alert('Error', result.error);
      } else {
        setAnalysis(result);
        // Update the product with the listing score
        updateProduct(product.id, { listingScore: result.listingScore });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze SEO');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = (keyword: string) => {
    if (!product) return;

    const newTags = [...product.tags, keyword.toLowerCase()];
    updateProduct(product.id, { tags: newTags });
    Alert.alert('Added', `"${keyword}" has been added to your tags.`);
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
          title: 'SEO Analysis',
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.productHeader}>
          {primaryImage && (
            <Image
              source={{ uri: getFileUri(primaryImage) }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title || 'Untitled Product'}
            </Text>
            <Text style={styles.productMeta}>
              {product.tags.length} tags • {product.platformFormat.toUpperCase()}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing your listing...</Text>
            <Text style={styles.loadingSubtext}>
              Checking keywords, titles, and competitor data
            </Text>
          </View>
        ) : !analysis ? (
          <View style={styles.startContainer}>
            <Text style={styles.startIcon}>📊</Text>
            <Text style={styles.startTitle}>SEO Analysis</Text>
            <Text style={styles.startDescription}>
              Get AI-powered insights to improve your listing's visibility and sales potential.
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>✓ Listing score (0-100)</Text>
              <Text style={styles.featureItem}>✓ Keyword suggestions</Text>
              <Text style={styles.featureItem}>✓ Competitor insights</Text>
              <Text style={styles.featureItem}>✓ Improvement recommendations</Text>
            </View>
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
              <Text style={styles.analyzeButtonText}>Analyze Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ListingScore score={analysis.listingScore} breakdown={analysis.scoreBreakdown} />

            <KeywordTable
              keywords={analysis.suggestedKeywords}
              onAddKeyword={handleAddKeyword}
              existingTags={product.tags}
            />

            <ImprovementsList improvements={analysis.improvements} />

            <CompetitorInsights insights={analysis.competitorInsights} />

            <TouchableOpacity style={styles.reanalyzeButton} onPress={handleAnalyze}>
              <Text style={styles.reanalyzeButtonText}>Re-analyze Listing</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  startContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  startIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  startDescription: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 8,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  reanalyzeButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reanalyzeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
