import React, { useState } from 'react';
import { useRouterConnection } from '@/hooks/useRouterConnection';
import RouterTypeSelector from './RouterTypeSelector';
import ConnectionForm from './ConnectionForm';

const ConnectionTab = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    formData,
    selectedRouter,
    isTestingConnection,
    routerTypes,
    setSelectedRouter,
    handleInputChange,
    handleSwitchChange,
    handleTestConnection,
    handleSave
  } = useRouterConnection();

  const selectedRouterName = routerTypes.find(r => r.id === selectedRouter)?.name || selectedRouter;

  const handleRouterSelect = (routerId: string) => {
    setSelectedRouter(routerId);
    setIsMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="p-6 space-y-6">
      <RouterTypeSelector
        selectedRouter={selectedRouter}
        onRouterSelect={handleRouterSelect}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={handleToggleMobileMenu}
      />

      <ConnectionForm
        formData={formData}
        onInputChange={handleInputChange}
        onSwitchChange={handleSwitchChange}
        onTestConnection={handleTestConnection}
        onSave={handleSave}
        isTestingConnection={isTestingConnection}
        selectedRouterName={selectedRouterName}
      />
    </div>
  );
};

export default ConnectionTab;
