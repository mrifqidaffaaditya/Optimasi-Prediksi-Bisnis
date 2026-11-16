import { NextRequest, NextResponse } from 'next/server';
import { Product, Resource, UsageMatrix } from '@/types';

// Fallback rule-based heuristic parser for local processing
function parseLocally(text: string): {
  products: Product[];
  resources: Resource[];
  usage: UsageMatrix;
} {
  const lower = text.toLowerCase();

  if (lower.includes('katering') || lower.includes('bento') || lower.includes('ayam')) {
    return {
      products: [
        { id: 'p1', name: 'Bento Ayam', profit: 14000, unit: 'porsi', integerOnly: true },
        { id: 'p2', name: 'Bento Sapi', profit: 24000, unit: 'porsi', integerOnly: true },
      ],
      resources: [
        { id: 'r1', name: 'Daging Ayam', capacity: 30, unit: 'kg', type: 'LEQ' },
        { id: 'r2', name: 'Daging Sapi', capacity: 18, unit: 'kg', type: 'LEQ' },
        { id: 'r3', name: 'Jam Kerja Dapur', capacity: 40, unit: 'jam', type: 'LEQ' },
      ],
      usage: {
        p1: { r1: 0.25, r2: 0, r3: 0.2 },
        p2: { r1: 0, r2: 0.2, r3: 0.25 },
      },
    };
  }

  if (lower.includes('konveksi') || lower.includes('kaos') || lower.includes('kemeja') || lower.includes('baju')) {
    return {
      products: [
        { id: 'p1', name: 'Kaos Polos', profit: 18000, unit: 'potong', integerOnly: true },
        { id: 'p2', name: 'Kemeja Katun', profit: 38000, unit: 'potong', integerOnly: true },
      ],
      resources: [
        { id: 'r1', name: 'Kain Katun', capacity: 200, unit: 'meter', type: 'LEQ' },
        { id: 'r2', name: 'Jam Mesin Jahit', capacity: 120, unit: 'jam', type: 'LEQ' },
      ],
      usage: {
        p1: { r1: 1.2, r2: 0.5 },
        p2: { r1: 1.8, r2: 1.2 },
      },
    };
  }

  if (lower.includes('kopi') || lower.includes('coffee') || lower.includes('matcha') || lower.includes('minuman')) {
    return {
      products: [
        { id: 'p1', name: 'Kopi Susu Aren', profit: 8000, unit: 'cup', integerOnly: true },
        { id: 'p2', name: 'Matcha Latte', profit: 12000, unit: 'cup', integerOnly: true },
      ],
      resources: [
        { id: 'r1', name: 'Susu Segar', capacity: 80, unit: 'liter', type: 'LEQ' },
        { id: 'r2', name: 'Biji Kopi', capacity: 15, unit: 'kg', type: 'LEQ' },
        { id: 'r3', name: 'Bubuk Matcha', capacity: 8, unit: 'kg', type: 'LEQ' },
      ],
      usage: {
        p1: { r1: 0.15, r2: 0.02, r3: 0 },
        p2: { r1: 0.18, r2: 0, r3: 0.025 },
      },
    };
  }

  if (lower.includes('roti') || lower.includes('bakery') || lower.includes('kue')) {
    return {
      products: [
        { id: 'p1', name: 'Roti Tawar Spesial', profit: 6000, unit: 'bungkus', integerOnly: true },
        { id: 'p2', name: 'Roti Manis Cokelat', profit: 9000, unit: 'bungkus', integerOnly: true },
      ],
      resources: [
        { id: 'r1', name: 'Tepung Terigu', capacity: 120, unit: 'kg', type: 'LEQ' },
        { id: 'r2', name: 'Mentega', capacity: 45, unit: 'kg', type: 'LEQ' },
        { id: 'r3', name: 'Waktu Oven', capacity: 50, unit: 'jam', type: 'LEQ' },
      ],
      usage: {
        p1: { r1: 0.25, r2: 0.05, r3: 0.08 },
        p2: { r1: 0.2, r2: 0.12, r3: 0.1 },
      },
    };
  }

  // Generic fallback business model
  return {
    products: [
      { id: 'p1', name: 'Produk Standar A', profit: 15000, unit: 'unit', integerOnly: true },
      { id: 'p2', name: 'Produk Premium B', profit: 28000, unit: 'unit', integerOnly: true },
    ],
    resources: [
      { id: 'r1', name: 'Bahan Baku Pokok', capacity: 150, unit: 'kg', type: 'LEQ' },
      { id: 'r2', name: 'Waktu Operasional Mesin', capacity: 80, unit: 'jam kerja', type: 'LEQ' },
    ],
    usage: {
      p1: { r1: 0.6, r2: 0.3 },
      p2: { r1: 1.2, r2: 0.5 },
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt teks wajib diisi' }, { status: 400 });
    }

    const provider = process.env.AI_PROVIDER || 'local';
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const systemPrompt = `Anda adalah asisten pembuat model optimasi bisnis matematis Linear Programming.
Tugas Anda adalah membaca cerita usaha pengguna dan menyusunnya menjadi format JSON yang valid.
Format JSON yang dihasilkan HARUS persis seperti berikut (tanpa markdown tambahan):
{
  "products": [
    { "id": "p1", "name": "Nama Produk 1", "profit": 6000, "unit": "bungkus", "integerOnly": true },
    { "id": "p2", "name": "Nama Produk 2", "profit": 9000, "unit": "bungkus", "integerOnly": true }
  ],
  "resources": [
    { "id": "r1", "name": "Nama Bahan/Sumber Daya 1", "capacity": 100, "unit": "kg", "type": "LEQ" },
    { "id": "r2", "name": "Nama Bahan/Sumber Daya 2", "capacity": 40, "unit": "jam", "type": "LEQ" }
  ],
  "usage": {
    "p1": { "r1": 0.25, "r2": 0.1 },
    "p2": { "r1": 0.2, "r2": 0.15 }
  }
}
Catatan:
- "type" pada resources: "LEQ" (maksimum/tidak boleh lebih), "GEQ" (minimum), atau "EQ" (harus tepat).
- "profit": angka keuntungan bersih per unit (dalam Rupiah).
- "usage": pemakaian resource per 1 unit product.
Hanya kembalikan JSON murni tanpa penjelasan awalan atau akhiran.`;

    // 1. Google Gemini Provider
    if ((provider === 'gemini' || !provider || provider === 'local') && geminiKey) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nCerita Usaha Pengguna:\n${prompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.products && parsed.resources && parsed.usage) {
              return NextResponse.json({ ...parsed, source: 'gemini' });
            }
          }
        }
      } catch (err) {
        console.error('Gemini call error:', err);
      }
    }

    // 2. Groq Cloud Provider
    if ((provider === 'groq' || groqKey) && groqKey) {
      try {
        const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.products && parsed.resources && parsed.usage) {
              return NextResponse.json({ ...parsed, source: 'groq' });
            }
          }
        }
      } catch (err) {
        console.error('Groq call error:', err);
      }
    }

    // 3. OpenAI Provider
    if ((provider === 'openai' || openaiKey) && openaiKey) {
      try {
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.products && parsed.resources && parsed.usage) {
              return NextResponse.json({ ...parsed, source: 'openai' });
            }
          }
        }
      } catch (err) {
        console.error('OpenAI call error:', err);
      }
    }

    // Default: Fallback to smart local heuristic parser
    const fallbackModel = parseLocally(prompt);
    return NextResponse.json({ ...fallbackModel, source: 'local' });
  } catch (error: any) {
    console.error('Text-to-model API error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses cerita usaha' },
      { status: 500 }
    );
  }
}
