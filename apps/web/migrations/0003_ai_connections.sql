CREATE TABLE ai_connections (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  project_id TEXT,
  client TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
CREATE INDEX ai_connections_user ON ai_connections(user_id, created_at DESC);

ALTER TABLE projects ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN update_note TEXT NOT NULL DEFAULT '';
