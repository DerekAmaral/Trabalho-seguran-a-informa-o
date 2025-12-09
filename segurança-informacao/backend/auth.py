from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Chave secreta usada para assinar o token JWT
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

# Algoritmo de criptografia utilizado para gerar o token
ALGORITHM = "HS256"

# Tempo de expiração padrão do token de acesso (em minutos)
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Define o contexto de criptografia utilizando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    """
    Gera o hash de uma senha utilizando bcrypt.
    O bcrypt aceita apenas os primeiros 72 caracteres, por isso a senha é truncada.
    """
    truncated_password = password[:72]  # Limita ao tamanho suportado pelo bcrypt
    return pwd_context.hash(truncated_password)


def verify_password(plain_password, hashed_password):
    """
    Verifica se a senha fornecida corresponde ao hash armazenado.
    A senha é truncada para garantir compatibilidade com bcrypt.
    """
    truncated_password = plain_password[:72]
    return pwd_context.verify(truncated_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Cria um token JWT contendo os dados fornecidos.
    - 'data' é um dicionário que será codificado no token.
    - 'expires_delta' define o tempo de expiração; caso não seja fornecido,
      o token expira em 15 minutos.
    """
    to_encode = data.copy()  # Copia os dados para não alterar o original

    # Define o tempo de expiração do token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    # Adiciona no payload o campo de expiração
    to_encode.update({"exp": expire})

    # Gera o token JWT assinado com a chave secreta e o algoritmo definido
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt
