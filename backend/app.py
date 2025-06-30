from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import logging
from routers.mikrotik import MikrotikRouter
from routers.opnsense import OPNsenseRouter
from routers.pfsense import PfsenseRouter

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas as rotas

# Mapeamento dos tipos de roteadores
ROUTER_CLASSES = {
    'mikrotik': MikrotikRouter,
    'opnsense': OPNsenseRouter,
    'pfsense': PfsenseRouter
}

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se o serviço está funcionando"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'Multi-Router API Proxy',
        'supported_routers': list(ROUTER_CLASSES.keys())
    })

@app.route('/api/router/proxy', methods=['POST'])
def router_proxy():
    """
    Proxy genérico para requisições de API de diferentes roteadores
    Espera um JSON com: routerType, endpoint, port, user, password, useHttps, path
    """
    try:
        # Validar se é uma requisição JSON
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
        
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['routerType', 'endpoint', 'user', 'password', 'path']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo obrigatório ausente: {field}'}), 400
        
        router_type = data['routerType'].lower()
        
        # Verificar se o tipo de roteador é suportado
        if router_type not in ROUTER_CLASSES:
            return jsonify({
                'error': f'Tipo de roteador não suportado: {router_type}',
                'supported_types': list(ROUTER_CLASSES.keys())
            }), 400
        
        # Instanciar a classe específica do roteador
        router_class = ROUTER_CLASSES[router_type]
        router = router_class(
            endpoint=data['endpoint'],
            port=data.get('port', ''),
            user=data['user'],
            password=data['password'],
            use_https=data.get('useHttps', False)
        )
        
        # Fazer a requisição através da classe específica
        result = router.make_request(
            path=data['path'],
            method=data.get('method', 'GET'),
            body=data.get('body')
        )
        
        return jsonify(result), result.get('status', 200)
        
    except Exception as e:
        logger.error(f'Erro interno: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'code': 'INTERNAL_ERROR'
        }), 500

@app.route('/api/router/test-connection', methods=['POST'])
def test_router_connection():
    """
    Endpoint específico para testar conexão com diferentes tipos de roteadores
    """
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['routerType', 'endpoint', 'user', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Campo obrigatório ausente: {field}'}), 400
        
        router_type = data['routerType'].lower()
        
        # Verificar se o tipo de roteador é suportado
        if router_type not in ROUTER_CLASSES:
            return jsonify({
                'error': f'Tipo de roteador não suportado: {router_type}',
                'supported_types': list(ROUTER_CLASSES.keys())
            }), 400
        
        # Instanciar a classe específica do roteador
        router_class = ROUTER_CLASSES[router_type]
        router = router_class(
            endpoint=data['endpoint'],
            port=data.get('port', ''),
            user=data['user'],
            password=data['password'],
            use_https=data.get('useHttps', False)
        )
        
        # Testar conexão usando o método específico de cada roteador
        result = router.test_connection()
        
        return jsonify(result), result.get('status', 200)
        
    except Exception as e:
        logger.error(f'Erro no teste de conexão: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro no teste de conexão',
            'code': 'TEST_ERROR'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
