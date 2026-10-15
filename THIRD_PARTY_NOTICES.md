# Third-party notices

Epixo is built on the work of these projects. Each keeps its own licence.

| Component | Where it is used | Licence |
|---|---|---|
| [LVGL](https://github.com/lvgl/lvgl) | Compiled into `apps/editor/epixo-lvgl.wasm`; target of all exports | MIT |
| Montserrat font (bundled with LVGL) | Text rendering in the engine | SIL Open Font License 1.1 |
| [ESP32_Display_Panel](https://github.com/esp-arduino-libs/ESP32_Display_Panel) | Port files in `apps/editor/packs/espanel/` | Apache 2.0 (`LICENSE-ESP32_Display_Panel.txt`) |
| [JSZip](https://github.com/Stuk/jszip) | Building export zip files in the editor | MIT (dual-licensed MIT or GPLv3) |
| [Next.js](https://github.com/vercel/next.js), [React](https://github.com/facebook/react) | Website | MIT |
| [OpenNext for Cloudflare](https://github.com/opennextjs/opennextjs-cloudflare) | Running the website on Cloudflare Workers | MIT |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | Website styling | MIT |
| [Zod](https://github.com/colinhacks/zod) | Input validation on the server | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) | Website icons | ISC |
| Sora, Geist, JetBrains Mono (via [Fontsource](https://fontsource.org)) | Website fonts | SIL Open Font License 1.1 |

Board specifications were cross-checked against ESP32_Display_Panel, [rzeldent/platformio-espressif32-sunton](https://github.com/rzeldent/platformio-espressif32-sunton) and makers' public wiki pages.

All product names and logos belong to their owners. Their use in Epixo identifies compatible hardware and does not imply endorsement.
