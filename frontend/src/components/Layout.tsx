import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] ai-aurora-glow flex antialiased selection:bg-[#0071E3] selection:text-white">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
