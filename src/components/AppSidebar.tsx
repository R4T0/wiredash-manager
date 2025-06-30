
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Network, QrCode, Plus, Shield } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Peers',
    href: '/peers',
    icon: Users,
  },
  {
    name: 'Interfaces',
    href: '/interfaces',
    icon: Network,
  },
  {
    name: 'Gerar Config',
    href: '/generate',
    icon: Plus,
  },
  {
    name: 'QR Code',
    href: '/qrcode',
    icon: QrCode,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  const [routerType, setRouterType] = useState('Firewall');

  // Verificar status da conexão baseado na configuração salva
  useEffect(() => {
    const checkConnectionStatus = () => {
      try {
        const savedConfig = localStorage.getItem('routerConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          if (config.endpoint && config.user && config.password) {
            setConnectionStatus('online');
            // Mapear tipos de router para nomes mais genéricos
            const routerTypeMap: Record<string, string> = {
              'mikrotik': 'Mikrotik',
              'opnsense': 'OPNsense',
              'pfsense': 'pfSense'
            };
            setRouterType(routerTypeMap[config.routerType] || 'Firewall');
          } else {
            setConnectionStatus('offline');
          }
        } else {
          setConnectionStatus('offline');
        }
      } catch (error) {
        setConnectionStatus('offline');
      }
    };

    checkConnectionStatus();
    
    // Verificar a cada 5 segundos se a configuração mudou
    const interval = setInterval(checkConnectionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">WireGuard</h1>
                <p className="text-xs text-gray-400">Manager Pro</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="text-gray-400 hover:text-white" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 px-4 py-2">
            {!isCollapsed && 'Navegação'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-2">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-green-500/15'
                            : 'text-gray-300 hover:text-white hover:bg-green-500/10'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isCollapsed && item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800">
        <div className="p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2">
              <div className={`status-indicator ${connectionStatus === 'online' ? 'status-online' : 'status-offline'}`}></div>
              {!isCollapsed && (
                <span className="text-sm text-gray-400">API {routerType}</span>
              )}
            </div>
            {!isCollapsed && (
              <span className={`text-xs font-medium ${connectionStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
