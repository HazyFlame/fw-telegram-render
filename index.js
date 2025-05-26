import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

