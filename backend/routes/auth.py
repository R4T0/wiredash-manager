from flask import Blueprint, request, jsonify
import logging
from database import db

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
        if user and user['password'] == password and user['enabled']:
            return jsonify({'success': True, 'data': user})
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials or user disabled'}), 401
            
    except Exception as e:
        logger.error(f'Error during login: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500