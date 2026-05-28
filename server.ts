import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Route for AI Backdrop generation using Gemini API
app.post('/api/generate-backdrop', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is defined in secrets.' 
      });
    }

    console.log(`Generating AI backdrop via Gemini model 'gemini-2.5-flash-image' for prompt: "${prompt}"...`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Artistic background scene: ${prompt}. High quality, cinematic backdrop, detailed background design, no text, no watermarks.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: '1K'
        }
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      return res.status(500).json({ error: 'No response content returned from Gemini model.' });
    }

    let base64Image = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      return res.status(500).json({ error: 'No image data was generated in the model output.' });
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    return res.json({ imageUrl });

  } catch (error: any) {
    console.error('Error generating AI backdrop:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate background image.' });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
