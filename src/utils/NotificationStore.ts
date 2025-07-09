// NotificationStore.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

const DB_NAME = "notifications-db";
const STORE_NAME = "notifications";
const DB_VERSION = 1;

// 通知结构
export interface Notification {
  notifcationId: number;
  notifcationType: string;
  fromPinId: string;
  fromAddress: string; // 发起通知的地址
  notifcationPin: string;
  notifcationTime: number;
  ownerAddress: string; // 当前登录用户地址（接收者）
  isRead?: boolean;
}

interface NotificationDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: Notification;
    indexes: {
      ownerAddress: string;
    };
  };
}

export class NotificationStore {
  private db: IDBPDatabase<NotificationDB> | null = null;

  // 初始化数据库和索引
  async init() {
    if (this.db) return this.db;

    this.db = await openDB<NotificationDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "notifcationId",
          });
          store.createIndex("ownerAddress", "ownerAddress");
        }
      },
    });

    return this.db;
  }

  // 保存一批通知（标记为未读 + 指定 ownerAddress）
  async save(notifications: Notification[], ownerAddress: string) {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;

    for (const n of notifications) {
      if (n.isRead === undefined) n.isRead = false;
      n.ownerAddress = ownerAddress;
      await store.put(n);
    }

    await tx.done;
  }

  // 获取该用户未读通知数
  async getUnreadCount(ownerAddress: string): Promise<number> {
    const db = await this.init();
    const index = db.transaction(STORE_NAME).store.index("ownerAddress");

    let count = 0;
    for await (const cursor of index.iterate(ownerAddress)) {
      if (!cursor.value.isRead) count++;
    }
    return count;
  }

  // 分页获取该用户的通知，按 notifcationId 倒序
  async getAllNotifications(
    ownerAddress: string,
    options?: {
      offset?: number;
      limit?: number;
      notifcationType?: string;
    }
  ): Promise<Notification[]> {
    const db = await this.init();
    const index = db.transaction(STORE_NAME).store.index("ownerAddress");

    const all: Notification[] = [];
    for await (const cursor of index.iterate(ownerAddress)) {
      const notification = cursor.value;
      if (
        !options?.notifcationType ||
        notification.notifcationType === options.notifcationType
      ) {
        all.push(notification);
      }
    }

    // 按 notifcationId 倒序排列
    all.sort((a, b) => b.notifcationId - a.notifcationId);

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? all.length;

    return all.slice(offset, offset + limit);
  }

  // 获取该用户的最新通知 ID（用于增量拉取）
  async getLastNotificationId(ownerAddress: string): Promise<number | null> {
    const db = await this.init();
    const index = db.transaction(STORE_NAME).store.index("ownerAddress");

    let maxId = null;

    for await (const cursor of index.iterate(ownerAddress)) {
      const id = cursor.value.notifcationId;
      if (maxId === null || id > maxId) {
        maxId = id;
      }
    }

    return maxId;
  }

  // 将该用户的所有通知标记为已读
  async markAllAsRead(ownerAddress: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const index = tx.store.index("ownerAddress");

    for await (const cursor of index.iterate(ownerAddress)) {
      if (!cursor.value.isRead) {
        const updated = { ...cursor.value, isRead: true };
        await cursor.update(updated);
      }
    }

    await tx.done;
  }

  // 清除该用户的所有通知
  async clearByAddress(ownerAddress: string) {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const index = tx.store.index("ownerAddress");

    for await (const cursor of index.iterate(ownerAddress)) {
      await cursor.delete();
    }

    await tx.done;
  }

  // 清除整个数据库（调试用）
  async clearAll() {
    const db = await this.init();
    await db.clear(STORE_NAME);
  }
}
