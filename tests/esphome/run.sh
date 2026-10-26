#!/bin/bash
pass=0; fail=0
for d in cases/*/; do
  n=$(basename $d); read W H IDS < $d/meta.txt
  f=esphome/$n.yaml
  cat > $f <<YAML
esphome:
  name: epixo-test
esp32:
  board: esp32-s3-devkitc-1
  framework:
    type: esp-idf
psram:
  mode: octal
spi:
  clk_pin: 12
  mosi_pin: 11
display:
  - platform: ili9xxx
    model: ILI9341
    id: lcd
    cs_pin: 10
    dc_pin: 9
    dimensions:
      width: $W
      height: $H
    invert_colors: false
    auto_clear_enabled: false
    update_interval: never
YAML
  [ -d $d/epixo_images ] && cp -r $d/epixo_images esphome/
  sed 's/^lvgl:$/lvgl:\n  displays: lcd/' $d/epixo.yaml >> $f
  if ${ESPHOME:-esphome} config $f > esphome/$n.log 2>&1; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL $n"; fi
done
echo "esphome: $pass passed, $fail failed"
