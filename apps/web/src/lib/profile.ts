export type SocialKey = "website" | "github" | "youtube" | "linkedin" | "x" | "instagram" | "hackster" | "instructables" | "hackaday" | "tiktok" | "discord" | "printables";

type Platform = { key: SocialKey; label: string; hosts: string[]; make?: (h: string) => string; hint: string };

export const PLATFORMS: Platform[] = [
  { key: "website", label: "Website", hosts: [], hint: "https://yoursite.com" },
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "www.youtube.com", "youtu.be"], make: h => `https://youtube.com/@${h.replace(/^@/, "")}`, hint: "@channel" },
  { key: "github", label: "GitHub", hosts: ["github.com"], make: h => `https://github.com/${h}`, hint: "username" },
  { key: "linkedin", label: "LinkedIn", hosts: ["linkedin.com", "www.linkedin.com", "in.linkedin.com"], make: h => `https://www.linkedin.com/in/${h}`, hint: "profile name or full link" },
  { key: "x", label: "X", hosts: ["x.com", "twitter.com", "www.x.com"], make: h => `https://x.com/${h.replace(/^@/, "")}`, hint: "@handle" },
  { key: "instagram", label: "Instagram", hosts: ["instagram.com", "www.instagram.com"], make: h => `https://instagram.com/${h.replace(/^@/, "")}`, hint: "@handle" },
  { key: "hackster", label: "Hackster", hosts: ["hackster.io", "www.hackster.io"], make: h => `https://www.hackster.io/${h}`, hint: "username" },
  { key: "instructables", label: "Instructables", hosts: ["instructables.com", "www.instructables.com"], make: h => `https://www.instructables.com/member/${encodeURIComponent(h)}/`, hint: "member name" },
  { key: "hackaday", label: "Hackaday.io", hosts: ["hackaday.io"], make: h => `https://hackaday.io/${h}`, hint: "username" },
  { key: "printables", label: "Printables", hosts: ["printables.com", "www.printables.com"], make: h => `https://www.printables.com/@${h.replace(/^@/, "")}`, hint: "@handle" },
  { key: "tiktok", label: "TikTok", hosts: ["tiktok.com", "www.tiktok.com"], make: h => `https://www.tiktok.com/@${h.replace(/^@/, "")}`, hint: "@handle" },
  { key: "discord", label: "Discord", hosts: ["discord.gg", "discord.com"], hint: "invite link" },
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
    if (p.hosts.length && !p.hosts.includes(u.hostname.toLowerCase())) return null;
    if (u.username || u.password) return null;
    return u.toString();
  }
  if (!p.make) return key === "website" ? normalizeSocial(key, "https://" + v) : null;
  if (!/^@?[A-Za-z0-9_.\- %]{1,60}$/.test(v)) return null;
  return p.make(v.replace(/\s+/g, " "));
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
    return last.startsWith("@") ? last : key === "discord" ? u.hostname + "/" + last : "@" + last;
  } catch {
    return url;
  }
}

export const splitList = (s: string | null | undefined) => (s || "").split(",").map(x => x.trim()).filter(Boolean);

export function cleanSkills(list: string[]) {
  return Array.from(new Set(list.map(s => s.replace(/[^\p{L}\p{N} +#.\-/]/gu, "").trim().slice(0, 28)).filter(Boolean))).slice(0, 14).join(",");
}
