import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertCircle,
  FolderTree,
  GitBranch,
  X,
  AlertTriangle,
  Zap,
  Calendar,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, SubTask } from '../../types/task';
import { Modal } from '../common/Modal';
import { validateTaskForm } from '../../utils/sanitizer';
import { getTodayString, addDaysToDate } from '../../utils/date';
import { detectCircularDependency } from '../../utils/dependencies';
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
  const { tasks, addTask, updateTask, categories } = useTasks();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'General');
  const [startDate, setStartDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState(defaultDate || getTodayString());
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [isAllDay, setIsAllDay] = useState<boolean>(true);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [selectedDepId, setSelectedDepId] = useState<string>('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [depError, setDepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
    { value: 'urgent', label: t('urgent') },
  ];

  // Candidates for dependencies (exclude self and already selected)
  const availableDependencyCandidates = tasks.filter(
    (t) => (!taskToEdit || t.id !== taskToEdit.id) && !dependencies.includes(t.id)
  );

  const handleDueDateChange = (newDate: string) => {
    setDueDate(newDate);
    if (!isMultiDay) {
      setStartDate(newDate);
    } else if (startDate > newDate) {
      setStartDate(newDate);
    }
    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
    if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
  };

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    if (dueDate < newDate) {
      setDueDate(newDate);
    }
    if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setStartDate(taskToEdit.startDate || taskToEdit.dueDate);
      setDueDate(taskToEdit.dueDate);
      setIsMultiDay(Boolean(taskToEdit.startDate && taskToEdit.startDate !== taskToEdit.dueDate));
      setStartTime(taskToEdit.startTime || '');
      setDueTime(taskToEdit.dueTime || '');
      setIsAllDay(!taskToEdit.startTime && !taskToEdit.dueTime);
      setDependencies(taskToEdit.dependencies || []);
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
      setShowAdvanced(true);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setCategory(categories[0]?.name || 'General');
      setStartDate(defaultDate || getTodayString());
      setDueDate(defaultDate || getTodayString());
      setIsMultiDay(false);
      setStartTime('');
      setDueTime('');
      setIsAllDay(true);
      setDependencies([]);
      setSubtasks([]);
      setTags([]);
      setShowAdvanced(false);
    }
    setErrors({});
    setDepError(null);
  }, [taskToEdit, defaultStatus, defaultDate, isOpen, categories]);

  const handleAddDependency = (depId: string) => {
    if (!depId) return;

    if (taskToEdit) {
      const isCircular = detectCircularDependency(taskToEdit.id, depId, tasks);
      if (isCircular) {
        setDepError(t('circularDependencyError'));
        return;
      }
    }

    setDependencies([...dependencies, depId]);
    setSelectedDepId('');
    setDepError(null);
  };

  const handleRemoveDependency = (depId: string) => {
    setDependencies(dependencies.filter((id) => id !== depId));
    setDepError(null);
  };

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
      startDate,
      dueDate,
      startTime: isAllDay ? undefined : (startTime || undefined),
      dueTime: isAllDay ? undefined : (dueTime || undefined),
      dependencies,
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
          startDate,
          dueDate,
          startTime: isAllDay ? undefined : (startTime || undefined),
          dueTime: isAllDay ? undefined : (dueTime || undefined),
          dependencies,
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
          startDate,
          dueDate,
          startTime: isAllDay ? undefined : (startTime || undefined),
          dueTime: isAllDay ? undefined : (dueTime || undefined),
          dependencies,
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
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
        {/* Title Input */}
        <div>
          <label htmlFor="task-title" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
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
            className={`w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border focus:bg-white dark:focus:bg-slate-900 outline-none transition-all ${
              errors.title
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-cyan-500/30 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,245,255,0.2)]'
            }`}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Quick Due Date Presets */}
        <div>
          <label htmlFor="quick-due-date-input" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
            {t('dueDateLabel')} <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleDueDateChange(getTodayString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                dueDate === getTodayString()
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              {t('dateToday')}
            </button>
            <button
              type="button"
              onClick={() => handleDueDateChange(addDaysToDate(getTodayString(), 1))}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                dueDate === addDaysToDate(getTodayString(), 1)
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              {t('dateTomorrow')}
            </button>
            <button
              type="button"
              onClick={() => handleDueDateChange(addDaysToDate(getTodayString(), 7))}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                dueDate === addDaysToDate(getTodayString(), 7)
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              {t('dateNextWeek')}
            </button>

            {/* Custom Date Input with Clickable Calendar Button */}
            <div className="relative flex items-center">
              <input
                id="quick-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch {}
                }}
                className={`pl-3 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border font-mono outline-none cursor-pointer transition-all ${
                  errors.dueDate
                    ? 'border-rose-500 ring-1 ring-rose-500 text-rose-400'
                    : dueDate !== getTodayString() &&
                      dueDate !== addDaysToDate(getTodayString(), 1) &&
                      dueDate !== addDaysToDate(getTodayString(), 7)
                    ? 'border-cyan-400 ring-2 ring-cyan-400/20 bg-cyan-950/20 text-cyan-300'
                    : 'border-slate-200 dark:border-cyan-500/30 hover:border-cyan-400 text-slate-800 dark:text-cyan-100'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('quick-due-date-input') as HTMLInputElement | null;
                  try {
                    el?.showPicker?.();
                  } catch {
                    el?.focus();
                  }
                }}
                className="absolute right-2 text-cyan-600 dark:text-cyan-400 hover:scale-110 transition-transform p-0.5 cursor-pointer"
                title="เลือกวันจากปฏิทิน"
                aria-label="Select Date"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {errors.dueDate && (
            <p className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.dueDate}
            </p>
          )}
        </div>

        {/* Priority Quick Selector */}
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
            {t('priorityLevelLabel')}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {priorities.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`py-1.5 text-xs font-mono font-bold rounded-xl border transition-all ${
                  priority === p.value
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-cyan-950/80 text-cyan-300 shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-cyan-500/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Advanced Details Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? t('lessDetails') : t('moreDetails')}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-cyan-500/15 animate-fade-in">
            {/* Description */}
            <div>
              <label htmlFor="task-desc" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
                {t('taskDescLabel')}
              </label>
              <textarea
                id="task-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('taskDescPlaceholder')}
                className="w-full px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="task-status" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
                {t('statusColLabel')}
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none font-medium"
              >
                <option value="todo">{t('toDoCol')}</option>
                <option value="in_progress">{t('inProgressCol')}</option>
                <option value="review">{t('reviewCol')}</option>
                <option value="completed">{t('completedCol')}</option>
              </select>
            </div>

        {/* Dynamic Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="task-category" className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90">
              {t('categoryLabel')}
            </label>
            {onOpenCategories && (
              <button
                type="button"
                onClick={onOpenCategories}
                className="text-[11px] font-mono font-bold text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none font-medium"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline Dates: Start Date & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="task-start-date" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5 truncate">
              {t('startDateLabel')}
            </label>
            <div className="relative flex items-center">
              <input
                id="task-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch {}
                }}
                className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-100 dark:bg-[#0c1428] text-slate-900 dark:text-cyan-100 font-mono rounded-xl border focus:border-cyan-400 outline-none cursor-pointer transition-all shadow-inner ${
                  errors.startDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400/70'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('task-start-date') as HTMLInputElement | null;
                  try {
                    el?.showPicker?.();
                  } catch {
                    el?.focus();
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 hover:scale-110 transition-transform p-1 cursor-pointer"
                title="เลือกวันเริ่มต้น"
                aria-label="Select Start Date"
              >
                <Calendar className="w-4 h-4 drop-shadow-[0_0_6px_rgba(0,245,255,0.6)]" />
              </button>
            </div>
            {errors.startDate && (
              <p className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="task-due-date" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5 truncate">
              {t('dueDateLabel')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                onClick={(e) => {
                  try {
                    (e.currentTarget as HTMLInputElement).showPicker?.();
                  } catch {}
                }}
                className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-100 dark:bg-[#0c1428] text-slate-900 dark:text-cyan-100 font-mono rounded-xl border focus:border-cyan-400 outline-none cursor-pointer transition-all shadow-inner ${
                  errors.dueDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400/70'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('task-due-date') as HTMLInputElement | null;
                  try {
                    el?.showPicker?.();
                  } catch {
                    el?.focus();
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 hover:scale-110 transition-transform p-1 cursor-pointer"
                title="เลือกวันกำหนดส่ง"
                aria-label="Select Due Date"
              >
                <Calendar className="w-4 h-4 drop-shadow-[0_0_6px_rgba(0,245,255,0.6)]" />
              </button>
            </div>
            {errors.dueDate && (
              <p className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.dueDate}
              </p>
            )}
          </div>
        </div>

        {/* Time Management: Start Time & Due Time */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{t('timeSlot')}</span>
            </label>
            
            {/* All Day Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !isAllDay;
                setIsAllDay(next);
                if (next) {
                  setStartTime('');
                  setDueTime('');
                  if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                  if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: '' }));
                } else if (!startTime && !dueTime) {
                  setStartTime('09:00');
                  setDueTime('18:00');
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                isAllDay
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:text-cyan-400'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{t('allDayTask')}</span>
            </button>
          </div>

          {/* Quick Presets */}
          {!isAllDay && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mr-1">
                {t('timePresetsLabel')}:
              </span>
              <button
                type="button"
                onClick={() => {
                  setStartTime('09:00');
                  setDueTime('12:00');
                  if (errors.startTime || errors.dueTime) setErrors((prev) => ({ ...prev, startTime: '', dueTime: '' }));
                }}
                className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:border-cyan-400 transition-colors"
              >
                {t('presetMorning')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('13:00');
                  setDueTime('17:00');
                  if (errors.startTime || errors.dueTime) setErrors((prev) => ({ ...prev, startTime: '', dueTime: '' }));
                }}
                className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:border-cyan-400 transition-colors"
              >
                {t('presetAfternoon')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('');
                  setDueTime('18:00');
                  if (errors.startTime || errors.dueTime) setErrors((prev) => ({ ...prev, startTime: '', dueTime: '' }));
                }}
                className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-cyan-300 hover:border-cyan-400 transition-colors"
              >
                {t('presetEveningDue')}
              </button>
            </div>
          )}

          {/* Time Input Fields */}
          {!isAllDay && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label htmlFor="task-start-time" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1">
                  {t('startTimeLabel')}
                </label>
                <div className="relative group">
                  <input
                    id="task-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                    }}
                    className={`w-full pl-3.5 pr-9 py-2 text-xs bg-slate-100 dark:bg-[#0c1428] text-slate-900 dark:text-cyan-100 font-mono rounded-xl border focus:border-cyan-400 outline-none transition-all shadow-inner ${
                      errors.startTime ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400/70'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-600 dark:text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                {errors.startTime && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="task-due-time" className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1">
                  {t('dueTimeLabel')}
                </label>
                <div className="relative group">
                  <input
                    id="task-due-time"
                    type="time"
                    value={dueTime}
                    onChange={(e) => {
                      setDueTime(e.target.value);
                      if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: '' }));
                    }}
                    className={`w-full pl-3.5 pr-9 py-2 text-xs bg-slate-100 dark:bg-[#0c1428] text-slate-900 dark:text-cyan-100 font-mono rounded-xl border focus:border-cyan-400 outline-none transition-all shadow-inner ${
                      errors.dueTime ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400/70'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-600 dark:text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                {errors.dueTime && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-rose-500 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.dueTime}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Task Dependencies (Prerequisites) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/20 space-y-2.5 max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 flex items-center gap-1.5 truncate">
              <GitBranch className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{t('dependenciesLabel')}</span>
            </label>
            {dependencies.length > 0 && (
              <span className="font-mono text-[10px] font-bold text-cyan-400 shrink-0">
                {t('dependenciesCount', { count: dependencies.length })}
              </span>
            )}
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <select
              value={selectedDepId}
              onChange={(e) => {
                setSelectedDepId(e.target.value);
                if (e.target.value) {
                  handleAddDependency(e.target.value);
                }
              }}
              className="w-full max-w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none truncate"
            >
              <option value="">{t('dependenciesPlaceholder')}</option>
              {availableDependencyCandidates.map((cand) => (
                <option key={cand.id} value={cand.id}>
                  {cand.title} ({cand.status === 'completed' ? '✓ ' + t('completedCol') : t('toDoCol')})
                </option>
              ))}
            </select>
          </div>

          {depError && (
            <p className="flex items-center gap-1 text-xs text-rose-500 font-mono font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{depError}</span>
            </p>
          )}

          {dependencies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dependencies.map((depId) => {
                const parent = tasks.find((t) => t.id === depId);
                if (!parent) return null;
                const isParentDone = parent.status === 'completed';
                return (
                  <span
                    key={depId}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all ${
                      isParentDone
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <span>
                      {isParentDone ? '✓' : '🔒'} {parent.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDependency(depId)}
                      className="hover:text-rose-400 ml-1"
                      title="Remove dependency"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtasks Section */}
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
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
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 rounded-xl transition-colors"
            >
              {t('addBtn')}
            </button>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto font-mono">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-200'}>
                  {st.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/90 mb-1.5">
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
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 dark:text-cyan-300 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              {t('addBtn')}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-400"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-cyan-500/15">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 rounded-xl shadow-[0_0_15px_rgba(0,245,255,0.4)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isSubmitting ? t('savingBtn') : t('saveBtn')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
