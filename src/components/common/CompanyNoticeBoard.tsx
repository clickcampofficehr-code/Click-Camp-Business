import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CompanyNotice, NoticeCategory, NoticePriority } from '../../types';
import {
  Bell,
  Megaphone,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Search,
  Radio,
  Eye,
  Check,
  X,
  Clock,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';

interface CompanyNoticeBoardProps {
  compact?: boolean;
  defaultTab?: string;
  isAdminView?: boolean;
}

export const CompanyNoticeBoard: React.FC<CompanyNoticeBoardProps> = ({
  compact = false,
  defaultTab = 'all',
  isAdminView = false
}) => {
  const {
    currentUser,
    allUsers,
    notices,
    postNotice,
    updateNotice,
    deleteNotice,
    acknowledgeNotice,
    pinNotice,
    refreshNotices
  } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState<string>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<CompanyNotice | null>(null);
  const [viewingAcksNotice, setViewingAcksNotice] = useState<CompanyNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as NoticeCategory,
    priority: 'normal' as NoticePriority,
    targetDepartment: 'All Departments',
    isPinned: false
  });

  const isPrivileged =
    currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'hr';

  // Filter notices
  const filteredNotices = notices.filter((notice) => {
    // Department target check
    if (
      notice.targetDepartment !== 'All Departments' &&
      notice.targetDepartment !== 'All' &&
      currentUser.role !== 'super_admin' &&
      currentUser.role !== 'admin' &&
      notice.targetDepartment.toLowerCase() !== currentUser.department.toLowerCase()
    ) {
      return false;
    }

    if (selectedCategory !== 'all' && notice.category !== selectedCategory) {
      return false;
    }

    if (filterUnreadOnly && notice.acknowledgements?.includes(currentUser.id)) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notice.title.toLowerCase().includes(q);
      const matchContent = notice.content.toLowerCase().includes(q);
      const matchAuthor = notice.authorName.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) {
        return false;
      }
    }

    return true;
  });

  // Sort notices: Pinned first, then by priority (urgent > high > normal > info), then by createdAt desc
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    const priorityWeight: Record<NoticePriority, number> = {
      urgent: 4,
      high: 3,
      normal: 2,
      info: 1
    };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const categories: { label: string; value: string }[] = [
    { label: 'All Notices', value: 'all' },
    { label: 'General', value: 'General' },
    { label: 'Operations', value: 'Operations' },
    { label: 'HR & Policy', value: 'HR & Policy' },
    { label: 'Maintenance', value: 'System Maintenance' },
    { label: 'Holidays', value: 'Holiday & Event' }
  ];

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      category: 'General',
      priority: 'normal',
      targetDepartment: 'All Departments',
      isPinned: false
    });
    setIsPostModalOpen(true);
  };

  const handleOpenEditModal = (n: CompanyNotice) => {
    setEditingNotice(n);
    setFormData({
      title: n.title,
      content: n.content,
      category: n.category,
      priority: n.priority,
      targetDepartment: n.targetDepartment,
      isPinned: n.isPinned
    });
    setIsPostModalOpen(true);
  };

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          priority: formData.priority,
          targetDepartment: formData.targetDepartment,
          isPinned: formData.isPinned
        });
      } else {
        await postNotice({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          priority: formData.priority,
          targetDepartment: formData.targetDepartment,
          isPinned: formData.isPinned
        });
      }
      setIsPostModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: NoticePriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Urgent</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span>High Priority</span>
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <Info className="w-3 h-3 text-sky-600" />
            <span>Advisory</span>
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span>Official Circular</span>
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                Company Notice Board
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10.5px] font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Broadcast</span>
              </span>
            </div>
            <p className="text-[11.5px] text-neutral-500 mt-0.5">
              Official company circulars, policy updates, and executive announcements from Super Admin.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isPrivileged && (
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Post Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 border-b border-neutral-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Unread Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition ${
              filterUnreadOnly
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Unacknowledged
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="p-4 sm:p-5 space-y-3.5 max-h-[580px] overflow-y-auto">
        {sortedNotices.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            <Megaphone className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="text-xs font-semibold text-neutral-700">No announcements match your filter</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              All official notices will be broadcast here in real time.
            </p>
          </div>
        ) : (
          sortedNotices.map((notice) => {
            const hasAcknowledged = notice.acknowledgements?.includes(currentUser.id);
            const ackCount = notice.acknowledgements?.length || 0;

            return (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border transition-all ${
                  notice.isPinned
                    ? 'bg-amber-50/20 border-amber-300/80 shadow-xs'
                    : notice.priority === 'urgent'
                    ? 'bg-rose-50/25 border-rose-200 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-2.5 border-b border-neutral-100">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <Pin className="w-3 h-3 text-amber-700" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {getPriorityBadge(notice.priority)}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600">
                        {notice.category}
                      </span>
                      {notice.targetDepartment && notice.targetDepartment !== 'All Departments' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Dept: {notice.targetDepartment}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {notice.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-neutral-400" />
                        <span className="font-semibold text-neutral-700">{notice.authorName}</span>
                        <span className="text-neutral-400">({notice.authorRole})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(notice.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Administrative Controls */}
                  {isPrivileged && (
                    <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                      <button
                        onClick={() => pinNotice(notice.id, !notice.isPinned)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                          notice.isPinned
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}
                        title={notice.isPinned ? 'Unpin Announcement' : 'Pin to Top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(notice)}
                        className="p-1.5 rounded-lg border bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 text-xs cursor-pointer transition"
                        title="Edit Announcement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete circular "${notice.title}"?`)) {
                            deleteNotice(notice.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border bg-neutral-50 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border-neutral-200 text-xs cursor-pointer transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="pt-3 text-xs text-neutral-700 leading-relaxed whitespace-pre-line font-normal">
                  {notice.content}
                </div>

                {/* Footer / Acknowledgement Bar */}
                <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingAcksNotice(notice)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1 cursor-pointer transition"
                      title="View employees who acknowledged"
                    >
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{ackCount} acknowledged</span>
                    </button>
                  </div>

                  <div>
                    {hasAcknowledged ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeNotice(notice.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Post / Edit Announcement (Admin Only) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {editingNotice ? 'Edit Circular / Notice' : 'Post Official Announcement'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Broadcast to employee dashboards with real-time database sync.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNotice} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Company Strategy & Operational Guidelines"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as NoticeCategory })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Operations">Operations</option>
                    <option value="HR & Policy">HR & Policy</option>
                    <option value="System Maintenance">System Maintenance</option>
                    <option value="Holiday & Event">Holiday & Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as NoticePriority })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert</option>
                    <option value="info">Advisory / Info</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Target Department
                  </label>
                  <select
                    value={formData.targetDepartment}
                    onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="All Departments">All Personnel</option>
                    <option value="Operations & Verification">Operations & Verification</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Client Acquisition & Growth">Client Acquisition & Growth</option>
                    <option value="Executive Leadership & Governance">Executive Leadership</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-neutral-800">Pin to Top</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Circular Body Content *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Draft the announcement details, effective dates, protocols, or action items required from personnel..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{editingNotice ? 'Save Changes' : 'Broadcast Announcement'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Acknowledgements */}
      {viewingAcksNotice && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div>
                <h3 className="text-xs font-bold text-neutral-900">Acknowledgement Receipts</h3>
                <p className="text-[11px] text-neutral-500 truncate max-w-[280px]">
                  {viewingAcksNotice.title}
                </p>
              </div>
              <button
                onClick={() => setViewingAcksNotice(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto space-y-2">
              {viewingAcksNotice.acknowledgements && viewingAcksNotice.acknowledgements.length > 0 ? (
                viewingAcksNotice.acknowledgements.map((userId, i) => {
                  const ackUser = allUsers.find((u) => u.id === userId);
                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {ackUser?.name?.charAt(0) || '✓'}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-800">
                            {ackUser?.name || `Employee ${userId}`}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {ackUser?.designation || ackUser?.roleLabel || 'Staff Member'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Acknowledged
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-neutral-500 text-center py-6">
                  No employee receipts logged yet.
                </p>
              )}
            </div>

            <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-right">
              <button
                onClick={() => setViewingAcksNotice(null)}
                className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
