import {
  useStorage,
  withErrorBoundary,
  withSuspense,
  estimateTimeSpent,
  getDomainName,
  timeRanges,
} from '@extension/shared';
import { weeklyHistoryStorage, goalsStorage, timeRangeStorage, ignoreListStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ListItem } from '@extension/ui';
import { Settings } from 'lucide-react';
import { useMemo, useCallback } from 'react';

const Popup = () => {
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

  const optionsUrl = chrome.runtime.getURL('options/index.html');

  return (
    <div className="w-full bg-slate-100">
      <header className="sticky top-0 flex w-full items-center justify-between gap-2 bg-[#3E3E3E] p-3.5">
        <div>
          <h1 className="flex text-4xl font-semibold text-slate-50">
            <svg
              width="27"
              height="40"
              viewBox="0 0 27 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 translate-x-[-2px] translate-y-[-5px]">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 13.6832C0 26.5033 0.00906744 27.363 0.143402 27.3129C0.281804 27.2613 6.81884 23.6644 8.98387 22.4486C10.3968 21.6551 11.0973 21.3216 11.8937 21.0631C15.1 20.0224 18.5945 21.4295 20.0425 24.3443C20.5298 25.3254 20.6922 26.0096 20.6943 27.0907C20.6971 28.5859 20.3213 29.7491 19.4537 30.9299C17.6151 33.4323 14.079 34.2231 10.9686 32.8273C10.3604 32.5545 9.19728 31.8433 8.74164 31.4658L8.5418 31.3002L8.93912 29.5508C9.1577 28.5886 9.35755 27.7146 9.38323 27.6085L9.43001 27.4156L9.14338 27.5598C8.98573 27.6391 7.01259 28.5108 4.75857 29.4967C2.50455 30.4828 0.64116 31.3081 0.617683 31.331C0.594206 31.3538 1.23698 32.3559 2.04612 33.558C2.85526 34.7599 4.16131 36.7079 4.94842 37.8868C5.73552 39.0657 6.39363 40.0165 6.41084 39.9998C6.42804 39.9831 6.61467 39.2134 6.82545 38.2892C7.03632 37.3652 7.22625 36.5611 7.24761 36.5024C7.27473 36.4279 7.43424 36.4931 7.77495 36.7177C8.96251 37.5006 10.7624 38.2122 12.4267 38.5569C13.6386 38.8079 16.0545 38.8279 17.2443 38.5968C19.7874 38.1029 21.7611 37.0916 23.5242 35.3793C25.2808 33.6733 26.2973 31.8131 26.7986 29.3871C27.0698 28.0753 27.0667 25.9632 26.7918 24.7147C26.4316 23.0779 25.905 21.8471 24.9896 20.5027C24.3632 19.5828 22.7778 18.0164 21.9088 17.4588C20.6155 16.6292 19.0764 16.004 17.544 15.6861C16.5207 15.4738 13.4001 15.4717 12.4164 15.6826C11.2263 15.9378 10.0724 16.3359 9.00896 16.8581L7.97471 17.3661L7.94581 11.1421C7.91327 4.12081 7.94979 4.5328 7.22998 3.07336C6.5417 1.67773 5.27082 0.671849 3.66983 0.255421C3.16291 0.123553 2.65795 0.0737526 1.50437 0.0417324L0 0V13.6832Z"
                fill="#F9FAFC"
              />
            </svg>
            rowse Back
          </h1>
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
          value={timeRange}
          onChange={e => timeRangeStorage.set(Number(e.target.value))}
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
                  timeRangeDays={timeRange}
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
