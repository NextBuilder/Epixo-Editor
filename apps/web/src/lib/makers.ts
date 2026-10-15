import { all, first } from "./server";
import { parseSocials, splitList, type SocialKey } from "./profile";

export type Maker = {
  id: string;
  handle: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  headline: string;
  location: string;
  socials: Partial<Record<SocialKey, string>>;
  skills: string[];
  hire_open: boolean;
  hire_types: string[];
  hire_rate: string;
  hire_note: string;
  pinned_post: string | null;
  created_at: number;
  posts: number;
  likes: number;
  remixes: number;
  followers: number;
  following: number;
};

type Row = Omit<Maker, "socials" | "skills" | "hire_open" | "hire_types"> & { socials: string; skills: string; hire_open: number; hire_types: string };

const SEL = `SELECT u.id, u.handle, u.name, u.avatar, u.bio, u.headline, u.location, u.socials, u.skills, u.hire_open, u.hire_types, u.hire_rate, u.hire_note, u.pinned_post, u.created_at,
  (SELECT COUNT(*) FROM posts p WHERE p.owner_id = u.id AND p.hidden = 0) AS posts,
  (SELECT COALESCE(SUM(likes), 0) FROM posts p WHERE p.owner_id = u.id AND p.hidden = 0) AS likes,
  (SELECT COALESCE(SUM(remixes), 0) FROM posts p WHERE p.owner_id = u.id AND p.hidden = 0) AS remixes,
  (SELECT COUNT(*) FROM follows f WHERE f.followee_id = u.id) AS followers,
  (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) AS following
  FROM users u`;

const shape = (r: Row): Maker => ({ ...r, socials: parseSocials(r.socials), skills: splitList(r.skills), hire_open: !!r.hire_open, hire_types: splitList(r.hire_types) });

export async function getMaker(handle: string) {
  if (!/^[a-z0-9_-]{2,24}$/i.test(handle)) return null;
  const r = await first<Row>(`${SEL} WHERE u.handle = ?`, handle.toLowerCase()).catch(() => null);
  return r ? shape(r) : null;
}

export async function listMakers(o: { q?: string; skill?: string; type?: string; hireOnly?: boolean; limit?: number }) {
  const where = ["EXISTS (SELECT 1 FROM posts p WHERE p.owner_id = u.id AND p.hidden = 0) OR u.hire_open = 1"];
  const args: unknown[] = [];
  if (o.hireOnly) where.push("u.hire_open = 1");
  if (o.skill) where.push("(',' || LOWER(u.skills) || ',') LIKE ?"), args.push(`%,${o.skill.toLowerCase()},%`);
  if (o.type) where.push("(',' || u.hire_types || ',') LIKE ?"), args.push(`%,${o.type},%`);
  if (o.q) {
    const like = `%${o.q.replace(/[%_]/g, "")}%`;
    where.push("(u.name LIKE ? OR u.handle LIKE ? OR u.headline LIKE ? OR u.skills LIKE ? OR u.location LIKE ?)");
    args.push(like, like, like, like, like);
  }
  const rows = await all<Row>(`${SEL} WHERE ${where.map(w => `(${w})`).join(" AND ")} ORDER BY u.hire_open DESC, likes DESC, posts DESC LIMIT ?`, ...args, Math.min(o.limit ?? 48, 96)).catch(() => []);
  return rows.map(shape);
}

type Cover = { owner_id: string; id: string; images: string; w: number; h: number; round: number; title: string };

export async function makerCovers(ids: string[]): Promise<Record<string, Cover[]>> {
  if (!ids.length) return {};
  const rows: Cover[] = await all<Cover>(
    `SELECT owner_id, id, images, w, h, round, title FROM posts WHERE hidden = 0 AND owner_id IN (${ids.map(() => "?").join(",")}) ORDER BY likes DESC, created_at DESC`,
    ...ids,
  ).catch(() => [] as Cover[]);
  const out: Record<string, Cover[]> = {};
  for (const r of rows) {
    const l = (out[r.owner_id] ??= []);
    if (l.length < 3) l.push(r);
  }
  return out;
}

export async function makerBoards(id: string) {
  return all<{ board_label: string; board_id: string | null; n: number }>(
    "SELECT board_label, board_id, COUNT(*) AS n FROM posts WHERE owner_id = ? AND hidden = 0 AND board_label IS NOT NULL AND board_label != '' GROUP BY board_label ORDER BY n DESC LIMIT 8",
    id,
  ).catch(() => []);
}
