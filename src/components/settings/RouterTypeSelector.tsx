
import React from 'react';
import { Button } from '@/components/ui/button';
import { Router, Shield, Network, Menu, X } from 'lucide-react';

interface RouterType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface RouterTypeSelectorProps {
  selectedRouter: string;
  onRouterSelect: (routerId: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const RouterTypeSelector: React.FC<RouterTypeSelectorProps> = ({
  selectedRouter,
  onRouterSelect,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const routerTypes: RouterType[] = [
    {
      id: 'mikrotik',
      name: 'Mikrotik',
      icon: Router
    },
    {
      id: 'opnsense',
      name: 'OPNsense',
      icon: Shield
    },
    {
      id: 'pfsense',
      name: 'Pfsense',
      icon: Network
    }
  ];

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      {/* Mobile Menu Button */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggleMobileMenu}
          className="w-full bg-gray-700/50 border-gray-600 text-gray-300"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4 mr-2" /> : <Menu className="w-4 h-4 mr-2" />}
          Tipo de Roteador
        </Button>
      </div>

      {/* Desktop Menu or Mobile Expanded Menu */}
      <div className={`flex flex-wrap gap-2 ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        {routerTypes.map(router => {
          const IconComponent = router.icon;
          return (
            <button
              key={router.id}
              onClick={() => {
                onRouterSelect(router.id);
                onToggleMobileMenu();
              }}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                ${selectedRouter === router.id 
                  ? 'bg-gray-700/50 border-gray-500 text-white shadow-md shadow-gray-500/20' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-gray-700/30 hover:border-gray-500 hover:text-gray-300 hover:shadow-sm hover:shadow-gray-500/10'
                }
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{router.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RouterTypeSelector;
