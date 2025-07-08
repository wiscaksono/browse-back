import type { StorageEnum } from './index.js';

export type ValueOrUpdateType<D> = D | ((prev: D) => Promise<D> | D);

export type BaseStorageType<D> = {
  get: () => Promise<D>;
  set: (value: ValueOrUpdateType<D>) => Promise<void>;
  getSnapshot: () => D | null;
  subscribe: (listener: () => void) => () => void;
};

export type StorageConfigType<D = string> = {
  /**
   * Assign the {@link StorageEnum} to use.
   * @default Local
   */
  storageEnum?: StorageEnum;
  /**
   * Only for {@link StorageEnum.Session}: Grant Content scripts access to storage area?
   * @default false
   */
  sessionAccessForContentScripts?: boolean;
  /**
   * Keeps state live in sync between all instances of the extension. Like between popup, side panel and content scripts.
   * To allow chrome background scripts to stay in sync as well, use {@link StorageEnum.Session} storage area with
   * {@link StorageConfigType.sessionAccessForContentScripts} potentially also set to true.
   * @see https://stackoverflow.com/a/75637138/2763239
   * @default false
   */
  liveUpdate?: boolean;
  /**
   * An optional props for converting values from storage and into it.
   * @default undefined
   */
  serialization?: {
    /**
     * convert non-native values to string to be saved in storage
     */
    serialize: (value: D) => string;
    /**
     * convert string value from storage to non-native values
     */
    deserialize: (text: string) => D;
  };
};

export interface ThemeStateType {
  theme: 'light' | 'dark';
  isLight: boolean;
}

export type ThemeStorageType = BaseStorageType<ThemeStateType> & {
  toggle: () => Promise<void>;
};

export interface WeeklyHistoryType {
  /** Optional. The number of times the user has navigated to this page by typing in the address. */
  typedCount?: number | undefined;
  /** Optional. The title of the page when it was last loaded. */
  title?: string | undefined;
  /** Optional. The URL navigated to by a user. */
  url?: string | undefined;
  /** Optional. When this page was last loaded, represented in milliseconds since the epoch. */
  lastVisitTime?: number | undefined;
  /** Optional. The number of times the user has navigated to this page. */
  visitCount?: number | undefined;
  /** The unique identifier for the item. */
  id: string;
}

export type WeeklyHistoryStorageType = BaseStorageType<WeeklyHistoryType[]>;

export interface Goal {
  domainName: string;
  limit: number;
}

export type GoalsStorageType = BaseStorageType<Goal[]>;

export type DailyUsage = Record<string, number>; // domainName: timeSpentInMs
export type DailyUsageStorageType = BaseStorageType<DailyUsage>;

export type NotificationLog = Record<string, number>; // domainName: timestamp
export type NotificationLogStorageType = BaseStorageType<NotificationLog>;
