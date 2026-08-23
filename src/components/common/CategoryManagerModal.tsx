import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FolderPlus,
  Palette,
  Sliders
} from 'lucide-react';
import { Modal } from './Modal';
import { useTasks, COLOR_OPTIONS } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryBadgeStyle } from '../../utils/category';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useTasks();
  const { t } = useLanguage();

  const [newName, setNewName] = useState('');
  const [colorMode, setColorMode] = useState<'preset' | 'custom'>('custom');
  
  // Preset mode state
  const [newPresetColor, setNewPresetColor] = useState(COLOR_OPTIONS[0].class);
  
  // Custom RGB state
  const [customText, setCustomText] = useState('#00f5ff');
  const [customBorder, setCustomBorder] = useState('#06b6d4');
  const [customBg, setCustomBg] = useState('#08152c');

  // Edit Mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColorMode, setEditColorMode] = useState<'preset' | 'custom'>('custom');
  const [editPresetColor, setEditPresetColor] = useState('');
  const [editText, setEditText] = useState('#00f5ff');
  const [editBorder, setEditBorder] = useState('#06b6d4');
  const [editBg, setEditBg] = useState('#08152c');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (colorMode === 'custom') {
      addCategory(newName.trim(), undefined, {
        customBg,
        customText,
        customBorder,
      });
    } else {
      addCategory(newName.trim(), newPresetColor);
    }

    setNewName('');
  };

  const startEdit = (cat: { id: string; name: string; color: string; customBg?: string; customText?: string; customBorder?: string }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    if (cat.customBg || cat.customText || cat.customBorder) {
      setEditColorMode('custom');
      setEditText(cat.customText || '#00f5ff');
      setEditBorder(cat.customBorder || '#06b6d4');
      setEditBg(cat.customBg || '#08152c');
    } else {
      setEditColorMode('preset');
      setEditPresetColor(cat.color || COLOR_OPTIONS[0].class);
      setEditText('#00f5ff');
      setEditBorder('#06b6d4');
      setEditBg('#08152c');
    }
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;

    if (editColorMode === 'custom') {
      updateCategory(id, editName.trim(), undefined, {
        customBg: editBg,
        customText: editText,
        customBorder: editBorder,
      });
    } else {
      updateCategory(id, editName.trim(), editPresetColor, {
        customBg: undefined,
        customText: undefined,
        customBorder: undefined,
      });
    }

    setEditingId(null);
  };

  // Preview styling calculation
  const previewStyle: React.CSSProperties = colorMode === 'custom'
    ? {
        backgroundColor: customBg,
        color: customText,
        borderColor: customBorder,
        boxShadow: `0 0 12px ${customBorder}55`,
      }
    : {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('categoryModalTitle')}
      maxWidth="lg"
    >
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        {/* Add New Category Box with RGB Customizer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-cyan-500" />
              <span>{t('addCategoryTitle')}</span>
            </h4>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-300 dark:border-cyan-500/30 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setColorMode('custom')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  colorMode === 'custom'
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>RGB Custom</span>
              </button>
              <button
                type="button"
                onClick={() => setColorMode('preset')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  colorMode === 'preset'
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Presets</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 text-slate-900 dark:text-cyan-100 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('addBtn')}</span>
              </button>
            </div>

            {/* Live Holographic Badge Preview */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/15">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400/80">
                [ LIVE PREVIEW ]
              </span>
              <div
                style={previewStyle}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                  colorMode === 'preset' ? newPresetColor : ''
                }`}
              >
                {newName.trim() || 'ตัวอย่างหมวดหมู่ (Preview)'}
              </div>
            </div>

            {/* RGB Color Wheels Controls */}
            {colorMode === 'custom' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-950/90 border border-slate-200 dark:border-cyan-500/20">
                {/* 1. Text Color (ตัวอักษร) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-cyan-300">
                    1. สีตัวอักษร (Text)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase"
                    />
                  </div>
                </div>

                {/* 2. Border / Stroke Color (เส้นขอบเรืองแสง) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-cyan-300">
                    2. สีเส้นขอบ (Stroke)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBorder}
                      onChange={(e) => setCustomBorder(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customBorder}
                      onChange={(e) => setCustomBorder(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase"
                    />
                  </div>
                </div>

                {/* 3. Background Color (พื้นหลัง) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-cyan-300">
                    3. สีพื้นหลัง (Background)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBg.startsWith('#') ? customBg : '#08152c'}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Quick Presets */
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('categoryBadgeColor')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map((c, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewPresetColor(c.class)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${c.class} ${
                        newPresetColor === c.class ? 'ring-2 ring-cyan-400 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400/80">
              {t('existingCategories', { count: categories.length })}
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 text-center py-4">{t('noCategoriesYet')}</p>
            ) : (
              categories.map((cat) => {
                const badgeStyle = getCategoryBadgeStyle(cat.name, categories);
                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/20 shadow-xs flex flex-col gap-2"
                  >
                    {editingId === cat.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-lg outline-none font-bold"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => saveEdit(cat.id)}
                              className="px-2.5 py-1.5 text-xs font-mono font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>บันทึก</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Edit RGB Pickers */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div>
                            <label className="text-[10px] font-mono text-slate-500 dark:text-cyan-400 block mb-1">Text</label>
                            <input
                              type="color"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full h-7 rounded cursor-pointer bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-500 dark:text-cyan-400 block mb-1">Stroke</label>
                            <input
                              type="color"
                              value={editBorder}
                              onChange={(e) => setEditBorder(e.target.value)}
                              className="w-full h-7 rounded cursor-pointer bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-500 dark:text-cyan-400 block mb-1">Bg</label>
                            <input
                              type="color"
                              value={editBg.startsWith('#') ? editBg : '#08152c'}
                              onChange={(e) => setEditBg(e.target.value)}
                              className="w-full h-7 rounded cursor-pointer bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            style={badgeStyle.style}
                            className={`text-xs px-2.5 py-0.5 rounded-md ${badgeStyle.className}`}
                          >
                            {cat.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t('confirmDeleteCategory'))) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-cyan-500/15">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 rounded-xl shadow-xs"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
