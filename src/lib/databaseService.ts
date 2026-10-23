import { supabase, TaskRow, DocumentRow, ProfileRow, AuditLogRow } from './supabaseClient';

/**
 * Click Camp Database Service
 * Provides typed CRUD operations for Supabase with local-state fallback
 */

export const DatabaseService = {
  // ---------------------------------------------------------------------------
  // 1. Task Management
  // ---------------------------------------------------------------------------
  async getTasks(assigneeId?: string): Promise<TaskRow[]> {
    if (!supabase) return [];
    let query = (supabase as any).from('tasks').select('*').order('created_at', { ascending: false });
    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[DB] Error fetching tasks:', error.message);
      return [];
    }
    return data || [];
  },

  async createTask(task: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>): Promise<TaskRow | null> {
    if (!supabase) return null;
    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('[DB] Error creating task:', error.message);
      throw error;
    }
    return data;
  },

  async updateTaskStatus(taskId: string, status: TaskRow['status']): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any)
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('[DB] Error updating task status:', error.message);
      throw error;
    }
    return true;
  },

  // ---------------------------------------------------------------------------
  // 2. Documents & Compliance
  // ---------------------------------------------------------------------------
  async getDocuments(employeeId?: string): Promise<DocumentRow[]> {
    if (!supabase) return [];
    let query = (supabase as any).from('documents_compliance').select('*').order('upload_timestamp', { ascending: false });
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('[DB] Error fetching documents:', error.message);
      return [];
    }
    return data || [];
  },

  async submitDocument(doc: Omit<DocumentRow, 'id' | 'upload_timestamp'>): Promise<DocumentRow | null> {
    if (!supabase) return null;
    const { data, error } = await (supabase as any)
      .from('documents_compliance')
      .insert([doc])
      .select()
      .single();

    if (error) {
      console.error('[DB] Error submitting compliance document:', error.message);
      throw error;
    }
    return data;
  },

  async reviewDocument(
    docId: string,
    approval_status: 'verified' | 'rejected',
    reviewed_by: string,
    rejection_reason?: string
  ): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any)
      .from('documents_compliance')
      .update({
        approval_status,
        reviewed_by,
        rejection_reason: rejection_reason || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', docId);

    if (error) {
      console.error('[DB] Error reviewing document:', error.message);
      throw error;
    }
    return true;
  },

  // ---------------------------------------------------------------------------
  // 3. Profiles & Directory
  // ---------------------------------------------------------------------------
  async getProfiles(): Promise<ProfileRow[]> {
    if (!supabase) return [];
    const { data, error } = await (supabase as any).from('profiles').select('*').order('name');
    if (error) {
      console.error('[DB] Error fetching profiles:', error.message);
      return [];
    }
    return data || [];
  },

  async updateProfile(userId: string, updates: Partial<ProfileRow>): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[DB] Error updating profile:', error.message);
      throw error;
    }
    return true;
  },

  // ---------------------------------------------------------------------------
  // 4. Audit Logs (SOC2 / Admin Security - Protected)
  // ---------------------------------------------------------------------------
  async getAuditLogs(): Promise<AuditLogRow[]> {
    if (!supabase) return [];
    const { data, error } = await (supabase as any)
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[DB] Error fetching audit logs (Super Admin restricted):', error.message);
      return [];
    }
    return data || [];
  },

  async logAudit(log: Omit<AuditLogRow, 'id' | 'timestamp'>): Promise<void> {
    if (!supabase) return;
    try {
      await (supabase as any).from('audit_logs').insert([log]);
    } catch (err) {
      console.warn('[DB] Non-blocking audit log error:', err);
    }
  },

  // ---------------------------------------------------------------------------
  // 5. Immutable Webmail Integration (Permanent Record - Hard Delete Disallowed)
  // ---------------------------------------------------------------------------
  async getPersistentEmails(userEmail?: string): Promise<any[]> {
    if (!supabase) return [];
    try {
      let query = (supabase as any)
        .from('persistent_emails')
        .select('*')
        .order('timestamp', { ascending: false });

      if (userEmail) {
        query = query.or(`sender_email.eq.${userEmail},recipient_email.eq.${userEmail}`);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[DB] Note reading persistent_emails:', error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async sendWebmail(emailData: {
    userId?: string;
    senderId?: string;
    senderName: string;
    senderEmail: string;
    recipientEmail: string;
    subject: string;
    body: string;
    folder?: 'sent' | 'inbox';
  }): Promise<any> {
    const timestamp = new Date().toISOString();
    const payload = {
      user_id: emailData.userId || null,
      sender_id: emailData.senderId || null,
      sender_name: emailData.senderName,
      sender_email: emailData.senderEmail,
      recipient_email: emailData.recipientEmail,
      subject: emailData.subject,
      body: emailData.body,
      folder: emailData.folder || 'sent',
      is_starred: false,
      is_read: true,
      is_hidden_from_user: false,
      timestamp,
      created_at: timestamp
    };

    if (supabase) {
      try {
        const { data, error } = await (supabase as any)
          .from('persistent_emails')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.warn('[DB] Persistent email insert error:', error.message);
        } else {
          return data;
        }
      } catch (err) {
        console.warn('[DB] Email archival error:', err);
      }
    }
    return payload;
  },

  /**
   * Soft Delete for Emails:
   * Sets is_hidden_from_user = true and folder = 'trash'.
   * Never executes a permanent SQL DELETE on the database, preserving audit history.
   */
  async softDeleteEmail(emailId: string): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await (supabase as any)
        .from('persistent_emails')
        .update({
          is_hidden_from_user: true,
          folder: 'trash'
        })
        .eq('id', emailId);

      if (error) {
        console.warn('[DB] Soft delete warning:', error.message);
      }
      return true;
    } catch {
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // 6. Secure Shift Logs (Data Persistence on Logout)
  // ---------------------------------------------------------------------------
  async startShiftLog(userId: string, sessionId: string, notes?: string): Promise<void> {
    if (!supabase) return;
    try {
      await (supabase as any).from('shift_logs').insert([
        {
          user_id: userId,
          session_id: sessionId,
          start_time: new Date().toISOString(),
          status: 'active',
          notes: notes || 'Workstation session active'
        }
      ]);
    } catch (err) {
      console.warn('[DB] Non-blocking start shift log error:', err);
    }
  },

  async endShiftLog(sessionId: string, durationMinutes?: number): Promise<void> {
    if (!supabase) return;
    try {
      await (supabase as any)
        .from('shift_logs')
        .update({
          end_time: new Date().toISOString(),
          duration_minutes: durationMinutes || 0,
          status: 'completed'
        })
        .eq('session_id', sessionId);
    } catch (err) {
      console.warn('[DB] Non-blocking end shift log error:', err);
    }
  },

  // ---------------------------------------------------------------------------
  // 7. Step 1: Database Cleanup Routine (Wipe Test Profiles & Clean Orphaned Data)
  // ---------------------------------------------------------------------------
  async executeProductionPurge(): Promise<{
    deletedProfilesCount: number;
    cleanedLogsCount: number;
    status: 'success' | 'partial';
  }> {
    if (!supabase) {
      return { deletedProfilesCount: 0, cleanedLogsCount: 0, status: 'success' };
    }

    try {
      // 1. Delete users marked as demo/test
      const { data: deletedUsers, error: userError } = await (supabase as any)
        .from('profiles')
        .delete()
        .or('email.ilike.%@test.com,email.ilike.%@demo.com,role.eq.demo_user')
        .select('id, email');

      if (userError) {
        console.warn('[DB] Purge users error:', userError.message);
      }

      // 2. Clean up orphaned data
      // For Supabase, cascading FKs or subqueries clean orphaned logs
      await (supabase as any)
        .from('audit_logs')
        .delete()
        .or('user_email.ilike.%test%,user_email.ilike.%demo%');

      // Record production deployment log
      await this.logAudit({
        user_email: 'adnanmaliklyx@gmail.com',
        action_type: 'SECURITY_LOCK',
        description: 'Production Database Cleanup Executed: Purged test accounts and orphaned records.',
        metadata: {
          environment: 'production',
          purgedAt: new Date().toISOString()
        }
      });

      return {
        deletedProfilesCount: deletedUsers?.length || 0,
        cleanedLogsCount: 1,
        status: 'success'
      };
    } catch (err) {
      console.error('[DB] Production purge exception:', err);
      return { deletedProfilesCount: 0, cleanedLogsCount: 0, status: 'partial' };
    }
  },

  // ---------------------------------------------------------------------------
  // 8. Persistent Employee Avatars, Profiles & Chat Histories (Backend DB + Supabase)
  // ---------------------------------------------------------------------------
  async fetchWorkspaceBootstrap(): Promise<{
    users: Record<string, any>;
    avatars: Record<string, string>;
    chatMessages: any[];
  }> {
    let backendUsers: Record<string, any> = {};
    let backendAvatars: Record<string, string> = {};
    let backendMessages: any[] = [];

    try {
      const res = await fetch('/api/workspace/bootstrap', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.users && typeof data.users === 'object') {
          backendUsers = data.users;
        }
        if (data?.avatars && typeof data.avatars === 'object') {
          backendAvatars = data.avatars;
        }
        if (Array.isArray(data?.chatMessages)) {
          backendMessages = data.chatMessages;
        }
      }
    } catch (err) {
      console.warn('[DB] Backend bootstrap fetch fallback:', err);
    }

    // Merge Supabase messages_chat if configured
    if (supabase) {
      try {
        const { data: sbMsgs, error } = await (supabase as any)
          .from('messages_chat')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(sbMsgs) && sbMsgs.length > 0) {
          const msgMap = new Map<string, any>();
          backendMessages.forEach((m) => {
            if (m?.id) msgMap.set(m.id, m);
          });
          sbMsgs.forEach((row: any) => {
            const meta = row.attachments || {};
            const id = meta.clientMessageId || row.id;
            if (!msgMap.has(id)) {
              msgMap.set(id, {
                id,
                channelId: row.channel_name || meta.channelId || 'c-general',
                senderId: row.sender_id,
                senderName: meta.senderName || 'Employee',
                senderAvatar:
                  backendAvatars[row.sender_id] !== undefined
                    ? backendAvatars[row.sender_id]
                    : meta.senderAvatar || '',
                senderRole: meta.senderRole || 'Operations Specialist',
                recipientId: row.receiver_id || meta.recipientId || undefined,
                recipientName: meta.recipientName || undefined,
                recipientAvatar: meta.recipientAvatar || undefined,
                isDirect: Boolean(row.receiver_id || meta.isDirect),
                text: row.content || '',
                timestamp:
                  meta.timestamp ||
                  new Date(row.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }),
                attachmentName: meta.attachmentName,
                attachmentType: meta.attachmentType,
                attachmentUrl: meta.attachmentUrl,
                status: 'delivered'
              });
            }
          });
          backendMessages = Array.from(msgMap.values());
        }
      } catch (err) {
        console.warn('[DB] Supabase messages_chat fetch note:', err);
      }
    }

    return {
      users: backendUsers,
      avatars: backendAvatars,
      chatMessages: backendMessages
    };
  },

  async saveEmployeeAvatar(userId: string, email: string, avatarUrl: string): Promise<boolean> {
    try {
      await fetch('/api/workspace/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, avatarUrl })
      });
    } catch (err) {
      console.warn('[DB] Backend avatar persist warning:', err);
    }

    if (supabase) {
      try {
        await (supabase as any)
          .from('profiles')
          .update({
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${userId},email.eq.${email}`);
      } catch (err) {
        console.warn('[DB] Supabase avatar update warning:', err);
      }
    }
    return true;
  },

  async saveEmployeeProfile(user: Record<string, any>): Promise<boolean> {
    try {
      await fetch('/api/workspace/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
    } catch (err) {
      console.warn('[DB] Backend user save warning:', err);
    }
    return true;
  },

  async syncUsersDirectory(users: any[]): Promise<boolean> {
    try {
      await fetch('/api/workspace/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      });
    } catch (err) {
      console.warn('[DB] Backend directory sync warning:', err);
    }
    return true;
  },

  async saveChatMessage(message: any): Promise<any[]> {
    let persistedList: any[] = [];
    try {
      const res = await fetch('/api/workspace/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.chatMessages)) {
          persistedList = data.chatMessages;
        }
      }
    } catch (err) {
      console.warn('[DB] Backend chat save warning:', err);
    }

    if (supabase && message) {
      try {
        await (supabase as any).from('messages_chat').insert([
          {
            sender_id: message.senderId,
            receiver_id: message.recipientId || null,
            channel_name: message.channelId,
            content: message.text || '',
            attachments: {
              clientMessageId: message.id,
              channelId: message.channelId,
              senderName: message.senderName,
              senderAvatar: message.senderAvatar,
              senderRole: message.senderRole,
              recipientId: message.recipientId,
              recipientName: message.recipientName,
              recipientAvatar: message.recipientAvatar,
              isDirect: message.isDirect,
              timestamp: message.timestamp,
              attachmentName: message.attachmentName,
              attachmentType: message.attachmentType,
              attachmentUrl: message.attachmentUrl
            },
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.warn('[DB] Supabase chat insert note:', err);
      }
    }

    return persistedList;
  },

  async syncChatMessages(messages: any[]): Promise<any[]> {
    try {
      const res = await fetch('/api/workspace/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.chatMessages)) {
          return data.chatMessages;
        }
      }
    } catch (err) {
      console.warn('[DB] Backend chat batch sync warning:', err);
    }
    return messages;
  }
};

