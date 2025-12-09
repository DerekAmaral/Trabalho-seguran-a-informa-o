import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Componente TeacherDashboard
//
// Área exclusiva para usuários com papel "teacher".
// Funcionalidades principais:
// 1. Valida se o usuário logado é um professor; caso contrário, redireciona.
// 2. Faz requisição autenticada para obter conteúdo exclusivo do professor.
// 3. Exibe mensagens de erro caso a requisição falhe.
// 4. Permite logout, limpando o contexto de autenticação e redirecionando.
// ---------------------------------------------------------------------------
const TeacherDashboard: React.FC = () => {
  // Estado para armazenar o conteúdo exclusivo retornado pelo backend
  const [data, setData] = useState('');

  // Estado para mensagens de erro (ex: acesso negado ou problema na requisição)
  const [error, setError] = useState('');

  // Contexto de autenticação
  const { role, logout } = useAuth();

  // Hook do React Router para redirecionamento
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // useEffect
  //
  // Executa quando o componente é montado:
  // 1. Verifica se o papel do usuário é "teacher"
  //    - Se não for, redireciona para a página inicial
  // 2. Realiza requisição GET para o endpoint de professores
  // 3. Atualiza estado "data" com conteúdo retornado
  // 4. Em caso de erro (ex: token inválido ou outro problema), exibe mensagem
  // -------------------------------------------------------------------------
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

      {/* Exibe mensagem de erro ou conteúdo exclusivo */}
      {error 
        ? <p style={{ color: 'red' }}>{error}</p> 
        : <p><strong>Conteúdo Exclusivo:</strong> {data}</p>
      }

      {/* Botão de logout */}
      <button onClick={() => { 
          logout(); 
          navigate('/'); 
        }}>
        Sair
      </button>
    </div>
  );
};

export default TeacherDashboard;
