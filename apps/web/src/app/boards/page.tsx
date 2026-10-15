import type { Metadata } from "next";
import { BoardDirectory } from "@/components/board-directory";
import { BOARDS, BRANDS, VERIFY } from "@/lib/data";

export const metadata: Metadata = {
  title: "Supported boards",
  description: `Every display board Epixo supports, grouped by maker: ${BRANDS.map(b => b.name).join(", ")}. Resolution, panel, display and touch chips for each.`,
};

export default function BoardsPage() {
  const counts = ["driver", "web", "spec"].map(k => [k, BOARDS.filter(b => VERIFY[b.v]?.label === VERIFY[k].label).length] as const);
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Boards</h1>
      <p className="mt-4 max-w-2xl text-lg text-graphite">
        {BOARDS.length} display boards from {BRANDS.length} makers. Pick one and the editor sets the right size, shape and touch for you. Not listed? Use Custom size and design for any screen.
      </p>
      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
        {counts.map(([k, n]) => (
          <div key={k} className="max-w-[240px]">
            <dt className="font-medium text-ink">
              {VERIFY[k].label} <span className="tabular-nums text-mist">{n}</span>
            </dt>
            <dd className="mt-1 text-graphite">{VERIFY[k].note}</dd>
          </div>
        ))}
      </dl>
      <BoardDirectory boards={BOARDS} brands={BRANDS} />
    </div>
  );
}
