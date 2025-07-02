import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, QrCode, Trash2, Activity, UserCheck, Clock, AlertCircle, Settings } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import CreatePeerModal from '../components/CreatePeerModal';
import EditPeerModal from '../components/EditPeerModal';
import DeletePeerDialog from '../components/DeletePeerDialog';
import QRCodeModal from '../components/QRCodeModal';
import { useWireguardPeers } from '../hooks/useWireguardPeers';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Peers = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [peerToDelete, setPeerToDelete] = useState(null);
  const [peerForQRCode, setPeerForQRCode] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [connectionValid, setConnectionValid] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const { peers, isLoading, isCreating, createPeer, fetchPeers, deletePeer } = useWireguardPeers();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check router connection validity
  useEffect(() => {
    const checkConnection = async () => {
      const savedConfig = localStorage.getItem('routerConfig');
      if (!savedConfig) {
        setConnectionValid(false);
        setIsCheckingConnection(false);
        return;
      }

      const config = JSON.parse(savedConfig);
      if (!config.endpoint || !config.user || !config.password) {
        setConnectionValid(false);
        setIsCheckingConnection(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/router/test-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            routerType: config.routerType,
            endpoint: config.endpoint,
            port: config.port,
            user: config.user,
            password: config.password,
            useHttps: config.useHttps
          }),
          signal: AbortSignal.timeout(10000)
        });

        const responseData = await response.json();
        
        if (responseData.success && responseData.status === 200) {
          setConnectionValid(true);
        } else {
          setConnectionValid(false);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionValid(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkConnection();
  }, []);

  // Check if router is Mikrotik
  const savedConfig = localStorage.getItem('routerConfig');
  const isMikrotik = savedConfig ? JSON.parse(savedConfig).routerType === 'mikrotik' : false;

  const displayPeers = connectionValid && isMikrotik && peers.length >= 0 ? peers : [];
  const totalPeers = displayPeers.length;
  const onlinePeers = displayPeers.filter(peer => {
    // Handle both string and boolean values for disabled field
    const isDisabled = peer.disabled === true || peer.disabled === 'true';
    return !isDisabled;
  }).length;
  const recentPeers = Math.ceil(totalPeers * 0.6);

  const stats = [
    {
      title: 'Total de Peers',
      value: totalPeers,
      subtitle: 'Peers registrados',
      icon: Users,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Peers Online',
      value: onlinePeers,
      subtitle: 'Conectados agora',
      icon: UserCheck,
      trend: onlinePeers > 0 ? { value: 25, isPositive: true } : undefined,
      gradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Criados Recentemente',
      value: recentPeers,
      subtitle: 'Últimas 24h',
      icon: Clock,
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  const handleCreatePeer = async (data: { name: string; interface: string; 'allowed-address': string; 'endpoint-address': string }) => {
    return await createPeer(data);
  };

  const handleEditPeer = (peer: any) => {
    setSelectedPeer(peer);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchPeers();
  };

  const handleDeletePeer = (peer: any) => {
    setPeerToDelete(peer);
    setIsDeleteDialogOpen(true);
  };

  const handleShowQRCode = (peer: any) => {
    setPeerForQRCode(peer);
    setIsQRCodeModalOpen(true);
  };

  const confirmDeletePeer = async () => {
    if (!peerToDelete) return;
    
    setIsDeleting(true);
    const peerId = peerToDelete.id || peerToDelete['.id'];
    const peerName = peerToDelete.name || peerToDelete['endpoint-address'] || `peer-${peerId}`;
    
    const success = await deletePeer(peerId, peerName);
    
    if (success) {
      setIsDeleteDialogOpen(false);
      setPeerToDelete(null);
    }
    
    setIsDeleting(false);
  };

  const isPeerActive = (peer: any) => {
    // Handle both string and boolean values for disabled field
    const isDisabled = peer.disabled === true || peer.disabled === 'true';
    return !isDisabled;
  };

  if (isCheckingConnection) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white">Verificando conexão com o roteador...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (connectionValid === false) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
              <p className="text-gray-400 text-lg">Visualize e gerencie todos os peers WireGuard</p>
            </div>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Erro de Conexão</h2>
                <p className="text-gray-400 mb-6">
                  Não foi possível conectar ao roteador. Verifique as configurações de conexão.
                </p>
                <Button 
                  onClick={() => navigate('/settings')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ir para Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isMikrotik) {
    return (
      <Layout>
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
              <p className="text-gray-400 text-lg">Visualize e gerencie todos os peers WireGuard</p>
            </div>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Roteador não suportado</h2>
                <p className="text-gray-400 mb-6">
                  O gerenciamento de peers está disponível apenas para roteadores Mikrotik.
                </p>
                <Button 
                  onClick={() => navigate('/settings')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Roteador
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
            <p className="text-gray-400 text-lg">Visualize e gerencie todos os peers WireGuard do Mikrotik</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Peer
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              trend={stat.trend}
              gradient={stat.gradient}
            />
          ))}
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Lista de Peers
              <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                Mikrotik
              </span>
            </CardTitle>
            <CardDescription>
              Peers carregados do roteador Mikrotik
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400">Carregando peers...</div>
              </div>
            ) : displayPeers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Nenhum peer encontrado</p>
                <p className="text-sm text-gray-500">Configure peers WireGuard no seu roteador para vê-los aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayPeers.map((peer) => (
                  <div key={peer.id || peer['.id']} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {isPeerActive(peer) ? (
                          <div className="flex items-center text-green-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs ml-1 font-medium">Ativo</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs ml-1 font-medium">Inativo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-white">{peer.name || peer['endpoint-address'] || `peer-${peer.id || peer['.id']}`}</h3>
                            <p className="text-sm text-gray-400">
                              {peer.interface} • {peer['allowed-address']}
                              {peer['endpoint-port'] && ` • Porta: ${peer['endpoint-port']}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Chave: {peer['public-key']?.substring(0, 20)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 h-8 w-8 p-0"
                        onClick={() => handleShowQRCode(peer)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20 h-8 w-8 p-0"
                        onClick={() => handleEditPeer(peer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/20 h-8 w-8 p-0"
                        onClick={() => handleDeletePeer(peer)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CreatePeerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePeer}
          isCreating={isCreating}
        />

        <EditPeerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          peer={selectedPeer}
          isUpdating={isUpdating}
        />

        <DeletePeerDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeletePeer}
          peerName={peerToDelete?.name || peerToDelete?.['endpoint-address'] || `peer-${peerToDelete?.id || peerToDelete?.['.id']}`}
          isDeleting={isDeleting}
        />

        <QRCodeModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          peer={peerForQRCode}
        />
      </div>
    </Layout>
  );
};

export default Peers;
