from cryptography.fernet import Fernet
import os

# Em uma aplicação real, esta chave deve ser armazenada em uma variável de ambiente (ENV),
# nunca diretamente no código fonte.
# Aqui estamos usando uma chave fixa apenas para fins de demonstração, garantindo que
# a reinicialização do servidor não impossibilite a descriptografia de dados já salvos.
KEY = b'wz9-1_y0l5sXJgJ9_ZzZ1zZ1zZ1zZ1zZ1zZ1zZ1zZ1z='  # Exemplo de chave Fernet (base64, 32 bytes)

# Normalmente, para gerar uma nova chave:
#   Fernet.generate_key()
# Mas para estabilidade no ambiente de teste, usamos uma chave fixa.
# Em produção: armazene a chave de forma segura (ENV, Vault, etc).

# Criação do objeto responsável pela criptografia e descriptografia
_cipher_suite = Fernet(KEY)


def encrypt_data(data: str) -> str:
    """
    Criptografa uma string e retorna o resultado codificado em base64.
    
    - data: texto puro que será criptografado
    - retorno: string criptografada (base64)
    """
    if not data:
        return ""
    
    # Converte a string para bytes, criptografa e reconverte para string
    return _cipher_suite.encrypt(data.encode()).decode()


def decrypt_data(token: str) -> str:
    """
    Descriptografa uma string criptografada (em base64) e retorna o texto original.
    
    - token: dado criptografado
    - retorno: dado original ou mensagem de erro caso falhe
    """
    if not token:
        return ""
    
    try:
        # Tenta descriptografar; caso o token seja inválido, gera exceção
        return _cipher_suite.decrypt(token.encode()).decode()
    except Exception:
        # Evita quebrar a aplicação caso haja erro na descriptografia
        return "[Error Decrypting]"
