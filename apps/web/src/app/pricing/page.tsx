import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Waitlist } from "@/components/waitlist";

export const metadata: Metadata = { title: "Pricing", description: "Epixo is free to use. A Pro plan with more AI design credits and team features is on the way." };

const FREE = ["The full editor with the real LVGL engine", "All 113 boards and custom sizes", "Every export: C, board packs, MicroPython, XML, ESPHome", "Live Mirror to your board over USB", "Unlimited projects saved to your account", "Publish and remix in the community", "30 AI design requests to try it out"];
const PRO = ["Everything in Free", "Monthly AI design credits for whole apps from one prompt", "Design from a photo of a sketch or another device", "Private projects and shared team folders", "Version history for every project", "Priority help with new boards"];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Pricing</h1>
      <p className="mt-4 max-w-xl text-lg text-graphite">Designing and exporting is free and will stay free. Pro adds more AI and tools for teams.</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="rounded-[24px] bg-card p-8 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <h2 className="text-2xl font-semibold">Free</h2>
          <p className="mt-1 text-graphite">For makers, students and anyone shipping a screen.</p>
          <p className="mt-6 font-display text-4xl font-semibold">$0</p>
          <a href="/editor" className="btn btn-quiet mt-6 w-full">Open the editor</a>
          <ul className="mt-8 space-y-3">
            {FREE.map(f => (
              <li key={f} className="flex gap-3 text-[15px]">
                <Check size={18} className="mt-0.5 shrink-0 text-live" />
                {f}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[24px] bg-ink p-8 text-white">
          <h2 className="text-2xl font-semibold">Pro</h2>
          <p className="mt-1 text-white/65">For product teams and makers who use AI a lot.</p>
          <p className="mt-6 font-display text-4xl font-semibold">Coming soon</p>
          <Waitlist />
          <ul className="mt-8 space-y-3">
            {PRO.map(f => (
              <li key={f} className="flex gap-3 text-[15px] text-white/85">
                <Check size={18} className="mt-0.5 shrink-0 text-[#7FB2FF]" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-8 text-sm text-mist">Pro features and price are not final. Join the list and we will email you once, when it opens.</p>
    </div>
  );
}
