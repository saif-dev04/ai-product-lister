import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_DIR = `${FileSystem.documentDirectory}products/`;

export async function ensureProductsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PRODUCTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PRODUCTS_DIR, { intermediates: true });
  }
}

export async function ensureProductDir(productId: string): Promise<string> {
  await ensureProductsDir();
  const productDir = `${PRODUCTS_DIR}${productId}/`;
  const dirInfo = await FileSystem.getInfoAsync(productDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(productDir, { intermediates: true });
  }
  return productDir;
}

export async function saveBase64Image(
  productId: string,
  base64Data: string,
  filename?: string
): Promise<string> {
  const productDir = await ensureProductDir(productId);
  const name = filename || `${uuidv4()}.jpg`;
  const filePath = `${productDir}${name}`;

  await FileSystem.writeAsStringAsync(filePath, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath;
}

export async function saveImageFromUri(
  productId: string,
  uri: string,
  filename?: string
): Promise<string> {
  const productDir = await ensureProductDir(productId);
  const name = filename || `${uuidv4()}.jpg`;
  const filePath = `${productDir}${name}`;

  await FileSystem.copyAsync({ from: uri, to: filePath });

  return filePath;
}

export async function loadImageAsBase64(filePath: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export async function deleteProductImages(productId: string): Promise<void> {
  const productDir = `${PRODUCTS_DIR}${productId}/`;
  const dirInfo = await FileSystem.getInfoAsync(productDir);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(productDir, { idempotent: true });
  }
}

export async function deleteImage(filePath: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  }
}

export async function downloadToGallery(filePath: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const asset = await MediaLibrary.createAssetAsync(filePath);
    await MediaLibrary.createAlbumAsync('AI Product Lister', asset, false);

    return true;
  } catch (error) {
    console.error('Failed to download to gallery:', error);
    return false;
  }
}

export async function getProductImages(productId: string): Promise<string[]> {
  const productDir = `${PRODUCTS_DIR}${productId}/`;
  const dirInfo = await FileSystem.getInfoAsync(productDir);

  if (!dirInfo.exists) {
    return [];
  }

  const files = await FileSystem.readDirectoryAsync(productDir);
  return files
    .filter((f) => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
    .map((f) => `${productDir}${f}`);
}

export function getFileUri(path: string): string {
  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
}
