ALTER TABLE users ADD COLUMN headline TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN location TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN socials TEXT NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN skills TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN hire_open INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN hire_types TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN hire_rate TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN hire_note TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN pinned_post TEXT;
CREATE INDEX users_hire ON users(hire_open);

CREATE TABLE follows (
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX follows_followee ON follows(followee_id);

CREATE TABLE hire_requests (
  id TEXT PRIMARY KEY,
  to_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE INDEX hire_to ON hire_requests(to_user, created_at DESC);
CREATE INDEX hire_from ON hire_requests(from_user, created_at DESC);
