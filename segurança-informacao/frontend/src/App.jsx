import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from '../src/Login';
import Search from '../src/Search';
import StudentDashboard from '../src/StudentDashboard';
import TeacherDashboard from '../src/TeacherDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { role, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (role !== allowedRole) {
        if (role === 'student') return <Navigate to="/students" replace />;
        if (role === 'teacher') return <Navigate to="/teachers" replace />;
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const Navigation = () => {
    const { isAuthenticated, role, logout } = useAuth();
    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Busca (Pública)</Link>
            {!isAuthenticated && <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>}
            
            {isAuthenticated && role === 'student' && (
                <Link to="/students" style={{ marginRight: '10px' }}>Área do Aluno</Link>
            )}
            {isAuthenticated && role === 'teacher' && (
                <Link to="/teachers" style={{ marginRight: '10px' }}>Área do Professor</Link>
            )}
             {isAuthenticated && (
                 <button onClick={logout} style={{ float: 'right' }}>Sair</button>
             )}
        </nav>
    );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
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