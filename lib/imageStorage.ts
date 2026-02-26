import { Platform } from 'react-native';

// Web storage using IndexedDB
const DB_NAME = 'AIProductListerImages';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;
let FileSystem: any = null;
let MediaLibrary: any = null;

// Initialize native modules only on native platforms
async function initNative() {
  if (Platform.OS !== 'web' && !FileSystem) {
    FileSystem = await import('expo-file-system/legacy');
    MediaLibrary = await import('expo-media-library');
  }
}

// Initialize IndexedDB for web
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };
  });
}

// Native: Ensure products directory exists
async function ensureProductsDir(): Promise<void> {
  await initNative();
  const PRODUCTS_DIR = `${FileSystem.documentDirectory}products/`;
  const dirInfo = await FileSystem.getInfoAsync(PRODUCTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PRODUCTS_DIR, { intermediates: true });
  }
}

async function ensureProductDir(productId: string): Promise<string> {
  await initNative();
  await ensureProductsDir();
  const PRODUCTS_DIR = `${FileSystem.documentDirectory}products/`;
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
  filename: string
): Promise<string> {
  if (Platform.OS === 'web') {
    const database = await initDB();
    const path = `${productId}/${filename}`;

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put({
        path,
        data: base64Data,
        mimeType: 'image/jpeg',
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(path);
    });
  }

  // Native implementation
  await initNative();
  const productDir = await ensureProductDir(productId);
  const filePath = `${productDir}${filename}`;

  await FileSystem.writeAsStringAsync(filePath, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath;
}

export async function saveImageFromUri(
  productId: string,
  uri: string,
  filename: string
): Promise<string> {
  if (Platform.OS === 'web') {
    // For web, fetch the image and convert to base64
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const path = await saveBase64Image(productId, base64, filename);
        resolve(path);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Native implementation
  await initNative();
  const productDir = await ensureProductDir(productId);
  const filePath = `${productDir}${filename}`;

  await FileSystem.copyAsync({ from: uri, to: filePath });

  return filePath;
}

export async function loadImageAsBase64(path: string): Promise<string> {
  if (Platform.OS === 'web') {
    const database = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          reject(new Error('Image not found'));
        }
      };
    });
  }

  // Native implementation
  await initNative();
  const base64 = await FileSystem.readAsStringAsync(path, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

export async function deleteProductImages(productId: string): Promise<void> {
  if (Platform.OS === 'web') {
    const database = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.path.startsWith(productId + '/')) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  // Native implementation
  await initNative();
  const PRODUCTS_DIR = `${FileSystem.documentDirectory}products/`;
  const productDir = `${PRODUCTS_DIR}${productId}/`;
  const dirInfo = await FileSystem.getInfoAsync(productDir);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(productDir, { idempotent: true });
  }
}

export async function deleteImage(filePath: string): Promise<void> {
  if (Platform.OS === 'web') {
    const database = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(filePath);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Native implementation
  await initNative();
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  }
}

export async function downloadToGallery(path: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      const base64 = await loadImageAsBase64(path);
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = path.split('/').pop() || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  // Native implementation
  try {
    await initNative();
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const asset = await MediaLibrary.createAssetAsync(path);
    await MediaLibrary.createAlbumAsync('AI Product Lister', asset, false);

    return true;
  } catch (error) {
    console.error('Failed to download to gallery:', error);
    return false;
  }
}

export async function getProductImages(productId: string): Promise<string[]> {
  if (Platform.OS === 'web') {
    const database = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();
      const images: string[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.path.startsWith(productId + '/')) {
            images.push(cursor.value.path);
          }
          cursor.continue();
        } else {
          resolve(images);
        }
      };
    });
  }

  // Native implementation
  await initNative();
  const PRODUCTS_DIR = `${FileSystem.documentDirectory}products/`;
  const productDir = `${PRODUCTS_DIR}${productId}/`;
  const dirInfo = await FileSystem.getInfoAsync(productDir);

  if (!dirInfo.exists) {
    return [];
  }

  const files = await FileSystem.readDirectoryAsync(productDir);
  return files
    .filter((f: string) => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
    .map((f: string) => `${productDir}${f}`);
}

export function getFileUri(path: string): string {
  if (Platform.OS === 'web') {
    // For web, return a placeholder - actual data URL will be loaded async
    return `web-image://${path}`;
  }

  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
}

// Helper to get image as data URL (for web display)
export async function getImageDataUrl(path: string): Promise<string> {
  if (Platform.OS === 'web') {
    const base64 = await loadImageAsBase64(path);
    return `data:image/jpeg;base64,${base64}`;
  }
  return getFileUri(path);
}
