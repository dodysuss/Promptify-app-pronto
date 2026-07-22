'use client';

import React, { useState } from 'react';
import { PromptItem } from '@/types/prompt';
import { X, Share2, Copy, Check, FileText, Code } from 'lucide-react';

interface ShareModalProps {
  prompt: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ prompt, isOpen, onClose }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen || !prompt) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?prompt=${prompt.id}` : '';

  const markdownContent = `# ${prompt.title}
*${prompt.shortDescription}*

**Modelo:** ${prompt.modelTag} | **Pasta:** ${prompt.folder} | **Versão:** ${prompt.version}

## Contexto (Mensagem de Sistema)
\`\`\`
${prompt.systemMessage || 'N/A'}
\`\`\`

## Template do Prompt
\`\`\`
${prompt.promptTemplate}
\`\`\`
`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/20 backdrop-blur-[3px] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold font-display text-on-surface">Compartilhar Prompt</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 bg-surface-bright text-xs">
          <div>
            <span className="font-bold text-on-surface block mb-1">{prompt.title}</span>
            <p className="text-on-surface-variant line-clamp-2">{prompt.shortDescription}</p>
          </div>

          <div>
            <label className="block text-outline font-semibold mb-1">Link Direto</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-1.5 font-mono text-[11px] text-on-surface outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-primary text-on-primary font-semibold rounded-xl flex items-center gap-1 hover:opacity-90"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/40 flex justify-between items-center">
            <span className="text-outline font-medium">Exportar em Markdown</span>
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-surface-container-high text-on-surface font-semibold rounded-xl flex items-center gap-1 hover:bg-surface-container-highest"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5" />}
              {copiedMarkdown ? 'Markdown Copiado!' : 'Copiar Markdown'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
