
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, Settings, Globe, Lock, User, Hash, Network, CheckCircle } from 'lucide-react';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    ipRange: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving global configuration:', formData);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <>
      <style>
        {`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes success-bounce {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
            100% { transform: scale(1) rotate(360deg); opacity: 1; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .gradient-animation {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
            background-size: 400% 400%;
            animation: gradient-shift 8s ease infinite;
          }
          
          .glassmorphism {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .neumorphism {
            background: linear-gradient(145deg, #1e293b, #0f172a);
            box-shadow: 
              20px 20px 60px #0a0f1a,
              -20px -20px 60px #2a3441;
          }
          
          .success-animation {
            animation: success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .float-animation {
            animation: float 6s ease-in-out infinite;
          }
          
          .input-glow:focus {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
        `}
      </style>
      
      <div className="max-w-4xl mx-auto space-y-10 p-8">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-8 right-8 z-50 success-animation">
            <div className="glassmorphism rounded-2xl p-6 border border-green-400/30 bg-green-500/10">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-green-300 font-medium">Configurações salvas com sucesso!</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block float-animation">
            <div className="w-20 h-20 gradient-animation rounded-3xl flex items-center justify-center shadow-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Configurações Globais
            </h1>
            <p className="text-xl text-gray-400 font-light">
              Configure os parâmetros avançados do sistema
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="neumorphism border-0 overflow-hidden">
          <div className="glassmorphism p-10 space-y-10">
            {/* Connection Settings */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-200 flex items-center space-x-3">
                <Network className="w-6 h-6 text-blue-400" />
                <span>Configurações de Conexão</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="endpoint" className="text-gray-300 font-medium text-lg">
                    Endpoint do servidor
                  </Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <Input
                      id="endpoint"
                      name="endpoint"
                      type="text"
                      placeholder="vpn.empresa.com"
                      value={formData.endpoint}
                      onChange={handleInputChange}
                      className="pl-12 pr-6 py-4 glassmorphism border-gray-600/50 text-white placeholder-gray-500 focus:border-blue-400/50 input-glow transition-all duration-300 text-lg rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="port" className="text-gray-300 font-medium text-lg">
                    Porta de conexão
                  </Label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <Input
                      id="port"
                      name="port"
                      type="number"
                      placeholder="51820"
                      value={formData.port}
                      onChange={handleInputChange}
                      className="pl-12 pr-6 py-4 glassmorphism border-gray-600/50 text-white placeholder-gray-500 focus:border-purple-400/50 input-glow transition-all duration-300 text-lg rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-200 flex items-center space-x-3">
                <Lock className="w-6 h-6 text-emerald-400" />
                <span>Autenticação</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="user" className="text-gray-300 font-medium text-lg">
                    Usuário administrador
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <Input
                      id="user"
                      name="user"
                      type="text"
                      placeholder="admin"
                      value={formData.user}
                      onChange={handleInputChange}
                      className="pl-12 pr-6 py-4 glassmorphism border-gray-600/50 text-white placeholder-gray-500 focus:border-emerald-400/50 input-glow transition-all duration-300 text-lg rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-300 font-medium text-lg">
                    Senha de acesso
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-6 py-4 glassmorphism border-gray-600/50 text-white placeholder-gray-500 focus:border-red-400/50 input-glow transition-all duration-300 text-lg rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Network Configuration */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-200 flex items-center space-x-3">
                <Network className="w-6 h-6 text-cyan-400" />
                <span>Configuração de Rede</span>
              </h2>
              
              <div className="space-y-3">
                <Label htmlFor="ipRange" className="text-gray-300 font-medium text-lg">
                  Faixa de IPs privados
                </Label>
                <div className="relative group">
                  <Network className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <Input
                    id="ipRange"
                    name="ipRange"
                    type="text"
                    placeholder="10.0.0.0/24"
                    value={formData.ipRange}
                    onChange={handleInputChange}
                    className="pl-12 pr-6 py-4 glassmorphism border-gray-600/50 text-white placeholder-gray-500 focus:border-cyan-400/50 input-glow transition-all duration-300 text-lg rounded-xl"
                  />
                </div>
                <p className="text-gray-500 text-sm ml-1 mt-2">
                  Define o intervalo de endereços IP para atribuição automática aos clientes
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-8 flex justify-center">
              <Button
                onClick={handleSave}
                className="gradient-animation text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 border-0"
              >
                <Save className="w-5 h-5 mr-3" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SettingsForm;
