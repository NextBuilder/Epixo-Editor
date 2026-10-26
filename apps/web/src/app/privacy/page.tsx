import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="wrap-narrow pt-12 sm:pt-16">
      <h1 className="t-display">Privacy</h1>
      <p className="t-lead mt-3">Plain-language summary of what Epixo stores and why.</p>
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
        <p>Delete projects and unpublish posts from your dashboard at any time. In Settings you can download everything we keep about you as one file, sign out of every device, and delete your account. Deleting your account removes your profile, projects, posts, images, comments and connections straight away.</p>
        <h2>AI connections</h2>
        <p>When you connect Claude, ChatGPT or another AI app, that app can read and change your Epixo projects through a private link. It cannot see your sign-in or other account details. We store only a fingerprint of the link, so not even we can read it back. Remove a connection at any time and its link stops working at once.</p>
      </div>
    </div>
  );
}
