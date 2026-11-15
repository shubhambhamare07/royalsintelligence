import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { dataLoader } from '../lib/data/loaders';

export const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        await dataLoader.initializeApp();
      } catch (err: any) {
        console.error('Data initialization background error:', err);
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

  // Immediate rendering of the application dashboard without artificial splash screen delay
  return <RouterProvider router={router} />;
};

export default App;

