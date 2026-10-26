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

Widget types are `label`, `button`, `panel`, `icon`, `image`, `switch`, `slider`, `checkbox`, `dropdown`, `roller`, `textarea`, `keyboard`, `arc`, `bar`, `chart`, `spinner` and `led`. Properties a widget does not use are ignored.

| Property | Value |
|---|---|
| `text`, `options`, `data`, `icon` | Text, with `\n` for a new line |
| `fg`, `bg`, `accent`, `borderColor` | Colour as `RRGGBB` |
| `font`, `align`, `pad`, `padb`, `radius`, `thick`, `border`, `value`, `min`, `max`, `opacity` | Whole numbers |
| `checked`, `showValue`, `shadow`, `hidden`, `oneLine`, `password` | `0` or `1` |
| `tapTo`, `tapAnim` | Screen to open when tapped, and the animation |
| `img` | Picture size and format: `<width>,<height>,<1 if it has an alpha plane>` |
| `imgd` | The next piece of the picture in base64: LVGL's RGB565 plane, then the alpha plane. Repeat until it is all sent. |

A keyboard types into the first text field on its screen, and into any other text field that gets focus.

Licence: [LICENSE](LICENSE). You may ship these files inside firmware that shows screens designed with Epixo.
