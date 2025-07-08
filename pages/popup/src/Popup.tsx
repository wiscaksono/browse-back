import { ListItem } from './components/list-item';
import { useStorage, withErrorBoundary, withSuspense, estimateTimeSpent } from '@extension/shared';
import { weeklyHistoryStorage, goalsStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState, useMemo } from 'react';

const timeRanges = [
  { label: 'Today', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '5 Days', days: 5 },
  { label: '7 Days', days: 7 },
] as const;

const Popup = () => {
  const goals = useStorage(goalsStorage);
  const histories = useStorage(weeklyHistoryStorage);

  const [timeRangeDays, setTimeRangeDays] = useState(7); // Default to 7 days

  const filteredHistories = useMemo(() => {
    if (!histories) return [];

    const now = new Date();
    const startTime =
      timeRangeDays === 1
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        : now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000;

    return histories.filter(h => h.lastVisitTime && h.lastVisitTime >= startTime);
  }, [histories, timeRangeDays]);

  const withEstimation = useMemo(() => estimateTimeSpent(filteredHistories), [filteredHistories]);

  const handleSetGoal = (domainName: string) => {
    const hours = prompt(`Set a daily time limit for ${domainName} (in hours):`);
    if (hours && !isNaN(parseFloat(hours))) {
      const limitInMs = parseFloat(hours) * 60 * 60 * 1000;

      // Update the goals storage
      const newGoals = [...goals.filter(g => g.domainName !== domainName), { domainName, limit: limitInMs }];
      goalsStorage.set(newGoals);
    }
  };

  return (
    <div className="w-full bg-slate-50 p-3.5 text-slate-900">
      <header className="mb-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your Digital Mirror</h2>
        <p className="text-sm text-slate-600">
          Here's where your time <b>really</b> went.
        </p>
      </header>

      <select
        id="time-range-select"
        value={timeRangeDays}
        onChange={e => setTimeRangeDays(Number(e.target.value))}
        className="mb-4 w-full rounded-md border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
        {timeRanges.map(({ label, days }) => (
          <option key={days} value={days}>
            {label}
          </option>
        ))}
      </select>

      <ul className="divide-y divide-slate-200">
        {withEstimation.length > 0 ? (
          withEstimation.map(item => {
            const goal = goals.find(g => g.domainName === item.domainName);
            return <ListItem key={item.domainName} item={item} onSetGoal={handleSetGoal} goal={goal} />;
          })
        ) : (
          <p className="py-4 text-center text-slate-500">No Browse history for this period.</p>
        )}
      </ul>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
