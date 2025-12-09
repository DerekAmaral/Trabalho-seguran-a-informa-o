# Projeto de Gestão de Cursos - Fullstack

Este projeto é uma aplicação **fullstack** desenvolvida para gerenciar cursos com autenticação, roles de usuários e criptografia de dados. Ele demonstra conceitos como JWT, hashing de senha, criptografia de informações sensíveis e proteção de rotas por role.

---

## Tecnologias Utilizadas

**Backend:**
- Python 3.x
- FastAPI
- SQLAlchemy (ORM)
- SQLite (banco de dados - Mapeamento Objeto-Relacional)
- Passlib (hashing de senhas)
- Python-JOSE (JWT - secrect token)
- Cryptography (Fernet para criptografia de dados)

**Frontend:**
- React
- TypeScript
- Axios (requisições HTTP)
- React Router (navegação e rotas protegidas)
- Context API (gerenciamento de autenticação)

---


---

## Funcionalidades

### Backend (FastAPI)

1. **Autenticação e Autorização**
   - JWT para autenticação segura.
   - Hash de senhas com bcrypt.
   - Roles definidas: `student` e `teacher`.
   - Rotas protegidas de acordo com a role.

2. **Criptografia de Dados**
   - Nomes e descrições de cursos são armazenados **criptografados** no banco.
   - Busca pública descriptografa os dados antes de retornar os resultados.

3. **Endpoints**
   - `/auth/token` → Autenticação e geração de token JWT.
   - `/api/students` → Área restrita para alunos.
   - `/api/teachers` → Área restrita para professores.
   - `/api/courses` → Busca pública de cursos (criptografados).

4. **Banco de Dados**
   - SQLite (`sql_app.db`) com tabelas:
     - `users` → Armazena usuários com username, senha hash e role.
     - `courses` → Armazena cursos com nome e descrição criptografados.

---

### Frontend (React)

1. **Autenticação**
   - Context API (`AuthContext`) gerencia token, role e username.
   - Login via `/login`, salvando token no `localStorage`.
   - Logout limpa token e redireciona para a página pública.

2. **Rotas Protegidas**
   - `StudentDashboard` → Apenas para alunos.
   - `TeacherDashboard` → Apenas para professores.
   - Redirecionamento automático se o usuário não tiver acesso.

3. **Busca Pública**
   - Página inicial permite buscar cursos.
   - Faz requisição ao backend, descriptografa e filtra os resultados.

4. **Interface**
   - Navegação por menu com links dependendo do status de autenticação e role.
   - Feedback visual em caso de erro ou carregamento.

---

## Usuários de Teste

| Usuário     | Senha    | Role     |
|------------|---------|----------|
| student1   | pass123 | student  |
| teacher1   | pass123 | teacher  |

---

## Passo a Passo para Rodar o Projeto

### 1. Backend

1. Abra um terminal.
2. Navegue até a pasta do backend:

```bash
cd backend


python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload


cd frontend
npm install
npm run dev







