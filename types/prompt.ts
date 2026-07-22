export interface PromptBlock {
  id: string;
  title: string;
  content: string;
}

export interface PromptVersion {
  id: string;
  versionNumber: string; // e.g. "v1.0", "v1.1"
  author: string;
  date: string;
  comment: string; // e.g. "Melhoria da introdução", "Correção de variáveis"
  systemMessage: string;
  promptTemplate: string;
  extraBlocks?: PromptBlock[];
}

export interface PromptItem {
  id: string;
  title: string;
  shortDescription: string;
  modelTag: string; // e.g. 'Gemini', 'ChatGPT', 'N8N Automation', 'Claude', 'OpenRouter'
  categoryTag?: string; // e.g. 'Marketing', 'Suporte', 'Dev'
  folder: string; // e.g. 'Conteúdo', 'Getting Started', 'N8N Automation', 'ChatGPT', 'Gemini'
  project?: string; // e.g. 'Projeto Alpha', 'Lançamento Q3'
  tags: string[]; // e.g. ['análise', 'gpt-4']
  isFavorite: boolean;
  isArchived: boolean;
  author: string;
  version: string;
  updatedAt: string;
  systemMessage: string;
  promptTemplate: string;
  extraBlocks?: PromptBlock[];
  status?: 'Ativo' | 'Em Revisão' | 'Rascunho';
  usageCount?: number;
  votes?: number;
  history?: PromptVersion[];
}

export interface PromptVariable {
  name: string;
  description?: string;
  example?: string;
}
