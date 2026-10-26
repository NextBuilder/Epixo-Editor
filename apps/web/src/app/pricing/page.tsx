import type { Metadata } from "next";
import { Check } from "@/components/icons";
import { Waitlist } from "@/components/waitlist";

export const metadata: Metadata = { title: "Pricing", description: "Epixo is free to use. A Pro plan with more AI design credits and team features is on the way." };

const FREE = ["The full editor on real LVGL", "All 113 boards and custom sizes", "Every export, including board packs", "Live Mirror over USB", "Unlimited projects", "Community, profiles and hiring", "Design with Claude or ChatGPT", "30 built-in AI requests"];
const PRO = ["Everything in Free", "Monthly AI credits for whole apps", "Design from a photo or a sketch", "Private projects and team folders", "Version history", "Priority help with new boards"];

export default function Pricing() {
  return (
    <div className="wrap pt-12 sm:pt-16">
      <div className="text-center">
        <h1 className="t-display">Pricing</h1>
        <p className="t-lead mx-auto mt-3 max-w-md">Designing and exporting is free, and will stay free.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-[900px] grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
        <section className="card p-8">
          <h2 className="text-[22px]">Free</h2>
          <p className="mt-6 font-display text-[48px] font-semibold leading-none tracking-tight">$0</p>
          <a href="/editor" className="btn btn-primary btn-lg mt-8 w-full">Open the editor</a>
          <ul className="mt-8 space-y-3">
            {FREE.map(f => <li key={f} className="flex gap-3 text-[15px]"><Check size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-signal" />{f}</li>)}
          </ul>
        </section>
        <section className="rounded-[22px] bg-[#1D1D1F] p-8 text-[#F5F5F7] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px]">Pro</h2>
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-medium">Coming soon</span>
          </div>
          <p className="mt-6 font-display text-[48px] font-semibold leading-none tracking-tight text-white/40">Soon</p>
          <Waitlist />
          <ul className="mt-8 space-y-3">
            {PRO.map(f => <li key={f} className="flex gap-3 text-[15px] text-white/85"><Check size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#2997FF]" />{f}</li>)}
          </ul>
        </section>
      </div>
      <p className="mt-8 text-center text-[13px] text-mist">Pro features and price are not final. We email the list once, when it opens.</p>
    </div>
  );
}
