
from .base import BaseRouter
import requests
import json

class UnifiRouter(BaseRouter):
    """Classe específica para controladores Unifi"""
    
    def __init__(self, endpoint, port, user, password, use_https=True):
        # Unifi geralmente usa HTTPS por padrão
        super().__init__(endpoint, port or '8443', user, password, use_https)
        self.session = requests.Session()
        self.session.verify = False  # Unifi usa certificados auto-assinados
        
    def get_router_type(self):
        return 'unifi'
    
    def get_default_test_path(self):
        """Path padrão para teste de conexão no Unifi"""
        return '/api/self'
    
    def authenticate(self):
        """Autenticar com o controlador Unifi"""
        try:
            login_url = f'{self.base_url}/api/login'
            login_data = {
                'username': self.user,
                'password': self.password
            }
            
            response = self.session.post(
                login_url,
                json=login_data,
                timeout=10
            )
            
            return response.status_code == 200
            
        except Exception as e:
            return False
    
    def make_request(self, path, method='GET', body=None):
        """Fazer requisição HTTP específica para Unifi"""
        try:
            # Tentar autenticar primeiro
            if not self.authenticate():
                return {
                    'success': False,
                    'error': 'Falha na autenticação com o controlador Unifi',
                    'code': 'AUTH_ERROR',
                    'router_type': self.get_router_type()
                }
            
            url = f'{self.base_url}{path}'
            
            start_time = datetime.now()
            
            # Fazer requisição baseada no método
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=10)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=body, timeout=10)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=body, timeout=10)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, timeout=10)
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
                'error': f'Erro na requisição Unifi: {str(e)}',
                'code': 'REQUEST_ERROR',
                'router_type': self.get_router_type()
            }
    
    def test_connection(self):
        """Testar conexão com controlador Unifi"""
        return self.make_request(
            path=self.get_default_test_path(),
            method='GET'
        )
    
    def get_sites(self):
        """Obter lista de sites"""
        return self.make_request('/api/self/sites', 'GET')
    
    def get_devices(self, site='default'):
        """Obter dispositivos de um site"""
        return self.make_request(f'/api/s/{site}/stat/device', 'GET')
    
    def get_clients(self, site='default'):
        """Obter clientes conectados"""
        return self.make_request(f'/api/s/{site}/stat/sta', 'GET')
