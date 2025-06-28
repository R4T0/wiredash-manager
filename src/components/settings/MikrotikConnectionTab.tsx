
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Settings, TestTube, ChevronUp, Menu, X } from 'lucide-react';

const MikrotikConnectionTab = () => {
  const [formData, setFormData] = useState({
    endpoint: '189.17.83.228',
    port: '80',
    user: 'admin',
    password: '',
    useHttps: false
  });

  const [activeSection, setActiveSection] = useState('connection');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'connection', label: 'Dados de Conexão', icon: Settings },
    { id: 'test', label: 'Testar Conexão', icon: TestTube },
    { id: 'advanced', label: 'Configurações Avançadas', icon: Settings },
    { id: 'top', label: 'Voltar ao Início', icon: ChevronUp }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      useHttps: checked
    }));
  };

  const handleSave = () => {
    console.log('Saving global configuration:', formData);
    alert('Configurações salvas com sucesso!');
  };

  const handleTestConnection = () => {
    console.log('Testing connection with:', formData);
    alert('Testando conexão... (funcionalidade em desenvolvimento)');
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Fixed Horizontal Submenu */}
      <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 -mx-6 px-6 py-3">
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-md shadow-green-500/15'
                    : 'text-gray-300 hover:bg-green-500/10 hover:text-green-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Menu de Navegação</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {mobileMenuOpen && (
            <div className="mt-3 space-y-1 border-t border-gray-700/50 pt-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-gray-300 hover:bg-green-500/10 hover:text-green-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-6">
        {/* Connection Data Section */}
        <div id="connection" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Conexão API do Roteador</h2>
            <p className="text-gray-400 mb-6">Configure os parâmetros de conexão para a API-REST do roteador Mikrotik</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-gray-300">
                Endereço do Roteador
              </Label>
              <Input
                id="endpoint"
                name="endpoint"
                type="text"
                value={formData.endpoint}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="text-gray-300">
                Porta API
              </Label>
              <Input
                id="port"
                name="port"
                type="text"
                value={formData.port}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-gray-300">
                Usuário
              </Label>
              <Input
                id="user"
                name="user"
                type="text"
                value={formData.user}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="https"
              checked={formData.useHttps}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="https" className="text-gray-300">
              Usar HTTPS para conexões API
            </Label>
          </div>
        </div>

        {/* Test Connection Section */}
        <div id="test" className="space-y-6 pt-12">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Testar Conexão</h3>
            <p className="text-gray-400 mb-6">Verifique se a conexão com o roteador está funcionando corretamente</p>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleTestConnection}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 shadow-md shadow-blue-500/15"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </div>
        </div>

        {/* Advanced Settings Section */}
        <div id="advanced" className="space-y-6 pt-12">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Configurações Avançadas</h3>
            <p className="text-gray-400 mb-6">Opções avançadas de conexão e timeout</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-gray-300">
                Timeout (segundos)
              </Label>
              <Input
                id="timeout"
                name="timeout"
                type="number"
                placeholder="30"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retries" className="text-gray-300">
                Tentativas de Reconexão
              </Label>
              <Input
                id="retries"
                name="retries"
                type="number"
                placeholder="3"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button Section */}
        <div className="flex justify-end pt-8">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MikrotikConnectionTab;
