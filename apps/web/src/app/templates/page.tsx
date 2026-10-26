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
    <div className="wrap pt-12 sm:pt-16">
      <h1 className="t-display">Templates</h1>
      <p className="t-lead mt-3 max-w-xl">Finished screens that rebuild themselves for any board.</p>
      <TemplateGallery templates={TEMPLATES} boards={boards} all={BOARDS} />
    </div>
  );
}
