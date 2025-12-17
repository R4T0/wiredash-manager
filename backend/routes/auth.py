from flask import Blueprint, request, jsonify
import logging
from database import db
import bcrypt
import os
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
import secrets

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password required'}), 400
        
        user = db.get_user_by_email(email)
        if user and user.get('enabled'):
            stored = user.get('password', '')
            if isinstance(stored, str) and stored.startswith(('$2a$', '$2b$', '$2y$')):
                if bcrypt.checkpw(password.encode('utf-8'), stored.encode('utf-8')):
                    return jsonify({'success': True, 'data': user})
            else:
                if stored == password:
                    db.update_user(user['id'], password=password)
                    return jsonify({'success': True, 'data': user})
        return jsonify({'success': False, 'error': 'Invalid credentials or user disabled'}), 401
            
    except Exception as e:
        logger.error(f'Error during login: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/request-password-reset', methods=['POST'])
def request_password_reset():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({'success': False, 'error': 'Email requerido'}), 400
        user = db.get_user_by_email(email)
        if not user or not user.get('enabled'):
            return jsonify({'success': True})
        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now() + timedelta(hours=1)).isoformat()
        db.create_password_reset_token(user['id'], token, expires_at)
        smtp = db.get_smtp_config()
        if not smtp:
            return jsonify({'success': False, 'error': 'SMTP não configurado'}), 500
        app_url = os.environ.get('APP_URL', '').rstrip('/')
        reset_link = f"{app_url}/reset-password?token={token}" if app_url else f"/reset-password?token={token}"
        send_reset_email(smtp, email, reset_link)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error requesting password reset: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')
        if not token or not new_password:
            return jsonify({'success': False, 'error': 'Token e nova senha são requeridos'}), 400
        token_row = db.get_password_reset_token(token)
        if not token_row:
            return jsonify({'success': False, 'error': 'Token inválido'}), 400
        if token_row.get('used'):
            return jsonify({'success': False, 'error': 'Token já utilizado'}), 400
        if datetime.fromisoformat(token_row['expires_at']) < datetime.now():
            return jsonify({'success': False, 'error': 'Token expirado'}), 400
        db.update_user(token_row['user_id'], password=new_password)
        db.mark_token_used(token)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error resetting password: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

def send_reset_email(smtp_config, to_email, reset_link):
    msg = EmailMessage()
    msg['Subject'] = 'Recuperação de senha'
    msg['From'] = smtp_config.get('from_email') or smtp_config.get('username')
    msg['To'] = to_email
    msg.set_content(f"Para redefinir sua senha, acesse: {reset_link}")
    host = smtp_config.get('host')
    port = int(smtp_config.get('port') or (587 if smtp_config.get('use_tls') else 25))
    username = smtp_config.get('username')
    password = smtp_config.get('password')
    use_tls = bool(smtp_config.get('use_tls'))
    use_ssl = bool(smtp_config.get('use_ssl'))
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