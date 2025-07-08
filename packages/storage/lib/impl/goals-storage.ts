import { createStorage, StorageEnum } from '../base/index.js';
import type { GoalsStorageType, Goal } from '../base/index.js';

const storage = createStorage<Goal[]>('goals-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const goalsStorage: GoalsStorageType = {
  ...storage,
};
