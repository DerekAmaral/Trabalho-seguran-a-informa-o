import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../src/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'teacher') {
        navigate('/');
        return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/teachers');
        setData(response.data.data);
      } catch (err) {
         setError('Acesso negado ou erro ao carregar dados.');
      }
    };
    fetchData();
  }, [role, navigate]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff7e6' }}>
      <h1>Área do Professor</h1>
      <p>Bem-vindo, Professor!</p>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p><strong>Conteúdo Exclusivo:</strong> {data}</p>}
      <button onClick={() => { logout(); navigate('/'); }}>Sair</button>
    </div>
  );
};

export default TeacherDashboard;
