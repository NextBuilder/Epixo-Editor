import Link from "next/link";
import { ArrowUpRight, Check, Sparkles, Usb } from "@/components/icons";
import { TemplateStill } from "@/components/template-still";
import { BOARDS, BRANDS } from "@/lib/data";

const PANEL = { id: "waveshare-esp32-s3-touch-lcd-4-3", w: 800, h: 480 };
const WATCH = { id: "waveshare-esp32-s3-touch-amoled-1-75", w: 466, h: 466, round: true };

// One Apple-style sentence: the claim in ink, the detail in grey.
function Say({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p className="text-[19px] font-semibold leading-snug tracking-[-0.022em] sm:text-[21px]">
      {title} <span className="text-graphite">{children}</span>
    </p>
  );
}

function Tile({ className = "", href, children }: { className?: string; href?: string; children: React.ReactNode }) {
  const cls = `card group relative flex flex-col overflow-hidden rounded-[28px] p-7 sm:p-8 ${href ? "card-hover" : ""} ${className}`;
  return href ? (
    <Link href={href} className={cls} data-reveal>
      {children}
      <span className="absolute right-6 top-6 grid size-8 place-items-center rounded-full bg-fill text-graphite opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
        <ArrowUpRight size={15} weight="bold" />
      </span>
    </Link>
  ) : (
    <div className={cls} data-reveal>{children}</div>
  );
}

export function HomeBento() {
  const makers = BRANDS.map(b => b.name);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
      <Tile className="lg:col-span-2">
        <Say title="Real LVGL, right in your browser.">The canvas is LVGL 9 compiled to WebAssembly, so every pixel matches your board.</Say>
        <div className="-mx-2 mt-8 flex flex-1 items-end justify-center">
          <div className="w-full max-w-[520px]"><TemplateStill board={PANEL} template="weather" /></div>
        </div>
      </Tile>

      <Tile href="/connect">
        <Say title="Ask for a screen.">In the editor, or from Claude and ChatGPT.</Say>
        <div className="mt-8 flex flex-1 flex-col justify-end gap-2.5 text-[15px]">
          <p className="ml-auto max-w-[85%] rounded-[20px] rounded-br-[6px] bg-signal px-4 py-2.5 text-white">A thermostat for my round display.</p>
          <div className="flex items-end gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#5E5CE6,#BF5AF2)] text-white"><Sparkles size={14} weight="fill" /></span>
            <p className="max-w-[85%] rounded-[20px] rounded-bl-[6px] bg-fill px-4 py-2.5">Done. A dial, a mode switch and a schedule.</p>
          </div>
          <div className="mx-auto mt-3 w-[46%]"><TemplateStill board={WATCH} template="thermostat" /></div>
        </div>
      </Tile>

      <Tile>
        <Say title="Design Doctor.">Catches problems before your board does.</Say>
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl bg-paper text-[15px]">
          <li className="flex items-center gap-3 px-4 py-3"><span className="grid size-5 place-items-center rounded-full bg-live text-white"><Check size={12} weight="bold" /></span>Text fits on every screen</li>
          <li className="flex items-center gap-3 px-4 py-3"><span className="grid size-5 place-items-center rounded-full bg-[#FF9F0A] text-[12px] font-bold text-white">!</span><span className="flex-1">Button is 32 px tall</span><span className="rounded-full bg-signal-soft px-2.5 py-0.5 text-[13px] font-medium text-signal">Fix</span></li>
          <li className="flex items-center gap-3 px-4 py-3"><span className="grid size-5 place-items-center rounded-full bg-live text-white"><Check size={12} weight="bold" /></span>Contrast is easy to read</li>
        </ul>
      </Tile>

      <Tile href="/boards">
        <Say title={`${BOARDS.length} boards.`}>{`From ${BRANDS.length} makers, round and square, set up for you.`}</Say>
        <p className="mt-6 bg-[linear-gradient(120deg,#0071E3,#5E5CE6_55%,#BF5AF2)] bg-clip-text font-display text-[88px] font-semibold leading-none tracking-[-0.05em] text-transparent">{BOARDS.length}</p>
        <p className="mt-auto pt-6 text-[13px] leading-relaxed text-mist">{makers.slice(0, 8).join(" · ")}</p>
      </Tile>

      <Tile href="/docs/live-mirror">
        <Say title="Live Mirror.">Every edit shows up on your board over USB as you make it.</Say>
        <div className="mt-8 flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-4 text-[15px]">
            <span className="grid size-9 place-items-center rounded-full bg-ink text-paper"><Usb size={18} /></span>
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-live" /></span>
            Mirroring to your board
          </div>
        </div>
      </Tile>
    </div>
  );
}

const KW = "text-[#FF7AB2]", FN = "text-[#67B7FF]", TY = "text-[#5DD8FF]", CM = "text-[#7F8C98]", ST = "text-[#FF8170]";

export function FirmwareCode() {
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#1C1C1E] shadow-[0_0_0_0.5px_rgb(255_255_255/0.12),0_30px_80px_-30px_rgb(0_0_0/0.8)]">
      <div className="flex items-center gap-2 px-4 py-3 shadow-[inset_0_-0.5px_0_rgb(255_255_255/0.1)]">
        <span className="size-3 rounded-full bg-[#FF5F57]" /><span className="size-3 rounded-full bg-[#FEBC2E]" /><span className="size-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 font-mono text-[12px] text-[#98989D]">actions.c</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7] text-[#E5E5EA] sm:text-[14px]"><code>
        <span className={KW}>#include</span> <span className={ST}>&quot;ui.h&quot;</span>{"\n\n"}
        <span className={CM}>{"// Runs when the Fan switch changes"}</span>{"\n"}
        <span className={KW}>void</span> <span className={FN}>ui_action_fan</span>(<span className={TY}>lv_event_t</span> * e){"\n"}
        {"{\n"}
        {"    "}<span className={TY}>lv_obj_t</span> * sw = <span className={FN}>lv_event_get_target</span>(e);{"\n"}
        {"    "}<span className={FN}>digitalWrite</span>(FAN_PIN, <span className={FN}>lv_obj_has_state</span>(sw, LV_STATE_CHECKED));{"\n"}
        {"}\n\n"}
        <span className={CM}>{"// Show a reading anywhere in your firmware"}</span>{"\n"}
        <span className={FN}>lv_label_set_text_fmt</span>(ui_Home_Temperature, <span className={ST}>&quot;%d C&quot;</span>, temp);
      </code></pre>
    </div>
  );
}
