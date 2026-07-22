import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { systemMessage, promptTemplate } = body;

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Conteúdo do prompt é obrigatório.' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptTemplate,
      config: systemMessage
        ? {
            systemInstruction: systemMessage,
          }
        : undefined,
    });

    return NextResponse.json({
      text: response.text || 'Sem resposta gerada.',
    });
  } catch (error: any) {
    console.error('Gemini Execution Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao conectar com o modelo de IA Gemini.' },
      { status: 500 }
    );
  }
}
