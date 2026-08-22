import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Task, TaskPriority } from '../../types/task';
import { formatDate, getTodayString, isOverdue } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TodoListProps {
  onEditTask: (task: Task) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ onEditTask }) => {
  const { 
    filteredTasks, 
    addTask, 
    updateTaskStatus, 
    toggleSubtask, 
    deleteTask,
    categories 
  } = useTasks();
  const { t } = useLanguage();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickCategory, setQuickCategory] = useState<string>(categories[0]?.name || 'General');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [todoTab, setTodoTab] = useState<'all' | 'active' | 'completed' | 'today'>('all');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: quickTitle.trim(),
      description: '',
      status: 'todo',
      priority: quickPriority,
      category: quickCategory,
      dueDate: getTodayString(),
      subtasks: [],
      tags: ['QuickTodo'],
    });

    setQuickTitle('');
  };

  const displayedTasks = filteredTasks.filter((task) => {
    if (todoTab === 'active') return task.status !== 'completed';
    if (todoTab === 'completed') return task.status === 'completed';
    if (todoTab === 'today') return task.dueDate === getTodayString();
    return true;
  });

  const activeCount = filteredTasks.filter((t) => t.status !== 'completed').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0">
      {/* Quick Add Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder={t('quickTodoPlaceholder')}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addTodoBtn')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <span>{t('priorityLabel')}</span>
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                className="w-full sm:w-auto px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <span>{t('categoryLabel')}</span>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setTodoTab('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            todoTab === 'all'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('allTab')} ({filteredTasks.length})
        </button>
        <button
          onClick={() => setTodoTab('active')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            todoTab === 'active'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('activeTab')} ({activeCount})
        </button>
        <button
          onClick={() => setTodoTab('today')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            todoTab === 'today'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('todayTab')}
        </button>
        <button
          onClick={() => setTodoTab('completed')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            todoTab === 'completed'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('completedTab')} ({completedCount})
        </button>
      </div>

      {/* Todo Checklist Items */}
      <div className="space-y-2.5">
        {displayedTasks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {t('allCaughtUp')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t('noTasksInTab')}
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isExpanded = expandedTaskId === task.id;
            const overdue = isOverdue(task.dueDate) && !isCompleted;
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const completedSubCount = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                className={`group bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border transition-all ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
                    : overdue
                    ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-300 dark:hover:border-brand-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  {/* Left: Checkbox and Title */}
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <button
                      onClick={() =>
                        updateTaskStatus(task.id, isCompleted ? 'todo' : 'completed')
                      }
                      className="mt-0.5 p-0.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none"
                      aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Meta badges */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            overdue ? 'text-rose-500 font-semibold' : ''
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(task.dueDate)}
                        </span>

                        {hasSubtasks && (
                          <button
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            <span>
                              {completedSubCount}/{task.subtasks.length} {t('subtasksLabel')}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t('editTaskModalTitle')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={t('clearAllTasks').split(' ')[0]}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks List */}
                {isExpanded && hasSubtasks && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-6 sm:pl-8 space-y-2">
                    {task.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(task.id, st.id)}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-brand-600"
                      >
                        {st.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span className={st.completed ? 'line-through text-slate-400' : ''}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
