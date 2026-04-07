import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, PieChart, Tag, Sparkles, Loader2, Sprout, Flower, Flower2, Search, X } from 'lucide-react';
import { PanoramaData, JournalEntry } from '../types';
import { MOODS } from '../constants';
import { cn } from '../utils';

interface HistoryViewProps {
  history: JournalEntry[];
  panoramaData: PanoramaData;
  isHarvesting: boolean;
  dailyInsight: string | null;
  showHistoryList: boolean;
  onHarvest: () => void;
  onShowHistoryList: (show: boolean) => void;
  onViewChange: (view: 'oracle' | 'history') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  panoramaData,
  isHarvesting,
  dailyInsight,
  showHistoryList,
  onHarvest,
  onShowHistoryList,
  onViewChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);

  const hasEntryToday = history.some(e => e.date === new Date().toLocaleDateString('pt-PT'));

  const usedMoods = useMemo(() => {
    const moodIds = new Set(history.map(h => h.mood));
    const customLabels = new Set(history.filter(h => h.mood === 'outro' && h.customMoodLabel).map(h => h.customMoodLabel));
    
    const standardUsed = MOODS.filter(m => moodIds.has(m.id) && m.id !== 'outro');
    const customUsed = Array.from(customLabels).map(label => {
      const otherTemplate = MOODS.find(m => m.id === 'outro')!;
      return {
        ...otherTemplate,
        id: label!, // Using label as ID for the filter logic
        label: label!
      };
    });

    return [...standardUsed, ...customUsed];
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMood = !selectedMoodFilter || item.mood === selectedMoodFilter || (item.mood === 'outro' && item.customMoodLabel === selectedMoodFilter);
      return matchesSearch && matchesMood;
    });
  }, [history, searchTerm, selectedMoodFilter]);

  const searchSummary = useMemo(() => {
    if (!searchTerm && !selectedMoodFilter) return null;
    
    const count = filteredHistory.length;
    const moodLabel = selectedMoodFilter ? (MOODS.find(m => m.id === selectedMoodFilter)?.label || selectedMoodFilter) : '';
    
    if (searchTerm && selectedMoodFilter) {
      return `Encontrei ${count} ${count === 1 ? 'semente' : 'sementes'} de "${moodLabel}" que falam sobre "${searchTerm}".`;
    } else if (searchTerm) {
      return `Encontrei ${count} ${count === 1 ? 'semente' : 'sementes'} que falam sobre "${searchTerm}".`;
    } else {
      return `Você registrou "${moodLabel}" ${count} ${count === 1 ? 'vez' : 'vezes'} no total.`;
    }
  }, [filteredHistory, searchTerm, selectedMoodFilter]);

  if (history.length === 0) {
    return (
      <div className="text-center py-32 space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <History size={40} />
        </div>
        <p className="text-slate-400 font-serif italic text-lg">Ainda não há sementes no teu jardim...</p>
        <button 
          onClick={() => onViewChange('oracle')}
          className="text-indigo-600 font-bold text-sm uppercase tracking-widest"
        >
          Começar agora
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      key="history-view"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10 pb-10"
    >
      {/* Emotional Heatmap / Garden */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
            <PieChart size={18} className="text-indigo-500" /> Sua Paisagem
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Últimos 10 dias • {panoramaData.totalCount} Entradas</span>
        </div>
        
        <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-[2.5rem] p-10 min-h-[280px] relative overflow-hidden shadow-inner flex flex-wrap items-end justify-center gap-x-8 gap-y-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="absolute bottom-12 left-8 right-8 h-px bg-emerald-200/30" />

          {panoramaData.distribution.length === 0 ? (
            <p className="text-slate-400 font-serif italic text-sm relative z-10 self-center">O jardim aguarda as primeiras sementes destes dias...</p>
          ) : (() => {
            // Sort to determine ranking
            const sortedMoods = [...panoramaData.distribution].sort((a, b) => b.count - a.count);
            const totalMoods = sortedMoods.length;
            const third = Math.ceil(totalMoods / 3);

            return panoramaData.distribution.map((m, idx) => {
              const rank = sortedMoods.findIndex(sm => sm.id === m.id);
              
              let Icon = Sprout;
              let size = 24;
              let scale = 1;
              let label = "Broto";

              if (rank < third) {
                // Top 1/3
                Icon = Flower;
                size = 44;
                scale = 1.3;
                label = "Flor Vibrante";
              } else if (rank < 2 * third) {
                // Middle 1/3
                Icon = Flower2;
                size = 34;
                scale = 1.15;
                label = "Planta Jovem";
              }
              // Else stays as Sprout (Bottom 1/3)

              const offsetX = (idx % 2 === 0 ? 10 : -10) * (idx * 0.5);
              const offsetY = (idx % 3 === 0 ? -15 : 5);

              return (
                <motion.div
                  key={m.id}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale, y: offsetY, x: offsetX }}
                  transition={{ type: "spring", stiffness: 100, delay: idx * 0.1 }}
                  className="relative group flex flex-col items-center"
                >
                  <div className={cn("p-4 rounded-full shadow-sm transition-all duration-500 group-hover:shadow-md", m.light)}>
                    <Icon size={size} className={cn(m.text, "transition-transform duration-500 group-hover:rotate-12")} />
                  </div>
                  
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-tighter">
                      {m.label} ({m.count})
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 mt-1 italic">{label}</span>
                  </div>

                  <div className="w-1 h-4 bg-emerald-200/20 absolute -bottom-4 rounded-full -z-10" />
                </motion.div>
              );
            });
          })()}
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

      {/* Encontrar Sementes (Search & Filter) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
            <Search size={18} className="text-indigo-500" /> Encontrar Sementes
          </h3>
          {(searchTerm || selectedMoodFilter) && (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedMoodFilter(null); }}
              className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1"
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="O que você quer encontrar no seu jardim?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Mood Filters */}
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            {usedMoods.map(mood => {
              const isActive = selectedMoodFilter === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMoodFilter(isActive ? null : mood.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-tight",
                    isActive 
                      ? cn(mood.light, mood.text, "border-current shadow-sm scale-105") 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <mood.icon size={14} />
                  {mood.label}
                </button>
              );
            })}
          </div>

          {/* Explore Memories Button (Moved here) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onShowHistoryList(true)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"
          >
            <History size={16} /> Explorar Memórias {searchTerm || selectedMoodFilter ? `(${filteredHistory.length})` : ''}
          </motion.button>

          {/* Search Summary */}
          <AnimatePresence>
            {searchSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center"
              >
                <p className="text-xs italic text-indigo-600 font-serif">
                  {searchSummary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Daily Harvest Section */}
      <section className="space-y-6">
        <h3 className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm"> 
          <Sparkles size={18} className="text-indigo-500" /> A Colheita de Hoje
        </h3>
        <div 
          key={`harvest-container-${isHarvesting}-${!!dailyInsight}`}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          
          <AnimatePresence>
            {isHarvesting ? (
              <motion.div 
                key="harvesting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <Loader2 className="animate-spin text-indigo-400" size={32} />
                <p className="text-indigo-200 font-serif italic text-center leading-relaxed">
                  Faça 3 respirações longas e conscientes enquanto o Oráculo faz a colheita das suas emoções...
                </p>
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
                  <p className="text-indigo-100 font-medium">As suas reflexões estão prontas para serem colhidas.</p>
                </div>
                <button 
                  onClick={onHarvest}
                  className="px-8 py-3 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-colors"
                >
                  Colher Sabedoria
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                onClick={() => onShowHistoryList(false)}
                className="text-indigo-600 font-bold text-sm uppercase tracking-widest"
              >
                Fechar
              </button>
            </header>
            <div className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                  <p className="text-slate-400 font-serif italic">Nenhuma semente encontrada com esses filtros...</p>
                </div>
              ) : (
                filteredHistory.map((item) => {
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
                              <moodInfo.icon size={12} /> {item.mood === 'outro' ? item.customMoodLabel : moodInfo.label}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-800 font-serif text-lg leading-relaxed italic">
                        {item.text}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
