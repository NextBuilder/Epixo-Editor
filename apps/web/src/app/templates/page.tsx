import type { Metadata } from "next";
import { TemplateGallery } from "@/components/template-gallery";
import { BOARDS, TEMPLATES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Templates",
  description: "LVGL screen templates that lay themselves out for any board, round or rectangular. Smart home, thermostat, weather, music, activity rings, energy, settings and keypad.",
};

const PICKS = ["waveshare-esp32-s3-touch-lcd-4-3", "waveshare-esp32-s3-touch-amoled-1-75", "sunton-cyd-esp32-2432s028r", "m5stack-core2", "waveshare-esp32-s3-touch-lcd-4", "lilygo-t-display-s3"];

export default function TemplatesPage() {
  const boards = PICKS.map(id => BOARDS.find(b => b.id === id)!).filter(Boolean);
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6">
      <h1 className="text-4xl font-semibold sm:text-5xl">Templates</h1>
      <p className="mt-4 max-w-2xl text-lg text-graphite">
        Start from a finished screen. Every template rebuilds itself for the board you pick, so a dial stays round on a watch and a dashboard spreads out on a 7-inch panel.
      </p>
      <TemplateGallery templates={TEMPLATES} boards={boards} all={BOARDS} />
    </div>
  );
}
