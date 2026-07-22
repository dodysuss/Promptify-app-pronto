'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  User,
  Key,
  Database,
  RefreshCw,
  Check,
  Globe,
  Zap,
  Server,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Folder,
  Layers,
  Briefcase,
  Plus,
  Trash2
} from 'lucide-react';
import { PromptItem } from '@/types/prompt';
import { safeParseJson } from '@/lib/security-helpers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: { name: string; role: string; avatarUrl: string };
  onUpdateProfile: (name: string, role: string) => void;
  onResetData: () => void;
  prompts?: PromptItem[];
  folders?: string[];
  categories?: string[];
  projects?: string[];
  onAddFolder?: (folder: string) => void;
  onDeleteFolder?: (folder: string) => void;
  onAddCategory?: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
  onAddProject?: (project: string) => void;
  onDeleteProject?: (project: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onResetData,
  prompts = [],
  folders = [],
  categories = [],
  projects = [],
  onAddFolder,
  onDeleteFolder,
  onAddCategory,
  onDeleteCategory,
  onAddProject,
  onDeleteProject,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'llms' | 'org' | 'neon' | 'appwrite'>('llms');
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New item input states
  const [newFolderInput, setNewFolderInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newProjectInput, setNewProjectInput] = useState('');

  // API Keys state with lazy initializers
  const [openRouterKey, setOpenRouterKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = window.sessionStorage.getItem('promptify_api_keys');
      return stored ? safeParseJson(stored)?.openRouter || '' : '';
    } catch { return ''; }
  });

  const [openAiKey, setOpenAiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = window.sessionStorage.getItem('promptify_api_keys');
      return stored ? safeParseJson(stored)?.openAi || '' : '';
    } catch { return ''; }
  });

  const [anthropicKey, setAnthropicKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = window.sessionStorage.getItem('promptify_api_keys');
      return stored ? safeParseJson(stored)?.anthropic || '' : '';
    } catch { return ''; }
  });

  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = window.sessionStorage.getItem('promptify_api_keys');
      return stored ? safeParseJson(stored)?.gemini || '' : '';
    } catch { return ''; }
  });

  // Password visibility state
  const [showKeys, setShowKeys] = useState<{ [k: string]: boolean }>({});

  // Neon DB Connection State
  const [neonConnString, setNeonConnString] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('promptify_neon_url') || '';
  });
  const [neonTesting, setNeonTesting] = useState(false);
  const [neonStatus, setNeonStatus] = useState<{
    success?: boolean;
    message?: string;
    version?: string;
    latencyMs?: number;
    promptsInDb?: number;
  } | null>(null);

  const [neonSyncing, setNeonSyncing] = useState(false);
  const [neonSyncMsg, setNeonSyncMsg] = useState<string | null>(null);

  // Appwrite Backend State
  const [appwriteEndpoint, setAppwriteEndpoint] = useState(() => {
    if (typeof window === 'undefined') return 'https://cloud.appwrite.io/v1';
    try {
      const saved = window.sessionStorage.getItem('promptify_appwrite_config');
      return saved ? safeParseJson(saved)?.endpoint || 'https://cloud.appwrite.io/v1' : 'https://cloud.appwrite.io/v1';
    } catch { return 'https://cloud.appwrite.io/v1'; }
  });
  const [appwriteProjectId, setAppwriteProjectId] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const saved = window.sessionStorage.getItem('promptify_appwrite_config');
      return saved ? safeParseJson(saved)?.projectId || '' : '';
    } catch { return ''; }
  });
  const [appwriteDatabaseId, setAppwriteDatabaseId] = useState(() => {
    if (typeof window === 'undefined') return 'promptify_db';
    try {
      const saved = window.sessionStorage.getItem('promptify_appwrite_config');
      return saved ? safeParseJson(saved)?.databaseId || 'promptify_db' : 'promptify_db';
    } catch { return 'promptify_db'; }
  });
  const [appwriteApiKey, setAppwriteApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const saved = window.sessionStorage.getItem('promptify_appwrite_config');
      return saved ? safeParseJson(saved)?.apiKey || '' : '';
    } catch { return ''; }
  });

  const [appwriteTesting, setAppwriteTesting] = useState(false);
  const [appwriteStatus, setAppwriteStatus] = useState<{
    success?: boolean;
    message?: string;
    version?: string;
    latencyMs?: number;
  } | null>(null);
  const [appwriteSyncing, setAppwriteSyncing] = useState(false);
  const [appwriteSyncMsg, setAppwriteSyncMsg] = useState<string | null>(null);

  const [appwriteProvisioning, setAppwriteProvisioning] = useState(false);
  const [appwriteProvisionResult, setAppwriteProvisionResult] = useState<{
    success?: boolean;
    message?: string;
    createdItems?: string[];
  } | null>(null);

  // Appwrite Authentication State
  const [appwriteAuthMode, setAppwriteAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [appwriteUser, setAppwriteUser] = useState<{ id: string; email: string; name?: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const u = window.sessionStorage.getItem('promptify_appwrite_user');
      return u ? safeParseJson(u) : null;
    } catch {
      return null;
    }
  });

  if (!isOpen) return null;

  const toggleShowKey = (keyName: string) => {
    setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, role);

    // Save API keys to localStorage
    const keysObj = {
      openRouter: openRouterKey,
      openAi: openAiKey,
      anthropic: anthropicKey,
      gemini: geminiKey,
    };
    window.sessionStorage.setItem('promptify_api_keys', JSON.stringify(keysObj));

    // Save Neon Connection string
    window.sessionStorage.setItem('promptify_neon_url', neonConnString);

    // Save Appwrite Config
    const appwriteObj = {
      endpoint: appwriteEndpoint,
      projectId: appwriteProjectId,
      databaseId: appwriteDatabaseId,
      apiKey: appwriteApiKey,
    };
    window.sessionStorage.setItem('promptify_appwrite_config', JSON.stringify(appwriteObj));

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestAppwrite = async () => {
    if (!appwriteProjectId.trim()) {
      alert('Por favor, informe o Project ID do Appwrite.');
      return;
    }

    setAppwriteTesting(true);
    setAppwriteStatus(null);

    try {
      const res = await fetch('/api/db/appwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          databaseId: appwriteDatabaseId,
          apiKey: appwriteApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAppwriteStatus({ success: false, message: data.error || 'Falha na conexão com Appwrite.' });
      } else {
        setAppwriteStatus({
          success: true,
          message: data.message,
          version: data.version,
          latencyMs: data.latencyMs,
        });
      }
    } catch (err: any) {
      setAppwriteStatus({ success: false, message: err?.message || 'Erro ao conectar ao Appwrite.' });
    } finally {
      setAppwriteTesting(false);
    }
  };

  const handleSyncPromptsToAppwrite = async () => {
    if (!appwriteProjectId.trim()) {
      alert('Informe o Project ID do Appwrite primeiro.');
      return;
    }

    setAppwriteSyncing(true);
    setAppwriteSyncMsg(null);

    try {
      const res = await fetch('/api/db/appwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          databaseId: appwriteDatabaseId,
          apiKey: appwriteApiKey,
          prompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAppwriteSyncMsg(`Erro: ${data.error || 'Falha ao sincronizar'}`);
      } else {
        setAppwriteSyncMsg(data.message);
      }
    } catch (err: any) {
      setAppwriteSyncMsg(`Erro: ${err?.message || 'Falha na sincronização'}`);
    } finally {
      setAppwriteSyncing(false);
    }
  };

  const handleProvisionAppwrite = async () => {
    if (!appwriteProjectId.trim()) {
      alert('Por favor, informe o Project ID do Appwrite.');
      return;
    }

    setAppwriteProvisioning(true);
    setAppwriteProvisionResult(null);

    try {
      const res = await fetch('/api/db/appwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provision',
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          databaseId: appwriteDatabaseId,
          apiKey: appwriteApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAppwriteProvisionResult({
          success: false,
          message: data.error || 'Falha ao criar tabelas no Appwrite.',
        });
      } else {
        setAppwriteProvisionResult({
          success: true,
          message: data.message,
          createdItems: data.createdItems,
        });
      }
    } catch (err: any) {
      setAppwriteProvisionResult({
        success: false,
        message: err?.message || 'Erro ao comunicar com Appwrite.',
      });
    } finally {
      setAppwriteProvisioning(false);
    }
  };

  const handleAppwriteAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appwriteProjectId.trim()) {
      alert('Por favor, informe o Project ID do Appwrite.');
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Preencha o e-mail e a senha.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    try {
      const res = await fetch('/api/db/appwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: appwriteAuthMode === 'register' ? 'auth-register' : 'auth-login',
          endpoint: appwriteEndpoint,
          projectId: appwriteProjectId,
          email: authEmail,
          password: authPassword,
          name: authName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Falha ao autenticar com Appwrite.');
      } else {
        setAuthSuccessMsg(data.message);
        if (data.user) {
          setAppwriteUser(data.user);
          window.sessionStorage.setItem('promptify_appwrite_user', JSON.stringify(data.user));
        }
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erro ao conectar ao Appwrite.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAppwriteLogout = () => {
    setAppwriteUser(null);
    window.sessionStorage.removeItem('promptify_appwrite_user');
    setAuthSuccessMsg('Você saiu da sua conta Appwrite.');
  };

  const handleTestNeon = async () => {
    if (!neonConnString.trim()) {
      alert('Por favor, informe a URL de conexão do Neon.');
      return;
    }

    setNeonTesting(true);
    setNeonStatus(null);

    try {
      const res = await fetch('/api/db/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          connectionString: neonConnString.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNeonStatus({ success: false, message: data.error || 'Falha de conexão com Neon.' });
      } else {
        setNeonStatus({
          success: true,
          message: data.message,
          version: data.version,
          latencyMs: data.latencyMs,
          promptsInDb: data.promptsInDb,
        });
        window.sessionStorage.setItem('promptify_neon_url', neonConnString.trim());
      }
    } catch (err: any) {
      setNeonStatus({ success: false, message: err?.message || 'Erro ao testar conexão.' });
    } finally {
      setNeonTesting(false);
    }
  };

  const handleSyncPromptsToNeon = async () => {
    if (!neonConnString.trim()) {
      alert('Por favor, informe e teste a URL de Conexão Neon primeiro.');
      return;
    }

    setNeonSyncing(true);
    setNeonSyncMsg(null);

    try {
      const res = await fetch('/api/db/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          connectionString: neonConnString.trim(),
          prompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNeonSyncMsg(`Erro: ${data.error || 'Falha ao sincronizar'}`);
      } else {
        setNeonSyncMsg(data.message);
        if (neonStatus?.success) {
          setNeonStatus((prev) => prev ? { ...prev, promptsInDb: prompts.length } : null);
        }
      }
    } catch (err: any) {
      setNeonSyncMsg(`Erro: ${err?.message || 'Falha na sincronização.'}`);
    } finally {
      setNeonSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-on-surface">Configurações & Conexões</h2>
              <p className="text-xs text-on-surface-variant">
                Gerencie credenciais de LLMs, banco de dados Neon e perfil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant bg-surface-container-low/50 px-6 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('llms')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'llms'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Key className="w-4 h-4" /> Provedores & LLMs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('neon')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'neon'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Database className="w-4 h-4" /> Neon DB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appwrite')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'appwrite'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Server className="w-4 h-4 text-pink-600" /> Appwrite Backend
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('org')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'org'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Folder className="w-4 h-4 text-purple-600" /> Organização
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" /> Perfil & Geral
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs bg-surface-bright">
          {/* TAB 1: LLMs & API KEYS */}
          {activeTab === 'llms' && (
            <div className="space-y-5">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">Chaves de API Multi-LLM</h4>
                    <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                      Adicione suas chaves de API para executar prompts com OpenRouter (Claude, DeepSeek, Llama), OpenAI, Anthropic ou Gemini.
                    </p>
                  </div>
                </div>
              </div>

              {/* OpenRouter Key */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-on-surface flex items-center gap-2 text-xs">
                    <Globe className="w-4 h-4 text-purple-600" />
                    OpenRouter API Key
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">
                      Recomendado
                    </span>
                  </label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Obter Chave OpenRouter ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.openRouter ? 'text' : 'password'}
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 pr-10 text-on-surface font-mono outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openRouter')}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    {showKeys.openRouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-outline">
                  Dá acesso unificado aos modelos Claude 3.5 Sonnet, DeepSeek R1, GPT-4o, Llama 3.3 e muito mais.
                </p>
              </div>

              {/* OpenAI Key */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-on-surface flex items-center gap-2 text-xs">
                    <Key className="w-4 h-4 text-emerald-600" /> OpenAI API Key
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Obter OpenAI Key ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.openAi ? 'text' : 'password'}
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    placeholder="sk-proj-xxxxxxxxxxxxxxxx"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 pr-10 text-on-surface font-mono outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openAi')}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    {showKeys.openAi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anthropic Key */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-on-surface flex items-center gap-2 text-xs">
                    <Key className="w-4 h-4 text-amber-600" /> Anthropic Claude API Key
                  </label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Obter Claude Key ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-api03-xxxxxxxxxxxxxxxx"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 pr-10 text-on-surface font-mono outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('anthropic')}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Custom Gemini Key */}
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <label className="font-bold text-on-surface flex items-center gap-2 text-xs">
                  <Key className="w-4 h-4 text-blue-600" /> Google Gemini Custom API Key (Opcional)
                </label>
                <div className="relative">
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy-xxxxxxxxxxxxxxxx"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 pr-10 text-on-surface font-mono outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                  >
                    {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEON DATABASE */}
          {activeTab === 'neon' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-on-surface">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Conecte o Banco de Dados Neon (Serverless PostgreSQL)</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Conecte sua conta do Neon.tech para salvar, auditar e sincronizar todos os seus prompts em uma tabela PostgreSQL em nuvem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-on-surface flex items-center gap-2 text-xs">
                    Neon Connection String (URL de Conexão)
                  </label>
                  <a
                    href="https://console.neon.tech"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Dashboard Neon.tech ↗
                  </a>
                </div>
                <input
                  type="text"
                  value={neonConnString}
                  onChange={(e) => setNeonConnString(e.target.value)}
                  placeholder="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface font-mono outline-none focus:border-primary text-xs"
                />

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestNeon}
                    disabled={neonTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {neonTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Testando Conexão...
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4" /> Testar Conexão Neon
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncPromptsToNeon}
                    disabled={neonSyncing || !neonConnString}
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold flex items-center gap-2 border border-outline-variant/60 transition-all disabled:opacity-50"
                  >
                    {neonSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-primary" /> Sincronizar Prompts ({prompts.length})
                      </>
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                {neonStatus && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 mt-3 ${
                      neonStatus.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-error-container/40 border-error/30 text-error'
                    }`}
                  >
                    {neonStatus.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-xs">{neonStatus.message}</p>
                      {neonStatus.success && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-90 font-mono">
                          <span>Latência: {neonStatus.latencyMs}ms</span>
                          {neonStatus.promptsInDb !== undefined && (
                            <span>Prompts no Neon DB: {neonStatus.promptsInDb}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sync Message */}
                {neonSyncMsg && (
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 text-xs text-on-surface font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {neonSyncMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPWRITE BACKEND */}
          {activeTab === 'appwrite' && (
            <div className="space-y-5">
              <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-on-surface">
                <div className="flex items-start gap-3">
                  <Server className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Integração com Backend Appwrite</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Conecte sua instância do Appwrite (Databases, User Auth e RLS) para gerenciar dados e sessões de usuários diretamente do Promptify.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-4">
                {/* Appwrite Endpoint */}
                <div>
                  <label className="block font-bold text-on-surface text-xs mb-1">
                    Appwrite Endpoint
                  </label>
                  <input
                    type="text"
                    value={appwriteEndpoint}
                    onChange={(e) => setAppwriteEndpoint(e.target.value)}
                    placeholder="https://cloud.appwrite.io/v1"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface font-mono outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* Project ID */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-on-surface text-xs">
                      Project ID
                    </label>
                    <a
                      href="https://cloud.appwrite.io"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-pink-600 hover:underline font-semibold"
                    >
                      Console Appwrite ↗
                    </a>
                  </div>
                  <input
                    type="text"
                    value={appwriteProjectId}
                    onChange={(e) => setAppwriteProjectId(e.target.value)}
                    placeholder="Ex: 65a39f10c002..."
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface font-mono outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* Database ID */}
                <div>
                  <label className="block font-bold text-on-surface text-xs mb-1">
                    Database ID (Coleções de Prompts)
                  </label>
                  <input
                    type="text"
                    value={appwriteDatabaseId}
                    onChange={(e) => setAppwriteDatabaseId(e.target.value)}
                    placeholder="promptify_db"
                    className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-on-surface font-mono outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* API Key (Optional) */}
                <div>
                  <label className="block font-bold text-on-surface text-xs mb-1">
                    API Key / Secret Key (Servidor - Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.appwrite ? 'text' : 'password'}
                      value={appwriteApiKey}
                      onChange={(e) => setAppwriteApiKey(e.target.value)}
                      placeholder="Chave de API com permissões de leitura/escrita"
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 pr-10 text-on-surface font-mono outline-none focus:border-primary text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('appwrite')}
                      className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface"
                    >
                      {showKeys.appwrite ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* APPWRITE USER AUTHENTICATION CARD */}
                <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
                    <span className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <User className="w-4 h-4 text-pink-600" /> Autenticação de Usuário (Appwrite Auth)
                    </span>
                    {appwriteUser && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Conectado
                      </span>
                    )}
                  </div>

                  {appwriteUser ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/60">
                      <div>
                        <p className="font-bold text-xs text-on-surface">
                          {appwriteUser.name || 'Usuário Appwrite'}
                        </p>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          {appwriteUser.email} &bull; <span className="opacity-70">ID: {appwriteUser.id}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAppwriteLogout}
                        className="px-3 py-1.5 bg-error-container/20 text-error hover:bg-error-container/40 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        Sair da Conta
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAppwriteAuth} className="space-y-3">
                      {/* Mode Toggle */}
                      <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/60">
                        <button
                          type="button"
                          onClick={() => {
                            setAppwriteAuthMode('login');
                            setAuthError(null);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            appwriteAuthMode === 'login'
                              ? 'bg-surface-container-lowest text-pink-600 shadow-xs'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Entrar (Login)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAppwriteAuthMode('register');
                            setAuthError(null);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            appwriteAuthMode === 'register'
                              ? 'bg-surface-container-lowest text-pink-600 shadow-xs'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          Cadastrar-se (Criar Conta)
                        </button>
                      </div>

                      {appwriteAuthMode === 'register' && (
                        <div>
                          <label className="block text-[11px] font-bold text-on-surface mb-1">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Seu nome"
                            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-pink-600"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-on-surface mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-pink-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-on-surface mb-1">
                            Senha
                          </label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-pink-600"
                          />
                        </div>
                      </div>

                      {authError && (
                        <p className="text-xs text-error font-semibold bg-error-container/20 p-2 rounded-xl">
                          {authError}
                        </p>
                      )}

                      {authSuccessMsg && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold bg-emerald-500/10 p-2 rounded-xl">
                          {authSuccessMsg}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                          </>
                        ) : appwriteAuthMode === 'login' ? (
                          'Entrar na Conta Appwrite'
                        ) : (
                          'Criar Conta no Appwrite'
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestAppwrite}
                    disabled={appwriteTesting}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 text-xs"
                  >
                    {appwriteTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Testando Conexão Appwrite...
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4" /> Testar Conexão
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleProvisionAppwrite}
                    disabled={appwriteProvisioning || !appwriteProjectId}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 text-xs"
                  >
                    {appwriteProvisioning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Criando Tabelas...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" /> Criar Banco & Tabelas
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncPromptsToAppwrite}
                    disabled={appwriteSyncing || !appwriteProjectId}
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-bold flex items-center gap-2 border border-outline-variant/60 transition-all disabled:opacity-50 text-xs"
                  >
                    {appwriteSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-pink-600" /> Sincronizar ({prompts.length})
                      </>
                    )}
                  </button>
                </div>

                {/* Provision Result Panel */}
                {appwriteProvisionResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 mt-3 ${
                      appwriteProvisionResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-error-container/40 border-error/30 text-error'
                    }`}
                  >
                    {appwriteProvisionResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1.5 flex-1">
                      <p className="font-bold text-xs">{appwriteProvisionResult.message}</p>
                      {appwriteProvisionResult.createdItems && appwriteProvisionResult.createdItems.length > 0 && (
                        <div className="p-2.5 bg-surface-container-lowest/80 rounded-lg border border-outline-variant/30 font-mono text-[11px] text-on-surface space-y-1">
                          <p className="font-bold text-[10px] uppercase tracking-wider text-outline">Tabelas e Coleções Criadas:</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-xs">
                            {appwriteProvisionResult.createdItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                {appwriteStatus && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 mt-3 ${
                      appwriteStatus.success
                        ? 'bg-pink-500/10 border-pink-500/30 text-pink-900 dark:text-pink-200'
                        : 'bg-error-container/40 border-error/30 text-error'
                    }`}
                  >
                    {appwriteStatus.success ? (
                      <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-xs">{appwriteStatus.message}</p>
                      {appwriteStatus.success && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-90 font-mono">
                          <span>Latência: {appwriteStatus.latencyMs}ms</span>
                          <span>Versão: {appwriteStatus.version}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sync Message */}
                {appwriteSyncMsg && (
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 text-xs text-on-surface font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-pink-600" />
                    {appwriteSyncMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ORGANIZAÇÃO (PASTAS, CATEGORIAS, PROJETOS) */}
          {activeTab === 'org' && (
            <div className="space-y-6">
              {/* Pastas */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <Folder className="w-4 h-4 text-purple-600" /> Pastas ({folders.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova pasta..."
                    value={newFolderInput}
                    onChange={(e) => setNewFolderInput(e.target.value)}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFolderInput.trim() && onAddFolder) {
                        onAddFolder(newFolderInput.trim());
                        setNewFolderInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-1 hover:opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {folders.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs font-medium text-on-surface"
                    >
                      <span>{f}</span>
                      {onDeleteFolder && (
                        <button
                          type="button"
                          onClick={() => onDeleteFolder(f)}
                          className="text-outline hover:text-error transition-colors p-0.5 rounded"
                          title={`Excluir pasta ${f}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" /> Categorias ({categories.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryInput.trim() && onAddCategory) {
                        onAddCategory(newCategoryInput.trim());
                        setNewCategoryInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-1 hover:opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.map((c) => (
                    <div
                      key={c}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs font-medium text-on-surface"
                    >
                      <span>{c}</span>
                      {onDeleteCategory && (
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(c)}
                          className="text-outline hover:text-error transition-colors p-0.5 rounded"
                          title={`Excluir categoria ${c}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projetos */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" /> Projetos ({projects.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Novo projeto..."
                    value={newProjectInput}
                    onChange={(e) => setNewProjectInput(e.target.value)}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newProjectInput.trim() && onAddProject) {
                        onAddProject(newProjectInput.trim());
                        setNewProjectInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-1 hover:opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {projects.map((pr) => (
                    <div
                      key={pr}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs font-medium text-on-surface"
                    >
                      <span>{pr}</span>
                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(pr)}
                          className="text-outline hover:text-error transition-colors p-0.5 rounded"
                          title={`Excluir projeto ${pr}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER PROFILE & GENERAL */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Perfil do Usuário
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-outline font-semibold mb-1">Nome de Exibição</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-outline font-semibold mb-1">Cargo / Plano</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/40">
                <h3 className="font-bold text-sm text-on-surface mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Redefinir Dados
                </h3>
                <p className="text-on-surface-variant mb-3">
                  Restaure a coleção inicial de prompts fornecida por padrão no espaço de trabalho.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja restaurar os prompts iniciais do espaço de trabalho? Todos os seus dados serão redefinidos.')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error-container/40 transition-colors font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restaurar Prompts Padrão
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-outline-variant flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-primary text-on-primary font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Configurações Salvas!
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

