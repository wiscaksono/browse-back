import { useStorage } from '@extension/shared';
import { ignoreListStorage } from '@extension/storage';

export const IgnoreListTab = () => {
  const ignoreList = useStorage(ignoreListStorage);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDomain = String(formData.get('newDomain'));
    if (!ignoreList.includes(newDomain)) ignoreListStorage.set([...ignoreList, newDomain.trim()]);
  };

  const handleRemove = (domainToRemove: string) => ignoreListStorage.set(ignoreList.filter(d => d !== domainToRemove));

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
        <input
          className="w-full flex-1 rounded-md border border-slate-300 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          type="text"
          name="newDomain"
          pattern="^(?!(http|https)://)([a-zA-Z0-9]+\.[a-zA-Z0-9]+)$"
          placeholder="e.g., figma.com"
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-200 p-2 font-medium text-slate-700 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500">
          Ignore
        </button>
      </form>

      {ignoreList.length > 0 ? (
        <ul className="space-y-2 p-2 pt-0">
          {ignoreList.map(domain => (
            <li key={domain} className="flex items-center gap-2 rounded-md border bg-white p-2">
              <div className="flex flex-1 items-center gap-2">
                <img
                  src={`https://favicone.com/${domain}?s=24`}
                  width={36}
                  height={36}
                  alt={domain}
                  className="size-9 shrink-0 rounded-full border border-slate-300 object-cover object-center"
                  onError={e => (e.currentTarget.src = 'https://placehold.co/400?text=?')}
                />
                <p className="truncate font-semibold">{domain}</p>
              </div>
              <button
                onClick={() => handleRemove(domain)}
                className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-200 p-2 font-medium text-slate-700 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500">
                Un-ignore
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-slate-500">No domains are ignored.</p>
      )}
    </div>
  );
};
