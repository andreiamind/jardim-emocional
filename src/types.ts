import { LucideIcon } from 'lucide-react';

export interface Mood {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  text: string;
  light: string;
}

export interface JournalEntry {
  id: number;
  mood: string;
  customMoodLabel?: string;
  prompt: string;
  text: string;
  date: string;
}

export type ViewType = 'oracle' | 'history';
export type StepType = 'mood' | 'loading' | 'write' | 'pre-write';

export interface MasteryTitle {
  name: string;
  threshold: number;
  icon: LucideIcon;
}

export interface PanoramaData {
  distribution: (Mood & { count: number; percent: number })[];
  keywords: { text: string; count: number }[];
  highlight: string | null;
  totalCount: number;
}
