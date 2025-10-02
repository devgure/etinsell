require('dotenv').config();
const express = require('express');
const {Translate} = require('@google-cloud/translate').v2;

const app = express();
app.use(express.json());
const translate = new Translate();

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/translate', async (req, res) => {
  const { text, target } = req.body;
  const [translation] = await translate.translate(text, target || 'en');
  res.json({ translation });
});

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log('i18n service listening', PORT));
