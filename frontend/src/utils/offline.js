// IndexedDB wrapper for offline alert queuing

const DB_NAME = 'SafeZoneOffline';
const STORE_NAME = 'pendingAlerts';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function addPendingAlert(alertData) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({ ...alertData, timestamp: Date.now() });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error adding pending alert:', err);
    return null;
  }
}

export async function getPendingAlerts() {
  try {
    const db = await openDB();
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting pending alerts:', err);
    return [];
  }
}

export async function removePendingAlert(id) {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error removing pending alert:', err);
  }
}

export async function syncPendingAlerts(apiClient) {
  if (!navigator.onLine) return;
  const pending = await getPendingAlerts();
  for (const item of pending) {
    try {
      await apiClient.post('/alerts', item);
      await removePendingAlert(item.id);
    } catch (err) {
      console.error('Failed to sync alert:', err);
    }
  }
}
