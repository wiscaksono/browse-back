import { humanizeDuration } from '@extension/shared';
import type { TimeSpentResult } from '@extension/shared';

export const ListItem = ({ item, roast }: { item: TimeSpentResult; roast: string }) => (
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
    {!roast ? (
      <div className="h-4 w-full animate-pulse rounded bg-slate-200"></div>
    ) : (
      <p className="text-xs text-slate-600">{roast}</p>
    )}
  </li>
);
