// ---------------------------------------------------------------------------
//  AuthContext
//
//  Este arquivo define o sistema de autenticação do frontend usando
//  Context API do React. Ele centraliza:
//
//   ✔ Armazenamento do token JWT, papel (role) e username do usuário
//   ✔ Login e logout (incluindo salvar/remover dados do localStorage)
//   ✔ Persistência da sessão mesmo após recarregar a página
//   ✔ Configuração automática do header Authorization do Axios
//   ✔ Um hook personalizado (useAuth) para acessar facilmente esses dados
//
//  Em resumo:
//  O AuthContext funciona como um "provedor global" de autenticação,
//  permitindo que qualquer componente da aplicação acesse o estado de login,
//  sem precisar passar props manualmente.
// ---------------------------------------------------------------------------

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  login: (token: string, role: string, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Criação do contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// ---------------------------------------------------------------------------
//  AuthProvider
//
//  Componente que envolve a aplicação inteira, fornecendo o contexto
//  de autenticação para todos os componentes filhos.
// ---------------------------------------------------------------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Estado inicial obtido do localStorage para persistência entre recarregamentos
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));


  // -------------------------------------------------------------------------
  // login
  //
  // Função para autenticar o usuário:
  // 1. Salva token, role e username no localStorage
  // 2. Atualiza os estados internos do contexto
  // 3. Configura o header Authorization do Axios para requisições autenticadas
  // -------------------------------------------------------------------------
  const login = (newToken: string, newRole: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('username', newUsername);
    
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };


  // -------------------------------------------------------------------------
  // logout
  //
  // Função para deslogar o usuário:
  // 1. Remove token, role e username do localStorage
  // 2. Limpa os estados internos do contexto
  // 3. Remove o header Authorization do Axios
  // -------------------------------------------------------------------------
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    setToken(null);
    setRole(null);
    setUsername(null);

    delete axios.defaults.headers.common['Authorization'];
  };


  // -------------------------------------------------------------------------
  // useEffect
  //
  // Sempre que o token mudar (login ou logout), garante que o header
  // Authorization do Axios esteja atualizado, permitindo requisições autenticadas
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);


  // -------------------------------------------------------------------------
  // Provider
  //
  // Disponibiliza todos os valores e funções do AuthContext para os filhos
  // -------------------------------------------------------------------------
  return (
    <AuthContext.Provider value={{ token, role, username, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};


// ---------------------------------------------------------------------------
// useAuth
//
// Hook personalizado para acessar o contexto de autenticação
// 1. Garante que o hook seja usado apenas dentro de um AuthProvider
// 2. Facilita o acesso ao token, role, username, login e logout
// ---------------------------------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
