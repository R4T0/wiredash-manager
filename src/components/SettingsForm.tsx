
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Settings, Router, Shield, Users, FileText, Activity } from 'lucide-react';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    endpoint: '189.17.83.228',
    port: '80',
    user: 'admin',
    password: '',
    useHttps: false
  });

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

      <Card className="bg-gray-800/50 border-gray-700">
        <Tabs defaultValue="mikrotik" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-700/50 border-gray-600">
            <TabsTrigger 
              value="mikrotik" 
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <Router className="w-4 h-4 mr-2" />
              Conexão Mikrotik
            </TabsTrigger>
            <TabsTrigger 
              value="wireguard"
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <Shield className="w-4 h-4 mr-2" />
              WireGuard
            </TabsTrigger>
            <TabsTrigger 
              value="usuarios"
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="diagnostico"
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30"
            >
              <Activity className="w-4 h-4 mr-2" />
              Diagnóstico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mikrotik" className="p-6 space-y-6">
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
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
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
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
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
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
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
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
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

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wireguard" className="p-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Configurações WireGuard</h3>
              <p className="text-gray-400">Configurações específicas do protocolo WireGuard</p>
            </div>
          </TabsContent>

          <TabsContent value="usuarios" className="p-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Gerenciamento de Usuários</h3>
              <p className="text-gray-400">Configurar usuários e permissões do sistema</p>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Logs do Sistema</h3>
              <p className="text-gray-400">Visualizar e gerenciar logs de atividades</p>
            </div>
          </TabsContent>

          <TabsContent value="diagnostico" className="p-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Diagnóstico</h3>
              <p className="text-gray-400">Ferramentas de diagnóstico e teste de conectividade</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsForm;
