import React from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';

export const AuthErrorModal: React.FC = () => {
  const { error, errorCode, clearError, loginWithRedirect, loginAsDemo } = useAuth();

  if (!error) return null;

  return (
    <Modal isOpen={Boolean(error)} onClose={clearError} title="การเข้าสู่ระบบ Google ขัดข้อง" maxWidth="md">
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              {errorCode === 'auth/unauthorized-domain' ? 'โดเมนยังไม่ได้รับอนุญาตใน Firebase' : 'คำแนะนำในการแก้ไข'}
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        {errorCode === 'auth/unauthorized-domain' && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-brand-500" />
              <span>วิธีตั้งค่าใน Firebase Console (ใช้เวลา 1 นาที):</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>เปิด <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 underline font-medium inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a></li>
              <li>เลือกโปรเจกต์ <strong>nopphonapp-d0c5b</strong></li>
              <li>ไปที่เมนู <strong>Build &gt; Authentication &gt; Settings</strong></li>
              <li>ในแถบ <strong>Authorized domains</strong> กด <strong>Add domain</strong></li>
              <li>พิมพ์ <code>localhost</code> หรือโดเมนเว็บของคุณ แล้วกด Save</li>
            </ol>
          </div>
        )}

        {errorCode === 'auth/operation-not-allowed' && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              วิธีเปิดใช้งาน Google Sign-In:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              <li>ไปที่ Firebase Console &gt; Authentication &gt; Sign-in method</li>
              <li>กดเลือก <strong>Google</strong></li>
              <li>กด <strong>Enable</strong> และเลือก Support email แล้วกด Save</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 justify-end">
          <button
            type="button"
            onClick={() => {
              clearError();
              loginAsDemo();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            ใช้โหมดสาธิต (Demo Mode)
          </button>

          <button
            type="button"
            onClick={() => {
              clearError();
              loginWithRedirect();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองแบบ Redirect</span>
          </button>

          <button
            type="button"
            onClick={clearError}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>ปิด</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
