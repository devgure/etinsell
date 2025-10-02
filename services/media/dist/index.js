const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(cors());

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  res.json({ url: `/uploads/${path.basename(file.path)}`, originalName: file.originalname });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Media service listening on ${PORT}`));
