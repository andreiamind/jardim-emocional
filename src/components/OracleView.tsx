import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';
import { StepType, Mood, JournalEntry, MasteryTitle } from '../types';
import { MOODS } from '../constants';
import { cn } from '../utils';

interface OracleViewProps {
  step: StepType;
  selectedMood: Mood | undefined;
  entry: string;
  currentPrompt: string;
  history: JournalEntry[];
  mastery: MasteryTitle;
  showReminder: boolean;
  customMoodLabel: string;
  onCustomMoodLabelChange: (text: string) => void;
  onMoodSelect: (id: string) => void;
  onConfirmCustomMood: () => void;
  onEntryChange: (text: string) => void;
  onPreWriteNext: () => void;
  onSaveEntry: () => void;
  onBack: (to: StepType) => void;
}

export const OracleView: React.FC<OracleViewProps> = ({
  step,
  selectedMood,
  entry,
  currentPrompt,
  history,
  mastery,
  showReminder,
  customMoodLabel,
  onCustomMoodLabelChange,
  onMoodSelect,
  onConfirmCustomMood,
  onEntryChange,
  onPreWriteNext,
  onSaveEntry,
  onBack
}) => {
  const hasEntryToday = history.some(e => e.date === new Date().toLocaleDateString('pt-PT'));

  return (
    <motion.div 
      key="oracle-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {step === 'mood' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <mastery.icon size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{mastery.name}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {history.length} Sementes
            </div>
          </div>

          {showReminder && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-indigo-300" size={24} />
                </div>
                <p className="text-sm font-serif italic leading-relaxed">
                  "O Oráculo sente que o seu jardim tem espaço para uma nova semente agora. Como está o seu coração?"
                </p>
              </div>
            </motion.div>
          )}

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
                onClick={() => onMoodSelect(m.id)}
                className={cn(
                  "p-4 rounded-3xl bg-slate-50 border-2 flex flex-col items-center justify-center gap-2 transition-all h-28 shadow-sm",
                  selectedMood?.id === m.id ? "border-indigo-500 bg-indigo-50/30" : "border-transparent hover:border-indigo-100"
                )}
              > 
                <m.icon className={m.text} size={28} />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center leading-none">
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {selectedMood?.id === 'outro' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2"
              >
                <input 
                  type="text"
                  value={customMoodLabel}
                  onChange={(e) => onCustomMoodLabelChange(e.target.value)}
                  placeholder="Qual emoção estás a sentir?"
                  className="w-full p-5 rounded-2xl bg-slate-900 text-white font-bold placeholder:text-slate-500 outline-none border-2 border-transparent focus:border-indigo-500 transition-all"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirmCustomMood}
                  disabled={!customMoodLabel.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-30"
                >
                  Continuar com esta emoção
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {hasEntryToday && (
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

      {step === 'pre-write' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className={cn("p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden", selectedMood?.color || "bg-indigo-600")}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">O Oráculo convida-te</span>
              <p className="text-2xl font-serif font-bold leading-tight">
                Expressa o que sentes sobre <span className="italic">"{selectedMood?.id === 'outro' ? customMoodLabel : selectedMood?.label}"</span>...
              </p>
            </div>
          </div>

          <textarea 
            value={entry}
            onChange={(e) => onEntryChange(e.target.value)}
            placeholder="Deixa as palavras fluírem livremente sobre o teu estado atual..."
            className="w-full h-64 p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 outline-none resize-none transition-all font-medium text-slate-700 text-lg leading-relaxed"
          />

          <div className="flex gap-4">
            <button 
              onClick={() => onBack('mood')} 
              className="flex-1 py-5 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Voltar
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPreWriteNext} 
              disabled={!entry.trim()}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-30 transition-all"
            >
              Guardar Reflexão
            </motion.button>
          </div>
        </motion.div>
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
            <div className="relative z-10 space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">O Oráculo Aprofunda</span>
              <p className="text-2xl font-serif font-bold leading-tight">
                {currentPrompt}
              </p>
            </div>
          </div>

          <textarea 
            value={entry}
            onChange={(e) => onEntryChange(e.target.value)}
            placeholder="Aprofunda a tua verdade..."
            className="w-full h-64 p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 outline-none resize-none transition-all font-medium text-slate-700 text-lg leading-relaxed"
          />

          <div className="flex gap-4">
            <button 
              onClick={() => onBack('pre-write')} 
              className="flex-1 py-5 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Voltar
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSaveEntry} 
              disabled={!entry.trim()}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-30 transition-all"
            >
              Finalizar Reflexão
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
