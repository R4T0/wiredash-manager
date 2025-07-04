from flask import Blueprint, request, jsonify
import logging
from database import db

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        users = db.get_users()
        return jsonify({'success': True, 'data': users})
    except Exception as e:
        logger.error(f'Error getting users: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users', methods=['POST'])
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

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    try:
        data = request.get_json()
        db.update_user(user_id, **data)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error updating user: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user"""
    try:
        db.delete_user(user_id)
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f'Error deleting user: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500