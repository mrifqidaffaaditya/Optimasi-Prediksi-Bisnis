import { NextResponse } from 'next/server';

export async function GET() {
  const penyedia = process.env.AI_PROVIDER || 'local';
  const adaKunciGemini = Boolean(process.env.GEMINI_API_KEY);
  const adaKunciGroq = Boolean(process.env.GROQ_API_KEY);
  const adaKunciOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const adaKunciDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
  const adaKunciOllama = Boolean(process.env.OLLAMA_BASE_URL);

  let penyediaAktif = penyedia;
  let apakahModelBahasaBesar = false;
  let namaModel = 'Asisten Cerdas Lokal (Heuristik)';

  if (penyedia === 'gemini' && adaKunciGemini) {
    apakahModelBahasaBesar = true;
    namaModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  } else if (penyedia === 'groq' && adaKunciGroq) {
    apakahModelBahasaBesar = true;
    namaModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  } else if (penyedia === 'openai' && adaKunciOpenAI) {
    apakahModelBahasaBesar = true;
    namaModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (penyedia === 'deepseek' && adaKunciDeepSeek) {
    apakahModelBahasaBesar = true;
    namaModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  } else if (penyedia === 'ollama' && adaKunciOllama) {
    apakahModelBahasaBesar = true;
    namaModel = process.env.OLLAMA_MODEL || 'llama3.2';
  } else if (adaKunciGemini) {
    penyediaAktif = 'gemini';
    apakahModelBahasaBesar = true;
    namaModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  } else if (adaKunciGroq) {
    penyediaAktif = 'groq';
    apakahModelBahasaBesar = true;
    namaModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  return NextResponse.json({
    provider: penyediaAktif,
    isLLM: apakahModelBahasaBesar,
    modelName: namaModel,
    statusText: apakahModelBahasaBesar
      ? `Terhubung ke ${namaModel}`
      : 'Asisten Cerdas Lokal (Aktif)',
  });
}
