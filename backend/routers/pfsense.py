from .base import BaseRouter
import requests
import json
from datetime import datetime

class PfsenseRouter(BaseRouter):
    """Classe específica para roteadores Pfsense"""
    
    def __init__(self, endpoint, port, user, password, use_https=True):
        # Pfsense geralmente usa HTTPS por padrão
        super().__init__(endpoint, port or '443', user, password, use_https)
        self.session = requests.Session()
        self.session.verify = False  # Pfsense pode usar certificados auto-assinados
        
    def get_router_type(self):
        return 'pfsense'
    
    def get_default_test_path(self):
        """Path padrão para teste de conexão no Pfsense"""
        return '/api/v1/system/info'
    
    def authenticate(self):
        """Autenticar com o roteador Pfsense"""
        try:
            # Pfsense usa autenticação básica diretamente
            # Não precisa de sessão especial como o Unifi
            return True
            
        except Exception as e:
            return False
    
    def make_request(self, path, method='GET', body=None):
        """Fazer requisição HTTP específica para Pfsense"""
        try:
            url = f'{self.base_url}{path}'
            headers = self.get_auth_headers()
            
            start_time = datetime.now()
            
            # Fazer requisição baseada no método
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = self.session.post(url, headers=headers, json=body, timeout=10)
            elif method.upper() == 'PUT':
                response = self.session.put(url, headers=headers, json=body, timeout=10)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                return {
                    'success': False,
                    'error': f'Método HTTP não suportado: {method}',
                    'code': 'UNSUPPORTED_METHOD'
                }
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds() * 1000
            
            # Processar resposta
            try:
                response_data = response.json() if response.content else {}
            except json.JSONDecodeError:
                response_data = {'raw_response': response.text}
            
            return {
                'success': True,
                'status': response.status_code,
                'data': response_data,
                'headers': dict(response.headers),
                'duration_ms': round(duration, 2),
                'url': url,
                'method': method.upper(),
                'router_type': self.get_router_type()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Erro na requisição Pfsense: {str(e)}',
                'code': 'REQUEST_ERROR',
                'router_type': self.get_router_type()
            }
    
    def test_connection(self):
        """Testar conexão com roteador Pfsense"""
        return self.make_request(
            path=self.get_default_test_path(),
            method='GET'
        )
    
    def get_system_info(self):
        """Obter informações do sistema"""
        return self.make_request('/api/v1/system/info', 'GET')
    
    def get_interfaces(self):
        """Obter interfaces de rede"""
        return self.make_request('/api/v1/interface', 'GET')
    
    def get_firewall_rules(self):
        """Obter regras de firewall"""
        return self.make_request('/api/v1/firewall/rule', 'GET')
