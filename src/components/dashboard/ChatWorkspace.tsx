import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Search,
  CheckCircle2,
  Paperclip,
  ShieldCheck,
  User,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Clock,
  Filter
} from 'lucide-react';
import { ChatMessage, UserAccount } from '../../types';

export const ChatWorkspace: React.FC = () => {
  const { currentUser, allUsers, chatMessages, sendChatMessage } = useWorkspace();

  const [activeMode, setActiveMode] = useState<'channel' | 'dm'>('channel');
  const [activeChannel, setActiveChannel] = useState<string>('c-general');
  const [activeDmUser, setActiveDmUser] = useState<UserAccount | null>(() => {
    return allUsers.find((u) => u.id !== currentUser.id) || null;
  });
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attachment, setAttachment] = useState<{
    name: string;
    type: 'pdf' | 'image' | 'doc';
    url?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'c-general', name: 'general-discussions', description: 'Company-wide townhall & daily announcements' },
    { id: 'c-ops', name: 'ops-verifications', description: 'Account review coordination & KYC resolution' },
    { id: 'c-leads', name: 'leads-and-sales', description: 'Pipeline celebrations & ad campaign updates' },
    { id: 'c-tech', name: 'tech-infrastructure', description: 'Workstation security, VPN & dev status' }
  ];

  // Resolve current messages based on mode
  const currentMessages = chatMessages.filter((m) => {
    if (activeMode === 'channel') {
      return m.channelId === activeChannel && !m.isDirect;
    }
    if (activeMode === 'dm' && activeDmUser) {
      const dmChannelKey = `dm-${[currentUser.id, activeDmUser.id].sort().join('-')}`;
      const matchesKey = m.channelId === dmChannelKey;
      const matchesUsers =
        (m.senderId === currentUser.id && m.recipientId === activeDmUser.id) ||
        (m.senderId === activeDmUser.id && m.recipientId === currentUser.id);
      return matchesKey || matchesUsers;
    }
    return false;
  });

  const filteredMessages = currentMessages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.text.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      (m.attachmentName && m.attachmentName.toLowerCase().includes(q))
    );
  });

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length, activeChannel, activeDmUser?.id, activeMode]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    if (activeMode === 'channel') {
      sendChatMessage(activeChannel, inputText.trim(), undefined, false, attachment || undefined);
    } else if (activeMode === 'dm' && activeDmUser) {
      sendChatMessage('', inputText.trim(), activeDmUser.id, true, attachment || undefined);
    }

    setInputText('');
    setAttachment(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let type: 'pdf' | 'image' | 'doc' = 'doc';
    if (fileExt === 'pdf') type = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '')) type = 'image';

    const objectUrl = URL.createObjectURL(file);
    setAttachment({
      name: file.name,
      type,
      url: objectUrl
    });
  };

  const currentChannelObj = channels.find((c) => c.id === activeChannel) || channels[0];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[600px]">
      {/* Sidebar: Channels & Online Teammates */}
      <div className="w-full md:w-72 bg-neutral-900 text-white flex flex-col justify-between border-r border-neutral-800 shrink-0">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                #
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">ClickCamp Workspace</h3>
                <span className="text-[10px] text-neutral-400">Team Chat & DMs</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected to WebSocket" />
          </div>

          {/* Public Channels List */}
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 flex items-center justify-between">
              <span>Public Channels</span>
              <span className="text-[10px] font-mono text-neutral-400">4</span>
            </span>
            <div className="mt-1.5 space-y-0.5">
              {channels.map((chan) => {
                const isActive = activeMode === 'channel' && activeChannel === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => {
                      setActiveMode('channel');
                      setActiveChannel(chan.id);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-xs'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{chan.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messaging Directory */}
          <div className="p-3 border-t border-neutral-800">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Direct Messages (1:1)
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Directory</span>
            </div>
            <div className="space-y-1">
              {allUsers
                .filter((u) => u.id !== currentUser.id)
                .map((u) => {
                  const isSelected = activeMode === 'dm' && activeDmUser?.id === u.id;
                  const isSuspended = u.status === 'suspended' || u.status === 'terminated';

                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveMode('dm');
                        setActiveDmUser(u);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer group ${
                        isSelected
                          ? 'bg-neutral-800 text-emerald-400 font-semibold'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                        />
                        <span
                          className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 ring-1 ring-neutral-900 ${
                            isSuspended ? 'bg-neutral-500' : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate leading-tight group-hover:text-white">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">{u.roleLabel}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Current user badge at bottom */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center gap-2.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-neutral-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-400 truncate">{currentUser.roleLabel}</p>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ONLINE
          </span>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col justify-between bg-neutral-50 min-w-0">
        {/* Active Chat Header */}
        <div className="p-3.5 bg-white border-b border-neutral-200 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {activeMode === 'channel' ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-neutral-900 truncate">{currentChannelObj.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                      Public Channel
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">{currentChannelObj.description}</p>
                </div>
              </>
            ) : activeDmUser ? (
              <>
                <div className="relative shrink-0">
                  <img
                    src={activeDmUser.avatarUrl}
                    alt={activeDmUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-white ${
                      activeDmUser.status === 'suspended' ? 'bg-neutral-400' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-neutral-900 truncate">{activeDmUser.name}</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                      Direct Message
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {activeDmUser.designation || activeDmUser.roleLabel} • {activeDmUser.email}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Search messages in stream */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversation..."
                className="pl-8 pr-7 py-1.5 text-xs bg-neutral-100 hover:bg-white focus:bg-white border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS Audited</span>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-600">
                {searchQuery
                  ? `No messages match "${searchQuery}"`
                  : activeMode === 'channel'
                  ? `No messages in #${currentChannelObj.name} yet.`
                  : `This is the start of your secure direct message history with ${activeDmUser?.name}.`}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                {searchQuery ? 'Try another keyword.' : 'Type your message below and press Send.'}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0 mt-0.5"
                  />
                  <div className={`min-w-0 max-w-xl ${isMine ? 'items-end text-right' : 'items-start text-left'}`}>
                    <div className={`flex items-baseline gap-1.5 mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-neutral-900 text-xs">{msg.senderName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-600 font-medium">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMine
                          ? 'bg-neutral-900 text-white rounded-tr-xs'
                          : 'bg-white text-neutral-800 rounded-tl-xs border border-neutral-200'
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                      {/* Attachment Rendering */}
                      {msg.attachmentName && (
                        <div
                          className={`mt-2 p-2 rounded-xl flex items-center justify-between gap-3 border ${
                            isMine
                              ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {msg.attachmentType === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                            )}
                            <span className="truncate font-semibold text-[11px]">
                              {msg.attachmentName}
                            </span>
                          </div>
                          {msg.attachmentUrl ? (
                            <a
                              href={msg.attachmentUrl}
                              download={msg.attachmentName}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-bold text-emerald-400 flex items-center gap-1 transition shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Attached</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Attachment Preview Bar */}
        {attachment && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">Ready to send:</span>
              <span className="font-mono text-[11px] truncate max-w-xs">{attachment.name}</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="text-emerald-700 hover:text-rose-600 transition"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
        >
          {/* File Upload Attachment Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition cursor-pointer shrink-0"
            title="Attach Document or Image (PDF, JPG, PNG)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeMode === 'channel'
                ? `Message #${currentChannelObj.name}...`
                : `Message ${activeDmUser?.name || 'teammate'}...`
            }
            className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !attachment}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
