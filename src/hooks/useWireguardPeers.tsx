
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApiLogsContext } from '@/contexts/ApiLogsContext';
import { apiService } from '@/services/api';

interface WireguardPeer {
  id: string;
  name?: string;
  interface: string;
  'public-key': string;
  'private-key'?: string;
  'allowed-address': string;
  'endpoint-address': string;
  'endpoint-port'?: number;
  disabled?: boolean;
  comment?: string;
}

interface CreatePeerData {
  name: string;
  interface: string;
  'allowed-address': string;
  'endpoint-address': string;
}

// Helper function to get the correct backend URL
const getBackendUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000`;
};

export const useWireguardPeers = () => {
  const [peers, setPeers] = useState<WireguardPeer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { addLog } = useApiLogsContext();

  // Generate valid WireGuard public key (base64 format, 44 characters)
  const generatePublicKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 43; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '='; // WireGuard keys end with '=' for padding
    return result;
  };

  // Make API request through backend proxy
  const makeProxyRequest = async (path: string, method: string = 'GET', body?: any) => {
    // Get configuration from SQLite API instead of localStorage
    const configResponse = await apiService.getRouterConfig();
    if (!configResponse.success || !configResponse.data) {
      throw new Error('Router configuration not found in database');
    }

    const config = configResponse.data;
    
    const requestBody = {
      routerType: config.router_type,
      endpoint: config.endpoint,
      port: config.port,
      user: config.user,
      password: config.password,
      useHttps: config.use_https,
      path: path,
      method: method,
      ...(body && { body })
    };

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/router/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000)
    });

    return response;
  };

  // Get endpoint port from interface configuration
  const getEndpointPort = async (interfaceName: string) => {
    try {
      console.log('Fetching interface port for:', interfaceName);
      
      const response = await makeProxyRequest('/rest/interface/wireguard', 'GET');
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        const interfaces = Array.isArray(responseData.data) ? responseData.data : [];
        const targetInterface = interfaces.find(iface => iface.name === interfaceName);
        const port = targetInterface?.['listen-port'] || 51820;
        console.log(`Interface ${interfaceName} port:`, port);
        return port;
      }
    } catch (error) {
      console.error('Failed to get interface port:', error);
    }
    
    return 51820; // default port
  };

  const fetchPeers = useCallback(async () => {
    try {
      const configResponse = await apiService.getRouterConfig();
      if (!configResponse.success || !configResponse.data) {
        toast({
          title: "Configuração não encontrada",
          description: "Configure a conexão com o roteador primeiro.",
          variant: "destructive"
        });
        return;
      }

      const config = configResponse.data;
      if (config.router_type !== 'mikrotik') {
        console.log('Router type is not Mikrotik, skipping peer fetch');
        return;
      }
    } catch (error) {
      console.error('Failed to load router config:', error);
      toast({
        title: "Erro de configuração",
        description: "Não foi possível carregar a configuração do roteador.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      console.log('Fetching WireGuard peers from Mikrotik via backend proxy...');
      
      const response = await makeProxyRequest('/rest/interface/wireguard/peers', 'GET');
      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      console.log('Peers fetch response:', responseData);

      addLog({
        method: 'GET',
        url: '/rest/interface/wireguard/peers',
        status: response.status,
        requestHeaders: { 'Content-Type': 'application/json' },
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: JSON.stringify(responseData),
        duration
      });

      if (responseData.success && responseData.data) {
        const peersData = Array.isArray(responseData.data) ? responseData.data : [];
        setPeers(peersData);
        console.log('Peers loaded:', peersData);
      } else {
        console.error('Failed to fetch peers:', responseData);
        toast({
          title: "Erro ao carregar peers",
          description: responseData.error || "Falha na comunicação com o roteador",
          variant: "destructive"
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('Failed to fetch peers:', error);
      
      addLog({
        method: 'GET',
        url: '/rest/interface/wireguard/peers',
        requestHeaders: { 'Content-Type': 'application/json' },
        error: errorMessage,
        duration
      });

      toast({
        title: "Erro de conexão",
        description: "Não foi possível buscar os peers do roteador.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, addLog]);

  const createPeer = useCallback(async (peerData: CreatePeerData) => {
    try {
      const configResponse = await apiService.getRouterConfig();
      if (!configResponse.success || !configResponse.data) {
        toast({
          title: "Configuração não encontrada",
          description: "Configure a conexão com o roteador primeiro.",
          variant: "destructive"
        });
        return false;
      }

      const config = configResponse.data;
      if (config.router_type !== 'mikrotik') {
        toast({
          title: "Roteador não suportado",
          description: "Esta funcionalidade é específica para roteadores Mikrotik.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to load router config:', error);
      toast({
        title: "Erro de configuração",
        description: "Não foi possível carregar a configuração do roteador.",
        variant: "destructive"
      });
      return false;
    }

    setIsCreating(true);
    const startTime = Date.now();

    // Get the correct endpoint port from the selected interface
    const endpointPort = await getEndpointPort(peerData.interface);
    
    // Generate valid WireGuard public key
    const publicKey = generatePublicKey();

    console.log('Creating peer with interface port:', endpointPort);

    const requestBody = {
      name: peerData.name,
      interface: peerData.interface,
      'public-key': publicKey,
      'private-key': '', // Let Mikrotik generate the private key
      'allowed-address': peerData['allowed-address'],
      'endpoint-address': peerData['endpoint-address'],
      'endpoint-port': endpointPort
    };

    try {
      console.log('Creating WireGuard peer with payload:', requestBody);
      
      const response = await makeProxyRequest('/rest/interface/wireguard/peers', 'PUT', requestBody);
      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      console.log('Peer creation response:', responseData);

      addLog({
        method: 'PUT',
        url: '/rest/interface/wireguard/peers',
        status: response.status,
        requestHeaders: { 'Content-Type': 'application/json' },
        responseHeaders: Object.fromEntries(response.headers.entries()),
        requestBody: JSON.stringify(requestBody),
        responseBody: JSON.stringify(responseData),
        duration
      });

      if (response.ok && responseData.success) {
        toast({
          title: "✅ Peer criado com sucesso",
          description: `O peer ${peerData.name} foi configurado no roteador.`,
        });
        
        // Refresh peers list
        await fetchPeers();
        return true;
      } else {
        console.error('Failed to create peer:', responseData);
        toast({
          title: "Erro ao criar peer",
          description: responseData.data?.detail || responseData.error || "Falha na comunicação com o roteador",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('Failed to create peer:', error);
      
      addLog({
        method: 'PUT',
        url: '/rest/interface/wireguard/peers',
        requestHeaders: { 'Content-Type': 'application/json' },
        requestBody: JSON.stringify(requestBody),
        error: errorMessage,
        duration
      });

      toast({
        title: "Erro de conexão",
        description: "Não foi possível criar o peer no roteador.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [toast, addLog, fetchPeers]);

  const deletePeer = useCallback(async (peerId: string, peerName: string) => {
    try {
      const configResponse = await apiService.getRouterConfig();
      if (!configResponse.success || !configResponse.data) {
        toast({
          title: "Configuração não encontrada",
          description: "Configure a conexão com o roteador primeiro.",
          variant: "destructive"
        });
        return false;
      }

      const config = configResponse.data;
      if (config.router_type !== 'mikrotik') {
        toast({
          title: "Roteador não suportado",
          description: "Esta funcionalidade é específica para roteadores Mikrotik.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to load router config:', error);
      toast({
        title: "Erro de configuração",
        description: "Não foi possível carregar a configuração do roteador.",
        variant: "destructive"
      });
      return false;
    }

    const startTime = Date.now();

    try {
      console.log('Deleting peer via backend proxy...');

      const response = await makeProxyRequest(`/rest/interface/wireguard/peers/${peerId}`, 'DELETE');
      const duration = Date.now() - startTime;
      
      // Handle empty response body for DELETE operations
      let responseData;
      const responseText = await response.text();
      
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          responseData = { success: false, error: 'Invalid response format' };
        }
      } else {
        // Empty response - consider it successful if status is ok
        responseData = { success: response.ok };
      }
      
      console.log('Delete peer response:', responseData);

      addLog({
        method: 'DELETE',
        url: `/rest/interface/wireguard/peers/${peerId}`,
        status: response.status,
        requestHeaders: { 'Content-Type': 'application/json' },
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: responseText || 'Empty response',
        duration
      });

      if (response.ok && (responseData.success !== false)) {
        toast({
          title: "✅ Peer removido",
          description: `O peer ${peerName} foi removido com sucesso.`,
        });
        
        // Refresh peers list
        await fetchPeers();
        return true;
      } else {
        console.error('Failed to delete peer:', responseData);
        toast({
          title: "Erro ao remover peer",
          description: responseData?.data?.detail || responseData?.error || "Falha ao remover o peer.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('Failed to delete peer:', error);
      
      addLog({
        method: 'DELETE',
        url: `/rest/interface/wireguard/peers/${peerId}`,
        requestHeaders: { 'Content-Type': 'application/json' },
        error: errorMessage,
        duration
      });

      toast({
        title: "Erro de conexão",
        description: "Não foi possível remover o peer do roteador.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, addLog, fetchPeers]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

  return {
    peers,
    isLoading,
    isCreating,
    fetchPeers,
    createPeer,
    deletePeer
  };
};
