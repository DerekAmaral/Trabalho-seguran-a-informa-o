import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

interface Course {
  id: number;
  name: string;
  description: string;
}


const Search: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const updateSearchTerm = (term: string) => {
      if (term) {
        setSearchParams({ search: term });
      } else {
        setSearchParams({});
      }
  }

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
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => updateSearchTerm(e.target.value)} 
          placeholder="Pesquisar curso..." 
          style={{ padding: '5px', width: '250px' }}
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          <h3>Resultados para: "{searchTerm}"</h3>
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
