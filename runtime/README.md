# Epixo runtime

`epixo_rt.c` builds LVGL screens from a short text script. It compiles on LVGL 8.4 and 9.x, and it is what the Epixo canvas, Live Mirror firmware and exported projects use to draw your design.

```c
#include "epixo_rt.h"

epixo_rt_init();
epixo_rt_exec(script);              // run a whole script

char cmd[] = "L\t2\tfade";          // or one command at a time
epixo_rt_line(cmd);                 // the buffer may be modified
```

## Script format

One command per line, with fields separated by tabs.

| Command | Meaning |
|---|---|
| `X` | Reset everything |
| `S <screen> <RRGGBB>` | Create or replace a screen |
| `W <type> <id> <x> <y> <w> <h>` | Start a widget |
| `P <key> <value>` | Set a property of that widget |
| `E` | Build the widget |
| `L <screen> [animation]` | Load a screen |
| `K <screen>` | Delete a screen |

Licence: [LICENSE](LICENSE). You may ship these files inside firmware that shows screens designed with Epixo.
