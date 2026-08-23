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
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 lg:hidden px-1 h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex items-center justify-around select-none"
    >
      {/* 1. Overview Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'overview'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className={`w-4 h-4 mb-0.5 ${activeTab === 'overview' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-medium">{t('overview').split(' ')[0]}</span>
      </button>

      {/* 2. Board Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('board')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none relative transition-colors ${
          activeTab === 'board'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Kanban className={`w-4 h-4 mb-0.5 ${activeTab === 'board' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {inProgressCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-extrabold bg-amber-500 text-white rounded-full min-w-[13px] text-center shadow-xs">
              {inProgressCount}
            </span>
          )}
        </div>
        <span className="text-[9px] leading-none font-medium">{t('board').split(' ')[0]}</span>
      </button>

      {/* 3. Center Add Task Button */}
      <div className="flex flex-col items-center justify-center px-1 shrink-0 -mt-3">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/50 hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Create new task"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="text-[8px] font-bold text-brand-600 dark:text-brand-400 mt-0.5">
          {t('addBtn')}
        </span>
      </div>

      {/* 4. Gantt Timeline Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('timeline')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'timeline'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Clock className={`w-4 h-4 mb-0.5 ${activeTab === 'timeline' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-medium">Gantt</span>
      </button>

      {/* 5. Calendar Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none transition-colors ${
          activeTab === 'calendar'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <CalendarDays className={`w-4 h-4 mb-0.5 ${activeTab === 'calendar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[9px] leading-none font-medium">{t('calendar').split(' ')[0]}</span>
      </button>

      {/* 6. To-Do Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('todo')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 focus:outline-none relative transition-colors ${
          activeTab === 'todo'
            ? 'text-brand-600 dark:text-brand-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <CheckSquare className={`w-4 h-4 mb-0.5 ${activeTab === 'todo' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-extrabold bg-brand-500 text-white rounded-full min-w-[13px] text-center shadow-xs">
              {pendingCount}
            </span>
          )}
        </div>
        <span className="text-[9px] leading-none font-medium">{t('todo').split(' ')[0]}</span>
      </button>
    </nav>
  );
};
