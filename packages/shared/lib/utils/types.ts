import type { COLORS } from './const.js';
import type { TupleToUnion } from 'type-fest';

export type * from 'type-fest';
export type ColorType = 'success' | 'info' | 'error' | 'warning' | keyof typeof COLORS;
export type ExcludeValuesFromBaseArrayType<B extends string[], E extends (string | number)[]> = Exclude<
  TupleToUnion<B>,
  TupleToUnion<E>
>[];
export type ManifestType = chrome.runtime.ManifestV3;

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

export type TimeSpentResult = {
  domainName: string;
  websiteName: string;
  timeSpent: number;
};
