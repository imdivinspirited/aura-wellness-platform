import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getGemini() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function askGlobalLLM(message) {
  const systemPrompt =
    'You are a helpful global assistant for Art of Living users. Answer clearly, use Markdown (bold, lists, tables where useful), ' +
    'and respond in the same language as the user where possible. Support calculations, translations, current events, and general knowledge.';

  // 1. Try OpenAI GPT-4o
  const openai = getOpenAI();
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 900,
      });
      const answer = completion.choices?.[0]?.message?.content?.trim();
      if (answer) return { answer, provider: 'openai' };
    } catch (err) {
      console.warn('[global-llm] OpenAI failed, trying Gemini', err?.message || err);
    }
  }

  // 2. Try Gemini
  const geminiClient = getGemini();
  if (geminiClient) {
    try {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] },
      ]);
      const answer = result.response.text().trim();
      if (answer) return { answer, provider: 'gemini' };
    } catch (err) {
      console.warn('[global-llm] Gemini failed, trying Anthropic', err?.message || err);
    }
  }

  // 3. Try Anthropic Claude
  const anthropicClient = getAnthropic();
  if (anthropicClient) {
    try {
      const msg = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 900,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      });
      const answer = msg.content?.[0]?.text?.trim();
      if (answer) return { answer, provider: 'anthropic' };
    } catch (err) {
      console.warn('[global-llm] Anthropic failed', err?.message || err);
    }
  }

  return {
    answer:
      'Namaste 🙏 The global AI services are temporarily unavailable. Please try again in a few minutes or ask a platform-specific question.',
    provider: 'fallback',
  };
}

