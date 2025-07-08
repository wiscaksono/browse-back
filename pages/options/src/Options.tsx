import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { allowListStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Options = () => {
  const allowList = useStorage(allowListStorage);
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
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
