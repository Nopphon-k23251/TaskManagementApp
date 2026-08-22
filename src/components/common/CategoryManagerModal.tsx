import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FolderPlus, 
  Sparkles,
  Palette
} from 'lucide-react';
import { Modal } from './Modal';
import { useTasks, COLOR_OPTIONS } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].class);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCategory(newName.trim(), newColor);
    setNewName('');
  };

  const startEdit = (cat: { id: string; name: string; color: string }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateCategory(id, editName.trim(), editColor);
    setEditingId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('categoryModalTitle')}
      maxWidth="md"
    >
      <div className="space-y-6 text-slate-800 dark:text-slate-200">
        {/* Add New Category Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4 text-brand-500" />
            <span>{t('addCategoryTitle')}</span>
          </h4>

          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addBtn')}</span>
              </button>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                {t('categoryBadgeColor')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((c, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setNewColor(c.class)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${c.class} ${
                      newColor === c.class ? 'ring-2 ring-brand-500 scale-105 shadow-xs' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('existingCategories', { count: categories.length })}
            </h4>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('noCategoriesYet')}</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      />
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        {COLOR_OPTIONS.map((c, idx) => (
                          <option key={idx} value={c.class}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${cat.color}`}>
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-xs"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
