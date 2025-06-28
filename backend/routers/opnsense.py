
from .base import BaseRouter

class OPNsenseRouter(BaseRouter):
    """Classe específica para roteadores OPNsense"""
    
    def get_router_type(self):
        return 'opnsense'
    
    def get_default_test_path(self):
        """Path padrão para teste de conexão no OPNsense"""
        return '/api/core/system/status'
    
    def get_auth_headers(self):
        """OPNsense pode usar autenticação diferente"""
        # Por enquanto usar Basic Auth, mas pode ser customizado
        return super().get_auth_headers()
    
    def test_connection(self):
        """Testar conexão com roteador OPNsense"""
        return self.make_request(
            path=self.get_default_test_path(),
            method='GET'
        )
    
    def get_system_info(self):
        """Obter informações do sistema OPNsense"""
        return self.make_request('/api/core/system/status', 'GET')
    
    def get_interfaces(self):
        """Obter lista de interfaces"""
        return self.make_request('/api/diagnostics/interface/getInterfaceConfig', 'GET')
    
    def get_firewall_rules(self):
        """Obter regras de firewall"""
        return self.make_request('/api/firewall/filter/searchRule', 'GET')
    
    def get_gateway_status(self):
        """Obter status dos gateways"""
        return self.make_request('/api/routes/gateway/status', 'GET')
