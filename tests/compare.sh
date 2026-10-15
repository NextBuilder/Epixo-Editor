#!/bin/bash
V=${V:-v9.2.2}; CONF=${CONF:-native/conf92}; RT=${RT:-native/rt_render}
LV=../vendor/lvgl-$V
pass=0; fail=0; failed=""
for d in cases/*/; do
  n=$(basename $d); read W H IDS < $d/meta.txt
  mkdir -p $d/out_$V
  args=""; i=0; for id in ${IDS//,/ }; do args="$args $id $d/out_$V/rt_$i.raw"; i=$((i+1)); done
  $RT $W $H $d/script.txt $args || { echo "RT CRASH $n"; fail=$((fail+1)); continue; }
  gcc -O1 -Wall -Wextra -Werror -Wno-unused-parameter -DLV_CONF_INCLUDE_SIMPLE -DLV_LVGL_H_INCLUDE_SIMPLE -I$CONF -I$LV -I$d native/${UIH:-ui_render.c} $d/${UIC:-ui.c} native/lib-$V/liblvgl.a -lm -o $d/ui_render_$V 2> $d/cc_$V.log || { echo "COMPILE FAIL $n"; head -5 $d/cc_$V.log; fail=$((fail+1)); continue; }
  $d/ui_render_$V $W $H $d/out_$V || { echo "UI CRASH $n"; fail=$((fail+1)); continue; }
  ok=1; for j in $(seq 0 $((i-1))); do cmp -s $d/out_$V/rt_$j.raw $d/out_$V/$j.raw || { ok=0; echo "PIXEL DIFF $n screen $j"; }; done
  if [ $ok = 1 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
done
echo "$V: $pass passed, $fail failed"
