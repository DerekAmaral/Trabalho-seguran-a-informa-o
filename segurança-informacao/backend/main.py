from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models, auth, database, crypto_utils

# Create DB Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS for React
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: models.UserRole

class UserDisplay(UserBase):
    role: str
    class Config:
        from_attributes = True

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

# --- Auth Dependencies ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(role: str):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User is not a {role}"
            )
        return current_user
    return role_checker

# --- Endpoints ---

@app.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "username": user.username}

@app.get("/api/students", dependencies=[Depends(require_role("student"))])
def read_student_area():
    return {"message": "Welcome to the Student Area", "data": "Exclusive Student Content"}

@app.get("/api/teachers", dependencies=[Depends(require_role("teacher"))])
def read_teacher_area():
    return {"message": "Welcome to the Teacher Area", "data": "Exclusive Teacher Content"}

@app.get("/api/courses", response_model=List[CourseDisplay])
def search_courses(search: Optional[str] = Query(None), db: Session = Depends(database.get_db)):
    """
    Public search interface.
    Fetches encrypted data, decrypts it, and filters based on search term.
    This fulfills the requirement of searching on encrypted data.
    """
    all_courses = db.query(models.Course).all()
    results = []
    
    for course in all_courses:
        decrypted_name = crypto_utils.decrypt_data(course.encrypted_name)
        decrypted_desc = crypto_utils.decrypt_data(course.encrypted_description)
        
        # Simple case-insensitive search
        if search:
            s_term = search.lower()
            if s_term in decrypted_name.lower() or s_term in decrypted_desc.lower():
                results.append(CourseDisplay(
                    id=course.id,
                    name=decrypted_name,
                    description=decrypted_desc
                ))
        else:
            # Return all if no search term
            results.append(CourseDisplay(
                id=course.id,
                name=decrypted_name,
                description=decrypted_desc
            ))
            
    return results

# --- Seed Data Helper ---
def seed_data():
    db = database.SessionLocal()
    if not db.query(models.User).first():
        # Create Student
        student = models.User(
            username="student1",
            hashed_password=auth.get_password_hash("pass123"), # Salted hash
            role="student"
        )
        # Create Teacher
        teacher = models.User(
            username="teacher1",
            hashed_password=auth.get_password_hash("pass123"), # Salted hash
            role="teacher"
        )
        db.add(student)
        db.add(teacher)
        
        # Create Encrypted Courses
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

# Run seed on startup
seed_data()
