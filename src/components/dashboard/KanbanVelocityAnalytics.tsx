import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Users,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  BarChart3,
  Calendar,
  Zap,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  KanbanProject,
  KanbanSprint,
  KanbanTask
} from '../../types';
import {
  computeSprintVelocity,
  computeVelocitySummary,
  computeBurndownData,
  computeTaskThroughput,
  computeCumulativeFlow,
  computePriorityStats,
  computeCategoryStats,
  computeAssigneeVelocity
} from '../../lib/kanbanAnalytics';

interface KanbanVelocityAnalyticsProps {
  projects: KanbanProject[];
  sprints: KanbanSprint[];
  tasks: KanbanTask[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  selectedSprintId: string;
  onSelectSprint: (sprintId: string) => void;
  onSwitchToBoard?: () => void;
}

export const KanbanVelocityAnalytics: React.FC<KanbanVelocityAnalyticsProps> = ({
  projects,
  sprints,
  tasks,
  selectedProjectId,
  onSelectProject,
  selectedSprintId,
  onSelectSprint,
  onSwitchToBoard
}) => {
  // Chart tab state: 'velocity' | 'completion' | 'burndown' | 'cfd' | 'team'
  const [activeChartTab, setActiveChartTab] = useState<
    'velocity' | 'completion' | 'burndown' | 'cfd' | 'team'
  >('velocity');

  // Filter state
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Current selected project and sprint
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectSprints = sprints.filter((s) => s.projectId === currentProject.id);
  const currentSprint = projectSprints.find((s) => s.id === selectedSprintId) || projectSprints[projectSprints.length - 1] || sprints[0];

  // Filtered tasks for the selected project & sprint
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchProject = t.projectId === currentProject.id;
      const matchSprint = selectedSprintId === 'all' || t.sprintId === currentSprint.id;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchAssignee = assigneeFilter === 'all' || t.assigneeId === assigneeFilter;
      return matchProject && matchSprint && matchPriority && matchCategory && matchAssignee;
    });
  }, [tasks, currentProject.id, currentSprint.id, selectedSprintId, priorityFilter, categoryFilter, assigneeFilter]);

  // Velocity calculations
  const velocityData = useMemo(() => {
    return computeSprintVelocity(projectSprints, tasks, currentSprint.id);
  }, [projectSprints, tasks, currentSprint.id]);

  const summaryMetrics = useMemo(() => {
    return computeVelocitySummary(projectSprints, tasks, currentSprint.id);
  }, [projectSprints, tasks, currentSprint.id]);

  const burndownData = useMemo(() => {
    return computeBurndownData(currentSprint, tasks);
  }, [currentSprint, tasks]);

  const throughputData = useMemo(() => {
    return computeTaskThroughput(filteredTasks);
  }, [filteredTasks]);

  const cfdData = useMemo(() => {
    return computeCumulativeFlow(filteredTasks);
  }, [filteredTasks]);

  const priorityStats = useMemo(() => {
    return computePriorityStats(filteredTasks);
  }, [filteredTasks]);

  const categoryStats = useMemo(() => {
    return computeCategoryStats(filteredTasks);
  }, [filteredTasks]);

  const assigneeStats = useMemo(() => {
    return computeAssigneeVelocity(filteredTasks);
  }, [filteredTasks]);

  // Unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assigneeId && t.assigneeName) {
        map.set(t.assigneeId, t.assigneeName);
      }
    });
    return Array.from(map.entries());
  }, [tasks]);

  // Custom tooltips adhering to anti-slop guidelines
  const CustomVelocityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-xl border border-neutral-800 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-neutral-200 pb-1 border-b border-neutral-800 flex items-center justify-between">
            <span>{label}</span>
            <span className="font-mono text-emerald-400">{data.velocityRate}% Delivered</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Committed:</span>
            <span className="font-mono font-bold">{data.committedPoints} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-400">Completed:</span>
            <span className="font-mono font-bold text-emerald-400">{data.completedPoints} pts</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px]">
            <span className="text-indigo-300">3-Sprint Rolling Avg:</span>
            <span className="font-mono font-bold text-indigo-300">{data.movingAverage} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBurndownTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ideal = payload.find((p: any) => p.dataKey === 'idealRemaining')?.value;
      const actual = payload.find((p: any) => p.dataKey === 'actualRemaining')?.value;
      const delta = actual !== undefined && ideal !== undefined ? actual - ideal : 0;

      return (
        <div className="bg-neutral-900 text-white p-3 rounded-xl border border-neutral-800 shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <div className="font-bold text-neutral-200 pb-1 border-b border-neutral-800">{label}</div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Ideal Guideline:</span>
            <span className="font-mono font-bold">{ideal} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-400">Actual Remaining:</span>
            <span className="font-mono font-bold text-blue-400">{actual} pts</span>
          </div>
          <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Sprint Pace Delta:</span>
            <span className={`font-mono font-bold ${delta <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {delta <= 0 ? `${Math.abs(delta)} pts ahead` : `${delta} pts behind`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomThroughputTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-xl border border-neutral-800 shadow-xl text-xs space-y-1.5 min-w-[180px]">
          <div className="font-bold text-neutral-200 pb-1 border-b border-neutral-800">{label}</div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-400">Completed on Day:</span>
            <span className="font-mono font-bold text-emerald-400">{data.completedTasks} tasks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-indigo-400">Cumulative Completed:</span>
            <span className="font-mono font-bold text-indigo-400">{data.cumulativeCompleted} tasks</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. ANALYTICS HEADER & VIEW SWITCHER                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>Project Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Agile Delivery Governance</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Live Recharts Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Project Velocity & Task Completion Analytics</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Empirical sprint throughput, story point velocity trend, burndown tracking, and cycle time distribution.
          </p>
        </div>

        {/* Action Controls & Board Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onSwitchToBoard && (
            <button
              onClick={onSwitchToBoard}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Back to Kanban Board</span>
            </button>
          )}

          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => {
                onSelectProject(e.target.value);
                const firstSprint = sprints.find((s) => s.projectId === e.target.value);
                if (firstSprint) onSelectSprint(firstSprint.id);
              }}
              className="appearance-none px-3 py-2 pr-8 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Sprint Selector */}
          <div className="relative">
            <select
              value={selectedSprintId}
              onChange={(e) => onSelectSprint(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              {projectSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === 'active' ? '(Current Active)' : '(Closed)'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRIC SCORECARDS (Tabular Figures & Anti-Slop Disciplined)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Sprint Velocity */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Sprint Velocity</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {summaryMetrics.totalCompletedActive}
            </span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              / {summaryMetrics.totalCommittedActive} pts
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="font-semibold text-emerald-600 font-mono tabular-nums">
              {summaryMetrics.activeCompletionRate}%
            </span>
            <span className="text-neutral-500">active sprint delivery rate</span>
          </div>
        </div>

        {/* Metric 2: Average Moving Velocity */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Rolling Avg Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {summaryMetrics.averageVelocity}
            </span>
            <span className="text-xs text-neutral-500 font-mono">pts / sprint</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="font-semibold text-emerald-600 font-mono tabular-nums flex items-center">
              <ArrowUpRight className="w-3 h-3" />+{summaryMetrics.velocityAcceleration}%
            </span>
            <span className="text-neutral-500">sprint-over-sprint acceleration</span>
          </div>
        </div>

        {/* Metric 3: Predictability & Commitment Accuracy */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Velocity Reliability</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {summaryMetrics.velocityPredictability}%
            </span>
            <span className="text-xs text-neutral-500 font-mono">predictability</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="text-neutral-500">Based on past 4 completed sprints</span>
          </div>
        </div>

        {/* Metric 4: Cycle Time & Lead Time */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Avg Cycle & Lead Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
              {summaryMetrics.averageCycleTimeDays}
            </span>
            <span className="text-xs text-neutral-500 font-mono">days (cycle)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px]">
            <span className="font-mono text-neutral-700 font-semibold">{summaryMetrics.averageLeadTimeDays}d</span>
            <span className="text-neutral-500">avg lead time from backlog</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CHART NAVIGATION TABS & FILTER BAR                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          {/* Segmented Chart Navigation Buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto max-w-full">
            {[
              { id: 'velocity', label: 'Sprint Velocity Trend', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: 'burndown', label: 'Sprint Burndown', icon: <Flame className="w-3.5 h-3.5" /> },
              { id: 'completion', label: 'Throughput & Completion', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
              { id: 'cfd', label: 'Cumulative Flow (CFD)', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'team', label: 'Team Velocity Breakdown', icon: <Users className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as typeof activeChartTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeChartTab === tab.id
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Info Indicator */}
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <span>Sprint Goal:</span>
            <span className="font-medium text-neutral-800 italic truncate max-w-xs">{currentSprint.goal}</span>
          </div>
        </div>

        {/* Interactive Filters Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 text-neutral-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Metrics:</span>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-700 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Feature">Feature</option>
            <option value="Bug">Bug</option>
            <option value="Security">Security</option>
            <option value="Improvement">Improvement</option>
            <option value="DevOps">DevOps</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg font-medium text-neutral-700 cursor-pointer"
          >
            <option value="all">All Assignees</option>
            {uniqueAssignees.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {(priorityFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all') && (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setCategoryFilter('all');
                setAssigneeFilter('all');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer ml-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-neutral-400 font-mono text-[11px] tabular-nums">
            Showing {filteredTasks.length} tasks ({filteredTasks.reduce((s, t) => s + (t.storyPoints || 0), 0)} pts)
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY RECHARTS VISUALIZATION CONTAINER                               */}
      {/* ========================================================================= */}

      {/* VIEW 1: SPRINT VELOCITY TREND */}
      {activeChartTab === 'velocity' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Sprint Velocity History & Rolling Moving Average</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Comparison of committed story points versus completed delivery with 3-sprint rolling trend.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" /> Committed Points
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Completed Points
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block" /> 3-Sprint Moving Avg
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="sprintName"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 10']}
                  label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <Tooltip content={<CustomVelocityTooltip />} />
                <ReferenceLine
                  y={summaryMetrics.averageVelocity}
                  stroke="#CBD5E1"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg Velocity (${summaryMetrics.averageVelocity} pts)`,
                    fill: '#64748B',
                    fontSize: 11,
                    position: 'top'
                  }}
                />
                <Bar
                  dataKey="committedPoints"
                  name="Committed Story Points"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="completedPoints"
                  name="Completed Story Points"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  name="3-Sprint Moving Avg"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Velocity Insights Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-neutral-100 text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="font-semibold text-neutral-800">Delivery Predictability</span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                The engineering team delivers an average of <span className="font-bold text-neutral-800">{summaryMetrics.velocityPredictability}%</span> of committed points each sprint.
              </p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="font-semibold text-neutral-800">Sprint Capacity Guideline</span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Recommended future commitment is capped at <span className="font-bold text-neutral-800">{summaryMetrics.averageVelocity} points</span> based on recent throughput.
              </p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="font-semibold text-neutral-800">Active Sprint Velocity</span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Current sprint has achieved <span className="font-bold text-emerald-600">{summaryMetrics.totalCompletedActive} of {summaryMetrics.totalCommittedActive} points</span> ({summaryMetrics.activeCompletionRate}%).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SPRINT BURNDOWN */}
      {activeChartTab === 'burndown' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-600" />
                <span>Sprint Burndown Chart ({currentSprint.name})</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Track remaining story points against the ideal linear burn rate across the 10-day sprint cycle.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-slate-400 border border-dashed inline-block" /> Ideal Guideline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-1 bg-blue-600 inline-block rounded-full" /> Actual Remaining Points
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Remaining Points', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <Tooltip content={<CustomBurndownTooltip />} />
                <Line
                  type="linear"
                  dataKey="idealRemaining"
                  name="Ideal Guideline"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="actualRemaining"
                  name="Actual Remaining"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">On-Track Delivery Velocity</span>
              <p className="text-blue-700 text-[11px] mt-0.5">
                The active burndown curve shows the team is currently trending 3 points ahead of the linear burn rate guideline.
                All 7 done tasks were completed within standard SLA parameters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: THROUGHPUT & COMPLETION OVER TIME */}
      {activeChartTab === 'completion' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily Task Completion & Throughput</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Number of tasks finished daily and cumulative velocity throughput across the sprint window.
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Tasks Completed', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <Tooltip content={<CustomThroughputTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeCompleted"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                  name="Cumulative Completed"
                />
                <Bar dataKey="completedTasks" fill="#3B82F6" name="Tasks Completed Daily" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 4: CUMULATIVE FLOW DIAGRAM (CFD) */}
      {activeChartTab === 'cfd' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Cumulative Flow Diagram (CFD)</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Visualize work-in-progress across Kanban stages to identify bottlenecks and process stability.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done
              </span>
              <span className="flex items-center gap-1 text-purple-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> In Review
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> To Do
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Backlog
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cfdData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Total Items in Pipeline', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }}
                />
                <Tooltip />
                <Area type="monotone" dataKey="done" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
                <Area type="monotone" dataKey="inReview" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.8} />
                <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.8} />
                <Area type="monotone" dataKey="todo" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} />
                <Area type="monotone" dataKey="backlog" stackId="1" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-neutral-500 italic text-center">
            Smooth expanding bands indicate healthy flow with low queue buildup. Constant width of In-Progress confirms effective WIP limit discipline.
          </p>
        </div>
      )}

      {/* VIEW 5: TEAM VELOCITY & TASK BREAKDOWN */}
      {activeChartTab === 'team' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Team Member Velocity & Execution Distribution</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Completed story points, logged effort hours, and velocity contribution per assignee.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Tasks (Done / Total)</th>
                  <th className="py-2.5 px-3 text-right">Story Points</th>
                  <th className="py-2.5 px-3 text-right">Logged Hours</th>
                  <th className="py-2.5 px-3 text-right">Velocity Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {assigneeStats.map((member) => (
                  <tr key={member.assigneeId || member.assigneeName} className="hover:bg-neutral-50 transition">
                    <td className="py-3 px-3 font-bold text-neutral-900">
                      {member.assigneeName}
                    </td>
                    <td className="py-3 px-3 text-neutral-600">{member.assigneeRole}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                      <span className="text-emerald-600">{member.completedTasks}</span> / {member.totalTasks}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      <span className="text-emerald-600">{member.completedPoints}</span> / {member.totalPoints} pts
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-neutral-600 tabular-nums">
                      {member.loggedHours}h / {member.estimatedHours}h
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, member.velocityContributionRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-neutral-800 text-[11px] tabular-nums">
                          {member.velocityContributionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SECONDARY METRICS: PRIORITY & CATEGORY DISTRIBUTIONS                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Completion Rate */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100 flex items-center justify-between">
            <span>Completion Rate by Priority</span>
            <Target className="w-4 h-4 text-rose-600" />
          </h3>

          <div className="space-y-3">
            {priorityStats.map((p) => (
              <div key={p.priority} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label}
                  </span>
                  <div className="font-mono text-[11px] tabular-nums text-neutral-600">
                    <span className="font-bold text-neutral-900">{p.completed}</span> / {p.total} tasks
                    <span className="text-neutral-400 mx-1">·</span>
                    <span className="font-bold text-neutral-900">{p.completedPoints}</span> / {p.totalPoints} pts
                    <span className="text-neutral-400 mx-1">·</span>
                    <span className="font-semibold text-emerald-600">{p.rate}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.rate}%`,
                      backgroundColor: p.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100 flex items-center justify-between">
            <span>Engineering Discipline Distribution</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </h3>

          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.category}
                  </span>
                  <div className="font-mono text-[11px] tabular-nums text-neutral-600">
                    <span className="font-bold text-neutral-900">{cat.count}</span> tasks
                    <span className="text-neutral-400 mx-1">·</span>
                    <span className="font-bold text-neutral-900">{cat.points}</span> pts
                    <span className="text-neutral-400 mx-1">·</span>
                    <span className="font-semibold text-emerald-600">{cat.rate}% done</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${cat.rate}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
