import { useStorage } from '@extension/shared';
import { allowListStorage } from '@extension/storage';
import { useState } from 'react';

export const AllowListTab = () => {
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
    <div>
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
