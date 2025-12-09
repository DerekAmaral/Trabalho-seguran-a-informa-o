import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from '../src/Login';
import Search from '../src/Search';
import StudentDashboard from '../src/StudentDashboard';
import TeacherDashboard from '../src/TeacherDashboard';


// ---------------------------------------------------------------------------
//   Componente de rota protegida
//   - Só permite acesso se o usuário estiver autenticado
//   - Verifica o papel (student / teacher) antes de liberar o conteúdo
// ---------------------------------------------------------------------------
const ProtectedRoute = ({ children, allowedRole }) => {
    const { role, isAuthenticated } = useAuth();

    // Usuário não logado → redireciona para login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Usuário logado, mas com papel diferente → redireciona para sua área correta
    if (role !== allowedRole) {
        if (role === 'student') return <Navigate to="/students" replace />;
        if (role === 'teacher') return <Navigate to="/teachers" replace />;
        return <Navigate to="/" replace />;
    }

    // Tudo ok → renderiza o componente interno
    return <>{children}</>;
};


// ---------------------------------------------------------------------------
//   Barra de navegação superior
//   - Exibe links de acordo com o papel do usuário
//   - Mostra botão de logout quando logado
// ---------------------------------------------------------------------------
const Navigation = () => {
    const { isAuthenticated, role, logout } = useAuth();

    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
            {/* Link sempre disponível (rota pública) */}
            <Link to="/" style={{ marginRight: '10px' }}>Busca (Pública)</Link>

            {/* Link de login só aparece se o usuário não estiver autenticado */}
            {!isAuthenticated && <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>}

            {/* Links condicionais para cada tipo de usuário */}
            {isAuthenticated && role === 'student' && (
                <Link to="/students" style={{ marginRight: '10px' }}>Área do Aluno</Link>
            )}

            {isAuthenticated && role === 'teacher' && (
                <Link to="/teachers" style={{ marginRight: '10px' }}>Área do Professor</Link>
            )}

            {/* Botão de logout */}
            {isAuthenticated && (
                <button onClick={logout} style={{ float: 'right' }}>Sair</button>
            )}
        </nav>
    );
};


// ---------------------------------------------------------------------------
//   Componente principal da aplicação
//   - Envolve tudo com AuthProvider (contexto de autenticação)
//   - Define todas as rotas do sistema
// ---------------------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Barra de navegação comum a todas as páginas */}
        <Navigation />

        {/* Configuração das rotas */}
        <Routes>
          {/* Rota pública */}
          <Route path="/" element={<Search />} />

          {/* Rota de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rota protegida para alunos */}
          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Rota protegida para professores */}
          <Route 
            path="/teachers" 
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
