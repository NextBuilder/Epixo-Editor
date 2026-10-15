import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Privacy</h1>
      <p className="mt-3 text-graphite">Plain-language summary of what Epixo stores and why.</p>
      <div className="prose-epx mt-10">
        <h2>What we store</h2>
        <ul>
          <li>Your public name, handle and profile picture from GitHub or Google. We do not ask for your email address through GitHub. Google shares it at sign-in; we do not store it.</li>
          <li>Projects you save, posts you publish, their screen images, your likes and comments.</li>
          <li>The email address you give us for the Pro waiting list, used only to tell you when Pro opens.</li>
          <li>A count of AI requests and their size, to manage credits.</li>
        </ul>
        <h2>What we do not do</h2>
        <ul>
          <li>No advertising and no third-party trackers.</li>
          <li>We never sell your data.</li>
        </ul>
        <h2>AI requests</h2>
        <p>When you use AI design, your prompt, the current screen and any image you attach are sent to Anthropic to generate the design. They are not used to train models under Anthropic&apos;s commercial terms.</p>
        <h2>Cookies</h2>
        <p>One cookie keeps you signed in, and a short-lived one protects the sign-in step. Nothing else.</p>
        <h2>Deleting your data</h2>
        <p>You can delete projects and unpublish posts from your dashboard at any time. To delete your account, write to the contact on the Next Builder GitHub page and we will remove everything within 30 days.</p>
      </div>
    </div>
  );
}
