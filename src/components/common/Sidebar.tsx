import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  CalendarDays, 
  CheckSquare, 
  Settings, 
  Flame, 
  CheckCircle2, 
  Clock,
  Layers,
  FolderTree
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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/25">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              TaskManager <span className="text-brand-600 dark:text-brand-400">Pro</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {t('workspace')}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {t('menuNavigation')}
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
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
          >
            <FolderTree className="w-4 h-4 text-brand-500" />
            <span>{t('manageCategories')}</span>
          </button>

          {/* Quick Metrics Widget */}
          <div className="pt-6">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              {t('liveStats')}
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                  <Clock className="w-3 h-3 text-brand-500" />
                  {t('inProgress')}
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {inProgressCount}
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {t('done')}
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {completedCount}
                </div>
              </div>

              {urgentCount > 0 && (
                <div className="col-span-2 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <Flame className="w-3.5 h-3.5" />
                    {t('urgentTasks')}
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full">
                    {urgentCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t('settings')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
