/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, MessageCircle, LayoutDashboard, 
  PieChart, Tag, Loader2, ChevronRight,
  Smile, ShieldAlert, Sparkles, Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { MOODS, PROMPTS, JournalEntry, Mood } from './constants';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function App() {
  const [view, setView] = useState<'oracle' | 'history'>('oracle');
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [step, setStep] = useState<'mood' | 'loading' | 'write'>('mood');
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [lastIndices, setLastIndices] = useState<Record<string, number>>({});
  const [entry, setEntry] = useState("");
  const [history, setHistory] = useState<JournalEntry[]>([]);
  
  // Daily Harvest States
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('oraculo_data');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } 
      catch (e) { console.error("Erro ao carregar histórico", e); }
    }

    const seenOnboarding = localStorage.getItem('oraculo_onboarding_seen');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const generateDailyInsight = async () => {
    const today = new Date().toLocaleDateString('pt-PT');
    const todaysEntries = history.filter(e => e.date === today);
    
    if (todaysEntries.length === 0) return;

    setIsHarvesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3.1-pro-preview";
      
      const context = todaysEntries.map(e => `Humor: ${e.mood}, Reflexão: ${e.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model,
        contents: `Como Oráculo da Intuição, analise estas reflexões do dia e escreva uma "Colheita do Dia" para o usuário.
        
        REQUISITOS:
        - Escreva uma única frase COMPLETA, profunda e poética.
        - A frase deve ter um tom de sabedoria ancestral, acolhedora e minimalista.
        - Fale diretamente com o usuário (você).
        - NÃO use introduções, aspas ou explicações. Vá direto à essência.
        
        REFLEXÕES DO DIA:
        ${context}`,
        config: {
          temperature: 0.7,
        }
      });

      setDailyInsight(response.text?.trim() || "O silêncio de hoje guarda as sementes de amanhã. Respire e confie no processo.");
    } catch (error) {
      console.error("Erro na colheita:", error);
      setDailyInsight("A sua intuição está em repouso. Às vezes, o melhor insight é o próprio silêncio.");
    } finally {
      setIsHarvesting(false);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('oraculo_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const onboardingSlides = [
    {
      title: "O Espelho",
      text: "Não é apenas um chat, mas um espelho. O app não dá respostas prontas; ele faz as perguntas certas para que você encontre as suas respostas.",
      icon: <Smile className="text-indigo-500" size={48} />
    },
    {
      title: "O Panorama",
      text: "Cada reflexão é uma semente. Com o tempo, verá o seu 'Jardim' transformar-se num panorama real da sua paisagem interior.",
      icon: <PieChart className="text-emerald-500" size={48} />
    },
    {
      title: "Privacidade",
      text: "Tudo o que escreve fica guardado no seu dispositivo, de forma privada e segura.",
      icon: <ShieldAlert className="text-amber-500" size={48} />
    },
    {
      title: "O Hábito",
      text: "Visite o Oráculo sempre que perceber uma emoção. Use-o como um diário de bolso para os seus estados de espírito.",
      icon: <History className="text-indigo-500" size={48} />
    }
  ];

  // Analytics Logic
  const panoramaData = useMemo(() => {
    if (history.length === 0) return { distribution: [], keywords: [], highlight: null };

    const counts: Record<string, number> = {};
    const words: Record<string, number> = {};
    const stopWords = ['o', 'a', 'e', 'eu', 'que', 'do', 'da', 'em', 'um', 'uma', 'no', 'na', 'os', 'as', 'com', 'para', 'se', 'por', 'me', 'meu', 'minha', 'esta', 'este', 'isso', 'isto'];

    history.forEach(item => {
      counts[item.mood] = (counts[item.mood] || 0) + 1;
      const cleanText = item.text.toLowerCase().replace(/[.,!?;:()]/g, "");
      cleanText.split(/\s+/).forEach(w => {
        if (w.length > 3 && !stopWords.includes(w)) {
          words[w] = (words[w] || 0) + 1;
        }
      });
    });

    const distribution = MOODS.map(m => ({
      ...m,
      count: counts[m.id] || 0,
      percent: Math.round(((counts[m.id] || 0) / history.length) * 100)
    })).filter(m => m.count > 0);

    const keywords = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([text, count]) => ({ text, count }));

    return { 
      distribution, 
      keywords, 
      highlight: keywords[0]?.text || null 
    };
  }, [history]);

  const handleMoodSelect = (id: string) => {
    setSelectedMoodId(id);
    setStep('loading');
    
    // Simulate "tuning" intuition
    setTimeout(() => {
      const pool = PROMPTS[id] || PROMPTS.reflexivo;
      const prevIdx = lastIndices[id];
      let newIdx: number;
      
      // Ensure the new index is different from the last one
      do {
        newIdx = Math.floor(Math.random() * pool.length);
      } while (newIdx === prevIdx && pool.length > 1);

      setLastIndices(prev => ({ ...prev, [id]: newIdx }));
      setCurrentPrompt(pool[newIdx]);
      setStep('write');
    }, 1200);
  };

  const saveEntry = () => {
    if (!selectedMoodId || !entry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now(),
      mood: selectedMoodId,
      prompt: currentPrompt,
      text: entry,
      date: new Date().toLocaleDateString('pt-PT')
    };

    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('oraculo_data', JSON.stringify(newHistory));
    
    // Reset state
    setEntry("");
    setStep('mood');
    setSelectedMoodId(null);
  };

  const selectedMood = MOODS.find(m => m.id === selectedMoodId);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden font-sans">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col p-8"
          >
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  {onboardingSlides[onboardingStep].icon}
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-800 font-serif">{onboardingSlides[onboardingStep].title}</h2>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {onboardingSlides[onboardingStep].text}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {onboardingSlides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === onboardingStep ? "w-6 bg-indigo-600" : "bg-slate-200"
                    )} 
                  />
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onboardingStep < onboardingSlides.length - 1) {
                    setOnboardingStep(onboardingStep + 1);
                  } else {
                    completeOnboarding();
                  }
                }}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
              >
                {onboardingStep === onboardingSlides.length - 1 ? "Começar Jornada" : "Próximo"}
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <button 
          onClick={() => setView('oracle')} 
          className={cn(
            "flex-1 p-5 font-bold text-sm flex items-center justify-center gap-2 transition-all",
            view === 'oracle' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"
          )}
        >
          <MessageCircle size={18} /> Oráculo
        </button>
        <button 
          onClick={() => setView('history')} 
          className={cn(
            "flex-1 p-5 font-bold text-sm flex items-center justify-center gap-2 transition-all",
            view === 'history' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"
          )}
        >
          <LayoutDashboard size={18} /> Seu Jardim
        </button>
      </nav>

      <main className="flex-grow p-6 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          {view === 'oracle' ? (
            <motion.div 
              key="oracle-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {step === 'mood' && (
                <div className="space-y-8">
                  <header className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter font-serif">O que está sentindo?</h2>
                    <p className="text-slate-500 font-medium">Escolhe a energia do momento para começar.</p>
                  </header>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {MOODS.map((m) => (
                      <motion.button 
                        key={m.id} 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoodSelect(m.id)}
                        className="p-4 rounded-3xl bg-slate-50 border-2 border-transparent hover:border-indigo-100 flex flex-col items-center justify-center gap-2 transition-all h-28 shadow-sm"
                      > 
                        <m.icon className={m.text} size={28} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center leading-none">
                          {m.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {history.some(e => e.date === new Date().toLocaleDateString('pt-PT')) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-50/50 rounded-3xl p-6 text-center border border-indigo-100/50"
                    >
                      <p className="text-sm font-medium text-indigo-600/80 leading-relaxed">
                        <Sparkles size={16} className="inline-block mr-1 mb-0.5" />
                        Sementes plantadas. Lembre-se de voltar ao final do dia para colher sua sabedoria no <span className="font-bold">Seu Jardim</span>.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 'loading' && (
                <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-indigo-600"
                  >
                    <Loader2 size={48} />
                  </motion.div>
                  <motion.p 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-slate-400 font-serif italic text-xl"
                  >
                    Sintonizando a tua intuição...
                  </motion.p>
                </div>
              )}

              {step === 'write' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className={cn("p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden", selectedMood?.color || "bg-indigo-600")}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <p className="text-2xl font-serif font-bold leading-tight relative z-10">
                      {currentPrompt}
                    </p>
                  </div>

                  <textarea 
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Escreve aqui a tua verdade sem filtros..."
                    className="w-full h-64 p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 outline-none resize-none transition-all font-medium text-slate-700 text-lg leading-relaxed"
                  />

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep('mood')} 
                      className="flex-1 py-5 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Voltar
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={saveEntry} 
                      disabled={!entry.trim()}
                      className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-30 transition-all"
                    >
                      Guardar Reflexão
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 pb-10"
            >
              {history.length === 0 ? (
                <div className="text-center py-32 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <History size={40} />
                  </div>
                  <p className="text-slate-400 font-serif italic text-lg">Ainda não há sementes no teu jardim...</p>
                  <button 
                    onClick={() => setView('oracle')}
                    className="text-indigo-600 font-bold text-sm uppercase tracking-widest"
                  >
                    Começar agora
                  </button>
                </div>
              ) : (
                <>
                  {/* Emotional Heatmap */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
                        <PieChart size={18} className="text-indigo-500" /> Sua Paisagem
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{history.length} Entradas</span>
                    </div>
                    
                    <div className="h-6 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                      {panoramaData.distribution.map(m => (
                        <div 
                          key={m.id} 
                          style={{ width: `${m.percent}%` }} 
                          className={cn(m.color, "h-full transition-all hover:brightness-110 cursor-help")}
                          title={`${m.label}: ${m.percent}%`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-3">
                      {panoramaData.distribution.map(m => (
                        <div key={m.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                          <div className={cn("w-2.5 h-2.5 rounded-full", m.color)} />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                            {m.label} <span className="text-slate-300 ml-1">{m.count}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Recurring Themes */}
                  <section className="space-y-6">
                    <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
                      <Tag size={18} className="text-indigo-500" /> Temas Recorrentes
                    </h3>
                    <div className="bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex flex-wrap justify-center gap-3">
                        {panoramaData.keywords.map((kw, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                              idx === 0 ? "bg-indigo-600 text-white shadow-lg scale-110" : "bg-white text-indigo-600 border border-indigo-100"
                            )}
                          >
                            {kw.text}
                          </motion.div>
                        ))}
                      </div>
                      {panoramaData.highlight && (
                        <p className="text-center text-sm italic text-indigo-400/80 leading-relaxed font-serif px-4"> 
                          "Tens falado muito sobre <span className="text-indigo-600 font-bold not-italic">'{panoramaData.highlight}'</span> ultimamente. O que esse tema representa hoje?"
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Daily Harvest Section */}
                  {history.some(e => e.date === new Date().toLocaleDateString('pt-PT')) && (
                    <section className="space-y-6">
                      <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
                        <Sparkles size={18} className="text-indigo-500" /> A Colheita de Hoje
                      </h3>
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                        
                        <AnimatePresence mode="wait">
                          {isHarvesting ? (
                            <motion.div 
                              key="harvesting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex flex-col items-center gap-4 py-4"
                            >
                              <Loader2 className="animate-spin text-indigo-400" size={32} />
                              <p className="text-indigo-200 font-serif italic">O Oráculo está a ler as suas sementes...</p>
                            </motion.div>
                          ) : dailyInsight ? (
                            <motion.div 
                              key="insight"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4"
                            >
                              <p className="text-xl font-serif leading-relaxed italic text-indigo-100">
                                "{dailyInsight}"
                              </p>
                              <div className="pt-2 flex justify-center">
                                <div className="w-12 h-1 bg-indigo-500/30 rounded-full" />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="button"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex flex-col items-center gap-6"
                            >
                              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                                <Sprout className="text-emerald-400" size={32} />
                              </div>
                              <div className="text-center space-y-2">
                                <p className="text-indigo-100 font-medium">As suas reflexões de hoje estão prontas para serem colhidas.</p>
                              </div>
                              <button 
                                onClick={generateDailyInsight}
                                className="px-8 py-3 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-colors"
                              >
                                Colher Sabedoria
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </section>
                  )}

                  {/* Explore Memories Button */}
                  <section className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHistoryList(true)}
                      className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3"
                    >
                      <History size={20} /> Explorar Memórias
                    </motion.button>
                  </section>

                  {/* Full History Overlay */}
                  <AnimatePresence>
                    {showHistoryList && (
                      <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-white z-[100] flex flex-col"
                      >
                        <header className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                          <h3 className="font-black text-slate-800 uppercase tracking-tighter">Tuas Memórias</h3>
                          <button 
                            onClick={() => setShowHistoryList(false)}
                            className="text-indigo-600 font-bold text-sm uppercase tracking-widest"
                          >
                            Fechar
                          </button>
                        </header>
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar">
                          {history.map((item) => {
                            const moodInfo = MOODS.find(m => m.id === item.mood);
                            return (
                              <motion.div 
                                key={item.id} 
                                className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{item.date}</span>
                                    {moodInfo && (
                                      <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter", moodInfo.light, moodInfo.text)}>
                                        <moodInfo.icon size={12} /> {moodInfo.label}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-800 font-serif font-bold text-lg mb-3 leading-tight italic">
                                  "{item.prompt}"
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                  {item.text}
                                </p>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
