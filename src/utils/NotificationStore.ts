// NotificationStore.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'

const DB_NAME = 'notifications-db_v5'
const STORE_NAME = 'notifications'
const DB_VERSION = 1

// 通知结构（notifcationId 改为 string）
export interface Notification {
  notifcationId: string
  notifcationType: string
  fromPinId: string
  fromAddress: string
  fromPinHost:string
  fromPinChain:'btc'|'mvc'
  notifcationPin: string
  notifcationHost: string
  notifcationTime: number
  ownerAddress: string
  isRead?: boolean
}

interface NotificationDB extends DBSchema {
  [STORE_NAME]: {
    key: string // notifcationId 作为主键
    value: Notification
    indexes: {
      ownerAddress: string
    }
  }
}

export class NotificationStore {
  private db: IDBPDatabase<NotificationDB> | null = null

  async init() {
    if (this.db) return this.db

    this.db = await openDB<NotificationDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'notifcationId',
          })
          store.createIndex('ownerAddress', 'ownerAddress')
        }
      },
    })

    return this.db
  }

  // 保存一批通知
  async save(notifications: Notification[], ownerAddress: string) {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.store

    for (const n of notifications) {
      if (n.isRead === undefined) n.isRead = false
      n.ownerAddress = ownerAddress
      n.notifcationId = n.notifcationId.toString()
      await store.put(n)
    }

    await tx.done
  }

  // 获取未读数量
  async getUnreadCount(ownerAddress: string): Promise<number> {
    const db = await this.init()
    const index = db.transaction(STORE_NAME).store.index('ownerAddress')

    let count = 0
    for await (const cursor of index.iterate(ownerAddress)) {
      if (!cursor.value.isRead) count++
    }
    return count
  }

  // 分页获取通知，按 notifcationId 倒序，可筛选 notifcationType
  async getAllNotifications(
    ownerAddress: string,
    options?: {
      offset?: number
      limit?: number
      notifcationType?: string
    }
  ): Promise<Notification[]> {
    const db = await this.init()
    const index = db.transaction(STORE_NAME).store.index('ownerAddress')

    const all: Notification[] = []
    for await (const cursor of index.iterate(ownerAddress)) {
      const n = cursor.value
      if (
        !options?.notifcationType ||
        n.notifcationType === options.notifcationType
      ) {
        all.push(n)
      }
    }

    // 使用 BigInt 排序
    all.sort((a, b) => {
      return BigInt(b.notifcationId) > BigInt(a.notifcationId) ? 1 : -1
    })

    const offset = options?.offset ?? 0
    const limit = options?.limit ?? all.length

    return all.slice(offset, offset + limit)
  }

  // 获取最大 notifcationId（用于增量拉取）
  async getLastNotificationId(ownerAddress: string): Promise<string | null> {
    const db = await this.init()
    const index = db.transaction(STORE_NAME).store.index('ownerAddress')

    let maxId: bigint | null = null

    for await (const cursor of index.iterate(ownerAddress)) {
      const id = BigInt(cursor.value.notifcationId)
      if (!maxId || id > maxId) {
        maxId = id
      }
    }

    return maxId?.toString() ?? null
  }

  // 标记该用户所有通知为已读
  async markAllAsRead(ownerAddress: string): Promise<void> {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const index = tx.store.index('ownerAddress')

    for await (const cursor of index.iterate(ownerAddress)) {
      if (!cursor.value.isRead) {
        const updated = { ...cursor.value, isRead: true }
        await cursor.update(updated)
      }
    }

    await tx.done
  }

  // 清除该用户的所有通知
  async clearByAddress(ownerAddress: string) {
    const db = await this.init()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const index = tx.store.index('ownerAddress')

    for await (const cursor of index.iterate(ownerAddress)) {
      await cursor.delete()
    }

    await tx.done
  }

  // 清除所有（调试用）
  async clearAll() {
    const db = await this.init()
    await db.clear(STORE_NAME)
  }
}
