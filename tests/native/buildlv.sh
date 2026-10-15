#!/bin/bash
set -e
V=$1; CONF=$2; OUT=lib-$V
LV=../../vendor/lvgl-$V
mkdir -p $OUT/obj
find $LV/src -name '*.c' | xargs -P 16 -I{} sh -c 'o='$OUT'/obj/$(echo {} | md5sum | cut -c1-12).o; gcc -O1 -w -DLV_CONF_INCLUDE_SIMPLE -DLV_LVGL_H_INCLUDE_SIMPLE -I'$CONF' -I'$LV' -c {} -o $o'
ar rcs $OUT/liblvgl.a $OUT/obj/*.o
echo built $OUT
