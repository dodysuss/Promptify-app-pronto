import { PromptItem } from '@/types/prompt';

export const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'p_appwrite',
    title: 'Appwrite Backend - Database Schemas & User Auth API',
    shortDescription: 'Estrutura completa de coleções, índices, permissões de acesso (RLS) e métodos de autenticação de usuários para integrar com o SDK do Appwrite.',
    modelTag: 'Appwrite Backend',
    categoryTag: 'Engenharia',
    folder: 'Desenvolvimento',
    tags: ['appwrite', 'database', 'auth', 'backend', 'nosql'],
    isFavorite: true,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'v1.0',
    updatedAt: 'Hoje',
    systemMessage: 'Atue como um Arquiteto de Software Sênior especialista no ecossistema Appwrite (Databases, Auth, Storage e Cloud Functions).',
    promptTemplate: `Atue como Arquiteto de Software Sênior especialista em Appwrite.

Crie uma especificação técnica completa para o backend da aplicação [NOME DO PROJETO] operando em Appwrite.

Instruções necessárias:
1. **Configuração do Cliente Appwrite**: Inicialização com Endpoint, Project ID e chave Client/Server.
2. **Autenticação (Auth)**: Estratégias de Login (Email/Senha, OAuth, Magic Link) e gerenciamento de sessões de usuário.
3. **Modelagem de Coleções (Databases)**: Atributos, Tipos (String, Integer, Enum, Boolean, Relationship) e Índices para a coleção [NOME DA COLEÇÃO].
4. **Regras de Permissão (Security & RLS)**: Controle de Acesso por Role (Any, Users, Team, User ID) para Create, Read, Update, Delete.`,
    extraBlocks: [
      {
        id: 'b_appwrite_1',
        title: 'Exemplo de Código SDK Web (Appwrite Client)',
        content: `import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('[PROJECT_ID]');

export const account = new Account(client);
export const databases = new Databases(client);`
      },
      {
        id: 'b_appwrite_2',
        title: 'Diretrizes de Segurança & Índices',
        content: 'Garanta que permissões de leitura/escrita sejam restritas ao ID do usuário criador (User ID). Crie índices compostos para ordenação rápida por data de criação (createdAt DESC).'
      }
    ]
  },
  {
    id: 'p1',
    title: 'Brand Ambassador Program Design',
    shortDescription: 'Este prompt é projetado para gerar um framework abrangente para um programa de embaixadores de marca focado no mercado B2B, ideal para empresas SaaS que buscam alavancar influenciadores do setor e clientes defensores.',
    modelTag: 'Gemini',
    categoryTag: 'Marketing',
    folder: 'Marketing',
    tags: ['análise', 'gpt-4', 'b2b', 'marketing'],
    isFavorite: true,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'V 1.2',
    updatedAt: 'Há 2 dias',
    systemMessage: 'Atue como um Especialista Sênior em Marketing de Comunidade com ampla experiência no setor B2B SaaS.',
    promptTemplate: `Atue como um Especialista Sênior em Marketing de Comunidade com ampla experiência no setor B2B SaaS.

Preciso que você crie uma proposta detalhada para um novo Programa de Embaixadores de Marca para a nossa empresa, [NOME DA EMPRESA], que atua no nicho de [NICHO/SETOR].

A proposta deve incluir:
1. **Objetivos do Programa**: 3 a 5 objetivos SMART.
2. **Perfil do Embaixador Ideal (ICP)**: Quem estamos buscando?
3. **Estrutura de Incentivos**: O que oferecemos em troca?
4. **Métricas de Sucesso (KPIs)**: ROI no primeiro trimestre.
5. **Plano de Lançamento (Go-to-Market)**: Cronograma de 4 semanas.

Mantenha um tom profissional, estratégico e orientado a dados.`,
    extraBlocks: [
      {
        id: 'b1',
        title: 'Exemplos de Poucas Amostras (Few-shot Examples)',
        content: 'Exemplo A: Empresa TechCorp acelerou em 35% as indicações qualificadas oferecendo acesso antecipado a novas features para embaixadores chave.'
      },
      {
        id: 'b2',
        title: 'Restrições & Diretrizes de Tom',
        content: 'Não utilize linguagem excessivamente promocional. Mantenha foco em métricas B2B acionáveis e crescimento orgânico.'
      }
    ],
    votes: 1,
    history: [
      {
        id: 'p1_v12',
        versionNumber: 'v1.2',
        author: 'Jorge Suss',
        date: '20/07/2026, 14:20',
        comment: 'Correção de variáveis e blocos poucos exemplos',
        systemMessage: 'Atue como um Especialista Sênior em Marketing de Comunidade com ampla experiência no setor B2B SaaS.',
        promptTemplate: `Atue como um Especialista Sênior em Marketing de Comunidade com ampla experiência no setor B2B SaaS.

Preciso que você crie uma proposta detalhada para um novo Programa de Embaixadores de Marca para a nossa empresa, [NOME DA EMPRESA], que atua no nicho de [NICHO/SETOR].

A proposta deve incluir:
1. **Objetivos do Programa**: 3 a 5 objetivos SMART.
2. **Perfil do Embaixador Ideal (ICP)**: Quem estamos buscando?
3. **Estrutura de Incentivos**: O que oferecemos em troca?
4. **Métricas de Sucesso (KPIs)**: ROI no primeiro trimestre.
5. **Plano de Lançamento (Go-to-Market)**: Cronograma de 4 semanas.

Mantenha um tom profissional, estratégico e orientado a dados.`,
        extraBlocks: [
          {
            id: 'b1',
            title: 'Exemplos de Poucas Amostras (Few-shot Examples)',
            content: 'Exemplo A: Empresa TechCorp acelerou em 35% as indicações qualificadas oferecendo acesso antecipado a novas features para embaixadores chave.'
          },
          {
            id: 'b2',
            title: 'Restrições & Diretrizes de Tom',
            content: 'Não utilize linguagem excessivamente promocional. Mantenha foco em métricas B2B acionáveis e crescimento orgânico.'
          }
        ]
      },
      {
        id: 'p1_v11',
        versionNumber: 'v1.1',
        author: 'Jorge Suss',
        date: '18/07/2026, 10:15',
        comment: 'Melhoria da introdução',
        systemMessage: 'Atue como um Especialista Sênior em Marketing de Comunidade.',
        promptTemplate: `Crie uma proposta de programa de embaixadores para [NOME DA EMPRESA] no setor [NICHO/SETOR].\n\nInclua objetivos, incentivos e métricas de sucesso.`
      },
      {
        id: 'p1_v10',
        versionNumber: 'v1.0',
        author: 'Jorge Suss',
        date: '15/07/2026, 09:00',
        comment: 'Primeira versão',
        systemMessage: 'Atue como consultor de marketing.',
        promptTemplate: `Escreva um plano de embaixadores de marca para empresa SaaS.`
      }
    ]
  },
  {
    id: 'p2',
    title: 'Análise de Sentimento em Tickets',
    shortDescription: 'Analise o JSON de tickets de suporte abaixo e categorize o sentimento do cliente e urgência.',
    modelTag: 'ChatGPT',
    categoryTag: 'Suporte',
    folder: 'ChatGPT',
    tags: ['análise', 'gpt-4', 'cx', 'suporte'],
    isFavorite: false,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'V 1.0',
    updatedAt: 'Há 3 dias',
    systemMessage: 'Você é um classificador de sentimento automatizado especialista em Customer Experience (CX).',
    promptTemplate: `Analise o JSON de tickets de suporte abaixo para a empresa [NOME DA EMPRESA] e categorize o sentimento do cliente em [POSITIVO, NEUTRO, NEGATIVO] e nível de urgência [BAIXA, MÉDIA, ALTA].

Entrada:
[JSON DE TICKETS]

Saída esperada:
Tabela com ID do Ticket, Nome do Cliente, Sentimento, Urgência e Ação Recomendada de Follow-up.`,
    votes: 3,
  },
  {
    id: 'p3',
    title: 'Webhook Data Transformation',
    shortDescription: 'Transforme o payload do webhook do Stripe em um formato legível para notificação no Slack.',
    modelTag: 'N8N Automation',
    categoryTag: 'Automação',
    folder: 'N8N Automation',
    tags: ['stripe', 'slack', 'n8n', 'webhook'],
    isFavorite: false,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'V 2.1',
    updatedAt: 'Há 5 dias',
    systemMessage: 'Atue como um Engenheiro de Integração de Dados especialista em N8N e webhooks.',
    promptTemplate: `Transforme o payload do evento do Stripe [EVENTO_STRIPE] referente à empresa [NOME DA EMPRESA] em uma notificação legível e formatada para o Slack.

Extraia e formate os seguintes dados:
- Valor da Transação
- Nome do Cliente e E-mail
- Status do Pagamento
- Link do Dashboard do Stripe`,
    votes: 2,
  },
  {
    id: 'p4',
    title: 'Gerador de Post Engajador para LinkedIn',
    shortDescription: 'Crie posts de alto impacto para o LinkedIn com ganchos estratégicos e chamadas para ação.',
    modelTag: 'Gemini',
    categoryTag: 'Marketing',
    folder: 'Conteúdo',
    tags: ['linkedin', 'copywriting', 'b2b'],
    isFavorite: true,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'V 1.1',
    updatedAt: 'Há 1 semana',
    systemMessage: 'Atue como um Copywriter Sênior focado em autoridade e presença executiva no LinkedIn.',
    promptTemplate: `Crie um post no LinkedIn de alto engajamento sobre o tema [TEMA DO POST] direcionado ao público de [PÚBLICO ALVO] para a empresa [NOME DA EMPRESA].

Estrutura desejada:
- Hook forte nas primeiras 2 linhas
- Problema comum enfrentado no mercado
- 3 lições acionáveis em tópicos
- Pergunta de encerramento para gerar comentários
- Hashtags estratégicas`,
    votes: 5,
  },
  {
    id: 'p5',
    title: 'Guia de Setup e Onboarding Técnico',
    shortDescription: 'Crie um roteiro claro de boas-vindas e configuração do ambiente local para novos engenheiros.',
    modelTag: 'ChatGPT',
    categoryTag: 'Dev',
    folder: 'Getting Started',
    tags: ['docs', 'onboarding', 'dev'],
    isFavorite: false,
    isArchived: false,
    author: 'Jorge Suss',
    version: 'V 1.0',
    updatedAt: 'Há 2 semanas',
    systemMessage: 'Atue como um Tech Lead experiente em onboarding técnico e arquitetura de software.',
    promptTemplate: `Crie um guia de onboarding técnico para o projeto [NOME DO PROJETO] usando a stack [STACK TECNOLÓGICA].

Instruções:
1. Pré-requisitos de software
2. Instruções de clone e variáveis de ambiente
3. Comandos de instalação, build e testes
4. Fluxo de Git Branch e Code Review`,
    votes: 0,
  }
];
