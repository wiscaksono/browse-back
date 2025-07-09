import { ListItem } from './components/list-item';
import { useStorage, withErrorBoundary, withSuspense, estimateTimeSpent, getDomainName } from '@extension/shared';
import { weeklyHistoryStorage, goalsStorage, allowListStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Settings } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

const timeRanges = [
  { label: 'Today', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '5 Days', days: 5 },
  { label: '7 Days', days: 7 },
] as const;

const Popup = () => {
  const goals = useStorage(goalsStorage);
  const allowList = useStorage(allowListStorage);
  const histories = useStorage(weeklyHistoryStorage);

  const [timeRangeDays, setTimeRangeDays] = useState(1);

  const filteredHistories = useMemo(() => {
    if (!histories) return [];

    const now = new Date();
    const startTime =
      timeRangeDays === 1
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        : now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000;

    return histories
      .filter(h => h.lastVisitTime && h.lastVisitTime >= startTime)
      .filter(h => h.url && !allowList.includes(getDomainName(h.url)));
  }, [histories, timeRangeDays, allowList]);

  const withEstimation = useMemo(() => {
    const estimated = estimateTimeSpent(filteredHistories);
    if (timeRangeDays > 1) {
      return estimated.map(item => ({
        ...item,
        timeSpent: item.timeSpent / timeRangeDays,
      }));
    }
    return estimated;
  }, [filteredHistories, timeRangeDays]);

  const handleSetGoal = useCallback(
    (domainName: string, limit: number) => {
      if (limit === 0) {
        const newGoals = goals.filter(g => g.domainName !== domainName);
        goalsStorage.set(newGoals);
        return;
      }

      if (!isNaN(limit)) {
        const dailyLimitInMs = (limit / timeRangeDays) * 60 * 60 * 1000;
        const newGoals = [...goals.filter(g => g.domainName !== domainName), { domainName, limit: dailyLimitInMs }];
        goalsStorage.set(newGoals);
      }
    },
    [goals, timeRangeDays],
  );

  const optionsUrl = chrome.runtime.getURL('options/index.html');

  return (
    <div className="w-full bg-slate-100">
      <header className="sticky top-0 flex w-full items-center justify-between gap-2 bg-[#3E3E3E] p-3.5">
        <div>
          <h2 className="text-xl font-bold text-slate-50">Browse Back</h2>
          <p className="text-slate-200">
            Here's where your time <b>really</b> went.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <a
            className="text-slate-50"
            href={optionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Settings">
            <Settings size={18} />
          </a>
        </div>
      </header>
      <section className="p-3.5 text-slate-900">
        <select
          id="time-range-select"
          value={timeRangeDays}
          onChange={e => setTimeRangeDays(Number(e.target.value))}
          className="mb-4 w-full flex-1 rounded-md border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
          {timeRanges.map(({ label, days }) => (
            <option key={days} value={days}>
              {label}
            </option>
          ))}
        </select>
        <ul className="space-y-2">
          {withEstimation.length > 0 ? (
            withEstimation.map(item => {
              const goal = goals.find(g => g.domainName === item.domainName);
              return (
                <ListItem
                  key={item.domainName}
                  item={item}
                  onSetGoal={handleSetGoal}
                  goal={goal}
                  timeRangeDays={timeRangeDays}
                />
              );
            })
          ) : (
            <p className="py-4 text-center text-slate-500">No Browse history for this period.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
