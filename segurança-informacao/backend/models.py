from sqlalchemy import Boolean, Column, Integer, String, Enum
from database import Base
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Stored as string, validated as Enum in Pydantic

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    # The requirement says: "Utilize mecanismos criptográficos para... dados a serem exibidos"
    # We will store the name and description encrypted.
    # We will NOT be able to easily search via SQL LIKE on these fields.
    encrypted_name = Column(String)
    encrypted_description = Column(String)
