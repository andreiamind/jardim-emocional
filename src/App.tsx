/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { MOODS, PROMPTS, MASTERY_TITLES } from './constants';
import { JournalEntry, ViewType, StepType } from './types';
import { storageService } from './services/storageService';
import { analyticsService } from './services/analyticsService';
import { geminiService } from './services/geminiService';

// Components
import { Onboarding } from './components/Onboarding';
import { Navigation } from './components/Navigation';
import { OracleView } from './components/OracleView';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [view, setView] = useState<ViewType>('oracle');
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [step, setStep] = useState<StepType>('mood');
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [lastIndices, setLastIndices] = useState<Record<string, number>>({});
  const [entry, setEntry] = useState("");
  const [customMoodLabel, setCustomMoodLabel] = useState("");
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [usedSeedIndices, setUsedSeedIndices] = useState<number[]>([]);
  
  // Daily Harvest States
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);

  // Load data from storage
  useEffect(() => {
    setHistory(storageService.getHistory());
    setUsedSeedIndices(storageService.getUsedSeeds());
    
    const savedInsight = storageService.getDailyInsight();
    const today = new Date().toLocaleDateString('pt-PT');
    if (savedInsight && savedInsight.date === today) {
      setDailyInsight(savedInsight.insight);
    }

    if (!storageService.getOnboardingSeen()) {
      setShowOnboarding(true);
    }
  }, []);

  // Analytics Logic
  const panoramaData = useMemo(() => {
    return analyticsService.calculatePanorama(history);
  }, [history]);

  const handleMoodSelect = (id: string) => {
    setSelectedMoodId(id);
    if (id !== 'outro') {
      setStep('pre-write');
    }
  };

  const handlePreWriteNext = () => {
    if (!selectedMoodId) return;
    setStep('loading');
    
    setTimeout(() => {
      const pool = PROMPTS[selectedMoodId] || PROMPTS.reflexivo;
      const prevIdx = lastIndices[selectedMoodId];
      let newIdx: number;
      
      do {
        newIdx = Math.floor(Math.random() * pool.length);
      } while (newIdx === prevIdx && pool.length > 1);

      setLastIndices(prev => ({ ...prev, [selectedMoodId]: newIdx }));
      setCurrentPrompt(pool[newIdx]);
      setStep('write');
    }, 1200);
  };

  const saveEntry = () => {
    if (!selectedMoodId || !entry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now(),
      mood: selectedMoodId,
      customMoodLabel: selectedMoodId === 'outro' ? customMoodLabel : undefined,
      prompt: currentPrompt,
      text: entry,
      date: new Date().toLocaleDateString('pt-PT')
    };

    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    storageService.saveHistory(newHistory);
    
    // Reset state
    setEntry("");
    setCustomMoodLabel("");
    setStep('mood');
    setSelectedMoodId(null);
    setDailyInsight(null);
    storageService.clearDailyInsight();
  };

  const generateDailyInsight = async () => {
    if (isHarvesting) return;
    
    setIsHarvesting(true);
    
    // Safety timeout to prevent getting stuck in loading state
    const timeoutId = setTimeout(() => {
      if (isHarvesting) {
        console.warn("Colheita demorou demais, cancelando estado de carregamento.");
        setIsHarvesting(false);
      }
    }, 15000);

    try {
      const result = await geminiService.generateDailyInsight(history, usedSeedIndices);
      if (result) {
        setDailyInsight(result.insight);
        setUsedSeedIndices(result.newUsedSeeds);
        storageService.saveUsedSeeds(result.newUsedSeeds);
        storageService.saveDailyInsight(result.insight);
      }
    } catch (error) {
      console.error("Erro na colheita:", error);
    } finally {
      clearTimeout(timeoutId);
      setIsHarvesting(false);
    }
  };

  const completeOnboarding = () => {
    storageService.setOnboardingSeen();
    setShowOnboarding(false);
  };

  const selectedMood = MOODS.find(m => m.id === selectedMoodId);

  // Mastery Logic
  const mastery = useMemo(() => {
    const count = history.length;
    return [...MASTERY_TITLES].reverse().find(t => count >= t.threshold) || MASTERY_TITLES[0];
  }, [history]);

  // Reminder Logic
  const showReminder = useMemo(() => {
    if (history.length === 0) return true;
    const lastEntry = history[0];
    const hoursSinceLast = (Date.now() - lastEntry.id) / (1000 * 60 * 60);
    return hoursSinceLast > 6;
  }, [history]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden font-sans">
      <Onboarding 
        show={showOnboarding} 
        step={onboardingStep} 
        onNext={() => {}} 
        onStepChange={setOnboardingStep} 
        onComplete={completeOnboarding} 
      />

      <Navigation view={view} onViewChange={setView} />

      <main className="flex-grow p-6 overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="wait">
          {view === 'oracle' ? (
            <OracleView 
              step={step}
              selectedMood={selectedMood}
              entry={entry}
              currentPrompt={currentPrompt}
              history={history}
              mastery={mastery}
              showReminder={showReminder}
              customMoodLabel={customMoodLabel}
              onCustomMoodLabelChange={setCustomMoodLabel}
              onMoodSelect={handleMoodSelect}
              onConfirmCustomMood={() => setStep('pre-write')}
              onEntryChange={setEntry}
              onPreWriteNext={handlePreWriteNext}
              onSaveEntry={saveEntry}
              onBack={(to) => setStep(to)}
            />
          ) : (
            <HistoryView 
              history={history}
              panoramaData={panoramaData}
              isHarvesting={isHarvesting}
              dailyInsight={dailyInsight}
              showHistoryList={showHistoryList}
              onHarvest={generateDailyInsight}
              onShowHistoryList={setShowHistoryList}
              onViewChange={setView}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
