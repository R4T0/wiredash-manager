
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, Settings, Router, Shield, Users, FileText } from 'lucide-react';

const SettingsForm = () => {
  const [activeTab, setActiveTab] = useState('mikrotik');
  const [formData, setFormData] = useState({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    ipRange: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving global configuration:', formData);
    alert('Configurações salvas com sucesso!');
  };

  const menuItems = [
    { id: 'mikrotik', label: 'Conexão Mikrotik', icon: Router },
    { id: 'wireguard', label: 'WireGuard', icon: Shield },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'logs', label: 'Logs', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'mikrotik':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endpoint" className="text-gray-300">
                  Endpoint
                </Label>
                <Input
                  id="endpoint"
                  name="endpoint"
                  type="text"
                  placeholder="vpn.company.com"
                  value={formData.endpoint}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="text-gray-300">
                  Port
                </Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  placeholder="51820"
                  value={formData.port}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="user" className="text-gray-300">
                  User
                </Label>
                <Input
                  id="user"
                  name="user"
                  type="text"
                  placeholder="admin"
                  value={formData.user}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipRange" className="text-gray-300">
                IP Range
              </Label>
              <Input
                id="ipRange"
                name="ipRange"
                type="text"
                placeholder="10.0.0.0/24"
                value={formData.ipRange}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Intervalo de IPs privados para uso automático
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        );
      case 'wireguard':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Configurações WireGuard</h3>
              <p className="text-gray-400">Configurações específicas do protocolo WireGuard</p>
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Gerenciamento de Usuários</h3>
              <p className="text-gray-400">Configurar usuários e permissões do sistema</p>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Logs do Sistema</h3>
              <p className="text-gray-400">Visualizar e gerenciar logs de atividades</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400">Configure as configurações do sistema e valores padrão</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Menu */}
        <div className="w-64 flex-shrink-0">
          <Card className="bg-gray-800/50 border-gray-700 p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;
