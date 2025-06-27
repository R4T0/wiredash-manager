
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Download, QrCode, Trash2 } from 'lucide-react';

const Peers = () => {
  const peers = [
    { id: 1, name: 'client-001', interface: 'wg-main', ip: '10.0.0.10', status: 'online', lastSeen: '2 min ago' },
    { id: 2, name: 'client-002', interface: 'wg-main', ip: '10.0.0.11', status: 'online', lastSeen: '5 min ago' },
    { id: 3, name: 'mobile-user', interface: 'wg-mobile-clients', ip: '10.1.0.5', status: 'offline', lastSeen: '2 hours ago' },
    { id: 4, name: 'branch-office', interface: 'wg-branch-office', ip: '10.2.0.1', status: 'online', lastSeen: '1 min ago' },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gerenciar Peers</h1>
            <p className="text-gray-400 text-lg">Visualize e gerencie todos os peers WireGuard</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Novo Peer
          </Button>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Lista de Peers
            </CardTitle>
            <CardDescription>Todos os peers configurados em suas interfaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {peers.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className={`status-indicator ${peer.status === 'online' ? 'status-online' : 'status-offline'}`}></div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{peer.name}</h3>
                      <p className="text-gray-400">{peer.interface} • {peer.ip}</p>
                      <p className="text-sm text-gray-500">Última atividade: {peer.lastSeen}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20">
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-600/20">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-600/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Peers;
