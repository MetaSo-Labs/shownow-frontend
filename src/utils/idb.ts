import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'PostDraftDB';
const STORE_NAME = 'draft_files';

interface DraftFile {
  id: string; // 使用 uid
  file: File | Blob;
  createdAt: number;
}

interface UploadDraftItem {
  uid: string;
  file: File | Blob;
  previewUrl: string;
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase>;

async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// 批量保存上传项
export async function saveUploadItemsToDraft(fileItems: { uid: string; file: File | Blob }[]): Promise<void> {
  if (!Array.isArray(fileItems) || fileItems.length === 0) return;
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  fileItems.forEach((fileItem) => {
    console.log('fileItem', fileItem);
    if (fileItem.file && fileItem.uid) {
      tx.store.put({
        id: fileItem.uid,
        file: fileItem.file,
        createdAt: Date.now(),
      } as DraftFile);
    }
  });
  await tx.done;
}

// 获取所有文件
export async function getUploadDraftList(): Promise<UploadDraftItem[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);

  return all.map((item: DraftFile) => ({
    uid: item.id,
    file: item.file,
    previewUrl: URL.createObjectURL(item.file),
    createdAt: item.createdAt,
  }));
}

// 删除单个文件
export async function deleteDraftFile(uid: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, uid);
}

// 清空所有
export async function clearDraftFiles(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
