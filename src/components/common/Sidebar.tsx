import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Clock, 
  CalendarDays, 
  CheckSquare, 
  Settings, 
  Flame, 
  CheckCircle2, 
  Layers,
  FolderTree,
  Activity,
  Radio
} from 'lucide-react';
import { ActiveTab } from '../../types/task';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onOpenCategories: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
  onOpenCategories,
}) => {
  const { tasks } = useTasks();
  const { t } = useLanguage();

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const urgentCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: t('overview'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'board' as ActiveTab,
      label: t('board'),
      icon: Kanban,
      badge: inProgressCount > 0 ? inProgressCount : null,
    },
    {
      id: 'timeline' as ActiveTab,
      label: t('timeline'),
      icon: Clock,
      badge: null,
      isGlow: true,
    },
    {
      id: 'calendar' as ActiveTab,
      label: t('calendar'),
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'todo' as ActiveTab,
      label: t('todo'),
      icon: CheckSquare,
      badge: totalCount - completedCount > 0 ? totalCount - completedCount : null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container with Sci-Fi HUD styling */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-r border-slate-200 dark:border-cyan-500/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-cyan-500/15">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-brand-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-base bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-cyan-300 dark:to-indigo-300 bg-clip-text text-transparent flex items-center gap-1">
              <span>TaskManager</span>
              <span className="text-cyan-500 dark:text-cyan-400 font-mono text-xs">PRO</span>
            </h1>
            <p className="text-[10px] font-mono font-medium text-slate-400 dark:text-cyan-400/70 uppercase tracking-widest">
              [ {t('workspace')} ]
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-cyan-400/60 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>{t('menuNavigation')}</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-brand-600 text-white shadow-[0_0_16px_rgba(6,182,212,0.35)] border border-cyan-400/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-cyan-500/10 hover:text-slate-900 dark:hover:text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white drop-shadow-[0_0_6px_#00f5ff]' : 'text-slate-400 dark:text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full transition-colors ${
                      isActive
                        ? 'bg-black/30 text-cyan-200 border border-cyan-300/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Manage Categories link */}
          <button
            onClick={() => {
              onOpenCategories();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-cyan-500/10 hover:text-slate-900 dark:hover:text-cyan-300 transition-all"
          >
            <FolderTree className="w-4 h-4 text-cyan-500" />
            <span>{t('manageCategories')}</span>
          </button>

          {/* Sci-Fi Live Metrics HUD Console */}
          <div className="pt-5">
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-cyan-400/60 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{t('liveStats')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-cyan-500/15">
              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-100 dark:border-cyan-500/10 shadow-xs">
                <div className="flex items-center gap-1 text-slate-400 dark:text-cyan-400/70 text-[10px] font-mono font-medium uppercase">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{t('inProgress').split(' ')[0]}</span>
                </div>
                <div className="font-mono text-lg font-black text-slate-800 dark:text-cyan-300 mt-1">
                  {inProgressCount}
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-100 dark:border-cyan-500/10 shadow-xs">
                <div className="flex items-center gap-1 text-slate-400 dark:text-emerald-400/70 text-[10px] font-mono font-medium uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{t('done')}</span>
                </div>
                <div className="font-mono text-lg font-black text-slate-800 dark:text-emerald-300 mt-1">
                  {completedCount}
                </div>
              </div>

              {urgentCount > 0 && (
                <div className="col-span-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-500/30 flex items-center justify-between shadow-[0_0_12px_rgba(244,63,94,0.15)]">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>{t('urgentTasks')}</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-600 text-white rounded-full">
                    {urgentCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-cyan-500/15">
          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
            <span>{t('settings')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
