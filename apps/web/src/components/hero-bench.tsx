"use client";

import { useState } from "react";
import { LiveDevice } from "./live-device";

const PANEL = { id: "waveshare-esp32-s3-touch-lcd-4-3", name: "Waveshare ESP32-S3-Touch-LCD-4.3", w: 800, h: 480 };
const WATCH = { id: "waveshare-esp32-s3-touch-amoled-1-75", name: "Waveshare ESP32-S3-Touch-AMOLED-1.75", w: 466, h: 466, round: true };
const CYD = { id: "sunton-cyd-esp32-2432s028r", name: "Sunton ESP32-2432S028R", w: 240, h: 320 };
const T_PANEL = ["home", "energy", "weather", "music"];
const T_WATCH = ["thermostat", "fitness"];
const T_CYD = ["lock", "settings", "music"];

const NAMES: Record<string, string> = { home: "Smart Home", energy: "Energy Monitor", weather: "Weather", music: "Music Player", thermostat: "Thermostat", fitness: "Activity Rings", lock: "Door Keypad", settings: "Settings List" };

export function HeroBench() {
  const [now, setNow] = useState<Record<string, string>>({ panel: "home", watch: "thermostat", cyd: "lock" });
  const set = (k: string) => (t: string) => setNow(n => (n[k] === t ? n : { ...n, [k]: t }));
  const rows = [
    ["Waveshare 4.3-inch panel", "800 × 480", now.panel],
    ["Waveshare round AMOLED", "466 × 466", now.watch],
    ["Cheap Yellow Display", "240 × 320", now.cyd],
  ];
  return (
    <div className="mx-auto w-full max-w-[620px] lg:max-w-none">
      <div className="relative aspect-[1.33] w-full [perspective:1400px]">
        <div className="absolute right-0 top-0 w-[84%] float-in" style={{ "--d": "350ms" } as React.CSSProperties}>
          <LiveDevice board={PANEL} templates={T_PANEL} width="100%" every={8000} onTemplate={set("panel")} />
        </div>
        <div className="absolute bottom-0 left-0 w-[36%] float-in" style={{ "--d": "550ms" } as React.CSSProperties}>
          <LiveDevice board={WATCH} templates={T_WATCH} width="100%" every={9000} offset={2600} onTemplate={set("watch")} />
        </div>
        <div className="absolute bottom-0 right-[5%] w-[21%] float-in" style={{ "--d": "700ms" } as React.CSSProperties}>
          <LiveDevice board={CYD} templates={T_CYD} width="100%" every={10000} offset={5200} onTemplate={set("cyd")} />
        </div>
      </div>
      <div className="stagger mt-7" style={{ "--d": "1100ms" } as React.CSSProperties}><div className="flex items-center gap-2 text-[13px] font-medium text-ink">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-live" />
        </span>
        Running LVGL 9.2 in this page. Tap any screen.
      </div></div>
      <dl className="stagger mt-3 grid grid-cols-3 gap-4 border-t border-line pt-3 text-[13px]" style={{ "--d": "1250ms" } as React.CSSProperties}>
        {rows.map(([name, res, t]) => (
          <div key={name}>
            <dt className="text-graphite">{name}</dt>
            <dd className="text-mist">
              {res}, {NAMES[t]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
