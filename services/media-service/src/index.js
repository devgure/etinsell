require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Minio = require('minio');

const app = express();
const upload = multer();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT_HOST || 'localhost',
  port: Number(process.env.MINIO_ENDPOINT_PORT || 9000),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('no file');
  const bucket = process.env.MINIO_BUCKET || 'etincel-media';
  const objectName = `${Date.now()}-${file.originalname}`;
  try {
    await minioClient.putObject(bucket, objectName, file.buffer);
    const url = `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${bucket}/${objectName}`;
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send('upload failed');
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log('Media service listening on', PORT));
