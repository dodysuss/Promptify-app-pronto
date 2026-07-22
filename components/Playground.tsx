'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PromptItem } from '@/types/prompt';
import { extractVariables, replaceVariables } from '@/lib/variables';
import {
  Play,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Clock,
  Zap,
  RotateCcw,
  Edit3,
  Columns,
  History,
  Sliders,
  ChevronDown,
  Cpu,
  Layers,
  ArrowRight,
  Maximize2,
  Search,
  Bookmark,
  CheckCircle2,
  Loader2,
  Save,
} from 'lucide-react';

export interface PlaygroundProps {
  prompts: PromptItem[];
  selectedPrompt?: PromptItem | null;
  onEditPrompt?: (prompt: PromptItem) => void;
  onClose?: () => void;
}

export interface HistoryRecord {
  id: string;
  date: string;
  promptTitle: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  variableValues: Record<string, string>;
  responseText: string;
  responseTimeMs: number;
  tokenCount: number;
  systemMessage?: string;
}

export default function Playground({
  prompts,
  selectedPrompt: initialPrompt,
  onEditPrompt,
  onClose,
}: PlaygroundProps) {
  // Selected Prompt from library or custom
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    initialPrompt?.id || prompts[0]?.id || 'custom'
  );

  const currentPrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId) || null;
  }, [prompts, selectedPromptId]);

  // System & Prompt template inputs
  const [systemMessage, setSystemMessage] = useState(currentPrompt?.systemMessage || '');
  const [promptTemplate, setPromptTemplate] = useState(
    currentPrompt?.promptTemplate || 'Escreva um resumo executivo para o projeto [NOME_DO_PROJETO].'
  );

  // Sync when selected prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setSystemMessage(currentPrompt.systemMessage || '');
      setPromptTemplate(currentPrompt.promptTemplate || '');
    }
  }, [currentPrompt]);

  // Variables handling
  const extractedVars = useMemo(() => {
    return extractVariables(promptTemplate);
  }, [promptTemplate]);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Model & Parameter settings
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'openrouter'>('gemini');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2048);

  // Parallel Model state for Comparison Mode
  const [isParallelMode, setIsParallelMode] = useState<boolean>(false);
  const [providerB, setProviderB] = useState<'gemini' | 'openai' | 'anthropic' | 'openrouter'>('openrouter');
  const [modelB, setModelB] = useState<string>('anthropic/claude-3.5-sonnet');

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [resultA, setResultA] = useState<{
    text: string;
    timeMs: number;
    tokens: number;
    modelName: string;
    dateStr: string;
    error?: string;
  } | null>(null);

  const [resultB, setResultB] = useState<{
    text: string;
    timeMs: number;
    tokens: number;
    modelName: string;
    dateStr: string;
    error?: string;
  } | null>(null);

  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  // History log
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('promptify_playground_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('promptify_playground_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.error('Failed saving playground history:', e);
    }
  }, [history]);

  // OpenRouter models state
  const [openRouterModels, setOpenRouterModels] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([]);
  const [loadingOpenRouter, setLoadingOpenRouter] = useState(false);
  const [openRouterSearchA, setOpenRouterSearchA] = useState('');
  const [openRouterSearchB, setOpenRouterSearchB] = useState('');
  const [customModelA, setCustomModelA] = useState('');
  const [customModelB, setCustomModelB] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Fetch OpenRouter models on mount
  useEffect(() => {
    let isMounted = true;
    const fetchOpenRouterModels = async () => {
      setLoadingOpenRouter(true);
      try {
        const res = await fetch('/api/llm/openrouter-models');
        const data = await res.json();
        if (isMounted && data.models && Array.isArray(data.models) && data.models.length > 0) {
          setOpenRouterModels(data.models);
        }
      } catch (err) {
        console.error('Falha ao carregar lista de modelos do OpenRouter:', err);
      } finally {
        if (isMounted) setLoadingOpenRouter(false);
      }
    };

    fetchOpenRouterModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered OpenRouter models for A & B
  const openRouterOptionsA = useMemo(() => {
    if (openRouterModels.length === 0) {
      return [
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
        { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Raciocínio R1)' },
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 Chat' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (Meta)' },
        { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
        { value: 'openai/gpt-4o', label: 'GPT-4o (OpenAI)' },
        { value: 'openai/o3-mini', label: 'o3-mini (OpenAI)' },
      ];
    }
    const list = openRouterModels.map((m) => ({
      value: m.id,
      label: m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id,
    }));

    if (!openRouterSearchA.trim()) return list;
    const q = openRouterSearchA.toLowerCase();
    return list.filter((item) => item.value.toLowerCase().includes(q) || item.label.toLowerCase().includes(q));
  }, [openRouterModels, openRouterSearchA]);

  const openRouterOptionsB = useMemo(() => {
    if (openRouterModels.length === 0) {
      return [
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
        { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Raciocínio R1)' },
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 Chat' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (Meta)' },
        { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)' },
        { value: 'openai/gpt-4o', label: 'GPT-4o (OpenAI)' },
        { value: 'openai/o3-mini', label: 'o3-mini (OpenAI)' },
      ];
    }
    const list = openRouterModels.map((m) => ({
      value: m.id,
      label: m.name && m.name !== m.id ? `${m.name} (${m.id})` : m.id,
    }));

    if (!openRouterSearchB.trim()) return list;
    const q = openRouterSearchB.toLowerCase();
    return list.filter((item) => item.value.toLowerCase().includes(q) || item.label.toLowerCase().includes(q));
  }, [openRouterModels, openRouterSearchB]);

  // Model options map
  const modelOptions = useMemo(() => {
    return {
      gemini: [
        { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash (Rápido & Inteligente)' },
        { value: 'gemini-1.5-pro', label: 'Google Gemini 1.5 Pro (Raciocínio Complexo)' },
      ],
      openai: [
        { value: 'gpt-4o', label: 'OpenAI GPT-4o (Flagship Multimodal)' },
        { value: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini (Econômico)' },
        { value: 'o3-mini', label: 'OpenAI o3-mini (Raciocínio Lógico)' },
        { value: 'o1', label: 'OpenAI o1 (Raciocínio Avançado)' },
        { value: 'gpt-4-turbo', label: 'OpenAI GPT-4 Turbo' },
      ],
      anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Anthropic Claude 3.5 Sonnet' },
        { value: 'claude-3-5-haiku-20241022', label: 'Anthropic Claude 3.5 Haiku' },
      ],
      openrouter: openRouterOptionsA,
    };
  }, [openRouterOptionsA]);

  // Sync default model when provider changes
  const handleProviderChange = (p: 'gemini' | 'openai' | 'anthropic' | 'openrouter') => {
    setProvider(p);
    setModel(modelOptions[p][0].value);
  };

  const handleProviderBChange = (p: 'gemini' | 'openai' | 'anthropic' | 'openrouter') => {
    setProviderB(p);
    setModelB(modelOptions[p][0].value);
  };

  // Execute LLM Call
  const handleExecute = async () => {
    if (!promptTemplate.trim()) {
      alert('Preencha as instruções do prompt antes de executar.');
      return;
    }

    setIsRunning(true);
    setResultA(null);
    setResultB(null);

    const processedPrompt = replaceVariables(promptTemplate, variableValues);
    const nowStr = new Date().toLocaleString('pt-BR');

    // Get stored API keys
    let storedKeys: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      try {
        const k = localStorage.getItem('promptify_api_keys');
        if (k) storedKeys = JSON.parse(k);
      } catch {}
    }

    const getKey = (p: string) => {
      if (p === 'openrouter') return storedKeys.openRouter || storedKeys.openrouter || '';
      if (p === 'openai') return storedKeys.openAi || storedKeys.openai || '';
      if (p === 'anthropic') return storedKeys.anthropic || '';
      if (p === 'gemini') return storedKeys.gemini || '';
      return '';
    };

    // Task A: Model 1
    const runModelA = async () => {
      const startTime = Date.now();
      const actualModelA = customModelA.trim() || model;
      try {
        const res = await fetch('/api/llm/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptTemplate: processedPrompt,
            systemMessage,
            provider,
            model: actualModelA,
            temperature,
            maxTokens,
            apiKey: getKey(provider),
          }),
        });

        const timeMs = Date.now() - startTime;
        const data = await res.json();

        if (!res.ok) {
          setResultA({
            text: '',
            timeMs,
            tokens: 0,
            modelName: `${provider.toUpperCase()} (${actualModelA})`,
            dateStr: nowStr,
            error: data.error || 'Erro na chamada LLM',
          });
        } else {
          const estimatedTokens = Math.ceil((processedPrompt.length + (data.text?.length || 0)) / 4);
          const resObj = {
            text: data.text,
            timeMs,
            tokens: estimatedTokens,
            modelName: `${provider.toUpperCase()} - ${actualModelA}`,
            dateStr: nowStr,
          };
          setResultA(resObj);

          // Add to History
          const newHist: HistoryRecord = {
            id: 'h_' + Date.now(),
            date: nowStr,
            promptTitle: currentPrompt?.title || 'Prompt Personalizado',
            provider,
            model: actualModelA,
            temperature,
            maxTokens,
            variableValues,
            responseText: data.text,
            responseTimeMs: timeMs,
            tokenCount: estimatedTokens,
            systemMessage,
          };
          setHistory((prev) => [newHist, ...prev]);
        }
      } catch (err: any) {
        setResultA({
          text: '',
          timeMs: Date.now() - startTime,
          tokens: 0,
          modelName: actualModelA,
          dateStr: nowStr,
          error: err?.message || 'Falha de rede ao executar LLM',
        });
      }
    };

    // Task B: Model 2 (If parallel mode)
    const runModelB = async () => {
      if (!isParallelMode) return;
      const startTime = Date.now();
      const actualModelB = customModelB.trim() || modelB;
      try {
        const res = await fetch('/api/llm/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptTemplate: processedPrompt,
            systemMessage,
            provider: providerB,
            model: actualModelB,
            temperature,
            maxTokens,
            apiKey: getKey(providerB),
          }),
        });

        const timeMs = Date.now() - startTime;
        const data = await res.json();

        if (!res.ok) {
          setResultB({
            text: '',
            timeMs,
            tokens: 0,
            modelName: `${providerB.toUpperCase()} (${actualModelB})`,
            dateStr: nowStr,
            error: data.error || 'Erro na chamada LLM (Modelo B)',
          });
        } else {
          const estimatedTokens = Math.ceil((processedPrompt.length + (data.text?.length || 0)) / 4);
          setResultB({
            text: data.text,
            timeMs,
            tokens: estimatedTokens,
            modelName: `${providerB.toUpperCase()} - ${actualModelB}`,
            dateStr: nowStr,
          });

          // Add Model B to History as well
          const newHistB: HistoryRecord = {
            id: 'h_' + Date.now() + '_b',
            date: nowStr,
            promptTitle: (currentPrompt?.title || 'Prompt Personalizado') + ' (Modelo B)',
            provider: providerB,
            model: actualModelB,
            temperature,
            maxTokens,
            variableValues,
            responseText: data.text,
            responseTimeMs: timeMs,
            tokenCount: estimatedTokens,
            systemMessage,
          };
          setHistory((prev) => [newHistB, ...prev]);
        }
      } catch (err: any) {
        setResultB({
          text: '',
          timeMs: Date.now() - startTime,
          tokens: 0,
          modelName: actualModelB,
          dateStr: nowStr,
          error: err?.message || 'Falha de rede ao executar LLM (Modelo B)',
        });
      }
    };

    await Promise.all([runModelA(), runModelB()]);
    setIsRunning(false);
  };

  const handleClear = () => {
    setSystemMessage('');
    setPromptTemplate('');
    setVariableValues({});
    setResultA(null);
    setResultB(null);
  };

  // Manual Save Result to History for comparison
  const saveResultToHistory = (target: 'A' | 'B') => {
    const result = target === 'A' ? resultA : resultB;
    const prov = target === 'A' ? provider : providerB;
    const mod = target === 'A' ? (customModelA.trim() || model) : (customModelB.trim() || modelB);

    if (!result || !result.text) {
      alert('Nenhum resultado gerado para salvar.');
      return;
    }

    const title = currentPrompt?.title
      ? `${currentPrompt.title} (${prov.toUpperCase()} - ${mod})`
      : `Prompt Personalizado (${prov.toUpperCase()} - ${mod})`;

    const newHist: HistoryRecord = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: new Date().toLocaleString('pt-BR'),
      promptTitle: title,
      provider: prov,
      model: mod,
      temperature,
      maxTokens,
      variableValues,
      responseText: result.text,
      responseTimeMs: result.timeMs,
      tokenCount: result.tokens,
      systemMessage,
    };

    setHistory((prev) => [newHist, ...prev]);
    setSaveToast(`✅ Resultado do Modelo ${target} (${mod}) salvo no Histórico com sucesso!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const saveBothToHistory = () => {
    if (!resultA?.text && !resultB?.text) {
      alert('Nenhum resultado gerado para salvar.');
      return;
    }

    const nowStr = new Date().toLocaleString('pt-BR');
    const itemsToAdd: HistoryRecord[] = [];

    if (resultA?.text) {
      const modA = customModelA.trim() || model;
      itemsToAdd.push({
        id: 'h_' + Date.now() + '_A',
        date: nowStr,
        promptTitle: `${currentPrompt?.title || 'Prompt'} [Comparativo Modelo A: ${provider.toUpperCase()}]`,
        provider,
        model: modA,
        temperature,
        maxTokens,
        variableValues,
        responseText: resultA.text,
        responseTimeMs: resultA.timeMs,
        tokenCount: resultA.tokens,
        systemMessage,
      });
    }

    if (resultB?.text) {
      const modB = customModelB.trim() || modelB;
      itemsToAdd.push({
        id: 'h_' + Date.now() + '_B',
        date: nowStr,
        promptTitle: `${currentPrompt?.title || 'Prompt'} [Comparativo Modelo B: ${providerB.toUpperCase()}]`,
        provider: providerB,
        model: modB,
        temperature,
        maxTokens,
        variableValues,
        responseText: resultB.text,
        responseTimeMs: resultB.timeMs,
        tokenCount: resultB.tokens,
        systemMessage,
      });
    }

    setHistory((prev) => [...itemsToAdd, ...prev]);
    setSaveToast(`✅ Resultados de ambos os modelos foram salvos para comparação!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleLoadFromHistory = (rec: HistoryRecord) => {
    if (rec.systemMessage !== undefined) setSystemMessage(rec.systemMessage);
    if (rec.responseText) setPromptTemplate(rec.responseText);
    if (['gemini', 'openai', 'anthropic', 'openrouter'].includes(rec.provider)) {
      setProvider(rec.provider as any);
      setModel(rec.model);
    }
    setTemperature(rec.temperature || 0.7);
    setMaxTokens(rec.maxTokens || 2048);
    if (rec.variableValues) {
      setVariableValues(rec.variableValues);
    }
    setActiveTab('editor');
    setSaveToast(`🔄 Registro de "${rec.promptTitle}" recarregado no editor!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleCopy = (text: string, isA: boolean) => {
    navigator.clipboard.writeText(text);
    if (isA) {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-background text-on-background overflow-hidden">
      {/* Toast Notification Banner */}
      {saveToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="hover:opacity-80 text-white font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold flex items-center justify-center">
            <Play className="w-5 h-5 fill-primary text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-on-surface flex items-center gap-2">
              Playground de Execução LLM
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono uppercase">
                v1.0 PRD
              </span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Teste, ajuste parâmetros e compare respostas entre modelos sem sair do editor.
            </p>
          </div>
        </div>

        {/* Header Tabs & Parallel Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsParallelMode(!isParallelMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isParallelMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
            }`}
          >
            <Columns className="w-4 h-4" />
            {isParallelMode ? 'Comparação Ativa' : 'Comparar Modelos'}
          </button>

          <div className="bg-surface-container-low p-1 rounded-xl flex border border-outline-variant">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Teste
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Histórico ({history.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT SIDEBAR: Controls, Prompt Select, Parameters, Variables (5 Cols) */}
          <div className="lg:col-span-5 border-r border-outline-variant bg-surface-bright p-5 overflow-y-auto space-y-5 custom-scrollbar">
            {/* Prompt Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface flex items-center justify-between">
                <span>Prompt da Biblioteca</span>
                {currentPrompt && onEditPrompt && (
                  <button
                    onClick={() => onEditPrompt(currentPrompt)}
                    className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Editar no Modal
                  </button>
                )}
              </label>
              <select
                value={selectedPromptId}
                onChange={(e) => setSelectedPromptId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-xs text-on-surface font-semibold outline-none focus:border-primary"
              >
                <option value="custom">✏️ Prompt Personalizado (Modo Livre)</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.modelTag}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Model A Configuration */}
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <Cpu className="w-4 h-4" /> Configuração do Modelo {isParallelMode ? 'A' : ''}
                </span>
                <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded font-mono text-outline font-bold">
                  {provider.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1">Provedor</label>
                  <select
                    value={provider}
                    onChange={(e) => handleProviderChange(e.target.value as any)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary font-medium"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="openrouter font-bold">OpenRouter (Todos os Modelos)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1">Modelo</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary font-medium truncate"
                  >
                    {provider === 'openrouter'
                      ? openRouterOptionsA.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))
                      : modelOptions[provider].map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {provider === 'openrouter' && (
                <div className="pt-2 border-t border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <Search className="w-3 h-3 text-primary" /> Filtrar OpenRouter ({openRouterModels.length > 0 ? `${openRouterModels.length} modelos` : 'Carregando...'})
                    </span>
                    {loadingOpenRouter && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  </div>
                  <input
                    type="text"
                    value={openRouterSearchA}
                    onChange={(e) => setOpenRouterSearchA(e.target.value)}
                    placeholder="Buscar modelo (ex: deepseek, claude, llama, gpt-4...)"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
                  />
                  <div>
                    <label className="block text-[10px] text-outline font-semibold mb-0.5">Ou digite o ID exato do modelo:</label>
                    <input
                      type="text"
                      value={customModelA}
                      onChange={(e) => setCustomModelA(e.target.value)}
                      placeholder="Ex: meta-llama/llama-3.1-405b-instruct"
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-2.5 py-1 text-[11px] font-mono text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Model B Configuration (Only if Parallel Comparison Mode active) */}
            {isParallelMode && (
              <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <span className="text-xs font-bold text-purple-600 flex items-center gap-1.5 uppercase tracking-wider">
                    <Columns className="w-4 h-4 text-purple-600" /> Configuração do Modelo B (Comparação)
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">
                    {providerB.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Provedor B</label>
                    <select
                      value={providerB}
                      onChange={(e) => handleProviderBChange(e.target.value as any)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-purple-600 font-medium"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="openrouter">OpenRouter (Todos os Modelos)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Modelo B</label>
                    <select
                      value={modelB}
                      onChange={(e) => setModelB(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-purple-600 font-medium truncate"
                    >
                      {providerB === 'openrouter'
                        ? openRouterOptionsB.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))
                        : modelOptions[providerB].map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {providerB === 'openrouter' && (
                  <div className="pt-2 border-t border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                        <Search className="w-3 h-3 text-purple-600" /> Filtrar OpenRouter B ({openRouterModels.length > 0 ? `${openRouterModels.length} modelos` : 'Carregando...'})
                      </span>
                      {loadingOpenRouter && <Loader2 className="w-3 h-3 animate-spin text-purple-600" />}
                    </div>
                    <input
                      type="text"
                      value={openRouterSearchB}
                      onChange={(e) => setOpenRouterSearchB(e.target.value)}
                      placeholder="Buscar modelo B (ex: deepseek, claude, llama, gpt-4...)"
                      className="w-full bg-surface-container-lowest border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-on-surface outline-none focus:border-purple-600"
                    />
                    <div>
                      <label className="block text-[10px] text-purple-700/80 font-semibold mb-0.5">Ou digite o ID exato do modelo B:</label>
                      <input
                        type="text"
                        value={customModelB}
                        onChange={(e) => setCustomModelB(e.target.value)}
                        placeholder="Ex: deepseek/deepseek-r1"
                        className="w-full bg-surface-container-lowest border border-purple-500/30 rounded-xl px-2.5 py-1 text-[11px] font-mono text-on-surface outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Parameters Sliders (Temperatura & Max Tokens) */}
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-4">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-primary" /> Parâmetros de Geração
              </span>

              {/* Temperatura */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-semibold text-on-surface">Temperatura</label>
                  <span className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-[11px] font-bold text-primary">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-outline font-medium mt-0.5">
                  <span>0.0 (Preciso / Fatos)</span>
                  <span>1.0 (Criativo)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-semibold text-on-surface">Max Tokens</label>
                  <span className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-[11px] font-bold text-primary">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={4096}
                  step={128}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-outline font-medium mt-0.5">
                  <span>256</span>
                  <span>4096</span>
                </div>
              </div>
            </div>

            {/* Dynamic Variables Input Block */}
            {extractedVars.length > 0 && (
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-3">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Variáveis do Prompt ({extractedVars.length})
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  Preencha os valores para substituição automática antes de executar:
                </p>

                <div className="space-y-2.5">
                  {extractedVars.map((v) => (
                    <div key={v.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] font-bold font-mono text-amber-800 dark:text-amber-200">
                          {v.name}
                        </label>
                        {v.example && (
                          <span className="text-[10px] text-outline italic">
                            Ex: {v.example}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={variableValues[v.name] || ''}
                        onChange={(e) =>
                          setVariableValues((prev) => ({ ...prev, [v.name]: e.target.value }))
                        }
                        placeholder={v.example ? `Ex: ${v.example}` : `Digite o valor para ${v.name}`}
                        className="w-full bg-surface-container-lowest border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Message Prompt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Mensagem de Sistema (Instrução de Contexto)
              </label>
              <textarea
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="Ex: Atue como um especialista em estratégia de conteúdo..."
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs font-mono text-on-surface outline-none focus:border-primary resize-y"
              />
            </div>

            {/* Prompt Template Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface">
                Instruções do Prompt <span className="text-error">*</span>
              </label>
              <textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="Insira o texto do prompt... Use colchetes para variáveis como [NOME]"
                rows={5}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs font-mono text-on-surface outline-none focus:border-primary resize-y"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExecute}
                disabled={isRunning}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" /> Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Executar Prompt
                  </>
                )}
              </button>

              {resultA && (
                <button
                  onClick={handleExecute}
                  disabled={isRunning}
                  className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface p-3 rounded-xl transition-all border border-outline-variant"
                  title="Executar Novamente"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleClear}
                className="bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-error p-3 rounded-xl transition-all border border-outline-variant"
                title="Limpar Conversa & Entradas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Output Results Area (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 flex flex-col overflow-y-auto custom-scrollbar">
            {!resultA && !isRunning ? (
              <div className="m-auto text-center space-y-4 max-w-md p-6 border border-dashed border-outline-variant rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface font-display">
                    Área de Resposta do Playground
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Selecione ou edite um prompt à esquerda, preencha as variáveis e clique em <strong>Executar Prompt</strong> para visualizar o retorno da IA em tempo real.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Parallel Mode Top Action Banner */}
                {isParallelMode && (resultA || resultB) && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-2">
                      <Columns className="w-4 h-4 text-primary" /> Comparativo de Modelos A & B
                    </span>
                    <button
                      onClick={saveBothToHistory}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-95 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Salvar Ambos para Comparação Futura
                    </button>
                  </div>
                )}

                {/* Single View or Side-by-Side Parallel Comparison View */}
                <div className={`grid gap-5 flex-1 ${isParallelMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* RESULT CARD A */}
                  <div className="flex flex-col bg-surface-bright border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    {/* Header bar for Result A */}
                    <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs text-on-surface font-mono">
                          {resultA?.modelName || `${provider.toUpperCase()} - ${model}`}
                        </span>
                      </div>
                      {resultA && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveResultToHistory('A')}
                            className="px-2.5 py-1 text-xs font-bold bg-primary text-on-primary hover:opacity-90 rounded-lg flex items-center gap-1 transition-all shadow-xs"
                            title="Salvar resultado no histórico"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> Salvar no Histórico
                          </button>
                          <button
                            onClick={() => handleCopy(resultA.text, true)}
                            className="px-2.5 py-1 text-xs font-semibold bg-surface-container-high text-on-surface hover:bg-surface-container-highest rounded-lg flex items-center gap-1 transition-all"
                          >
                            {copiedA ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-outline" /> Copiar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Output Text Body */}
                    <div className="p-4 flex-1 font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
                      {isRunning && !resultA ? (
                        <div className="flex items-center gap-2 text-primary font-semibold py-8 justify-center">
                          <Zap className="w-5 h-5 animate-spin" /> Gerando resposta com {model}...
                        </div>
                      ) : resultA?.error ? (
                        <div className="p-3 bg-error-container/30 border border-error/30 text-error rounded-xl">
                          <p className="font-bold mb-1">Erro de Execução:</p>
                          <p>{resultA.error}</p>
                        </div>
                      ) : (
                        resultA?.text
                      )}
                    </div>

                    {/* Footer Metrics for Result A */}
                    {resultA && !resultA.error && (
                      <div className="bg-surface-container-low border-t border-outline-variant/60 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-on-surface-variant">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Clock className="w-3.5 h-3.5" /> {(resultA.timeMs / 1000).toFixed(2)}s
                        </span>
                        <span>{resultA.tokens} tokens</span>
                        <span className="opacity-70">{resultA.dateStr}</span>
                      </div>
                    )}
                  </div>

                  {/* RESULT CARD B (Only in Parallel Comparison Mode) */}
                  {isParallelMode && (
                    <div className="flex flex-col bg-purple-500/5 border border-purple-500/20 rounded-2xl overflow-hidden shadow-sm">
                      {/* Header bar for Result B */}
                      <div className="bg-purple-100/50 dark:bg-purple-950/30 px-4 py-3 border-b border-purple-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                          <span className="font-bold text-xs text-purple-900 dark:text-purple-200 font-mono">
                            {resultB?.modelName || `${providerB.toUpperCase()} - ${modelB}`}
                          </span>
                        </div>
                        {resultB && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveResultToHistory('B')}
                              className="px-2.5 py-1 text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center gap-1 transition-all shadow-xs"
                              title="Salvar resultado no histórico"
                            >
                              <Bookmark className="w-3.5 h-3.5" /> Salvar no Histórico
                            </button>
                            <button
                              onClick={() => handleCopy(resultB.text, false)}
                              className="px-2.5 py-1 text-xs font-semibold bg-purple-200/60 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 hover:bg-purple-300 rounded-lg flex items-center gap-1 transition-all"
                            >
                              {copiedB ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-purple-700" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copiar
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Output Text Body B */}
                      <div className="p-4 flex-1 font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
                        {isRunning && !resultB ? (
                          <div className="flex items-center gap-2 text-purple-600 font-semibold py-8 justify-center">
                            <Zap className="w-5 h-5 animate-spin" /> Gerando resposta B ({modelB})...
                          </div>
                        ) : resultB?.error ? (
                          <div className="p-3 bg-error-container/30 border border-error/30 text-error rounded-xl">
                            <p className="font-bold mb-1">Erro Modelo B:</p>
                            <p>{resultB.error}</p>
                          </div>
                        ) : (
                          resultB?.text
                        )}
                      </div>

                      {/* Footer Metrics for Result B */}
                      {resultB && !resultB.error && (
                        <div className="bg-purple-100/30 dark:bg-purple-950/20 border-t border-purple-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-purple-900 dark:text-purple-200">
                          <span className="flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300">
                            <Clock className="w-3.5 h-3.5" /> {(resultB.timeMs / 1000).toFixed(2)}s
                          </span>
                          <span>{resultB.tokens} tokens</span>
                          <span className="opacity-70">{resultB.dateStr}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="flex-1 p-6 overflow-y-auto bg-surface-bright space-y-4 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Histórico de Execuções & Comparação
            </h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Deseja limpar todo o histórico de execuções do Playground?')) {
                    setHistory([]);
                  }
                }}
                className="text-xs text-error hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant border border-dashed border-outline-variant rounded-2xl">
              Nenhuma execução registrada no histórico ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-xs text-on-surface">{rec.promptTitle}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold uppercase">
                        {rec.provider} - {rec.model}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-outline font-mono">
                      <span>Temp: {rec.temperature}</span>
                      <span>{(rec.responseTimeMs / 1000).toFixed(2)}s</span>
                      <span>{rec.tokenCount} tokens</span>
                      <span>{rec.date}</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-on-surface line-clamp-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 whitespace-pre-wrap leading-relaxed">
                    {rec.responseText}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleLoadFromHistory(rec)}
                      className="px-3 py-1.5 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Carregar no Editor para Comparar
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(rec.responseText);
                          setSaveToast('Texto copiado para a área de transferência!');
                          setTimeout(() => setSaveToast(null), 2500);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-on-surface bg-surface-container-low hover:bg-surface-container-high rounded-lg flex items-center gap-1 border border-outline-variant/40"
                        title="Copiar texto"
                      >
                        <Copy className="w-3.5 h-3.5 text-outline" /> Copiar
                      </button>
                      <button
                        onClick={() => {
                          setHistory((prev) => prev.filter((item) => item.id !== rec.id));
                        }}
                        className="p-1.5 text-error hover:bg-error-container/30 rounded-lg transition-all"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
