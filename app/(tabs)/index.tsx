import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../store';
import { useResponsive } from '../../lib/useResponsive';
import { WebImage } from '../../components/WebImage';
import { getFileUri, getImageDataUrl } from '../../lib/imageStorage';

export default function HomeScreen() {
  const router = useRouter();
  const products = useProductStore((state) => state.products);
  const getTotalProducts = useProductStore((state) => state.getTotalProducts);
  const getTotalImages = useProductStore((state) => state.getTotalImages);

  const { isDesktop, isTablet, isMobile, spacing, gridColumns } = useResponsive();

  const recentProducts = products.slice(-12).reverse();

  // Calculate card width based on grid columns
  const getCardWidth = () => {
    if (isDesktop) return '23%';
    if (isTablet) return '31%';
    return '47%';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { padding: spacing.md },
        isDesktop && { padding: spacing.lg, maxWidth: 1200, alignSelf: 'center', width: '100%' }
      ]}
    >
      {/* Stats Row */}
      <View style={[styles.statsContainer, isDesktop && styles.statsContainerDesktop]}>
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <Text style={[styles.statNumber, isDesktop && styles.statNumberDesktop]}>
            {getTotalProducts()}
          </Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <Text style={[styles.statNumber, isDesktop && styles.statNumberDesktop]}>
            {getTotalImages()}
          </Text>
          <Text style={styles.statLabel}>Images</Text>
        </View>
        {isDesktop && (
          <>
            <View style={[styles.statCard, styles.statCardDesktop]}>
              <Text style={[styles.statNumber, styles.statNumberDesktop]}>
                {products.filter(p => p.listingScore > 0).length}
              </Text>
              <Text style={styles.statLabel}>SEO Analyzed</Text>
            </View>
            <View style={[styles.statCard, styles.statCardDesktop]}>
              <Text style={[styles.statNumber, styles.statNumberDesktop]}>
                {products.filter(p => p.title).length}
              </Text>
              <Text style={styles.statLabel}>With Listings</Text>
            </View>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={[styles.actionsRow, isDesktop && styles.actionsRowDesktop]}>
        <TouchableOpacity
          style={[styles.newProductButton, isDesktop && styles.newProductButtonDesktop]}
          onPress={() => router.push('/editor')}
        >
          <Text style={styles.newProductIcon}>✨</Text>
          <Text style={styles.newProductButtonText}>New Product</Text>
        </TouchableOpacity>

        {isDesktop && (
          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.secondaryButtonIcon}>📦</Text>
            <Text style={styles.secondaryButtonText}>View All Products</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Products Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>
          Recent Products
        </Text>
        {products.length > 0 && !isDesktop && (
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentProducts.length === 0 ? (
        <View style={[styles.emptyState, isDesktop && styles.emptyStateDesktop]}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first product listing by clicking "New Product" above
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/editor')}
          >
            <Text style={styles.emptyButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              width={getCardWidth()}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Separate ProductCard component for better image handling
function ProductCard({ product, width, onPress }: {
  product: any;
  width: string;
  onPress: () => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    async function loadImage() {
      if (product.imagePaths.length > 0) {
        const path = product.imagePaths[product.primaryImageIndex];
        if (Platform.OS === 'web') {
          try {
            const dataUrl = await getImageDataUrl(path);
            setImageUri(dataUrl);
          } catch {
            setImageUri(null);
          }
        } else {
          setImageUri(getFileUri(path));
        }
      }
    }
    loadImage();
  }, [product]);

  return (
    <TouchableOpacity
      style={[styles.productCard, { width: width as any }]}
      onPress={onPress}
    >
      {imageUri ? (
        <WebImage
          path={product.imagePaths[product.primaryImageIndex]}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.placeholderIcon}>🖼️</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title || 'Untitled Product'}
        </Text>
        {product.listingScore > 0 && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>SEO: {product.listingScore}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsContainerDesktop: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardDesktop: {
    padding: 24,
    borderRadius: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  statNumberDesktop: {
    fontSize: 40,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionsRow: {
    marginBottom: 24,
  },
  actionsRowDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  newProductButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newProductButtonDesktop: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
  },
  newProductIcon: {
    fontSize: 20,
  },
  newProductButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  secondaryButtonIcon: {
    fontSize: 20,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  sectionTitleDesktop: {
    fontSize: 24,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateDesktop: {
    padding: 60,
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    ...(Platform.OS === 'web' ? { gap: 16 } : {}),
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    } as any : {}),
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
  },
  productImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  scoreBadge: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  scoreBadgeText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
});
