import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

import { useSettingsStore, useProductStore, useEditorStore, ChatMessage } from '../../store';
import {
  ImagePreview,
  AIChatPanel,
  VariationGrid,
  EditToolbar,
} from '../../components/ImageEditor';
import {
  startImageChat,
  continueImageChat,
  generateImageVariations,
  removeBackground,
  resetChat,
} from '../../lib/gemini';
import {
  saveBase64Image,
  saveImageFromUri,
  loadImageAsBase64,
  downloadToGallery,
  getFileUri,
} from '../../lib/imageStorage';
import { useResponsive } from '../../lib/useResponsive';

export default function EditorScreen() {
  const router = useRouter();
  const { isDesktop, isWeb, spacing } = useResponsive();

  const { geminiApiKey, preferQuality } = useSettingsStore();
  const { addProduct } = useProductStore();
  const {
    currentProductId,
    currentImagePath,
    chatHistory,
    isProcessing,
    variations,
    selectedVariationIndex,
    setCurrentProduct,
    setCurrentImage,
    addChatMessage,
    clearChatHistory,
    setIsProcessing,
    setVariations,
    selectVariation,
    resetEditor,
  } = useEditorStore();

  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [productId] = useState(() => currentProductId || uuidv4());

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 1) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed && buttons[1]?.onPress) {
          buttons[1].onPress();
        }
      } else {
        window.alert(`${title}\n\n${message}`);
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const checkApiKey = useCallback(() => {
    if (!geminiApiKey) {
      showAlert(
        'API Key Required',
        'Please add your Gemini API key in Settings to use AI features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => router.push('/settings') },
        ]
      );
      return false;
    }
    return true;
  }, [geminiApiKey, router]);

  const pickImage = async (useCamera: boolean) => {
    try {
      // On web, camera is not supported, always use gallery
      if (Platform.OS === 'web' && useCamera) {
        showAlert('Not Supported', 'Camera is not supported on web. Please upload an image instead.');
        return;
      }

      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert('Permission Required', `Please grant ${useCamera ? 'camera' : 'gallery'} access to continue.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Save image to local storage
        const savedPath = await saveImageFromUri(productId, asset.uri, 'original.jpg');

        setCurrentProduct(productId);
        setCurrentImage(savedPath);
        clearChatHistory();
        setVariations([]);
        selectVariation(null);
        resetChat();
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!checkApiKey() || !currentImagePath) return;

    const userMessage: ChatMessage = { role: 'user', text };
    addChatMessage(userMessage);
    setIsProcessing(true);

    try {
      const imageBase64 = await loadImageAsBase64(currentImagePath);

      const result =
        chatHistory.length === 0
          ? await startImageChat(geminiApiKey, preferQuality, imageBase64, text)
          : await continueImageChat(text);

      if (result.error) {
        addChatMessage({ role: 'model', text: `Error: ${result.error}` });
      } else {
        if (result.imageBase64) {
          const editedPath = await saveBase64Image(productId, result.imageBase64, `edit_${Date.now()}.jpg`);
          setCurrentImage(editedPath);
          addChatMessage({
            role: 'model',
            text: result.text || 'Image updated!',
            imagePath: editedPath,
          });
        } else {
          addChatMessage({
            role: 'model',
            text: result.text || 'Done!',
          });
        }
      }
    } catch (error: any) {
      addChatMessage({ role: 'model', text: `Error: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!checkApiKey() || !currentImagePath) return;

    setIsProcessing(true);
    addChatMessage({ role: 'user', text: 'Remove background' });

    try {
      const imageBase64 = await loadImageAsBase64(currentImagePath);
      const result = await removeBackground(geminiApiKey, preferQuality, imageBase64);

      if (result.error) {
        addChatMessage({ role: 'model', text: `Error: ${result.error}` });
      } else if (result.imageBase64) {
        const editedPath = await saveBase64Image(productId, result.imageBase64, `nobg_${Date.now()}.jpg`);
        setCurrentImage(editedPath);
        addChatMessage({
          role: 'model',
          text: 'Background removed!',
          imagePath: editedPath,
        });
      }
    } catch (error: any) {
      addChatMessage({ role: 'model', text: `Error: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!checkApiKey() || !currentImagePath) return;

    setIsGeneratingVariations(true);

    try {
      const imageBase64 = await loadImageAsBase64(currentImagePath);
      const results = await generateImageVariations(geminiApiKey, preferQuality, imageBase64);

      const variationPaths: string[] = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.imageBase64) {
          const path = await saveBase64Image(productId, result.imageBase64, `variation_${i}.jpg`);
          variationPaths.push(getFileUri(path));
        }
      }

      setVariations(variationPaths);

      if (variationPaths.length < 4) {
        showAlert('Partial Results', `Generated ${variationPaths.length} of 4 variations.`);
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to generate variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleSelectVariation = (index: number) => {
    selectVariation(index);
    if (variations[index]) {
      setCurrentImage(variations[index].replace('file://', '').replace('web-image://', ''));
    }
  };

  const handleDownload = async () => {
    if (!currentImagePath) return;

    const success = await downloadToGallery(currentImagePath);
    if (success) {
      showAlert('Downloaded', Platform.OS === 'web' ? 'Image download started.' : 'Image saved to your gallery.');
    } else {
      showAlert('Error', 'Failed to save image.');
    }
  };

  const handleSaveProduct = async () => {
    if (!currentImagePath) return;

    try {
      const now = new Date().toISOString();
      const allImages = [currentImagePath, ...variations.map((v) => v.replace('file://', '').replace('web-image://', ''))];

      addProduct({
        id: productId,
        title: '',
        description: '',
        tags: [],
        suggestedPriceLow: 0,
        suggestedPriceHigh: 0,
        category: '',
        platformFormat: 'etsy',
        imagePaths: allImages.filter((p, i, arr) => arr.indexOf(p) === i),
        primaryImageIndex: 0,
        aiChatHistory: chatHistory,
        listingScore: 0,
        createdAt: now,
        updatedAt: now,
      });

      showAlert('Saved', 'Product saved! You can now generate a listing.', [
        { text: 'Stay Here', style: 'cancel' },
        {
          text: 'View Products',
          onPress: () => {
            resetEditor();
            router.push('/products');
          },
        },
      ]);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to save product');
    }
  };

  const imageUri = currentImagePath ? getFileUri(currentImagePath) : null;

  // Desktop two-column layout
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.desktopContent}>
          {/* Left Column - Image & Tools */}
          <View style={styles.leftColumn}>
            <ScrollView
              style={styles.leftScrollView}
              contentContainerStyle={styles.leftScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewContainerDesktop}>
                <ImagePreview
                  imageUri={imageUri}
                  isLoading={isProcessing}
                  onPickImage={() => pickImage(false)}
                  onTakePhoto={() => pickImage(true)}
                />
              </View>

              <EditToolbar
                onRemoveBackground={handleRemoveBackground}
                onGenerateVariations={handleGenerateVariations}
                onDownload={handleDownload}
                onSaveProduct={handleSaveProduct}
                isProcessing={isProcessing || isGeneratingVariations}
                hasImage={!!currentImagePath}
                hasEdits={chatHistory.length > 0}
              />

              <VariationGrid
                variations={variations}
                selectedIndex={selectedVariationIndex}
                onSelect={handleSelectVariation}
                isLoading={isGeneratingVariations}
                onGenerate={handleGenerateVariations}
                disabled={!currentImagePath || isProcessing}
              />
            </ScrollView>
          </View>

          {/* Right Column - Chat */}
          <View style={styles.rightColumn}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderTitle}>AI Image Editor</Text>
              <Text style={styles.chatHeaderSubtitle}>Describe changes you want to make</Text>
            </View>
            <View style={styles.chatContainerDesktop}>
              <AIChatPanel
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                disabled={!currentImagePath}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewContainer}>
          <ImagePreview
            imageUri={imageUri}
            isLoading={isProcessing}
            onPickImage={() => pickImage(false)}
            onTakePhoto={() => pickImage(true)}
          />
        </View>

        <EditToolbar
          onRemoveBackground={handleRemoveBackground}
          onGenerateVariations={handleGenerateVariations}
          onDownload={handleDownload}
          onSaveProduct={handleSaveProduct}
          isProcessing={isProcessing || isGeneratingVariations}
          hasImage={!!currentImagePath}
          hasEdits={chatHistory.length > 0}
        />

        <VariationGrid
          variations={variations}
          selectedIndex={selectedVariationIndex}
          onSelect={handleSelectVariation}
          isLoading={isGeneratingVariations}
          onGenerate={handleGenerateVariations}
          disabled={!currentImagePath || isProcessing}
        />

        <View style={styles.chatContainer}>
          <AIChatPanel
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            disabled={!currentImagePath}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  previewContainer: {
    height: 300,
  },
  chatContainer: {
    height: 350,
  },
  // Desktop styles
  desktopContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  desktopContent: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    padding: 24,
    gap: 24,
  },
  leftColumn: {
    flex: 1,
    maxWidth: 600,
  },
  leftScrollView: {
    flex: 1,
  },
  leftScrollContent: {
    gap: 20,
    paddingBottom: 24,
  },
  previewContainerDesktop: {
    height: 400,
  },
  rightColumn: {
    flex: 1,
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  chatHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FAFAFA',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  chatContainerDesktop: {
    flex: 1,
  },
});
