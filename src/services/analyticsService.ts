import { JournalEntry, Mood, PanoramaData } from '../types';
import { MOODS } from '../constants';

export const analyticsService = {
  calculatePanorama: (history: JournalEntry[]): PanoramaData => {
    const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(item => item.id >= tenDaysAgo);

    if (recentHistory.length === 0) return { distribution: [], totalCount: 0 };

    const counts: Record<string, number> = {};
    const customMoods: Record<string, number> = {};

    recentHistory.forEach(item => {
      if (item.mood === 'outro' && item.customMoodLabel) {
        customMoods[item.customMoodLabel] = (customMoods[item.customMoodLabel] || 0) + 1;
      } else {
        counts[item.mood] = (counts[item.mood] || 0) + 1;
      }
    });

    const distribution = MOODS.filter(m => m.id !== 'outro').map(m => ({
      ...m,
      count: counts[m.id] || 0,
      percent: Math.round(((counts[m.id] || 0) / recentHistory.length) * 100)
    })).filter(m => m.count > 0);

    // Add custom moods to distribution
    Object.entries(customMoods).forEach(([label, count]) => {
      const otherMoodTemplate = MOODS.find(m => m.id === 'outro')!;
      distribution.push({
        ...otherMoodTemplate,
        id: `custom-${label}`,
        label: label,
        count: count,
        percent: Math.round((count / recentHistory.length) * 100)
      });
    });

    return { 
      distribution, 
      totalCount: recentHistory.length
    };
  }
};
