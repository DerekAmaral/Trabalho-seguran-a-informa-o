from sqlalchemy import Boolean, Column, Integer, String, Enum
from database import Base
import enum

# -------------------------------------------------------------------
#   Enum representando os papéis que um usuário pode ter no sistema
# -------------------------------------------------------------------
class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"


# -------------------------------------------------------------------
#   Modelo User – tabela de usuários
# -------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"  # Nome da tabela no banco de dados

    # ID único do usuário (chave primária)
    id = Column(Integer, primary_key=True, index=True)

    # Nome de usuário – precisa ser único para autenticação
    username = Column(String, unique=True, index=True)

    # Senha armazenada no formato HASH (nunca em texto puro!)
    hashed_password = Column(String)

    # Papel do usuário (student / teacher)
    # Armazenado como String no banco, mas validado como Enum no Pydantic
    role = Column(String)


# -------------------------------------------------------------------
#   Modelo Course – tabela de cursos
# -------------------------------------------------------------------
class Course(Base):
    __tablename__ = "courses"

    # ID do curso (chave primária)
    id = Column(Integer, primary_key=True, index=True)

    # O requisito do projeto exige que nome e descrição fiquem criptografados.
    # Portanto, não é possível realizar busca direta via SQL (ex: LIKE).
    
    # Nome do curso criptografado com Fernet
    encrypted_name = Column(String)

    # Descrição do curso criptografada com Fernet
    encrypted_description = Column(String)
