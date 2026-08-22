import React, { useState } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  LogIn, 
  LogOut,
  Languages,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { testFirestoreConnection } from '../../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, logout, isFirebaseActive } = useAuth();
  const { 
    resetToSampleData, 
    clearAllTasks, 
    exportTasksJson, 
    importTasksJson,
    syncStatus 
  } = useTasks();
  const { language, setLanguage, t } = useLanguage();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const handleTestDatabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await testFirestoreConnection(user?.uid);
      setDbTestResult(res);
    } catch (e: any) {
      setDbTestResult({ success: false, message: e.message || 'Error connecting to database' });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportTasksJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskmanager_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importTasksJson(importJsonText);
    if (success) {
      setImportStatus(t('importSuccess'));
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus(t('importError'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settingsModalTitle')} maxWidth="lg">
      <div className="space-y-5 text-sm text-slate-800 dark:text-slate-200">
        {/* Language Selection */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Language (ภาษา)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เลือกภาษาสำหรับระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLanguage('th')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'th'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ไทย (TH)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Firebase Cloud Connection Box */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFirebaseActive ? (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Cloud className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <CloudOff className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t('firebaseSyncTitle')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isFirebaseActive ? t('firebaseOnlineDesc') : t('firebaseOfflineDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : syncStatus === 'syncing'
                    ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    : syncStatus === 'demo'
                    ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {syncStatus === 'synced'
                  ? 'Cloud Synced'
                  : syncStatus === 'syncing'
                  ? 'Syncing...'
                  : syncStatus === 'error'
                  ? 'Sync Error'
                  : syncStatus === 'demo'
                  ? 'Demo Mode'
                  : t('offline')}
              </span>
            </div>
          </div>

          {/* Database Live Test Button & Diagnostic Panel */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                <span>ตรวจสอบการเชื่อมต่อ Firestore Database</span>
              </span>

              <button
                onClick={handleTestDatabase}
                disabled={isTestingDb}
                className="px-3 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg shadow-xs transition-all"
              >
                {isTestingDb ? 'กำลังตรวจสอบ...' : 'ทดสอบ Ping DB'}
              </button>
            </div>

            {dbTestResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  dbTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                }`}
              >
                {dbTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{dbTestResult.message}</p>
                  {dbTestResult.latencyMs !== undefined && (
                    <p className="text-[11px] opacity-80 mt-0.5">Response latency: {dbTestResult.latencyMs} ms</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {user ? (
                <span>
                  User: <strong className="text-slate-800 dark:text-slate-200">{user.displayName}</strong> ({user.isDemo ? t('demoAccount') : 'Google'})
                </span>
              ) : (
                <span>Not signed in</span>
              )}
            </div>

            {user && !user.isDemo ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t('signOut')}
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Google Login
              </button>
            )}
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('backupTitle')}
          </h4>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 text-brand-500" />
              {t('downloadBackup')}
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <textarea
              rows={2}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={t('importJsonPlaceholder')}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
            />
            <button
              onClick={handleImport}
              disabled={!importJsonText.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 disabled:opacity-50 rounded-xl transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {t('importBtn')}
            </button>
            {importStatus && (
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                {importStatus}
              </p>
            )}
          </div>
        </div>

        {/* Reset & Wipe Options */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('sampleDataTitle')}
          </h4>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                if (window.confirm(t('confirmReset'))) {
                  await resetToSampleData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
              {t('reloadSampleData')}
            </button>

            <button
              onClick={async () => {
                if (window.confirm(t('confirmClear'))) {
                  await clearAllTasks();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('clearAllTasks')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
