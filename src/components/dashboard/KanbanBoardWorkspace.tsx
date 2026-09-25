import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  KanbanProject,
  KanbanSprint,
  KanbanTask,
  KanbanTaskStatus,
  KanbanPriority,
  KanbanCategory
} from '../../types';
import {
  initialKanbanProjects,
  initialKanbanSprints,
  initialKanbanTasks
} from '../../data/initialKanbanData';
import {
  Layers,
  BarChart3,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Check,
  X,
  Edit2,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  Calendar,
  User,
  Tag,
  Hash,
  ArrowUpRight
} from 'lucide-react';
import { KanbanVelocityAnalytics } from './KanbanVelocityAnalytics';

const KANBAN_STORAGE_PREFIX = 'clickcamp_kanban_v1_';

export const KanbanBoardWorkspace: React.FC = () => {
  const { currentUser, allUsers, showToast, recordAuditLog } = useWorkspace();

  // Active view: 'board' vs 'analytics'
  const [currentView, setCurrentView] = useState<'board' | 'analytics'>('board');

  // Projects state
  const [projects] = useState<KanbanProject[]>(() => {
    try {
      const saved = localStorage.getItem(`${KANBAN_STORAGE_PREFIX}projects`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialKanbanProjects;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0].id);

  // Sprints state
  const [sprints, setSprints] = useState<KanbanSprint[]>(() => {
    try {
      const saved = localStorage.getItem(`${KANBAN_STORAGE_PREFIX}sprints`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialKanbanSprints;
  });

  const activeProjectSprints = useMemo(
    () => sprints.filter((s) => s.projectId === selectedProjectId),
    [sprints, selectedProjectId]
  );

  const [selectedSprintId, setSelectedSprintId] = useState<string>(() => {
    const active = initialKanbanSprints.find((s) => s.status === 'active');
    return active ? active.id : initialKanbanSprints[0].id;
  });

  // Tasks state
  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    try {
      const saved = localStorage.getItem(`${KANBAN_STORAGE_PREFIX}tasks`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialKanbanTasks;
  });

  // Persist tasks in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${KANBAN_STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  // Current project & sprint objects
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentSprint =
    activeProjectSprints.find((s) => s.id === selectedSprintId) ||
    activeProjectSprints.find((s) => s.status === 'active') ||
    activeProjectSprints[0] ||
    sprints[0];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Modals state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [inspectingTask, setInspectingTask] = useState<KanbanTask | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<KanbanPriority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<KanbanCategory>('Feature');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(3);
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string>(currentUser.id);
  const [newTaskEstHours, setNewTaskEstHours] = useState<number>(8);
  const [newTaskStatus, setNewTaskStatus] = useState<KanbanTaskStatus>('todo');
  const [newTaskTags, setNewTaskTags] = useState('Frontend, UI');

  // Kanban column definitions with explicit WIP limits
  const columns: {
    id: KanbanTaskStatus;
    title: string;
    wipLimit?: number;
    color: string;
    headerBg: string;
  }[] = [
    { id: 'backlog', title: 'Backlog', color: 'border-slate-300 text-slate-700', headerBg: 'bg-slate-100/80' },
    { id: 'todo', title: 'To Do', wipLimit: 6, color: 'border-amber-300 text-amber-800', headerBg: 'bg-amber-50/80' },
    { id: 'in_progress', title: 'In Progress', wipLimit: 4, color: 'border-blue-300 text-blue-800', headerBg: 'bg-blue-50/80' },
    { id: 'in_review', title: 'In Review', wipLimit: 4, color: 'border-purple-300 text-purple-800', headerBg: 'bg-purple-50/80' },
    { id: 'done', title: 'Done', color: 'border-emerald-300 text-emerald-800', headerBg: 'bg-emerald-50/80' }
  ];

  // Filter tasks based on controls
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchProject = t.projectId === currentProject.id;
      const matchSprint = t.sprintId === currentSprint.id;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;

      return matchProject && matchSprint && matchSearch && matchPriority && matchCategory && matchAssignee;
    });
  }, [tasks, currentProject.id, currentSprint.id, searchQuery, priorityFilter, categoryFilter, assigneeFilter]);

  // Stage transition logic
  const stageOrder: KanbanTaskStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];

  const moveTask = (taskId: string, direction: 'next' | 'prev') => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentIndex = stageOrder.indexOf(t.status);
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= stageOrder.length) return t;

        const newStatus = stageOrder[nextIndex];
        const isDone = newStatus === 'done';
        const updated = {
          ...t,
          status: newStatus,
          completedAt: isDone ? new Date().toISOString().split('T')[0] : t.completedAt
        };

        recordAuditLog(
          'APPROVAL',
          `Kanban Task ${t.code} shifted from ${t.status} to ${newStatus} by ${currentUser.name}`
        );

        return updated;
      })
    );
  };

  const setTaskStatusDirect = (taskId: string, newStatus: KanbanTaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const isDone = newStatus === 'done';
        return {
          ...t,
          status: newStatus,
          completedAt: isDone ? (t.completedAt || new Date().toISOString().split('T')[0]) : undefined
        };
      })
    );
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedUser = allUsers.find((u) => u.id === newTaskAssigneeId) || currentUser;
    const taskCount = tasks.filter((t) => t.projectId === currentProject.id).length + 101;
    const code = `${currentProject.key}-${taskCount}`;

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      projectId: currentProject.id,
      sprintId: currentSprint.id,
      code,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'No description provided.',
      status: newTaskStatus,
      priority: newTaskPriority,
      storyPoints: Number(newTaskPoints) || 3,
      assigneeId: assignedUser.id,
      assigneeName: assignedUser.name,
      assigneeAvatar: assignedUser.avatarUrl || '',
      assigneeRole: assignedUser.designation || assignedUser.roleLabel,
      category: newTaskCategory,
      createdAt: new Date().toISOString().split('T')[0],
      completedAt: newTaskStatus === 'done' ? new Date().toISOString().split('T')[0] : undefined,
      estimatedHours: Number(newTaskEstHours) || 8,
      loggedHours: 0,
      tags: newTaskTags.split(',').map((s) => s.trim()).filter(Boolean)
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsAddTaskModalOpen(false);
    showToast(`Task ${code} created successfully.`);
    recordAuditLog('UPLOAD', `Created new Kanban Task: ${code} - ${newTask.title}`);

    // Reset form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPoints(3);
    setNewTaskEstHours(8);
  };

  // Sprint story point summary
  const sprintTasks = tasks.filter((t) => t.sprintId === currentSprint.id);
  const sprintCommittedPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const sprintCompletedPoints = sprintTasks
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const sprintCompletionRate =
    sprintCommittedPoints > 0 ? Math.round((sprintCompletedPoints / sprintCommittedPoints) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. KANBAN WORKSPACE TOP EXECUTIVE BAR                                     */}
      {/* ========================================================================= */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Agile Engineering & Delivery Console
            </span>
            <span className="text-xs text-neutral-400">{currentProject.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2.5">
            <span>{currentSprint.name}</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
              {currentSprint.status === 'active' ? 'Active Sprint' : 'Closed Sprint'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
            {currentSprint.goal}
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented View Switcher: Board vs Visual Analytics */}
          <div className="flex items-center gap-1 bg-neutral-800/90 p-1 rounded-xl border border-neutral-700">
            <button
              onClick={() => setCurrentView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                currentView === 'board'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                currentView === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Velocity Analytics</span>
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPRINT KPI BANNER (Available across both views)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase">
            <span>Sprint Velocity</span>
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {sprintCompletedPoints}
            </span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              / {sprintCommittedPoints} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, sprintCompletionRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums mt-1.5">
            {sprintCompletionRate}%
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {sprintTasks.filter((t) => t.status === 'done').length} of {sprintTasks.length} tasks resolved
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase">
            <span>Active WIP Count</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums mt-1.5">
            {sprintTasks.filter((t) => t.status === 'in_progress').length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Tasks currently in development</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase">
            <span>Sprint Window</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold font-mono text-neutral-900 mt-2">
            {currentSprint.startDate} → {currentSprint.endDate}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Sprint in active delivery cycle</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONDITIONAL VIEW: RECHARTS ANALYTICS vs INTERACTIVE KANBAN BOARD        */}
      {/* ========================================================================= */}
      {currentView === 'analytics' ? (
        <KanbanVelocityAnalytics
          projects={projects}
          sprints={sprints}
          tasks={tasks}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          selectedSprintId={selectedSprintId}
          onSelectSprint={setSelectedSprintId}
          onSwitchToBoard={() => setCurrentView('board')}
        />
      ) : (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, codes (PLAT-104), or tags..."
                className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-neutral-50 font-medium text-neutral-700 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-neutral-50 font-medium text-neutral-700 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Security">Security</option>
                <option value="Improvement">Improvement</option>
                <option value="DevOps">DevOps</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-neutral-200 rounded-xl bg-neutral-50 font-medium text-neutral-700 cursor-pointer"
              >
                <option value="all">All Assignees</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              {/* View Velocity Analytics Quick Jump */}
              <button
                onClick={() => setCurrentView('analytics')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Velocity Charts</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              const totalColPoints = colTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
              const isOverWip = col.wipLimit !== undefined && colTasks.length > col.wipLimit;

              return (
                <div
                  key={col.id}
                  className={`rounded-2xl border bg-neutral-50/70 p-3 flex flex-col min-h-[580px] shadow-xs ${
                    isOverWip ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/20' : 'border-neutral-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between ${col.headerBg} border-neutral-200/80`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-neutral-900">{col.title}</span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-2xs">
                          {colTasks.length}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                        {totalColPoints} story pts
                      </span>
                    </div>

                    {/* WIP limit warning badge */}
                    {col.wipLimit && (
                      <div className="text-right">
                        <span className={`text-[10px] font-mono font-semibold ${isOverWip ? 'text-amber-700' : 'text-neutral-400'}`}>
                          WIP {colTasks.length}/{col.wipLimit}
                        </span>
                        {isOverWip && (
                          <div className="text-[9px] font-bold text-amber-700 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Limit Exceeded
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks Container */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[680px] pr-0.5">
                    {colTasks.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
                        No tasks in {col.title}
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const priorityColor =
                          task.priority === 'urgent'
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : task.priority === 'high'
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : task.priority === 'medium'
                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                            : 'text-neutral-600 bg-neutral-100 border-neutral-200';

                        return (
                          <div
                            key={task.id}
                            className="bg-white p-3 rounded-xl border border-neutral-200/90 shadow-xs hover:shadow-sm transition text-xs space-y-2 group cursor-pointer"
                            onClick={() => setInspectingTask(task)}
                          >
                            {/* Card Header: Code & Priority */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-[11px] text-neutral-800">
                                {task.code}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className="font-mono font-bold text-[11px] text-neutral-700 px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200">
                                  {task.storyPoints} pts
                                </span>
                              </div>
                            </div>

                            {/* Card Title */}
                            <h4 className="font-bold text-neutral-900 leading-snug line-clamp-2">
                              {task.title}
                            </h4>

                            {/* Category & Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="font-semibold text-neutral-600">{task.category}</span>
                              {task.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-neutral-400">
                                  · #{tag}
                                </span>
                              ))}
                            </div>

                            {/* Assignee & Hours Footer */}
                            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {task.assigneeAvatar ? (
                                  <img
                                    src={task.assigneeAvatar}
                                    alt={task.assigneeName}
                                    className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-[9px]">
                                    {task.assigneeName.charAt(0)}
                                  </div>
                                )}
                                <span className="text-neutral-700 font-medium truncate max-w-[85px]">
                                  {task.assigneeName}
                                </span>
                              </div>

                              {/* Stage movement buttons */}
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {col.id !== 'backlog' && (
                                  <button
                                    onClick={() => moveTask(task.id, 'prev')}
                                    title="Move to previous column"
                                    className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition cursor-pointer"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {col.id !== 'done' && (
                                  <button
                                    onClick={() => moveTask(task.id, 'next')}
                                    title="Advance to next column"
                                    className="p-1 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE NEW KANBAN TASK                                          */}
      {/* ========================================================================= */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Create New Kanban Task</h3>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Webhook Dispatcher for CRM Conversions"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Technical Specification / Description</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details, acceptance criteria, SLA requirements..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Priority Level *</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as KanbanPriority)}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="urgent">Urgent Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discipline Category *</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as KanbanCategory)}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Feature">Feature Delivery</option>
                    <option value="Bug">Defect / Bugfix</option>
                    <option value="Security">Security & Vault</option>
                    <option value="Improvement">Optimization</option>
                    <option value="DevOps">DevOps & Cloud</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Story Points *</label>
                  <select
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-mono font-bold"
                  >
                    <option value="1">1 Point</option>
                    <option value="2">2 Points</option>
                    <option value="3">3 Points</option>
                    <option value="5">5 Points</option>
                    <option value="8">8 Points</option>
                    <option value="13">13 Points</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newTaskEstHours}
                    onChange={(e) => setNewTaskEstHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Initial Stage</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as KanbanTaskStatus)}
                    className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                  >
                    <option value="todo">To Do</option>
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Assignee</label>
                <select
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-neutral-300 rounded-xl bg-white font-medium"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.designation || u.roleLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  placeholder="e.g. Backend, Auth, API"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Commit to Sprint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: TASK INSPECTION & EDIT                                          */}
      {/* ========================================================================= */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                  {inspectingTask.code}
                </span>
                <h3 className="font-bold text-neutral-900 text-sm truncate max-w-md">
                  {inspectingTask.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingTask(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-neutral-500">Description</span>
                <p className="text-neutral-800 text-xs mt-1 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {inspectingTask.description}
                </p>
              </div>

              {/* Status and Velocity Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Stage</span>
                  <p className="font-bold text-neutral-900 capitalize mt-0.5">{inspectingTask.status.replace('_', ' ')}</p>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Velocity Weight</span>
                  <p className="font-bold font-mono text-neutral-900 mt-0.5">{inspectingTask.storyPoints} Story Points</p>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Priority</span>
                  <p className="font-bold text-neutral-900 capitalize mt-0.5">{inspectingTask.priority}</p>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Effort Log</span>
                  <p className="font-bold font-mono text-neutral-900 mt-0.5">{inspectingTask.loggedHours}h / {inspectingTask.estimatedHours}h</p>
                </div>
              </div>

              {/* Assignee & Dates */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2">
                  {inspectingTask.assigneeAvatar ? (
                    <img
                      src={inspectingTask.assigneeAvatar}
                      alt={inspectingTask.assigneeName}
                      className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center text-xs">
                      {inspectingTask.assigneeName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-neutral-900">{inspectingTask.assigneeName}</span>
                    <p className="text-[11px] text-neutral-500">{inspectingTask.assigneeRole}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-neutral-500">
                  <span>Created: {inspectingTask.createdAt}</span>
                  {inspectingTask.completedAt && (
                    <p className="text-emerald-600 font-semibold">Done: {inspectingTask.completedAt}</p>
                  )}
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div>
                <span className="font-semibold text-neutral-700 block mb-1.5">Direct Stage Transition</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {columns.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setTaskStatusDirect(inspectingTask.id, c.id);
                        setInspectingTask({ ...inspectingTask, status: c.id });
                        showToast(`Task moved to ${c.title}`);
                      }}
                      className={`py-2 px-1 text-center rounded-lg font-semibold text-[11px] transition cursor-pointer ${
                        inspectingTask.status === c.id
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('analytics');
                    setInspectingTask(null);
                  }}
                  className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View in Velocity Analytics</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingTask(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
