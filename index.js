import express from 'express';
import fetch from 'node-fetch';
import FormData from 'form-data';
import multer from 'multer';
import { Buffer } from 'buffer';

const app = express();
const upload = multer();

app.post('/send', async (req, res) => {
  const { chat_id, text, parse_mode, token } = req.body;

  if (!token || !chat_id || !text) {
    return res.status(400).json({ error: 'Missing token, chat_id or text' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text, parse_mode }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

app.post('/sendFile', upload.none(), async (req, res) => {
  const {
    token,
    chat_id,
    text,
    parse_mode,
    fileName,
    fileData,
    fileType
  } = req.body;

  if (!token || !chat_id) {
    return res.status(400).json({ error: 'Missing token or chat_id' });
  }

  try {
    let response;

    if (fileData && fileName) {
      const buffer = Buffer.from(fileData, 'base64');
      const field = fileType === 'photo' ? 'photo' : 'document';

      const form = new FormData();
      form.append('chat_id', chat_id);
      form.append(field, buffer, fileName);
      if (text) form.append('caption', text);
      if (parse_mode) form.append('parse_mode', parse_mode);

      response = await fetch(`https://api.telegram.org/bot${token}/${fileType === 'photo' ? 'sendPhoto' : 'sendDocument'}`, {
        method: 'POST',
        body: form,
      });
    } else if (text) {
      response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode }),
      });
    } else {
      return res.status(400).json({ error: 'No text or file data provided' });
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
