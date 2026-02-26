// Web-compatible image storage using IndexedDB

const DB_NAME = 'AIProductListerImages';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

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

export async function saveBase64Image(
  productId: string,
  base64Data: string,
  filename: string
): Promise<string> {
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

export async function saveImageFromUri(
  productId: string,
  uri: string,
  filename: string
): Promise<string> {
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

export async function loadImageAsBase64(path: string): Promise<string> {
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

export async function deleteProductImages(productId: string): Promise<void> {
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

export async function deleteImage(filePath: string): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(filePath);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function downloadToGallery(path: string): Promise<boolean> {
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

export async function getProductImages(productId: string): Promise<string[]> {
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

export function getFileUri(path: string): string {
  // For web, return a placeholder - actual data URL will be loaded async
  return `web-image://${path}`;
}

export async function getImageDataUrl(path: string): Promise<string> {
  const base64 = await loadImageAsBase64(path);
  return `data:image/jpeg;base64,${base64}`;
}
