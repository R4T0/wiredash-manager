
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, Settings, Globe, Lock, User, Hash, Server, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    endpoint: '',
    port: '',
    user: '',
    password: '',
    ipRange: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log('Saving global configuration:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    toast({
      title: "Configurações salvas!",
      description: "As configurações globais foram atualizadas com sucesso.",
    });

    // Hide success animation after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-8 py-12 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <Settings className="w-10 h-10 text-blue-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Configurações Globais
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Configure os parâmetros padrão do sistema para uma experiência personalizada
            </p>
          </div>
        </div>

        {/* Main Settings Card */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-12 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Endpoint Field */}
              <div className="space-y-4 group">
                <Label htmlFor="endpoint" className="text-gray-200 text-lg font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  Endpoint
                </Label>
                <div className="relative">
                  <Input
                    id="endpoint"
                    name="endpoint"
                    type="text"
                    placeholder="vpn.company.com"
                    value={formData.endpoint}
                    onChange={handleInputChange}
                    className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 rounded-xl text-lg pl-12 transition-all duration-300 hover:bg-white/10"
                  />
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
                </div>
              </div>

              {/* Port Field */}
              <div className="space-y-4 group">
                <Label htmlFor="port" className="text-gray-200 text-lg font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-green-400" />
                  </div>
                  Port
                </Label>
                <div className="relative">
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    placeholder="51820"
                    value={formData.port}
                    onChange={handleInputChange}
                    className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 rounded-xl text-lg pl-12 transition-all duration-300 hover:bg-white/10"
                  />
                  <Server className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
                </div>
              </div>

              {/* User Field */}
              <div className="space-y-4 group">
                <Label htmlFor="user" className="text-gray-200 text-lg font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                  Usuário
                </Label>
                <div className="relative">
                  <Input
                    id="user"
                    name="user"
                    type="text"
                    placeholder="admin"
                    value={formData.user}
                    onChange={handleInputChange}
                    className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 rounded-xl text-lg pl-12 transition-all duration-300 hover:bg-white/10"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-4 group">
                <Label htmlFor="password" className="text-gray-200 text-lg font-medium flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-red-400/50 focus:ring-2 focus:ring-red-400/20 rounded-xl text-lg pl-12 transition-all duration-300 hover:bg-white/10"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-400 transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* IP Range Field */}
            <div className="space-y-4 group">
              <Label htmlFor="ipRange" className="text-gray-200 text-lg font-medium flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-4 h-4 text-orange-400" />
                </div>
                Faixa de IP
              </Label>
              <div className="relative">
                <Input
                  id="ipRange"
                  name="ipRange"
                  type="text"
                  placeholder="10.0.0.0/24"
                  value={formData.ipRange}
                  onChange={handleInputChange}
                  className="h-14 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-lg pl-12 transition-all duration-300 hover:bg-white/10"
                />
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-300" />
              </div>
              <p className="text-sm text-gray-400 ml-11">
                Intervalo de IPs privados para uso automático na rede
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                  relative overflow-hidden h-16 px-12 text-lg font-semibold rounded-2xl
                  bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 
                  hover:from-blue-500 hover:via-purple-500 hover:to-blue-500
                  text-white shadow-2xl border border-white/10
                  transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                  ${showSuccess ? 'bg-gradient-to-r from-green-600 to-green-700' : ''}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
                
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : showSuccess ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 animate-bounce" />
                    Salvo com Sucesso!
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Save className="w-6 h-6" />
                    Salvar Configurações
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default SettingsForm;
