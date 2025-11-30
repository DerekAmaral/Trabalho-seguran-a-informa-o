import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../src/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // RBAC Check in Frontend (Double verification)
    if (role !== 'student') {
        navigate('/'); // Redirect unauthorized
        return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/students');
        setData(response.data.data);
      } catch (err) {
        setError('Acesso negado ou erro ao carregar dados.');
      }
    };
    fetchData();
  }, [role, navigate]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#e6f7ff' }}>
      <h1>Área do Aluno</h1>
      <p>Bem-vindo, Aluno!</p>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p><strong>Conteúdo Exclusivo:</strong> {data}</p>}
      <button onClick={() => { logout(); navigate('/'); }}>Sair</button>
    </div>
  );
};

export default StudentDashboard;
