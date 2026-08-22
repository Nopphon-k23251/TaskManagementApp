import React, { useState } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Plus, 
  SlidersHorizontal, 
  Menu, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Cloud, 
  CloudOff, 
  X,
  Languages,
  FolderTree
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  onOpenTaskModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenCategoryModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTaskModal,
  onOpenSettingsModal,
  onOpenCategoryModal,
  onToggleMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, loginWithGoogle, logout, isFirebaseActive } = useAuth();
  const { filters, setFilters } = useTasks();
  const { language, toggleLanguage, t } = useLanguage();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
      setShowUserDropdown(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Mobile Search Overlay */}
      {showMobileSearch ? (
        <div className="flex items-center gap-2 w-full animate-fade-in py-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-xl"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Left side: Mobile menu & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleMobileSidebar}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none shrink-0"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Workspace badge - hidden on mobile to avoid overcrowding */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/80 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{t('workspace')}</span>
              </span>
            </div>

            {/* App title visible on mobile */}
            <span className="sm:hidden font-extrabold text-sm bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              TaskManager
            </span>
          </div>

          {/* Center: Desktop Search Input */}
          <div className="hidden sm:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
                aria-label="Search tasks"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right side: Actions, Language, Theme, and Un-squished Profile Avatar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher (TH / EN) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              title="Switch Language (สลับภาษา)"
              aria-label="Switch Language"
            >
              <Languages className="w-3.5 h-3.5 text-brand-500" />
              <span>{language === 'th' ? 'TH' : 'EN'}</span>
            </button>

            {/* Manage Categories Button (Desktop only) */}
            <button
              onClick={onOpenCategoryModal}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              title={t('manageCategories')}
            >
              <FolderTree className="w-3.5 h-3.5 text-brand-500" />
              <span>{t('manageCategories')}</span>
            </button>

            {/* Create Task Button (Desktop only) */}
            <button
              onClick={onOpenTaskModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newTask')}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none shrink-0"
              aria-label="Switch theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label={t('settings')}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User Profile Avatar with STRICT Aspect-Ratio and shrink-0 */}
            <div className="relative shrink-0 flex items-center">
              {user ? (
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="shrink-0 p-0.5 rounded-full hover:ring-2 hover:ring-brand-500/40 transition-all focus:outline-none relative"
                  aria-label="User account menu"
                >
                  <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] aspect-square rounded-full overflow-hidden ring-2 ring-brand-500/40 shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-full h-full object-cover aspect-square shrink-0 block"
                      />
                    ) : (
                      <span className="font-bold text-white text-xs bg-brand-600 w-full h-full flex items-center justify-center">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {isFirebaseActive && !user.isDemo && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"
                      title="ซิงก์ข้อมูลคลาวด์เรียลไทม์"
                    />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-500" />
                  <span className="hidden sm:inline">{isLoggingIn ? t('signingIn') : t('signIn')}</span>
                </button>
              )}

              {/* User Popover */}
              {showUserDropdown && user && (
                <div className="absolute right-0 top-10 w-64 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in z-50">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full overflow-hidden aspect-square shrink-0 bg-slate-200 dark:bg-slate-700">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover aspect-square" />
                      ) : (
                        <div className="w-full h-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email || t('demoAccount')}
                      </p>
                    </div>
                  </div>

                  <div className="py-2 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 px-1">
                      <span>Cloud Sync:</span>
                      <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        {isFirebaseActive ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5 text-amber-500" />}
                        {isFirebaseActive ? t('online') : t('offline')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    {user.isDemo && (
                      <button
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        {t('connectGoogle')}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await logout();
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
