import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured, TaskRow, DocumentRow, MessageRow, AuditLogRow, NoticeRow } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected' | 'not_configured';

export interface RealtimeEventPayload {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRecord: any;
  oldRecord: any;
  timestamp: string;
}

interface UseRealtimeSyncProps {
  currentUserId?: string;
  isSuperAdmin?: boolean;
  onTaskChange?: (event: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; task: TaskRow }) => void;
  onDocumentChange?: (event: { eventType: 'INSERT' | 'UPDATE'; document: DocumentRow }) => void;
  onMessageReceived?: (message: MessageRow) => void;
  onAuditLogged?: (log: AuditLogRow) => void;
  onNoticeChange?: (event: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; notice: NoticeRow }) => void;
}

/**
 * useRealtimeSync Hook
 * Subscribes to PostgreSQL Change Data Capture (CDC) events via Supabase WebSockets.
 * Instantly synchronizes Tasks, Compliance Documents, Messages, and Audits across clients.
 */
export function useRealtimeSync({
  currentUserId,
  isSuperAdmin = false,
  onTaskChange,
  onDocumentChange,
  onMessageReceived,
  onAuditLogged,
  onNoticeChange
}: UseRealtimeSyncProps = {}) {
  const [status, setStatus] = useState<RealtimeStatus>(
    isSupabaseConfigured ? 'connecting' : 'not_configured'
  );
  const [lastEvent, setLastEvent] = useState<RealtimeEventPayload | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep callback refs fresh without re-subscribing on every render
  const callbacksRef = useRef({
    onTaskChange,
    onDocumentChange,
    onMessageReceived,
    onAuditLogged,
    onNoticeChange
  });

  useEffect(() => {
    callbacksRef.current = {
      onTaskChange,
      onDocumentChange,
      onMessageReceived,
      onAuditLogged,
      onNoticeChange
    };
  }, [onTaskChange, onDocumentChange, onMessageReceived, onAuditLogged, onNoticeChange]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus('not_configured');
      return;
    }

    setStatus('connecting');

    // Create a multi-table real-time broadcast channel
    const channel = supabase.channel('clickcamp-realtime-hub');

    // 1. Listen for Tasks changes (Assigned by Super Admin Adnan Malik or updated by employee)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks'
      },
      (payload) => {
        const task = (payload.new || payload.old) as TaskRow;
        // Filter for security/relevance: Super Admin sees all, employee sees if assigned or authored
        if (
          isSuperAdmin ||
          !currentUserId ||
          task.assignee_id === currentUserId ||
          task.assigner_id === currentUserId
        ) {
          const eventItem: RealtimeEventPayload = {
            table: 'tasks',
            eventType: payload.eventType as any,
            newRecord: payload.new,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };
          setLastEvent(eventItem);
          setEventCount((prev) => prev + 1);

          if (callbacksRef.current.onTaskChange) {
            callbacksRef.current.onTaskChange({
              eventType: payload.eventType as any,
              task
            });
          }
        }
      }
    );

    // 2. Listen for Compliance Documents (e.g. Employee uploads PAN -> Admin sees in real-time)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents_compliance'
      },
      (payload) => {
        const doc = (payload.new || payload.old) as DocumentRow;
        if (isSuperAdmin || !currentUserId || doc.employee_id === currentUserId) {
          const eventItem: RealtimeEventPayload = {
            table: 'documents_compliance',
            eventType: payload.eventType as any,
            newRecord: payload.new,
            oldRecord: payload.old,
            timestamp: new Date().toISOString()
          };
          setLastEvent(eventItem);
          setEventCount((prev) => prev + 1);

          if (callbacksRef.current.onDocumentChange) {
            callbacksRef.current.onDocumentChange({
              eventType: payload.eventType as any,
              document: doc
            });
          }
        }
      }
    );

    // 3. Listen for Team Chat & Direct Messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages_chat'
      },
      (payload) => {
        const message = payload.new as MessageRow;
        if (
          message.channel_name ||
          message.receiver_id === currentUserId ||
          message.sender_id === currentUserId ||
          isSuperAdmin
        ) {
          const eventItem: RealtimeEventPayload = {
            table: 'messages_chat',
            eventType: 'INSERT',
            newRecord: message,
            oldRecord: null,
            timestamp: new Date().toISOString()
          };
          setLastEvent(eventItem);
          setEventCount((prev) => prev + 1);

          if (callbacksRef.current.onMessageReceived) {
            callbacksRef.current.onMessageReceived(message);
          }
        }
      }
    );

    // 4. Listen for Audit Logs (Strictly Super Admin Adnan Malik only)
    if (isSuperAdmin) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          const log = payload.new as AuditLogRow;
          const eventItem: RealtimeEventPayload = {
            table: 'audit_logs',
            eventType: 'INSERT',
            newRecord: log,
            oldRecord: null,
            timestamp: new Date().toISOString()
          };
          setLastEvent(eventItem);
          setEventCount((prev) => prev + 1);

          if (callbacksRef.current.onAuditLogged) {
            callbacksRef.current.onAuditLogged(log);
          }
        }
      );
    }

    // 5. Listen for Company Notice Board announcements (Broadcast to ALL employees in real-time)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notices'
      },
      (payload) => {
        const notice = (payload.new || payload.old) as NoticeRow;
        const eventItem: RealtimeEventPayload = {
          table: 'notices',
          eventType: payload.eventType as any,
          newRecord: payload.new,
          oldRecord: payload.old,
          timestamp: new Date().toISOString()
        };
        setLastEvent(eventItem);
        setEventCount((prev) => prev + 1);

        if (callbacksRef.current.onNoticeChange) {
          callbacksRef.current.onNoticeChange({
            eventType: payload.eventType as any,
            notice
          });
        }
      }
    );

    // Subscribe and track connection lifecycle
    channel.subscribe((statusResponse) => {
      if (statusResponse === 'SUBSCRIBED') {
        setStatus('connected');
      } else if (statusResponse === 'CLOSED' || statusResponse === 'CHANNEL_ERROR') {
        setStatus('disconnected');
      } else {
        setStatus('connecting');
      }
    });

    channelRef.current = channel;

    // Clean up channel on unmount
    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, isSuperAdmin]);

  return {
    status,
    lastEvent,
    eventCount,
    isConfigured: isSupabaseConfigured
  };
}
