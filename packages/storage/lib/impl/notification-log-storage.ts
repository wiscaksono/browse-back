import { createStorage, StorageEnum } from '../base/index.js';
import type { NotificationLog, NotificationLogStorageType } from '../base/index.js';

// Storing: { "domain.com": 1672531200000 }
const storage = createStorage<NotificationLog>(
  'notification-log-key',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const notificationLogStorage: NotificationLogStorageType = {
  ...storage,
};
