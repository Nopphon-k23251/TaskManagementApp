import React from 'react';
import { 
  Target, 
  Kanban, 
  CalendarDays, 
  TrendingUp, 
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
  const urgentCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;

  const navItems = [
    {
      id: 'focus' as ActiveTab,
      label: t('tabFocus'),
      icon: Target,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'tasks' as ActiveTab,
      label: t('tabTasks'),
      icon: Kanban,
      badge: inProgressCount > 0 ? inProgressCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'calendar' as ActiveTab,
      label: t('tabCalendar'),
      icon: CalendarDays,
    },
    {
      id: 'insights' as ActiveTab,
      label: t('tabInsights'),
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* Mobile Floating Action Button (FAB) on Far-Right (Above Bottom Bar) */}
      <div className="fixed bottom-20 right-4 sm:hidden z-40 flex flex-col items-center">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-13 h-13 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 via-brand-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(0,245,255,0.6)] hover:scale-105 active:scale-95 transition-all focus:outline-none ring-2 ring-cyan-300/60 border border-white/20"
          aria-label="Create new task"
        >
          <Plus className="w-6 h-6 stroke-[3] drop-shadow-md text-white" />
        </button>
      </div>

      {/* Symmetrical 5-Column High-Tech Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation" 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-cyan-500/20 lg:hidden h-16 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_25px_rgba(6,182,212,0.15)] flex items-center justify-around select-none px-1"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 focus:outline-none relative transition-all ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-all ${
                    isActive
                      ? 'stroke-[2.5] text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.7)]'
                      : 'stroke-2'
                  }`}
                />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2.5 px-1.5 py-0.2 text-[9px] font-mono font-black rounded-full min-w-[15px] text-center ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none font-mono ${isActive ? 'font-black tracking-tight' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* Active Tab Neon Indicator Pill */}
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_#00f5ff]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
