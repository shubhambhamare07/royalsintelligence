import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen lg:h-screen flex bg-white font-sans text-slate-900 antialiased selection:bg-[#E60067] selection:text-white">
      {/* Desktop Fixed Sidebar (225px) */}
      <aside className="desktop-sidebar hidden lg:block shrink-0 sticky top-0 h-screen w-[225px] z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[240px] max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 bg-white">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-y-auto">
        <TopNav
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className={`flex-1 w-full flex flex-col ${isHome ? 'bg-white min-h-0' : 'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
          <Outlet />
        </main>
        {!isHome && <Footer />}
      </div>
    </div>
  );
};
