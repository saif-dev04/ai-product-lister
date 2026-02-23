import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useProductStore } from '../../store';
import { downloadToGallery, getFileUri } from '../../lib/imageStorage';
import { copyToClipboard } from '../../lib/clipboard';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { getProduct, deleteProduct, updateProduct } = useProductStore();
  const product = getProduct(id || '');

  const [selectedImageIndex, setSelectedImageIndex] = useState(product?.primaryImageIndex || 0);

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          router.back();
        },
      },
    ]);
  };

  const handleDownloadImage = async () => {
    const imagePath = product.imagePaths[selectedImageIndex];
    if (!imagePath) return;

    const success = await downloadToGallery(imagePath);
    if (success) {
      Alert.alert('Downloaded', 'Image saved to your gallery.');
    } else {
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const handleSetPrimary = () => {
    updateProduct(product.id, { primaryImageIndex: selectedImageIndex });
    Alert.alert('Updated', 'Primary image has been updated.');
  };

  const handleCopyListing = async () => {
    const listing = [
      product.title,
      '',
      product.description,
      '',
      `Tags: ${product.tags.join(', ')}`,
    ].join('\n');

    await copyToClipboard(listing);
    Alert.alert('Copied', 'Listing copied to clipboard.');
  };

  const selectedImage = product.imagePaths[selectedImageIndex];

  return (
    <>
      <Stack.Screen
        options={{
          title: product.title || 'Product Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {selectedImage && (
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: getFileUri(selectedImage) }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          </View>
        )}

        {product.imagePaths.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {product.imagePaths.map((path, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected,
                ]}
              >
                <Image
                  source={{ uri: getFileUri(path) }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                {product.primaryImageIndex === index && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>★</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadImage}>
            <Text style={styles.actionButtonText}>Download Image</Text>
          </TouchableOpacity>
          {selectedImageIndex !== product.primaryImageIndex && (
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleSetPrimary}>
              <Text style={styles.actionButtonSecondaryText}>Set as Primary</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.generateListingButton}
          onPress={() => router.push(`/listing/${product.id}`)}
        >
          <Text style={styles.generateListingIcon}>✨</Text>
          <Text style={styles.generateListingText}>
            {product.title ? 'Edit Listing' : 'Generate AI Listing'}
          </Text>
        </TouchableOpacity>

        {product.title && (
          <TouchableOpacity
            style={styles.seoButton}
            onPress={() => router.push(`/keywords/${product.id}`)}
          >
            <Text style={styles.seoButtonIcon}>📊</Text>
            <Text style={styles.seoButtonText}>SEO Analysis</Text>
            {product.listingScore > 0 && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>{product.listingScore}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {product.title ? (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Title</Text>
                <Text style={styles.platformBadge}>{product.platformFormat.toUpperCase()}</Text>
              </View>
              <Text style={styles.titleText}>{product.title}</Text>
            </View>

            {product.description && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Description</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}

            {product.tags.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Tags ({product.tags.length})</Text>
                <View style={styles.tagsContainer}>
                  {product.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{product.category || 'Not set'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Price Range</Text>
                <Text style={styles.metaValue}>
                  {product.suggestedPriceLow > 0 || product.suggestedPriceHigh > 0
                    ? `$${product.suggestedPriceLow} - $${product.suggestedPriceHigh}`
                    : 'Not set'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Listing Score</Text>
                <Text style={styles.metaValue}>
                  {product.listingScore > 0 ? `${product.listingScore}/100` : 'Not scored'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyListing}>
              <Text style={styles.copyButtonText}>📋 Copy Entire Listing</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noListingCard}>
            <Text style={styles.noListingIcon}>📝</Text>
            <Text style={styles.noListingText}>No listing generated yet</Text>
            <Text style={styles.noListingHint}>
              Tap "Generate AI Listing" to create title, description, and tags
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Created: {new Date(product.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            Updated: {new Date(product.updatedAt).toLocaleDateString()}
          </Text>
        </View>
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
  deleteButton: {
    color: '#FF3B30',
    fontSize: 17,
  },
  mainImageContainer: {
    height: 300,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailScroll: {
    marginHorizontal: -16,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD60A',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#000000',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondaryText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  generateListingButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateListingIcon: {
    fontSize: 20,
  },
  generateListingText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  seoButton: {
    backgroundColor: '#5856D6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  seoButtonIcon: {
    fontSize: 20,
  },
  seoButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 4,
  },
  scoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  platformBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#E8F0FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#007AFF',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  copyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  noListingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  noListingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noListingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  noListingHint: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
