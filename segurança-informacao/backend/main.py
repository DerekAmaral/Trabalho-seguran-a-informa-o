from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models, auth, database, crypto_utils

# -------------------------------------------------------------------
#   Criação das tabelas no banco de dados, caso não existam
# -------------------------------------------------------------------
models.Base.metadata.create_all(bind=database.engine)

# Instância principal da aplicação FastAPI
app = FastAPI()

# -------------------------------------------------------------------
#   Configuração de CORS – necessário para permitir acesso do React
# -------------------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Endereços autorizados para acessar a API
    allow_credentials=True,
    allow_methods=["*"],           # Permite todos os métodos HTTP
    allow_headers=["*"],           # Permite todos os headers
)

# -------------------------------------------------------------------
#   Modelos Pydantic – usados para entrada e saída de dados
# -------------------------------------------------------------------
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: models.UserRole           # Enum do SQLAlchemy

class UserDisplay(UserBase):
    role: str
    class Config:
        from_attributes = True      # Permite converter automaticamente de modelo SQLAlchemy

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class CourseDisplay(BaseModel):
    id: int
    name: str
    description: str
    class Config:
        from_attributes = True


# -------------------------------------------------------------------
#   Configuração de Autenticação OAuth2 (JWT)
# -------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    """
    Obtém o usuário logado a partir do token JWT.
    - Decodifica o token
    - Valida o usuário no banco
    - Retorna o objeto User
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decodifica o token JWT
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        
        # Verifica se há username válido
        if username is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
    
    # Busca usuário no banco - busca usuário de forma segura usando SQLAlchemy ORM
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if user is None:
        raise credentials_exception

    return user


def require_role(role: str):
    """
    Middleware de autorização baseado em papéis (RBAC).
    - Permite acesso ao endpoint apenas se o usuário tiver o papel especificado.
    """
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User is not a {role}"
            )
        return current_user
    return role_checker


# -------------------------------------------------------------------
#   ENDPOINTS
# -------------------------------------------------------------------

@app.post("/auth/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    """
    Endpoint de login.
    - Verifica se usuário e senha estão corretos
    - Gera um token JWT com nome e papel do usuário
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Credenciais inválidas
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cria token de acesso com tempo de expiração
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }


@app.get("/api/students", dependencies=[Depends(require_role("student"))])
def read_student_area():
    """
    Área acessível apenas por usuários com papel 'student'.
    """
    return {"message": "Welcome to the Student Area", "data": "Exclusive Student Content"}


@app.get("/api/teachers", dependencies=[Depends(require_role("teacher"))])
def read_teacher_area():
    """
    Área acessível apenas por usuários com papel 'teacher'.
    """
    return {"message": "Welcome to the Teacher Area", "data": "Exclusive Teacher Content"}


@app.get("/api/courses", response_model=List[CourseDisplay])
def search_courses(
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    """
    Busca pública de cursos.
    - Faz consulta ao banco de dados
    - Descriptografa nome e descrição
    - Permite busca parcial (case-insensitive)
    """
    all_courses = db.query(models.Course).all()
    results = []
    
    for course in all_courses:
        # Descriptografa campos
        decrypted_name = crypto_utils.decrypt_data(course.encrypted_name)
        decrypted_desc = crypto_utils.decrypt_data(course.encrypted_description)
        
        # Se houver termo de busca, faz filtro
        if search:
            s_term = search.lower()
            if s_term in decrypted_name.lower() or s_term in decrypted_desc.lower():
                results.append(CourseDisplay(
                    id=course.id,
                    name=decrypted_name,
                    description=decrypted_desc
                ))
        else:
            # Se não houver termo, retorna todos
            results.append(CourseDisplay(
                id=course.id,
                name=decrypted_name,
                description=decrypted_desc
            ))
            
    return results


# -------------------------------------------------------------------
#   Função de Seed (popular o banco com dados iniciais)
# -------------------------------------------------------------------
def seed_data():
    """
    Insere usuários de teste e cursos criptografados
    caso o banco esteja vazio.
    """
    db = database.SessionLocal()

    # Apenas insere se ainda não existirem usuários
    if not db.query(models.User).first():
        
        # Usuário estudante
        student = models.User(
            username="student1",
            hashed_password=auth.get_password_hash("pass123"),
            role="student"
        )

        # Usuário professor
        teacher = models.User(
            username="teacher1",
            hashed_password=auth.get_password_hash("pass123"),
            role="teacher"
        )

        db.add(student)
        db.add(teacher)
        
        # Cursos exemplo (dados serão criptografados)
        courses_data = [
            ("Matemática Básica", "Curso de introdução a cálculo e álgebra."),
            ("Programação Web", "Fundamentos de HTML, CSS e JavaScript."),
            ("Segurança da Informação", "Criptografia, hashes e segurança."),
            ("Banco de Dados", "Modelagem relacional e SQL."),
            ("Redes de Computadores", "TCP/IP, DNS, protocolos e infraestrutura.")
        ]
        
        for name, desc in courses_data:
            c = models.Course(
                encrypted_name=crypto_utils.encrypt_data(name),
                encrypted_description=crypto_utils.encrypt_data(desc)
            )
            db.add(c)
            
        db.commit()

    db.close()


# Executa o seed ao iniciar
seed_data()
