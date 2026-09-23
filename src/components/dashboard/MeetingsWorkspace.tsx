import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MeetingMom } from '../../types';
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  FileCheck,
  CheckSquare,
  Sparkles,
  Link2,
  Share2
} from 'lucide-react';

export const MeetingsWorkspace: React.FC = () => {
  const { meetings, markMeetingRead, currentUser } = useWorkspace();

  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMom | null>(meetings[0] || null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [quickMeetUrl, setQuickMeetUrl] = useState<string | null>(null);

  // Instant Quick Meeting generator
  const handleStartQuickMeet = () => {
    const meetId = `cc-meet-${Math.random().toString(36).substring(2, 8)}`;
    const url = `https://meet.google.com/${meetId}`;
    setQuickMeetUrl(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 sm:p-6 border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Module 8: Conference & Collaboration
            </span>
            <span className="text-xs text-neutral-400">Google Meet & Zoom Integration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <span>Meeting Hub & Minutes of Meeting (MOM)</span>
            <Video className="w-5 h-5 text-blue-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Review synchronizations, track executive decisions, assign action item deliverables, and launch instant huddles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStartQuickMeet}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Video className="w-4 h-4" />
            <span>Start Quick Huddle</span>
          </button>
        </div>
      </div>

      {/* Quick Meet Notification Alert */}
      {quickMeetUrl && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Instant ClickCamp Huddle Room Ready!</p>
              <p className="font-mono text-[11px] text-emerald-700">{quickMeetUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(quickMeetUrl);
                alert('Meeting URL copied to clipboard!');
              }}
              className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 transition cursor-pointer"
            >
              Copy Link
            </button>
            <a
              href={quickMeetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Join Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setQuickMeetUrl(null)}
              className="text-neutral-400 hover:text-neutral-700 font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meeting List */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Synchronizations & Records ({meetings.length})
            </h3>
          </div>

          <div className="space-y-2">
            {meetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              const hasRead = m.readBy.includes(currentUser.id);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50/70 hover:bg-neutral-100/70 text-neutral-800 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {m.title}
                    </span>
                    {hasRead && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] flex items-center gap-3 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                  </div>
                  <p className={`text-[11px] mt-1.5 truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Organizer: {m.organizer}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Meeting Minutes (MOM) Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
          {selectedMeeting ? (
            <div>
              {/* Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Official Minutes of Meeting
                  </span>
                  <h2 className="text-lg font-bold text-neutral-900 mt-1.5">{selectedMeeting.title}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Convened by: <strong>{selectedMeeting.organizer}</strong> on {selectedMeeting.date} ({selectedMeeting.time})
                  </p>
                </div>

                {/* Acknowledge Button */}
                {!selectedMeeting.readBy.includes(currentUser.id) ? (
                  <button
                    onClick={() => markMeetingRead(selectedMeeting.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge & Sign MOM</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Signed by You</span>
                  </span>
                )}
              </div>

              {/* Attendees */}
              <div className="my-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  Rollcall & Attendees ({selectedMeeting.attendees.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedMeeting.attendees.map((att) => (
                    <span
                      key={att}
                      className="px-2.5 py-1 bg-white rounded-lg border border-neutral-200 text-neutral-800 font-medium text-[11px] shadow-2xs"
                    >
                      {att}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Executive Decisions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Key Decisions Ratified:</span>
                </h4>
                <div className="space-y-1.5 text-xs text-neutral-700">
                  {selectedMeeting.keyDecisions.map((dec, idx) => (
                    <div key={idx} className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-200/70 flex items-start gap-2">
                      <span className="font-bold text-blue-700 mt-0.5">•</span>
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items Deliverables with Owner Tags */}
              <div className="space-y-2 pt-3 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Action Item Deliverables:</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {selectedMeeting.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium text-neutral-900">{item.task}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded-full font-semibold">
                          Owner: {item.owner}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400 text-xs">
              <Calendar className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
              <p>Select a meeting from the list to inspect minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
