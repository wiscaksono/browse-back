import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { weeklyHistoryStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import type { WeeklyHistoryType } from '@extension/storage/lib/base';

type TimeSpentResult = {
  domainName: string;
  websiteName: string;
  timeSpent: number;
};

const humanizeDuration = (ms: number): string => {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (day > 0) return `${day} day${day > 1 ? 's' : ''} ${hr % 24}h`;
  if (hr > 0) return `${hr} hour${hr > 1 ? 's' : ''} ${min % 60}m`;
  if (min > 0) return `${min} min${min > 1 ? 's' : ''} ${sec % 60}s`;
  return `${sec} sec${sec !== 1 ? 's' : ''}`;
};

const estimateTimeSpent = (entries: WeeklyHistoryType[], maxSessionGapMinutes = 30): TimeSpentResult[] => {
  const getDomainName = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getWebsiteName = (url: string): string => {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      const parts = hostname.split('.');
      if (parts.length > 2) return parts[parts.length - 2];
      if (parts.length === 2) return parts[0];
      return hostname;
    } catch {
      return url;
    }
  };

  const filtered = entries
    .filter(e => e.url && typeof e.lastVisitTime === 'number')
    .sort((a, b) => a.lastVisitTime! - b.lastVisitTime!);
  const maxGap = maxSessionGapMinutes * 60 * 1000;
  const timeMap: Record<string, TimeSpentResult> = {};

  for (let i = 0; i < filtered.length; i++) {
    const current = filtered[i];
    const next = filtered[i + 1];
    let duration = maxGap;
    if (next && typeof next.lastVisitTime === 'number' && typeof current.lastVisitTime === 'number') {
      const gap = next.lastVisitTime! - current.lastVisitTime!;
      duration = Math.min(gap, maxGap);
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

const Popup = () => {
  const histories = useStorage(weeklyHistoryStorage);

  return (
    <div className="bg-slate-50">
      <header className="text-gray-900">
        <h2>Weekly Self-Reflection Report</h2>
        <p>Estimated time spent on each website</p>
        <ul>
          {estimateTimeSpent(histories).map(item => (
            <li key={item.domainName}>
              <a href={`https://${item.domainName}`} target="_blank" rel="noopener noreferrer">
                {item.websiteName}
              </a>
              <span>{humanizeDuration(item.timeSpent)}</span>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
