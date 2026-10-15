#!/bin/bash
pass=0; fail=0; partial=0
for d in cases/*/; do
  n=$(basename $d); read W H IDS < $d/meta.txt
  mkdir -p $d/out_xml $d/out_v9.4.0
  args=""; i=0; for id in ${IDS//,/ }; do args="$args $id $d/out_v9.4.0/rt_$i.raw"; i=$((i+1)); done
  native/rt_render94 $W $H $d/script.txt $args
  timeout 60 native/xml_render $W $H $d/xml > $d/xml.log 2>&1 || { echo "XML RUN FAIL $n: $(head -2 $d/xml.log)"; fail=$((fail+1)); continue; }
  ok=1
  for j in $(seq 0 $((i-1))); do
    scr=$(sed -n "$((j+1))p" $d/xml/index.txt)
    if cmp -s $d/out_v9.4.0/rt_$j.raw $d/out_xml/$j.raw; then :; else
      if [ -s $d/xml/skipped.txt ]; then partial=1; else ok=0; echo "XML PIXEL DIFF $n screen $j ($scr)"; fi
    fi
  done
  if [ $ok = 1 ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
done
echo "xml v9.4: $pass passed, $fail failed"
