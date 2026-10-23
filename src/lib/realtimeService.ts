/**
 * Click Camp Real-Time Workspace Service
 * Handles instant real-time synchronization across workstations and browser tabs
 * Supports BroadcastChannel, Supabase Realtime, and WebSocket abstractions
 */

import { supabase } from './supabaseClient';

export interface ProfilePictureChangedPayload {
  userId: string;
  newPicUrl: string;
  timestamp?: number;
}

export interface RealtimeEventMap {
  profile_picture_changed: ProfilePictureChangedPayload;
  chat_message_sent: any;
  shift_ended: { userId: string; sessionId: string; timestamp: string };
  email_dispatched: { emailId: string; toEmail: string; fromEmail: string; subject: string };
}

type EventCallback<T> = (data: T) => void;

class RealtimeWorkspaceService {
  private channelName = 'clickcamp_realtime_stream';
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<EventCallback<any>>> = new Map();
  private supabaseChannel: any = null;

  constructor() {
    this.initBroadcastChannel();
    this.initSupabaseRealtime();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type) {
            this.notifyListeners(type, data);
          }
        };
      } catch (err) {
        console.warn('[Realtime] BroadcastChannel init error:', err);
      }
    }
  }

  private initSupabaseRealtime() {
    if (supabase) {
      try {
        this.supabaseChannel = (supabase as any)
          .channel(this.channelName)
          .on('broadcast', { event: 'profile_picture_changed' }, ({ payload }: any) => {
            this.notifyListeners('profile_picture_changed', payload);
          })
          .on('broadcast', { event: 'chat_message_sent' }, ({ payload }: any) => {
            this.notifyListeners('chat_message_sent', payload);
          })
          .on('broadcast', { event: 'shift_ended' }, ({ payload }: any) => {
            this.notifyListeners('shift_ended', payload);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload: any) => {
            if (payload.new && payload.new.avatar_url !== undefined) {
              this.notifyListeners('profile_picture_changed', {
                userId: payload.new.id,
                newPicUrl: payload.new.avatar_url || ''
              });
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('[Realtime] Supabase channel error:', err);
      }
    }
  }

  /**
   * Broadcast an event to all connected workstations, tabs, and clients
   */
  public emit<K extends keyof RealtimeEventMap>(event: K, data: RealtimeEventMap[K]): void {
    // 1. Notify local in-memory listeners
    this.notifyListeners(event, data);

    // 2. Broadcast via window CustomEvent
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    // 3. Broadcast across browser tabs via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: event, data });
      } catch (err) {
        console.warn('[Realtime] BroadcastChannel postMessage error:', err);
      }
    }

    // 4. Broadcast via Supabase Realtime WebSocket if connected
    if (this.supabaseChannel && supabase) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event,
          payload: data
        });
      } catch (err) {
        // Non-blocking
      }
    }

    // Direct DOM manipulation for instant profile pictures updates as requested in Step 2:
    if (event === 'profile_picture_changed') {
      const payload = data as ProfilePictureChangedPayload;
      this.updateProfileImagesInDom(payload.userId, payload.newPicUrl);
    }
  }

  /**
   * Directly updates DOM elements matching profile images without page reload
   */
  public updateProfileImagesInDom(userId: string, newPicUrl: string) {
    if (typeof document === 'undefined') return;

    // Target by id
    const mainProfileImg = document.getElementById('profile-img') as HTMLImageElement | null;
    if (mainProfileImg) {
      mainProfileImg.src = newPicUrl;
    }

    const userSpecificImg = document.getElementById(`profile-img-${userId}`) as HTMLImageElement | null;
    if (userSpecificImg) {
      userSpecificImg.src = newPicUrl;
    }

    // Target by data attribute
    const matchingImages = document.querySelectorAll(`img[data-user-id="${userId}"]`);
    matchingImages.forEach((el) => {
      (el as HTMLImageElement).src = newPicUrl;
    });
  }

  /**
   * Subscribe to real-time events
   */
  public on<K extends keyof RealtimeEventMap>(
    event: K,
    callback: EventCallback<RealtimeEventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Also attach window CustomEvent listener
    const windowListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      callback(customEvent.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(event, windowListener);
    }

    // Return cleanup unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener(event, windowListener);
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[Realtime] Listener callback error on ${event}:`, err);
        }
      });
    }

    if (event === 'profile_picture_changed' && data?.userId && data?.newPicUrl) {
      this.updateProfileImagesInDom(data.userId, data.newPicUrl);
    }
  }
}

export const RealtimeService = new RealtimeWorkspaceService();
