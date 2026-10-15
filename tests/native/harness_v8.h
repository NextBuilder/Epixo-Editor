#include "lvgl.h"
#include <stdio.h>
#include <stdlib.h>
static lv_color_t * fb;
static int W, H;
static lv_disp_draw_buf_t dbuf;
static lv_disp_drv_t drv;
static void flush_cb(lv_disp_drv_t * d, const lv_area_t * a, lv_color_t * p)
{
    for(int y = a->y1; y <= a->y2; y++) for(int x = a->x1; x <= a->x2; x++) fb[y * W + x] = *p++;
    lv_disp_flush_ready(d);
}
static lv_disp_t * mkdisp(int w, int h)
{
    W = w; H = h;
    fb = calloc((size_t)w * h, sizeof(lv_color_t));
    lv_color_t * b = malloc((size_t)w * h * sizeof(lv_color_t));
    lv_disp_draw_buf_init(&dbuf, b, NULL, (uint32_t)(w * h));
    lv_disp_drv_init(&drv);
    drv.hor_res = w; drv.ver_res = h; drv.flush_cb = flush_cb; drv.draw_buf = &dbuf; drv.full_refresh = 1;
    return lv_disp_drv_register(&drv);
}
static void dump(lv_disp_t * d, const char * path)
{
    for(int k = 0; k < 60; k++) { lv_tick_inc(20); lv_timer_handler(); }
    lv_obj_invalidate(lv_scr_act());
    lv_refr_now(d);
    FILE * f = fopen(path, "wb");
    fwrite(fb, sizeof(lv_color_t), (size_t)W * H, f);
    fclose(f);
}
