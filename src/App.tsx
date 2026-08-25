import React, { useState } from 'react';
import { ActiveTab, Task, TaskStatus } from './types/task';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { KanbanBoard } from './components/board/KanbanBoard';
import { GanttTimelineView } from './components/timeline/GanttTimelineView';
import { CalendarView } from './components/calendar/CalendarView';
import { TodoList } from './components/todo/TodoList';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { CategoryManagerModal } from './components/common/CategoryManagerModal';
import { AuthErrorModal } from './components/common/AuthErrorModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  const handleOpenCreateModal = (status: TaskStatus = 'todo', date?: string) => {
    setTaskToEdit(null);
    setTaskToView(null);
    setDefaultTaskStatus(status);
    setDefaultTaskDate(date);
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setTaskToView(task);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToView(null);
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] bg-cyber-grid text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onOpenTaskModal={() => handleOpenCreateModal()}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          {activeTab === 'overview' && (
            <OverviewDashboard
              onNavigateTab={(tab) => setActiveTab(tab)}
              onEditTask={handleViewTask}
              onOpenCreateModal={() => handleOpenCreateModal()}
            />
          )}

          {activeTab === 'board' && (
            <KanbanBoard
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleViewTask}
            />
          )}

          {activeTab === 'timeline' && (
            <GanttTimelineView
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleViewTask}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleViewTask}
            />
          )}

          {activeTab === 'todo' && (
            <TodoList onEditTask={handleViewTask} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => handleOpenCreateModal()}
      />

      {/* Task Information & Details Modal */}
      <TaskDetailModal
        isOpen={!!taskToView}
        onClose={() => setTaskToView(null)}
        task={taskToView}
        onEdit={handleOpenEditModal}
      />

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultStatus={defaultTaskStatus}
        defaultDate={defaultTaskDate}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
      />

      {/* Custom Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Google Auth Diagnostic & Error Modal */}
      <AuthErrorModal />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TaskProvider>
            <AppContent />
          </TaskProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
