import type { ExcludeValuesFromBaseArrayType, TimeSpentResult } from './types.js';

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

export const excludeValuesFromBaseArray = <B extends string[], E extends (string | number)[]>(
  baseArray: B,
  excludeArray: E,
) => baseArray.filter(value => !excludeArray.includes(value)) as ExcludeValuesFromBaseArrayType<B, E>;

export const sleep = async (time: number) => new Promise(r => setTimeout(r, time));

export const humanizeDuration = (ms: number): string => {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day > 0) return `${day}d ${hr % 24}h`;
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
};

/**
 * Extracts a human-friendly website name from a URL.
 * It prioritizes the most specific, non-'www' part of the domain.
 *
 * @example
 * getWebsiteName('https://gemini.google.com/app') -> 'gemini'
 * getWebsiteName('https://www.google.com/search') -> 'google'
 * getWebsiteName('https://news.ycombinator.com') -> 'news'
 * getWebsiteName('https://github.com') -> 'github'
 */
export const getWebsiteName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const parts = hostname.split('.');

    // For domains like 'gemini.google.com' (3+ parts), the first part is the most specific name.
    // For domains like 'google.com' (2 parts), the first part is the name.
    if (parts.length > 1) return parts[0];

    // Fallback for single-word hostnames (e.g., 'localhost') or invalid cases.
    return hostname;
  } catch (error) {
    console.error(`Could not parse URL for website name: ${url}`, error);
    return url;
  }
};

export const getDomainName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;

    // Check if the hostname starts with 'www.' and remove it if it does
    if (hostname.startsWith('www.')) return hostname.slice(4);

    // Otherwise, return the full hostname (including other subdomains)
    return hostname;
  } catch (error) {
    // If the URL is invalid, return the original string as a fallback
    console.error(`Could not parse URL: ${url}`, error);
    return url;
  }
};

export const estimateTimeSpent = (entries: WeeklyHistoryType[], maxSessionGapMinutes = 30): TimeSpentResult[] => {
  const filtered = entries
    .filter(e => e.url && typeof e.lastVisitTime === 'number')
    .sort((a, b) => a.lastVisitTime! - b.lastVisitTime!);

  const maxGap = maxSessionGapMinutes * 60 * 1000;
  // A more reasonable default duration for a single visit
  const defaultSingleVisitDuration = 2 * 60 * 1000; // 2 minutes
  const timeMap: Record<string, TimeSpentResult> = {};

  if (filtered.length === 0) return [];

  for (let i = 0; i < filtered.length; i++) {
    const current = filtered[i];
    const next = filtered[i + 1];
    let duration;

    if (next && typeof next.lastVisitTime === 'number' && typeof current.lastVisitTime === 'number') {
      const gap = next.lastVisitTime - current.lastVisitTime;
      duration = Math.min(gap, maxGap);
    } else {
      // For the very last item, assign a default duration instead of the max gap.
      duration = defaultSingleVisitDuration;
    }

    const domainName = getDomainName(current.url!);
    const websiteName = getWebsiteName(current.url!);

    if (!timeMap[domainName]) {
      timeMap[domainName] = { domainName, websiteName, timeSpent: 0 };
    }
    timeMap[domainName].timeSpent += duration;
  }

  return Object.values(timeMap).sort((a, b) => b.timeSpent - a.timeSpent);
};
