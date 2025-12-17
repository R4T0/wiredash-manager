
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  peer: any;
}

const QRCodeModal = ({ isOpen, onClose, peer }: QRCodeModalProps) => {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [configContent, setConfigContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Function to get interface public key
  const getInterfacePublicKey = async (interfaceName: string) => {
    try {
      // Get configuration from SQLite API instead of localStorage
      const configResponse = await apiService.getRouterConfig();
      if (!configResponse.success || !configResponse.data) {
        console.error('No router configuration found in database');
        return 'CHAVE_PUBLICA_INTERFACE_NAO_ENCONTRADA';
      }

      const config = configResponse.data;
      // Use dynamic backend URL detection
      const getBackendUrl = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        // In Docker/production, use same-origin /api (nginx proxy)
        return '';
      };
      
      const proxyUrl = `${getBackendUrl()}/api/router/proxy`;

      const requestBody = {
        routerType: config.router_type,
        endpoint: config.endpoint,
        port: config.port,
        user: config.user,
        password: config.password,
        useHttps: config.use_https,
        path: '/rest/interface/wireguard',
        method: 'GET'
      };

      console.log('Fetching interface public key for:', interfaceName);
      console.log('Using config:', { routerType: config.router_type, endpoint: config.endpoint });
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      });

      const responseData = await response.json();
      console.log('Interface API response:', responseData);
      
      if (responseData.success && responseData.data) {
        const interfaces = Array.isArray(responseData.data) ? responseData.data : [];
        console.log('Available interfaces:', interfaces.map(i => ({ name: i.name, publicKey: i['public-key'] })));
        
        const targetInterface = interfaces.find(iface => iface.name === interfaceName);
        if (targetInterface) {
          const publicKey = targetInterface['public-key'];
          if (publicKey) {
            console.log(`Found public key for interface ${interfaceName}:`, publicKey);
            return publicKey;
          } else {
            console.warn(`Interface ${interfaceName} found but has no public key`);
          }
        } else {
          console.warn(`Interface ${interfaceName} not found in available interfaces:`, interfaces.map(i => i.name));
        }
      } else {
        console.error('API response not successful:', responseData);
      }
    } catch (error) {
      console.error('Failed to get interface public key:', error);
    }
    
    return 'CHAVE_PUBLICA_INTERFACE_NAO_ENCONTRADA';
  };

  const generateWireGuardConfig = async (peerData: any) => {
    // Use the actual private key from the router peer data
    const clientPrivateKey = peerData['private-key'] || 'CHAVE_PRIVADA_NAO_ENCONTRADA';
    
    // Get the public key from the WireGuard interface, not from the peer
    const interfacePublicKey = await getInterfacePublicKey(peerData.interface);
    
    const config = `[Interface]
PrivateKey = ${clientPrivateKey}
Address = ${peerData['allowed-address'] || '10.0.0.10/32'}
DNS = 1.1.1.1

[Peer]
PublicKey = ${interfacePublicKey}
Endpoint = ${peerData['endpoint-address'] || 'vpn.stacasa.local'}:${peerData['endpoint-port'] || 51820}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;

    return config;
  };

  const generateQRCode = async (configText: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(configText, {
        width: 300,
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

  useEffect(() => {
    if (isOpen && peer) {
      generateWireGuardConfig(peer).then(config => {
        setConfigContent(config);
        
        generateQRCode(config).then(qrUrl => {
          setQrCodeUrl(qrUrl);
        });
      });
    }
  }, [isOpen, peer]);

  const downloadConfig = () => {
    const peerName = peer?.name || peer?.['endpoint-address'] || 'peer-config';
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

  const peerName = peer?.name || peer?.['endpoint-address'] || `peer-${peer?.id || peer?.['.id']}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <QrCode className="w-5 h-5 mr-2 text-green-400" />
            QR Code - {peerName}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Escaneie o QR Code para importar a configuração WireGuard
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WireGuard" 
                  className="w-48 h-48 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Configuration Preview */}
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-24">
              {configContent}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={downloadConfig} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
