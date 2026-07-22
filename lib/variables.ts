import { PromptVariable } from '@/types/prompt';

export function extractVariables(text: string): PromptVariable[] {
  if (!text) return [];
  const regex = /\[([A-Z0-9_\/\s\.\-]+)\]/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].trim()) {
      matches.add(match[1].trim());
    }
  }

  const variables: PromptVariable[] = Array.from(matches).map((varName) => {
    let example = 'Exemplo de valor';
    let description = `Parâmetro de substituição no prompt.`;

    const upper = varName.toUpperCase();
    if (upper.includes('EMPRESA') || upper.includes('NOME DA EMPRESA')) {
      example = 'Acme Corp';
      description = 'Nome da sua organização ou cliente.';
    } else if (upper.includes('NICHO') || upper.includes('SETOR')) {
      example = 'SaaS B2B de Recursos Humanos';
      description = 'Mercado ou segmento de atuação da empresa.';
    } else if (upper.includes('JSON')) {
      example = '{"ticket_id": 1024, "message": "Estou com problemas para acessar o dashboard"}';
      description = 'Estrutura de dados em formato JSON.';
    } else if (upper.includes('EVENTO') || upper.includes('STRIPE')) {
      example = 'payment_intent.succeeded';
      description = 'Tipo do evento de webhook acionado.';
    } else if (upper.includes('TEMA')) {
      example = 'Como aumentar a produtividade com IA em 2026';
      description = 'Assunto principal a ser abordado.';
    } else if (upper.includes('PÚBLICO') || upper.includes('PUBLICO')) {
      example = 'Fundadores de Startups e Gestores de Tecnologia';
      description = 'Público-alvo principal.';
    } else if (upper.includes('PROJETO') || upper.includes('STACK')) {
      example = 'Next.js + TypeScript + Tailwind CSS';
      description = 'Tecnologias utilizadas no projeto.';
    }

    return {
      name: `[${varName}]`,
      description,
      example,
    };
  });

  return variables;
}

export function replaceVariables(text: string, values: Record<string, string>): string {
  let result = text;
  Object.entries(values).forEach(([varName, val]) => {
    if (val && val.trim() !== '') {
      result = result.replaceAll(varName, val.trim());
    }
  });
  return result;
}
