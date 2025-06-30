import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Wifi } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useWireguardPeers } from '@/hooks/useWireguardPeers';

const PeerFormCompact = () => {
  const { toast } = useToast();
  const { peers, isLoading } = useWireguardPeers();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedPeerId, setSelectedPeerId] = useState('');

  const filteredPeers = peers.filter(peer => {
    const peerName = peer.name || peer['endpoint-address'] || `peer-${peer.id || peer['.id']}`;
    return peerName.toLowerCase().includes(searchValue.toLowerCase());
  });

  const selectedPeer = peers.find(peer => (peer.id || peer['.id']) === selectedPeerId);

  const handlePeerSelect = (peerId: string) => {
    setSelectedPeerId(peerId);
    setOpen(false);
  };

  const getSelectedPeerName = () => {
    if (!selectedPeer) return 'Selecione um peer';
    return selectedPeer.name || selectedPeer['endpoint-address'] || `peer-${selectedPeer.id || selectedPeer['.id']}`;
  };

  const isPeerActive = (peer: any) => {
    return peer.disabled === false || peer.disabled === 'false' || !peer.disabled;
  };

  return (
    <div className="container mx-auto p-3 max-w-5xl space-y-4">
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center text-white text-base font-semibold">
              <Wifi className="w-5 h-5 mr-2 text-blue-400" />
              Configuração do Peer
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full sm:w-64 h-8 justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-left text-sm"
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{isLoading ? 'Carregando peers...' : getSelectedPeerName()}</span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-64 p-0 bg-gray-800 border-gray-700 shadow-xl">
                <Command className="bg-gray-800">
                  <CommandInput
                    placeholder="Buscar peer..."
                    className="text-white h-8 text-sm"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList className="max-h-48">
                    <CommandEmpty className="text-gray-400 p-3 text-sm">
                      Nenhum peer encontrado.
                    </CommandEmpty>
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
                            className="text-white hover:bg-gray-700 cursor-pointer px-3 py-2 text-sm"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? 'bg-green-400' : 'bg-red-400'
                                }`}
                              />
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
        </CardHeader>
        <CardContent className="text-gray-400 text-sm">
          {selectedPeer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-white text-xs">Interface</Label>
                <Input
                  readOnly
                  value={selectedPeer.interface || ''}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 h-8 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-white text-xs">Endereço</Label>
                <Input
                  readOnly
                  value={selectedPeer['allowed-address'] || ''}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 h-8 text-sm mt-1"
                />
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">Selecione um peer para visualizar os dados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerFormCompact;