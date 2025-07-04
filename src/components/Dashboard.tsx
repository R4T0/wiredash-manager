
import React, { useEffect, useState } from 'react';
import { Users, Network, Activity, Plus, Download, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from './StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWireguardPeers } from '@/hooks/useWireguardPeers';
import SecurityWarning from './SecurityWarning';

const Dashboard = () => {
  const navigate = useNavigate();
  const { peers, isLoading } = useWireguardPeers();
  const [recentPeers, setRecentPeers] = useState<any[]>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);

  // Auto-hide security warning after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecurityWarning(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (peers.length > 0) {
      // Filter peers created in the last 24 hours
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recent = peers.filter(peer => {
        // Check if peer has a creation date or use comment field for timestamp
        if (peer.comment) {
          try {
            // Try to parse date from comment or other fields
            const createdDate = new Date(peer.comment);
            return createdDate >= twentyFourHoursAgo;
          } catch (error) {
            return false;
          }
        }
        return false;
      }).slice(0, 3); // Show only the 3 most recent

      setRecentPeers(recent);
    }
  }, [peers]);

  const stats = [
    {
      title: 'Total de Peers',
      value: peers.length || 0,
      subtitle: 'Peers ativos',
      icon: Users,
      trend: peers.length > 0 ? { value: 12, isPositive: true } : undefined,
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Interfaces WG',
      value: 3,
      subtitle: 'Interfaces ativas',
      icon: Network,
      gradient: 'from-green-600 to-green-700'
    },
    {
      title: 'Última Atividade',
      value: '2min',
      subtitle: 'Peer conectado',
      icon: Activity,
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  const handleCreatePeer = () => {
    navigate('/peers');
  };

  const handleGenerateQR = () => {
    navigate('/generate');
  };

  const handleViewInterfaces = () => {
    navigate('/interfaces');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Security Warning */}
      {showSecurityWarning && (
        <div className="animate-fade-in">
          <SecurityWarning />
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Manager</h1>
          <p className="text-gray-400 text-lg">Gerencie Interfaces e peers do seu Wireguard</p>
        </div>
        <Button 
          onClick={handleCreatePeer}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Peer
        </Button>
      </div>

      {/* Stats Grid */}
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Peers */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Peers Recentes</CardTitle>
              <CardDescription>Peers criados nas últimas 24h via sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Carregando peers...</p>
                  </div>
                ) : recentPeers.length > 0 ? (
                  recentPeers.map((peer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="status-indicator status-online"></div>
                        <div>
                          <p className="font-medium text-white">{peer.name || peer['.id']}</p>
                          <p className="text-sm text-gray-400">{peer.interface} • {peer['allowed-address']}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Nenhum peer recente</p>
                    <p className="text-sm text-gray-500">Peers criados nas últimas 24h aparecerão aqui</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
              <CardDescription>Ferramentas mais utilizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleCreatePeer}
                className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Peer
              </Button>
              <Button 
                onClick={handleGenerateQR}
                className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Gerar QR Code
              </Button>
              <Button 
                onClick={handleViewInterfaces}
                className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/30"
              >
                <Network className="w-4 h-4 mr-2" />
                Ver Interfaces
              </Button>
              <Button className="w-full justify-start bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border-orange-600/30">
                <Download className="w-4 h-4 mr-2" />
                Backup Config
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
