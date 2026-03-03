import React from 'react';
import { MessageCircle, LayoutDashboard } from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../utils';

interface NavigationProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ view, onViewChange }) => {
  return (
    <nav className="flex border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <button 
        onClick={() => onViewChange('oracle')} 
        className={cn(
          "flex-1 p-5 font-bold text-sm flex items-center justify-center gap-2 transition-all",
          view === 'oracle' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"
        )}
      >
        <MessageCircle size={18} /> Oráculo
      </button>
      <button 
        onClick={() => onViewChange('history')} 
        className={cn(
          "flex-1 p-5 font-bold text-sm flex items-center justify-center gap-2 transition-all",
          view === 'history' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"
        )}
      >
        <LayoutDashboard size={18} /> Seu Jardim
      </button>
    </nav>
  );
};
