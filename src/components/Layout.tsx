
import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-wireguard-dark">
      <Sidebar />
      <div className="pl-72">
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
