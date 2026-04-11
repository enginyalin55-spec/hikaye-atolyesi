// ═══════════════════════════════════════════
// API AYARLARI — kendi Gemini key'ini buraya yaz
// ═══════════════════════════════════════════
const OGRETMEN_SIFRE = "Yalin.Yasemin1113";
const GEMINI_URL = "/api/proxy";
const IMAGEN_URL = "/api/proxy";
const TTS_URL    = "/api/proxy";

async function supabaseUploadImage(base64Data, fileName) {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "supabase-upload",
      payload: { fileName, base64Data, mimeType: "image/png" }
    }),
  });
  if (!res.ok) throw new Error("Görsel yükleme hatası: " + res.status);
  const data = await res.json();
  return data.url;
}

async function supabaseUploadAudio(audioB64, fileName) {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "supabase-upload-audio",
      payload: { fileName, audioData: audioB64 }
    }),
  });
  if (!res.ok) throw new Error("Ses yükleme hatası: " + res.status);
  const data = await res.json();
  return data.url;
}

// ── Supabase Yardımcıları ──────────────────
async function supabaseSave(payload) {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "supabase-save", payload }),
  });
  if (!res.ok) throw new Error("Kayıt hatası: " + res.status);
  return res.json();
}

async function supabaseGet(kod) {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "supabase-get", payload: { kod } }),
  });
  if (!res.ok) throw new Error("Hikaye bulunamadı.");
  return res.json();
}

function generateKod() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let kod = "HK-";
  for (let i = 0; i < 4; i++) kod += chars[Math.floor(Math.random() * chars.length)];
  return kod;
}
const VOICES = [
  { value: "Kore",   label: "Kore — Kadın, Dengeli" },
  { value: "Zephyr", label: "Zephyr — Kadın, Sıcak"  },
  { value: "Leda",   label: "Leda — Kadın, Yumuşak"  },
  { value: "Charon", label: "Charon — Erkek, Derin"  },
  { value: "Puck",   label: "Puck — Erkek, Neşeli"   },
  { value: "Fenrir", label: "Fenrir — Erkek, Güçlü"  },
  { value: "Orus",   label: "Orus — Erkek, Dengeli"  },
];

const SPEEDS = [
  { value: "slow",   label: "🐢 Yavaş" },
  { value: "normal", label: "▶️ Normal" },
  { value: "fast",   label: "⚡ Hızlı"  },
];

const LANGUAGES = [
  { code: "tr", label: "🇹🇷 Türkçe",     tts: "tr-TR" },
  { code: "en", label: "🇬🇧 İngilizce",  tts: "en-US" },
  { code: "de", label: "🇩🇪 Almanca",    tts: "de-DE" },
  { code: "fr", label: "🇫🇷 Fransızca",  tts: "fr-FR" },
  { code: "es", label: "🇪🇸 İspanyolca", tts: "es-ES" },
  { code: "it", label: "🇮🇹 İtalyanca",  tts: "it-IT" },
  { code: "ar", label: "🇸🇦 Arapça",     tts: "ar-XA" },
  { code: "ja", label: "🇯🇵 Japonca",    tts: "ja-JP" },
  { code: "ru", label: "🇷🇺 Rusça",      tts: "ru-RU" },
  { code: "el", label: "🇬🇷 Yunanca",    tts: "el-GR" },
  { code: "zh", label: "🇨🇳 Çince",      tts: "zh-CN" },
  { code: "ko", label: "🇰🇷 Korece",     tts: "ko-KR" },
  { code: "pt", label: "🇵🇹 Portekizce", tts: "pt-PT" },
  { code: "nl", label: "🇳🇱 Hollandaca", tts: "nl-NL" },
  { code: "pl", label: "🇵🇱 Lehçe",      tts: "pl-PL" },
  { code: "hi", label: "🇮🇳 Hintçe",     tts: "hi-IN" },
];

const LEVELS = [
  { id: "A1", desc: "Çok basit cümleler ve temel kelimeler." },
  { id: "A2", desc: "Günlük konuşma dili ve basit anlatımlar." },
  { id: "B1", desc: "Daha akıcı, standart dil kullanımı." },
  { id: "B2", desc: "Karmaşık metinler ve soyut konular." },
  { id: "C1", desc: "Akademik ve profesyonel seviye dil." },
];

// ═══════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════

function speedInstruction(speed) {
  if (speed === "slow")   return "Lütfen çok yavaş ve net bir şekilde oku. ";
  if (speed === "fast")   return "Lütfen hızlı ve akıcı bir şekilde oku. ";
  return "";
}

function base64ToUint8Array(base64) {
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function callGemini(url, body) {
  let model = "gemini";
  if (url === IMAGEN_URL && body.instances) model = "imagen";
  else if (url === TTS_URL && body.generationConfig?.responseModalities) model = "tts";

  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, payload: body }),
  });
  if (!res.ok) throw new Error(`API Hatası: ${res.status}`);
  return res.json();
}

async function generateTTS(text, voice, speed, rawText = false) {
  const finalText = rawText ? text : speedInstruction(speed) + text;
  const data = await callGemini(TTS_URL, {
    contents: [{ parts: [{ text: finalText }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  });
  const part = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("Ses verisi alınamadı.");
  const bytes = base64ToUint8Array(part.inlineData.data);
  const sampleRate = parseInt((part.inlineData.mimeType || "").match(/rate=(\d+)/)?.[1] || "24000", 10);
  return { bytes, sampleRate };
}

function pcmToWav(bytes, sampleRate) {
  const wavBuffer = new ArrayBuffer(44 + bytes.byteLength);
  const view = new DataView(wavBuffer);
  const write = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  write(0, "RIFF");
  view.setUint32(4, 36 + bytes.byteLength, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, bytes.byteLength, true);
  new Uint8Array(wavBuffer, 44).set(bytes);
  return wavBuffer;
}

function buildAudioSource(bytes, sampleRate) {
  const wav = pcmToWav(bytes, sampleRate);
  const blob = new Blob([wav], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  const promise = new Promise((resolve) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => resolve());
  });
  const stop = () => { audio.pause(); audio.currentTime = 0; URL.revokeObjectURL(url); };
  return { promise, stop };
}

async function playAudio(bytes, sampleRate) {
  const { promise } = buildAudioSource(bytes, sampleRate);
  return promise;
}

// ── Aktivite Kaydet ──────────────────────
async function aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, aksiyon, detay = {}) {
  if (!hikayeBaslik) return;
  try {
    await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "aktivite-kaydet",
        payload: { hikaye_kod: hikayeKod, hikaye_baslik: hikayeBaslik, ogrenci_ad: ogrenciAd, aksiyon, detay }
      }),
    });
  } catch {
    // aktivite kaydedilemese de devam et
  }
}

// ═══════════════════════════════════════════
// HİKAYE ÜRETİM FONKSİYONU
// ═══════════════════════════════════════════

async function generateStoryJSON(topic, level, pageCount, langCode) {
  const langObj = LANGUAGES.find(l => l.code === langCode);
  const langName = langObj?.label?.replace(/^.+ /, "") || "Türkçe";

  const isVisualLevel = level === "A1" || level === "A2";

  const systemPrompt = `Sen profesyonel bir dil öğretmeni ve çocuk kitabı yazarısın.
Kullanıcının konusuna uygun, CEFR ${level} seviyesinde, ${langName} dilinde bir hikaye yazmalısın.

ÖNEMLİ KURALLAR:
- Hikaye dili: ${langName} (tüm hikaye metinleri bu dilde olmalı)
- Karakter tanımı (characterDescription) İNGİLİZCE olmalı (görsel üretim için)
- Her sayfa için actionPrompt İNGİLİZCE olmalı (görsel üretim için)
- vocabulary: her sayfada 3-5 zor/yeni kelime, IPA ile birlikte; imagePrompt İNGİLİZCE basit nesne/kavram açıklaması olmalı (görsel üretim için)
- translation: ${langCode === "tr" ? "kelimenin Türkçe eş anlamlısı veya kısa Türkçe tanımı (İngilizce YAZMA)" : "kelimenin Türkçe karşılığı (Türkçe öğretim dili olarak sabit, İngilizce YAZMA)"}
- fillInTheBlanks: hikayeden alınan cümleler, bir kelime "_____" ile değiştirilmiş

ÇIKTI FORMATI SADECE JSON OLMALI, başka hiçbir şey yazma:
{
  "title": "Hikaye başlığı (${langName} dilinde)",
  "characterDescription": "Detailed English physical description of the main character",
  "pages": [
    {
      "text": "Sayfa metni (${langName} dilinde)",
      "actionPrompt": "Specific English scene description for image generation",
      "vocabulary": [
        { "word": "kelime", "ipa": "/ipa/", "translation": "Türkçe karşılık", "imagePrompt": "simple English description for image generation" }
      ]
    }
  ],
  "quiz": [
    { "question": "Soru (${langName})", "options": ["A","B","C","D"], "answer": 0 }
  ],
  "fillInTheBlanks": [
    { "sentence": "Cümle _____ devam.", "answer": "kelime", "hint": "ipucu (Türkçe)" }
  ]
}`;

  const data = await callGemini(GEMINI_URL, {
    contents: [{
      parts: [{ text: `Konu: ${topic} | Seviye: ${level} | Sayfa Sayısı: ${pageCount} | Dil: ${langName}` }]
    }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { responseMimeType: "application/json" },
  });

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini'den yanıt alınamadı.");
  return JSON.parse(raw);
}

async function generatePageImage(story, pageIndex) {
  const page = story.pages[pageIndex];
  const prompt = `Professional children's storybook illustration, digital art, vibrant soft colors, clean lines. Main character: ${story.characterDescription}. Scene: ${page.actionPrompt}`;
  
  const data = await callGemini(IMAGEN_URL, {
    instances: { prompt },
    parameters: { sampleCount: 1 },
  });

  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Görsel üretilemedi.");
  return `data:image/png;base64,${b64}`;
}
// ═══════════════════════════════════════════
// ANA UYGULAMA
// ═══════════════════════════════════════════

const { useState, useEffect, useRef } = React;

function App() {
  // ── Ayarlar ──
  const [topic, setTopic]       = useState("");
  const [level, setLevel]       = useState("A1");
  const [pageCount, setPageCount] = useState(3);
  const [lang, setLang]         = useState("tr");
  const [voice, setVoice]       = useState("Kore");
  const [speed, setSpeed]       = useState("normal");

  // ── Durum ──
  const [status, setStatus]     = useState("idle"); 
  // idle | generating-text | generating-images | preview | library
  const [storyData, setStoryData] = useState(null);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0 });
  const [error, setError]       = useState(null);
  const [library, setLibrary]   = useState([]);
  const [kodInput, setKodInput] = useState("");
  const [kodLoading, setKodLoading] = useState(false);
  const [kodError, setKodError] = useState(null);
  const [shareStatus, setShareStatus] = useState("idle"); // idle | preparing | done
  const [shareKod, setShareKod] = useState(null);
  const [shareProgress, setShareProgress] = useState("");
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [girisEkrani, setGirisEkrani] = useState(true);
  const [girisInput, setGirisInput] = useState("");
  const [ogrenciAd, setOgrenciAd] = useState("");
  const [girisHata, setGirisHata] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("hikaye_kutuphanesi");
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  // ── Ana üretim fonksiyonu ──
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setError(null);
    setStatus("generating-text");

    try {
      // 1. Metin üret
      const story = await generateStoryJSON(topic, level, pageCount, lang);
      story.pages = story.pages.map(p => ({ ...p, imageUrl: null, audioCache: {} }));
      setStoryData(story);

      // 2. Görselleri üret
      setStatus("generating-images");
      setImageProgress({ current: 0, total: story.pages.length });

      const updatedPages = [...story.pages];
      for (let i = 0; i < updatedPages.length; i++) {
        try {
          updatedPages[i].imageUrl = await generatePageImage(story, i);
        } catch {
          updatedPages[i].imageUrl = null;
        }
        setImageProgress({ current: i + 1, total: story.pages.length });
        setStoryData(prev => ({ ...prev, pages: [...updatedPages] }));
      }

      setStoryData(prev => ({ ...prev, pages: updatedPages }));
      // Otomatik kütüphane kaydı
try {
  await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "kutuphane-save",
      payload: {
        baslik: story.title,
        konu: topic,
        seviye: level,
        dil: lang,
        ses_tonu: voice,
        hiz: speed
      }
    }),
  });
} catch {
  // kaydedilemese de devam et
}
      setStatus("preview");
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      setStatus("idle");
    }
  };

  // ── Kütüphaneye kaydet ──
  const handleSave = () => {
    if (!storyData) return;
    const entry = {
      id: Date.now(),
      title: storyData.title,
      level,
      lang,
      topic,
      date: new Date().toLocaleDateString("tr-TR"),
      data: storyData,
      voice,
      speed,
    };
    const updated = [entry, ...library];
    setLibrary(updated);
    localStorage.setItem("hikaye_kutuphanesi", JSON.stringify(updated));
    alert("✅ Hikaye kütüphaneye kaydedildi!");
  };

  // ── Kütüphaneden sil ──
  const handleDelete = (id) => {
    const updated = library.filter(l => l.id !== id);
    setLibrary(updated);
    localStorage.setItem("hikaye_kutuphanesi", JSON.stringify(updated));
  };

  // ── Kütüphaneden aç ──
  const handleOpen = (entry) => {
    setStoryData(entry.data);
    setLevel(entry.level);
    setLang(entry.lang);
    setVoice(entry.voice || "Kore");
    setSpeed(entry.speed || "normal");
    setStatus("preview");
    setIsStudentMode(false);
  };

  // ── Kod ile hikaye aç (öğrenci) ──
  const handleKodGir = async () => {
    if (!kodInput.trim() || !ogrenciAd.trim()) return;
    setKodLoading(true);
    setKodError(null);
    try {
      const entry = await supabaseGet(kodInput.trim());
      setStoryData(entry.data);
      setLevel(entry.level);
      setLang(entry.lang);
      setVoice(entry.voice || "Kore");
      setSpeed(entry.speed || "normal");
      setIsStudentMode(true);
      setStatus("preview");
      await aktiviteKaydet(kodInput.trim(), entry.title, ogrenciAd.trim(), "hikaye_acildi", {});
    } catch (err) {
      setKodError("Geçersiz kod. Lütfen tekrar deneyin.");
    }
    setKodLoading(false);
  };

  // ── Paylaşıma hazırla ──
  const handleShare = async () => {
    if (!storyData) return;
    setShareStatus("preparing");
    try {
      const pages = [...storyData.pages];
      const id  = crypto.randomUUID();

      for (let i = 0; i < pages.length; i++) {
        // Ses üret
        setShareProgress(`📄 Sayfa ${i+1}/${pages.length} metni seslendiriliyor...`);
        try {
          const { bytes, sampleRate } = await generateTTS(pages[i].text, voice, speed);
          const wav = pcmToWav(bytes, sampleRate);
          const wavArr = new Uint8Array(wav);
          let binary = "";
          for (let j = 0; j < wavArr.byteLength; j++) {
            binary += String.fromCharCode(wavArr[j]);
          }
          const b64 = btoa(binary);
          const audioFileName = `${id}_sayfa${i}_ses.wav`;
          const audioUrl = await supabaseUploadAudio(b64, audioFileName);
          pages[i] = { ...pages[i], audioUrl, audioSampleRate: sampleRate };
        } catch {
          // ses üretilemezse devam et
        }

        // Kelime seslerini üret
        setShareProgress(`📖 Sayfa ${i+1}/${pages.length} kelimeleri seslendiriliyor...`);
        const vocabWithAudio = [];
        for (const v of (pages[i].vocabulary || [])) {
          let uploaded = false;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const { bytes: wb, sampleRate: ws } = await generateTTS(v.word, voice, "slow");
              const wav2 = pcmToWav(wb, ws);
              const arr2 = new Uint8Array(wav2);
              let bin2 = "";
              for (let j = 0; j < arr2.byteLength; j++) bin2 += String.fromCharCode(arr2[j]);
              const wordB64 = btoa(bin2);
              const wordFileName = `${id}_sayfa${i}_kelime${vocabWithAudio.length}.wav`;
              const wordAudioUrl = await supabaseUploadAudio(wordB64, wordFileName);
              vocabWithAudio.push({ ...v, audioUrl: wordAudioUrl, audioSampleRate: ws });
              uploaded = true;
              break;
            } catch {
              await new Promise(r => setTimeout(r, 1000));
            }
          }
          if (!uploaded) vocabWithAudio.push(v);
        }
        pages[i] = { ...pages[i], vocabulary: vocabWithAudio };

        // Görseli Storage'a yükle
        setShareProgress(`🖼️ Sayfa ${i+1}/${pages.length} görseli yükleniyor...`);
        try {
          if (pages[i].imageUrl && pages[i].imageUrl.startsWith("data:")) {
            const fileName = `${id}_sayfa${i}.png`;
            const storageUrl = await supabaseUploadImage(pages[i].imageUrl, fileName);
            pages[i] = { ...pages[i], imageUrl: storageUrl };
          }
        } catch {
          pages[i] = { ...pages[i], imageUrl: null };
        }
      }

      const kod = generateKod();

      await supabaseSave({
        id,
        kod,
        title: storyData.title,
        level,
        lang,
        voice,
        speed,
        data: { ...storyData, pages }
      });

      setShareProgress("✅ Tamamlandı!");

      setShareKod(kod);
      setShareStatus("done");
    } catch (err) {
      alert("Paylaşım hatası: " + err.message);
      setShareStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-20">
      {/* GİRİŞ EKRANI */}
      {girisEkrani && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm space-y-6">
            <div className="text-center">
              <p className="text-4xl mb-3">📚</p>
              <h1 className="text-2xl font-black text-gray-900">AI Hikaye Atölyesi</h1>
              <p className="text-gray-400 text-sm mt-1">Nasıl devam etmek istersiniz?</p>
            </div>

            {/* Öğrenci girişi */}
            <div className="space-y-2">
              <label className="text-xs font-black text-orange-400 uppercase tracking-widest block">
                🎓 Öğrenci Girişi
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hikaye kodu (HK-XXXX)"
                  value={kodInput}
                  onChange={e => { setKodInput(e.target.value.toUpperCase()); setKodError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleKodGir()}
                  className="flex-1 p-3 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-orange-400 outline-none font-bold text-sm"
                />
                <button
                  onClick={async () => { if (!kodInput.trim() || !ogrenciAd.trim()) return; await handleKodGir(); if (!kodError) setGirisEkrani(false); }}
                  disabled={kodLoading || !kodInput.trim()}
                  className="bg-orange-500 text-white px-4 py-3 rounded-2xl font-black text-sm disabled:opacity-50"
                >
                  {kodLoading ? "⏳" : "Gir"}
                </button>
                

                
              </div>
              <input
  type="text"
  placeholder="Adınız Soyadınız"
  value={ogrenciAd}
  onChange={e => setOgrenciAd(e.target.value)}
  className="w-full p-3 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-orange-400 outline-none font-bold text-sm"
/>
              {kodError && <p className="text-red-500 text-xs font-bold">{kodError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-bold">VEYA</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Öğretmen girişi */}
            <div className="space-y-2">
              <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block">
                👩‍🏫 Öğretmen Girişi
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Şifre"
                  value={girisInput}
                  onChange={e => { setGirisInput(e.target.value); setGirisHata(null); }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (girisInput === OGRETMEN_SIFRE) { setGirisEkrani(false); setIsStudentMode(false); }
                      else setGirisHata("Şifre yanlış!");
                    }
                  }}
                  className="flex-1 p-3 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none font-bold text-sm"
                />
                <button
                  onClick={() => {
                    if (girisInput === OGRETMEN_SIFRE) { setGirisEkrani(false); setIsStudentMode(false); }
                    else setGirisHata("Şifre yanlış!");
                  }}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-2xl font-black text-sm"
                >
                  Gir
                </button>
              </div>
              {girisHata && <p className="text-red-500 text-xs font-bold">{girisHata}</p>}
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setStatus("idle")}
            className="flex items-center gap-2 font-black text-indigo-700 text-lg tracking-tight"
          >
            📚 AI Hikaye Atölyesi
          </button>
          <div className="flex gap-2">
            {!isStudentMode && (
              <button
                onClick={() => setStatus("library")}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm"
              >
                🗂️ Kütüphane {library.length > 0 && `(${library.length})`}
              </button>
            )}
            {!isStudentMode && (
  <button
    onClick={() => setStatus("istatistik")}
    className="bg-violet-100 text-violet-700 px-4 py-2 rounded-xl font-bold text-sm"
  >
    📊 İstatistikler
  </button>
)}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-8">

        {/* ── AYARLAR EKRANI ── */}
        {status === "idle" && (
          <div className="max-w-lg mx-auto animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-gray-900">Hikaye Atölyesi</h1>
              <p className="text-gray-400 font-medium">Sesli · Görsellli · Alıştırmalı</p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">

              {/* Dil seçimi */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-3">
                  Hikaye Dili
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all leading-tight ${
                        lang === l.code
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seviye seçimi */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-3">
                  Dil Seviyesi (CEFR)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LEVELS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setLevel(l.id)}
                      className={`py-3 rounded-xl font-black text-sm transition-all ${
                        level === l.id
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {l.id}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {LEVELS.find(l => l.id === level)?.desc}
                </p>
              </div>

              {/* Konu */}
              <div>
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-2">
                  Hikaye Konusu
                </label>
                <textarea
                  placeholder="Örn: Küçük bir robotun arkadaş arayışı..."
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none transition-all h-24 font-medium resize-none"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              {/* Sayfa sayısı */}
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-3 text-center">
                  Kitap Uzunluğu: {pageCount} Sayfa
                </label>
                <input
                  type="range" min="2" max="10"
                  className="w-full"
                  value={pageCount}
                  onChange={e => setPageCount(parseInt(e.target.value))}
                />
              </div>

              {/* Ses ayarları */}
              <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block">
                  🔊 Ses Ayarları
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">Ses Tonu</p>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-xl text-sm font-medium bg-white"
                      value={voice}
                      onChange={e => setVoice(e.target.value)}
                    >
                      {VOICES.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">Okuma Hızı</p>
                    <div className="flex gap-1">
                      {SPEEDS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setSpeed(s.value)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            speed === s.value
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Üret butonu */}
              <button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all ${
                  topic.trim()
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                ✨ Hikayeyi Oluştur
              </button>

              {/* Kod ile aç */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <label className="text-xs font-black text-orange-400 uppercase tracking-widest block">
                  🎓 Öğrenci Girişi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Hikaye kodu (örn: HK-4821)"
                    value={kodInput}
                    onChange={e => { setKodInput(e.target.value.toUpperCase()); setKodError(null); }}
                    onKeyDown={e => e.key === "Enter" && handleKodGir()}
                    className="flex-1 p-3 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-orange-400 outline-none font-bold text-sm"
                  />
                  <button
                    onClick={handleKodGir}
                    disabled={kodLoading || !kodInput.trim()}
                    className="bg-orange-500 text-white px-4 py-3 rounded-2xl font-black text-sm disabled:opacity-50"
                  >
                    {kodLoading ? "⏳" : "Gir"}
                  </button>
                </div>
                {kodError && (
                  <p className="text-red-500 text-xs font-bold">{kodError}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ── YÜKLEME EKRANI ── */}
        {(status === "generating-text" || status === "generating-images") && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full spinner mb-8" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {status === "generating-text"
                ? "✍️ Hikaye Yazılıyor..."
                : `🎨 Görseller Çiziliyor... (${imageProgress.current}/${imageProgress.total})`}
            </h2>
            <p className="text-gray-400 font-medium text-sm text-center max-w-xs">
              {status === "generating-text"
                ? "Karakter tasarlanıyor, hikaye ve alıştırmalar hazırlanıyor."
                : "Her sayfa için özgün illüstrasyon oluşturuluyor."}
            </p>
            {status === "generating-images" && imageProgress.total > 0 && (
              <div className="mt-6 w-64 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── KÜTÜPHANESİ EKRANI ── */}
        {status === "istatistik" && !isStudentMode && (
  <IstatistikSayfasi />
)}
        {status === "library" && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">🗂️ Hikaye Kütüphanesi</h2>
              <button
                onClick={() => setStatus("idle")}
                className="text-sm font-bold text-indigo-600 hover:underline"
              >
                ← Geri
              </button>
            </div>

            {library.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📭</p>
                <p className="font-bold">Henüz kayıtlı hikaye yok.</p>
                <p className="text-sm mt-1">Oluşturduğun hikayeleri kaydet butonu ile buraya ekle.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {library.map(entry => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 truncate">{entry.title}</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {LANGUAGES.find(l => l.code === entry.lang)?.label} · 
                        Seviye {entry.level} · {entry.date}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate italic">{entry.topic}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpen(entry)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs"
                      >
                        📂 Aç
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="bg-red-50 text-red-500 border border-red-100 px-3 py-2 rounded-xl font-bold text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ÖNİZLEME EKRANI ── */}
        {status === "preview" && storyData && (
          <div className="animate-fade-in space-y-8">

            {/* Başlık + butonlar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-xl text-indigo-700">{storyData.title}</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  {LANGUAGES.find(l => l.code === lang)?.label} · Seviye {level}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!isStudentMode && (
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    💾 Kaydet
                  </button>
                )}
                {!isStudentMode && (
                  <button
                    onClick={handleShare}
                    disabled={shareStatus === "preparing"}
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    {shareStatus === "preparing" ? "⏳ Hazırlanıyor..." : "📤 Paylaş"}
                  </button>
                )}
                {!isStudentMode && (
                  <button
                    onClick={() => handleDownload(storyData, level, lang)}
                    className="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    ⬇️ İndir
                  </button>
                )}
                <button
                  onClick={() => { 
  if (isStudentMode) { 
    setGirisEkrani(true); 
    setStatus("idle"); 
    setIsStudentMode(false); 
    setKodInput(""); 
    setOgrenciAd(""); 
  } else { 
    setStatus("idle"); 
    setShareStatus("idle"); 
    setShareKod(null); 
  } 
}}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm"
                >
                  {isStudentMode ? "← Geri" : "🔄 Yeni"}
                </button>
              </div>
            </div>

            {shareStatus === "preparing" && shareProgress && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
                  ⏳ Hazırlanıyor
                </p>
                <p className="text-sm font-bold text-orange-700">{shareProgress}</p>
                <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-orange-400 rounded-full animate-pulse w-full" />
                </div>
              </div>
            )}

            {/* Paylaşım kodu göster */}
            {shareStatus === "done" && shareKod && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">
                    📤 Paylaşım Kodu
                  </p>
                  <p className="text-3xl font-black text-orange-600 tracking-widest">{shareKod}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Bu kodu öğrencilerine gönder. Site: hikaye-atolyesi.vercel.app
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareKod);
                    alert("Kod kopyalandı!");
                  }}
                  className="bg-orange-500 text-white px-4 py-3 rounded-xl font-black text-sm"
                >
                  📋 Kopyala
                </button>
              </div>
            )}

            {/* Sayfalar */}
            {storyData.pages.map((page, i) => (
              <PageCard
                key={i}
                page={page}
                index={i}
                voice={voice}
                speed={speed}
                level={level}
                lang={lang}
                isStudentMode={isStudentMode}
                hikayeKod={storyData?.kod || ""}
hikayeBaslik={storyData?.title || ""}
ogrenciAd={ogrenciAd}
              />
            ))}

            {/* Egzersizler */}
            <ExerciseSection
              storyData={storyData}
              lang={lang}
              ogrenciAd={ogrenciAd}
            />

            {!isStudentMode && (
  <button
    onClick={() => setStatus("idle")}
    className="w-full py-5 text-gray-400 font-bold hover:text-gray-700 transition-colors"
  >
    ← Başa Dön ve Yeni Hikaye Yaz
  </button>
)}
          </div>
        )}

        {/* HATA */}
        {error && (
          <div className="max-w-lg mx-auto mt-6 bg-red-50 border-2 border-red-100 text-red-700 p-5 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-black">Bir hata oluştu</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
// ═══════════════════════════════════════════
// SAYFA KARTI BİLEŞENİ
// ═══════════════════════════════════════════

function PageCard({ page, index, voice, speed, level, lang, isStudentMode, hikayeKod, hikayeBaslik, ogrenciAd }) {
  const [audioState, setAudioState] = useState("idle");
  const [wordAudioState, setWordAudioState] = useState({});
  const [showVocab, setShowVocab] = useState(false);
  const stopAudioRef = useRef(null);

  const handlePlayPage = async () => {
    if (audioState === "loading") return;
    if (audioState === "playing") {
      stopAudioRef.current?.();
      setAudioState("idle");
      return;
    }
    setAudioState("loading");
    try {
      // Öğrenci modunda gömülü ses varsa onu kullan
      if (isStudentMode && (page.audioUrl || page.audioB64)) {
        setAudioState("playing");
        try {
          if (page.audioUrl) {
            const audio = new Audio(page.audioUrl);
            await new Promise(resolve => {
              audio.onended = () => resolve();
              audio.onerror = () => resolve();
              stopAudioRef.current = () => { audio.pause(); audio.currentTime = 0; };
              audio.play().catch(() => resolve());
            });
          } else {
            const binary = atob(page.audioB64);
            const bytes  = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: "audio/wav" });
            const url  = URL.createObjectURL(blob);
            const audio = new Audio(url);
            await new Promise(resolve => {
              audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
              audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
              stopAudioRef.current = () => { audio.pause(); URL.revokeObjectURL(url); };
              audio.play().catch(() => resolve());
            });
          }
        } catch {
          // ses çalınamadı
        }
        await aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "ses_dinlendi", { sayfa: index + 1 });
        setAudioState("idle");
        return;
      }
      // Normal mod: TTS üret
      const { bytes, sampleRate } = await generateTTS(page.text, voice, speed);
      setAudioState("playing");
      const { promise, stop } = buildAudioSource(bytes, sampleRate);
      stopAudioRef.current = stop;
      await promise;
      if (isStudentMode) await aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "ses_dinlendi", { sayfa: index + 1 });
      setAudioState("idle");
    } catch (err) {
      alert("Ses üretilemedi: " + err.message);
      setAudioState("idle");
    }
  };

  const speakWordFallback = (word) => {
    const langObj = LANGUAGES.find(l => l.code === lang);
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang  = langObj?.tts || "tr-TR";
      utterance.rate  = 0.7;
      utterance.onend   = resolve;
      utterance.onerror = resolve;
      speechSynthesis.speak(utterance);
    });
  };

  const handlePlayWord = async (word) => {
    if (wordAudioState[word] === "loading" || wordAudioState[word] === "playing") return;
    if (audioState === "playing") {
      stopAudioRef.current?.();
      setAudioState("idle");
    }
    setWordAudioState(prev => ({ ...prev, [word]: "loading" }));
    // Öğrenci modunda gömülü ses varsa onu kullan
    if (isStudentMode) {
      const vocabItem = page.vocabulary?.find(v => v.word === word);
      if (vocabItem?.audioUrl) {
        setWordAudioState(prev => ({ ...prev, [word]: "playing" }));
        try {
          const audio = new Audio(vocabItem.audioUrl);
          await new Promise(resolve => {
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        } catch {
          await speakWordFallback(word);
        }
        setWordAudioState(prev => ({ ...prev, [word]: "idle" }));
        return;
      }
    }
    try {
      const { bytes, sampleRate } = await generateTTS(`"${word}" kelimesini söyle: ${word}.`, voice, "slow", true);
      setWordAudioState(prev => ({ ...prev, [word]: "playing" }));
      await playAudio(bytes, sampleRate);
      if (isStudentMode) await aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "kelime_dinlendi", { kelime: word, sayfa: index + 1 });
    } catch {
      setWordAudioState(prev => ({ ...prev, [word]: "playing" }));
      await speakWordFallback(word);
    }
    setWordAudioState(prev => ({ ...prev, [word]: "idle" }));
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 animate-fade-in">
      
      {/* Görsel + Metin */}
      <div className="flex flex-col md:flex-row">
        
        {/* Görsel */}
        <div className="w-full md:w-2/5 bg-gray-100 flex items-center justify-center min-h-48">
          {page.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={`Sayfa ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300 py-12">
              <span className="text-4xl">🎨</span>
              <span className="text-xs font-bold">Görsel yükleniyor...</span>
            </div>
          )}
        </div>

        {/* Metin + Ses */}
        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
          
          {/* Sayfa numarası */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">
              Sayfa {index + 1}
            </span>
            
            {/* Ses butonu + hız */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPage}
                disabled={audioState === "loading"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  audioState === "playing"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : audioState === "loading"
                    ? "bg-gray-100 text-gray-400"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                {audioState === "loading" && (
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full spinner inline-block" />
                )}
                {audioState === "playing" && "⏹"}
                {audioState === "idle" && "▶️"}
                {audioState === "loading" ? "Yükleniyor..." : audioState === "playing" ? "Durdur" : "Dinle"}
              </button>
            </div>
          </div>

          {/* Hikaye metni */}
          <p className="text-lg font-medium leading-relaxed text-gray-800 flex-1">
            {page.text}
          </p>

          {/* Kelime sözlüğü toggle */}
          {page.vocabulary && page.vocabulary.length > 0 && (
            <button
              onClick={() => setShowVocab(v => !v)}
              className="self-start text-xs font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              📖 {showVocab ? "Sözlüğü Gizle" : `Kelimeler (${page.vocabulary.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Kelime Sözlüğü */}
      {showVocab && page.vocabulary && (
        <div className="border-t border-gray-100 p-6 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {page.vocabulary.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900">{v.word}</span>
                    {v.ipa && (
                      <span className="text-xs text-gray-400 font-mono">{v.ipa}</span>
                    )}
                  </div>
                  {v.translation && (
                    <p className="text-sm text-indigo-600 font-medium mt-1">
                      {lang === "tr" ? `≈ ${v.translation}` : v.translation}
                    </p>
                  )}
                </div>
                
                {/* Kelime ses butonu */}
                <button
                  onClick={() => handlePlayWord(v.word)}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    wordAudioState[v.word] === "playing"
                      ? "bg-emerald-100 text-emerald-600"
                      : wordAudioState[v.word] === "loading"
                      ? "bg-gray-100 text-gray-400"
                      : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                  }`}
                >
                  {wordAudioState[v.word] === "loading" ? (
                    <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full spinner inline-block" />
                  ) : wordAudioState[v.word] === "playing" ? "🔊" : "🔈"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════
// EGZERSİZ BÖLÜMÜ
// ═══════════════════════════════════════════

function ExerciseSection({ storyData, lang, ogrenciAd }) {
  const [activeTab, setActiveTab] = useState("quiz");

  const matchItems = storyData.pages
    .flatMap(p => p.vocabulary || [])
    .filter((v, i, arr) => arr.findIndex(x => x.word === v.word) === i)
    .slice(0, 8)
    .map(v => ({ word: v.word }));

  const tabs = [
    { id: "quiz",    label: "🎯 Quiz" },
    { id: "fill",    label: "✏️ Boşluk Doldur" },
    { id: "match",   label: "🔗 Eşleştir" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
      
      {/* Tab başlıkları */}
      <div className="flex border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "quiz" && <QuizSection quiz={storyData.quiz} hikayeKod={storyData?.kod || ""} hikayeBaslik={storyData?.title || ""} ogrenciAd={ogrenciAd} />}
{activeTab === "fill" && <FillSection items={storyData.fillInTheBlanks} hikayeKod={storyData?.kod || ""} hikayeBaslik={storyData?.title || ""} ogrenciAd={ogrenciAd} />}
{activeTab === "match" && <MatchSection items={matchItems} lang={lang} hikayeKod={storyData?.kod || ""} hikayeBaslik={storyData?.title || ""} ogrenciAd={ogrenciAd} />}
      </div>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────

function QuizSection({ quiz, hikayeKod, hikayeBaslik, ogrenciAd }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);

  if (!quiz || quiz.length === 0)
    return <p className="text-gray-400 text-center py-8">Quiz bulunamadı.</p>;

  const score = quiz.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="space-y-6">
      {quiz.map((q, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <p className="font-bold text-gray-900 mb-4">{i + 1}. {q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[i] === oi;
              const isCorrect  = q.answer === oi;
              let style = "bg-white border-gray-200 text-gray-700";
              if (revealed) {
                if (isCorrect)       style = "bg-emerald-100 border-emerald-400 text-emerald-800 font-black";
                else if (isSelected) style = "bg-red-100 border-red-400 text-red-700";
              } else if (isSelected) {
                style = "bg-indigo-100 border-indigo-400 text-indigo-800 font-bold";
              }
              return (
                <button
                  key={oi}
                  onClick={() => { if (!revealed) { aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "quiz_cevaplandi", { soru: i, secilen: oi, dogru: oi === q.answer, soruMetni: q.question }); setAnswers(prev => ({ ...prev, [i]: oi })); }}}
                  className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${style}`}
                >
                  {String.fromCharCode(65 + oi)}) {opt.replace(/^[A-Da-d][).]\s*/,"")}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2">
        {revealed && (
          <div className="text-sm font-black text-indigo-700">
            Sonuç: {score} / {quiz.length} doğru
            {score === quiz.length && " 🎉"}
          </div>
        )}
        <button
          onClick={() => {
            if (revealed) { setRevealed(false); setAnswers({}); }
            else setRevealed(true);
          }}
          className="ml-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm"
        >
          {revealed ? "🔄 Tekrar Dene" : "✅ Cevapları Gör"}
        </button>
      </div>
    </div>
  );
}

// ─── Boşluk Doldurma ──────────────────────

function FillSection({ items, hikayeKod, hikayeBaslik, ogrenciAd }) {
  const [inputs, setInputs]   = useState({});
  const [checked, setChecked] = useState({});

  if (!items || items.length === 0)
    return <p className="text-gray-400 text-center py-8">Alıştırma bulunamadı.</p>;

  const handleCheck = (i) => {
    const userAnswer = (inputs[i] || "").trim().toLowerCase();
    const correct = items[i].answer.trim().toLowerCase();
    const isCorrect = userAnswer === correct;
    aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "bosluk_dolduruldu", { soru: i, yazilan: userAnswer, dogru: isCorrect, cevap: correct });
    setChecked(prev => ({ ...prev, [i]: true }));
  };

  const handleReset = (i) => {
    setInputs(prev => ({ ...prev, [i]: "" }));
    setChecked(prev => ({ ...prev, [i]: false }));
  };

  return (
    <div className="space-y-5">
      {items.map((item, i) => {
        const userAnswer = (inputs[i] || "").trim().toLowerCase();
        const correct    = item.answer.trim().toLowerCase();
        const isCorrect  = userAnswer === correct;
        const isChecked  = checked[i];

        const parts = item.sentence.split("_____");

        return (
          <div
            key={i}
            className={`rounded-2xl border-2 p-5 transition-all ${
              isChecked
                ? isCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-red-300 bg-red-50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-lg font-medium text-gray-800 mb-3">
              <span>{parts[0]}</span>
              <input
                type="text"
                value={inputs[i] || ""}
                onChange={e => {
                  setInputs(prev => ({ ...prev, [i]: e.target.value }));
                  setChecked(prev => ({ ...prev, [i]: false }));
                }}
                placeholder="___?"
                className={`border-b-2 outline-none bg-transparent px-2 py-1 w-32 text-center font-bold transition-all ${
                  isChecked
                    ? isCorrect
                      ? "border-emerald-500 text-emerald-700"
                      : "border-red-500 text-red-700"
                    : "border-indigo-400 text-indigo-700"
                }`}
              />
              <span>{parts[1]}</span>
            </div>

            {item.hint && (
              <p className="text-xs text-gray-400 font-medium mb-3">
                💡 İpucu: {item.hint}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCheck(i)}
                disabled={!inputs[i]}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                  inputs[i]
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Kontrol Et
              </button>

              {isChecked && (
                <>
                  <span className={`font-black text-sm ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                    {isCorrect ? "✅ Doğru!" : `❌ Doğrusu: "${item.answer}"`}
                  </span>
                  {!isCorrect && (
                    <button
                      onClick={() => handleReset(i)}
                      className="text-xs text-gray-400 hover:text-gray-700 font-bold"
                    >
                      🔄 Tekrar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Eşleştirme ───────────────────────────

function MatchSection({ items, lang, hikayeKod, hikayeBaslik, ogrenciAd }) {
  const [selected, setSelected] = useState(null); // index of selected audio card
  const [matched, setMatched]   = useState({});   // { index: word }
  const [wrong, setWrong]       = useState(null); // { index, word }
  const [shuffled, setShuffled] = useState([]);
  const [playing, setPlaying]   = useState(null); // index currently playing

  const shuffle = () => setShuffled([...items.map(it => it.word)].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (!items || items.length === 0) return;
    shuffle();
    setSelected(null);
    setMatched({});
    setWrong(null);
  }, [items]);

  if (!items || items.length === 0)
    return <p className="text-gray-400 text-center py-8">Eşleştirme bulunamadı.</p>;

  const playWord = (word, index) => {
    speechSynthesis.cancel();
    setPlaying(index);
    const langObj = LANGUAGES.find(l => l.code === lang);
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = langObj?.tts || "tr-TR";
    utterance.rate = 0.7;
    utterance.onend   = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);
    speechSynthesis.speak(utterance);
    setSelected(index);
  };

  const handleWordClick = (word) => {
    if (Object.values(matched).includes(word)) return;
    if (selected === null) return;
    const isCorrect = items[selected].word === word;
    if (isCorrect) {
      setMatched(prev => ({ ...prev, [selected]: word }));
      setSelected(null);
    } else {
      setWrong({ index: selected, word });
      setTimeout(() => setWrong(null), 800);
    }
  };

  const allDone = items.length > 0 && Object.keys(matched).length === items.length;

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-400 font-medium">🔊 Ses butonuna bas, kelimeyi dinle, sağdan eşini seç.</p>

      {allDone && (
        <div className="text-center py-4 text-emerald-600 font-black text-lg animate-fade-in">
          🎉 Tebrikler! Hepsi doğru eşleştirildi!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Sol: Ses butonları */}
        <div className="space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sesler</p>
          {items.map((item, i) => {
            const isMatched  = matched[i] !== undefined;
            const isSelected = selected === i;
            const isWrong    = wrong?.index === i;
            const isPlaying  = playing === i;
            return (
              <button
                key={i}
                onClick={() => !isMatched && playWord(item.word, i)}
                className={`match-card w-full px-4 py-3 rounded-2xl border-2 font-bold text-sm flex items-center gap-3 transition-all ${
                  isMatched  ? "correct border-emerald-300 bg-emerald-50 text-emerald-700" :
                  isWrong    ? "wrong border-red-300 bg-red-50 text-red-700" :
                  isSelected ? "selected border-indigo-400 bg-indigo-50 text-indigo-800" :
                               "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                }`}
              >
                <span className="text-lg">
                  {isMatched ? "✅" : isPlaying ? "🔊" : "▶️"}
                </span>
                <span>{i + 1}. Kelime</span>
              </button>
            );
          })}
        </div>

        {/* Sağ: Karışık kelimeler */}
        <div className="space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Kelimeler</p>
          {shuffled.map((word, i) => {
            const isMatched  = Object.values(matched).includes(word);
            const isWrong    = wrong?.word === word;
            return (
              <button
                key={i}
                onClick={() => handleWordClick(word)}
                disabled={isMatched || selected === null}
                className={`match-card w-full text-left px-4 py-3 rounded-2xl border-2 font-bold text-sm flex items-center transition-all ${
                  isMatched  ? "correct border-emerald-300 bg-emerald-50 text-emerald-800" :
                  isWrong    ? "wrong border-red-300 bg-red-50 text-red-700" :
                  selected !== null ? "border-indigo-200 bg-white text-gray-700 hover:border-indigo-400 cursor-pointer" :
                                      "border-gray-200 bg-white text-gray-400 cursor-not-allowed"
                }`}
              >
                {word}
                {isMatched && <span className="ml-auto">✅</span>}
              </button>
            );
          })}
        </div>
      </div>

      {!allDone && (
        <button
          onClick={() => { setMatched({}); setSelected(null); setWrong(null); shuffle(); speechSynthesis.cancel(); }}
          className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
        >
          🔄 Sıfırla
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// İSTATİSTİK SAYFASI
// ═══════════════════════════════════════════

function IstatistikSayfasi() {
  const [hikayeler, setHikayeler] = useState([]);
  const [seciliHikaye, setSeciliHikaye] = useState(null);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const yukle = async () => {
      try {
        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "kutuphane-list", payload: {} }),
        });
        const data = await res.json();
        setHikayeler(data || []);
      } catch {}
    };
    yukle();
  }, []);

  const hikayeSec = async (hikaye) => {
    setSeciliHikaye(hikaye);
    setSeciliOgrenci(null);
    setYukleniyor(true);
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "aktivite-getir", payload: { kod: hikaye.title || hikaye.baslik } }),
      });
      const data = await res.json();
      setAktiviteler(data || []);
    } catch {}
    setYukleniyor(false);
  };

  // Özet hesapla
  const ogrenciler = seciliHikaye
    ? [...new Set(aktiviteler.filter(a => a.aksiyon === "hikaye_acildi").map(a => a.ogrenci_ad))]
    : [];

  const quizAktiviteleri = aktiviteler.filter(a => a.aksiyon === "quiz_cevaplandi");
  const quizSorular = seciliHikaye?.data?.quiz || [];

  const soruIstatistikleri = quizSorular.map((soru, i) => {
    const cevaplar = quizAktiviteleri.filter(a => a.detay?.soru === i);
    const dogru = cevaplar.filter(a => a.detay?.dogru).length;
    return {
      soru: soru.question,
      toplam: cevaplar.length,
      dogru,
      yanlis: cevaplar.length - dogru,
      basari: cevaplar.length > 0 ? Math.round((dogru / cevaplar.length) * 100) : null,
    };
  });

  const ogrenciDetay = seciliOgrenci
    ? aktiviteler.filter(a => a.ogrenci_ad === seciliOgrenci)
    : [];

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-black text-gray-900">📊 İstatistikler</h2>

      {/* Hikaye Seçimi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Hikaye Seç</p>
        {hikayeler.length === 0 ? (
          <p className="text-gray-400 text-sm">Henüz kayıtlı hikaye yok.</p>
        ) : (
          <div className="grid gap-2">
            {hikayeler.map(h => (
              <button
                key={h.id}
                onClick={() => hikayeSec(h)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  seciliHikaye?.id === h.id
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-100 hover:border-indigo-200"
                }`}
              >
                <p className="font-black text-gray-900">{h.title || h.baslik}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {LANGUAGES.find(l => l.code === (h.lang || h.dil))?.label} · Seviye {h.level || h.seviye} · {new Date(h.created_at || h.olusturma_tarihi).toLocaleDateString("tr-TR")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Özet */}
      {seciliHikaye && (
        <div className="space-y-4">
          {yukleniyor ? (
            <div className="text-center py-10 text-gray-400 font-bold">Yükleniyor...</div>
          ) : (
            <>
              {/* Genel Kartlar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-indigo-600">{ogrenciler.length}</p>
                  <p className="text-xs text-indigo-400 font-bold mt-1">Öğrenci</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-emerald-600">
                    {aktiviteler.filter(a => a.aksiyon === "ses_dinlendi").length}
                  </p>
                  <p className="text-xs text-emerald-400 font-bold mt-1">Ses Dinleme</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-orange-600">
                    {aktiviteler.filter(a => a.aksiyon === "kelime_dinlendi").length}
                  </p>
                  <p className="text-xs text-orange-400 font-bold mt-1">Kelime Dinleme</p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-violet-600">
                    {quizAktiviteleri.length > 0
                      ? Math.round((quizAktiviteleri.filter(a => a.detay?.dogru).length / quizAktiviteleri.length) * 100)
                      : "-"}%
                  </p>
                  <p className="text-xs text-violet-400 font-bold mt-1">Quiz Başarısı</p>
                </div>
              </div>

              {/* Quiz Soru İstatistikleri */}
              {soruIstatistikleri.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Quiz Soruları</p>
                  <div className="space-y-3">
                    {soruIstatistikleri.map((s, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <p className="font-bold text-gray-800 text-sm mb-2">{i + 1}. {s.soru}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: s.basari !== null ? `${s.basari}%` : "0%" }}
                            />
                          </div>
                          <span className="text-xs font-black text-gray-500 w-16 text-right">
                            {s.basari !== null ? `%${s.basari}` : "Veri yok"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          ✅ {s.dogru} doğru · ❌ {s.yanlis} yanlış · {s.toplam} cevap
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Öğrenci Listesi */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Öğrenciler</p>
                {ogrenciler.length === 0 ? (
                  <p className="text-gray-400 text-sm">Henüz hiç öğrenci açmamış.</p>
                ) : (
                  <div className="grid gap-2">
                    {ogrenciler.map(ad => {
                      const oAktivite = aktiviteler.filter(a => a.ogrenci_ad === ad);
                      const oQuiz = oAktivite.filter(a => a.aksiyon === "quiz_cevaplandi");
                      const oBasari = oQuiz.length > 0
                        ? Math.round((oQuiz.filter(a => a.detay?.dogru).length / oQuiz.length) * 100)
                        : null;
                      return (
                        <button
                          key={ad}
                          onClick={() => setSeciliOgrenci(seciliOgrenci === ad ? null : ad)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            seciliOgrenci === ad
                              ? "border-indigo-400 bg-indigo-50"
                              : "border-gray-100 hover:border-indigo-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-black text-gray-900">{ad}</p>
                            <div className="flex gap-3 text-xs text-gray-400 font-bold">
                              <span>🔊 {oAktivite.filter(a => a.aksiyon === "ses_dinlendi").length}</span>
                              <span>📖 {oAktivite.filter(a => a.aksiyon === "kelime_dinlendi").length}</span>
                              {oBasari !== null && (
                                <span className={oBasari >= 70 ? "text-emerald-600" : "text-red-500"}>
                                  🎯 %{oBasari}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Öğrenci Detayı */}
                          {seciliOgrenci === ad && (
                            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detay</p>
                              {oQuiz.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-gray-500">Quiz Cevapları:</p>
                                  {oQuiz.map((a, i) => (
                                    <p key={i} className="text-xs text-gray-600">
                                      {a.detay?.dogru ? "✅" : "❌"} Soru {(a.detay?.soru ?? 0) + 1}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {oAktivite.filter(a => a.aksiyon === "bosluk_dolduruldu").length > 0 && (
                                <div className="space-y-1 mt-2">
                                  <p className="text-xs font-bold text-gray-500">Boşluk Doldurma:</p>
                                  {oAktivite.filter(a => a.aksiyon === "bosluk_dolduruldu").map((a, i) => (
                                    <p key={i} className="text-xs text-gray-600">
                                      {a.detay?.dogru ? "✅" : "❌"} Soru {(a.detay?.soru ?? 0) + 1}
                                      {!a.detay?.dogru && ` — yazdı: "${a.detay?.yazilan}"`}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {oAktivite.filter(a => a.aksiyon === "eslestirme_tamamlandi").length > 0 && (
                                <p className="text-xs text-emerald-600 font-bold mt-2">✅ Eşleştirmeyi tamamladı</p>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// İNDİRME FONKSİYONU — İnteraktif HTML
// ═══════════════════════════════════════════

function handleDownload(storyData, level, lang) {
  const langLabel = LANGUAGES.find(l => l.code === lang)?.label || lang;

  // ── Sayfalar ──────────────────────────────
  const pagesHtml = storyData.pages.map((p, i) => {
    const vocabHtml = (p.vocabulary || []).map(v => `
      <div class="vocab-item">
        <span class="vocab-word">${v.word}</span>
        <span class="vocab-ipa">${v.ipa || ""}</span>
        <span class="vocab-tr">${v.translation || ""}</span>
      </div>`).join("");
    return `
    <div class="page-card">
      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="Sayfa ${i+1}" class="page-img"/>` : ""}
      <div class="page-body">
        <div class="page-num">SAYFA ${i + 1}</div>
        <p class="page-text">${p.text}</p>
        ${vocabHtml ? `<div class="vocab-box"><div class="vocab-title">📖 Kelimeler</div>${vocabHtml}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  // ── Quiz ──────────────────────────────────
  const quiz = storyData.quiz || [];
  const stripPrefix = o => o.replace(/^[A-Da-d][).]\s*/, "");
  const quizHtml = quiz.map((q, i) => `
    <div class="ex-item" id="q${i}" data-answer="${q.answer}">
      <p class="ex-q">${i + 1}. ${q.question}</p>
      <div class="options">
        ${q.options.map((o, oi) => `
          <button class="option" onclick="quizPick(${i},${oi})">${String.fromCharCode(65+oi)}) ${stripPrefix(o)}</button>
        `).join("")}
      </div>
      <p class="qfb" id="qfb${i}"></p>
    </div>`).join("");

  // ── Boşluk Doldurma ───────────────────────
  const fill = storyData.fillInTheBlanks || [];
  const fillHtml = fill.map((item, i) => {
    const parts = item.sentence.split("_____");
    const safeAnswer = item.answer.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
    return `
    <div class="ex-item" id="fi${i}" data-answer="${safeAnswer}">
      <div class="fill-line">
        <span>${parts[0]}</span>
        <input id="finp${i}" class="fill-inp" placeholder="?"/>
        <span>${parts[1] || ""}</span>
      </div>
      ${item.hint ? `<p class="hint">💡 İpucu: ${item.hint}</p>` : ""}
      <div class="fill-row">
        <button class="btn-check" onclick="checkFill(${i})">Kontrol Et</button>
        <span class="fill-fb" id="ffb${i}"></span>
        <button class="btn-reset" id="frst${i}" style="display:none" onclick="resetFill(${i})">🔄 Tekrar</button>
      </div>
    </div>`;
  }).join("");

  // ── Eşleştirme ────────────────────────────
  const matchVocab = storyData.pages
    .flatMap(p => p.vocabulary || [])
    .filter((v, i, arr) => arr.findIndex(x => x.word === v.word) === i)
    .slice(0, 8);

  const shuffledTranslations = [...matchVocab.map(v => v.translation)]
    .sort(() => Math.random() - 0.5);

  const matchLeftHtml = matchVocab.map((v, i) => `
    <button class="match-btn" id="ml${i}" onclick="matchLeft(${i})">${v.word}</button>
  `).join("");

  const matchRightHtml = shuffledTranslations.map((t, i) => `
    <button class="match-btn" id="mr${i}" onclick="matchRight(${i})">${t}</button>
  `).join("");

  // ── JS verisi ─────────────────────────────
  const quizDataJS  = JSON.stringify(quiz.map(q => q.answer));
  const matchDataJS = JSON.stringify(matchVocab.map(v => v.translation));
  const shuffledJS  = JSON.stringify(shuffledTranslations);

  // ── HTML ──────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${storyData.title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f8fafc;color:#1f2937;padding:20px;}
.container{max-width:700px;margin:0 auto;}

.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;border-radius:24px;padding:40px 30px;text-align:center;margin-bottom:30px;}
.header h1{font-size:2rem;font-weight:900;margin-bottom:8px;}
.header p{opacity:.8;font-size:.95rem;}

.page-card{background:white;border-radius:24px;overflow:hidden;margin-bottom:24px;border:1px solid #e5e7eb;box-shadow:0 2px 12px rgba(0,0,0,.06);}
.page-img{width:100%;height:320px;object-fit:contain;display:block;background:#f1f5f9;}
.page-body{padding:24px;}
.page-num{color:#6366f1;font-weight:800;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
.page-text{font-size:1.15rem;line-height:1.7;font-weight:500;}
.vocab-box{margin-top:20px;padding-top:16px;border-top:2px dashed #e5e7eb;}
.vocab-title{font-size:.7rem;font-weight:900;color:#6366f1;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
.vocab-item{display:flex;align-items:baseline;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;}
.vocab-item:last-child{border-bottom:none;}
.vocab-word{font-weight:800;}
.vocab-ipa{font-family:monospace;font-size:.8rem;color:#9ca3af;}
.vocab-tr{color:#4f46e5;font-weight:600;margin-left:auto;}

.section-title{font-size:1.4rem;font-weight:900;color:#1f2937;margin:36px 0 16px;padding-bottom:10px;border-bottom:3px solid #e5e7eb;}

.ex-item{background:white;border-radius:16px;padding:20px;margin-bottom:14px;border:2px solid #e5e7eb;transition:border-color .2s;}

/* Quiz */
.options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.option{background:#f8fafc;padding:10px 14px;border-radius:10px;font-size:.9rem;border:2px solid #e5e7eb;cursor:pointer;text-align:left;font-family:inherit;font-weight:600;transition:all .15s;}
.option:hover:not([disabled]){background:#eef2ff;border-color:#a5b4fc;}
.option.correct{background:#d1fae5 !important;border-color:#10b981 !important;color:#065f46;font-weight:800;}
.option.wrong{background:#fee2e2 !important;border-color:#ef4444 !important;color:#991b1b;}
.option[disabled]{cursor:default;}
.qfb{font-size:.85rem;font-weight:700;min-height:18px;}
.quiz-score{background:#eef2ff;border:2px solid #6366f1;border-radius:12px;padding:14px 20px;text-align:center;font-weight:900;color:#4338ca;margin-top:16px;font-size:1.1rem;display:none;}

/* Fill */
.fill-line{font-size:1.05rem;font-weight:500;line-height:2;margin-bottom:10px;display:flex;flex-wrap:wrap;align-items:center;gap:4px;}
.fill-inp{border:none;border-bottom:2px solid #6366f1;outline:none;width:120px;text-align:center;font-size:1rem;font-family:inherit;font-weight:700;color:#4338ca;background:transparent;padding:2px 6px;transition:border-color .2s;}
.fill-inp.ok{border-color:#10b981;color:#065f46;}
.fill-inp.err{border-color:#ef4444;color:#991b1b;}
.fill-inp[disabled]{cursor:default;}
.hint{font-size:.8rem;color:#9ca3af;margin-bottom:10px;font-style:italic;}
.fill-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.fill-fb{font-size:.85rem;font-weight:700;}
.fill-fb.ok{color:#059669;}
.fill-fb.err{color:#dc2626;}

/* Buttons */
.btn-check{background:#4f46e5;color:white;border:none;padding:8px 16px;border-radius:10px;font-weight:800;font-size:.85rem;cursor:pointer;font-family:inherit;}
.btn-check:hover{background:#4338ca;}
.btn-reset{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:.85rem;font-weight:700;font-family:inherit;}
.btn-reset:hover{color:#4b5563;}

/* Matching */
.match-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.match-col-title{font-size:.75rem;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;}
.match-col{display:flex;flex-direction:column;gap:8px;}
.match-btn{background:white;border:2px solid #e5e7eb;border-radius:12px;padding:10px 14px;font-size:.9rem;font-weight:700;cursor:pointer;text-align:left;font-family:inherit;transition:all .15s;width:100%;}
.match-btn:hover:not([disabled]){border-color:#a5b4fc;background:#eef2ff;}
.match-btn.sel{border-color:#4f46e5;background:#eef2ff;color:#4338ca;}
.match-btn.matched{border-color:#10b981;background:#d1fae5;color:#065f46;cursor:default;}
.match-btn.shake{border-color:#ef4444;background:#fee2e2;color:#991b1b;}
.match-btn[disabled]{cursor:default;}
.match-hint{font-size:.82rem;color:#9ca3af;margin-bottom:12px;}
.match-success{display:none;text-align:center;padding:16px;color:#059669;font-weight:900;font-size:1.1rem;margin-top:12px;background:#ecfdf5;border-radius:12px;}

footer{text-align:center;color:#9ca3af;font-size:.8rem;padding:30px 0;}
@media print{body{background:white;}.page-card{box-shadow:none;break-inside:avoid;}}
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <h1>${storyData.title}</h1>
    <p>${langLabel} · Seviye ${level}</p>
  </div>

  ${pagesHtml}

  <h2 class="section-title">🎯 Quiz</h2>
  ${quizHtml}
  <div class="quiz-score" id="quiz-score"></div>

  <h2 class="section-title">✏️ Boşluk Doldurma</h2>
  ${fillHtml}

  <h2 class="section-title">🔗 Eşleştirme</h2>
  <p class="match-hint">Soldan bir kelime seç, ardından sağdan doğru anlamı bul.</p>
  <div class="match-grid">
    <div>
      <div class="match-col-title">Kelimeler</div>
      <div class="match-col">${matchLeftHtml}</div>
    </div>
    <div>
      <div class="match-col-title">Anlamlar</div>
      <div class="match-col">${matchRightHtml}</div>
    </div>
  </div>
  <div class="match-success" id="match-ok">🎉 Tebrikler! Hepsi doğru eşleştirildi!</div>

  <footer>AI Hikaye Atölyesi · ${new Date().toLocaleDateString("tr-TR")}</footer>
</div>

<script>
// ── Quiz ─────────────────────────────────────────
var QA = ${quizDataJS};
var qAnswered = {};
function quizPick(qi, oi) {
  if (qAnswered[qi] !== undefined) return;
  aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "quiz_cevaplandi", { soru: qi, secilen: oi, dogru: oi === QA[qi], soruMetni: quiz[qi]?.question });
  qAnswered[qi] = (oi === QA[qi]);
  var box = document.getElementById('q' + qi);
  var btns = box.querySelectorAll('.option');
  btns.forEach(function(b, i) {
    b.disabled = true;
    if (i === QA[qi]) b.classList.add('correct');
    else if (i === oi) b.classList.add('wrong');
  });
  var fb = document.getElementById('qfb' + qi);
  fb.textContent = qAnswered[qi] ? '✅ Doğru!' : '❌ Yanlış';
  fb.style.color  = qAnswered[qi] ? '#059669' : '#dc2626';
  if (Object.keys(qAnswered).length === QA.length) {
    var score = Object.values(qAnswered).filter(Boolean).length;
    var sc = document.getElementById('quiz-score');
    sc.style.display = 'block';
    sc.textContent = 'Sonuç: ' + score + ' / ' + QA.length + (score === QA.length ? ' 🎉' : '');
  }
}

// ── Boşluk Doldurma ──────────────────────────────
function checkFill(i) {
  var box    = document.getElementById('fi' + i);
  var answer = box.dataset.answer;
  var inp = document.getElementById('finp' + i);
  var fb  = document.getElementById('ffb' + i);
  var rst = document.getElementById('frst' + i);
  var val = inp.value.trim().toLowerCase();
  var ok  = val === answer.trim().toLowerCase();
  aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "bosluk_dolduruldu", { soru: i, yazilan: val, dogru: ok, cevap: answer });
  inp.disabled = true;
  inp.classList.add(ok ? 'ok' : 'err');
  fb.textContent = ok ? '✅ Doğru!' : '❌ Doğrusu: "' + answer + '"';
  fb.className = 'fill-fb ' + (ok ? 'ok' : 'err');
  if (!ok) rst.style.display = 'inline';
}
function resetFill(i) {
  var inp = document.getElementById('finp' + i);
  var fb  = document.getElementById('ffb' + i);
  var rst = document.getElementById('frst' + i);
  inp.disabled = false;
  inp.value = '';
  inp.className = 'fill-inp';
  fb.textContent = '';
  fb.className = 'fill-fb';
  rst.style.display = 'none';
  inp.focus();
}

// ── Eşleştirme ───────────────────────────────────
var MD = ${matchDataJS};          // correct translations in original order
var SH = ${shuffledJS};           // shuffled translations shown on right
var mSel = null;                  // currently selected left index
var mDone = {};                   // { leftIdx: rightIdx }
var mTotal = MD.length;

function matchLeft(i) {
  if (mDone[i] !== undefined) return;
  if (mSel === i) {
    document.getElementById('ml' + i).classList.remove('sel');
    mSel = null;
    return;
  }
  if (mSel !== null) document.getElementById('ml' + mSel).classList.remove('sel');
  mSel = i;
  document.getElementById('ml' + i).classList.add('sel');
}

function matchRight(j) {
  for (var k in mDone) { if (mDone[k] === j) return; }
  if (mSel === null) return;
  var correct = MD[mSel] === SH[j];
  if (correct) {
    document.getElementById('ml' + mSel).classList.remove('sel');
    document.getElementById('ml' + mSel).classList.add('matched');
    document.getElementById('ml' + mSel).disabled = true;
    document.getElementById('mr' + j).classList.add('matched');
    document.getElementById('mr' + j).disabled = true;
    mDone[mSel] = j;
    mSel = null;
    if (Object.keys(mDone).length === mTotal) {
      document.getElementById('match-ok').style.display = 'block';
    aktiviteKaydet(hikayeKod, hikayeBaslik, ogrenciAd, "eslestirme_tamamlandi", { toplam: mTotal });
      }
  } else {
    var lBtn = document.getElementById('ml' + mSel);
    var rBtn = document.getElementById('mr' + j);
    lBtn.classList.add('shake'); rBtn.classList.add('shake');
    setTimeout(function() {
      lBtn.classList.remove('shake','sel');
      rBtn.classList.remove('shake');
      mSel = null;
    }, 700);
  }
}
<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${storyData.title.replace(/\s+/g, "_")}_${level}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// UYGULAMAYI BAŞLAT
// ═══════════════════════════════════════════

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);