from flask import Blueprint, request, jsonify
import logging
from database import db

logger = logging.getLogger(__name__)

config_bp = Blueprint('config', __name__)

# Router configuration endpoints
@config_bp.route('/config/router', methods=['GET'])
def get_router_config():
    """Get router configuration"""
    try:
        config = db.get_router_config()
        return jsonify({'success': True, 'data': config})
    except Exception as e:
        logger.error(f'Error getting router config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@config_bp.route('/config/router', methods=['POST'])
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
@config_bp.route('/config/wireguard', methods=['GET'])
def get_wireguard_config():
    """Get WireGuard configuration"""
    try:
        config = db.get_wireguard_config()
        return jsonify({'success': True, 'data': config})
    except Exception as e:
        logger.error(f'Error getting WireGuard config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@config_bp.route('/config/wireguard', methods=['POST'])
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