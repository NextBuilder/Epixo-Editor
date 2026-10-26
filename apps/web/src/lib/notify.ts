import { all, first, newId, now, run } from "./server";

export type Kind = "like" | "comment" | "follow" | "hire" | "remix";

// Tells a maker something happened. Never notifies people about their own actions, and a repeated like or follow
// from the same person does not stack up.
export async function notify(userId: string, actorId: string, kind: Kind, postId: string | null = null, body = "") {
  if (!userId || userId === actorId) return;
  try {
    if (kind === "like" || kind === "follow") {
      const dup = await first("SELECT 1 FROM notifications WHERE user_id = ? AND actor_id = ? AND kind = ? AND IFNULL(post_id, '') = ? AND created_at > ?", userId, actorId, kind, postId ?? "", now() - 86400 * 7);
      if (dup) return;
    }
    await run("INSERT INTO notifications (id, user_id, actor_id, kind, post_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", newId(14), userId, actorId, kind, postId, body.slice(0, 160), now());
  } catch {}
}

export type Note = { id: string; kind: Kind; post_id: string | null; body: string; seen: number; created_at: number; handle: string | null; name: string | null; avatar: string | null; title: string | null; images: string | null };

export async function listNotes(userId: string) {
  return all<Note>(
    "SELECT n.id, n.kind, n.post_id, n.body, n.seen, n.created_at, u.handle, u.name, u.avatar, p.title, p.images FROM notifications n LEFT JOIN users u ON u.id = n.actor_id LEFT JOIN posts p ON p.id = n.post_id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 100",
    userId,
  ).catch(() => []);
}

export async function unseen(userId: string) {
  const r = await first<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND seen = 0", userId).catch(() => null);
  return r?.n ?? 0;
}
