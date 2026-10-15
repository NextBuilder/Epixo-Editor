#!/usr/bin/env bash
# Pixel-compares every export against the editor's own engine on real LVGL builds.
# Usage: tests/verify.sh [version ...]   versions: v8.4.0 v9.2.2 v9.4.0 v9.6.0 (default: v9.2.2)
set -euo pipefail
cd "$(dirname "$0")"
../scripts/fetch-lvgl.sh "${@:-v9.2.2}"
node make_cases.js

status=0
for V in "${@:-v9.2.2}"; do
  case "$V" in
    v8.4.0) CONF=conf84; SUF=84; RTC=rt_render_v8.c; UIH=ui_render_v8.c; UIC=ui_v8.c ;;
    v9.2.2) CONF=conf92; SUF="";  RTC=rt_render.c;    UIH=ui_render.c;    UIC=ui.c ;;
    v9.4.0) CONF=conf94; SUF=94; RTC=rt_render.c;    UIH=ui_render.c;    UIC=ui.c ;;
    v9.6.0) CONF=conf96; SUF=96; RTC=rt_render.c;    UIH=ui_render.c;    UIC=ui_v96.c ;;
    *) echo "unsupported version $V"; exit 2 ;;
  esac
  LV=../vendor/lvgl-$V
  [ -f "native/lib-$V/liblvgl.a" ] || (cd native && ./buildlv.sh "$V" "$CONF")
  gcc -O1 -w -DLV_CONF_INCLUDE_SIMPLE -DLV_LVGL_H_INCLUDE_SIMPLE -Inative/$CONF -I$LV -I../runtime \
    native/$RTC ../runtime/epixo_rt.c native/lib-$V/liblvgl.a -lm -o native/rt_render$SUF
  out=$(V=$V CONF=native/$CONF RT=native/rt_render$SUF UIH=$UIH UIC=$UIC ./compare.sh)
  echo "$out" | tail -20
  echo "$out" | tail -1 | grep -q ", 0 failed" || status=1
done
exit $status
