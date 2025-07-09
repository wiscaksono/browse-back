import { createStorage, StorageEnum } from '../base/index.js';
import type { TimeRangeStorageType } from '../base/index.js';

const storage = createStorage<number>('time-range-key', 1, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const timeRangeStorage: TimeRangeStorageType = {
  ...storage,
};
