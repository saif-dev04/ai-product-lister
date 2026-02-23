import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { copyToClipboard } from '../../lib/clipboard';
import { PlatformFormat } from '../../store';

type ListingData = {
  title: string;
  description: {
    overview: string;
    features: string[];
    materials: string;
    care: string;
  } | null;
  tags: string[];
  category: string;
  priceRange: { low: number; high: number };
};

type CopyAllButtonProps = {
  listing: ListingData;
  platform: PlatformFormat;
};

export function CopyAllButton({ listing, platform }: CopyAllButtonProps) {
  const formatListing = () => {
    const parts: string[] = [];

    // Title
    parts.push('TITLE:');
    parts.push(listing.title);
    parts.push('');

    // Description
    if (listing.description) {
      parts.push('DESCRIPTION:');
      parts.push(listing.description.overview);
      parts.push('');

      parts.push('Features:');
      listing.description.features.forEach((f) => parts.push(`• ${f}`));
      parts.push('');

      parts.push('Materials:');
      parts.push(listing.description.materials);
      parts.push('');

      parts.push('Care Instructions:');
      parts.push(listing.description.care);
      parts.push('');
    }

    // Tags
    parts.push('TAGS:');
    if (platform === 'amazon') {
      // Amazon uses comma-separated keywords
      parts.push(listing.tags.join(', '));
    } else {
      // Etsy, eBay, Shopify use individual tags
      parts.push(listing.tags.join(', '));
    }
    parts.push('');

    // Category
    if (listing.category) {
      parts.push('CATEGORY:');
      parts.push(listing.category);
      parts.push('');
    }

    // Price
    if (listing.priceRange.low > 0 || listing.priceRange.high > 0) {
      parts.push('SUGGESTED PRICE:');
      parts.push(`$${listing.priceRange.low} - $${listing.priceRange.high}`);
    }

    return parts.join('\n');
  };

  const handleCopyAll = async () => {
    const formattedListing = formatListing();
    const success = await copyToClipboard(formattedListing);

    if (success) {
      Alert.alert('Copied!', 'The entire listing has been copied to your clipboard.');
    } else {
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const isDisabled = !listing.title && listing.tags.length === 0;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handleCopyAll}
      disabled={isDisabled}
    >
      <Text style={styles.buttonIcon}>📋</Text>
      <Text style={styles.buttonText}>Copy Entire Listing</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
