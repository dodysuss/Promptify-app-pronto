import { NextResponse } from 'next/server';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
}

// Fallback list of top OpenRouter models in case network fetch fails
const FALLBACK_MODELS: OpenRouterModel[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Anthropic: Claude 3.5 Haiku' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1 (Reasoning)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek: V3 Chat' },
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o Mini' },
  { id: 'openai/o3-mini', name: 'OpenAI: o3-mini (Reasoning)' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta: Llama 3.3 70B Instruct' },
  { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash' },
  { id: 'google/gemini-1.5-pro', name: 'Google: Gemini 1.5 Pro' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen: Qwen 2.5 72B Instruct' },
  { id: 'mistralai/mistral-large-2411', name: 'Mistral: Mistral Large 2' },
  { id: 'x-ai/grok-2-1212', name: 'xAI: Grok 2' },
  { id: 'cohere/command-r-plus', name: 'Cohere: Command R+' },
];

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': 'https://promptify.app',
        'X-Title': 'Promptify Workspace',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback' });
    }

    const data = await res.json();
    if (!Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback' });
    }

    const models: OpenRouterModel[] = data.data.map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      description: m.description,
      context_length: m.context_length,
    }));

    // Sort models alphabetically by name
    models.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ models, total: models.length, source: 'openrouter_api' });
  } catch (err: any) {
    console.error('Error fetching OpenRouter models:', err);
    return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback', error: err?.message });
  }
}
