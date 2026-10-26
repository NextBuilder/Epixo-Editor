# Epixo MCP server

Let Claude, ChatGPT and other AI apps design LVGL screens in Epixo, and watch every change appear in the editor as it happens.

It works like the AI connectors for desktop design tools. Your AI app talks to this server, the server edits a real Epixo project, and the editor it serves at `http://localhost:7457` updates live. Change something by hand and your AI sees it too.

- Runs on your computer, works offline and needs nothing but Node.js 20 or later. No packages to install.
- Saves projects as files in `~/Epixo`, so they are easy to back up or put in git.
- Draws real LVGL renders, so your AI can look at its own work, using the same engine as the editor.
- Exports LVGL C, MicroPython, LVGL XML, ESPHome YAML and PNG screens straight into a folder.

Prefer not to run anything? Connect Claude or ChatGPT to your Epixo account on the website instead, at [epixo.app/connect](https://epixo.app/connect).

## Set it up

You need a copy of this repository. Use the full path to `apps/mcp/server.mjs` in the steps below.

### Claude Desktop

Open Settings, then Developer, then Edit Config, and add:

```json
{
  "mcpServers": {
    "epixo": {
      "command": "node",
      "args": ["/path/to/Epixo-Editor/apps/mcp/server.mjs"]
    }
  }
}
```

Restart Claude Desktop, then ask: “Use Epixo to design a thermostat for my round display, and open the editor so I can watch.”

### Claude Code

```sh
claude mcp add epixo -- node /path/to/Epixo-Editor/apps/mcp/server.mjs
```

### Cursor, VS Code and other MCP apps

Add a stdio server with the command `node` and the argument `/path/to/Epixo-Editor/apps/mcp/server.mjs`. The setting is usually called `mcpServers` or `servers`.

### ChatGPT

ChatGPT connects to servers on the internet, not on your computer. Use the [Epixo website connection](https://epixo.app/connect) for ChatGPT.

## Watch it live

Open `http://localhost:7457` while your AI app is running, or ask your AI to “show it in the editor”. A green **Live with AI** badge means you are linked.

- Changes from your AI land as single undo steps, with a note saying who made them.
- Your own edits save straight back, so the AI always works on what you see.
- `get_selection` tells the AI which screen and widget you have selected, so “make this bigger” just works.

## Settings

| Variable | Default | What it does |
|---|---|---|
| `EPIXO_DIR` | `~/Epixo` | Where projects and exports are saved |
| `EPIXO_PORT` | `7457` | Port for the live editor |

Add `--no-editor` to the arguments to run without the live editor.

## Tools

| Tool | What it does |
|---|---|
| `get_project` | Board, screens, templates, themes and design rules. The AI calls this first. |
| `get_screen` | Every widget on a screen, a text map of the layout and Design Doctor notes |
| `design_screen` | Builds a whole screen in one call |
| `add_widgets`, `update_widgets`, `delete_widgets` | Precise edits, including links between screens |
| `arrange_widgets` | Align, centre, distribute and reorder |
| `manage_screen` | Add, rename, duplicate, delete, open and recolour screens |
| `add_template`, `apply_theme` | Start from a template or restyle in one step |
| `find_boards`, `set_board` | Search 113 displays and adapt the design to a new one |
| `check_design`, `fix_design` | Run Design Doctor and apply its fixes |
| `get_code` | Generated C, header, MicroPython, XML or ESPHome |
| `render_screen` | A PNG drawn by LVGL, for the AI to look at |
| `list_projects`, `open_project`, `new_project` | Work with saved projects |
| `export_project` | Write code and images to a folder |
| `show_in_editor`, `get_selection` | Open the live editor and read what you have selected |

The tools come from `apps/editor/core.js`, the same code the editor and the website's AI connection use. Their tests are in `tests/unit/ai.test.mjs` and `tests/unit/mcp.test.mjs`.

## Security

The live editor only listens on `127.0.0.1`. It refuses requests whose `Host` is not localhost, which blocks DNS rebinding, and refuses changes sent from any other website. It serves only the editor's own files.
