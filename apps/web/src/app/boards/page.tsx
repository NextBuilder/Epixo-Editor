import type { Metadata } from "next";
import { BoardDirectory } from "@/components/board-directory";
import { BOARDS, BRANDS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Boards",
  description: `Every display board Epixo supports, grouped by maker: ${BRANDS.map(b => b.name).join(", ")}. Resolution, panel, display and touch chips for each.`,
};

export default function BoardsPage() {
  return (
    <div className="wrap pt-12 sm:pt-16">
      <h1 className="t-display">Boards</h1>
      <p className="t-lead mt-3 max-w-xl">{BOARDS.length} displays from {BRANDS.length} makers. Pick one and the editor is set up for it.</p>
      <BoardDirectory boards={BOARDS} brands={BRANDS} />
    </div>
  );
}
