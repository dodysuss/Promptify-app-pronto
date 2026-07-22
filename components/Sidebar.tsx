'use client';

import React, { useState } from 'react';
import {
  ListFilter,
  FolderX,
  Star,
  Archive,
  Folder,
  Tag,
  Search,
  Settings,
  Plus,
  ChevronsLeft,
  ChevronRight,
  User,
  Check,
  FolderPlus,
  Sparkles,
  Play,
  Layers,
  Briefcase,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedProject: string | null;
  setSelectedProject: (project: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  onOpenNewPrompt: () => void;
  promptsCount: {
    total: number;
    uncategorized: number;
    favorites: number;
    archived: number;
  };
  folders: string[];
  categories: string[];
  projects: string[];
  tags: string[];
  onAddFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onAddProject: (projectName: string) => void;
  onDeleteProject: (projectName: string) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  userProfile: { name: string; role: string; avatarUrl: string };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedFolder,
  setSelectedFolder,
  selectedCategory,
  setSelectedCategory,
  selectedProject,
  setSelectedProject,
  selectedTag,
  setSelectedTag,
  onOpenNewPrompt,
  promptsCount,
  folders,
  categories,
  projects,
  tags,
  onAddFolder,
  onDeleteFolder,
  onAddCategory,
  onDeleteCategory,
  onAddProject,
  onDeleteProject,
  onOpenSettings,
  onOpenSearch,
  userProfile,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setSelectedFolder(newFolderName.trim());
      setSelectedCategory(null);
      setSelectedProject(null);
      setSelectedTag(null);
      setActiveTab('folder');
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setSelectedCategory(newCategoryName.trim());
      setSelectedFolder(null);
      setSelectedProject(null);
      setSelectedTag(null);
      setActiveTab('category');
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setSelectedProject(newProjectName.trim());
      setSelectedFolder(null);
      setSelectedCategory(null);
      setSelectedTag(null);
      setActiveTab('project');
      setNewProjectName('');
      setIsAddingProject(false);
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedFolder(null);
    setSelectedCategory(null);
    setSelectedProject(null);
    setSelectedTag(null);
  };

  const handleSelectFolder = (folder: string) => {
    setActiveTab('folder');
    setSelectedFolder(folder);
    setSelectedCategory(null);
    setSelectedProject(null);
    setSelectedTag(null);
  };

  const handleSelectCategory = (category: string) => {
    setActiveTab('category');
    setSelectedCategory(category);
    setSelectedFolder(null);
    setSelectedProject(null);
    setSelectedTag(null);
  };

  const handleSelectProject = (project: string) => {
    setActiveTab('project');
    setSelectedProject(project);
    setSelectedFolder(null);
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const handleSelectTag = (tag: string) => {
    setActiveTab('tag');
    setSelectedTag(tag);
    setSelectedFolder(null);
    setSelectedCategory(null);
    setSelectedProject(null);
  };

  return (
    <aside
      className={`glass-sidebar fixed lg:relative z-40 h-full border-r border-outline-variant flex flex-col p-4 md:p-6 gap-6 flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      }`}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-on-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-primary font-display truncate">
                Promptify
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-on-surface-variant uppercase truncate">
                Espaço de Trabalho
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronsLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* CTA Button */}
      <button
        onClick={onOpenNewPrompt}
        className={`w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 ${
          isCollapsed ? 'px-0' : ''
        }`}
        title="Novo Prompt"
      >
        <Plus className="w-5 h-5" />
        {!isCollapsed && <span>Novo Prompt</span>}
      </button>

      {/* Playground Button */}
      <button
        onClick={() => handleSelectTab('playground')}
        className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all duration-200 shadow-2xs ${
          activeTab === 'playground'
            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
            : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container-high'
        } ${isCollapsed ? 'px-0' : ''}`}
        title="Playground LLM"
      >
        <Play className="w-4 h-4 fill-current flex-shrink-0" />
        {!isCollapsed && <span>Playground</span>}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
        {/* Navigation Tabs */}
        <button
          onClick={() => handleSelectTab('all')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-surface-container-high text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
          title="Todos os Prompts"
        >
          <ListFilter className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm truncate flex-1 text-left">Todos os Prompts</span>
          )}
          {!isCollapsed && (
            <span className="text-xs text-outline bg-surface-container-lowest px-2 py-0.5 rounded-full font-mono">
              {promptsCount.total}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('uncategorized')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'uncategorized'
              ? 'bg-surface-container-high text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
          title="Sem categoria"
        >
          <FolderX className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm truncate flex-1 text-left">Sem categoria</span>
          )}
          {!isCollapsed && promptsCount.uncategorized > 0 && (
            <span className="text-xs text-outline font-mono">
              {promptsCount.uncategorized}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('favorites')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'favorites'
              ? 'bg-surface-container-high text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
          title="Favoritos"
        >
          <Star className="w-5 h-5 flex-shrink-0 fill-current text-amber-500" />
          {!isCollapsed && (
            <span className="text-sm truncate flex-1 text-left">Favoritos</span>
          )}
          {!isCollapsed && promptsCount.favorites > 0 && (
            <span className="text-xs text-outline font-mono">
              {promptsCount.favorites}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('archived')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'archived'
              ? 'bg-surface-container-high text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
          title="Arquivos"
        >
          <Archive className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm truncate flex-1 text-left">Arquivos</span>
          )}
        </button>

        {/* Projetos Section */}
        <div className="pt-3 pb-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Projetos
              </span>
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-high"
                title="Incluir novo projeto"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-px bg-outline-variant my-2" />
          )}

          {isAddingProject && !isCollapsed && (
            <form onSubmit={handleProjectSubmit} className="px-2 my-2 flex gap-1">
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Nome do projeto..."
                className="w-full text-xs px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-1 text-primary hover:bg-primary-fixed rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="space-y-0.5">
            {projects.map((project) => {
              const isSelected = activeTab === 'project' && selectedProject === project;
              return (
                <div
                  key={project}
                  className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-colors ${
                    isSelected
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <button
                    onClick={() => handleSelectProject(project)}
                    className="flex items-center gap-2.5 truncate flex-1 text-left"
                    title={project}
                  >
                    <Briefcase
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-primary' : 'text-outline'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{project}</span>}
                  </button>

                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-outline hover:text-error p-1 rounded transition-opacity"
                      title="Excluir Projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Categorias Section */}
        <div className="pt-3 pb-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Categorias
              </span>
              <button
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-high"
                title="Incluir nova categoria"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-px bg-outline-variant my-2" />
          )}

          {isAddingCategory && !isCollapsed && (
            <form onSubmit={handleCategorySubmit} className="px-2 my-2 flex gap-1">
              <input
                type="text"
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria..."
                className="w-full text-xs px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-1 text-primary hover:bg-primary-fixed rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="space-y-0.5">
            {categories.map((category) => {
              const isSelected = activeTab === 'category' && selectedCategory === category;
              return (
                <div
                  key={category}
                  className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-colors ${
                    isSelected
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <button
                    onClick={() => handleSelectCategory(category)}
                    className="flex items-center gap-2.5 truncate flex-1 text-left"
                    title={category}
                  >
                    <Layers
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-primary' : 'text-outline'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{category}</span>}
                  </button>

                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-outline hover:text-error p-1 rounded transition-opacity"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Folders Section */}
        <div className="pt-3 pb-1">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Pastas
              </span>
              <button
                onClick={() => setIsAddingFolder(!isAddingFolder)}
                className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container-high"
                title="Criar nova pasta"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-px bg-outline-variant my-2" />
          )}

          {isAddingFolder && !isCollapsed && (
            <form onSubmit={handleFolderSubmit} className="px-2 my-2 flex gap-1">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta..."
                className="w-full text-xs px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded-lg outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-1 text-primary hover:bg-primary-fixed rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isSelected = activeTab === 'folder' && selectedFolder === folder;
              return (
                <div
                  key={folder}
                  className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-colors ${
                    isSelected
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <button
                    onClick={() => handleSelectFolder(folder)}
                    className="flex items-center gap-2.5 truncate flex-1 text-left"
                    title={folder}
                  >
                    <Folder
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-primary fill-primary/20' : 'text-outline'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{folder}</span>}
                  </button>

                  {!isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-outline hover:text-error p-1 rounded transition-opacity"
                      title="Excluir Pasta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        {!isCollapsed && (
          <div className="pt-3 pb-1">
            <span className="text-[10px] font-bold text-outline px-3 uppercase tracking-widest block mb-2">
              Tags
            </span>
            <div className="flex flex-wrap gap-1 px-2">
              {tags.map((tag) => {
                const isSelected = activeTab === 'tag' && selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed font-semibold'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/50 hover:bg-surface-container-high'
                    }`}
                  >
                    <Tag className="w-3 h-3 text-outline" />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Actions & Profile */}
      <div className="mt-auto border-t border-outline-variant pt-3 flex flex-col gap-1">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-xl w-full text-left"
          title="Pesquisar"
        >
          <Search className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Pesquisar</span>}
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-xl w-full text-left"
          title="Configurações"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Configurações</span>}
        </button>

        {/* User Card */}
        <div className="relative mt-2">
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm cursor-pointer hover:bg-surface-container-low transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 flex-shrink-0">
              JS
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate text-on-surface">{userProfile.name}</p>
                <p className="text-[10px] font-semibold text-on-surface-variant truncate uppercase">
                  {userProfile.role}
                </p>
              </div>
            )}
          </div>

          {isUserMenuOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg p-2 z-50 text-xs text-on-surface">
              <div className="px-3 py-2 border-b border-outline-variant/40 mb-1">
                <p className="font-semibold">{userProfile.name}</p>
                <p className="text-[11px] text-outline">jorgeassad1989@gmail.com</p>
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low rounded-lg"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  alert('Sessão mantida localmente no Promptify Workspace.');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low rounded-lg text-error"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

