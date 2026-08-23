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
    isRealtimeSyncing 
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('settingsModalTitle')} maxWidth="md">
      <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 font-sans">
        
        {/* 1. Language Selection (Compact Horizontal Bar) */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Languages className="w-4 h-4 text-cyan-500 shrink-0" />
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                Language (ภาษา)
              </h4>
            </div>
          </div>

          <div className="flex items-center bg-slate-200/80 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-cyan-500/30 text-[11px] font-mono shrink-0">
            <button
              onClick={() => setLanguage('th')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                language === 'th'
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
              }`}
            >
              ไทย (TH)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* 2. Firebase Cloud Sync Deck (Sleek Proportional Card) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 space-y-2.5 shadow-xs">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isFirebaseActive ? (
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <CloudOff className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {t('firebaseSyncTitle')}
                </h4>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {isFirebaseActive ? t('firebaseOnlineDesc') : t('firebaseOfflineDesc')}
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                isRealtimeSyncing
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : user?.isDemo
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isRealtimeSyncing ? 'Realtime' : user?.isDemo ? 'Demo Mode' : t('offline')}
            </span>
          </div>

          {/* Compact Diagnostic Row */}
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/15 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-cyan-400/90 flex items-center gap-1 truncate">
                <Activity className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">ตรวจสถานะ Firestore DB</span>
              </span>

              <button
                onClick={handleTestDatabase}
                disabled={isTestingDb}
                className="px-2.5 py-1 text-[10px] font-mono font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-50 rounded shadow-xs transition-all shrink-0"
              >
                {isTestingDb ? 'กำลังเช็ก...' : 'ทดสอบ Ping DB'}
              </button>
            </div>

            {dbTestResult && (
              <div
                className={`p-2 rounded text-[10px] font-mono flex items-start gap-1.5 ${
                  dbTestResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300'
                }`}
              >
                {dbTestResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-bold truncate">{dbTestResult.message}</p>
                  {dbTestResult.latencyMs !== undefined && (
                    <p className="opacity-75">Latency: {dbTestResult.latencyMs} ms</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account & Login Row */}
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate flex-1 min-w-0">
              {user ? (
                <span className="truncate block">
                  User: <strong className="text-slate-800 dark:text-cyan-300">{user.displayName}</strong> ({user.isDemo ? t('demoAccount') : 'Google'})
                </span>
              ) : (
                <span>Not signed in</span>
              )}
            </div>

            {user && !user.isDemo ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-3 h-3" />
                <span>{t('signOut')}</span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-mono font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-lg shadow-xs transition-all shrink-0"
              >
                <LogIn className="w-3 h-3" />
                <span>Google Login</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Data Backup & Restore (Compact) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 space-y-2 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400/90 truncate">
              {t('backupTitle')}
            </h4>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด JSON</span>
            </button>
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="วางโค้ด JSON สำรองข้อมูล..."
              className="flex-1 px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-lg focus:border-cyan-400 outline-none truncate text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleImport}
              disabled={!importJsonText.trim()}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-mono font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 rounded-lg transition-colors shrink-0"
            >
              <Upload className="w-3 h-3" />
              <span>นำเข้า</span>
            </button>
          </div>
          {importStatus && (
            <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              {importStatus}
            </p>
          )}
        </div>

        {/* 4. Reset & Wipe Options (Slim Bottom Strip) */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            onClick={async () => {
              if (window.confirm(t('confirmReset'))) {
                await resetToSampleData();
                onClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-cyan-500" />
            <span>{t('reloadSampleData')}</span>
          </button>

          <button
            onClick={async () => {
              if (window.confirm(t('confirmClear'))) {
                await clearAllTasks();
                onClose();
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t('clearAllTasks')}</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
