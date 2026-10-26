import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Empty } from "@/components/empty";
import { PostGrid } from "@/components/post-card";
import { listPosts } from "@/lib/posts";
import { currentUser } from "@/lib/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default async function Saved() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/saved");
  const posts = await listPosts({ saved: user.id, sort: "new", limit: 60 });
  return (
    <div className="wrap pt-12 sm:pt-16">
      <h1 className="t-display">Saved</h1>
      <div className="mt-10">
        {posts.length ? <PostGrid posts={posts} /> : <Empty icon={<Bookmark size={26} />} title="Nothing saved yet" body="Tap Save on any project to keep it here for later." action={["/community", "Explore projects"]} />}
      </div>
    </div>
  );
}
