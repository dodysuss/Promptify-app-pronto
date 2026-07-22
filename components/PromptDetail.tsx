'use client';

import React, { useState, useMemo } from 'react';
import { PromptItem, PromptVersion } from '@/types/prompt';
import { extractVariables, replaceVariables } from '@/lib/variables';
import { formatFullPromptWithBlocks } from '@/lib/prompt-helpers';
import {
  History,
  Edit,
  Trash2,
  Star,
  Copy,
  Folder,
  Check,
  Sparkles,
  Play,
  Share2,
  Table as TableIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  RefreshCw,
  CopyPlus,
  RotateCcw,
  Eye,
  Columns,
  GitCompare,
  Clock,
  User,
  Briefcase,
  ArrowLeft,
  FileDown,
  Loader2
} from 'lucide-react';

interface PromptDetailProps {
  prompt: PromptItem | null;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCopyText: (text: string) => void;
  onSharePrompt: (prompt: PromptItem) => void;
  onDuplicate?: (prompt: PromptItem) => void;
  onSavePrompt?: (data: Partial<PromptItem>) => void;
}

export default function PromptDetail({
  prompt,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyText,
  onSharePrompt,
  onDuplicate,
  onSavePrompt,
}: PromptDetailProps) {
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedTestOutput, setCopiedTestOutput] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'thread' | 'history'>('details');
  const [comparingVersion, setComparingVersion] = useState<PromptVersion | null>(null);

  // AI Execution state
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // PDF Export state
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!prompt) return;
    setIsExportingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkNewPage = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Header Banner Background
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENTAÇÃO DE PROMPT AI', margin, 14);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.text(`Exportado em: ${dateStr}`, pageWidth - margin, 14, { align: 'right' });

      y = 32;

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(prompt.title, contentWidth);
      checkNewPage(titleLines.length * 7);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 7 + 3;

      // Metadata Bar
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const metaText = `Pasta: ${prompt.folder || 'Conteúdo'}  |  Modelo: ${prompt.modelTag || 'Gemini'}  |  Versão: ${prompt.version || 'v1.0'}  |  Autor: ${prompt.author || 'Anônimo'}`;
      const metaLines = doc.splitTextToSize(metaText, contentWidth);
      checkNewPage(metaLines.length * 5);
      doc.text(metaLines, margin, y);
      y += metaLines.length * 5 + 4;

      // Description if present
      if (prompt.shortDescription) {
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(51, 65, 85);
        const descLines = doc.splitTextToSize(prompt.shortDescription, contentWidth);
        checkNewPage(descLines.length * 5);
        doc.text(descLines, margin, y);
        y += descLines.length * 5 + 4;
      }

      // Tags if present
      if (prompt.tags && prompt.tags.length > 0) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        const tagsText = `TAGS: ${prompt.tags.map((t) => `#${t}`).join(' ')}`;
        const tagLines = doc.splitTextToSize(tagsText, contentWidth);
        checkNewPage(tagLines.length * 4.5);
        doc.text(tagLines, margin, y);
        y += tagLines.length * 4.5 + 4;
      }

      // Divider
      checkNewPage(4);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // System Message Section
      if (prompt.systemMessage && prompt.systemMessage.trim()) {
        checkNewPage(12);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('MENSAGEM DE SISTEMA (SYSTEM MESSAGE)', margin, y);
        y += 6;

        const sysText = replaceVariables(prompt.systemMessage, variableValues);
        const sysLines = doc.splitTextToSize(sysText, contentWidth - 8);
        const sysBoxHeight = sysLines.length * 4.2 + 6;

        if (sysBoxHeight > pageHeight - margin * 2 - 20) {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'normal');
          doc.setTextColor(30, 41, 59);
          for (let i = 0; i < sysLines.length; i++) {
            checkNewPage(4.5);
            doc.text(sysLines[i], margin + 2, y);
            y += 4.2;
          }
          y += 6;
        } else {
          checkNewPage(sysBoxHeight + 4);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, y, contentWidth, sysBoxHeight, 2, 2, 'FD');

          doc.setFontSize(8.5);
          doc.setFont('courier', 'normal');
          doc.setTextColor(30, 41, 59);
          doc.text(sysLines, margin + 4, y + 5);
          y += sysBoxHeight + 8;
        }
      }

      // Main Prompt Template Section
      checkNewPage(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const totalBlocks = 1 + (prompt.extraBlocks ? prompt.extraBlocks.length : 0);
      doc.text(`TEMPLATE DO PROMPT (${totalBlocks} BLOCO${totalBlocks > 1 ? 'S' : ''})`, margin, y);
      y += 6;

      // Main instructions block
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('► INSTRUÇÕES PRINCIPAIS', margin, y);
      y += 5;

      const mainText = replaceVariables(prompt.promptTemplate, variableValues);
      const mainLines = doc.splitTextToSize(mainText, contentWidth - 8);
      const mainBoxHeight = mainLines.length * 4.2 + 6;

      if (mainBoxHeight > pageHeight - margin * 2 - 20) {
        doc.setFontSize(8.5);
        doc.setFont('courier', 'normal');
        doc.setTextColor(30, 41, 59);
        for (let i = 0; i < mainLines.length; i++) {
          checkNewPage(4.5);
          doc.text(mainLines[i], margin + 2, y);
          y += 4.2;
        }
        y += 6;
      } else {
        checkNewPage(mainBoxHeight + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, y, contentWidth, mainBoxHeight, 2, 2, 'FD');

        doc.setFontSize(8.5);
        doc.setFont('courier', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(mainLines, margin + 4, y + 5);
        y += mainBoxHeight + 8;
      }

      // Extra Blocks
      if (prompt.extraBlocks && prompt.extraBlocks.length > 0) {
        prompt.extraBlocks.forEach((block, idx) => {
          const blockTitle = block.title?.trim() || `Bloco Adicional ${idx + 1}`;
          const blockContent = replaceVariables(block.content || '', variableValues);

          checkNewPage(10);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(37, 99, 235);
          doc.text(`### [${blockTitle.toUpperCase()}]`, margin, y);
          y += 5;

          const blockLines = doc.splitTextToSize(blockContent, contentWidth - 8);
          const blockBoxHeight = blockLines.length * 4.2 + 6;

          if (blockBoxHeight > pageHeight - margin * 2 - 20) {
            doc.setFontSize(8.5);
            doc.setFont('courier', 'normal');
            doc.setTextColor(30, 41, 59);
            for (let i = 0; i < blockLines.length; i++) {
              checkNewPage(4.5);
              doc.text(blockLines[i], margin + 2, y);
              y += 4.2;
            }
            y += 6;
          } else {
            checkNewPage(blockBoxHeight + 4);
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(margin, y, contentWidth, blockBoxHeight, 2, 2, 'FD');

            doc.setFontSize(8.5);
            doc.setFont('courier', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.text(blockLines, margin + 4, y + 5);
            y += blockBoxHeight + 8;
          }
        });
      }

      // Footer page numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${i} de ${totalPages}  •  Documentação de Prompt AI`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      const sanitizeFileName = (prompt.title || 'prompt')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');

      doc.save(`${sanitizeFileName}_documentacao.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleRestoreVersion = (ver: PromptVersion) => {
    if (!prompt || !onSavePrompt) return;
    const historyList = prompt.history || [];
    const nextVerIndex = historyList.length > 0 ? historyList.length : 1;
    const nextVerTag = `v1.${nextVerIndex}`;
    const nowFormatted =
      new Date().toLocaleDateString('pt-BR') +
      ', ' +
      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const restoreRecord: PromptVersion = {
      id: 'ver_restore_' + Date.now(),
      versionNumber: nextVerTag,
      author: prompt.author || 'Jorge Suss',
      date: nowFormatted,
      comment: `Restaurado a partir da versão ${ver.versionNumber}`,
      systemMessage: ver.systemMessage,
      promptTemplate: ver.promptTemplate,
      extraBlocks: ver.extraBlocks,
    };

    const newHistory = [restoreRecord, ...historyList];

    onSavePrompt({
      id: prompt.id,
      systemMessage: ver.systemMessage,
      promptTemplate: ver.promptTemplate,
      extraBlocks: ver.extraBlocks,
      version: nextVerTag,
      updatedAt: 'Agora mesmo',
      history: newHistory,
    });

    setComparingVersion(null);
    setActiveTab('details');
  };

  // Extract variables when prompt changes
  const variables = useMemo(() => {
    if (!prompt) return [];
    return extractVariables(prompt.promptTemplate);
  }, [prompt]);

  const filledPromptText = useMemo(() => {
    if (!prompt) return '';
    return replaceVariables(prompt.promptTemplate, variableValues);
  }, [prompt, variableValues]);

  const fullPromptTextWithBlocks = useMemo(() => {
    if (!prompt) return '';
    return formatFullPromptWithBlocks(prompt.promptTemplate, prompt.extraBlocks, variableValues);
  }, [prompt, variableValues]);

  if (!prompt) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest p-8 text-center text-on-surface-variant">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
          <Folder className="w-8 h-8 text-outline" />
        </div>
        <h3 className="text-xl font-bold font-display text-on-surface">Nenhum prompt selecionado</h3>
        <p className="text-sm text-outline max-w-sm mt-1">
          Selecione um prompt na lista ao lado para visualizar os detalhes, editar ou testar com IA.
        </p>
      </section>
    );
  }

  const handleCopyTemplate = () => {
    const textToCopy = formatFullPromptWithBlocks(
      prompt.promptTemplate,
      prompt.extraBlocks,
      variableValues
    );
    onCopyText(textToCopy);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRunAi = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setAiOutput(null);

    try {
      const res = await fetch('/api/llm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemMessage: prompt.systemMessage,
          promptTemplate: fullPromptTextWithBlocks,
          provider: prompt.modelTag?.toLowerCase().includes('chatgpt')
            ? 'openai'
            : prompt.modelTag?.toLowerCase().includes('claude')
            ? 'anthropic'
            : prompt.modelTag?.toLowerCase().includes('openrouter')
            ? 'openrouter'
            : 'gemini',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao comunicar com a IA');
      }

      setAiOutput(data.text);
    } catch (err: any) {
      setExecutionError(err?.message || 'Falha na execução com IA.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest overflow-hidden lg:m-4 lg:rounded-3xl lg:border lg:border-outline-variant lg:shadow-sm">
      {/* Detail Toolbar */}
      <div className="px-6 py-4 border-b border-outline-variant/50 flex flex-wrap justify-between items-center bg-surface-container-lowest gap-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-outline" />
          <span className="text-xs text-on-surface-variant font-medium">
            {prompt.version} ({prompt.author})
          </span>
          <span className="text-xs text-outline">• {prompt.updatedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Version History Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'history' ? 'details' : 'history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === 'history'
                ? 'bg-primary/10 text-primary border-primary/40 font-bold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
            }`}
            title="Histórico de Versões do Prompt"
          >
            <History className="w-4 h-4 text-primary" />
            <span>Versões</span>
            {prompt.history && prompt.history.length > 0 && (
              <span className="bg-primary text-on-primary text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {prompt.history.length}
              </span>
            )}
          </button>

          {/* View Mode Toggle (Details / Thread Card View) */}
          <button
            onClick={() => setActiveTab(activeTab === 'details' ? 'thread' : 'details')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === 'thread'
                ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-high'
            }`}
          >
            {activeTab === 'details' ? 'Visão em Card / Thread' : 'Visão Detalhada'}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all shadow-xs disabled:opacity-50"
            title="Exportar documento em formato PDF"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <FileDown className="w-4 h-4 text-primary" />
            )}
            <span>{isExportingPdf ? 'Gerando PDF...' : 'Exportar PDF'}</span>
          </button>

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
              title="Duplicar Prompt"
            >
              <CopyPlus className="w-4 h-4" />
              <span>Duplicar</span>
            </button>
          )}

          <button
            onClick={() => onEdit(prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>

          <button
            onClick={() => onDelete(prompt.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error-container/50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Deletar</span>
          </button>
        </div>
      </div>

      {/* Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 custom-scrollbar max-w-[900px] mx-auto w-full">
        {activeTab === 'history' ? (
          /* PRD #19 Prompt Versioning View */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-on-surface flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Histórico de Versões
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Acompanhe todas as alterações realizadas, compare versões lado a lado e restaure estados anteriores.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('details')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Prompt
              </button>
            </div>

            {/* Version comparison box if user selected a version to compare */}
            {comparingVersion && (
              <div className="p-5 bg-surface-container-low rounded-2xl border-2 border-primary/40 space-y-4 shadow-md animate-fadeIn">
                <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-on-surface">
                      Comparando {comparingVersion.versionNumber} com a Versão Atual ({prompt.version})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreVersion(comparingVersion)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restaurar versão {comparingVersion.versionNumber}
                    </button>
                    <button
                      onClick={() => setComparingVersion(null)}
                      className="text-xs text-outline hover:text-on-surface px-2 py-1"
                    >
                      Fechar
                    </button>
                  </div>
                </div>

                {/* Side by side columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selected Past Version */}
                  <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>{comparingVersion.versionNumber} ({comparingVersion.author})</span>
                      <span className="text-outline font-normal">{comparingVersion.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface italic">
                      &quot;{comparingVersion.comment || 'Sem nota'}&quot;
                    </p>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        Mensagem do Sistema:
                      </span>
                      <p className="p-2.5 bg-surface-container-low rounded-lg font-mono text-xs text-on-surface whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {comparingVersion.systemMessage || '(Nenhuma)'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        Instruções do Prompt:
                      </span>
                      <p className="p-2.5 bg-surface-container-low rounded-lg font-mono text-xs text-on-surface whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {comparingVersion.promptTemplate}
                      </p>
                    </div>
                  </div>

                  {/* Current Active Version */}
                  <div className="p-4 bg-surface-container-lowest rounded-xl border border-primary/30 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {prompt.version} (Versão Atual)
                      </span>
                      <span className="text-outline font-normal">{prompt.updatedAt}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface italic">
                      &quot;Estado atual no workspace&quot;
                    </p>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        Mensagem do Sistema:
                      </span>
                      <p className="p-2.5 bg-surface-container-low rounded-lg font-mono text-xs text-on-surface whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {prompt.systemMessage || '(Nenhuma)'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                        Instruções do Prompt:
                      </span>
                      <p className="p-2.5 bg-surface-container-low rounded-lg font-mono text-xs text-on-surface whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {prompt.promptTemplate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Version History List */}
            <div className="space-y-3">
              {(!prompt.history || prompt.history.length === 0) ? (
                <div className="p-6 text-center bg-surface-container-low rounded-2xl border border-outline-variant/40">
                  <p className="text-sm font-semibold text-on-surface">Esta é a primeira versão registrada ({prompt.version}).</p>
                  <p className="text-xs text-outline mt-1">Ao editar e salvar alterações, novas versões serão salvas automaticamente aqui.</p>
                </div>
              ) : (
                prompt.history.map((ver, idx) => {
                  const isCurrent = idx === 0 || ver.versionNumber === prompt.version;
                  return (
                    <div
                      key={ver.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-surface-container-lowest border-2 border-primary/40 shadow-sm'
                          : 'bg-surface-container-low/70 border-outline-variant/40 hover:bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            {ver.versionNumber}
                          </span>
                          {isCurrent && (
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                              Versão Atual
                            </span>
                          )}
                          <span className="text-xs text-outline flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ver.date}
                          </span>
                          <span className="text-xs text-outline flex items-center gap-1">
                            • <User className="w-3 h-3" /> {ver.author}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setComparingVersion(ver)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-semibold text-on-surface transition-colors"
                          >
                            <GitCompare className="w-3.5 h-3.5" /> Comparar
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleRestoreVersion(ver)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl text-xs font-bold transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-on-surface mb-2">
                        📝 {ver.comment || 'Sem comentário de alteração'}
                      </p>

                      <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 text-xs font-mono text-on-surface-variant line-clamp-2">
                        {ver.promptTemplate}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'thread' ? (
          /* Image 3 Social Thread Card View Representation */
          <div className="max-w-md mx-auto my-8 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/80 shadow-md">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                J
              </div>
              <span className="text-xs font-semibold text-on-surface">{prompt.author}</span>
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-1">{prompt.title}</h2>
            <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">
              {prompt.shortDescription}
            </p>

            <div className="flex items-center justify-between text-xs text-outline mb-4">
              <div className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-purple-600 fill-purple-600/20" />
                <span className="text-purple-700 font-medium">{prompt.folder}</span>
              </div>
              <span>Jan 11, 2026</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40 text-xs">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2 py-1 bg-surface-container-low rounded hover:bg-surface-container-high text-primary font-semibold">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{prompt.votes || 1}</span>
                  <ThumbsDown className="w-3.5 h-3.5 text-outline hover:text-on-surface" />
                </button>
                <button
                  onClick={(e) => onToggleFavorite(prompt.id, e)}
                  className="p-1.5 hover:bg-surface-container-high rounded text-outline"
                >
                  <Bookmark className={`w-4 h-4 ${prompt.isFavorite ? 'fill-current text-primary' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSharePrompt(prompt)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high rounded font-medium text-on-surface-variant"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high rounded font-medium text-on-surface-variant"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('details')}
              className="mt-4 w-full flex items-center justify-between px-3 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-xs text-on-surface-variant font-medium"
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Thread & Instruções Detalhadas</span>
              </div>
              <span>›</span>
            </button>
          </div>
        ) : (
          /* Normal Detailed Document View */
          <>
            {/* Title & Favorite Header */}
            <div className="mb-8 relative">
              <div className="absolute top-0 right-0">
                <button
                  onClick={(e) => onToggleFavorite(prompt.id, e)}
                  className="text-outline hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-surface-container-high"
                  title="Favoritar Prompt"
                >
                  <Star
                    className={`w-6 h-6 ${
                      prompt.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-outline'
                    }`}
                  />
                </button>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-display text-on-surface mb-4 leading-tight pr-12">
                {prompt.title}
              </h1>

              {/* Tags & Folder */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                  <Folder className="w-4 h-4 text-primary" />
                  <span>{prompt.folder}</span>
                </div>
                {prompt.project && (
                  <>
                    <div className="h-4 w-px bg-outline-variant" />
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>{prompt.project}</span>
                    </div>
                  </>
                )}
                {prompt.categoryTag && (
                  <>
                    <div className="h-4 w-px bg-outline-variant" />
                    <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-0.5 rounded-lg">
                      {prompt.categoryTag}
                    </span>
                  </>
                )}
                <div className="h-4 w-px bg-outline-variant" />
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                    {prompt.modelTag}
                  </span>
                  {prompt.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-surface-container-high text-on-surface-variant text-xs font-medium px-2.5 py-0.5 rounded-lg border border-outline-variant/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                {prompt.shortDescription}
              </p>
            </div>

            {/* System Message (if present) */}
            {prompt.systemMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                  Mensagem de Sistema (Contexto)
                </span>
                <p className="text-sm font-mono text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                  {prompt.systemMessage}
                </p>
              </div>
            )}

            {/* Template Box */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden mb-8 shadow-sm">
              <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-2">
                  Template do Prompt {prompt.extraBlocks && prompt.extraBlocks.length > 0 && `(${1 + prompt.extraBlocks.length} Blocos)`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/40"
                    title="Exportar PDF do prompt"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleCopyTemplate}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity bg-primary/10 px-3 py-1.5 rounded-lg"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Template Completo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main Template Instructions */}
              <div className="p-6 bg-surface-container-lowest overflow-x-auto">
                {prompt.extraBlocks && prompt.extraBlocks.length > 0 && (
                  <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Instruções Principais
                  </div>
                )}
                <pre className="text-sm font-mono text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                  {replaceVariables(prompt.promptTemplate, variableValues)}
                </pre>
              </div>

              {/* Additional Blocks with Title displayed BEFORE Instructions */}
              {prompt.extraBlocks && prompt.extraBlocks.length > 0 && (
                <div className="border-t border-outline-variant/30 divide-y divide-outline-variant/30">
                  {prompt.extraBlocks.map((block, idx) => {
                    const blockTitle = block.title?.trim() || `Bloco Adicional ${idx + 1}`;
                    const blockContent = replaceVariables(block.content, variableValues);

                    return (
                      <div key={block.id || idx} className="p-6 bg-surface-container-low/30 overflow-x-auto space-y-2">
                        <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-mono">
                              Bloco #{idx + 1}
                            </span>
                            <span className="text-on-surface font-bold text-xs font-mono">
                              ### [{blockTitle.toUpperCase()}]
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const blockTextToCopy = `### [${blockTitle.toUpperCase()}]\n${blockContent}`;
                              onCopyText(blockTextToCopy);
                            }}
                            className="text-xs text-primary hover:opacity-80 flex items-center gap-1 font-semibold bg-primary/10 px-2.5 py-1 rounded-lg transition-opacity"
                            title="Copiar este bloco"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copiar Bloco
                          </button>
                        </div>
                        <pre className="text-sm font-mono text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                          {blockContent}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Supported Variables Section */}
            {variables.length > 0 && (
              <div className="mt-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold font-display text-on-surface">
                    Variáveis Suportadas ({variables.length})
                  </h3>
                  <span className="text-xs text-outline">
                    Preencha os campos abaixo para testar o prompt em tempo real
                  </span>
                </div>

                <div className="border border-outline-variant/50 rounded-2xl overflow-hidden mb-6">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-surface-container-low/50 text-outline border-b border-outline-variant/50 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-3 px-4">Variável</th>
                        <th className="py-3 px-4">Descrição</th>
                        <th className="py-3 px-4">Valor para Teste</th>
                      </tr>
                    </thead>
                    <tbody className="text-on-surface-variant">
                      {variables.map((v) => (
                        <tr
                          key={v.name}
                          className="border-b border-outline-variant/30 hover:bg-surface-container-low/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-primary font-semibold">
                            <span className="bg-primary-fixed/30 px-2 py-1 rounded-md">
                              {v.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">{v.description}</td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              placeholder={v.example}
                              value={variableValues[v.name] || ''}
                              onChange={(e) => handleVariableChange(v.name, e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Run with Gemini AI Section */}
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/60 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-lg font-bold font-display text-on-surface flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Executar Prompt com IA Gemini
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Testa e executa o template diretamente via Gemini API server-side.
                  </p>
                </div>

                <button
                  onClick={handleRunAi}
                  disabled={isExecuting}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Gerando resposta...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Executar Prompt
                    </>
                  )}
                </button>
              </div>

              {/* Execution Error */}
              {executionError && (
                <div className="mt-3 p-3 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20">
                  {executionError}
                </div>
              )}

              {/* AI Response Output */}
              {aiOutput && (
                <div className="mt-4 p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Resposta da IA (Gemini 3.6 Flash)
                    </span>
                    <button
                      onClick={() => {
                        onCopyText(aiOutput);
                        setCopiedTestOutput(true);
                        setTimeout(() => setCopiedTestOutput(false), 2000);
                      }}
                      className="text-xs font-semibold text-outline hover:text-primary flex items-center gap-1"
                    >
                      {copiedTestOutput ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTestOutput ? 'Copiado!' : 'Copiar Saída'}
                    </button>
                  </div>
                  <div className="text-sm text-on-surface font-sans whitespace-pre-wrap leading-relaxed">
                    {aiOutput}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
