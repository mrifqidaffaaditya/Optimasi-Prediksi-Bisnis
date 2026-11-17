import { NextRequest, NextResponse } from 'next/server';
import { Produk, SumberDaya, MatriksPemakaian } from '@/types';

// Parser Heuristik Cerdas Lokal (Bekerja secara instan tanpa perlu API key luar)
function uraikanSecaraLokal(teks: string): {
  daftarProduk: Produk[];
  products: Produk[];
  daftarSumberDaya: SumberDaya[];
  resources: SumberDaya[];
  matriksPemakaian: MatriksPemakaian;
  usage: MatriksPemakaian;
} {
  const teksKecil = teks.toLowerCase();

  if (teksKecil.includes('katering') || teksKecil.includes('bento') || teksKecil.includes('ayam')) {
    const daftarProduk: Produk[] = [
      { id: 'p1', nama: 'Bento Ayam', name: 'Bento Ayam', keuntungan: 14000, profit: 14000, satuan: 'porsi', unit: 'porsi', hanyaJumlahUtuh: true, integerOnly: true },
      { id: 'p2', nama: 'Bento Sapi', name: 'Bento Sapi', keuntungan: 24000, profit: 24000, satuan: 'porsi', unit: 'porsi', hanyaJumlahUtuh: true, integerOnly: true },
    ];
    const daftarSumberDaya: SumberDaya[] = [
      { id: 'r1', nama: 'Daging Ayam', name: 'Daging Ayam', kapasitas: 30, capacity: 30, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r2', nama: 'Daging Sapi', name: 'Daging Sapi', kapasitas: 18, capacity: 18, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r3', nama: 'Jam Kerja Dapur', name: 'Jam Kerja Dapur', kapasitas: 40, capacity: 40, satuan: 'jam', unit: 'jam', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
    ];
    const matriksPemakaian: MatriksPemakaian = {
      p1: { r1: 0.25, r2: 0, r3: 0.2 },
      p2: { r1: 0, r2: 0.2, r3: 0.25 },
    };

    return {
      daftarProduk,
      products: daftarProduk,
      daftarSumberDaya,
      resources: daftarSumberDaya,
      matriksPemakaian,
      usage: matriksPemakaian,
    };
  }

  if (teksKecil.includes('konveksi') || teksKecil.includes('kaos') || teksKecil.includes('kemeja') || teksKecil.includes('baju')) {
    const daftarProduk: Produk[] = [
      { id: 'p1', nama: 'Kaos Polos', name: 'Kaos Polos', keuntungan: 18000, profit: 18000, satuan: 'potong', unit: 'potong', hanyaJumlahUtuh: true, integerOnly: true },
      { id: 'p2', nama: 'Kemeja Katun', name: 'Kemeja Katun', keuntungan: 38000, profit: 38000, satuan: 'potong', unit: 'potong', hanyaJumlahUtuh: true, integerOnly: true },
    ];
    const daftarSumberDaya: SumberDaya[] = [
      { id: 'r1', nama: 'Kain Katun', name: 'Kain Katun', kapasitas: 200, capacity: 200, satuan: 'meter', unit: 'meter', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r2', nama: 'Jam Mesin Jahit', name: 'Jam Mesin Jahit', kapasitas: 120, capacity: 120, satuan: 'jam', unit: 'jam', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
    ];
    const matriksPemakaian: MatriksPemakaian = {
      p1: { r1: 1.2, r2: 0.5 },
      p2: { r1: 1.8, r2: 1.2 },
    };

    return {
      daftarProduk,
      products: daftarProduk,
      daftarSumberDaya,
      resources: daftarSumberDaya,
      matriksPemakaian,
      usage: matriksPemakaian,
    };
  }

  if (teksKecil.includes('kopi') || teksKecil.includes('coffee') || teksKecil.includes('matcha') || teksKecil.includes('minuman')) {
    const daftarProduk: Produk[] = [
      { id: 'p1', nama: 'Kopi Susu Aren', name: 'Kopi Susu Aren', keuntungan: 8000, profit: 8000, satuan: 'cup', unit: 'cup', hanyaJumlahUtuh: true, integerOnly: true },
      { id: 'p2', nama: 'Matcha Latte', name: 'Matcha Latte', keuntungan: 12000, profit: 12000, satuan: 'cup', unit: 'cup', hanyaJumlahUtuh: true, integerOnly: true },
    ];
    const daftarSumberDaya: SumberDaya[] = [
      { id: 'r1', nama: 'Susu Segar', name: 'Susu Segar', kapasitas: 80, capacity: 80, satuan: 'liter', unit: 'liter', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r2', nama: 'Biji Kopi', name: 'Biji Kopi', kapasitas: 15, capacity: 15, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r3', nama: 'Bubuk Matcha', name: 'Bubuk Matcha', kapasitas: 8, capacity: 8, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
    ];
    const matriksPemakaian: MatriksPemakaian = {
      p1: { r1: 0.15, r2: 0.02, r3: 0 },
      p2: { r1: 0.18, r2: 0, r3: 0.025 },
    };

    return {
      daftarProduk,
      products: daftarProduk,
      daftarSumberDaya,
      resources: daftarSumberDaya,
      matriksPemakaian,
      usage: matriksPemakaian,
    };
  }

  if (teksKecil.includes('roti') || teksKecil.includes('bakery') || teksKecil.includes('kue')) {
    const daftarProduk: Produk[] = [
      { id: 'p1', nama: 'Roti Tawar Spesial', name: 'Roti Tawar Spesial', keuntungan: 6000, profit: 6000, satuan: 'bungkus', unit: 'bungkus', hanyaJumlahUtuh: true, integerOnly: true },
      { id: 'p2', nama: 'Roti Manis Cokelat', name: 'Roti Manis Cokelat', keuntungan: 9000, profit: 9000, satuan: 'bungkus', unit: 'bungkus', hanyaJumlahUtuh: true, integerOnly: true },
    ];
    const daftarSumberDaya: SumberDaya[] = [
      { id: 'r1', nama: 'Tepung Terigu', name: 'Tepung Terigu', kapasitas: 120, capacity: 120, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r2', nama: 'Mentega', name: 'Mentega', kapasitas: 45, capacity: 45, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
      { id: 'r3', nama: 'Waktu Oven', name: 'Waktu Oven', kapasitas: 50, capacity: 50, satuan: 'jam', unit: 'jam', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
    ];
    const matriksPemakaian: MatriksPemakaian = {
      p1: { r1: 0.25, r2: 0.05, r3: 0.08 },
      p2: { r1: 0.2, r2: 0.12, r3: 0.1 },
    };

    return {
      daftarProduk,
      products: daftarProduk,
      daftarSumberDaya,
      resources: daftarSumberDaya,
      matriksPemakaian,
      usage: matriksPemakaian,
    };
  }

  // Model cadangan bisnis umum
  const daftarProduk: Produk[] = [
    { id: 'p1', nama: 'Produk Standar A', name: 'Produk Standar A', keuntungan: 15000, profit: 15000, satuan: 'unit', unit: 'unit', hanyaJumlahUtuh: true, integerOnly: true },
    { id: 'p2', nama: 'Produk Premium B', name: 'Produk Premium B', keuntungan: 28000, profit: 28000, satuan: 'unit', unit: 'unit', hanyaJumlahUtuh: true, integerOnly: true },
  ];
  const daftarSumberDaya: SumberDaya[] = [
    { id: 'r1', nama: 'Bahan Baku Pokok', name: 'Bahan Baku Pokok', kapasitas: 150, capacity: 150, satuan: 'kg', unit: 'kg', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
    { id: 'r2', nama: 'Waktu Operasional Mesin', name: 'Waktu Operasional Mesin', kapasitas: 80, capacity: 80, satuan: 'jam kerja', unit: 'jam kerja', jenisBatasan: 'TIDAK_LEBIH_DARI', type: 'LEQ' },
  ];
  const matriksPemakaian: MatriksPemakaian = {
    p1: { r1: 0.6, r2: 0.3 },
    p2: { r1: 1.2, r2: 0.5 },
  };

  return {
    daftarProduk,
    products: daftarProduk,
    daftarSumberDaya,
    resources: daftarSumberDaya,
    matriksPemakaian,
    usage: matriksPemakaian,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Cerita teks usaha wajib diisi.' }, { status: 400 });
    }

    const penyedia = process.env.AI_PROVIDER || 'local';
    const kunciGemini = process.env.GEMINI_API_KEY;
    const kunciGroq = process.env.GROQ_API_KEY;
    const kunciOpenAI = process.env.OPENAI_API_KEY;

    const instruksiSistem = `Anda adalah asisten pembuat model optimasi bisnis matematis Linear Programming.
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
    if ((penyedia === 'gemini' || !penyedia || penyedia === 'local') && kunciGemini) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${kunciGemini}`;
        const respons = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${instruksiSistem}\n\nCerita Usaha Pengguna:\n${prompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (respons.ok) {
          const data = await respons.json();
          const teksMentah = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (teksMentah) {
            const diurai = JSON.parse(teksMentah);
            if (diurai.products && diurai.resources && diurai.usage) {
              const daftarProduk = diurai.products.map((p: any) => ({
                ...p,
                nama: p.name,
                keuntungan: p.profit,
                satuan: p.unit,
                hanyaJumlahUtuh: p.integerOnly,
              }));
              const daftarSumberDaya = diurai.resources.map((r: any) => ({
                ...r,
                nama: r.name,
                kapasitas: r.capacity,
                satuan: r.unit,
                jenisBatasan: r.type,
              }));
              return NextResponse.json({
                ...diurai,
                daftarProduk,
                daftarSumberDaya,
                matriksPemakaian: diurai.usage,
                source: 'gemini',
              });
            }
          }
        }
      } catch (err) {
        console.error('Gemini call error:', err);
      }
    }

    // 2. Groq Cloud Provider
    if ((penyedia === 'groq' || kunciGroq) && kunciGroq) {
      try {
        const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        const respons = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${kunciGroq}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: instruksiSistem },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (respons.ok) {
          const data = await respons.json();
          const teksMentah = data?.choices?.[0]?.message?.content;
          if (teksMentah) {
            const diurai = JSON.parse(teksMentah);
            if (diurai.products && diurai.resources && diurai.usage) {
              const daftarProduk = diurai.products.map((p: any) => ({
                ...p,
                nama: p.name,
                keuntungan: p.profit,
                satuan: p.unit,
                hanyaJumlahUtuh: p.integerOnly,
              }));
              const daftarSumberDaya = diurai.resources.map((r: any) => ({
                ...r,
                nama: r.name,
                kapasitas: r.capacity,
                satuan: r.unit,
                jenisBatasan: r.type,
              }));
              return NextResponse.json({
                ...diurai,
                daftarProduk,
                daftarSumberDaya,
                matriksPemakaian: diurai.usage,
                source: 'groq',
              });
            }
          }
        }
      } catch (err) {
        console.error('Groq call error:', err);
      }
    }

    // 3. OpenAI Provider
    if ((penyedia === 'openai' || kunciOpenAI) && kunciOpenAI) {
      try {
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const respons = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${kunciOpenAI}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: instruksiSistem },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (respons.ok) {
          const data = await respons.json();
          const teksMentah = data?.choices?.[0]?.message?.content;
          if (teksMentah) {
            const diurai = JSON.parse(teksMentah);
            if (diurai.products && diurai.resources && diurai.usage) {
              const daftarProduk = diurai.products.map((p: any) => ({
                ...p,
                nama: p.name,
                keuntungan: p.profit,
                satuan: p.unit,
                hanyaJumlahUtuh: p.integerOnly,
              }));
              const daftarSumberDaya = diurai.resources.map((r: any) => ({
                ...r,
                nama: r.name,
                kapasitas: r.capacity,
                satuan: r.unit,
                jenisBatasan: r.type,
              }));
              return NextResponse.json({
                ...diurai,
                daftarProduk,
                daftarSumberDaya,
                matriksPemakaian: diurai.usage,
                source: 'openai',
              });
            }
          }
        }
      } catch (err) {
        console.error('OpenAI call error:', err);
      }
    }

    // Jalur Cadangan Utama: Parser Cerdas Heuristik Lokal
    const modelCadangan = uraikanSecaraLokal(prompt);
    return NextResponse.json({ ...modelCadangan, source: 'local' });
  } catch (galat: any) {
    console.error('Galat API text-to-model:', galat);
    return NextResponse.json(
      { error: 'Gagal memproses cerita usaha' },
      { status: 500 }
    );
  }
}
