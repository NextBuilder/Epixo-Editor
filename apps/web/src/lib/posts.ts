import { all, first } from "./server";

export type PostRow = {
  id: string;
  project_id: string | null;
  title: string;
  description: string;
  tags: string;
  board_id: string | null;
  board_label: string | null;
  brand: string | null;
  w: number;
  h: number;
  round: number;
  images: string;
  likes: number;
  remixes: number;
  views: number;
  comments: number;
  remix_of: string | null;
  hidden: number;
  created_at: number;
  updated_at: number;
  owner_id: string;
  handle: string;
  name: string;
  avatar: string | null;
  hire_open?: number;
  headline?: string;
};

const COLS = "p.id, p.project_id, p.title, p.description, p.tags, p.board_id, p.board_label, p.brand, p.w, p.h, p.round, p.images, p.likes, p.remixes, p.views, p.comments, p.remix_of, p.hidden, p.created_at, p.updated_at, p.owner_id, u.handle, u.name, u.avatar, u.hire_open, u.headline";

export type Sort = "trending" | "new" | "top";

export async function listPosts(o: { q?: string; brand?: string; board?: string; tag?: string; owner?: string; sort?: Sort; limit?: number; offset?: number; includeHidden?: boolean }) {
  const where: string[] = [];
  const args: unknown[] = [];
  if (!o.includeHidden) where.push("p.hidden = 0");
  if (o.owner) where.push("p.owner_id = ?"), args.push(o.owner);
  if (o.brand) where.push("p.brand = ?"), args.push(o.brand);
  if (o.board) where.push("p.board_id = ?"), args.push(o.board);
  if (o.tag) where.push("(',' || p.tags || ',') LIKE ?"), args.push(`%,${o.tag},%`);
  if (o.q) {
    const like = `%${o.q.replace(/[%_]/g, "")}%`;
    where.push("(p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR p.board_label LIKE ? OR u.handle LIKE ?)");
    args.push(like, like, like, like, like);
  }
  const order =
    o.sort === "new"
      ? "p.created_at DESC"
      : o.sort === "top"
        ? "(p.likes * 3 + p.remixes * 5) DESC, p.created_at DESC"
        : "((p.likes * 3 + p.remixes * 5 + p.comments * 2 + p.views * 0.05 + 1) / ((strftime('%s','now') - p.created_at) / 3600.0 + 2) / ((strftime('%s','now') - p.created_at) / 3600.0 + 2)) DESC";
  const sql = `SELECT ${COLS} FROM posts p JOIN users u ON u.id = p.owner_id ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT ? OFFSET ?`;
  args.push(Math.min(o.limit ?? 24, 60), o.offset ?? 0);
  try {
    return await all<PostRow>(sql, ...args);
  } catch {
    return [];
  }
}

export async function getPost(id: string) {
  try {
    return await first<PostRow>(`SELECT ${COLS} FROM posts p JOIN users u ON u.id = p.owner_id WHERE p.id = ?`, id);
  } catch {
    return null;
  }
}

export async function postBrands() {
  try {
    return await all<{ brand: string; n: number }>("SELECT brand, COUNT(*) AS n FROM posts WHERE hidden = 0 AND brand IS NOT NULL GROUP BY brand ORDER BY n DESC");
  } catch {
    return [];
  }
}

export async function communityStats() {
  try {
    return await first<{ posts: number; makers: number }>("SELECT COUNT(*) AS posts, COUNT(DISTINCT owner_id) AS makers FROM posts WHERE hidden = 0");
  } catch {
    return null;
  }
}

export const firstImage = (p: Pick<PostRow, "images">) => {
  try {
    const k = (JSON.parse(p.images) as string[])[0];
    return k ? `/api/media/${k}` : null;
  } catch {
    return null;
  }
};

export const imagesOf = (p: Pick<PostRow, "images">) => {
  try {
    return (JSON.parse(p.images) as string[]).map(k => `/api/media/${k}`);
  } catch {
    return [];
  }
};
