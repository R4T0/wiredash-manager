<div className="container mx-auto p-3 max-w-5xl space-y-4">
  {/* Header Section */}
  <div className="text-center space-y-2 mb-4">
    <div className="flex items-center justify-center space-x-2 mb-2">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-1.5 rounded-full">
        <Settings className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
        Gerenciar Configurações
      </h1>
    </div>
    <p className="text-gray-400 text-sm max-w-xl mx-auto">
      Selecione um peer existente e gere sua configuração WireGuard completa com QR Code para fácil importação
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Main Configuration Form */}
    <div className="lg:col-span-2">
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-blue-400" />
            Configuração do Peer
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Configure os parâmetros para gerar a configuração WireGuard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Peer Selection */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Selecionar Peer *
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-9 justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700 text-left text-sm"
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
                      className="text-white h-8 text-sm"
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList className="max-h-48">
                      <CommandEmpty className="text-gray-400 p-3 text-sm">Nenhum peer encontrado.</CommandEmpty>
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

            <Separator className="bg-gray-700" />

            {/* Network Configuration */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Configuração de Rede</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="interface" className="text-white text-sm">Interface WireGuard</Label>
                  <Input
                    id="interface"
                    value={formData.interface}
                    readOnly
                    className="bg-gray-700/50 border-gray-600 text-gray-300 h-8 mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="allowedAddress" className="text-white text-sm">Endereço Permitido</Label>
                  <Input
                    id="allowedAddress"
                    value={formData.allowedAddress}
                    readOnly
                    className="bg-gray-700/50 border-gray-600 text-gray-300 h-8 mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Server Configuration */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Configuração do Servidor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="endpoint" className="text-white text-sm">Endpoint do Servidor</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => handleInputChange('endpoint', e.target.value)}
                    placeholder="vpn.empresa.com"
                    className="bg-gray-800 border-gray-600 text-white h-8 mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="port" className="text-white text-sm">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.endpointPort}
                    onChange={(e) => handleInputChange('endpointPort', parseInt(e.target.value) || 51820)}
                    className="bg-gray-800 border-gray-600 text-white h-8 mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Client Configuration */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Configuração do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dns" className="text-white text-sm">DNS do Cliente</Label>
                  <Input
                    id="dns"
                    value={formData.clientDns}
                    onChange={(e) => handleInputChange('clientDns', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white h-8 mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEndpoint" className="text-white text-sm">Endpoint do Cliente</Label>
                  <Input
                    id="clientEndpoint"
                    value={formData.clientEndpoint}
                    onChange={(e) => handleInputChange('clientEndpoint', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white h-8 mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold shadow-lg transform hover:scale-[1.01] transition-all duration-200"
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
      {/* (A parte lateral continua igual, ou posso compactá-la também se quiser) */}
    </div>
  </div>
</div>
