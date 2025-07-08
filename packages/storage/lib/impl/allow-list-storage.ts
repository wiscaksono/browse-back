import { createStorage, StorageEnum } from '../base/index.js';

// Storing an array of domain strings: ["github.com", "figma.com"]
const storage = createStorage<string[]>('allow-list-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const allowListStorage = { ...storage };
