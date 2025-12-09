import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Interface Course
//
// Define a estrutura de um curso retornado pelo backend.
// Cada curso possui:
// - id: identificador único
// - name: nome do curso (descriptografado pelo backend)
// - description: descrição do curso (descriptografada pelo backend)
// ---------------------------------------------------------------------------
interface Course {
  id: number;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Componente Search
//
// Interface pública para busca de cursos.
// Funcionalidades principais:
// 1. Permite ao usuário digitar um termo de busca
// 2. Consulta a API do backend, que retorna dados criptografados já descriptografados
// 3. Atualiza a URL com o parâmetro "search" (para manter o estado ao recarregar ou compartilhar)
// 4. Exibe resultados dinamicamente
// ---------------------------------------------------------------------------
const Search: React.FC = () => {
  // Estado para armazenar cursos retornados pela API
  const [courses, setCourses] = useState<Course[]>([]);

  // Estado para controle de carregamento
  const [loading, setLoading] = useState(false);

  // Hook para ler e atualizar parâmetros de URL
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  // -------------------------------------------------------------------------
  // handleSearch
  //
  // Evita o comportamento padrão do form ao submeter
  // (não estamos usando submit real, só input controlado)
  // -------------------------------------------------------------------------
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // -------------------------------------------------------------------------
  // updateSearchTerm
  //
  // Atualiza o parâmetro de busca na URL ao digitar no input
  // Permite manter estado da busca ao recarregar a página ou compartilhar link
  // -------------------------------------------------------------------------
  const updateSearchTerm = (term: string) => {
      if (term) {
        setSearchParams({ search: term });
      } else {
        setSearchParams({});
      }
  }

  // -------------------------------------------------------------------------
  // useEffect
  //
  // Sempre que o searchTerm mudar, realiza a requisição à API:
  // 1. Se houver termo de busca, adiciona como query string
  // 2. Recebe lista de cursos descriptografados do backend
  // 3. Atualiza estado "courses" e controle de carregamento
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const url = searchTerm 
            ? `http://localhost:8000/api/courses?search=${encodeURIComponent(searchTerm)}` 
            : 'http://localhost:8000/api/courses';
            
        const response = await axios.get(url);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Busca de Cursos (Público)</h1>
      <p>Esta interface busca dados que estão armazenados criptografados no banco de dados.</p>
      
      {/* Input de busca controlado */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => updateSearchTerm(e.target.value)} 
          placeholder="Pesquisar curso..." 
          style={{ padding: '5px', width: '250px' }}
        />
      </div>

      {/* Feedback de carregamento */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          <h3>Resultados para: "{searchTerm}"</h3>

          {/* Exibe mensagem se nenhum curso foi encontrado */}
          {courses.length === 0 ? (
            <p>Nenhum curso encontrado.</p>
          ) : (
            <ul>
              {courses.map(course => (
                <li key={course.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <strong>{course.name}</strong>
                  <p>{course.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
