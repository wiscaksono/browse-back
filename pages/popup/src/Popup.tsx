import { ListItem } from './components/list-item';
import { useStorage, withErrorBoundary, withSuspense, estimateTimeSpent } from '@extension/shared';
import { weeklyHistoryStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useState } from 'react';

const Popup = () => {
  const histories = useStorage(weeklyHistoryStorage);
  const withEstimation = estimateTimeSpent(histories);

  const [roasts, setRoasts] = useState<{ website: string; roast: string }[]>([]);

  useEffect(() => {
    if (!withEstimation.length) return;
    try {
      (async () => {
        const response = await fetch(`https://gemini.wiscaksono.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withEstimation.map(item => ({ website: item.domainName, timeSpent: item.timeSpent }))),
        });
        const result = (await response.json()) as { website: string; roast: string }[];
        setRoasts(result);
      })();
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="bg-slate-50 p-3.5 text-slate-900">
      <header className="mb-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Your Weekly Digital Mirror</h2>
        <p className="text-sm text-slate-600">
          Ready for your weekly roast? Here's where your time <b>really</b> went.
        </p>
      </header>

      <ul className="divide-y divide-slate-200">
        {withEstimation.map(item => (
          <ListItem
            key={item.domainName}
            item={item}
            roast={roasts.find(r => r.website === item.domainName)?.roast ?? ''}
          />
        ))}
      </ul>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
