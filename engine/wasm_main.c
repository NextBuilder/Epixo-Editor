#include "lvgl.h"
#include "epixo_rt.h"
#include <stdlib.h>

#define EXPORT(name) __attribute__((export_name(#name)))

static lv_display_t * disp;
static lv_indev_t * indev;
static uint8_t * fb;
static int fb_w, fb_h;
static volatile int dirty;
static int ptr_x, ptr_y, ptr_down;
static int started;

static void flush_cb(lv_display_t * d, const lv_area_t * area, uint8_t * px)
{
    (void)area;
    (void)px;
    dirty = 1;
    lv_display_flush_ready(d);
}

static void read_cb(lv_indev_t * i, lv_indev_data_t * data)
{
    (void)i;
    data->point.x = ptr_x;
    data->point.y = ptr_y;
    data->state = ptr_down ? LV_INDEV_STATE_PRESSED : LV_INDEV_STATE_RELEASED;
}

EXPORT(ep_init) int ep_init(int w, int h)
{
    if(started) {
        epixo_rt_reset();
        lv_deinit();
        free(fb);
        fb = NULL;
    }
    lv_init();
    fb_w = w;
    fb_h = h;
    size_t sz = (size_t)w * (size_t)h * 2;
    fb = (uint8_t *)malloc(sz);
    if(!fb) return 0;
    disp = lv_display_create(w, h);
    lv_display_set_color_format(disp, LV_COLOR_FORMAT_RGB565);
    lv_display_set_buffers(disp, fb, NULL, (uint32_t)sz, LV_DISPLAY_RENDER_MODE_DIRECT);
    lv_display_set_flush_cb(disp, flush_cb);
    indev = lv_indev_create();
    lv_indev_set_type(indev, LV_INDEV_TYPE_POINTER);
    lv_indev_set_read_cb(indev, read_cb);
    epixo_rt_init();
    started = 1;
    dirty = 1;
    return 1;
}

EXPORT(ep_fb) uint8_t * ep_fb(void) { return fb; }

EXPORT(ep_alloc) char * ep_alloc(int n) { return (char *)malloc((size_t)n); }

EXPORT(ep_free) void ep_free(char * p) { free(p); }

EXPORT(ep_exec) void ep_exec(const char * s) { epixo_rt_exec(s); }

EXPORT(ep_pointer) void ep_pointer(int x, int y, int down)
{
    ptr_x = x;
    ptr_y = y;
    ptr_down = down;
}

EXPORT(ep_tick) int ep_tick(int ms)
{
    lv_tick_inc((uint32_t)ms);
    lv_timer_handler();
    int d = dirty;
    dirty = 0;
    return d;
}

EXPORT(ep_refresh) void ep_refresh(void)
{
    lv_obj_invalidate(lv_screen_active());
    lv_refr_now(disp);
    dirty = 1;
}

EXPORT(ep_active) int ep_active(void)
{
    lv_obj_t * a = lv_screen_active();
    for(int i = 0; i < 4096; i++) {
        lv_obj_t * s = epixo_rt_screen(i);
        if(s && s == a) return i;
    }
    return -1;
}

EXPORT(ep_value) int ep_value(int id) { return epixo_rt_widget_value(id); }

EXPORT(ep_text_width) int ep_text_width(int font, const char * s)
{
    const lv_font_t * f = &lv_font_montserrat_16;
    switch(font) {
        case 12: f = &lv_font_montserrat_12; break;
        case 14: f = &lv_font_montserrat_14; break;
        case 16: f = &lv_font_montserrat_16; break;
        case 18: f = &lv_font_montserrat_18; break;
        case 20: f = &lv_font_montserrat_20; break;
        case 22: f = &lv_font_montserrat_22; break;
        case 24: f = &lv_font_montserrat_24; break;
        case 26: f = &lv_font_montserrat_26; break;
        case 28: f = &lv_font_montserrat_28; break;
        case 30: f = &lv_font_montserrat_30; break;
        case 32: f = &lv_font_montserrat_32; break;
        case 34: f = &lv_font_montserrat_34; break;
        case 36: f = &lv_font_montserrat_36; break;
        case 38: f = &lv_font_montserrat_38; break;
        case 40: f = &lv_font_montserrat_40; break;
        case 42: f = &lv_font_montserrat_42; break;
        case 44: f = &lv_font_montserrat_44; break;
        case 46: f = &lv_font_montserrat_46; break;
        case 48: f = &lv_font_montserrat_48; break;
    }
    lv_point_t p;
    lv_text_get_size(&p, s, f, 0, 0, LV_COORD_MAX, LV_TEXT_FLAG_NONE);
    return p.x;
}
