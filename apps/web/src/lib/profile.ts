export type SocialKey =
  | "website" | "github" | "youtube" | "linkedin" | "x" | "instagram" | "facebook" | "threads" | "bluesky" | "mastodon" | "tiktok" | "reddit"
  | "discord" | "telegram" | "whatsapp" | "twitch" | "medium" | "substack" | "behance" | "dribbble" | "pinterest" | "gitlab"
  | "hackster" | "instructables" | "hackaday" | "printables" | "thingiverse" | "patreon" | "kofi" | "buymeacoffee" | "linktree";

type Platform = { key: SocialKey; label: string; hosts: string[]; suffix?: string; make?: (h: string) => string; hint: string; group: "Social" | "Video and chat" | "Code and making" | "Writing and design" | "Support" };

const at = (h: string) => h.replace(/^@/, "");

// Every platform a maker might link to. A username becomes a full link, and a pasted link must point at the platform itself.
export const PLATFORMS: Platform[] = [
  { key: "website", label: "Website", hosts: [], hint: "yoursite.com", group: "Social" },
  { key: "linkedin", label: "LinkedIn", hosts: ["linkedin.com", "www.linkedin.com", "in.linkedin.com"], make: h => `https://www.linkedin.com/in/${h}`, hint: "profile name", group: "Social" },
  { key: "x", label: "X", hosts: ["x.com", "twitter.com", "www.x.com"], make: h => `https://x.com/${at(h)}`, hint: "@handle", group: "Social" },
  { key: "instagram", label: "Instagram", hosts: ["instagram.com", "www.instagram.com"], make: h => `https://instagram.com/${at(h)}`, hint: "@handle", group: "Social" },
  { key: "facebook", label: "Facebook", hosts: ["facebook.com", "www.facebook.com", "fb.com", "m.facebook.com"], make: h => `https://www.facebook.com/${at(h)}`, hint: "page or profile name", group: "Social" },
  { key: "threads", label: "Threads", hosts: ["threads.net", "www.threads.net", "threads.com", "www.threads.com"], make: h => `https://www.threads.net/@${at(h)}`, hint: "@handle", group: "Social" },
  { key: "bluesky", label: "Bluesky", hosts: ["bsky.app"], make: h => `https://bsky.app/profile/${at(h)}`, hint: "name.bsky.social", group: "Social" },
  { key: "mastodon", label: "Mastodon", hosts: [], make: h => { const m = /^@?([\w.]+)@([\w.-]+\.[a-z]{2,})$/i.exec(h); return m ? `https://${m[2]}/@${m[1]}` : ""; }, hint: "@you@server.social", group: "Social" },
  { key: "reddit", label: "Reddit", hosts: ["reddit.com", "www.reddit.com", "old.reddit.com"], make: h => `https://www.reddit.com/user/${h.replace(/^u\//, "")}`, hint: "username", group: "Social" },
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"], make: h => `https://youtube.com/@${at(h)}`, hint: "@channel", group: "Video and chat" },
  { key: "tiktok", label: "TikTok", hosts: ["tiktok.com", "www.tiktok.com"], make: h => `https://www.tiktok.com/@${at(h)}`, hint: "@handle", group: "Video and chat" },
  { key: "twitch", label: "Twitch", hosts: ["twitch.tv", "www.twitch.tv"], make: h => `https://www.twitch.tv/${h}`, hint: "channel", group: "Video and chat" },
  { key: "discord", label: "Discord", hosts: ["discord.gg", "discord.com"], hint: "invite link", group: "Video and chat" },
  { key: "telegram", label: "Telegram", hosts: ["t.me", "telegram.me"], make: h => `https://t.me/${at(h)}`, hint: "@username", group: "Video and chat" },
  { key: "whatsapp", label: "WhatsApp", hosts: ["wa.me", "chat.whatsapp.com"], make: h => `https://wa.me/${h.replace(/[^0-9]/g, "")}`, hint: "number with country code", group: "Video and chat" },
  { key: "github", label: "GitHub", hosts: ["github.com"], make: h => `https://github.com/${h}`, hint: "username", group: "Code and making" },
  { key: "gitlab", label: "GitLab", hosts: ["gitlab.com"], make: h => `https://gitlab.com/${h}`, hint: "username", group: "Code and making" },
  { key: "hackster", label: "Hackster", hosts: ["hackster.io", "www.hackster.io"], make: h => `https://www.hackster.io/${h}`, hint: "username", group: "Code and making" },
  { key: "instructables", label: "Instructables", hosts: ["instructables.com", "www.instructables.com"], make: h => `https://www.instructables.com/member/${encodeURIComponent(h)}/`, hint: "member name", group: "Code and making" },
  { key: "hackaday", label: "Hackaday.io", hosts: ["hackaday.io"], make: h => `https://hackaday.io/${h}`, hint: "username", group: "Code and making" },
  { key: "printables", label: "Printables", hosts: ["printables.com", "www.printables.com"], make: h => `https://www.printables.com/@${at(h)}`, hint: "@handle", group: "Code and making" },
  { key: "thingiverse", label: "Thingiverse", hosts: ["thingiverse.com", "www.thingiverse.com"], make: h => `https://www.thingiverse.com/${h}/designs`, hint: "username", group: "Code and making" },
  { key: "medium", label: "Medium", hosts: ["medium.com"], make: h => `https://medium.com/@${at(h)}`, hint: "@handle", group: "Writing and design" },
  { key: "substack", label: "Substack", hosts: ["substack.com"], suffix: ".substack.com", make: h => `https://${h.toLowerCase()}.substack.com`, hint: "publication name", group: "Writing and design" },
  { key: "behance", label: "Behance", hosts: ["behance.net", "www.behance.net"], make: h => `https://www.behance.net/${h}`, hint: "username", group: "Writing and design" },
  { key: "dribbble", label: "Dribbble", hosts: ["dribbble.com"], make: h => `https://dribbble.com/${h}`, hint: "username", group: "Writing and design" },
  { key: "pinterest", label: "Pinterest", hosts: ["pinterest.com", "www.pinterest.com", "in.pinterest.com"], make: h => `https://www.pinterest.com/${h}`, hint: "username", group: "Writing and design" },
  { key: "patreon", label: "Patreon", hosts: ["patreon.com", "www.patreon.com"], make: h => `https://www.patreon.com/${h}`, hint: "creator name", group: "Support" },
  { key: "kofi", label: "Ko-fi", hosts: ["ko-fi.com"], make: h => `https://ko-fi.com/${h}`, hint: "page name", group: "Support" },
  { key: "buymeacoffee", label: "Buy Me a Coffee", hosts: ["buymeacoffee.com", "www.buymeacoffee.com"], make: h => `https://www.buymeacoffee.com/${h}`, hint: "page name", group: "Support" },
  { key: "linktree", label: "Linktree", hosts: ["linktr.ee"], make: h => `https://linktr.ee/${h}`, hint: "username", group: "Support" },
];

export const HIRE_TYPES = ["Freelance project", "Contract", "Full-time role", "Consulting", "Workshop or talk", "Sponsorship"] as const;

export function normalizeSocial(key: SocialKey, raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  const p = PLATFORMS.find(x => x.key === key);
  if (!p || v.length > 200) return null;
  if (/^https?:\/\//i.test(v)) {
    let u: URL;
    try {
      u = new URL(v);
    } catch {
      return null;
    }
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    u.protocol = "https:";
    const host = u.hostname.toLowerCase();
    if (p.hosts.length && !p.hosts.includes(host) && !(p.suffix && host.endsWith(p.suffix))) return null;
    if (u.username || u.password) return null;
    return u.toString();
  }
  if (!p.make) return key === "website" ? normalizeSocial(key, "https://" + v) : null;
  if (!/^@?[A-Za-z0-9_.\- %@+/]{1,80}$/.test(v)) return null;
  const made = p.make(v.replace(/\s+/g, " "));
  return made || null;
}

export function parseSocials(s: string | null | undefined): Partial<Record<SocialKey, string>> {
  try {
    const o = JSON.parse(s || "{}");
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function socialDisplay(key: SocialKey, url: string) {
  try {
    const u = new URL(url);
    if (key === "website") return u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "");
    const parts = decodeURIComponent(u.pathname).split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? u.hostname;
    if (key === "substack") return u.hostname.replace(/\.substack\.com$/, "");
    if (key === "whatsapp") return "+" + last;
    if (key === "thingiverse") return "@" + (parts[0] ?? last);
    return last.startsWith("@") ? last : key === "discord" || key === "telegram" ? u.hostname + "/" + last : "@" + last;
  } catch {
    return url;
  }
}

export const splitList = (s: string | null | undefined) => (s || "").split(",").map(x => x.trim()).filter(Boolean);

export function cleanSkills(list: string[]) {
  return Array.from(new Set(list.map(s => s.replace(/[^\p{L}\p{N} +#.\-/]/gu, "").trim().slice(0, 28)).filter(Boolean))).slice(0, 14).join(",");
}
