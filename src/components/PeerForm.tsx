
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Download, QrCode, Copy, Check, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useWireguardPeers } from '@/hooks/useWireguardPeers';

interface PeerFormData {
  selectedPeer: string;
  interface: string;
  endpoint: string;
  endpointPort: number;
  allowedAddress: string;
  clientDns: string;
  clientEndpoint: string;
}

const PeerForm = () => {
  const { toast } = useToast();
  const { peers, isLoading } = useWireguardPeers();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [formData, setFormData] = useState<PeerFormData>({
    selectedPeer: '',
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

  // Filter peers based on search
  const filteredPeers = peers.filter(peer => {
    const peerName = peer.name || peer['endpoint-address'] || `peer-${peer.id || peer['.id']}`;
    return peerName.toLowerCase().includes(searchValue.toLowerCase());
  });

  // Get selected peer data
  const selectedPeerData = peers.find(peer => {
    const peerId = peer.id || peer['.id'];
    return peerId === formData.selectedPeer;
  });

  // Update form data when peer is selected
  useEffect(() => {
    if (selectedPeerData) {
      setFormData(prev => ({
        ...prev,
        interface: selectedPeerData.interface || '',
        allowedAddress: selectedPeerData['allowed-address'] || '',
        endpoint: selectedPeerData['endpoint-address'] || '',
        endpointPort: selectedPeerData['endpoint-port'] || 51820
      }));
    }
  }, [selectedPeerData]);

  const handleInputChange = (field: keyof PeerFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePeerSelect = (peerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPeer: peerId
    }));
    setOpen(false);
  };

  const generateWireGuardConfig = () => {
    if (!selectedPeerData) return '';

    const clientPrivateKey = 'ABCD1234567890ABCD1234567890ABCD1234567890='; // Simulado
    const serverPublicKey = selectedPeerData['public-key'] || 'EFGH1234567890EFGH1234567890EFGH1234567890=';
    
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
    
    if (!formData.selectedPeer || !selectedPeerData) {
      toast({
        title: "Erro",
        description: "Selecione um peer para gerar a configuração",
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
    const peerName = selectedPeerData?.name || selectedPeerData?.['endpoint-address'] || 'peer-config';
    const blob = new Blob([configContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${peerName}.conf`;
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

  const getSelectedPeerName = () => {
    if (!selectedPeerData) return "Selecione um peer";
    return selectedPeerData.name || selectedPeerData['endpoint-address'] || `peer-${selectedPeerData.id || selectedPeerData['.id']}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Configurações</h1>
        <p className="text-gray-400 text-lg">Selecione um peer existente para gerar sua configuração</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Configuração do Peer
            </CardTitle>
            <CardDescription>Selecione um peer para gerar a configuração</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Peer */}
              <div className="space-y-2">
                <Label className="text-white">Selecionar Peer *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Carregando peers..." : getSelectedPeerName()}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
                    <Command className="bg-gray-800">
                      <CommandInput 
                        placeholder="Buscar peer..." 
                        className="text-white"
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty className="text-gray-400">Nenhum peer encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredPeers.map((peer) => {
                            const peerId = peer.id || peer['.id'];
                            const peerName = peer.name || peer['endpoint-address'] || `peer-${peerId}`;
                            const isActive = peer.disabled === 'false' || peer.disabled === false || !peer.disabled;
                            
                            return (
                              <CommandItem
                                key={peerId}
                                value={peerId}
                                onSelect={() => handlePeerSelect(peerId)}
                                className="text-white hover:bg-gray-700 cursor-pointer"
                              >
                                <div className="flex items-center space-x-2 w-full">
                                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                  <div className="flex-1">
                                    <div className="font-medium">{peerName}</div>
                                    <div className="text-xs text-gray-400">
                                      {peer.interface} • {peer['allowed-address']}
                                    </div>
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Interface - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="interface" className="text-white">Interface WireGuard</Label>
                <Input
                  id="interface"
                  value={formData.interface}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-gray-300"
                />
              </div>

              {/* Endpoint */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-white">Endpoint</Label>
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

              {/* Endereço Permitido - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="allowedAddress" className="text-white">Endereço Permitido</Label>
                <Input
                  id="allowedAddress"
                  value={formData.allowedAddress}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-gray-300"
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
                disabled={!formData.selectedPeer}
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
