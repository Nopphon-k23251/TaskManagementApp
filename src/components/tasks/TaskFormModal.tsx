import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  AlertCircle,
  FolderTree
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, SubTask } from '../../types/task';
import { Modal } from '../common/Modal';
import { validateTaskForm } from '../../utils/sanitizer';
import { getTodayString } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
  defaultDate?: string;
  onOpenCategories?: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus = 'todo',
  defaultDate,
  onOpenCategories,
}) => {
  const { addTask, updateTask, categories } = useTasks();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'General');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayString());
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
    { value: 'urgent', label: t('urgent') },
  ];

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate);
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setCategory(categories[0]?.name || 'General');
      setDueDate(defaultDate || getTodayString());
      setSubtasks([]);
      setTags([]);
    }
    setErrors({});
  }, [taskToEdit, defaultStatus, defaultDate, isOpen, categories]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: SubTask = {
      id: 'st-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTaskForm({
      title,
      description,
      status,
      priority,
      category,
      dueDate,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          status,
          priority,
          category,
          dueDate,
          subtasks,
          tags,
        });
      } else {
        await addTask({
          title,
          description,
          status,
          priority,
          category,
          dueDate,
          subtasks,
          tags,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? t('editTaskModalTitle') : t('createTaskModalTitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* Title Input */}
        <div>
          <label htmlFor="task-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {t('taskTitleLabel')} <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder={t('taskTitlePlaceholder')}
            className={`w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border focus:bg-white dark:focus:bg-slate-900 outline-none transition-all ${
              errors.title
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-brand-500'
            }`}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="flex items-center gap-1 mt-1 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {t('taskDescLabel')}
          </label>
          <textarea
            id="task-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('taskDescPlaceholder')}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all resize-none"
          />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {t('priorityLevelLabel')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    priority === p.value
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="task-status" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {t('statusColLabel')}
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none font-medium"
            >
              <option value="todo">{t('toDoCol')}</option>
              <option value="in_progress">{t('inProgressCol')}</option>
              <option value="review">{t('reviewCol')}</option>
              <option value="completed">{t('completedCol')}</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-category" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('categoryLabel')}
              </label>
              {onOpenCategories && (
                <button
                  type="button"
                  onClick={onOpenCategories}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>{t('manageCategories')}</span>
                </button>
              )}
            </div>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none font-medium"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {t('dueDateLabel')} <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none font-medium"
            />
            {errors.dueDate && (
              <p className="flex items-center gap-1 mt-1 text-xs text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>

        {/* Subtasks Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {t('subtasksChecklistLabel')}
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder={t('addSubtaskPlaceholder')}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-xl transition-colors"
            >
              {t('addBtn')}
            </button>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <span className={st.completed ? 'line-through text-slate-400' : ''}>
                  {st.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {t('tagsLabel')}
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder={t('addTagPlaceholder')}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            >
              {t('addBtn')}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-md shadow-brand-500/25 active:scale-95 transition-all"
          >
            {isSubmitting ? t('savingBtn') : t('saveBtn')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
