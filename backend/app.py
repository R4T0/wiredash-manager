
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import json
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas as rotas

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o serviço está funcionando"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'Mikrotik API Proxy'
    })

@app.route('/api/mikrotik/proxy', methods=['POST'])
def mikrotik_proxy():
    """
    Proxy para requisições da API REST do Mikrotik
    Espera um JSON com: endpoint, port, user, password, useHttps, path
    """
    try:
        # Validar se é uma requisição JSON
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
        
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['endpoint', 'user', 'password', 'path']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo obrigatório ausente: {field}'}), 400
        
        # Extrair dados da requisição
        endpoint = data['endpoint']
        port = data.get('port', '')
        user = data['user']
        password = data['password']
        use_https = data.get('useHttps', False)
        api_path = data['path']
        method = data.get('method', 'GET')
        request_body = data.get('body')
        
        # Construir URL
        protocol = 'https' if use_https else 'http'
        port_suffix = f':{port}' if port else ''
        url = f'{protocol}://{endpoint}{port_suffix}{api_path}'
        
        logger.info(f'Fazendo requisição {method} para: {url}')
        
        # Preparar credenciais Basic Auth
        credentials = base64.b64encode(f'{user}:{password}'.encode()).decode()
        
        # Headers da requisição
        headers = {
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json'
        }
        
        # Fazer a requisição para o Mikrotik
        start_time = datetime.now()
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=10, verify=False)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=request_body, timeout=10, verify=False)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=headers, json=request_body, timeout=10, verify=False)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10, verify=False)
        else:
            return jsonify({'error': f'Método HTTP não suportado: {method}'}), 400
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds() * 1000
        
        logger.info(f'Resposta recebida - Status: {response.status_code}, Tempo: {duration:.2f}ms')
        
        # Preparar resposta
        try:
            response_data = response.json() if response.content else {}
        except json.JSONDecodeError:
            response_data = {'raw_response': response.text}
        
        return jsonify({
            'success': True,
            'status': response.status_code,
            'data': response_data,
            'headers': dict(response.headers),
            'duration_ms': round(duration, 2),
            'url': url,
            'method': method.upper()
        }), response.status_code
        
    except requests.exceptions.Timeout:
        logger.error('Timeout na requisição para o Mikrotik')
        return jsonify({
            'success': False,
            'error': 'Timeout na conexão com o roteador',
            'code': 'TIMEOUT'
        }), 408
        
    except requests.exceptions.ConnectionError:
        logger.error('Erro de conexão com o Mikrotik')
        return jsonify({
            'success': False,
            'error': 'Não foi possível conectar ao roteador',
            'code': 'CONNECTION_ERROR'
        }), 503
        
    except requests.exceptions.RequestException as e:
        logger.error(f'Erro na requisição: {str(e)}')
        return jsonify({
            'success': False,
            'error': f'Erro na requisição: {str(e)}',
            'code': 'REQUEST_ERROR'
        }), 500
        
    except Exception as e:
        logger.error(f'Erro interno: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'code': 'INTERNAL_ERROR'
        }), 500

@app.route('/api/mikrotik/test-connection', methods=['POST'])
def test_mikrotik_connection():
    """
    Endpoint específico para testar conexão com Mikrotik
    """
    try:
        data = request.get_json()
        
        # Usar o endpoint de system/resource para teste
        test_data = {
            **data,
            'path': '/rest/system/resource',
            'method': 'GET'
        }
        
        # Reutilizar a lógica do proxy
        return mikrotik_proxy()
        
    except Exception as e:
        logger.error(f'Erro no teste de conexão: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro no teste de conexão',
            'code': 'TEST_ERROR'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
