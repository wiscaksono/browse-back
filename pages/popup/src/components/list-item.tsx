import { humanizeDuration, useStorage } from '@extension/shared';
import { allowListStorage } from '@extension/storage';
import type { TimeSpentResult } from '@extension/shared';
import type { Goal } from '@extension/storage/lib/base';

interface ListItemProps {
  item: TimeSpentResult;
  goal?: Goal;
  onSetGoal: (domain: string) => void;
}

export const ListItem = ({ item, goal, onSetGoal }: ListItemProps) => {
  const progress = goal ? (item.timeSpent / goal.limit) * 100 : 0;
  const allowList = useStorage(allowListStorage);
  const handleIgnore = () => allowListStorage.set([...allowList, item.domainName.trim()]);

  return (
    <li key={item.domainName} className="flex flex-col gap-0.5 py-1.5">
      <div className="flex items-center gap-2">
        <img
          src={`https://favicone.com/${item.domainName}?s=24`}
          width={36}
          height={36}
          alt={item.websiteName}
          className="size-9 shrink-0 rounded-full border border-slate-300 object-cover object-center"
          onError={e => (e.currentTarget.src = 'https://placehold.co/400?text=?')}
        />
        <div className="flex-1 truncate">
          <p className="font-semibold capitalize">{item.websiteName}</p>
          <a
            className="text-xs text-slate-500 underline-offset-2 hover:underline"
            href={`https://${item.domainName}`}
            target="_blank"
            rel="noopener noreferrer">
            {item.domainName}
          </a>
        </div>
        <div className="flex flex-col items-end">
          <p className="ml-auto shrink-0 text-slate-600">{humanizeDuration(item.timeSpent)}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={handleIgnore}
              className="size-[18px] rounded-full transition-colors hover:bg-slate-200"
              title="Click here so won't be tracked or appear in your report.">
              ✖️
            </button>
            <button
              onClick={() => onSetGoal(item.domainName)}
              className="size-[18px] rounded-full transition-colors hover:bg-slate-200"
              title="Set time limit goal">
              ⏱️
            </button>
          </div>
        </div>
      </div>
      {goal && (
        <div className="mt-1.5">
          <div className="mb-0.5 flex justify-between text-xs text-slate-500">
            <span>Daily Goal</span>
            <span>{humanizeDuration(goal.limit)}</span>
          </div>
          <progress
            className={`h-1.5 w-full rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full ${progress > 100 ? '[&::-webkit-progress-value]:bg-red-500' : '[&::-webkit-progress-value]:bg-slate-700'}`}
            value={progress}
            max="100"
          />
        </div>
      )}
    </li>
  );
};
