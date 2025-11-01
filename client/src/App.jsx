import React, { useState } from 'react';
import axios from 'axios';  

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [previewData, setPreviewData] = useState([]);  
  const [tableTitle, setTableTitle] = useState('');  
  const [loading, setLoading] = useState(false);

  // Загрузка CSV
  const handleUpload = async () => {
    if (!file) return alert('Select a file');
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/upload', formData);
      const data = response.data;
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setPreviewData(data.preview || []); 
        setTableTitle('CSV Preview (first 100 rows)');  // Заголовок для превью
        setQuery('');  
      }
    } catch (error) {
      alert('Upload failed');
    }
    setLoading(false);
  };

  // Поиск (фильтрует на сервере и заменяет превью на результаты)
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/search?query=${encodeURIComponent(query)}`);
      const data = response.data;
      setPreviewData(data.results || []);  
      setTableTitle('Search Results');  
    } catch (error) {
      alert('Search failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>CSV Viewer & Search</h1>
      
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>Upload CSV</button>
      
      <br /><br />
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>Search</button>
      
      {/* Единая таблица (превью или результаты) */}
      {loading && <p>Loading...</p>}
      {previewData.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>{tableTitle}</h2>
          <table border="1" style={{ width: '100%' }}>
            <thead>
              <tr>
                {Object.keys(previewData[0]).map(key => <th key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
