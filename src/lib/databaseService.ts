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
  }
};
