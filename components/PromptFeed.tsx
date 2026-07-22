'use client';

import React, { useState } from 'react';
import { PromptItem } from '@/types/prompt';
import {
  Star,
  Copy,
  Share2,
  Check,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Play,
  Edit3,
  CopyPlus,
  Trash2,
  User,
  Clock,
  Folder,
  Tag,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { formatFullPromptWithBlocks } from '@/lib/prompt-helpers';

interface PromptFeedProps {
  prompts: PromptItem[];
  selectedPromptId: string | null;
  onSelectPrompt: (prompt: PromptItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCopyPrompt: (text: string, e: React.MouseEvent) => void;
  onSharePrompt: (prompt: PromptItem, e?: React.MouseEvent) => void;
  onEditPrompt: (prompt: PromptItem, e?: React.MouseEvent) => void;
  onDuplicatePrompt: (prompt: PromptItem, e?: React.MouseEvent) => void;
  onDeletePrompt: (id: string, e?: React.MouseEvent) => void;
  title: string;
  copiedId: string | null;

  // Filter & Sort props
  filterModel: string;
  setFilterModel: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  sortBy: 'recente' | 'antigo' | 'nome' | 'utilizados';
  setSortBy: (val: 'recente' | 'antigo' | 'nome' | 'utilizados') => void;
  viewMode: 'cards' | 'lista';
  setViewMode: (val: 'cards' | 'lista') => void;
  foldersList: string[];
}

export default function PromptFeed({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  onToggleFavorite,
  onCopyPrompt,
  onSharePrompt,
  onEditPrompt,
  onDuplicatePrompt,
  onDeletePrompt,
  title,
  copiedId,
  filterModel,
  setFilterModel,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  foldersList,
}: PromptFeedProps) {
  const [showFilters, setShowFilters] = useState(false);

  const getModelBadge = (modelTag: string) => {
    const tag = modelTag?.toLowerCase() || '';
    if (tag.includes('chatgpt') || tag.includes('openai')) {
      return (
        <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          ChatGPT
        </span>
      );
    }
    if (tag.includes('claude') || tag.includes('anthropic')) {
      return (
        <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          Claude
        </span>
      );
    }
    if (tag.includes('openrouter')) {
      return (
        <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          OpenRouter
        </span>
      );
    }
    if (tag.includes('n8n')) {
      return (
        <span className="bg-surface-container-high text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-outline-variant/40">
          N8N
        </span>
      );
    }
    if (tag.includes('appwrite')) {
      return (
        <span className="bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          Appwrite
        </span>
      );
    }
    return (
      <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
        Gemini
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    const st = status || 'Ativo';
    if (st === 'Rascunho') {
      return (
        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
          Rascunho
        </span>
      );
    }
    if (st === 'Em Revisão') {
      return (
        <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
          Em Revisão
        </span>
      );
    }
    return (
      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
        Ativo
      </span>
    );
  };

  return (
    <section className="w-full lg:w-[42%] xl:w-[38%] flex flex-col border-r border-outline-variant bg-background overflow-hidden flex-shrink-0">
      {/* Header section */}
      <div className="pt-4 pb-3 px-5 border-b border-outline-variant/30 bg-background/80 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold font-display text-on-surface">{title}</h2>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {prompts.length} {prompts.length === 1 ? 'prompt encontrado' : 'prompts encontrados'}
            </p>
          </div>

          {/* Controls: View Mode & Filter Toggle */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/50">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'lista'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Visualização em Lista Compacta"
            >
              <List className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-outline-variant/60 mx-0.5" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
                showFilters || filterModel !== 'todos' || filterStatus !== 'todos' || filterCategory !== 'todas'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Filtros e Ordenação"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Filter & Sorting Toolbar */}
        {showFilters && (
          <div className="p-3 bg-surface-container-low/70 rounded-2xl border border-outline-variant/60 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {/* Filter by Model */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Modelo
                </label>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                >
                  <option value="todos">Todos os Modelos</option>
                  <option value="gemini">Gemini</option>
                  <option value="chatgpt">ChatGPT</option>
                  <option value="claude">Claude</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="n8n">N8N</option>
                  <option value="appwrite">Appwrite Backend</option>
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="em revisão">Em Revisão</option>
                  <option value="rascunho">Rascunho</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Filter by Folder/Category */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Categoria / Pasta
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                >
                  <option value="todas">Todas as Pastas</option>
                  {foldersList.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-primary" /> Ordenação
                </label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                >
                  <option value="recente">Mais Recente</option>
                  <option value="antigo">Mais Antigo</option>
                  <option value="nome">Nome (A-Z)</option>
                  <option value="utilizados">Mais Utilizados</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompts list container */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
        {prompts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/50">
            <p className="text-sm text-on-surface-variant font-medium">Nenhum prompt encontrado.</p>
            <p className="text-xs text-outline mt-1">Refine seus filtros ou crie um novo prompt.</p>
          </div>
        ) : viewMode === 'cards' ? (
          /* GRID / CARDS VIEW */
          prompts.map((prompt) => {
            const isSelected = prompt.id === selectedPromptId;
            const fullTextWithBlockTitles = formatFullPromptWithBlocks(
              prompt.promptTemplate,
              prompt.extraBlocks
            );

            return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={`p-4 rounded-2xl transition-all cursor-pointer group relative border ${
                  isSelected
                    ? 'bg-surface-container-lowest border-2 border-primary/40 shadow-md ring-1 ring-primary/10'
                    : 'bg-surface-container-low/80 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-lowest'
                }`}
              >
                {/* Hover Quick Actions (PRD: Executar, Editar, Duplicar, Favoritar, Excluir) */}
                <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-1 border border-outline-variant/60 shadow-md">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPrompt(prompt);
                    }}
                    className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Executar Prompt"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={(e) => onCopyPrompt(fullTextWithBlockTitles, e)}
                    className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Copiar Template Completo"
                  >
                    {copiedId === prompt.id ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPrompt(prompt, e);
                    }}
                    className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Editar Prompt"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onDuplicatePrompt(prompt, e)}
                    className="p-1.5 text-outline hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Duplicar Prompt"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onDeletePrompt(prompt.id, e)}
                    className="p-1.5 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                    title="Excluir Prompt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Model, Category & Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-28">
                  {getModelBadge(prompt.modelTag)}
                  {getStatusBadge(prompt.status)}

                  {prompt.categoryTag && (
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {prompt.categoryTag}
                    </span>
                  )}
                  {prompt.project && (
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-primary" />
                      {prompt.project}
                    </span>
                  )}
                  {prompt.folder && (
                    <span className="text-[10px] font-semibold text-outline flex items-center gap-1">
                      <Folder className="w-3 h-3" /> {prompt.folder}
                    </span>
                  )}
                </div>

                {/* Title & Short Description */}
                <h3 className="text-sm font-bold font-display mb-1 leading-snug text-on-surface group-hover:text-primary transition-colors">
                  {prompt.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                  {prompt.shortDescription || prompt.systemMessage}
                </p>

                {/* Additional Blocks Indicator */}
                {prompt.extraBlocks && prompt.extraBlocks.length > 0 && (
                  <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold text-tertiary-fixed-dim bg-tertiary-fixed/10 px-2 py-1 rounded-lg border border-tertiary-fixed/20 w-fit">
                    <Sparkles className="w-3 h-3 text-tertiary-fixed" />
                    <span>{prompt.extraBlocks.length} Bloco(s) Adicionais Incluídos</span>
                  </div>
                )}

                {/* Card Footer: Metadata (Date, Author, Tags, Favorite) */}
                <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {prompt.updatedAt}
                    </span>
                    {prompt.author && (
                      <span className="text-outline/80 flex items-center gap-1">
                        • <User className="w-3 h-3" /> {prompt.author}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => onToggleFavorite(prompt.id, e)}
                      className="p-1 hover:bg-surface-container-high rounded transition-colors"
                      title={prompt.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          prompt.isFavorite
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-outline hover:text-amber-500'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* COMPACT LIST VIEW */
          <div className="space-y-1.5">
            {prompts.map((prompt) => {
              const isSelected = prompt.id === selectedPromptId;
              const fullTextWithBlockTitles = formatFullPromptWithBlocks(
                prompt.promptTemplate,
                prompt.extraBlocks
              );

              return (
                <div
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt)}
                  className={`p-3 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-surface-container-lowest border-2 border-primary/40 shadow-sm'
                      : 'bg-surface-container-low/60 border-outline-variant/20 hover:border-outline-variant hover:bg-surface-container-lowest'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {getModelBadge(prompt.modelTag)}
                      {getStatusBadge(prompt.status)}
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors break-words mb-1">
                      {prompt.title}
                    </h4>
                    {(prompt.shortDescription || prompt.systemMessage) && (
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-2 break-words">
                        {prompt.shortDescription || prompt.systemMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-outline flex-wrap">
                      <span>{prompt.folder || 'Geral'}</span>
                      <span>•</span>
                      <span>{prompt.updatedAt}</span>
                      <span>•</span>
                      <span>{prompt.author}</span>
                      {prompt.extraBlocks && prompt.extraBlocks.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-tertiary-fixed font-semibold">
                            +{prompt.extraBlocks.length} blocos
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => onToggleFavorite(prompt.id, e)}
                      className="p-1 hover:bg-surface-container-high rounded"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          prompt.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-outline'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => onCopyPrompt(fullTextWithBlockTitles, e)}
                      className="p-1 text-outline hover:text-primary rounded"
                      title="Copiar Template"
                    >
                      {copiedId === prompt.id ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPrompt(prompt, e);
                      }}
                      className="p-1 text-outline hover:text-primary rounded"
                      title="Editar Prompt"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onDuplicatePrompt(prompt, e)}
                      className="p-1 text-outline hover:text-primary rounded"
                      title="Duplicar"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => onDeletePrompt(prompt.id, e)}
                      className="p-1 text-outline hover:text-error rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
