import { JournalEntry } from '../types';

const STORAGE_KEY = 'oraculo_data';
const ONBOARDING_KEY = 'oraculo_onboarding_seen';
const USED_SEEDS_KEY = 'oraculo_used_seeds';

export const storageService = {
  getHistory: (): JournalEntry[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar histórico", e);
      return [];
    }
  },

  saveHistory: (history: JournalEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  getOnboardingSeen: (): boolean => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  },

  setOnboardingSeen: () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  },

  getUsedSeeds: (): number[] => {
    const saved = localStorage.getItem(USED_SEEDS_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao carregar sementes usadas", e);
      return [];
    }
  },

  saveUsedSeeds: (seeds: number[]) => {
    localStorage.setItem(USED_SEEDS_KEY, JSON.stringify(seeds));
  }
};
