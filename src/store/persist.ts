import { get, set, del } from "idb-keyval";
import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * zustand's `persist` middleware defaults to localStorage. That's fine for a
 * counter app; here the persisted slice (subjects/tasks/events/error metadata/
 * logs) can grow into the hundreds of records over a school year, and we don't
 * want it fighting the 5-10MB localStorage quota that screenshots/audio already
 * share in spirit (even though blobs themselves live in a separate IndexedDB
 * store, see lib/blobStore.ts). IndexedDB via idb-keyval gives async, larger,
 * non-blocking storage for the same persist() API shape.
 */
export function idbStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      const value = await get<StorageValue<T>>(name);
      return value ?? null;
    },
    setItem: async (name, value) => {
      await set(name, value);
    },
    removeItem: async (name) => {
      await del(name);
    },
  };
}
