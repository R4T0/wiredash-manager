
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Network, QrCode, Plus, Shield } from 'lucide-react';

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

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WireGuard</h1>
              <p className="text-xs text-gray-400">Manager Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md shadow-green-500/15'
                    : 'text-gray-300 hover:text-white hover:bg-green-500/10'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Status Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-online"></div>
              <span className="text-sm text-gray-400">API Mikrotik</span>
            </div>
            <span className="text-xs text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
