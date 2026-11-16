import { NextResponse } from 'next/server';

export async function GET() {
  const provider = process.env.AI_PROVIDER || 'local';
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);
  const hasOllama = Boolean(process.env.OLLAMA_BASE_URL);

  let activeProvider = provider;
  let isLLM = false;
  let modelName = 'Parser Heuristik Lokal';

  if (provider === 'gemini' && hasGemini) {
    isLLM = true;
    modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  } else if (provider === 'groq' && hasGroq) {
    isLLM = true;
    modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  } else if (provider === 'openai' && hasOpenAI) {
    isLLM = true;
    modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'deepseek' && hasDeepSeek) {
    isLLM = true;
    modelName = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  } else if (provider === 'ollama' && hasOllama) {
    isLLM = true;
    modelName = process.env.OLLAMA_MODEL || 'llama3.2';
  } else if (hasGemini) {
    // Auto-detect fallback to Gemini if key exists
    activeProvider = 'gemini';
    isLLM = true;
    modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  } else if (hasGroq) {
    // Auto-detect fallback to Groq if key exists
    activeProvider = 'groq';
    isLLM = true;
    modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  return NextResponse.json({
    provider: activeProvider,
    isLLM,
    modelName,
    statusText: isLLM
      ? `Terhubung ke ${modelName}`
      : 'Asisten Cerdas Lokal (Aktif)',
  });
}
