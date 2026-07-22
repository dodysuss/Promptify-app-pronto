import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { promptTemplate, systemMessage, provider, apiKey, model, temperature, maxTokens } = await req.json();

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Nenhum prompt foi fornecido' }, { status: 400 });
    }

    const tempNum = typeof temperature === 'number' ? temperature : 0.7;
    const tokensNum = typeof maxTokens === 'number' ? maxTokens : 2048;

    const fullPrompt = systemMessage
      ? `System Instructions:\n${systemMessage}\n\nUser Request / Prompt:\n${promptTemplate}`
      : promptTemplate;

    // 1. OPENROUTER PROVIDER
    if (provider === 'openrouter') {
      const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API OpenRouter não configurada. Por favor, adicione sua API Key do OpenRouter nas Configurações (Settings) do app.',
          },
          { status: 400 }
        );
      }

      const selectedModel = model || 'anthropic/claude-3.5-sonnet';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://promptify.app',
          'X-Title': 'Promptify Workspace',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          temperature: tempNum,
          max_tokens: tokensNum,
          messages: [
            ...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
            { role: 'user', content: promptTemplate },
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
      return NextResponse.json({ text: textOutput, provider: 'openrouter', model: selectedModel });
    }

    // 2. OPENAI PROVIDER
    if (provider === 'openai') {
      const openAiKey = (apiKey || process.env.OPENAI_API_KEY || '').trim();
      if (!openAiKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API OpenAI não configurada. Por favor, adicione sua OpenAI API Key nas Configurações do app.',
          },
          { status: 400 }
        );
      }

      const selectedModel = (model || 'gpt-4o').trim();
      const isReasoningModel =
        selectedModel.startsWith('o1') ||
        selectedModel.startsWith('o3') ||
        selectedModel.startsWith('o-');

      const messages: Array<{ role: string; content: string }> = [];
      if (systemMessage) {
        messages.push({
          role: isReasoningModel ? 'developer' : 'system',
          content: systemMessage,
        });
      }
      messages.push({ role: 'user', content: promptTemplate });

      const requestBody: any = {
        model: selectedModel,
        messages,
      };

      if (isReasoningModel) {
        requestBody.max_completion_tokens = tokensNum;
      } else {
        requestBody.temperature = tempNum;
        requestBody.max_tokens = tokensNum;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    if (provider === 'anthropic') {
      const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return NextResponse.json(
          {
            error:
              'Chave da API Anthropic não configurada. Adicione sua Anthropic API Key nas Configurações do app ou selecione OpenRouter.',
          },
          { status: 400 }
        );
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          temperature: tempNum,
          max_tokens: tokensNum,
          system: systemMessage || undefined,
          messages: [{ role: 'user', content: promptTemplate }],
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
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não foi encontrada.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
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
