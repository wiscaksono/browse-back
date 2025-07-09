import { humanizeDuration, useStorage } from '@extension/shared';
import { allowListStorage } from '@extension/storage';
import { Timer, X } from 'lucide-react';
import { useRef } from 'react';
import type { TimeSpentResult } from '@extension/shared';
import type { Goal } from '@extension/storage/lib/base';

interface ListItemProps {
  item: TimeSpentResult;
  goal?: Goal;
  timeRangeDays: number;
  onSetGoal: (domain: string, limit: number) => void;
}

export const ListItem = ({ item, goal, timeRangeDays, onSetGoal }: ListItemProps) => {
  const progress = goal ? (item.timeSpent / (goal.limit * timeRangeDays)) * 100 : 0;
  const allowList = useStorage(allowListStorage);
  const handleIgnore = () => allowListStorage.set([...allowList, item.domainName.trim()]);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const periodLabel = timeRangeDays === 1 ? 'Daily' : `Limit for ${timeRangeDays} days`;

  const handleOpen = () => {
    if (!dialogRef.current) return;
    dialogRef.current.showModal(); // Open as a modal dialog
  };

  const handleClose = () => {
    if (!dialogRef.current) return;
    dialogRef.current.close();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dialogRef.current) return;
    const formData = new FormData(e.currentTarget);
    const limit = Number(formData.get('limit'));
    onSetGoal(item.domainName, limit);
    handleClose();
  };

  return (
    <li key={item.domainName} className="flex flex-col gap-0.5 rounded-md border bg-white p-2">
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="fixed left-[25px] top-1/2 m-0 w-[300px] -translate-y-1/2 space-y-2 rounded-md p-3.5">
        <div>
          <h2 className="text-base font-bold text-[#3E3E3E]">Set {periodLabel} Limit</h2>
          <p className="text-slate-600">Set a daily time limit (hours). Enter 0 to remove.</p>
        </div>
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <input
            type="number"
            name="limit"
            min={0}
            max={24}
            defaultValue={goal?.limit ? (goal.limit * timeRangeDays) / 60 / 60 / 1000 : undefined}
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="e.g., 8"
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <div className="flex items-center gap-1">
            <button
              type="reset"
              onClick={handleClose}
              className="rounded-md border border-slate-300 bg-slate-200 p-2 font-medium text-slate-700 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-slate-300 bg-slate-400 p-2 font-medium text-slate-50 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500">
              Save
            </button>
          </div>
        </form>
      </dialog>
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
              className="grid size-[18px] place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-200"
              title="Click here so won't be tracked or appear in your report.">
              <X size={16} />
            </button>
            <button
              onClick={handleOpen}
              className="grid size-[18px] place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-200"
              title="Set time limit goal">
              <Timer size={14} />
            </button>
          </div>
        </div>
      </div>
      {goal && (
        <div className="mt-1.5 border-t pt-1.5">
          <div className="mb-0.5 flex justify-between text-xs text-slate-500">
            <span>{periodLabel} Goal</span>
            {progress > 100 ? (
              <span className="font-medium text-red-500">You've exceeded your goal!</span>
            ) : (
              <span>
                {humanizeDuration(goal.limit * timeRangeDays)} Goal •{' '}
                {humanizeDuration(goal.limit * timeRangeDays - item.timeSpent)} left
              </span>
            )}
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
