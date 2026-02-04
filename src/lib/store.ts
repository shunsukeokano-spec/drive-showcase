import { put, list, del } from '@vercel/blob';

// The URL of our "database" file in Blob storage
const DB_FILENAME = 'content.json';

export type DocItem = {
  id: string;
  title: string;
  type: 'doc';
  url: string;
  addedAt: string;
};

export type PhotoItem = {
  id: string;
  title: string;
  type: 'photo';
  url: string;
  addedAt: string;
};

export type ContentData = {
  docs: DocItem[];
  photos: PhotoItem[];
};

// Helper to get the full URL of the DB file
async function getDbUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: DB_FILENAME, limit: 1 });
  if (blobs.length > 0) {
    return blobs[0].url;
  }
  return null;
}

export async function getData(): Promise<ContentData> {
  try {
    const dbUrl = await getDbUrl();
    if (!dbUrl) {
      // Initialize if missing
      return { docs: [], photos: [] };
    }

    // Fetch the JSON content from the Blob URL
    const res = await fetch(dbUrl, { cache: 'no-store' });
    if (!res.ok) return { docs: [], photos: [] };
    return await res.json();
  } catch (error) {
    console.error("Error reading data", error);
    return { docs: [], photos: [] };
  }
}

export async function saveData(data: ContentData): Promise<void> {
  // Overwrite the JSON file in Blob
  await put(DB_FILENAME, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false, // KEEP FALSE to allow overwriting key
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function addDoc(url: string, title: string): Promise<DocItem> {
  const data = await getData();
  const newItem: DocItem = {
    id: Date.now().toString(),
    title: title || 'Untitled Document',
    type: 'doc',
    url,
    addedAt: new Date().toISOString(),
  };
  data.docs.unshift(newItem);
  await saveData(data);
  return newItem;
}

export async function addPhoto(blobUrl: string, title?: string): Promise<PhotoItem> {
  const data = await getData();
  const newItem: PhotoItem = {
    id: Date.now().toString(),
    title: title || 'Photo',
    type: 'photo',
    url: blobUrl,
    addedAt: new Date().toISOString(),
  };
  data.photos.unshift(newItem);
  await saveData(data);
  return newItem;
}

export async function deleteItem(id: string, type: 'doc' | 'photo'): Promise<boolean> {
  const data = await getData();
  if (type === 'doc') {
    const initialLen = data.docs.length;
    data.docs = data.docs.filter(d => d.id !== id);
    if (data.docs.length === initialLen) return false;
  } else {
    const photo = data.photos.find(p => p.id === id);
    if (!photo) return false;

    // Delete the actual image file from Blob
    try {
      await del(photo.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (e) {
      console.error("Failed to delete blob", e);
    }

    data.photos = data.photos.filter(p => p.id !== id);
  }
  await saveData(data);
  return true;
}

export async function updateItemTitle(id: string, type: 'doc' | 'photo', newTitle: string): Promise<boolean> {
  const data = await getData();
  let found = false;

  if (type === 'doc') {
    const doc = data.docs.find(d => d.id === id);
    if (doc) {
      doc.title = newTitle;
      found = true;
    }
  } else {
    const photo = data.photos.find(p => p.id === id);
    if (photo) {
      photo.title = newTitle;
      found = true;
    }
  }

  if (found) await saveData(data);
  return found;
}
