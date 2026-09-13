type KvValue = unknown;
type KvFallback = {
  get: (key: string) => Promise<KvValue | null>;
  set: (key: string, value: KvValue) => Promise<void>;
  delete: (key: string) => Promise<{ deleted: boolean }>;
  list: (prefix: string) => Promise<{ data: Array<{ key: string; value: KvValue }>; total: number }>;
};

type GenmbWithOptionalKv = { genmb?: { kv?: KvFallback } };

const storageKey = (key: string) => `orion:kv-fallback:${key}`;

function parseStoredValue(raw: string | null): KvValue | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as KvValue;
  } catch {
    return null;
  }
}

function createFallback(): KvFallback {
  return {
    async get(key) {
      return parseStoredValue(window.localStorage.getItem(storageKey(key)));
    },
    async set(key, value) {
      window.localStorage.setItem(storageKey(key), JSON.stringify(value));
    },
    async delete(key) {
      const itemKey = storageKey(key);
      const deleted = window.localStorage.getItem(itemKey) !== null;
      window.localStorage.removeItem(itemKey);
      return { deleted };
    },
    async list(prefix) {
      const data: Array<{ key: string; value: KvValue }> = [];
      const storedPrefix = storageKey(prefix);
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (!key?.startsWith(storedPrefix)) continue;
        const value = parseStoredValue(window.localStorage.getItem(key));
        if (value !== null) data.push({ key: key.slice("orion:kv-fallback:".length), value });
      }
      return { data, total: data.length };
    },
  };
}

const platform = window as unknown as GenmbWithOptionalKv;
if (platform.genmb && !platform.genmb.kv) platform.genmb.kv = createFallback();
