import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Componente Login
//
// Componente de formulário de login do usuário.
// - Recebe usuário e senha
// - Faz requisição POST para obter token JWT e informações do usuário
// - Salva credenciais no AuthContext
// - Redireciona o usuário de acordo com seu papel (student/teacher)
// ---------------------------------------------------------------------------
const Login: React.FC = () => {
  // Estados para armazenar valores do formulário e mensagens de erro
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Função de login do AuthContext
  const { login } = useAuth();

  // Hook do React Router para redirecionamento
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // handleSubmit
  //
  // Função chamada ao submeter o formulário:
  // 1. Evita comportamento padrão do form
  // 2. Limpa mensagens de erro
  // 3. Prepara FormData compatível com OAuth2PasswordRequestForm do backend
  // 4. Faz POST para obter token
  // 5. Salva token, role e username no AuthContext
  // 6. Redireciona para a área correta conforme papel do usuário
  // 7. Caso falhe, exibe mensagem de erro
  // -------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // FormData é necessário para compatibilidade com OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8000/auth/token', formData);
      const { access_token, role, username: user } = response.data;

      // Salva dados no AuthContext
      login(access_token, role, user);

      // Redireciona para a rota adequada conforme papel
      if (role === 'student') {
        navigate('/students');
      } else if (role === 'teacher') {
        navigate('/teachers');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Exibe mensagem de erro caso login falhe
      setError('Login falhou. Verifique suas credenciais.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', maxWidth: '300px', margin: '20px auto' }}>
      <h2>Login</h2>

      {/* Exibe mensagem de erro se houver */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Usuário:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Senha:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit">Entrar</button>
      </form>

      {/* Informações de usuários de teste */}
      <div style={{ marginTop: '10px', fontSize: '0.8em' }}>
        <p>Usuários de teste:</p>
        <ul>
            <li>student1 / pass123</li>
            <li>teacher1 / pass123</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;