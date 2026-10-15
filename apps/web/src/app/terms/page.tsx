import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Terms</h1>
      <p className="mt-3 text-graphite">The short version of the rules for using Epixo.</p>
      <div className="prose-epx mt-10">
        <h2>Your work</h2>
        <p>You own the designs you make and the code you export. Use them in personal or commercial products.</p>
        <h2>Publishing</h2>
        <p>When you publish a project to the community, you let other people view it, open it in the editor, change it and publish their own version with a link back to yours. You can unpublish at any time; copies others already made stay theirs.</p>
        <h2>Be decent</h2>
        <ul>
          <li>Only publish things you have the right to share.</li>
          <li>No spam, no hateful or sexual content, no malware.</li>
          <li>Moderators may hide or remove posts and comments that break these rules.</li>
        </ul>
        <h2>No warranty</h2>
        <p>Epixo is provided as is. Exported code is tested, but always test on your hardware before you ship a product.</p>
      </div>
    </div>
  );
}
