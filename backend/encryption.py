import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding

class PasswordEncryption:
    def __init__(self):
        # Get encryption key from environment or use default (not recommended for production)
        self.key = os.environ.get('ENCRYPTION_KEY', 'default_32_char_key_not_for_prod')
        # Ensure key is exactly 32 bytes for AES-256
        if len(self.key) < 32:
            self.key = self.key.ljust(32, '0')[:32]
        else:
            self.key = self.key[:32]
        self.key = self.key.encode('utf-8')
    
    def encrypt_password(self, plain_password: str) -> str:
        """Encrypt password using AES-256-CBC"""
        if not plain_password:
            return ""
        
        try:
            # Generate random IV
            iv = os.urandom(16)
            
            # Create cipher
            cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            
            # Apply PKCS7 padding
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(plain_password.encode('utf-8'))
            padded_data += padder.finalize()
            
            # Encrypt
            encrypted = encryptor.update(padded_data) + encryptor.finalize()
            
            # Combine IV and encrypted data, then base64 encode
            encrypted_data = iv + encrypted
            return base64.b64encode(encrypted_data).decode('utf-8')
            
        except Exception as e:
            print(f"Error encrypting password: {str(e)}")
            return plain_password  # Fallback to plain text for backward compatibility
    
    def decrypt_password(self, encrypted_password: str) -> str:
        """Decrypt password using AES-256-CBC"""
        if not encrypted_password:
            return ""
        
        try:
            # Decode base64
            encrypted_data = base64.b64decode(encrypted_password.encode('utf-8'))
            
            # Extract IV and encrypted content
            iv = encrypted_data[:16]
            encrypted_content = encrypted_data[16:]
            
            # Create cipher
            cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            
            # Decrypt
            decrypted_padded = decryptor.update(encrypted_content) + decryptor.finalize()
            
            # Remove PKCS7 padding
            unpadder = padding.PKCS7(128).unpadder()
            decrypted = unpadder.update(decrypted_padded)
            decrypted += unpadder.finalize()
            
            return decrypted.decode('utf-8')
            
        except Exception as e:
            print(f"Error decrypting password: {str(e)}")
            # Assume it's plain text (for backward compatibility)
            return encrypted_password
    
    def is_encrypted(self, password: str) -> bool:
        """Check if password is already encrypted"""
        try:
            # Try to decode as base64 and check if it's likely encrypted
            decoded = base64.b64decode(password.encode('utf-8'))
            return len(decoded) >= 16  # Must have at least IV length
        except:
            return False

# Global encryption instance
password_encryption = PasswordEncryption()