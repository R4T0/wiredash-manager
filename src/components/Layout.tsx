
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';
import Footer from './Footer';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-wireguard-dark">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800/50 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-gray-400 hover:text-white" />
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-medium">{currentUser?.name}</span>
                  <span className="text-gray-400 text-sm">({currentUser?.email})</span>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 p-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
