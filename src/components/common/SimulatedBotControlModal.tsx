import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { botEngine, BotActivityLog } from '../../services/SimulatedBotEngine';
import {
  Bot,
  Zap,
  Play,
  Pause,
  MessageSquare,
  Mail,
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  X,
  Sparkles,
  RefreshCw,
  Building2,
  Sliders
} from 'lucide-react';
import { Department } from '../../types';

interface SimulatedBotControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatedBotControlModal: React.FC<SimulatedBotControlModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    isBotSuiteActive,
    toggleBotSuite,
    triggerInstantBotPulse,
    botSimulationCadence,
    setBotSimulationCadence,
    botPoolSize,
    allUsers,
    setActiveTab
  } = useWorkspace();

  const [activeTabSub, setActiveTabSub] = useState<'feed' | 'directory' | 'settings'>('feed');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<BotActivityLog[]>(() => botEngine.getActivityLogs());

  useEffect(() => {
    const unsubscribe = botEngine.subscribe((newLog) => {
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const botUsers = allUsers.filter((u) => u.id.startsWith('bot-emp-'));

  const filteredLogs = activityLogs.filter((log) => {
    if (topicFilter !== 'all' && log.topic !== topicFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.botName.toLowerCase().includes(q) ||
        log.preview.toLowerCase().includes(q) ||
        log.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredBots = botUsers.filter((bot) => {
    if (deptFilter !== 'all' && bot.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        bot.name.toLowerCase().includes(q) ||
        bot.designation.toLowerCase().includes(q) ||
        bot.email.toLowerCase().includes(q) ||
        bot.roleLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] max-h-[720px] flex flex-col border border-neutral-200 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  24/7 Simulated Employee Bot Suite
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isBotSuiteActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                  {isBotSuiteActive ? 'Active 24/7' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pool of {botPoolSize} simulated dummy accounts posting automated chat updates and operational webmails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerInstantBotPulse}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Force an instant bot post right now"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trigger Pulse</span>
            </button>
            <button
              onClick={toggleBotSuite}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isBotSuiteActive
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isBotSuiteActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isBotSuiteActive ? 'Pause Flow' : 'Resume'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 bg-neutral-50 text-xs shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTabSub('feed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTabSub === 'feed'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Live Simulation Feed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-mono">
                {activityLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTabSub('directory')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTabSub === 'directory'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>110+ Bot Accounts Directory</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-mono">
                {botUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTabSub('settings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTabSub === 'settings'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cadence & Topics</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-neutral-500 hidden md:block">
            Posting Cadence: ~{botSimulationCadence}s ({isBotSuiteActive ? 'Broadcasting' : 'Idle'})
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: Live Feed */}
          {activeTabSub === 'feed' && (
            <div className="space-y-4">
              {/* Search & Topic Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bot messages & emails..."
                    className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 w-full sm:w-60 focus:outline-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
                  <span className="text-neutral-400 font-semibold shrink-0">Topic:</span>
                  {[
                    { id: 'all', label: 'All Topics' },
                    { id: 'verification_targets', label: 'Verification Targets' },
                    { id: 'ops_progress', label: 'Ops Progress' },
                    { id: 'hr_attendance', label: 'HR & Attendance' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTopicFilter(t.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                        topicFilter === t.id
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Stream */}
              <div className="space-y-2.5">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-emerald-400 transition shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === 'chat' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-bold text-xs text-neutral-900">{log.botName}</span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          ({log.department})
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-1">
                          {log.type === 'chat' ? (
                            <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Mail className="w-2.5 h-2.5 text-blue-600" />
                          )}
                          <span>{log.destination}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{log.timestamp}</span>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                      {log.preview}
                    </p>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                    No simulation records match your filter. Bot engine continues posting active updates in the background.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Bot Directory (110+ Accounts) */}
          {activeTabSub === 'directory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 110+ simulated employees..."
                    className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 w-full sm:w-64 focus:outline-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
                  <span className="text-neutral-400 font-semibold shrink-0">Dept:</span>
                  {['all', 'Managers', 'Business', 'HR', 'Accounts', 'IT'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDeptFilter(d)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                        deptFilter === d
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {d === 'all' ? 'All' : d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-emerald-300 transition flex items-start gap-2.5 shadow-2xs"
                  >
                    <img
                      src={bot.avatarUrl}
                      alt={bot.name}
                      className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 truncate">
                          {bot.name}
                        </span>
                        <span className="text-[9px] font-mono px-1 rounded bg-neutral-100 text-neutral-600 shrink-0">
                          {bot.department}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                        {bot.designation}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">
                        {bot.email}
                      </p>

                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500">24/7 Simulator</span>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            onClose();
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer hover:underline"
                        >
                          Message in Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Cadence & Settings */}
          {activeTabSub === 'settings' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Posting Cadence & Automation Frequency</span>
                </h4>
                <p className="text-xs text-neutral-600">
                  Select how frequently the 100+ bot suite posts automated updates to Team Chat and sends operational emails to Webmail.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { sec: 20, label: 'Hyperactive', desc: 'Every 20 sec' },
                    { sec: 45, label: 'Standard (Req)', desc: 'Every 45 sec' },
                    { sec: 60, label: '1 Minute', desc: 'Every 60 sec' },
                    { sec: 120, label: 'Relaxed', desc: 'Every 2 mins' }
                  ].map((cad) => (
                    <button
                      key={cad.sec}
                      onClick={() => setBotSimulationCadence(cad.sec)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        botSimulationCadence === cad.sec
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{cad.label}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{cad.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Topics Covered 24/7 by the Bot Suite</span>
                </h4>
                <ul className="text-xs text-neutral-600 space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Daily Account Verification Targets</strong>: Real-time progress updates on Google Ads, Meta Ads, Telegram Merchant accounts, and Shopify audits.
                  </li>
                  <li>
                    <strong>Operations Verification Progress</strong>: Ops queue review locks, SLA turnaround alerts, anti-fraud flags, and deal verification sign-offs.
                  </li>
                  <li>
                    <strong>HR Attendance & Policies</strong>: Morning punch grace periods, shift roster notices, break governance overstays, and regularization reminders.
                  </li>
                  <li>
                    <strong>IT Infrastructure & Security</strong>: Biometric server health, 2FA enforcement checks, and database compliance sync runs.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Workspace Flow Enabled across All Channels & Mailboxes</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
