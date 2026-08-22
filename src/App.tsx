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
import { CalendarView } from './components/calendar/CalendarView';
import { TodoList } from './components/todo/TodoList';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { CategoryManagerModal } from './components/common/CategoryManagerModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);

  const handleOpenCreateModal = (status: TaskStatus = 'todo', date?: string) => {
    setTaskToEdit(null);
    setDefaultTaskStatus(status);
    setDefaultTaskDate(date);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
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
              onEditTask={handleEditTask}
              onOpenCreateModal={() => handleOpenCreateModal()}
            />
          )}

          {activeTab === 'board' && (
            <KanbanBoard
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'todo' && (
            <TodoList onEditTask={handleEditTask} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => handleOpenCreateModal()}
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
