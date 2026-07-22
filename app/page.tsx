'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PromptItem } from '@/types/prompt';
import { INITIAL_PROMPTS } from '@/lib/initial-prompts';
import { safeParseJson, safeStorageGetString, safeStorageRemoveItem, safeStorageSetString } from '@/lib/security-helpers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PromptFeed from '@/components/PromptFeed';
import PromptDetail from '@/components/PromptDetail';
import PromptModal from '@/components/PromptModal';
import SettingsModal from '@/components/SettingsModal';
import ShareModal from '@/components/ShareModal';
import Playground from '@/components/Playground';

export default function HomePage() {
  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = safeStorageGetString('promptify_prompts');
        const parsed = safeParseJson(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed loading prompts from localStorage:', e);
      }
    }
    return INITIAL_PROMPTS;
  });

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(() => {
    return prompts[0]?.id || 'p1';
  });

  // Navigation & Search / Filter states
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'uncategorized', 'favorites', 'archived', 'folder', 'category', 'project', 'tag'
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Additional Filter & Sorting controls
  const [filterModel, setFilterModel] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'recente' | 'antigo' | 'nome' | 'utilizados'>('recente');
  const [viewMode, setViewMode] = useState<'cards' | 'lista'>('cards');

  // UI Modals & Drawers
  const [isNewPromptOpen, setIsNewPromptOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sharingPrompt, setSharingPrompt] = useState<PromptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Responsive & Sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Jorge Suss',
    role: 'WORKSPACE PRO',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMM95FIIerV2M5bXhxPc5Nj_RfakBeswJsxQwSjJVWddO2MFC-_ADlNBQ4MaADi0HNhGd1cSE-f3UnSuR7tgqa6xRoEpcWQ_q7pw1XsD4pJ9naOe-mRmgevCZFtuXvzNX-SwLLQbtV2ZIa4eoWPMbWVV3YRBsks9C3o2LNMtDNAbRWi41yL0DqF9FXalpRhzapc9uG8drLqyDMSBOyVx-MNiL6WotwjHD8Qv1Qq9FTJaFs4TRDafx4hkT5nwUeu403Jpw3KXvOK3So',
  });

  // Folders, Categories and Projects State with Persistence
  const [folders, setFolders] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = safeStorageGetString('promptify_folders');
        const parsed = safeParseJson(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      'Conteúdo',
      'Getting Started',
      'N8N Automation',
      'ChatGPT',
      'Gemini',
      'Marketing',
      'Desenvolvimento',
    ];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = safeStorageGetString('promptify_categories');
        const parsed = safeParseJson(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ['Marketing', 'Engenharia', 'Vendas', 'Suporte', 'Produtividade', 'Design', 'Automação'];
  });

  const [projects, setProjects] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = safeStorageGetString('promptify_projects');
        const parsed = safeParseJson(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ['Projeto Alpha', 'Lançamento Q3', 'Automação CRM', 'Appwrite Backend'];
  });

  // Save state to localStorage on change
  useEffect(() => {
    if (prompts.length > 0) {
      safeStorageSetString('promptify_prompts', JSON.stringify(prompts));
    }
  }, [prompts]);

  useEffect(() => {
    if (folders.length > 0) {
      safeStorageSetString('promptify_folders', JSON.stringify(folders));
    }
  }, [folders]);

  useEffect(() => {
    if (categories.length > 0) {
      safeStorageSetString('promptify_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (projects.length > 0) {
      safeStorageSetString('promptify_projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Derived counts
  const promptsCount = useMemo(() => {
    const total = prompts.filter((p) => !p.isArchived).length;
    const uncategorized = prompts.filter((p) => !p.folder && !p.isArchived).length;
    const favorites = prompts.filter((p) => p.isFavorite && !p.isArchived).length;
    const archived = prompts.filter((p) => p.isArchived).length;
    return { total, uncategorized, favorites, archived };
  }, [prompts]);

  // All unique tags across prompts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [prompts]);

  // Filtered and Sorted prompts
  const filteredPrompts = useMemo(() => {
    let list = prompts.filter((p) => {
      // Search query filter (Nome, Conteúdo, Tags, Categoria)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.shortDescription?.toLowerCase().includes(q);
        const matchesTemplate = p.promptTemplate.toLowerCase().includes(q);
        const matchesCategory = p.categoryTag?.toLowerCase().includes(q) || p.folder?.toLowerCase().includes(q);
        const matchesProject = p.project?.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesBlocks = p.extraBlocks?.some(
          (b) => b.title?.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesDesc && !matchesTemplate && !matchesCategory && !matchesProject && !matchesTags && !matchesBlocks) {
          return false;
        }
      }

      // Tab / Navigation filter
      if (activeTab === 'favorites' && (!p.isFavorite || p.isArchived)) return false;
      if (activeTab === 'archived' && !p.isArchived) return false;
      if (activeTab === 'uncategorized' && (p.folder || p.isArchived)) return false;
      if (activeTab === 'folder' && selectedFolder) {
        if (p.folder?.toLowerCase() !== selectedFolder.toLowerCase() || p.isArchived) return false;
      }
      if (activeTab === 'category' && selectedCategory) {
        if (
          (p.categoryTag?.toLowerCase() !== selectedCategory.toLowerCase() &&
           p.folder?.toLowerCase() !== selectedCategory.toLowerCase()) ||
          p.isArchived
        ) {
          return false;
        }
      }
      if (activeTab === 'project' && selectedProject) {
        if (p.project?.toLowerCase() !== selectedProject.toLowerCase() || p.isArchived) return false;
      }
      if (activeTab === 'tag' && selectedTag) {
        if (!p.tags?.includes(selectedTag) || p.isArchived) return false;
      }
      if (activeTab === 'all' && p.isArchived) return false;

      // Model Filter
      if (filterModel !== 'todos') {
        if (!p.modelTag?.toLowerCase().includes(filterModel.toLowerCase())) return false;
      }

      // Category Filter
      if (filterCategory !== 'todas') {
        if (
          p.categoryTag?.toLowerCase() !== filterCategory.toLowerCase() &&
          p.folder?.toLowerCase() !== filterCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // Status Filter
      if (filterStatus !== 'todos') {
        const itemStatus = p.status || 'Ativo';
        if (itemStatus.toLowerCase() !== filterStatus.toLowerCase()) return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'antigo') {
        return a.id.localeCompare(b.id);
      }
      if (sortBy === 'nome') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'utilizados') {
        const usageA = (a.votes || 0) + (a.usageCount || 0);
        const usageB = (b.votes || 0) + (b.usageCount || 0);
        return usageB - usageA;
      }
      // 'recente' default
      return b.id.localeCompare(a.id);
    });
  }, [prompts, searchQuery, activeTab, selectedFolder, selectedCategory, selectedProject, selectedTag, filterModel, filterCategory, filterStatus, sortBy]);

  // Currently selected prompt item
  const selectedPrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId) || filteredPrompts[0] || null;
  }, [prompts, selectedPromptId, filteredPrompts]);

  // Handlers
  const handleDuplicatePrompt = (promptToDup: PromptItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const duplicated: PromptItem = {
      ...promptToDup,
      id: 'p_' + Date.now(),
      title: `${promptToDup.title} (Cópia)`,
      updatedAt: 'Agora mesmo',
      status: promptToDup.status || 'Ativo',
      votes: (promptToDup.votes || 0) + 1,
    };
    setPrompts((prev) => [duplicated, ...prev]);
    setSelectedPromptId(duplicated.id);
  };

  // Handlers
  const handleSavePrompt = (data: Partial<PromptItem>) => {
    if (data.id) {
      // Update existing
      setPrompts((prev) =>
        prev.map((p) => (p.id === data.id ? ({ ...p, ...data } as PromptItem) : p))
      );
    } else {
      // Create new
      const newPrompt: PromptItem = {
        id: 'p_' + Date.now(),
        title: data.title || 'Novo Prompt',
        shortDescription: data.shortDescription || '',
        modelTag: data.modelTag || 'Gemini',
        categoryTag: data.categoryTag || data.folder || 'Geral',
        folder: data.folder || 'Conteúdo',
        tags: data.tags || [],
        isFavorite: false,
        isArchived: false,
        author: userProfile.name,
        version: 'V 1.0',
        updatedAt: 'Agora',
        systemMessage: data.systemMessage || '',
        promptTemplate: data.promptTemplate || '',
        extraBlocks: data.extraBlocks || [],
        votes: 0,
      };

      setPrompts((prev) => [newPrompt, ...prev]);
      setSelectedPromptId(newPrompt.id);
    }
    setEditingPrompt(null);
    setIsNewPromptOpen(false);
  };

  const handleDeletePrompt = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este prompt?')) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      if (selectedPromptId === id) {
        const remaining = prompts.filter((p) => p.id !== id);
        setSelectedPromptId(remaining[0]?.id || null);
      }
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleCopyText = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const handleCopyPromptFeed = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    const found = prompts.find((p) => p.promptTemplate === text);
    if (found) {
      setCopiedId(found.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSharePrompt = (prompt: PromptItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSharingPrompt(prompt);
  };

  const handleAddFolder = (folderName: string) => {
    if (!folders.includes(folderName)) {
      setFolders((prev) => [...prev, folderName]);
    }
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    if (confirm(`Tem certeza que deseja excluir a pasta "${folderToDelete}"?`)) {
      setFolders((prev) => prev.filter((f) => f !== folderToDelete));
      setPrompts((prev) =>
        prev.map((p) => (p.folder === folderToDelete ? { ...p, folder: '' } : p))
      );
      if (selectedFolder === folderToDelete) {
        setSelectedFolder(null);
        setActiveTab('all');
      }
    }
  };

  const handleAddCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      setCategories((prev) => [...prev, categoryName]);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"?`)) {
      setCategories((prev) => prev.filter((c) => c !== categoryToDelete));
      setPrompts((prev) =>
        prev.map((p) => (p.categoryTag === categoryToDelete ? { ...p, categoryTag: '' } : p))
      );
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory(null);
        setActiveTab('all');
      }
    }
  };

  const handleAddProject = (projectName: string) => {
    if (!projects.includes(projectName)) {
      setProjects((prev) => [...prev, projectName]);
    }
  };

  const handleDeleteProject = (projectToDelete: string) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${projectToDelete}"?`)) {
      setProjects((prev) => prev.filter((pr) => pr !== projectToDelete));
      setPrompts((prev) =>
        prev.map((p) => (p.project === projectToDelete ? { ...p, project: '' } : p))
      );
      if (selectedProject === projectToDelete) {
        setSelectedProject(null);
        setActiveTab('all');
      }
    }
  };

  const handleResetData = () => {
    safeStorageRemoveItem('promptify_prompts');
    setPrompts(INITIAL_PROMPTS);
    setSelectedPromptId(INITIAL_PROMPTS[0].id);
  };

  // Section title calculation
  const feedTitle = useMemo(() => {
    if (searchQuery.trim()) return `Busca: "${searchQuery}"`;
    if (activeTab === 'favorites') return 'Favoritos';
    if (activeTab === 'archived') return 'Arquivos';
    if (activeTab === 'uncategorized') return 'Sem categoria';
    if (activeTab === 'folder' && selectedFolder) return `Pasta: ${selectedFolder}`;
    if (activeTab === 'category' && selectedCategory) return `Categoria: ${selectedCategory}`;
    if (activeTab === 'project' && selectedProject) return `Projeto: ${selectedProject}`;
    if (activeTab === 'tag' && selectedTag) return `Tag: #${selectedTag}`;
    return 'Todos os Prompts';
  }, [searchQuery, activeTab, selectedFolder, selectedCategory, selectedProject, selectedTag]);

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-sans">
      {/* Sidebar Navigation */}
      <div className={`h-full ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onOpenNewPrompt={() => {
            setEditingPrompt(null);
            setIsNewPromptOpen(true);
          }}
          promptsCount={promptsCount}
          folders={folders}
          categories={categories}
          projects={projects}
          tags={allTags}
          onAddFolder={handleAddFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSearch={() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) input.focus();
          }}
          userProfile={userProfile}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Top App Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewPrompt={() => {
            setEditingPrompt(null);
            setIsNewPromptOpen(true);
          }}
          onOpenTestModal={() => {
            setActiveTab('playground');
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Workspace Area: Either Playground View or 2-Column Feed + Detail View */}
        {activeTab === 'playground' ? (
          <Playground
            prompts={prompts}
            selectedPrompt={selectedPrompt}
            onEditPrompt={(p) => {
              setEditingPrompt(p);
              setIsNewPromptOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Feed Column */}
            <PromptFeed
              prompts={filteredPrompts}
              selectedPromptId={selectedPrompt?.id || null}
              onSelectPrompt={(p) => setSelectedPromptId(p.id)}
              onToggleFavorite={handleToggleFavorite}
              onCopyPrompt={handleCopyPromptFeed}
              onSharePrompt={handleSharePrompt}
              onEditPrompt={(p) => {
                setEditingPrompt(p);
                setIsNewPromptOpen(true);
              }}
              onDuplicatePrompt={handleDuplicatePrompt}
              onDeletePrompt={(id) => handleDeletePrompt(id)}
              title={feedTitle}
              copiedId={copiedId}
              filterModel={filterModel}
              setFilterModel={setFilterModel}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              foldersList={folders}
            />

            {/* Details Column */}
            <PromptDetail
              prompt={selectedPrompt}
              onEdit={(p) => {
                setEditingPrompt(p);
                setIsNewPromptOpen(true);
              }}
              onDelete={handleDeletePrompt}
              onDuplicate={handleDuplicatePrompt}
              onToggleFavorite={handleToggleFavorite}
              onCopyText={handleCopyText}
              onSharePrompt={handleSharePrompt}
              onSavePrompt={handleSavePrompt}
            />
          </div>
        )}
      </main>

      {/* New/Edit Prompt Modal */}
      <PromptModal
        isOpen={isNewPromptOpen}
        onClose={() => {
          setIsNewPromptOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
        initialData={editingPrompt}
        folders={folders}
        categories={categories}
        projects={projects}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(name, role) => setUserProfile((prev) => ({ ...prev, name, role }))}
        onResetData={handleResetData}
        prompts={prompts}
        folders={folders}
        categories={categories}
        projects={projects}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Share Modal */}
      <ShareModal
        prompt={sharingPrompt}
        isOpen={!!sharingPrompt}
        onClose={() => setSharingPrompt(null)}
      />
    </div>
  );
}
