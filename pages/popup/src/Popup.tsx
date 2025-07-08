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

  if (day > 0) return `${day}d ${hr % 24}h`;
  if (hr > 0) return `${hr}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
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
    <div className="bg-slate-50 p-2 text-slate-900">
      <header className="mb-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your Weekly Digital Mirror</h2>
        <p className="text-sm text-slate-600">
          Ready for your weekly roast? Here's where your time <b>really</b> went.
        </p>
      </header>

      <ul className="divide-y divide-slate-200">
        {estimateTimeSpent(histories).map(item => (
          <li key={item.domainName} className="flex flex-col gap-0.5 py-1.5">
            <div className="flex items-center gap-2">
              <img
                src={`https://favicone.com/${item.domainName}?s=24`}
                width={24}
                height={24}
                alt={item.websiteName}
                className="size-6 shrink-0 rounded-full border border-slate-300 object-cover object-center"
                onError={e => (e.currentTarget.src = 'https://placehold.co/400?text=?')}
              />
              <a
                href={`https://${item.domainName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate font-semibold capitalize underline-offset-2 hover:underline">
                {item.websiteName}
              </a>
              <span className="ml-auto shrink-0 text-slate-600">{humanizeDuration(item.timeSpent)}</span>
            </div>
            <p className="text-xs text-slate-600">Three hours deep in Reddit rabbit holes. Did you find Wonderland?</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
