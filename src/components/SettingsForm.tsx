
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Router, Shield, Users, FileText, Activity } from 'lucide-react';
import MikrotikConnectionTab from './settings/MikrotikConnectionTab';
import WireGuardTab from './settings/WireGuardTab';
import PlaceholderTab from './settings/PlaceholderTab';

const SettingsForm = () => {
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
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 hover:bg-green-500/10"
            >
              <Router className="w-4 h-4 mr-2" />
              Conexão Mikrotik
            </TabsTrigger>
            <TabsTrigger 
              value="wireguard"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 hover:bg-green-500/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              WireGuard
            </TabsTrigger>
            <TabsTrigger 
              value="usuarios"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 hover:bg-green-500/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 hover:bg-green-500/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="diagnostico"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 hover:bg-green-500/10"
            >
              <Activity className="w-4 h-4 mr-2" />
              Diagnóstico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mikrotik">
            <MikrotikConnectionTab />
          </TabsContent>

          <TabsContent value="wireguard">
            <WireGuardTab />
          </TabsContent>

          <TabsContent value="usuarios">
            <PlaceholderTab 
              icon={Users}
              title="Gerenciamento de Usuários"
              description="Configurar usuários e permissões do sistema"
            />
          </TabsContent>

          <TabsContent value="logs">
            <PlaceholderTab 
              icon={FileText}
              title="Logs do Sistema"
              description="Visualizar e gerenciar logs de atividades"
            />
          </TabsContent>

          <TabsContent value="diagnostico">
            <PlaceholderTab 
              icon={Activity}
              title="Diagnóstico"
              description="Ferramentas de diagnóstico e teste de conectividade"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsForm;
