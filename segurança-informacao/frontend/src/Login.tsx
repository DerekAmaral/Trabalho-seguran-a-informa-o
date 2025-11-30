import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Using FormData for OAuth2PasswordRequestForm compatibility
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8000/auth/token', formData);
      const { access_token, role, username: user } = response.data;
      login(access_token, role, user);
      
      if (role === 'student') {
        navigate('/students');
      } else if (role === 'teacher') {
        navigate('/teachers');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', maxWidth: '300px', margin: '20px auto' }}>
      <h2>Login</h2>
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
