import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";
import { parseSocials, splitList } from "@/lib/profile";
import { all, currentUser } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function Settings() {
  const u = await currentUser();
  if (!u) redirect("/login?next=/settings");
  const posts = await all<{ id: string; title: string }>("SELECT id, title FROM posts WHERE owner_id = ? AND hidden = 0 ORDER BY created_at DESC LIMIT 100", u.id).catch(() => []);
  return (
    <div className="wrap-narrow pt-12 sm:pt-16">
      <h1 className="t-display">Settings</h1>
      <SettingsForm
        posts={posts}
        user={{
          name: u.name, handle: u.handle, bio: u.bio ?? "", avatar: u.avatar, headline: u.headline, location: u.location,
          socials: parseSocials(u.socials), skills: splitList(u.skills), hire_open: !!u.hire_open, hire_types: splitList(u.hire_types),
          hire_rate: u.hire_rate, hire_note: u.hire_note, pinned_post: u.pinned_post,
        }}
      />
    </div>
  );
}
