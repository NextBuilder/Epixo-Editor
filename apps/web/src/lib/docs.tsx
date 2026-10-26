import type { ReactNode } from "react";

export type Doc = { slug: string; title: string; summary: string; group: string; body: ReactNode };

export const DOCS: Doc[] = [
  {
    slug: "getting-started",
    group: "Start here",
    title: "Getting started",
    summary: "Your first screen on a real board in about five minutes.",
    body: (
      <>
        <p>Epixo is an LVGL screen designer that runs in your browser. The canvas is drawn by LVGL itself, compiled to WebAssembly, so what you see is what your board will show.</p>
        <h2>1. Pick a board</h2>
        <p>Open the <a href="/editor">editor</a> and press the board name at the top. Boards are grouped by maker. Search by name, chip or resolution, or choose Custom size for any screen. Round boards get a round canvas.</p>
        <h2>2. Start from a template or a blank screen</h2>
        <p>Templates lay themselves out for the board you picked. A thermostat dial stays centred on a round watch and spreads out on a 7-inch panel.</p>
        <h2>3. Add and arrange widgets</h2>
        <ul>
          <li>Drag a widget from the left panel onto the canvas.</li>
          <li>Select it to change text, colours, size and behaviour on the right.</li>
          <li>Set a button&apos;s On tap action to move to another screen. Press Try it to tap through it on real LVGL.</li>
        </ul>
        <h2>4. Check it with Doctor</h2>
        <p>Doctor looks for text that will clip, buttons too small for a finger on your screen&apos;s real size, low contrast and memory that will not fit. Most problems have a one-click fix.</p>
        <h2>5. Export</h2>
        <p>Press Export and tick what you need. For a board with a ready-to-build pack you get a PlatformIO project you can upload straight away. See <a href="/docs/export">Exporting code</a>.</p>
        <h2>Saving your work</h2>
        <p>Sign in and your projects save to your account as you work. You can find them in your <a href="/dashboard">dashboard</a>. Without signing in, your work stays in this browser.</p>
      </>
    ),
  },
  {
    slug: "ai",
    group: "Start here",
    title: "Designing with AI",
    summary: "Ask for a screen in plain words, in the editor or from Claude and ChatGPT.",
    body: (
      <>
        <p>Epixo&apos;s AI builds real LVGL screens, not pictures of them. Everything it makes is made of normal widgets you can select, change and export, and every change it makes is one step you can undo.</p>
        <h2>In the editor</h2>
        <p>Type into the <b>Ask AI</b> bar at the bottom of the editor, or press <b>/</b> to jump to it.</p>
        <ul>
          <li><b>Edit this screen</b> changes what is open: “make the title bigger”, “switch to a dark theme”, “add a battery bar under the header”. Select a widget first and you can just say “make this red”.</li>
          <li><b>New screen</b> builds a whole screen from a description, sized for your board.</li>
          <li>To rebuild a sketch or a photo of another device, press the sparkle button at the top and choose <b>Sketch or photo</b>.</li>
        </ul>
        <p>AI in the editor uses your Epixo AI credits.</p>
        <h2>From Claude or ChatGPT</h2>
        <p>Already pay for Claude or ChatGPT? Connect it to Epixo and design from there, with no Epixo credits used. Your AI can create projects, build and change screens, line widgets up, apply themes, run Design Doctor and read the generated code.</p>
        <ol>
          <li>Open <a href="/connect">AI connections</a> and make a link for your app.</li>
          <li>Add it as a connector. In Claude: Settings, Connectors, Add custom connector. In ChatGPT: Settings, Apps &amp; Connectors, turn on Developer mode, then Create.</li>
          <li>Keep your project open in the editor. Changes from your AI appear within a few seconds, with a note saying who made them.</li>
        </ol>
        <p>Each link only lets that app work on your Epixo projects. Remove it on the same page and it stops working at once.</p>
        <h2>Fully local, with live previews</h2>
        <p>The Epixo source includes an MCP server that runs on your own computer. It keeps projects as files, works offline and lets your AI look at real LVGL renders of its own work. Open <code>localhost:7457</code> while it runs and the editor updates live as your AI designs, and your edits go straight back to it. See <code>apps/mcp/README.md</code> in the source for setup.</p>
        <h2>Tips for good results</h2>
        <ul>
          <li>Say what the screen is for and what matters most: “a garage door panel, the Open button should be huge”.</li>
          <li>Name real data: “temperature, humidity and a 24 hour chart”.</li>
          <li>Ask for one change at a time when you are fine-tuning.</li>
          <li>Finish with “check the design and fix problems”. AI runs Design Doctor for you.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "export",
    group: "Start here",
    title: "Exporting code",
    summary: "What each export contains and where to put it.",
    body: (
      <>
        <p>Export builds a zip with the parts you tick. Every part comes with a README that explains how to use it.</p>
        <h2>LVGL C</h2>
        <p><code>ui/ui.c</code>, <code>ui/ui.h</code> and a matching <code>lv_conf.h</code>. Choose LVGL 8.4, 9.2 to 9.4, or 9.6 in the code panel. Call <code>ui_init()</code> once your display and touch drivers are running.</p>
        <pre>{`#include "ui.h"

void setup() {
  // start your display and touch driver first
  ui_init();
}`}</pre>
        <h2>Board pack project</h2>
        <p>For boards with a pack, Epixo adds a ready PlatformIO project (and an Arduino sketch for ESP32_Display_Panel boards) with the display and touch already configured. See <a href="/docs/board-packs">Board packs</a>.</p>
        <h2>MicroPython</h2>
        <p><code>micropython/ui.py</code> for lv_micropython with LVGL 9. Copy it to the board and import it after your display is set up.</p>
        <h2>LVGL XML</h2>
        <p>One XML file per screen plus <code>epixo_xml_init.c</code>, which registers the fonts and loads the screens. Needs LVGL 9.4 or newer with the XML module on. See <a href="/docs/xml">LVGL XML</a>.</p>
        <h2>ESPHome</h2>
        <p><code>esphome/epixo_ui.yaml</code> holds an <code>lvgl:</code> block for Home Assistant devices. Charts are left out because ESPHome has no chart widget. See <a href="/docs/esphome">ESPHome</a>.</p>
        <h2>Screen images and project file</h2>
        <p>PNG images rendered by LVGL, ready for a README or a video, and <code>project.epixo.json</code>, which you can open in Epixo again later.</p>
      </>
    ),
  },
  {
    slug: "board-packs",
    group: "Hardware",
    title: "Board packs",
    summary: "Ready-to-build projects for boards with known drivers.",
    body: (
      <>
        <p>A board pack is a complete firmware project for one board. You open it, press Upload, and your screen appears.</p>
        <h2>Which boards have a pack</h2>
        <ul>
          <li>Boards supported by Espressif&apos;s ESP32_Display_Panel library, including many Waveshare, Espressif, M5Stack, Elecrow, Guition and Viewe boards. These packs use LVGL 8.4.</li>
          <li>Cheap Yellow Display and similar Sunton and Guition boards supported by esp32-smartdisplay. These packs use LVGL 9.</li>
        </ul>
        <p>The <a href="/boards">boards page</a> lists every board. Board pages say whether a pack is included.</p>
        <h2>Using a pack</h2>
        <ul>
          <li>Install VS Code and the PlatformIO extension.</li>
          <li>Open the <code>platformio/</code> folder from the export.</li>
          <li>For esp32-smartdisplay packs, clone the board definitions into <code>boards/</code> as the README there says.</li>
          <li>Connect the board over USB and press Upload.</li>
        </ul>
        <h2>Tested so far</h2>
        <p>Packs follow the official examples of each driver library. They have not yet been compiled and flashed on every physical board. If one does not build, tell us on the community page or GitHub with the board name and the error.</p>
      </>
    ),
  },
  {
    slug: "live-mirror",
    group: "Hardware",
    title: "Live Mirror",
    summary: "See every edit on your real board within a tenth of a second.",
    body: (
      <>
        <p>Live Mirror streams your design to a board over USB while you edit. You flash a small firmware once, then every change appears on the real screen.</p>
        <h2>Set it up</h2>
        <ul>
          <li>In Export, tick Live Mirror firmware.</li>
          <li>Open the <code>live-mirror/</code> folder in VS Code with PlatformIO and press Upload.</li>
          <li>Back in the editor, open the Device panel and press Connect. Pick your board&apos;s serial port.</li>
        </ul>
        <h2>Browser support</h2>
        <p>Live Mirror uses Web Serial, which works in Chrome and Edge on desktop. Safari and Firefox do not support it.</p>
        <h2>How it works</h2>
        <p>The editor sends a short text script, the same one that drives the canvas, and the firmware runs the same Epixo runtime C code to build the LVGL objects. See <a href="/docs/runtime">Runtime protocol</a>.</p>
      </>
    ),
  },
  {
    slug: "micropython",
    group: "Formats",
    title: "MicroPython",
    summary: "Use your design with lv_micropython.",
    body: (
      <>
        <p>The MicroPython export targets lv_micropython builds with LVGL 9. It was checked by running every test project on lv_micropython with LVGL 9.3 and comparing the pixels with the editor.</p>
        <pre>{`import ui   # builds every screen and loads the first one`}</pre>
        <h2>Known difference</h2>
        <p>The binding does not expose <code>lv_spinner</code>, so spinners are drawn as an arc. Everything else matched the editor exactly.</p>
      </>
    ),
  },
  {
    slug: "esphome",
    group: "Formats",
    title: "ESPHome",
    summary: "Put your screen on a Home Assistant device.",
    body: (
      <>
        <p>The ESPHome export is an <code>lvgl:</code> block with fonts, pages and widgets. Paste it into your device YAML under your display and touchscreen setup.</p>
        <pre>{`packages:
  ui: !include esphome/epixo_ui.yaml`}</pre>
        <p>Every test project passes <code>esphome config</code>. Charts are left out because ESPHome&apos;s LVGL component has no chart widget. Screen changes from button taps are included.</p>
      </>
    ),
  },
  {
    slug: "xml",
    group: "Formats",
    title: "LVGL XML",
    summary: "Load screens at run time with LVGL's XML module.",
    body: (
      <>
        <p>LVGL 9.4 added an XML module that builds screens from XML at run time. Epixo exports one file per screen and a small C loader that registers the fonts and screens.</p>
        <pre>{`// each XML file embedded as a C string, e.g. epixo_xml_home[]
lv_obj_t * first = epixo_xml_init();   // registers fonts and screens, loads the first`}</pre>
        <p>Turn on <code>LV_USE_XML</code> in <code>lv_conf.h</code>, and embed each XML file as a C string named <code>epixo_xml_</code> plus the screen name, or load them from a file system. Every test project loads and renders pixel-identical in LVGL 9.4.</p>
      </>
    ),
  },
  {
    slug: "runtime",
    group: "Under the hood",
    title: "Runtime protocol",
    summary: "The text script that drives the canvas and Live Mirror.",
    body: (
      <>
        <p>The editor canvas and Live Mirror firmware share one C file, <code>epixo_rt.c</code>. It reads a script with one command per line and fields separated by tabs.</p>
        <pre>{`X                              reset
S  <screen id>  <RRGGBB>       create or replace a screen
W  <type> <id> <x> <y> <w> <h> start a widget
P  <key>  <value>              set a property
E                              build the widget
L  <screen id> [anim]          load a screen
K  <screen id>                 delete a screen`}</pre>
        <p>The runtime compiles on LVGL 8.4 and 9.x, so the same script works in the browser and on the board.</p>
      </>
    ),
  },
  {
    slug: "verification",
    group: "Under the hood",
    title: "How exports are verified",
    summary: "What we test before every release, and what we have not tested yet.",
    body: (
      <>
        <p>The test suite builds 57 projects, 9 templates on 7 boards plus one project that uses every widget and option. Each one is exported in every format and checked with the real tool.</p>
        <ul>
          <li>C for LVGL 8.4, 9.2, 9.4 and 9.6: compiled with <code>gcc -Wall -Wextra -Werror</code>, rendered, compared byte for byte with the editor. 57 of 57 identical on each version.</li>
          <li>LVGL XML: loaded by LVGL 9.4&apos;s XML module, rendered and compared. 57 of 57 identical.</li>
          <li>ESPHome: <code>esphome config</code> with ESPHome 2026.9.1. 57 of 57 valid.</li>
          <li>MicroPython: run on lv_micropython with LVGL 9.3, rendered and compared. 57 of 57 run, 56 identical; the spinner is drawn as an arc.</li>
        </ul>
        <h2>Not yet tested</h2>
        <p>Board packs and Live Mirror firmware have not been compiled and flashed on every physical board. Try one board before you rely on them in a product.</p>
      </>
    ),
  },
  {
    slug: "faq",
    group: "Under the hood",
    title: "FAQ",
    summary: "Short answers to common questions.",
    body: (
      <>
        <h2>Is Epixo free?</h2>
        <p>Yes. The editor, every export and the community are free. A Pro plan with more AI credits and team features is planned; see <a href="/pricing">Pricing</a>.</p>
        <h2>Do I own what I make?</h2>
        <p>Yes. Your designs and exported code are yours. When you publish to the community, others can open and remix your project, and remixes link back to you.</p>
        <h2>Which browsers work?</h2>
        <p>The editor works in current Chrome, Edge, Safari and Firefox. Live Mirror needs Chrome or Edge on desktop.</p>
        <h2>My board is not listed</h2>
        <p>Pick Custom size and enter the resolution. The C, MicroPython, XML and ESPHome exports work on any LVGL board. Tell us which board you use and we will add it.</p>
        <h2>Can I use the exported code in a commercial product?</h2>
        <p>Yes. The generated code is yours. LVGL is MIT-licensed. Board packs include their driver library&apos;s licence file.</p>
      </>
    ),
  },
];

export const findDoc = (slug: string) => DOCS.find(d => d.slug === slug) ?? null;
export const DOC_GROUPS = Array.from(new Set(DOCS.map(d => d.group)));
