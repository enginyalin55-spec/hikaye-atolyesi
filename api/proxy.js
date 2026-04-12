const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GEMINI_KEY   = process.env.GEMINI_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { model, payload } = req.body;

  // ── Supabase: Ses Yükle ─────────────────
  if (model === "supabase-upload-audio") {
    try {
      const { fileName, audioData } = payload;
      const binary = atob(audioData);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/hikaye-gorseller/${fileName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "audio/wav",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
          body: bytes,
        }
      );
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/hikaye-gorseller/${fileName}`;
      return res.status(200).json({ url: publicUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Supabase: Görsel Yükle ───────────────
  if (model === "supabase-upload") {
    try {
      const { fileName, base64Data, mimeType } = payload;
      const binary = atob(base64Data.split(",")[1] || base64Data);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/hikaye-gorseller/${fileName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": mimeType || "image/png",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
          body: bytes,
        }
      );
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/hikaye-gorseller/${fileName}`;
      return res.status(200).json({ url: publicUrl });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Supabase: Hikaye Paylaş ──────────────
  if (model === "supabase-save") {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/paylasilan_hikayeler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Supabase: Hikaye Getir ───────────────
  if (model === "supabase-get") {
    try {
      const kod = payload.kod?.toUpperCase();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/paylasilan_hikayeler?kod=eq.${kod}&select=*`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      const data = await response.json();
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Hikaye bulunamadı." });
      }
      return res.status(200).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Kütüphane: Kaydet ───────────────────
  if (model === "kutuphane-save") {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ogretmen_kutuphanesi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Kütüphane: Listele ──────────────────
  if (model === "kutuphane-list") {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/paylasilan_hikayeler?select=id,kod,title,level,lang,created_at&order=created_at.desc`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Kütüphane: Sil ──────────────────────
  if (model === "kutuphane-delete") {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/paylasilan_hikayeler?id=eq.${payload.id}`,
        {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Aktivite: Kaydet ────────────────────
  if (model === "aktivite-kaydet") {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/ogrenci_aktiviteleri`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Aktivite: Getir ─────────────────────
  if (model === "aktivite-getir") {
    try {
      const kod = payload.kod;
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ogrenci_aktiviteleri?hikaye_baslik=eq.${encodeURIComponent(kod)}&select=*&order=tarih.asc`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Gemini API ───────────────────────────
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "API key tanımlı değil" });
  }

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