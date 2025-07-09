import { AllowListTab } from './components/allow-list-tab';
import { HistoryTab } from './components/history-tab';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Options = () => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <main>
      <header className="bg-[#3E3E3E]">
        <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center gap-2 py-10">
          <h1 className="text-4xl font-semibold text-slate-50">Browse Back</h1>
          <p className="text-center text-base font-medium text-slate-300">
            Get a weekly snapshot of your browsing habits—see exactly where your time goes, spot trends in your online
            activity, and gain fresh insights into your digital life. Take a moment to reflect, make small tweaks, and
            enjoy a smarter, more intentional way to surf!
          </p>
        </div>
      </header>

      <div className="border-b border-[#3E3E3E]">
        <div className="container mx-auto flex w-full max-w-2xl">
          <nav className="grid h-10 w-full grid-cols-2 divide-x divide-[#3E3E3E]">
            <button className="h-full w-full text-lg font-semibold" onClick={() => setActiveTab('history')}>
              History
            </button>
            <button className="h-full w-full text-lg font-semibold" onClick={() => setActiveTab('allow-list')}>
              Allow List
            </button>
          </nav>
        </div>
      </div>

      <section className="container mx-auto max-w-xl border-x border-[#3E3E3E]">
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'allow-list' && <AllowListTab />}
      </section>
    </main>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
