
from .base import BaseRouter

class MikrotikRouter(BaseRouter):
    """Classe específica para roteadores Mikrotik"""
    
    def get_router_type(self):
        return 'mikrotik'
    
    def get_default_test_path(self):
        """Path padrão para teste de conexão no Mikrotik"""
        return '/rest/system/resource'
    
    def test_connection(self):
        """Testar conexão com roteador Mikrotik"""
        return self.make_request(
            path=self.get_default_test_path(),
            method='GET'
        )
    
    def get_system_info(self):
        """Obter informações do sistema Mikrotik"""
        return self.make_request('/rest/system/resource', 'GET')
    
    def get_interfaces(self):
        """Obter lista de interfaces"""
        return self.make_request('/rest/interface', 'GET')
    
    def get_ip_addresses(self):
        """Obter endereços IP configurados"""
        return self.make_request('/rest/ip/address', 'GET')
    
    def get_routes(self):
        """Obter tabela de roteamento"""
        return self.make_request('/rest/ip/route', 'GET')
    
    def get_firewall_rules(self):
        """Obter regras de firewall"""
        return self.make_request('/rest/ip/firewall/filter', 'GET')
    
    def get_dhcp_leases(self):
        """Obter leases DHCP"""
        return self.make_request('/rest/ip/dhcp-server/lease', 'GET')
