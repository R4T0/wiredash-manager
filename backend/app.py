
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import logging
from routers.mikrotik import MikrotikRouter
from routers.opnsense import OPNsenseRouter
from routers.pfsense import PfsenseRouter
from database import db

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

# User management endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        users = db.get_users()
        return jsonify({'success': True, 'data': users})
    except Exception as e:
        logger.error(f'Error getting users: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create new user"""
    try:
        data = request.get_json()
        required_fields = ['name', 'email', 'password']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        user_id = db.create_user(
            data['name'], 
            data['email'], 
            data['password'], 
            data.get('enabled', True)
        )
        
        if user_id:
            return jsonify({'success': True, 'data': {'id': user_id}})
        else:
            return jsonify({'success': False, 'error': 'Email already exists'}), 400
            
    except Exception as e:
        logger.error(f'Error creating user: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    try:
        data = request.get_json()
        db.update_user(user_id, **data)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error updating user: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user"""
    try:
        db.delete_user(user_id)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error deleting user: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
        user = db.get_user_by_email(email)
        if user and user['password'] == password and user['enabled']:
            return jsonify({'success': True, 'data': user})
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials or user disabled'}), 401
            
    except Exception as e:
        logger.error(f'Error during login: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

# Router configuration endpoints
@app.route('/api/config/router', methods=['GET'])
def get_router_config():
    """Get router configuration"""
    try:
        config = db.get_router_config()
        return jsonify({'success': True, 'data': config})
    except Exception as e:
        logger.error(f'Error getting router config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/router', methods=['POST'])
def save_router_config():
    """Save router configuration"""
    try:
        data = request.get_json()
        required_fields = ['routerType', 'endpoint', 'user', 'password']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        db.save_router_config(
            data['routerType'],
            data['endpoint'], 
            data.get('port', ''),
            data['user'],
            data['password'],
            data.get('useHttps', False)
        )
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error saving router config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

# WireGuard configuration endpoints
@app.route('/api/config/wireguard', methods=['GET'])
def get_wireguard_config():
    """Get WireGuard configuration"""
    try:
        config = db.get_wireguard_config()
        return jsonify({'success': True, 'data': config})
    except Exception as e:
        logger.error(f'Error getting WireGuard config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/config/wireguard', methods=['POST'])
def save_wireguard_config():
    """Save WireGuard configuration"""
    try:
        data = request.get_json()
        
        db.save_wireguard_config(
            data.get('endpointPadrao', ''),
            data.get('portaPadrao', ''),
            data.get('rangeIpsPermitidos', ''),
            data.get('dnsCliente', '')
        )
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error saving WireGuard config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

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
