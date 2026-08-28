import { createStore, get, set, del } from "idb-keyval";
import { makeId } from "./id";

/**
 * Screenshots and voice notes are real Blobs, often several hundred KB to a few MB.
 * Keeping them in localStorage (base64, ~5-10MB total quota) or inside the zustand
 * persisted JSON blob would be slow to serialize and would blow the quota fast.
 * They live in their own IndexedDB object store, referenced by id from the
 * lightweight app state (subjects/tasks/events/error metadata).
 */
const blobDb = createStore("starts-blobs-db", "blobs");

export async function putBlob(blob: Blob): Promise<string> {
  const id = makeId();
  await set(id, blob, blobDb);
  return id;
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return get<Blob>(id, blobDb);
}

export async function deleteBlob(id: string): Promise<void> {
  await del(id, blobDb);
}

/** Cache of object URLs so components don't re-create a new URL (and leak it) on every render. */
const urlCache = new Map<string, string>();

export async function getBlobUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getBlob(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export function revokeBlobUrl(id: string) {
  const cached = urlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(id);
  }
}
