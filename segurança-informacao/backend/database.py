from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexão com o banco de dados.
# Neste caso, estamos usando SQLite, armazenado no arquivo local "sql_app.db".
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Criação do engine, responsável pela comunicação com o banco de dados.
# O parâmetro "check_same_thread=False" é necessário para permitir que diferentes
# threads acessem a mesma conexão em SQLite (útil em aplicações FastAPI).
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Criação da fábrica de sessões (SessionLocal),
# que será utilizada para criar sessões de banco de dados por requisição.
SessionLocal = sessionmaker(
    autocommit=False,  # Desabilita commit automático (cada operação é explícita)
    autoflush=False,   # Desabilita flush automático para maior controle
    bind=engine        # Vincula a sessão ao engine configurado acima
)

# Classe base para os modelos ORM (tabelas do banco de dados).
# Todos os modelos devem herdar desta classe.
Base = declarative_base()


def get_db():
    """
    Gerador de sessões de banco de dados.
    
    É usado normalmente como dependência no FastAPI.
    Abre uma sessão, entrega para o endpoint,
    e garante o fechamento da sessão ao final da requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Fecha a sessão, evitando vazamentos de conexão
