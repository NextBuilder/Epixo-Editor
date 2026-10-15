#!/bin/bash
set -e
LV=${LV:-../vendor/lvgl-v9.2.2}
OUT=${OUT:-build}
ZIG="python3 -m ziglang cc"
mkdir -p $OUT/obj
CF="-target wasm32-wasi -Os -DLV_CONF_INCLUDE_SIMPLE -DLV_LVGL_H_INCLUDE_SIMPLE -I. -I$LV -I../runtime -ffunction-sections -fdata-sections -w"
SRCS="$(find $LV/src -name '*.c') ../runtime/epixo_rt.c wasm_main.c"
echo "$SRCS" | tr ' ' '\n' | grep . | xargs -P 16 -I{} sh -c 'o='$OUT'/obj/$(echo {} | md5sum | cut -c1-12).o; '"$ZIG"' '"$CF"' -c {} -o $o'
$ZIG -target wasm32-wasi -Os -mexec-model=reactor -Wl,--gc-sections -Wl,--strip-all -o $OUT/epixo-lvgl.wasm $OUT/obj/*.o
ls -la $OUT/epixo-lvgl.wasm
