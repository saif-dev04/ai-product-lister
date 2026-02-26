import { useState, useEffect } from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator, Platform } from 'react-native';
import { getImageDataUrl, getFileUri } from '../lib/imageStorage';

type WebImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onLoad?: () => void;
  onError?: () => void;
};

export function WebImage({ path, style, resizeMode = 'cover', onLoad, onError }: WebImageProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      try {
        setLoading(true);
        setError(false);

        if (Platform.OS === 'web') {
          // For web, load from IndexedDB as data URL
          if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('blob:')) {
            setImageUri(path);
          } else {
            const dataUrl = await getImageDataUrl(path);
            if (mounted) {
              setImageUri(dataUrl);
            }
          }
        } else {
          // For native, use file URI directly
          setImageUri(getFileUri(path));
        }
      } catch (err) {
        console.error('Failed to load image:', err);
        if (mounted) {
          setError(true);
          onError?.();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (path) {
      loadImage();
    } else {
      setLoading(false);
      setError(true);
    }

    return () => {
      mounted = false;
    };
  }, [path]);

  if (loading) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' }]}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );
  }

  if (error || !imageUri) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' }]}>
        <View style={{ opacity: 0.5 }}>
          <Image
            source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0ibTIxIDE1LTUtNUw1IDIxIi8+PC9zdmc+' }}
            style={{ width: 48, height: 48 }}
          />
        </View>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      resizeMode={resizeMode}
      onLoad={onLoad}
      onError={() => {
        setError(true);
        onError?.();
      }}
    />
  );
}
