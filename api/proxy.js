export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "API key tanımlı değil" });
  }

  const { model, payload } = req.body;

  const modelUrls = {
    "gemini": `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    "imagen": `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    "tts":    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_KEY}`,
  };

  const url = modelUrls[model];
  if (!url) {
    return res.status(400).json({ error: "Geçersiz model: " + model });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}