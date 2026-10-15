"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, X } from "lucide-react";
import { Avatar } from "./site-header";
import { Group, Row } from "./profile/hire-sheet";
import { PlatformTile } from "./profile/social-links";
import { HIRE_TYPES, PLATFORMS, type SocialKey } from "@/lib/profile";

type U = {
  name: string; handle: string; bio: string; avatar: string | null; headline: string; location: string;
  socials: Partial<Record<SocialKey, string>>; skills: string[]; hire_open: boolean; hire_types: string[]; hire_rate: string; hire_note: string; pinned_post: string | null;
};

const SUGGEST = ["LVGL", "ESP32", "ESP-IDF", "Arduino", "PlatformIO", "MicroPython", "ESPHome", "Home Assistant", "PCB design", "KiCad", "EasyEDA", "UI design", "Embedded C", "3D printing", "Enclosure design", "IoT"];

export function SettingsForm({ user, posts }: { user: U; posts: { id: string; title: string }[] }) {
  const [f, setF] = useState<U>(user);
  const [skill, setSkill] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const dirty = JSON.stringify(f) !== JSON.stringify(user);
  const set = <K extends keyof U>(k: K, v: U[K]) => setF(x => ({ ...x, [k]: v }));
  const addSkill = (s: string) => {
    const v = s.trim().replace(/,$/, "");
    if (v && !f.skills.some(x => x.toLowerCase() === v.toLowerCase()) && f.skills.length < 14) set("skills", [...f.skills, v]);
    setSkill("");
  };

  async function save() {
    setBusy(true);
    setMsg(null);
    const r = await fetch("/api/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: f.name, handle: f.handle, bio: f.bio, headline: f.headline, location: f.location, socials: Object.fromEntries(PLATFORMS.map(p => [p.key, f.socials[p.key] ?? ""])), skills: f.skills, hire_open: f.hire_open, hire_types: f.hire_types, hire_rate: f.hire_rate, hire_note: f.hire_note, pinned_post: f.pinned_post }),
    });
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Profile saved" } : { ok: false, text: j.error ?? "Could not save." });
    if (r.ok) router.refresh();
  }

  async function photo(fl: File | undefined) {
    if (!fl) return;
    setPhotoBusy(true);
    const fd = new FormData();
    fd.append("file", fl);
    const r = await fetch("/api/me/avatar", { method: "POST", body: fd });
    const j = (await r.json().catch(() => ({}))) as { avatar?: string; error?: string };
    setPhotoBusy(false);
    if (r.ok && j.avatar) {
      setF(x => ({ ...x, avatar: j.avatar! }));
      user.avatar = j.avatar!;
      router.refresh();
    } else setMsg({ ok: false, text: j.error ?? "Could not upload the photo." });
  }

  return (
    <div className="mt-10 space-y-9 pb-32">
      <section className="flex items-center gap-5 rounded-[20px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <Avatar src={f.avatar} name={f.name || "?"} size={76} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{f.name || "Your name"}</p>
          <p className="truncate text-sm text-mist">epixo.app/u/{f.handle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => photo(e.target.files?.[0])} />
            <button className="btn btn-quiet btn-sm" onClick={() => file.current?.click()} disabled={photoBusy}><ImagePlus size={15} />{photoBusy ? "Uploading…" : "Change photo"}</button>
            {f.avatar?.startsWith("/api/media/") && (
              <button className="btn btn-sm text-graphite" onClick={async () => { await fetch("/api/me/avatar", { method: "DELETE" }); setF(x => ({ ...x, avatar: null })); user.avatar = null; router.refresh(); }}>Remove</button>
            )}
          </div>
        </div>
      </section>

      <Group title="Profile" note="Your headline is the first line people read, on your profile and in the makers directory.">
        <Row label="Name"><input className="row-input" value={f.name} maxLength={60} onChange={e => set("name", e.target.value)} /></Row>
        <Row label="Handle"><span className="flex items-center"><span className="text-mist">@</span><input className="row-input" value={f.handle} maxLength={20} onChange={e => set("handle", e.target.value.toLowerCase())} /></span></Row>
        <Row label="Headline"><input className="row-input" value={f.headline} maxLength={90} placeholder="e.g. ESP32 maker building smart displays" onChange={e => set("headline", e.target.value)} /></Row>
        <Row label="Location"><input className="row-input" value={f.location} maxLength={60} placeholder="City, country" onChange={e => set("location", e.target.value)} /></Row>
      </Group>

      <Group title="About">
        <textarea className="row-input min-h-[120px] resize-y py-3" value={f.bio} maxLength={500} placeholder="What do you build, and what are you best at?" onChange={e => set("bio", e.target.value)} />
      </Group>

      <section>
        <h3 className="mb-2 px-4 font-sans text-[13px] font-medium tracking-normal text-mist">Skills</h3>
        <div className="rounded-[18px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div className="flex flex-wrap gap-2">
            {f.skills.map(s => (
              <span key={s} className="scale-in flex items-center gap-1 rounded-full bg-signal-soft py-1.5 pl-3 pr-1.5 text-[13px] font-medium text-signal-deep">
                {s}
                <button className="grid size-5 place-items-center rounded-full hover:bg-white/70" onClick={() => set("skills", f.skills.filter(x => x !== s))} aria-label={`Remove ${s}`}><X size={12} /></button>
              </span>
            ))}
            <input className="min-w-[160px] flex-1 bg-transparent py-1.5 text-[15px] outline-none placeholder:text-mist" value={skill} placeholder={f.skills.length ? "Add another" : "Type a skill and press Enter"} onChange={e => (e.target.value.endsWith(",") ? addSkill(e.target.value) : setSkill(e.target.value))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skill); } if (e.key === "Backspace" && !skill && f.skills.length) set("skills", f.skills.slice(0, -1)); }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
            {SUGGEST.filter(s => !f.skills.includes(s)).slice(0, 10).map(s => (
              <button key={s} className="rounded-full px-2.5 py-1 text-[13px] text-graphite shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink" onClick={() => addSkill(s)}>+ {s}</button>
            ))}
          </div>
        </div>
      </section>

      <Group title="Links" note="Paste your username or the full link. They appear on your profile as buttons.">
        {PLATFORMS.map(p => (
          <label key={p.key} className="flex min-h-[52px] items-center gap-3">
            <PlatformTile k={p.key} size={28} />
            <span className="w-[104px] shrink-0 text-[15px]">{p.label}</span>
            <input className="row-input" value={f.socials[p.key] ?? ""} placeholder={p.hint} maxLength={200} onChange={e => set("socials", { ...f.socials, [p.key]: e.target.value })} />
          </label>
        ))}
      </Group>

      <section id="hire" className="scroll-mt-24">
        <h3 className="mb-2 px-4 font-sans text-[13px] font-medium tracking-normal text-mist">Hiring</h3>
        <div className="divide-y divide-line overflow-hidden rounded-[18px] bg-card shadow-[inset_0_0_0_1px_var(--color-line)] [&>*]:ml-4 [&>*]:pr-4">
          <div className="flex min-h-[60px] items-center gap-4">
            <span className="flex-1">
              <span className="block text-[15px] font-medium">Available for work</span>
              <span className="block text-[13px] text-mist">Shows a Hire button on your profile and in the makers directory</span>
            </span>
            <button role="switch" aria-checked={f.hire_open} className="ios-switch" onClick={() => set("hire_open", !f.hire_open)} aria-label="Available for work" />
          </div>
          {f.hire_open && (
            <>
              <div className="rise py-4">
                <span className="text-[15px]">Open to</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HIRE_TYPES.map(t => {
                    const on = f.hire_types.includes(t);
                    return (
                      <button key={t} aria-pressed={on} onClick={() => set("hire_types", on ? f.hire_types.filter(x => x !== t) : [...f.hire_types, t])} className={`pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] ${on ? "bg-ink text-white" : "text-graphite shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:text-ink"}`}>
                        {on && <Check size={14} />}{t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rise" style={{ "--i": 1 } as React.CSSProperties}><Row label="Rate"><input className="row-input" value={f.hire_rate} maxLength={60} placeholder="e.g. From ₹2,000 per hour, or project based" onChange={e => set("hire_rate", e.target.value)} /></Row></div>
              <div className="rise py-1" style={{ "--i": 2 } as React.CSSProperties}><textarea className="row-input min-h-[100px] resize-y py-3" value={f.hire_note} maxLength={400} placeholder="What kind of work are you looking for? This appears on your profile." onChange={e => set("hire_note", e.target.value)} /></div>
            </>
          )}
        </div>
      </section>

      {posts.length > 0 && (
        <Group title="Pinned project" note="Shown large at the top of your profile. Leave on automatic to feature your most liked project.">
          <Row label="Feature">
            <select className="row-input" value={f.pinned_post ?? ""} onChange={e => set("pinned_post", e.target.value || null)}>
              <option value="">Automatic</option>
              {posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </Row>
        </Group>
      )}

      <section className="rounded-[18px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <p className="text-[15px] font-medium">Sign out</p>
        <p className="mt-1 text-sm text-graphite">Signs you out on this browser.</p>
        <button className="btn btn-quiet btn-sm mt-3" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/"; }}>Sign out</button>
      </section>

      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/85 shadow-[0_-10px_30px_-20px_rgb(12_18_34/0.3)] backdrop-blur-xl transition-transform duration-500 [transition-timing-function:var(--ease-ios)] ${dirty || msg ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-[680px] items-center gap-4 px-4 py-3.5 sm:px-6">
          <span key={msg?.text ?? "dirty"} className={`scale-in flex-1 text-sm ${msg ? (msg.ok ? "text-[#137A41]" : "text-danger") : "text-graphite"}`}>{msg ? msg.text : "You have unsaved changes"}</span>
          {dirty && <button className="btn btn-quiet btn-sm" onClick={() => { setF(user); setMsg(null); }}>Discard</button>}
          <button className="btn btn-primary btn-sm" disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
          <a href={`/u/${f.handle}`} className="btn btn-sm text-signal">View profile</a>
        </div>
      </div>
    </div>
  );
}
