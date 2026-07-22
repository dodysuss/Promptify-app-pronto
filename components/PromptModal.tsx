'use client';

import React, { useState, useEffect } from 'react';
import { PromptItem, PromptBlock, PromptVersion } from '@/types/prompt';
import {
  X,
  PlusCircle,
  Bold,
  Italic,
  List,
  Code,
  Braces,
  Sparkles,
  Save,
  Minus,
  Plus,
  Clock,
  FileCode,
  Folder,
  Edit3,
  Trash2
} from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: Partial<PromptItem>) => void;
  initialData?: PromptItem | null;
  folders: string[];
  categories?: string[];
  projects?: string[];
}

export default function PromptModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  folders,
  categories = ['Marketing', 'Engenharia', 'Vendas', 'Suporte', 'Produtividade', 'Design', 'Automação'],
  projects = ['Projeto Alpha', 'Lançamento Q3', 'Automação CRM', 'Appwrite Backend'],
}: PromptModalProps) {
  const [title, setTitle] = useState(() => initialData?.title || '');
  const [shortDescription, setShortDescription] = useState(() => initialData?.shortDescription || '');
  const [folder, setFolder] = useState(() => initialData?.folder || folders[0] || 'Conteúdo');
  const [categoryTag, setCategoryTag] = useState(() => initialData?.categoryTag || categories[0] || 'Geral');
  const [project, setProject] = useState(() => initialData?.project || '');
  const [modelTag, setModelTag] = useState(() => initialData?.modelTag || 'Gemini');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(() =>
    initialData?.tags ? [...initialData.tags] : initialData ? [] : ['análise', 'gpt-4']
  );
  const [systemMessage, setSystemMessage] = useState(() => initialData?.systemMessage || '');
  const [promptTemplate, setPromptTemplate] = useState(() => initialData?.promptTemplate || '');
  const [versionComment, setVersionComment] = useState(() =>
    initialData ? 'Melhoria das instruções e parâmetros' : 'Primeira versão do prompt'
  );
  const [fontSize, setFontSize] = useState(16);

  // Additional custom blocks with editable titles
  const [extraBlocks, setExtraBlocks] = useState<PromptBlock[]>(() => {
    if (initialData?.extraBlocks && initialData.extraBlocks.length > 0) {
      return initialData.extraBlocks.map((b) => ({ ...b }));
    }
    return [];
  });

  // Sync form state when modal opens or initialData changes
  const modalResetKey = `${isOpen ? 'open' : 'closed'}:${initialData?.id ?? 'new'}`;
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(initialData?.title || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShortDescription(initialData?.shortDescription || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFolder(initialData?.folder || folders[0] || 'Conteúdo');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryTag(initialData?.categoryTag || categories[0] || 'Geral');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProject(initialData?.project || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModelTag(initialData?.modelTag || 'Gemini');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTagInput('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTags(initialData?.tags ? [...initialData.tags] : initialData ? [] : ['análise', 'gpt-4']);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystemMessage(initialData?.systemMessage || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPromptTemplate(initialData?.promptTemplate || '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVersionComment(initialData ? 'Melhoria das instruções e parâmetros' : 'Primeira versão do prompt');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtraBlocks(
      initialData?.extraBlocks && initialData.extraBlocks.length > 0
        ? initialData.extraBlocks.map((b) => ({ ...b }))
        : []
    );
  }, [modalResetKey, folders, categories, projects]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^,|,$/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertVariableIntoTemplate = (varName: string) => {
    setPromptTemplate((prev) => prev + ` [${varName}] `);
  };

  const handleAddBlock = () => {
    const newBlock: PromptBlock = {
      id: 'b_' + Date.now(),
      title: `Bloco Adicional ${extraBlocks.length + 1}`,
      content: '',
    };
    setExtraBlocks((prev) => [...prev, newBlock]);
  };

  const handleUpdateBlockTitle = (id: string, newTitle: string) => {
    setExtraBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: newTitle } : b))
    );
  };

  const handleUpdateBlockContent = (id: string, newContent: string) => {
    setExtraBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const handleRemoveBlock = (id: string) => {
    setExtraBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptTemplate.trim()) {
      alert('Por favor, preencha o Nome e as Instruções do Prompt.');
      return;
    }

    const cleanBlocks = extraBlocks.filter((b) => b.title.trim() || b.content.trim());
    const authorName = initialData?.author || 'Jorge Suss';
    const nowFormatted =
      new Date().toLocaleDateString('pt-BR') +
      ', ' +
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const existingHistory = initialData?.history || [];
    const nextVerIndex = existingHistory.length > 0 ? existingHistory.length : initialData ? 1 : 0;
    const nextVerTag = `v1.${nextVerIndex}`;

    const newVersionObj: PromptVersion = {
      id: 'ver_' + Date.now(),
      versionNumber: nextVerTag,
      author: authorName,
      date: nowFormatted,
      comment: versionComment.trim() || (initialData ? 'Atualização do prompt' : 'Primeira versão'),
      systemMessage: systemMessage.trim(),
      promptTemplate: promptTemplate.trim(),
      extraBlocks: cleanBlocks,
    };

    let updatedHistory = [newVersionObj, ...existingHistory];

    if (existingHistory.length === 0 && initialData) {
      const v0Obj: PromptVersion = {
        id: 'ver_init_' + Date.now(),
        versionNumber: 'v1.0',
        author: initialData.author || 'Jorge Suss',
        date: initialData.updatedAt || 'Anterior',
        comment: 'Primeira versão do prompt',
        systemMessage: initialData.systemMessage,
        promptTemplate: initialData.promptTemplate,
        extraBlocks: initialData.extraBlocks,
      };
      updatedHistory = [newVersionObj, v0Obj];
    }

    onSave({
      id: initialData?.id,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      folder: folder || 'Conteúdo',
      categoryTag,
      project,
      modelTag,
      tags,
      systemMessage: systemMessage.trim(),
      promptTemplate: promptTemplate.trim(),
      extraBlocks: cleanBlocks,
      author: authorName,
      version: nextVerTag,
      history: updatedHistory,
      updatedAt: 'Agora mesmo',
      isFavorite: initialData?.isFavorite || false,
      isArchived: initialData?.isArchived || false,
    });

    onClose();
  };

  // Helper counters
  const sysChars = systemMessage.length;
  const sysWords = systemMessage.trim() ? systemMessage.trim().split(/\s+/).length : 0;
  const sysTokens = Math.ceil(sysChars / 4);

  const tplChars = promptTemplate.length;
  const tplWords = promptTemplate.trim() ? promptTemplate.trim().split(/\s+/).length : 0;
  const tplTokens = Math.ceil(tplChars / 4);

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/20 backdrop-blur-[3px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl border border-outline-variant shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
              <PlusCircle className="w-6 h-6 fill-primary-container text-on-primary-container" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-on-surface">
                {initialData ? 'Editar Prompt' : 'Novo Prompt'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Adicione ou atualize o prompt no seu espaço de trabalho.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-low"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form id="prompt-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 bg-surface-bright custom-scrollbar">
          {/* Nome do Prompt */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="promptName">
              Nome do Prompt <span className="text-error">*</span>
            </label>
            <input
              id="promptName"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Analista de Dados Sênior"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          {/* Descrição Curta */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="shortDesc">
              Descrição Curta
            </label>
            <input
              id="shortDesc"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Resumo em uma frase do que este prompt faz."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pasta */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="folderSelect">
                Pasta
              </label>
              <select
                id="folderSelect"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="categorySelect">
                Categoria
              </label>
              <select
                id="categorySelect"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Projeto */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="projectSelect">
                Projeto
              </label>
              <select
                id="projectSelect"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="">Nenhum Projeto</option>
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Tag */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="modelSelect">
                Modelo
              </label>
              <select
                id="modelSelect"
                value={modelTag}
                onChange={(e) => setModelTag(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="Gemini">Gemini</option>
                <option value="ChatGPT">ChatGPT (OpenAI)</option>
                <option value="Claude">Claude (Anthropic)</option>
                <option value="OpenRouter">OpenRouter (Multi-LLM)</option>
                <option value="N8N Automation">N8N Automation</option>
                <option value="Appwrite Backend">Appwrite Backend (DB + Auth)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="tagsInput">
              Tags
            </label>
            <input
              id="tagsInput"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Adicionar tags separadas por vírgula (Pressione Enter)"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-secondary-container/40 text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-70 text-on-secondary-container"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* System Message Editor Block */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-on-surface">
                Mensagem de Sistema (Contexto)
              </label>
              <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1 opacity-70">
                Suporta Markdown
              </span>
            </div>

            <div className="flex flex-col border border-outline-variant rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
              {/* Toolbar */}
              <div className="bg-surface-container-low border-b border-outline-variant px-3 py-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSystemMessage((s) => s + ' **texto em negrito**')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Negrito"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSystemMessage((s) => s + ' *italico*')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Itálico"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-outline-variant" />
                <button
                  type="button"
                  onClick={() => setSystemMessage((s) => s + '\n- Item de lista')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSystemMessage((s) => s + ' `codigo`')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Código"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder={`Atue como um especialista em...\nSua tarefa é...\nUse o seguinte formato:\n[Formato Aqui]`}
                rows={3}
                style={{ fontSize: `${fontSize}px` }}
                className="w-full bg-surface-container-lowest p-4 font-mono text-on-surface placeholder:text-on-surface-variant/40 outline-none border-none resize-y min-h-[90px]"
              />

              {/* Status Bar */}
              <div className="bg-surface-container-low border-t border-outline-variant px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-on-surface-variant font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Sparkles className="w-3.5 h-3.5" /> Contexto
                  </span>
                </div>
                <div className="flex items-center gap-3 opacity-80 text-[11px]">
                  <span>{sysChars} caracteres</span>
                  <span>{sysWords} palavras</span>
                  <span>{sysTokens} tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Prompt Instructions Editor Block */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-on-surface">
                Instruções do Prompt <span className="text-error">*</span>
              </label>
              <span className="text-[10px] font-semibold text-on-surface-variant flex items-center gap-1 opacity-70">
                Suporta Markdown
              </span>
            </div>

            <div className="flex flex-col border border-outline-variant rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
              {/* Toolbar */}
              <div className="bg-surface-container-low border-b border-outline-variant px-3 py-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPromptTemplate((s) => s + ' **texto em negrito**')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Negrito"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPromptTemplate((s) => s + ' *italico*')}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high"
                  title="Itálico"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-outline-variant" />
                <button
                  type="button"
                  onClick={() => insertVariableIntoTemplate('NOME DA EMPRESA')}
                  className="px-2 py-0.5 text-xs bg-surface-container-high rounded text-primary font-semibold hover:bg-primary-fixed"
                  title="Inserir Variável Empresa"
                >
                  +[NOME DA EMPRESA]
                </button>
                <button
                  type="button"
                  onClick={() => insertVariableIntoTemplate('NICHO/SETOR')}
                  className="px-2 py-0.5 text-xs bg-surface-container-high rounded text-primary font-semibold hover:bg-primary-fixed"
                  title="Inserir Variável Nicho"
                >
                  +[NICHO/SETOR]
                </button>
              </div>

              <textarea
                required
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="Descreva detalhadamente as instruções para o modelo de IA... Use colchetes para variáveis como [NOME DA EMPRESA]"
                rows={8}
                style={{ fontSize: `${fontSize}px` }}
                className="w-full bg-surface-container-lowest p-4 font-mono text-on-surface placeholder:text-on-surface-variant/40 outline-none border-none resize-y min-h-[180px]"
              />

              {/* Status Bar */}
              <div className="bg-surface-container-low border-t border-outline-variant px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-on-surface-variant font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                      className="p-1 hover:text-on-surface"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono">{fontSize}px</span>
                    <button
                      type="button"
                      onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                      className="p-1 hover:text-on-surface"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-80 text-[11px]">
                  <span>{tplChars} caracteres</span>
                  <span>{tplWords} palavras</span>
                  <span>{tplTokens} tokens</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Agora
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Custom Blocks with Editable Titles */}
          {extraBlocks.map((block, idx) => (
            <div key={block.id || idx} className="p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                    Bloco #{idx + 1}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => handleUpdateBlockTitle(block.id, e.target.value)}
                      placeholder="Nome do Bloco (Ex: Exemplos Few-shot, Restrições)"
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1 text-xs font-bold text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBlock(block.id)}
                  className="text-error hover:bg-error-container/50 p-1.5 rounded-lg transition-colors"
                  title="Remover este bloco"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={block.content}
                onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                rows={3}
                className="w-full bg-surface-container-lowest p-3 font-mono text-xs border border-outline-variant/50 rounded-xl outline-none text-on-surface placeholder:text-outline"
                placeholder="Instruções ou conteúdo do bloco..."
              />
            </div>
          ))}

          {/* Add Block Button */}
          <div className="flex justify-center my-1">
            <button
              type="button"
              onClick={handleAddBlock}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Adicionar Bloco Adicional
            </button>
          </div>

          {/* Comentário da Versão (PRD #19 Versioning) */}
          <div className="bg-surface-container-low/70 p-4 rounded-2xl border border-outline-variant/60 space-y-1.5 mt-2">
            <label className="block text-xs font-bold text-on-surface" htmlFor="versionComment">
              Comentário / Nota de Versão (Histórico)
            </label>
            <input
              id="versionComment"
              type="text"
              value={versionComment}
              onChange={(e) => setVersionComment(e.target.value)}
              placeholder={initialData ? 'Ex: Melhoria na introdução e adição de poucos exemplos' : 'Ex: Primeira versão do prompt'}
              className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2 text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary"
            />
            <p className="text-[10px] text-outline">
              Sua nota será gravada no histórico permanente de versões deste prompt.
            </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
          <button
            form="prompt-form"
            type="submit"
            className="px-6 py-2.5 rounded-2xl text-xs font-semibold bg-primary text-on-primary hover:bg-on-primary-fixed-variant transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
