import { JournalEntry, Mood, PanoramaData } from '../types';
import { MOODS } from '../constants';

export const analyticsService = {
  calculatePanorama: (history: JournalEntry[]): PanoramaData => {
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(item => item.id >= fiveDaysAgo);

    if (recentHistory.length === 0) return { distribution: [], keywords: [], highlight: null, totalCount: 0 };

    const counts: Record<string, number> = {};
    const words: Record<string, number> = {};
    const stopWords = [
      // Artigos e Preposições
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para', 'com', 'sem', 'sob', 'sobre', 'até', 'após', 'desde', 'entre',
      // Pronomes
      'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo', 'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 'quem', 'que', 'qual', 'quais', 'algo', 'alguém', 'algum', 'alguma', 'alguns', 'algumas', 'nada', 'ninguém', 'nenhum', 'nenhuma', 'tudo', 'todo', 'toda', 'todos', 'todas', 'cada', 'qualquer',
      // Conjunções
      'e', 'mas', 'porém', 'contudo', 'todavia', 'entretanto', 'ou', 'logo', 'pois', 'porque', 'como', 'quando', 'onde', 'embora', 'se', 'caso',
      // Verbos Comuns (Auxiliares e Estado)
      'ser', 'sou', 'é', 'somos', 'são', 'era', 'eram', 'fui', 'foi', 'fomos', 'foram', 'estar', 'estou', 'está', 'estamos', 'estão', 'estava', 'estavam', 'estive', 'esteve', 'ter', 'tenho', 'tem', 'temos', 'têm', 'tinha', 'tinham', 'tive', 'teve', 'tiveram', 'haver', 'há', 'fazer', 'faço', 'faz', 'fazemos', 'fazem', 'fiz', 'fez', 'fizeram', 'ir', 'vou', 'vai', 'vamos', 'vão', 'ver', 'vi', 'viu', 'vimos', 'viram', 'vir', 'venho', 'vem', 'vêm', 'poder', 'posso', 'pode', 'podemos', 'podem', 'querer', 'quero', 'quer', 'queremos', 'querem', 'saber', 'sei', 'sabe', 'sabemos', 'sabem', 'sentir', 'sinto', 'sente', 'sentimos', 'sentem', 'achar', 'acho', 'acha', 'achamos', 'acham', 'andar', 'ando', 'anda', 'andamos', 'andam', 'parecer', 'parece', 'parecem',
      // Advérbios e Intensificadores
      'muito', 'pouco', 'bastante', 'mais', 'menos', 'tão', 'tanto', 'bem', 'mal', 'melhor', 'pior', 'sim', 'não', 'talvez', 'sempre', 'nunca', 'jamais', 'ainda', 'já', 'agora', 'hoje', 'ontem', 'amanhã', 'cedo', 'tarde', 'logo', 'depois', 'antes', 'aqui', 'ali', 'lá', 'perto', 'longe', 'dentro', 'fora',
      // Outras comuns
      'coisa', 'coisas', 'gente', 'pessoa', 'vez', 'vezes', 'dia', 'dias', 'estava', 'estive', 'estiveram', 'estamos'
    ];

    const customMoods: Record<string, number> = {};
    recentHistory.forEach(item => {
      if (item.mood === 'outro' && item.customMoodLabel) {
        customMoods[item.customMoodLabel] = (customMoods[item.customMoodLabel] || 0) + 1;
      } else {
        counts[item.mood] = (counts[item.mood] || 0) + 1;
      }
      const cleanText = item.text.toLowerCase().replace(/[.,!?;:()]/g, "");
      cleanText.split(/\s+/).forEach(w => {
        if (w.length > 3 && !stopWords.includes(w)) {
          words[w] = (words[w] || 0) + 1;
        }
      });
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

    const keywords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([text, count]) => ({ text, count }));

    return { 
      distribution, 
      keywords, 
      highlight: keywords[0]?.text || null,
      totalCount: recentHistory.length
    };
  }
};
