/**
 * useSettings — Chat settings (theme, font size, etc.). Syncs with website when possible.
 */

import { useState, useCallback, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/chat/backendChatApi';

export interface ChatSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'S' | 'M' | 'L';
  chatSound: boolean;
  defaultMode: 'platform' | 'global';
  showTypingIndicator: boolean;
  showTimestamps: boolean;
  autoSuggestQuestions: boolean;
  notificationBadge: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'auto',
  language: 'auto',
  fontSize: 'M',
  chatSound: true,
  defaultMode: 'platform',
  showTypingIndicator: true,
  showTimestamps: true,
  autoSuggestQuestions: true,
  notificationBadge: true,
};

const STORAGE_KEY = 'aol_chat_settings';

function loadLocal(): ChatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ChatSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveLocal(s: ChatSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function syncFromWebsite(): Partial<ChatSettings> {
  const root = document.documentElement;
  const themeAttr = root.getAttribute('data-theme');
  const lang = root.lang || 'en';
  const out: Partial<ChatSettings> = {};
  if (themeAttr === 'dark' || themeAttr === 'light') out.theme = themeAttr;
  if (lang) out.language = lang;
  const win = typeof window !== 'undefined' ? (window as unknown as { websiteSettings?: Record<string, unknown> }) : null;
  if (win?.websiteSettings && typeof win.websiteSettings === 'object') {
    const ws = win.websiteSettings;
    if (typeof ws.theme === 'string') out.theme = ws.theme as 'light' | 'dark' | 'auto';
    if (typeof ws.language === 'string') out.language = ws.language;
  }
  return out;
}

export function useSettings() {
  const [settings, setSettingsState] = useState<ChatSettings>(loadLocal);

  useEffect(() => {
    const fromWeb = syncFromWebsite();
    if (Object.keys(fromWeb).length > 0) {
      setSettingsState((prev) => {
        const next = { ...prev, ...fromWeb };
        saveLocal(next);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const fromWeb = syncFromWebsite();
      if (Object.keys(fromWeb).length > 0) {
        setSettingsState((prev) => {
          const next = { ...prev, ...fromWeb };
          saveLocal(next);
          return next;
        });
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
    return () => observer.disconnect();
  }, []);

  const updateSetting = useCallback(<K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: value };
      saveLocal(next);
      saveSettings(next as unknown as Record<string, unknown>).catch(() => {});
      return next;
    });
  }, []);

  const loadRemote = useCallback(async () => {
    const { preferences } = await getSettings();
    if (preferences && typeof preferences === 'object') {
      setSettingsState((prev) => {
        const next = { ...DEFAULT_SETTINGS, ...(preferences as Partial<ChatSettings>) };
        saveLocal(next);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  return { settings, updateSetting, syncFromWebsite: () => setSettingsState((prev) => ({ ...prev, ...syncFromWebsite() })) };
}

export const useChatSettings = useSettings;
