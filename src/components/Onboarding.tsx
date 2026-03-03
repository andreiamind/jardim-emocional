import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ONBOARDING_SLIDES } from '../constants';
import { cn } from '../utils';

interface OnboardingProps {
  show: boolean;
  step: number;
  onNext: () => void;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ show, step, onNext, onStepChange, onComplete }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[200] flex flex-col p-8"
        >
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                {ONBOARDING_SLIDES[step].icon}
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 font-serif">{ONBOARDING_SLIDES[step].title}</h2>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {ONBOARDING_SLIDES[step].text}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {ONBOARDING_SLIDES.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === step ? "w-6 bg-indigo-600" : "bg-slate-200"
                  )} 
                />
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (step < ONBOARDING_SLIDES.length - 1) {
                  onStepChange(step + 1);
                } else {
                  onComplete();
                }
              }}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
            >
              {step === ONBOARDING_SLIDES.length - 1 ? "Começar Jornada" : "Próximo"}
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
