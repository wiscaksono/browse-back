import { estimateTimeSpent, getDomainName, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { allowListStorage, timeRangeStorage, weeklyHistoryStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useMemo, useState } from 'react';

const Options = () => {
  const allowList = useStorage(allowListStorage);
  const histories = useStorage(weeklyHistoryStorage);
  const timeRange = useStorage(timeRangeStorage);
  const [newDomain, setNewDomain] = useState('');

  const handleAdd = () => {
    if (newDomain && !allowList.includes(newDomain)) {
      allowListStorage.set([...allowList, newDomain.trim()]);
      setNewDomain('');
    }
  };

  const handleRemove = (domainToRemove: string) => {
    allowListStorage.set(allowList.filter(d => d !== domainToRemove));
  };

  const filteredHistories = useMemo(() => {
    if (!histories) return [];

    const now = new Date();
    const startTime =
      timeRange === 1
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        : now.getTime() - timeRange * 24 * 60 * 60 * 1000;

    return histories
      .filter(h => h.lastVisitTime && h.lastVisitTime >= startTime)
      .filter(h => h.url && !allowList.includes(getDomainName(h.url)));
  }, [histories, timeRange, allowList]);

  const withEstimation = useMemo(() => {
    const estimated = estimateTimeSpent(filteredHistories);
    if (timeRange > 1) {
      return estimated.map(item => ({ ...item, timeSpent: item.timeSpent / timeRange }));
    }
    return estimated;
  }, [filteredHistories, timeRange]);

  console.log(withEstimation);

  return (
    <div className="container mx-auto">
      <h1>Allow List</h1>
      <p>Sites added here won't be tracked or appear in your report.</p>

      <div>
        <input
          type="text"
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          placeholder="e.g., figma.com"
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <ul>
        {allowList.map(domain => (
          <li key={domain}>
            {domain} <button onClick={() => handleRemove(domain)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
