const MAX_TEXT_LENGTH = 12000;
const MAX_STORAGE_PAYLOAD_BYTES = 1024 * 1024;

export function sanitizeText(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function normalizeApiKey(value) {
  return sanitizeText(value, 500).trim();
}

export function normalizeModel(value) {
  return sanitizeText(value, 200).trim();
}

export function normalizeConnectionString(value) {
  return sanitizeText(value, 1000).trim();
}

export function isAllowedProvider(provider) {
  return ['gemini', 'openai', 'anthropic', 'openrouter'].includes(provider);
}

export function isSafeHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:') {
      return true;
    }

    return parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function isValidPostgresUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return /^(postgres(?:ql)?:\/\/)/i.test(trimmed);
}

export function safeParseJson(value, fallback = null) {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function safeStorageGetString(key, fallback = '') {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeStorageSetString(key, value) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const serialized = typeof value === 'string' ? value : String(value);
    if (serialized.length > MAX_STORAGE_PAYLOAD_BYTES) {
      return false;
    }

    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function safeStorageRemoveItem(key) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
