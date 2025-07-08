import { createStorage, StorageEnum } from '../base/index.js';
import type { WeeklyHistoryStorageType } from '../base/index.js';
import type { WeeklyHistoryType } from '../base/types.js';

const storage = createStorage<WeeklyHistoryType[]>('weekly-history-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const weeklyHistoryStorage: WeeklyHistoryStorageType = {
  ...storage,
};
