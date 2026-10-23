/**
 * Client-Side IndexedDB Storage for SoundKit Audio and Asset Blobs
 * Ensures uploaded demo tracks persist across page reloads without expiring blob: URLs.
 */

const DB_NAME = 'sonic_lab_storage';
const DB_VERSION = 1;
const STORE_AUDIO = 'soundkit_audio_blobs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'kitId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredAudioRecord {
  kitId: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  timestamp: number;
}

/**
 * Persist an audio file or blob for a given SoundKit ID
 */
export async function storeKitAudioBlob(kitId: string, fileOrBlob: Blob | File, fileName?: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, 'readwrite');
      const store = tx.objectStore(STORE_AUDIO);
      const record: StoredAudioRecord = {
        kitId,
        blob: fileOrBlob,
        fileName: fileName || (fileOrBlob as File).name || 'audio-demo.wav',
        mimeType: fileOrBlob.type || 'audio/wav',
        timestamp: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[AudioStorage] Failed to store audio blob in IndexedDB:', err);
  }
}

/**
 * Retrieve the stored audio blob for a SoundKit ID
 */
export async function getKitAudioBlob(kitId: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const store = tx.objectStore(STORE_AUDIO);
      const req = store.get(kitId);
      req.onsuccess = () => {
        const record = req.result as StoredAudioRecord | undefined;
        resolve(record ? record.blob : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[AudioStorage] Failed to get audio blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Creates or retrieves a valid Object URL for a kit ID from IndexedDB
 */
export async function getValidAudioUrlForKit(kitId: string): Promise<string | null> {
  const blob = await getKitAudioBlob(kitId);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}
