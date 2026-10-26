"use client";

import { LiveDevice } from "./live-device";

const PANEL = { id: "waveshare-esp32-s3-touch-lcd-4-3", name: "Waveshare ESP32-S3-Touch-LCD-4.3", w: 800, h: 480 };
const WATCH = { id: "waveshare-esp32-s3-touch-amoled-1-75", name: "Waveshare ESP32-S3-Touch-AMOLED-1.75", w: 466, h: 466, round: true };
const CYD = { id: "sunton-cyd-esp32-2432s028r", name: "Sunton ESP32-2432S028R", w: 240, h: 320 };
const T_PANEL = ["home", "energy", "weather", "music"];
const T_WATCH = ["thermostat", "fitness"];
const T_CYD = ["lock", "settings", "music"];

export function HeroBench() {
  return (
    <div>
      <div className="relative mx-auto aspect-[1.75] w-full [perspective:1400px]">
        <div className="float-in absolute left-1/2 top-0 w-[62%] -translate-x-1/2" style={{ "--d": "300ms" } as React.CSSProperties}>
          <LiveDevice board={PANEL} templates={T_PANEL} width="100%" every={8000} />
        </div>
        <div className="float-in absolute bottom-[2%] left-0 w-[25%]" style={{ "--d": "520ms" } as React.CSSProperties}>
          <LiveDevice board={WATCH} templates={T_WATCH} width="100%" every={9000} offset={2600} />
        </div>
        <div className="float-in absolute bottom-[2%] right-[3%] w-[17%]" style={{ "--d": "680ms" } as React.CSSProperties}>
          <LiveDevice board={CYD} templates={T_CYD} width="100%" every={10000} offset={5200} />
        </div>
      </div>
      <p className="stagger mt-8 text-[13px] text-mist" style={{ "--d": "1100ms" } as React.CSSProperties}>
        <span className="inline-flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-live" />
          </span>
          Live LVGL, running in this page. Tap a screen.
        </span>
      </p>
    </div>
  );
}
