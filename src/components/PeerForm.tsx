
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Download, QrCode, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PeerFormData {
  name: string;
  interface: string;
  endpoint: string;
  endpointPort: number;
  allowedAddress: string;
  clientDns: string;
  clientEndpoint: string;
}

const PeerForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PeerFormData>({
    name: '',
    interface: '',
    endpoint: '',
    endpointPort: 51820,
    allowedAddress: '',
    clientDns: '1.1.1.1',
    clientEndpoint: '0.0.0.0'
  });

  const [interfaces, setInterfaces] = useState([
    'wg-main',
    'wg-branch-office',
    'wg-mobile-clients',
    'wg-test'
  ]);

  const [generated, setGenerated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [configContent, setConfigContent] = useState('');
  const [copied, setCopied] = useState(false);

  const generateNextIP = () => {
    const baseIP = '10.0.0.';
    const nextNum = Math.floor(Math.random() * 254) + 2;
    return `${baseIP}${nextNum}/32`;
  };

  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        allowedAddress: generateNextIP()
      }));
    }
  }, [formData.name]);

  const handleInputChange = (field: keyof PeerFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateWireGuardConfig = () => {
    const clientPrivateKey = 'ABCD1234567890ABCD1234567890ABCD1234567890='; // Simulado
    const serverPublicKey = 'EFGH1234567890EFGH1234567890EFGH1234567890='; // Simulado
    
    const config = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${formData.allowedAddress}
DNS = ${formData.clientDns}

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${formData.endpoint}:${formData.endpointPort}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    return config;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.interface || !formData.endpoint) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const config = generateWireGuardConfig();
    setConfigContent(config);
    
    // Simular geração de QR Code
    const qrData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    setQrCodeUrl(qrData);
    
    setGenerated(true);
    
    toast({
      title: "Sucesso!",
      description: "Configuração WireGuard gerada com sucesso",
    });
  };

  const downloadConfig = () => {
    const blob = new Blob([configContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "Arquivo .conf baixado com sucesso",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copiado!",
      description: "Configuração copiada para a área de transferência",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Gerar Configuração</h1>
        <p className="text-gray-400 text-lg">Crie um novo peer WireGuard para seu servidor Mikrotik</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Novo Peer
            </CardTitle>
            <CardDescription>Preencha os dados para gerar a configuração</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nome do Peer *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ex: client-001"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Interface */}
              <div className="space-y-2">
                <Label htmlFor="interface" className="text-white">Interface WireGuard *</Label>
                <Select value={formData.interface} onValueChange={(value) => handleInputChange('interface', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione uma interface" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {interfaces.map((iface) => (
                      <SelectItem key={iface} value={iface} className="text-white hover:bg-gray-700">
                        {iface}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Endpoint */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-white">Endpoint *</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => handleInputChange('endpoint', e.target.value)}
                    placeholder="vpn.company.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port" className="text-white">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.endpointPort}
                    onChange={(e) => handleInputChange('endpointPort', parseInt(e.target.value) || 51820)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Endereço Permitido */}
              <div className="space-y-2">
                <Label htmlFor="allowedAddress" className="text-white">Endereço Permitido</Label>
                <Input
                  id="allowedAddress"
                  value={formData.allowedAddress}
                  onChange={(e) => handleInputChange('allowedAddress', e.target.value)}
                  placeholder="Gerado automaticamente"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* DNS e Endpoint do Cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dns" className="text-white">DNS do Cliente</Label>
                  <Input
                    id="dns"
                    value={formData.clientDns}
                    onChange={(e) => handleInputChange('clientDns', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEndpoint" className="text-white">Endpoint do Cliente</Label>
                  <Input
                    id="clientEndpoint"
                    value={formData.clientEndpoint}
                    onChange={(e) => handleInputChange('clientEndpoint', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gerar Configuração
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado */}
        {generated && (
          <div className="space-y-6">
            {/* QR Code */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code
                </CardTitle>
                <CardDescription>Escaneie com seu cliente WireGuard</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Config File */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Arquivo de Configuração</CardTitle>
                <CardDescription>Configure manualmente ou baixe o arquivo .conf</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {configContent}
                  </pre>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={downloadConfig} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar .conf
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerForm;
