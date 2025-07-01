
import requests
import base64
import json
from datetime import datetime
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseRouter(ABC):
    """Classe base para todos os tipos de roteadores"""
    
    def __init__(self, endpoint, port, user, password, use_https=False):
        self.endpoint = endpoint
        self.port = port
        self.user = user
        self.password = password
        self.use_https = use_https
        
        # Construir URL base
        protocol = 'https' if use_https else 'http'
        port_suffix = f':{port}' if port else ''
        self.base_url = f'{protocol}://{endpoint}{port_suffix}'
        
        logger.info(f'Router initialized with base URL: {self.base_url} (HTTPS: {use_https})')
    
    def get_auth_headers(self):
        """Gerar headers de autenticação básica"""
        credentials = base64.b64encode(f'{self.user}:{self.password}'.encode()).decode()
        return {
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json'
        }
    
    def make_request(self, path, method='GET', body=None):
        """Fazer requisição HTTP genérica"""
        try:
            url = f'{self.base_url}{path}'
            headers = self.get_auth_headers()
            
            logger.info(f'Fazendo requisição {method} para: {url} (HTTPS: {self.use_https})')
            
            start_time = datetime.now()
            
            # Configurar verificação SSL baseada no protocolo
            verify_ssl = self.use_https
            
            # Fazer requisição baseada no método
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10, verify=verify_ssl)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=body, timeout=10, verify=verify_ssl)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=body, timeout=10, verify=verify_ssl)
            elif method.upper() == 'PATCH':
                response = requests.patch(url, headers=headers, json=body, timeout=10, verify=verify_ssl)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10, verify=verify_ssl)
            else:
                return {
                    'success': False,
                    'error': f'Método HTTP não suportado: {method}',
                    'code': 'UNSUPPORTED_METHOD'
                }
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds() * 1000
            
            logger.info(f'Resposta recebida - Status: {response.status_code}, Tempo: {duration:.2f}ms, URL: {url}')
            
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
                'router_type': self.get_router_type(),
                'protocol': 'HTTPS' if self.use_https else 'HTTP'
            }
            
        except requests.exceptions.Timeout:
            logger.error('Timeout na requisição')
            return {
                'success': False,
                'error': 'Timeout na conexão com o roteador',
                'code': 'TIMEOUT',
                'router_type': self.get_router_type()
            }
            
        except requests.exceptions.ConnectionError:
            logger.error('Erro de conexão')
            return {
                'success': False,
                'error': 'Não foi possível conectar ao roteador',
                'code': 'CONNECTION_ERROR',
                'router_type': self.get_router_type()
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f'Erro na requisição: {str(e)}')
            return {
                'success': False,
                'error': f'Erro na requisição: {str(e)}',
                'code': 'REQUEST_ERROR',
                'router_type': self.get_router_type()
            }
    
    @abstractmethod
    def get_router_type(self):
        """Retornar o tipo do roteador"""
        pass
    
    @abstractmethod
    def get_default_test_path(self):
        """Retornar o path padrão para teste de conexão"""
        pass
    
    @abstractmethod
    def test_connection(self):
        """Testar conexão com o roteador"""
        pass
