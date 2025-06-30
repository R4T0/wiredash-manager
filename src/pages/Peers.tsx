
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, QrCode, Trash2, Activity, UserCheck, Clock } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import CreatePeerModal from '../components/CreatePeerModal';
import EditPeerModal from '../components/EditPeerModal';
import { useWireguardPeers } from '../hooks/useWireguardPeers';

const Peers = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { peers, isLoading, isCreating, createPeer, fetchPeers } = useWireguardPeers();

  // Check if router is Mikrotik
  const savedConfig = localStorage.getItem('routerConfig');
  const isMikrotik = savedConfig ? JSON.parse(savedConfig).routerType === 'mikrotik' : false;

  // Fallback data for non-Mikrotik routers or when no data is available
  const fallbackPeers = [
    { id: '1', name: 'Cliente 001', interface: 'wg-main', 'public-key': 'ABC123...', 'allowed-address': '10.0.0.10/32', 'endpoint-address': 'vpn.stacasa.local', 'endpoint-port': 51820, disabled: 'false' },
    { id: '2', name: 'Cliente 002', interface: 'wg-main', 'public-key': 'DEF456...', 'allowed-address': '10.0.0.11/32', 'endpoint-address': 'vpn.stacasa.local', 'endpoint-port': 51820, disabled: 'false' },
    { id: '3', name: 'Mobile User', interface: 'wg-mobile-clients', 'public-key': 'GHI789...', 'allowed-address': '10.1.0.5/32', 'endpoint-address': 'vpn.stacasa.local', 'endpoint-port': 51821, disabled: 'true' },
    { id: '4', name: 'Branch Office', interface: 'wg-branch-office', 'public-key': 'JKL012...', 'allowed-address': '10.2.0.1/32', 'endpoint-address': 'vpn.stacasa.local', 'endpoint-port': 51822, disabled: 'false' },
  ];

  const displayPeers = isMikrotik && peers.length > 0 ? peers : fallbackPeers;
  const totalPeers = displayPeers.length;
  // Status is based on disabled parameter: disabled='false' or disabled=false means active
  const onlinePeers = displayPeers.filter(peer => 
    peer.disabled === 'false' || peer.disabled === false || !peer.disabled
  ).length;
  const recentPeers = Math.ceil(totalPeers * 0.6); // Simulate recent peers

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
      trend: { value: 25, isPositive: true },
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
    fetchPeers(); // Refresh peers list
  };

  // Check if peer is active (not disabled)
  const isPeerActive = (peer: any) => {
    return peer.disabled === 'false' || peer.disabled === false || !peer.disabled;
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
            <p className="text-gray-400 text-lg">
              {isMikrotik ? 'Visualize e gerencie todos os peers WireGuard do Mikrotik' : 'Visualize e gerencie todos os peers WireGuard'}
            </p>
          </div>
          {isMikrotik && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Peer
            </Button>
          )}
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
              {isMikrotik && (
                <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                  Mikrotik
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {isMikrotik ? 'Peers carregados do roteador Mikrotik' : 'Dados de exemplo - configure um roteador Mikrotik para dados reais'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400">Carregando peers...</div>
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
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 h-8 w-8 p-0">
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
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-600/20 h-8 w-8 p-0">
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
      </div>
    </Layout>
  );
};

export default Peers;
