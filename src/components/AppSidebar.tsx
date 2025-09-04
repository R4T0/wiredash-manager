import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Network, QrCode, Plus } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
const navigation = [{
  name: 'Dashboard',
  href: '/',
  icon: LayoutDashboard
}, {
  name: 'Peers',
  href: '/peers',
  icon: Users
}, {
  name: 'Interfaces',
  href: '/interfaces',
  icon: Network
}, {
  name: 'Download',
  href: '/generate',
  icon: QrCode
}, {
  name: 'Automação',
  href: '/qrcode',
  icon: Plus
}, {
  name: 'Configurações',
  href: '/settings',
  icon: Settings
}];
const AppSidebar = () => {
  const {
    state
  } = useSidebar();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'testing'>('offline');
  const [routerType, setRouterType] = useState('Firewall');

  // Helper function to get the correct backend URL
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5000`;
  };

  // Testar conexão usando a configuração salva na API
  const testConnection = async (config: any) => {
    const backendUrl = getBackendUrl();
    const requestBody = {
      routerType: config.routerType,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.useHttps
    };
    try {
      const response = await fetch(`${backendUrl}/api/router/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000)
      });
      const responseData = await response.json();
      return responseData.success && responseData.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  // Verificar status da conexão baseado na configuração salva na API
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        // Carrega configuração da API (não localStorage)
        const response = await fetch(`${getBackendUrl()}/api/config/router`);
        const configData = await response.json();
        
        if (configData.success && configData.data) {
          const config = configData.data;
          if (config.endpoint && config.user && config.password) {
            setConnectionStatus('testing');

            // Mapear tipos de router para nomes mais genéricos
            const routerTypeMap: Record<string, string> = {
              'mikrotik': 'Mikrotik',
              'opnsense': 'OPNsense',
              'pfsense': 'pfSense'
            };
            setRouterType(routerTypeMap[config.router_type] || 'Firewall');

            // Testar conexão
            const configForTest = {
              routerType: config.router_type,
              endpoint: config.endpoint,
              port: config.port,
              user: config.user,
              password: config.password,
              useHttps: config.use_https
            };
            const isConnected = await testConnection(configForTest);
            setConnectionStatus(isConnected ? 'online' : 'offline');
          } else {
            setConnectionStatus('offline');
          }
        } else {
          setConnectionStatus('offline');
        }
      } catch (error) {
        console.error('Failed to check router config:', error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnectionStatus();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  const isCollapsed = state === 'collapsed';
  return <Sidebar className="border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/lovable-uploads/1e764844-64df-42f2-97ca-e0de115317be.png" alt="WireDash Logo" className="w-10 h-10 object-contain" />
            </div>
            {!isCollapsed && <div>
                <h1 className="text-xl font-bold text-white">WireDash</h1>
                <p className="text-xs text-gray-400">Manager v1.0.1</p>
              </div>}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 px-4 py-2">
            {!isCollapsed && 'Navegação'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-4 space-y-2">
              {navigation.map(item => <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.href} className={({
                  isActive
                }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-green-500/15' : 'text-gray-300 hover:text-white hover:bg-green-500/10'}`}>
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {!isCollapsed && item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800">
        <div className="p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2">
              <div className={`status-indicator ${connectionStatus === 'online' ? 'status-online' : connectionStatus === 'testing' ? 'status-testing' : 'status-offline'}`}></div>
              {!isCollapsed && <span className="text-sm text-gray-400">API {routerType}</span>}
            </div>
            {!isCollapsed && <span className={`text-xs font-medium ${connectionStatus === 'online' ? 'text-green-400' : connectionStatus === 'testing' ? 'text-yellow-400' : 'text-red-400'}`}>
                {connectionStatus === 'online' ? 'Online' : connectionStatus === 'testing' ? 'Testando...' : 'Offline'}
              </span>}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>;
};
export default AppSidebar;
