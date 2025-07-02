
import React from 'react';
import { Heart, Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800/50 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Criado com</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>por</span>
            <a 
              href="https://dualtecms.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
            >
              <span>Dualtec</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/CloudDualtec/wiredash"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">Apoie o projeto no GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-center text-xs text-gray-500">
            WireDash v1.0.0 - Gerenciador WireGuard para Mikrotik, OPNsense e pfSense
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
