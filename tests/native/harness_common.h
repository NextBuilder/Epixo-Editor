#include "lvgl.h"
#include <stdio.h>
#include <stdlib.h>
static uint8_t * fb;
static int W, H;
static void flush_cb(lv_display_t * d, const lv_area_t * a, uint8_t * p) { (void)a; (void)p; lv_display_flush_ready(d); }
static lv_display_t * mkdisp(int w, int h)
{
    W = w; H = h;
    fb = malloc((size_t)w * h * 2);
    lv_display_t * d = lv_display_create(w, h);
    lv_display_set_color_format(d, LV_COLOR_FORMAT_RGB565);
    lv_display_set_buffers(d, fb, NULL, (uint32_t)(w * h * 2), LV_DISPLAY_RENDER_MODE_DIRECT);
    lv_display_set_flush_cb(d, flush_cb);
    return d;
}
static void dump(lv_display_t * d, const char * path)
{
    for(int k = 0; k < 60; k++) { lv_tick_inc(20); lv_timer_handler(); }
    lv_obj_invalidate(lv_screen_active());
    lv_refr_now(d);
    FILE * f = fopen(path, "wb");
    fwrite(fb, 1, (size_t)W * H * 2, f);
    fclose(f);
}
