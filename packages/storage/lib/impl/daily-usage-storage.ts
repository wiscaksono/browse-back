import { createStorage, StorageEnum } from '../base/index.js';
import type { DailyUsage, DailyUsageStorageType } from '../base/index.js';

// Storing a simple object: { "domain.com": 120000, "another.com": 60000 }
const storage = createStorage<DailyUsage>(
  'daily-usage-key',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const dailyUsageStorage: DailyUsageStorageType = {
  ...storage,
};
