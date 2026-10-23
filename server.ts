import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'workspace_db.json');

interface PersistedWorkspaceDB {
  users: Record<string, any>;
  avatars: Record<string, string>;
  chatMessages: any[];
  updatedAt: string;
}

function ensureDatabaseFile(): PersistedWorkspaceDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: PersistedWorkspaceDB = {
        users: {},
        avatars: {},
        chatMessages: [],
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users && typeof parsed.users === 'object' ? parsed.users : {},
      avatars: parsed.avatars && typeof parsed.avatars === 'object' ? parsed.avatars : {},
      chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [],
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    console.error('[Database] Error reading workspace_db.json, initializing clean state:', err);
    return {
      users: {},
      avatars: {},
      chatMessages: [],
      updatedAt: new Date().toISOString()
    };
  }
}

function saveDatabaseFile(db: PersistedWorkspaceDB): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Error writing workspace_db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to support base64/WebP cropped employee avatars and chat attachments
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ---------------------------------------------------------------------------
  // 1. GET /api/workspace/bootstrap
  // Returns persisted users, avatars map, and chat message history
  // ---------------------------------------------------------------------------
  app.get('/api/workspace/bootstrap', (_req, res) => {
    const db = ensureDatabaseFile();
    res.json({
      success: true,
      users: db.users,
      avatars: db.avatars,
      chatMessages: db.chatMessages,
      updatedAt: db.updatedAt
    });
  });

  // ---------------------------------------------------------------------------
  // 2. POST /api/workspace/avatar
  // Persists employee avatar update (or removal) and updates associated chat messages
  // ---------------------------------------------------------------------------
  app.post('/api/workspace/avatar', (req, res) => {
    const { userId, email, avatarUrl } = req.body || {};
    if (!userId && !email) {
      res.status(400).json({ success: false, error: 'userId or email is required' });
      return;
    }

    const db = ensureDatabaseFile();
    const resolvedAvatar = typeof avatarUrl === 'string' ? avatarUrl : '';

    if (userId) {
      db.avatars[userId] = resolvedAvatar;
      if (db.users[userId]) {
        db.users[userId] = {
          ...db.users[userId],
          avatarUrl: resolvedAvatar,
          lastProfileUpdate: new Date().toISOString()
        };
      }
    }

    if (email && typeof email === 'string') {
      const normalizedEmail = email.trim().toLowerCase();
      db.avatars[normalizedEmail] = resolvedAvatar;
      Object.keys(db.users).forEach((uid) => {
        const u = db.users[uid];
        if (u && u.email && u.email.toLowerCase() === normalizedEmail) {
          db.users[uid] = {
            ...u,
            avatarUrl: resolvedAvatar,
            lastProfileUpdate: new Date().toISOString()
          };
        }
      });
    }

    // Update senderAvatar and recipientAvatar across all persisted chat messages for this employee
    db.chatMessages = db.chatMessages.map((msg) => {
      let updated = msg;
      if (userId && msg.senderId === userId) {
        updated = { ...updated, senderAvatar: resolvedAvatar };
      }
      if (userId && msg.recipientId === userId) {
        updated = { ...updated, recipientAvatar: resolvedAvatar };
      }
      return updated;
    });

    saveDatabaseFile(db);
    res.json({
      success: true,
      userId,
      avatarUrl: resolvedAvatar,
      updatedAt: db.updatedAt
    });
  });

  // ---------------------------------------------------------------------------
  // 3. POST /api/workspace/users
  // Syncs employee profiles & directory changes into persistent backend storage
  // ---------------------------------------------------------------------------
  app.post('/api/workspace/users', (req, res) => {
    const { user, users } = req.body || {};
    const db = ensureDatabaseFile();

    const mergeSingleUser = (u: any) => {
      if (!u || !u.id) return;
      const emailKey = u.email ? u.email.trim().toLowerCase() : '';
      const persistedAvatar =
        db.avatars[u.id] !== undefined
          ? db.avatars[u.id]
          : emailKey && db.avatars[emailKey] !== undefined
          ? db.avatars[emailKey]
          : u.avatarUrl;

      if (u.avatarUrl && db.avatars[u.id] === undefined) {
        db.avatars[u.id] = u.avatarUrl;
        if (emailKey) db.avatars[emailKey] = u.avatarUrl;
      }

      db.users[u.id] = {
        ...(db.users[u.id] || {}),
        ...u,
        avatarUrl: persistedAvatar !== undefined ? persistedAvatar : u.avatarUrl
      };
    };

    if (user) {
      mergeSingleUser(user);
    }
    if (Array.isArray(users)) {
      users.forEach(mergeSingleUser);
    }

    saveDatabaseFile(db);
    res.json({
      success: true,
      users: db.users,
      avatars: db.avatars
    });
  });

  // ---------------------------------------------------------------------------
  // 4. GET /api/workspace/chat & POST /api/workspace/chat
  // Retrieves and persists all public channel & 1:1 direct chat messages
  // ---------------------------------------------------------------------------
  app.get('/api/workspace/chat', (_req, res) => {
    const db = ensureDatabaseFile();
    res.json({
      success: true,
      chatMessages: db.chatMessages
    });
  });

  app.post('/api/workspace/chat', (req, res) => {
    const { message, messages } = req.body || {};
    const db = ensureDatabaseFile();

    const existingMap = new Map<string, any>();
    db.chatMessages.forEach((m) => {
      if (m && m.id) {
        existingMap.set(m.id, m);
      }
    });

    const upsertMsg = (m: any) => {
      if (!m || !m.id) return;
      const senderAvatar =
        m.senderId && db.avatars[m.senderId] !== undefined
          ? db.avatars[m.senderId]
          : m.senderAvatar;
      const recipientAvatar =
        m.recipientId && db.avatars[m.recipientId] !== undefined
          ? db.avatars[m.recipientId]
          : m.recipientAvatar;

      existingMap.set(m.id, {
        ...(existingMap.get(m.id) || {}),
        ...m,
        senderAvatar,
        recipientAvatar
      });
    };

    if (Array.isArray(messages)) {
      messages.forEach(upsertMsg);
    }
    if (message) {
      upsertMsg(message);
    }

    db.chatMessages = Array.from(existingMap.values());
    saveDatabaseFile(db);

    res.json({
      success: true,
      chatMessages: db.chatMessages
    });
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
