from flask import Blueprint, request, jsonify
import logging
from database import db
import smtplib
from email.message import EmailMessage

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

# SMTP configuration endpoints
@config_bp.route('/config/smtp', methods=['GET'])
def get_smtp_config():
    try:
        config = db.get_smtp_config()
        return jsonify({'success': True, 'data': config})
    except Exception as e:
        logger.error(f'Error getting SMTP config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@config_bp.route('/config/smtp', methods=['POST'])
def save_smtp_config():
    try:
        data = request.get_json()
        db.save_smtp_config(
            data.get('host', ''),
            data.get('port', ''),
            data.get('username', ''),
            data.get('password', ''),
            data.get('useTls', True),
            data.get('useSsl', False),
            data.get('fromEmail', '')
        )
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error saving SMTP config: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@config_bp.route('/config/smtp/test', methods=['POST'])
def test_smtp_send():
    try:
        data = request.get_json()
        to_email = data.get('toEmail')
        if not to_email:
            return jsonify({'success': False, 'error': 'toEmail requerido'}), 400
        smtp = db.get_smtp_config()
        if not smtp:
            return jsonify({'success': False, 'error': 'SMTP não configurado'}), 400
        msg = EmailMessage()
        msg['Subject'] = 'Teste de SMTP - WireGuard Manager'
        msg['From'] = smtp.get('from_email') or smtp.get('username')
        msg['To'] = to_email
        msg.set_content('Este é um teste de envio SMTP. Se você recebeu este email, a configuração está correta.')
        host = smtp.get('host')
        port = int(smtp.get('port') or (587 if smtp.get('use_tls') else 25))
        username = smtp.get('username')
        password = smtp.get('password')
        use_tls = bool(smtp.get('use_tls'))
        use_ssl = bool(smtp.get('use_ssl'))
        if use_ssl:
            with smtplib.SMTP_SSL(host, port) as server:
                if username and password:
                    server.login(username, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port) as server:
                if use_tls:
                    server.starttls()
                if username and password:
                    server.login(username, password)
                server.send_message(msg)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'SMTP test send error: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500