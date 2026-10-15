#!/usr/bin/env bash
# Downloads the LVGL versions used by the engine build and the verification suite into vendor/.
# Usage: scripts/fetch-lvgl.sh [version ...]   (default: v9.2.2)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p vendor
for v in "${@:-v9.2.2}"; do
  if [ -d "vendor/lvgl-$v" ]; then echo "vendor/lvgl-$v already present"; continue; fi
  git clone --quiet --depth 1 --branch "$v" https://github.com/lvgl/lvgl.git "vendor/lvgl-$v"
  echo "fetched LVGL $v"
done
