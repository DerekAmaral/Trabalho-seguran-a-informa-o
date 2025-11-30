from cryptography.fernet import Fernet
import os

# In a real app, this should be an env var
# We will generate one if it doesn't exist, or use a hardcoded one for this demo
# to ensure restarting the server doesn't break decryption of existing data
KEY = b'wz9-1_y0l5sXJgJ9_ZzZ1zZ1zZ1zZ1zZ1zZ1zZ1zZ1z=' # Example 32-url-safe base64-encoded bytes

# However, for a proper demo, let's generate a key if not present and store it, 
# or just use a fixed key for reproducibility in this session.
# I'll stick to a fixed key for stability during this session.
# Generating a new key: Fernet.generate_key()

_cipher_suite = Fernet(KEY)

def encrypt_data(data: str) -> str:
    """Encrypts a string and returns a base64 string."""
    if not data:
        return ""
    return _cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    """Decrypts a base64 string and returns the original string."""
    if not token:
        return ""
    try:
        return _cipher_suite.decrypt(token.encode()).decode()
    except Exception:
        return "[Error Decrypting]"
