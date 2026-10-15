#!/bin/bash
M=../vendor/lv_micropython/ports/unix/build-standard/micropython
pass=0; fail=0
for d in cases/*/; do
  n=$(basename $d); read W H IDS < $d/meta.txt
  mkdir -p $d/out_py $d/out_v9.3.0
  args=""; i=0; for id in ${IDS//,/ }; do args="$args $id $d/out_v9.3.0/rt_$i.raw"; i=$((i+1)); done
  native/rt_render93 $W $H $d/script.txt $args
  timeout 120 $M native/py_render.py $W $H $d > $d/py.log 2>&1 || { echo "PY FAIL $n: $(tail -1 $d/py.log)"; fail=$((fail+1)); continue; }
  ok=1; for j in $(seq 0 $((i-1))); do cmp -s $d/out_v9.3.0/rt_$j.raw $d/out_py/$j.raw || { ok=0; echo "PY PIXEL DIFF $n screen $j"; }; done
  if [ $ok = 1 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
done
echo "micropython: $pass passed, $fail failed"
