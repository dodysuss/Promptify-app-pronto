import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedProvider, normalizeApiKey, normalizeModel, sanitizeText } from '@/lib/security-helpers';

const MAX_PROMPT_LENGTH = 12000;
const MAX_SYSTEM_MESSAGE_LENGTH = 8000;
const MAX_TOKENS = 8192;
const REQUEST_TIMEOUT_MS = 30000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { promptTemplate, systemMessage, provider, apiKey, model, temperature, maxTokens } = body as Record<string, any>;

    const promptText = sanitizeText(typeof promptTemplate === 'string' ? promptTemplate : '', MAX_PROMPT_LENGTH);
    const systemText = sanitizeText(typeof systemMessage === 'string' ? systemMessage : '', MAX_SYSTEM_MESSAGE_LENGTH);

    if (!promptText) {
      return NextResponse.json({ error: 'Nenhum prompt foi fornecido' }, { status: 400 });
    }

    const providerName = typeof provider === 'string' ? provider.toLowerCase() : 'gemini';
    if (!isAllowedProvider(providerName)) {
      return NextResponse.json({ error: 'Provedor de IA inválido.' }, { status: 400 });
    }

    const tempNum = typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.7;
    const tokensNum = typeof maxTokens === 'number' ? Math.max(1, Math.min(MAX_TOKENS, maxTokens)) : 2048;

    const fullPrompt = systemText
      ? `System Instructions:\n${systemText}\n\nUser Request / Prompt:\n${promptText}`
      : promptText;

    const selectedModel = normalizeModel(typeof model === 'string' ? model : '') || undefined;
    const normalizedApiKey = normalizeApiKey(typeof apiKey === 'string' ? apiKey : '');

    // 1. OPENROUTER PROVIDER
    if (providerName === 'openrouter') {
      const openRouterKey = normalizedApiKey || process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API OpenRouter não configurada. Por favor, adicione sua API Key do OpenRouter nas Configurações (Settings) do app.',
          },
          { status: 400 }
        );
      }

      const safeModel = selectedModel || 'anthropic/claude-3.5-sonnet';
      const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://promptify.app',
          'X-Title': 'Promptify Workspace',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: safeModel,
          temperature: tempNum,
          max_tokens: tokensNum,
          messages: [
            ...(systemText ? [{ role: 'system', content: systemText }] : []),
            { role: 'user', content: promptText },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData.error?.message || `Erro OpenRouter (${response.status})` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const textOutput = data.choices?.[0]?.message?.content || 'Nenhuma resposta retornada pelo OpenRouter.';
      return NextResponse.json({ text: textOutput, provider: 'openrouter', model: safeModel });
    }

    // 2. OPENAI PROVIDER
    if (providerName === 'openai') {
      const openAiKey = (normalizedApiKey || process.env.OPENAI_API_KEY || '').trim();
      if (!openAiKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API OpenAI não configurada. Por favor, adicione sua OpenAI API Key nas Configurações do app.',
          },
          { status: 400 }
        );
      }

      const resolvedModel = (selectedModel || 'gpt-4o').trim();
      const isReasoningModel =
        resolvedModel.startsWith('o1') ||
        resolvedModel.startsWith('o3') ||
        resolvedModel.startsWith('o-');

      const messages: Array<{ role: string; content: string }> = [];
      if (systemText) {
        messages.push({
          role: isReasoningModel ? 'developer' : 'system',
          content: systemText,
        });
      }
      messages.push({ role: 'user', content: promptText });

      const requestBody: any = {
        model: resolvedModel,
        messages,
      };

      if (isReasoningModel) {
        requestBody.max_completion_tokens = tokensNum;
      } else {
        requestBody.temperature = tempNum;
        requestBody.max_tokens = tokensNum;
      }

      const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg =
          errData.error?.message ||
          `Erro OpenAI (${response.status}: ${response.statusText})`;
        return NextResponse.json({ error: errMsg }, { status: response.status });
      }

      const data = await response.json();
      const textOutput =
        data.choices?.[0]?.message?.content || 'Nenhuma resposta retornada pela OpenAI.';
      return NextResponse.json({
        text: textOutput,
        provider: 'openai',
        model: selectedModel,
      });
    }

    // 3. ANTHROPIC PROVIDER
    if (providerName === 'anthropic') {
      const anthropicKey = normalizedApiKey || process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API Anthropic não configurada. Adicione sua Anthropic API Key nas Configurações do app ou selecione OpenRouter.',
          },
          { status: 400 }
        );
      }

      const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel || 'claude-3-5-sonnet-20241022',
          temperature: tempNum,
          max_tokens: tokensNum,
          system: systemText || undefined,
          messages: [{ role: 'user', content: promptText }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData.error?.message || `Erro Anthropic (${response.status})` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const textOutput = data.content?.[0]?.text || 'Nenhuma resposta retornada pela Anthropic.';
      return NextResponse.json({ text: textOutput, provider: 'anthropic' });
    }

    // 4. DEFAULT: GOOGLE GEMINI PROVIDER
    const geminiKey = normalizedApiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não foi encontrada.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: selectedModel || 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        temperature: tempNum,
        maxOutputTokens: tokensNum,
      },
    });

    return NextResponse.json({ text: response.text, provider: 'gemini' });
  } catch (err: any) {
    console.error('LLM Execution API Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ocorreu um erro interno ao processar a requisição LLM.' },
      { status: 500 }
    );
  }
}
