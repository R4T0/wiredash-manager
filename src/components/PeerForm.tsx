import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, QrCode, Copy, Check, Search, Settings, Wifi } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useWireguardPeers } from '@/hooks/useWireguardPeers';
import { apiService } from '@/services/api';
import QRCode from 'qrcode';

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
  const [wireguardGlobalConfig, setWireguardGlobalConfig] = useState({
    endpointPadrao: '',
    portaPadrao: '',
    dnsCliente: ''
  });
  const [interfaceData, setInterfaceData] = useState<any>(null);

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

  // Load WireGuard global configuration
  useEffect(() => {
    const loadGlobalConfig = async () => {
      try {
        const response = await apiService.getWireguardConfig();
        if (response.success && response.data) {
          const config = response.data;
          setWireguardGlobalConfig({
            endpointPadrao: config.endpoint_padrao || '',
            portaPadrao: config.porta_padrao || '',
            dnsCliente: config.dns_cliente || ''
          });
        }
      } catch (error) {
        console.error('Failed to load WireGuard global config:', error);
      }
    };

    loadGlobalConfig();
  }, []);

  // Get interface data when peer is selected
  useEffect(() => {
    if (selectedPeerData && selectedPeerData.interface) {
      const fetchInterfaceData = async () => {
        try {
          const savedConfig = localStorage.getItem('routerConfig');
          if (!savedConfig) return;

          const config = JSON.parse(savedConfig);
          const proxyUrl = 'http://localhost:5000/api/router/proxy';

          const requestBody = {
            routerType: config.routerType,
            endpoint: config.endpoint,
            port: config.port,
            user: config.user,
            password: config.password,
            useHttps: config.useHttps,
            path: '/rest/interface/wireguard',
            method: 'GET'
          };

          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(15000)
          });

          const responseData = await response.json();
          
          if (responseData.success && responseData.data) {
            const interfaces = Array.isArray(responseData.data) ? responseData.data : [];
            const targetInterface = interfaces.find(iface => iface.name === selectedPeerData.interface);
            if (targetInterface) {
              setInterfaceData(targetInterface);
            }
          }
        } catch (error) {
          console.error('Failed to fetch interface data:', error);
        }
      };

      fetchInterfaceData();
    }
  }, [selectedPeerData]);

  // Update form data when peer is selected
  useEffect(() => {
    if (selectedPeerData) {
      setFormData(prev => ({
        ...prev,
        interface: selectedPeerData.interface || '',
        allowedAddress: selectedPeerData['allowed-address'] || '',
        endpoint: wireguardGlobalConfig.endpointPadrao || selectedPeerData['endpoint-address'] || '',
        endpointPort: interfaceData?.['listen-port'] || parseInt(wireguardGlobalConfig.portaPadrao) || selectedPeerData['endpoint-port'] || 51820,
        clientDns: wireguardGlobalConfig.dnsCliente || '1.1.1.1'
      }));
    }
  }, [selectedPeerData, wireguardGlobalConfig, interfaceData]);

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

  // Function to get interface public key
  const getInterfacePublicKey = async (interfaceName: string) => {
    const savedConfig = localStorage.getItem('routerConfig');
    if (!savedConfig) return 'CHAVE_PUBLICA_INTERFACE_NAO_ENCONTRADA';

    const config = JSON.parse(savedConfig);
    const proxyUrl = 'http://localhost:5000/api/router/proxy';

    const requestBody = {
      routerType: config.routerType,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.useHttps,
      path: '/rest/interface/wireguard',
      method: 'GET'
    };

    try {
      console.log('Fetching interface public key for:', interfaceName);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const interfaces = Array.isArray(responseData.data) ? responseData.data : [];
        const targetInterface = interfaces.find(iface => iface.name === interfaceName);
        const publicKey = targetInterface?.['public-key'] || 'CHAVE_PUBLICA_INTERFACE_NAO_ENCONTRADA';
        console.log(`Interface ${interfaceName} public key:`, publicKey);
        return publicKey;
      }
    } catch (error) {
      console.error('Failed to get interface public key:', error);
    }
    
    return 'CHAVE_PUBLICA_INTERFACE_NAO_ENCONTRADA';
  };

  const generateWireGuardConfig = async () => {
    if (!selectedPeerData) return '';

    // Use the actual private key from the router peer data
    const clientPrivateKey = selectedPeerData['private-key'] || 'CHAVE_PRIVADA_NAO_ENCONTRADA';
    
    // Get the public key from the WireGuard interface, not from the peer
    const interfacePublicKey = await getInterfacePublicKey(selectedPeerData.interface);
    
    const config = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${formData.allowedAddress}
DNS = ${formData.clientDns}

[Peer]
PublicKey = ${interfacePublicKey}
Endpoint = ${formData.endpoint}:${formData.endpointPort}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    return config;
  };

  const generateQRCode = async (configText: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(configText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
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

    const config = await generateWireGuardConfig();
    setConfigContent(config);
    
    // Gerar QR Code real
    const qrDataUrl = await generateQRCode(config);
    setQrCodeUrl(qrDataUrl);
    
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

  // Helper function to check if peer is active
  const isPeerActive = (peer: any) => {
    return peer.disabled === false || peer.disabled === 'false' || !peer.disabled;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-3 mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Gerenciar Configurações
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Selecione um peer existente e gere sua configuração WireGuard completa com QR Code para fácil importação
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-blue-400" />
                Configuração do Peer
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure os parâmetros para gerar a configuração WireGuard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Peer Selection */}
                <div className="space-y-3">
                  <Label className="text-white font-medium flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Selecionar Peer *
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full h-11 justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-left"
                        disabled={isLoading}
                      >
                        <div className="flex items-center">
                          <Search className="mr-2 h-4 w-4 text-gray-400" />
                          <span>
                            {isLoading ? "Carregando peers..." : getSelectedPeerName()}
                          </span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700 shadow-xl">
                      <Command className="bg-gray-800">
                        <CommandInput 
                          placeholder="Buscar por nome do peer..." 
                          className="text-white h-11"
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandList className="max-h-60">
                          <CommandEmpty className="text-gray-400 p-4">Nenhum peer encontrado.</CommandEmpty>
                          <CommandGroup>
                            {filteredPeers.map((peer) => {
                              const peerId = peer.id || peer['.id'];
                              const peerName = peer.name || peer['endpoint-address'] || `peer-${peerId}`;
                              const isActive = isPeerActive(peer);
                              
                              return (
                                <CommandItem
                                  key={peerId}
                                  value={peerId}
                                  onSelect={() => handlePeerSelect(peerId)}
                                  className="text-white hover:bg-gray-700 cursor-pointer p-3"
                                >
                                  <div className="flex items-center space-x-3 w-full">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                    <div className="flex-1">
                                      <div className="font-medium">{peerName}</div>
                                      <div className="text-sm text-gray-400">
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

                {/* Network Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interface" className="text-white">Interface WireGuard</Label>
                      <Input
                        id="interface"
                        value={formData.interface}
                        readOnly
                        className="bg-gray-700/50 border-gray-600 text-gray-300 h-10 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="allowedAddress" className="text-white">Endereço Permitido</Label>
                      <Input
                        id="allowedAddress"
                        value={formData.allowedAddress}
                        readOnly
                        className="bg-gray-700/50 border-gray-600 text-gray-300 h-10 mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Server Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="endpoint" className="text-white">Endpoint do Servidor</Label>
                      <Input
                        id="endpoint"
                        value={formData.endpoint}
                        onChange={(e) => handleInputChange('endpoint', e.target.value)}
                        placeholder={wireguardGlobalConfig.endpointPadrao || "vpn.wiredash.com"}
                        className="bg-gray-800 border-gray-600 text-white h-10 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port" className="text-white">Porta</Label>
                      <Input
                        id="port"
                        type="number"
                        value={formData.endpointPort}
                        onChange={(e) => handleInputChange('endpointPort', parseInt(e.target.value) || 51820)}
                        className="bg-gray-800 border-gray-600 text-white h-10 mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dns" className="text-white">DNS do Cliente</Label>
                      <Input
                        id="dns"
                        value={formData.clientDns}
                        onChange={(e) => handleInputChange('clientDns', e.target.value)}
                        placeholder={wireguardGlobalConfig.dnsCliente || "1.1.1.1, 8.8.8.8"}
                        className="bg-gray-800 border-gray-600 text-white h-10 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEndpoint" className="text-white">Endpoint do Cliente</Label>
                      <Input
                        id="clientEndpoint"
                        value={formData.clientEndpoint}
                        onChange={(e) => handleInputChange('clientEndpoint', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white h-10 mt-2"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold shadow-lg transform hover:scale-[1.01] transition-all duration-200"
                  disabled={!formData.selectedPeer}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Configuração WireGuard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          {generated ? (
            <div className="space-y-4">
              {/* QR Code Section */}
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 shadow-xl backdrop-blur-sm">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg text-white flex items-center justify-center">
                    <QrCode className="w-5 h-5 mr-2 text-green-400" />
                    QR Code
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Escaneie para importar
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code WireGuard" 
                        className="w-40 h-40 rounded-lg"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration File */}
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 shadow-xl backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Configuração</CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Baixe ou copie o arquivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-600">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-32">
                      {configContent}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={downloadConfig} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar .conf
                    </Button>
                    <Button 
                      onClick={copyToClipboard} 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 h-10 text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/50 shadow-xl backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Aguardando Configuração
                </h3>
                <p className="text-gray-500 text-sm">
                  Selecione um peer e gere a configuração para visualizar o QR Code
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerForm;
