import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Clock, 
  CalendarDays, 
  CheckSquare, 
  Plus
} from 'lucide-react';
import { ActiveTab } from '../../types/task';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
}) => {
  const { tasks } = useTasks();
  const { t } = useLanguage();

  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <nav 
      aria-label="Mobile Navigation" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-cyan-500/20 lg:hidden px-1 h-16 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] dark:shadow-[0_-4px_25px_rgba(6,182,212,0.15)] flex items-center justify-around select-none"
    >
      {/* 1. Overview Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'overview'
            ? 'text-cyan-600 dark:text-cyan-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'overview' ? 'stroke-[2.5] drop-shadow-[0_0_6px_#00f5ff]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-mono font-medium">{t('overview').split(' ')[0]}</span>
      </button>

      {/* 2. Board Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('board')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none relative transition-colors ${
          activeTab === 'board'
            ? 'text-cyan-600 dark:text-cyan-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200'
        }`}
      >
        <div className="relative">
          <Kanban className={`w-4 h-4 mb-0.5 ${activeTab === 'board' ? 'stroke-[2.5] drop-shadow-[0_0_6px_#00f5ff]' : 'stroke-2'}`} />
          {inProgressCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-mono font-black bg-amber-500 text-white rounded-full min-w-[13px] text-center shadow-xs">
              {inProgressCount}
            </span>
          )}
        </div>
        <span className="text-[9px] leading-none font-mono font-medium">{t('board').split(' ')[0]}</span>
      </button>

      {/* 3. Center Add Task Sci-Fi Glowing Button */}
      <div className="flex flex-col items-center justify-center px-1 shrink-0 -mt-4">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-brand-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-transform focus:outline-none ring-2 ring-cyan-400/40"
          aria-label="Create new task"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
        <span className="text-[8px] font-mono font-bold text-cyan-500 dark:text-cyan-400 mt-0.5 uppercase">
          {t('addBtn')}
        </span>
      </div>

      {/* 4. Gantt Timeline Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('timeline')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'timeline'
            ? 'text-cyan-600 dark:text-cyan-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200'
        }`}
      >
        <Clock className={`w-4 h-4 mb-0.5 ${activeTab === 'timeline' ? 'stroke-[2.5] drop-shadow-[0_0_6px_#00f5ff]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-mono font-bold">GANTT</span>
      </button>

      {/* 5. Calendar Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'calendar'
            ? 'text-cyan-600 dark:text-cyan-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200'
        }`}
      >
        <CalendarDays className={`w-4 h-4 mb-0.5 ${activeTab === 'calendar' ? 'stroke-[2.5] drop-shadow-[0_0_6px_#00f5ff]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-mono font-medium">{t('calendar').split(' ')[0]}</span>
      </button>

      {/* 6. To-Do Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('todo')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none relative transition-colors ${
          activeTab === 'todo'
            ? 'text-cyan-600 dark:text-cyan-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-cyan-200'
        }`}
      >
        <div className="relative">
          <CheckSquare className={`w-4 h-4 mb-0.5 ${activeTab === 'todo' ? 'stroke-[2.5] drop-shadow-[0_0_6px_#00f5ff]' : 'stroke-2'}`} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-mono font-black bg-cyan-500 text-white rounded-full min-w-[13px] text-center shadow-[0_0_8px_#00f5ff]">
              {pendingCount}
            </span>
          )}
        </div>
        <span className="text-[9px] leading-none font-mono font-medium">{t('todo').split(' ')[0]}</span>
      </button>
    </nav>
  );
};
