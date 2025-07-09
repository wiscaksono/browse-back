import { estimateTimeSpent, getDomainName, humanizeDuration, useStorage, timeRanges } from '@extension/shared';
import { ignoreListStorage, goalsStorage, timeRangeStorage, weeklyHistoryStorage } from '@extension/storage';
import { ListItem } from '@extension/ui';
import { Table2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { BarChart, Bar, Rectangle, Tooltip } from 'recharts';
import type { TimeSpentResult } from '@extension/shared';
import type { TooltipContentProps } from 'recharts';

const CustomTooltip = ({ active, payload }: TooltipContentProps<string, string>) => {
  const isVisible = active && payload && payload.length;
  const data = payload[0]?.payload as TimeSpentResult;

  if (!isVisible) return null;

  return (
    <div className="space-y-1 rounded-md border bg-white p-2">
      <div className="flex items-center gap-2">
        <img
          src={`https://favicone.com/${data.domainName}?s=24`}
          width={24}
          height={24}
          alt={data.websiteName}
          className="size-6 shrink-0 rounded-full border border-slate-300 object-cover object-center"
          onError={e => (e.currentTarget.src = 'https://placehold.co/400?text=?')}
        />
        <p className="text-sm font-semibold capitalize">{data.websiteName}</p>
      </div>
      <p className="border-t pt-1">Time spent: {humanizeDuration(data.timeSpent)}</p>
    </div>
  );
};

export const HistoryTab = () => {
  const goals = useStorage(goalsStorage);
  const ignoreList = useStorage(ignoreListStorage);
  const histories = useStorage(weeklyHistoryStorage);
  const timeRange = useStorage(timeRangeStorage);

  const filteredHistories = useMemo(() => {
    if (!histories) return [];

    const now = new Date();
    const startTime =
      timeRange === 1
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        : now.getTime() - timeRange * 24 * 60 * 60 * 1000;

    return histories
      .filter(h => h.lastVisitTime && h.lastVisitTime >= startTime)
      .filter(h => h.url && !ignoreList.includes(getDomainName(h.url)));
  }, [histories, timeRange, ignoreList]);

  const withEstimation = useMemo(() => {
    const estimated = estimateTimeSpent(filteredHistories);
    if (timeRange > 1) {
      return estimated.map(item => ({ ...item, timeSpent: item.timeSpent / timeRange }));
    }
    return estimated;
  }, [filteredHistories, timeRange]);

  const handleSetGoal = useCallback(
    (domainName: string, limit: number) => {
      if (limit === 0) {
        const newGoals = goals.filter(g => g.domainName !== domainName);
        goalsStorage.set(newGoals);
        return;
      }

      if (!isNaN(limit)) {
        const dailyLimitInMs = (limit / timeRange) * 60 * 60 * 1000;
        const newGoals = [...goals.filter(g => g.domainName !== domainName), { domainName, limit: dailyLimitInMs }];
        goalsStorage.set(newGoals);
      }
    },
    [goals, timeRange],
  );

  const handleExportToCSV = () => {
    const header = ['Domain', 'Time Spent', 'Goal'];
    const rows = withEstimation.map(item => {
      const goal = goals.find(g => g.domainName === item.domainName);
      return [
        `${item.domainName}`,
        `${humanizeDuration(item.timeSpent)}`,
        `${humanizeDuration(goal?.limit ?? 0)}`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'browse-back-history.csv');
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center gap-2 p-2">
        <select
          id="time-range-select"
          value={timeRange}
          onChange={e => timeRangeStorage.set(Number(e.target.value))}
          className="w-full flex-1 rounded-md border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
          {timeRanges.map(({ label, days }) => (
            <option key={days} value={days}>
              {label}
            </option>
          ))}
        </select>
        <button
          className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-200 p-2 font-medium text-slate-700 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500"
          onClick={handleExportToCSV}>
          <Table2 size={18} />
          Export to CSV
        </button>
      </div>
      {withEstimation.length > 0 ? (
        <>
          <BarChart width={575} height={200} data={withEstimation} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <Tooltip content={CustomTooltip} />
            <Bar dataKey="timeSpent" fill="#3E3E3E" activeBar={<Rectangle fill="#4f4e4e" />} />
          </BarChart>

          <ul className="space-y-2 p-2">
            {withEstimation.map(item => {
              const goal = goals.find(g => g.domainName === item.domainName);
              return (
                <ListItem
                  key={item.domainName}
                  item={item}
                  onSetGoal={handleSetGoal}
                  goal={goal}
                  timeRangeDays={timeRange}
                />
              );
            })}
          </ul>
        </>
      ) : (
        <p className="py-4 text-center text-slate-500">No Browse history for this period.</p>
      )}
    </div>
  );
};
