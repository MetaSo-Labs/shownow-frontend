import { openDB, DBSchema, IDBPDatabase } from "idb";

const DB_NAME = "idcoins-db_v1";
const STORE_NAME = "idcoins";
const DB_VERSION = 1;

export type IDCoin = {
  tickId: string;
  tick: string;
  tokenName: string;
  deployerMetaId: string;
  deployerAddress: string;
};

interface IDCoinDB extends DBSchema {
  [STORE_NAME]: {
    key: string; // tickId 作为主键
    value: IDCoin;
    indexes: {
      tick: string;
      deployerAddress: string;
    };
  };
}

export class IDCoinStore {
  private db: IDBPDatabase<IDCoinDB> | null = null;

  async init() {
    if (this.db) return this.db;
    this.db = await openDB<IDCoinDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "tickId",
          });
          store.createIndex("tick", "tick");
          store.createIndex("deployerAddress", "deployerAddress");
        }
      },
    });
    return this.db;
  }

  // 保存一批 IDCoin
  async save(idCoins: IDCoin[]) {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;

    for (const coin of idCoins) {
      await store.put(coin);
    }

    await tx.done;
  }

  // 获取所有 IDCoin
  async getAll(): Promise<IDCoin[]> {
    const db = await this.init();
    return db.getAll(STORE_NAME);
  }

  // 根据 tick 获取 IDCoin
  async getByTick(tick: string): Promise<IDCoin | undefined> {
    const db = await this.init();
    return db.getFromIndex(STORE_NAME, "tick", tick);
  }

  // 根据 deployerAddress 获取 IDCoin 列表
  async getByDeployerAddress(deployerAddress: string): Promise<IDCoin[]> {
    const db = await this.init();
    const index = db.transaction(STORE_NAME).store.index("deployerAddress");
    const results: IDCoin[] = [];

    for await (const cursor of index.iterate(deployerAddress)) {
      results.push(cursor.value);
    }

    return results;
  }

  // 根据tick的首字母获取 IDCoin 列表
  async getByTickPrefix(prefix: string): Promise<IDCoin[]> {
    const db = await this.init();
    const index = db.transaction(STORE_NAME).store.index("tick");
    const results: IDCoin[] = [];

    for await (const cursor of index.iterate()) {
      if (cursor.key.toUpperCase().startsWith(prefix)) {
        results.push(cursor.value);
      }
    }

    return results;
  }

  // 清空数据库
  async clear() {
    const db = await this.init();
    await db.clear(STORE_NAME);
  }
}

export const idCoinStore = new IDCoinStore();
export default idCoinStore;

