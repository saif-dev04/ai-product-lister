import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ImagePreviewProps = {
  imageUri: string | null;
  isLoading?: boolean;
  onPickImage: () => void;
  onTakePhoto: () => void;
};

export function ImagePreview({ imageUri, isLoading, onPickImage, onTakePhoto }: ImagePreviewProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      </View>
    );
  }

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>Add a product image</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.pickButton} onPress={onPickImage}>
              <Text style={styles.pickButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickButton} onPress={onTakePhoto}>
              <Text style={styles.pickButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      <View style={styles.changeImageRow}>
        <TouchableOpacity style={styles.changeButton} onPress={onPickImage}>
          <Text style={styles.changeButtonText}>Change Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
  },
  changeImageRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
