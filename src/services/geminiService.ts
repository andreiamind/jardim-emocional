import { GoogleGenAI, Type } from "@google/genai";
import { WISDOM_SEEDS } from '../constants';
import { JournalEntry } from '../types';

export const geminiService = {
  generateDailyInsight: async (history: JournalEntry[], usedSeedIndices: number[]): Promise<{ insight: string; newUsedSeeds: number[] }> => {
    const today = new Date().toLocaleDateString('pt-PT');
    let entriesToAnalyze = history.filter(e => e.date === today);
    
    // If no entries today, use the last 3 entries from history as context
    if (entriesToAnalyze.length === 0) {
      entriesToAnalyze = history.slice(0, 3);
    }

    if (entriesToAnalyze.length === 0) throw new Error("Nenhuma semente encontrada no jardim.");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const context = entriesToAnalyze.map(e => `Humor: ${e.mood}, Reflexão: ${e.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model,
        contents: `Analise as reflexões recentes e selecione o índice da frase mais apropriada da nossa biblioteca de sabedoria.
        
        BIBLIOTECA:
        ${WISDOM_SEEDS.map((s, i) => `${i}: ${s}`).join('\n')}
        
        REFLEXÕES:
        ${context}
        
        REGRAS CRÍTICAS:
        1. NÃO escolha nenhum destes índices (já usados recentemente): [${usedSeedIndices.join(', ')}]
        2. Escolha uma frase que se conecte ao estado emocional atual.
        3. Se o humor for negativo, escolha algo acolhedor. Se for positivo, algo inspirador.
        4. Fator de variação: ${Math.random()}`,
        config: {
          temperature: 1.0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              selectedIndex: {
                type: Type.INTEGER,
                description: "O índice da frase selecionada na biblioteca."
              }
            },
            required: ["selectedIndex"]
          }
        }
      });

      let text = response.text || '';
      // Clean potential markdown blocks if they exist
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      
      const result = JSON.parse(text || '{"selectedIndex": 0}');
      let index = Math.min(Math.max(0, result.selectedIndex), WISDOM_SEEDS.length - 1);
      
      // Double check client-side to be absolutely sure no repetition occurs
      if (usedSeedIndices.includes(index)) {
        const availableIndices = WISDOM_SEEDS.map((_, i) => i).filter(i => !usedSeedIndices.includes(i));
        if (availableIndices.length > 0) {
          index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }
      }

      const insight = WISDOM_SEEDS[index];
      const newUsedSeeds = [index, ...usedSeedIndices].slice(0, 10);

      return { insight, newUsedSeeds };
    } catch (error) {
      console.error("Erro na colheita (Gemini):", error);
      // Fallback: Pick a random unused seed
      const availableIndices = WISDOM_SEEDS.map((_, i) => i).filter(i => !usedSeedIndices.includes(i));
      const fallbackIndex = availableIndices.length > 0 
        ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
        : Math.floor(Math.random() * WISDOM_SEEDS.length);
      
      return { 
        insight: WISDOM_SEEDS[fallbackIndex], 
        newUsedSeeds: [fallbackIndex, ...usedSeedIndices].slice(0, 10) 
      };
    }
  }
};
