'use client';

import React from 'react';
import { Search, Bell, HelpCircle, Menu, Sparkles, Plus } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewPrompt: () => void;
  onOpenTestModal: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  onOpenNewPrompt,
  onOpenTestModal,
  onToggleMobileSidebar,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 md:px-10 py-4 w-full sticky top-0 z-30 bg-background/90 backdrop-blur-md flex-shrink-0 border-b border-outline-variant/30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Search input */}
        <div className="relative w-48 sm:w-72 md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar em Todos os Prompts..."
            className="w-full bg-surface-container-low border border-transparent hover:border-outline-variant focus:border-primary/50 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline outline-none text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Test Gemini Action */}
        <button
          onClick={onOpenTestModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold hover:opacity-90 transition-all border border-tertiary-fixed-dim"
          title="Testar Prompt com IA Gemini"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Testar IA</span>
        </button>

        {/* Notifications & Help */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => alert('Sua caixa de notificações está atualizada!')}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => alert('Promptify - Espaço de Trabalho para Gestão, Criação e Execução de Prompts para Gemini e ChatGPT.')}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            title="Ajuda"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
