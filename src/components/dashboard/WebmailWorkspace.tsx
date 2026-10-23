import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WebmailItem } from '../../types';
import {
  Mail,
  Inbox,
  Send,
  Star,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Reply,
  Forward,
  Paperclip,
  X,
  AlertCircle,
  ChevronLeft,
  Bot,
  Zap
} from 'lucide-react';
import { SimulatedBotControlModal } from '../common/SimulatedBotControlModal';

export const WebmailWorkspace: React.FC = () => {
  const { webmail, sendWebmail, toggleStarEmail, softDeleteEmail, allUsers, currentUser } = useWorkspace();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'trash'>('inbox');
  const [selectedMail, setSelectedMail] = useState<WebmailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('operations@clickcamp.site');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const folders = [
    {
      id: 'inbox' as const,
      label: 'Inbox',
      icon: <Inbox className="w-3.5 h-3.5" />,
      count: webmail.filter((m) => (m.folder === 'inbox' || !m.folder) && !m.isRead && !m.isHiddenFromUser).length
    },
    {
      id: 'starred' as const,
      label: 'Starred',
      icon: <Star className="w-3.5 h-3.5" />,
      count: webmail.filter((m) => m.isStarred && !m.isHiddenFromUser).length
    },
    {
      id: 'sent' as const,
      label: 'Sent Mail',
      icon: <Send className="w-3.5 h-3.5" />,
      count: webmail.filter((m) => m.folder === 'sent' && !m.isHiddenFromUser).length
    },
    {
      id: 'trash' as const,
      label: 'Trash',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      count: webmail.filter((m) => m.folder === 'trash' || m.isHiddenFromUser).length
    }
  ];

  // Filter emails based on folder and search (Step 3: Soft Deletes handled gracefully)
  const filteredMails = webmail.filter((item) => {
    let matchesFolder = false;
    if (activeFolder === 'inbox') {
      matchesFolder = (item.folder === 'inbox' || !item.folder) && !item.isHiddenFromUser;
    } else if (activeFolder === 'sent') {
      matchesFolder = item.folder === 'sent' && !item.isHiddenFromUser;
    } else if (activeFolder === 'starred') {
      matchesFolder = Boolean(item.isStarred) && !item.isHiddenFromUser;
    } else if (activeFolder === 'trash') {
      matchesFolder = item.folder === 'trash' || Boolean(item.isHiddenFromUser);
    }

    const matchesSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesSearch;
  });

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;
    sendWebmail(composeTo, composeSubject, composeBody);
    setIsComposeOpen(false);
    setComposeSubject('');
    setComposeBody('');
    setActiveFolder('sent');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100dvh-175px)] md:h-[calc(100vh-140px)] min-h-[480px] md:min-h-[560px]">
      {/* Sidebar Folders - Desktop */}
      <div className="hidden md:flex md:w-56 bg-neutral-900 text-white p-4 flex-col justify-between border-r border-neutral-800 shrink-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              @
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">ClickCamp Mail</h3>
              <p className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px]">{currentUser.email}</p>
            </div>
          </div>

          {/* Compose Button */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm mb-4"
          >
            <Edit3 className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          {/* Folder items */}
          <div className="space-y-1">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id);
                  setSelectedMail(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeFolder === f.id
                    ? 'bg-neutral-800 text-emerald-400 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
                {f.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Storage quota */}
        <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400">
          <div className="flex justify-between mb-1">
            <span>Storage: 4.8 GB</span>
            <span>15 GB</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-1/3" />
          </div>
        </div>

        {/* 110 Bot Suite Status */}
        <div className="pt-3 border-t border-neutral-800">
          <button
            onClick={() => setIsBotModalOpen(true)}
            className="w-full p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80 text-[11px] font-semibold flex items-center justify-between transition cursor-pointer"
            title="110+ Simulated Employee Bots Active"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span className="truncate">110 Bot Suite Flow</span>
            </div>
            <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
              24/7
            </span>
          </button>
        </div>
      </div>

      {/* Center: Email List (Full width on mobile when no email is selected) */}
      <div className={`w-full md:w-80 border-r border-neutral-200 flex flex-col bg-white shrink-0 ${selectedMail ? 'hidden md:flex' : 'flex'}`}>
        {/* Mobile Header with Folders & Compose */}
        <div className="md:hidden bg-neutral-900 text-white p-3 border-b border-neutral-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                @
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">ClickCamp Mail</h3>
                <span className="text-[10px] text-neutral-400 font-mono">{currentUser.email}</span>
              </div>
            </div>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-3.5 py-2 min-h-[38px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
          </div>

          {/* Folder Filter Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {folders.map((f) => {
              const isCurrent = activeFolder === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFolder(f.id);
                    setSelectedMail(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                    isCurrent
                      ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-xs'
                      : 'text-neutral-400 hover:text-white bg-neutral-950/60 border border-neutral-800'
                  }`}
                >
                  {f.icon}
                  <span>{f.label}</span>
                  {f.count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search header */}
        <div className="p-3 border-b border-neutral-200">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search in mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Email Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredMails.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <Mail className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p>No messages in {activeFolder}.</p>
            </div>
          ) : (
            filteredMails.map((mail) => {
              const isSelected = selectedMail?.id === mail.id;
              return (
                <div
                  key={mail.id}
                  onClick={() => setSelectedMail(mail)}
                  className={`p-3.5 transition cursor-pointer hover:bg-neutral-50 min-h-[60px] ${
                    isSelected ? 'bg-emerald-50/50 border-l-2 border-emerald-500' : ''
                  } ${!mail.isRead ? 'font-semibold bg-neutral-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900 truncate max-w-[160px]">{mail.from}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarEmail(mail.id);
                        }}
                        className="p-1 min-h-[32px] min-w-[32px] flex items-center justify-center text-neutral-300 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${mail.isStarred ? 'fill-amber-400 text-amber-400' : ''}`}
                        />
                      </button>
                      <span className="text-[10px] text-neutral-400">{mail.date}</span>
                    </div>
                  </div>
                  <h4 className="text-xs text-neutral-800 font-medium truncate">{mail.subject}</h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">{mail.body}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Message Reader View */}
      <div className={`flex-1 flex flex-col bg-neutral-50/60 overflow-y-auto min-w-0 ${!selectedMail ? 'hidden md:flex' : 'flex'}`}>
        {selectedMail ? (
          <div className="p-4 sm:p-6 space-y-4 max-w-3xl">
            {/* Mobile Back button */}
            <button
              onClick={() => setSelectedMail(null)}
              className="md:hidden min-h-[44px] px-3.5 py-2 bg-neutral-200/90 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition mb-2 shadow-2xs self-start"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-800" />
              <span>Back to {activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}</span>
            </button>

            {/* Email Subject Title */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-200">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                {selectedMail.subject}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleStarEmail(selectedMail.id)}
                  className="p-1 rounded text-neutral-400 hover:text-amber-400 cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${selectedMail.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Sender / Recipient Metadata Card */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{selectedMail.from}</span>
                  <span className="text-neutral-500 font-mono text-[11px] ml-1.5">&lt;{selectedMail.fromEmail}&gt;</span>
                </div>
                <span className="text-[11px] text-neutral-400">{selectedMail.date}</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                To: <span className="font-mono text-neutral-700">{selectedMail.toEmail}</span>
              </p>
            </div>

            {/* Email Body Content */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans whitespace-pre-line">
              {selectedMail.body}
            </div>

            {/* Quick Reply & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setComposeTo(selectedMail.fromEmail);
                    setComposeSubject(`Re: ${selectedMail.subject}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => {
                    setComposeSubject(`Fwd: ${selectedMail.subject}`);
                    setComposeBody(`\n\n--- Forwarded Message ---\nFrom: ${selectedMail.from}\n${selectedMail.body}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Forward className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
                <button
                  onClick={() => {
                    softDeleteEmail(selectedMail.id);
                    setSelectedMail(null);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Soft delete to Trash. Permanent copy remains in database archive."
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </div>

              {/* Step 3: SOC2 Immutable Database Indicator */}
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Immutable Record • Hard-Delete Blocked by DB Rules</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="m-auto text-center text-neutral-400 text-xs p-6">
            <Mail className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <p className="text-sm font-semibold text-neutral-700">Select an email to read</p>
            <p className="text-neutral-400 mt-1">Nothing selected from the {activeFolder} folder.</p>
          </div>
        )}
      </div>

      {/* COMPOSE EMAIL MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in">
            {/* Header */}
            <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>New Message - ClickCamp Webmail</span>
              </span>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCompose} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Recipient (Auto-complete from Directory)</label>
                <select
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.roleLabel}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campaign Performance Review"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type message..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <span className="text-[11px] text-neutral-400 font-mono">From: {currentUser.email}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-medium cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <SimulatedBotControlModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
      />
    </div>
  );
};
