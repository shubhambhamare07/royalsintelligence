import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { dataLoader } from '../lib/data/loaders';
import { Skeleton } from '../components/ui/Skeleton';

export const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        await dataLoader.initializeApp();
        setInitialized(true);
      } catch (err: any) {
        console.error('Boot initialization error:', err);
        setError(err.message || 'Failed to initialize application data layer');
      }
    }
    boot();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-rose-200 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg">
            ⚠
          </div>
          <h2 className="text-lg font-bold text-[#14213D]">Data Initialization Conflict</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#14213D] text-white rounded-lg text-xs font-bold hover:bg-slate-800"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#14213D] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <img src="/assets/brand/rr-crest.svg" alt="Loading" className="w-16 h-16 animate-pulse" />
        <div className="text-sm font-extrabold tracking-widest text-[#C6A15B] font-mono">
          INITIALIZING ROYALS INTELLIGENCE ENGINE…
        </div>
        <div className="w-48">
          <Skeleton className="h-1.5 w-full bg-slate-700" />
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

export default App;

