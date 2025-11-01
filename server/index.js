import cors from "cors";
import express from "express";
import multer from "multer";
import csv from "csv-parser"; 
import fs from 'fs';

// Инициализация express приложения
const app = express();
const PORT = 3001;

// Использование cors для возможности запросов с фронта
app.use(cors()); 
app.use(express.json());

// Переменная для хранения данных полученных из файла
let csvData = [];

// Создание папки для хранения загружаемых файлов
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const upload = multer({ dest: uploadDir });

// Настройка порта, который будет прослушивать сервер
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// POST метод для загрузки файла
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;
  csvData = []; 

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());
    for await (const row of stream) {
      csvData.push(row);
    }
    fs.unlinkSync(filePath); 
    
    // Слайс первых 100 строк 
    const previewData = csvData.slice(0, 100);
    res.json({ message: 'CSV loaded', rows: csvData.length, preview: previewData });
  } catch (error) {
    console.error('Parsing error:', error);
    res.status(500).json({ error: 'Parsing failed' });
  }
});

// GET метод для простейшей фильтрации (любой ключ содержит то что введено в поиск)
app.get('/api/search', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const results = csvData.filter(row =>
    Object.values(row).some(value =>
      value.toString().toLowerCase().includes(query.toLowerCase())
    )
  );

  res.json({ results });
});
