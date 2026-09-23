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
  }
};
