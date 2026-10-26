#include "epixo_rt.h"
#include <string.h>
#include <stdint.h>

#if LVGL_VERSION_MAJOR < 9
#define lv_button_create lv_btn_create
#define lv_obj_remove_flag lv_obj_clear_flag
#define lv_screen_load_anim lv_scr_load_anim
#define lv_screen_load lv_scr_load
#define lv_screen_active lv_scr_act
#define lv_obj_delete lv_obj_del
#define lv_obj_set_style_shadow_offset_y lv_obj_set_style_shadow_ofs_y
typedef lv_scr_load_anim_t lv_screen_load_anim_t;
#define lv_image_create lv_img_create
#define lv_image_set_src lv_img_set_src
#define lv_image_cache_drop lv_img_cache_invalidate_src
#define lv_obj_get_child_count lv_obj_get_child_cnt
#define lv_malloc lv_mem_alloc
#define lv_free lv_mem_free
typedef lv_img_dsc_t lv_image_dsc_t;
#endif

#define EP_MAX_SCREENS 64
#define EP_MAX_WIDGETS 1024
#define EP_MAX_IMAGES 64

typedef struct {
    int id;
    lv_obj_t * obj;
} ep_screen_t;

typedef struct {
    int id;
    lv_obj_t * obj;
} ep_widget_ref_t;

typedef struct {
    char type[16];
    int id, x, y, w, h;
    char text[256];
    char options[512];
    char data[512];
    char icon[24];
    uint32_t fg, bg, accent, border_color;
    int has_fg, has_bg, has_accent, has_border_color;
    int font, align, pad, pad_bottom, radius, thick, border, value, min, max;
    int checked, show_value, shadow, opacity, hidden, tap_to, tap_anim, one_line, password;
    uint8_t * img;
    uint32_t img_len, img_cap;
    int img_w, img_h, img_alpha;
} ep_props_t;

/* Pictures stay in fixed slots, because image widgets point at the descriptor inside them. */
typedef struct {
    int id;
    lv_obj_t * screen;
    uint8_t * data;
    lv_image_dsc_t dsc;
} ep_image_t;

static ep_screen_t screens[EP_MAX_SCREENS];
static int screen_count;
static ep_widget_ref_t widgets[EP_MAX_WIDGETS];
static int widget_count;
static lv_obj_t * cur_screen;
static ep_props_t P;
static int in_widget;
static ep_image_t images[EP_MAX_IMAGES];
static int images_ready;

static const lv_font_t * ep_font(int s)
{
    switch(s) {
        case 12: return &lv_font_montserrat_12;
        case 14: return &lv_font_montserrat_14;
        case 16: return &lv_font_montserrat_16;
        case 18: return &lv_font_montserrat_18;
        case 20: return &lv_font_montserrat_20;
        case 22: return &lv_font_montserrat_22;
        case 24: return &lv_font_montserrat_24;
        case 26: return &lv_font_montserrat_26;
        case 28: return &lv_font_montserrat_28;
        case 30: return &lv_font_montserrat_30;
        case 32: return &lv_font_montserrat_32;
        case 34: return &lv_font_montserrat_34;
        case 36: return &lv_font_montserrat_36;
        case 38: return &lv_font_montserrat_38;
        case 40: return &lv_font_montserrat_40;
        case 42: return &lv_font_montserrat_42;
        case 44: return &lv_font_montserrat_44;
        case 46: return &lv_font_montserrat_46;
        case 48: return &lv_font_montserrat_48;
        default: return &lv_font_montserrat_16;
    }
}

static const struct { const char * name; const char * sym; } symbols[] = {
    {"home", LV_SYMBOL_HOME}, {"wifi", LV_SYMBOL_WIFI}, {"bluetooth", LV_SYMBOL_BLUETOOTH},
    {"bell", LV_SYMBOL_BELL}, {"settings", LV_SYMBOL_SETTINGS}, {"power", LV_SYMBOL_POWER},
    {"charge", LV_SYMBOL_CHARGE}, {"play", LV_SYMBOL_PLAY}, {"pause", LV_SYMBOL_PAUSE},
    {"prev", LV_SYMBOL_PREV}, {"next", LV_SYMBOL_NEXT}, {"volume", LV_SYMBOL_VOLUME_MAX},
    {"refresh", LV_SYMBOL_REFRESH}, {"ok", LV_SYMBOL_OK}, {"plus", LV_SYMBOL_PLUS},
    {"minus", LV_SYMBOL_MINUS}, {"left", LV_SYMBOL_LEFT}, {"right", LV_SYMBOL_RIGHT},
    {"up", LV_SYMBOL_UP}, {"down", LV_SYMBOL_DOWN}, {"battery", LV_SYMBOL_BATTERY_FULL},
    {"eye", LV_SYMBOL_EYE_OPEN}, {"image", LV_SYMBOL_IMAGE}, {"gps", LV_SYMBOL_GPS},
    {"close", LV_SYMBOL_CLOSE}, {"trash", LV_SYMBOL_TRASH}, {"edit", LV_SYMBOL_EDIT},
    {"save", LV_SYMBOL_SAVE}, {"upload", LV_SYMBOL_UPLOAD}, {"download", LV_SYMBOL_DOWNLOAD},
    {"warning", LV_SYMBOL_WARNING}, {"call", LV_SYMBOL_CALL}, {"envelope", LV_SYMBOL_ENVELOPE},
    {"list", LV_SYMBOL_LIST}, {"usb", LV_SYMBOL_USB}, {"sd", LV_SYMBOL_SD_CARD},
    {"mute", LV_SYMBOL_MUTE}, {"shuffle", LV_SYMBOL_SHUFFLE}, {"loop", LV_SYMBOL_LOOP},
    {"stop", LV_SYMBOL_STOP}, {"keyboard", LV_SYMBOL_KEYBOARD}, {"file", LV_SYMBOL_FILE},
    {"directory", LV_SYMBOL_DIRECTORY}, {"cut", LV_SYMBOL_CUT}, {"copy", LV_SYMBOL_COPY},
    {"audio", LV_SYMBOL_AUDIO}, {"video", LV_SYMBOL_VIDEO}, {"drive", LV_SYMBOL_DRIVE},
    {"battery_half", LV_SYMBOL_BATTERY_2}, {"battery_empty", LV_SYMBOL_BATTERY_EMPTY},
    {"eject", LV_SYMBOL_EJECT}, {"eye_close", LV_SYMBOL_EYE_CLOSE}, {"backspace", LV_SYMBOL_BACKSPACE},
    {"new_line", LV_SYMBOL_NEW_LINE}, {"paste", LV_SYMBOL_PASTE}, {"tint", LV_SYMBOL_TINT},
    {"bullet", LV_SYMBOL_BULLET}, {"dummy", LV_SYMBOL_DUMMY},
};

static const char * ep_symbol(const char * name)
{
    for(size_t i = 0; i < sizeof(symbols) / sizeof(symbols[0]); i++) {
        if(strcmp(symbols[i].name, name) == 0) return symbols[i].sym;
    }
    return LV_SYMBOL_HOME;
}

static const lv_screen_load_anim_t anims[] = {
    LV_SCR_LOAD_ANIM_MOVE_LEFT, LV_SCR_LOAD_ANIM_MOVE_RIGHT, LV_SCR_LOAD_ANIM_FADE_IN,
    LV_SCR_LOAD_ANIM_OVER_LEFT, LV_SCR_LOAD_ANIM_OVER_RIGHT, LV_SCR_LOAD_ANIM_MOVE_TOP,
    LV_SCR_LOAD_ANIM_MOVE_BOTTOM, LV_SCR_LOAD_ANIM_NONE,
};

static int ep_atoi(const char * s)
{
    int sign = 1, v = 0;
    while(*s == ' ') s++;
    if(*s == '-') { sign = -1; s++; }
    while(*s >= '0' && *s <= '9') { v = v * 10 + (*s - '0'); s++; }
    return v * sign;
}

static uint32_t ep_hex(const char * s)
{
    uint32_t v = 0;
    if(*s == '#') s++;
    if(s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) s += 2;
    for(int i = 0; i < 6 && *s; i++, s++) {
        char c = *s;
        v <<= 4;
        if(c >= '0' && c <= '9') v |= (uint32_t)(c - '0');
        else if(c >= 'a' && c <= 'f') v |= (uint32_t)(c - 'a' + 10);
        else if(c >= 'A' && c <= 'F') v |= (uint32_t)(c - 'A' + 10);
    }
    return v;
}

static void ep_unescape(char * dst, const char * src, size_t cap)
{
    size_t n = 0;
    while(*src && n + 1 < cap) {
        if(*src == '\\' && src[1]) {
            src++;
            if(*src == 'n') dst[n++] = '\n';
            else if(*src == 't') dst[n++] = '\t';
            else dst[n++] = *src;
            src++;
        }
        else dst[n++] = *src++;
    }
    dst[n] = 0;
}

static ep_screen_t * ep_find_screen(int id)
{
    for(int i = 0; i < screen_count; i++) if(screens[i].id == id) return &screens[i];
    return NULL;
}

lv_obj_t * epixo_rt_screen(int id)
{
    ep_screen_t * s = ep_find_screen(id);
    return s ? s->obj : NULL;
}

static void ep_forget_widgets_of(lv_obj_t * scr)
{
    int j = 0;
    for(int i = 0; i < widget_count; i++) {
        if(lv_obj_get_screen(widgets[i].obj) != scr) widgets[j++] = widgets[i];
    }
    widget_count = j;
}

int epixo_rt_widget_value(int id)
{
    for(int i = 0; i < widget_count; i++) {
        if(widgets[i].id != id) continue;
        lv_obj_t * o = widgets[i].obj;
        if(lv_obj_check_type(o, &lv_slider_class)) return lv_slider_get_value(o);
        if(lv_obj_check_type(o, &lv_arc_class)) return lv_arc_get_value(o);
        if(lv_obj_check_type(o, &lv_bar_class)) return lv_bar_get_value(o);
        if(lv_obj_check_type(o, &lv_dropdown_class)) return (int)lv_dropdown_get_selected(o);
        if(lv_obj_check_type(o, &lv_roller_class)) return (int)lv_roller_get_selected(o);
        return lv_obj_has_state(o, LV_STATE_CHECKED) ? 1 : 0;
    }
    return -1;
}

static void ep_tap_cb(lv_event_t * e)
{
    intptr_t d = (intptr_t)lv_event_get_user_data(e);
    int target = (int)(d >> 4);
    int anim = (int)(d & 15);
    lv_obj_t * s = epixo_rt_screen(target);
    if(s && s != lv_screen_active()) {
        lv_screen_load_anim(s, anims[anim < 8 ? anim : 0], 300, 0, false);
    }
}

static void ep_arc_value_cb(lv_event_t * e)
{
    lv_obj_t * arc = (lv_obj_t *)lv_event_get_target(e);
    lv_obj_t * label = (lv_obj_t *)lv_event_get_user_data(e);
    lv_label_set_text_fmt(label, "%d", (int)lv_arc_get_value(arc));
}

static int ep_b64(char c)
{
    if(c >= 'A' && c <= 'Z') return c - 'A';
    if(c >= 'a' && c <= 'z') return c - 'a' + 26;
    if(c >= '0' && c <= '9') return c - '0' + 52;
    if(c == '+') return 62;
    if(c == '/') return 63;
    return -1;
}

static void ep_img_append(const char * s)
{
    uint32_t acc = 0;
    int bits = 0;
    for(; *s; s++) {
        int v = ep_b64(*s);
        if(v < 0) continue;
        acc = (acc << 6) | (uint32_t)v;
        bits += 6;
        if(bits >= 8) {
            bits -= 8;
            if(P.img && P.img_len < P.img_cap) P.img[P.img_len++] = (uint8_t)(acc >> bits);
        }
    }
}

static void ep_image_drop(ep_image_t * im)
{
    if(im->data) {
        lv_image_cache_drop(&im->dsc);
        lv_free(im->data);
    }
    im->data = NULL;
    im->id = -1;
    im->screen = NULL;
}

static void ep_images_init(void)
{
    if(images_ready) return;
    for(int i = 0; i < EP_MAX_IMAGES; i++) images[i].id = -1;
    images_ready = 1;
}

static void ep_free_images(lv_obj_t * scr)
{
    ep_images_init();
    for(int i = 0; i < EP_MAX_IMAGES; i++) {
        if(images[i].id >= 0 && (!scr || images[i].screen == scr)) ep_image_drop(&images[i]);
    }
}

/* Moves the decoded picture in P into a slot, in the layout this LVGL build draws directly. */
static ep_image_t * ep_image_take(int id, lv_obj_t * scr)
{
    ep_images_init();
    ep_image_t * im = NULL;
    for(int i = 0; i < EP_MAX_IMAGES && !im; i++) if(images[i].id == id) im = &images[i];
    for(int i = 0; i < EP_MAX_IMAGES && !im; i++) if(images[i].id < 0) im = &images[i];
    if(!im) return NULL;
    ep_image_drop(im);
    memset(&im->dsc, 0, sizeof(im->dsc));
#if LVGL_VERSION_MAJOR >= 9
    im->data = P.img;
    im->dsc.header.magic = LV_IMAGE_HEADER_MAGIC;
    im->dsc.header.cf = P.img_alpha ? LV_COLOR_FORMAT_RGB565A8 : LV_COLOR_FORMAT_RGB565;
    im->dsc.header.w = P.img_w;
    im->dsc.header.h = P.img_h;
    im->dsc.header.stride = P.img_w * 2;
    im->dsc.data_size = P.img_len;
#else
    int n = P.img_w * P.img_h;
    int per = LV_COLOR_DEPTH == 32 ? 4 : (P.img_alpha ? 3 : 2);
    uint8_t * d = lv_malloc((size_t)n * per);
    if(!d) return NULL;
    for(int i = 0; i < n; i++) {
        uint8_t lo = P.img[i * 2], hi = P.img[i * 2 + 1], a = P.img_alpha ? P.img[n * 2 + i] : 255;
        uint8_t * o = d + i * per;
#if LV_COLOR_DEPTH == 32
        uint16_t c = (uint16_t)(lo | (hi << 8));
        uint8_t r = c >> 11, g = (c >> 5) & 63, b = c & 31;
        o[0] = (uint8_t)((b << 3) | (b >> 2));
        o[1] = (uint8_t)((g << 2) | (g >> 4));
        o[2] = (uint8_t)((r << 3) | (r >> 2));
        o[3] = a;
#elif LV_COLOR_16_SWAP
        o[0] = hi;
        o[1] = lo;
        if(P.img_alpha) o[2] = a;
#else
        o[0] = lo;
        o[1] = hi;
        if(P.img_alpha) o[2] = a;
#endif
    }
    lv_free(P.img);
    im->data = d;
    im->dsc.header.cf = P.img_alpha ? LV_IMG_CF_TRUE_COLOR_ALPHA : LV_IMG_CF_TRUE_COLOR;
    im->dsc.header.w = P.img_w;
    im->dsc.header.h = P.img_h;
    im->dsc.data_size = (uint32_t)(n * per);
#endif
    im->dsc.data = im->data;
    im->id = id;
    im->screen = scr;
    P.img = NULL;
    return im;
}

/* A keyboard types into the text field that has focus. */
static void ep_ta_focus_cb(lv_event_t * e)
{
    lv_obj_t * ta = (lv_obj_t *)lv_event_get_target(e);
    lv_obj_t * scr = lv_obj_get_screen(ta);
    for(uint32_t i = 0; i < lv_obj_get_child_count(scr); i++) {
        lv_obj_t * c = lv_obj_get_child(scr, (int32_t)i);
        if(lv_obj_check_type(c, &lv_keyboard_class)) lv_keyboard_set_textarea(c, ta);
    }
}

static void ep_props_default(void)
{
    if(P.img) lv_free(P.img);
    memset(&P, 0, sizeof(P));
    P.font = 16;
    P.min = 0;
    P.max = 100;
    P.opacity = 100;
    P.tap_to = -1;
}

static void ep_build(void)
{
    lv_obj_t * s = cur_screen;
    lv_obj_t * v = NULL;
    const char * t = P.type;
    if(!s) return;

    if(strcmp(t, "label") == 0) {
        v = lv_label_create(s);
        lv_label_set_text(v, P.text);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        if(P.align == 1) lv_obj_set_style_text_align(v, LV_TEXT_ALIGN_CENTER, 0);
        if(P.align == 2) lv_obj_set_style_text_align(v, LV_TEXT_ALIGN_RIGHT, 0);
        if(P.pad) lv_obj_set_style_pad_top(v, P.pad, 0);
        if(P.has_bg) {
            lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
            lv_obj_set_style_bg_opa(v, LV_OPA_COVER, 0);
            lv_obj_set_style_radius(v, P.radius, 0);
            lv_obj_set_style_pad_hor(v, 8, 0);
        }
    }
    else if(strcmp(t, "button") == 0) {
        v = lv_button_create(s);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
        lv_obj_set_style_shadow_width(v, 0, 0);
        lv_obj_t * l = lv_label_create(v);
        lv_label_set_text(l, P.text);
        lv_obj_set_style_text_color(l, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(l, ep_font(P.font), 0);
        lv_obj_center(l);
    }
    else if(strcmp(t, "panel") == 0) {
        v = lv_obj_create(s);
        lv_obj_remove_flag(v, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
        lv_obj_set_style_pad_all(v, 0, 0);
        lv_obj_set_style_border_width(v, P.border, 0);
        if(P.border) lv_obj_set_style_border_color(v, lv_color_hex(P.border_color), 0);
        if(P.shadow) {
            lv_obj_set_style_shadow_width(v, 24, 0);
            lv_obj_set_style_shadow_offset_y(v, 6, 0);
            lv_obj_set_style_shadow_color(v, lv_color_hex(0x101828), 0);
            lv_obj_set_style_shadow_opa(v, 20, 0);
        }
        else lv_obj_set_style_shadow_width(v, 0, 0);
    }
    else if(strcmp(t, "switch") == 0) {
        v = lv_switch_create(s);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), LV_PART_MAIN);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR | LV_STATE_CHECKED);
        if(P.checked) lv_obj_add_state(v, LV_STATE_CHECKED);
    }
    else if(strcmp(t, "slider") == 0) {
        v = lv_slider_create(s);
        lv_slider_set_range(v, P.min, P.max);
        lv_slider_set_value(v, P.value, LV_ANIM_OFF);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), LV_PART_MAIN);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR);
        lv_obj_set_style_bg_color(v, lv_color_hex(0xFFFFFF), LV_PART_KNOB);
    }
    else if(strcmp(t, "bar") == 0) {
        v = lv_bar_create(s);
        lv_bar_set_range(v, P.min, P.max);
        lv_bar_set_value(v, P.value, LV_ANIM_OFF);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), LV_PART_MAIN);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR);
        lv_obj_set_style_radius(v, P.radius, LV_PART_MAIN);
        lv_obj_set_style_radius(v, P.radius, LV_PART_INDICATOR);
    }
    else if(strcmp(t, "arc") == 0) {
        v = lv_arc_create(s);
        lv_arc_set_rotation(v, 135);
        lv_arc_set_bg_angles(v, 0, 270);
        lv_arc_set_range(v, P.min, P.max);
        lv_arc_set_value(v, P.value);
        lv_obj_remove_style(v, NULL, LV_PART_KNOB);
        lv_obj_set_style_arc_width(v, P.thick, LV_PART_MAIN);
        lv_obj_set_style_arc_width(v, P.thick, LV_PART_INDICATOR);
        lv_obj_set_style_arc_color(v, lv_color_hex(P.bg), LV_PART_MAIN);
        lv_obj_set_style_arc_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR);
        if(P.show_value) {
            lv_obj_t * l = lv_label_create(v);
            lv_label_set_text_fmt(l, "%d", P.value);
            lv_obj_set_style_text_color(l, lv_color_hex(P.fg), 0);
            lv_obj_set_style_text_font(l, ep_font(P.font), 0);
            lv_obj_center(l);
            lv_obj_add_event_cb(v, ep_arc_value_cb, LV_EVENT_VALUE_CHANGED, l);
        }
    }
    else if(strcmp(t, "checkbox") == 0) {
        v = lv_checkbox_create(s);
        lv_checkbox_set_text(v, P.text);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR | LV_STATE_CHECKED);
        lv_obj_set_style_border_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR | LV_STATE_CHECKED);
        if(P.checked) lv_obj_add_state(v, LV_STATE_CHECKED);
    }
    else if(strcmp(t, "icon") == 0) {
        v = lv_label_create(s);
        lv_label_set_text(v, ep_symbol(P.icon));
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        lv_obj_set_style_text_align(v, LV_TEXT_ALIGN_CENTER, 0);
        if(P.pad) lv_obj_set_style_pad_top(v, P.pad, 0);
    }
    else if(strcmp(t, "dropdown") == 0) {
        v = lv_dropdown_create(s);
        lv_dropdown_set_options(v, P.options);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
    }
    else if(strcmp(t, "chart") == 0) {
        int vals[64];
        int n = 0, lo = 0, hi = 1;
        const char * p = P.data;
        while(*p && n < 64) {
            while(*p == ',' || *p == ' ') p++;
            if(!*p) break;
            vals[n] = ep_atoi(p);
            if(vals[n] < lo) lo = vals[n];
            if(vals[n] > hi) hi = vals[n];
            n++;
            while(*p && *p != ',') p++;
        }
        v = lv_chart_create(s);
        lv_chart_set_type(v, LV_CHART_TYPE_LINE);
        lv_chart_set_point_count(v, (uint32_t)n);
        lv_chart_set_range(v, LV_CHART_AXIS_PRIMARY_Y, lo, hi);
        lv_chart_set_div_line_count(v, 3, 0);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
        lv_obj_set_style_border_width(v, 0, 0);
        lv_chart_series_t * ser = lv_chart_add_series(v, lv_color_hex(P.accent), LV_CHART_AXIS_PRIMARY_Y);
        for(int i = 0; i < n; i++) lv_chart_set_next_value(v, ser, vals[i]);
    }
    else if(strcmp(t, "spinner") == 0) {
#if LVGL_VERSION_MAJOR < 9
        v = lv_spinner_create(s, 1000, 100);
#else
        v = lv_spinner_create(s);
        lv_spinner_set_anim_params(v, 1000, 100);
#endif
        lv_obj_set_style_arc_width(v, P.thick, LV_PART_MAIN);
        lv_obj_set_style_arc_width(v, P.thick, LV_PART_INDICATOR);
        lv_obj_set_style_arc_color(v, lv_color_hex(P.bg), LV_PART_MAIN);
        lv_obj_set_style_arc_color(v, lv_color_hex(P.accent), LV_PART_INDICATOR);
    }
    else if(strcmp(t, "led") == 0) {
        v = lv_led_create(s);
        lv_led_set_color(v, lv_color_hex(P.accent));
        if(P.checked) lv_led_on(v);
        else lv_led_off(v);
    }
    else if(strcmp(t, "roller") == 0) {
        v = lv_roller_create(s);
        lv_roller_set_options(v, P.options, LV_ROLLER_MODE_NORMAL);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
        lv_obj_set_style_border_width(v, 0, 0);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_SELECTED);
        lv_obj_set_style_text_color(v, lv_color_hex(0xFFFFFF), LV_PART_SELECTED);
        lv_obj_set_style_text_font(v, ep_font(P.font), LV_PART_SELECTED);
        lv_roller_set_selected(v, (uint32_t)(P.value < 0 ? 0 : P.value), LV_ANIM_OFF);
    }
    else if(strcmp(t, "textarea") == 0) {
        v = lv_textarea_create(s);
        lv_textarea_set_placeholder_text(v, P.text);
        if(P.one_line) lv_textarea_set_one_line(v, true);
        if(P.password) lv_textarea_set_password_mode(v, true);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), 0);
        lv_obj_set_style_text_font(v, ep_font(P.font), 0);
        lv_obj_set_style_radius(v, P.radius, 0);
        lv_obj_set_style_border_color(v, lv_color_hex(P.accent), LV_STATE_FOCUSED);
        lv_obj_set_scrollbar_mode(v, LV_SCROLLBAR_MODE_OFF);
        if(P.pad) {
            lv_obj_set_style_pad_top(v, P.pad, 0);
            lv_obj_set_style_pad_bottom(v, P.pad_bottom, 0);
        }
        lv_obj_add_event_cb(v, ep_ta_focus_cb, LV_EVENT_FOCUSED, NULL);
        for(uint32_t i = 0; i < lv_obj_get_child_count(s); i++) {
            lv_obj_t * c = lv_obj_get_child(s, (int32_t)i);
            if(lv_obj_check_type(c, &lv_keyboard_class) && !lv_keyboard_get_textarea(c)) lv_keyboard_set_textarea(c, v);
        }
    }
    else if(strcmp(t, "keyboard") == 0) {
        v = lv_keyboard_create(s);
        lv_obj_set_align(v, LV_ALIGN_TOP_LEFT);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.bg), 0);
        lv_obj_set_style_bg_color(v, lv_color_hex(P.accent), LV_PART_ITEMS);
        lv_obj_set_style_text_color(v, lv_color_hex(P.fg), LV_PART_ITEMS);
        lv_obj_set_style_text_font(v, ep_font(P.font), LV_PART_ITEMS);
        lv_obj_set_style_radius(v, P.radius, LV_PART_ITEMS);
        for(uint32_t i = 0; i < lv_obj_get_child_count(s); i++) {
            lv_obj_t * c = lv_obj_get_child(s, (int32_t)i);
            if(lv_obj_check_type(c, &lv_textarea_class)) {
                lv_keyboard_set_textarea(v, c);
                break;
            }
        }
    }
    else if(strcmp(t, "image") == 0) {
        ep_image_t * im = (P.img && P.img_len == P.img_cap) ? ep_image_take(P.id, s) : NULL;
        if(im) {
            v = lv_image_create(s);
            lv_image_set_src(v, &im->dsc);
        }
        else {
            v = lv_obj_create(s);
            lv_obj_remove_flag(v, LV_OBJ_FLAG_SCROLLABLE);
            lv_obj_set_style_bg_color(v, lv_color_hex(0xE4E6EB), 0);
            lv_obj_set_style_border_width(v, 0, 0);
            lv_obj_set_style_radius(v, 12, 0);
            lv_obj_set_style_shadow_width(v, 0, 0);
            lv_obj_t * l = lv_label_create(v);
            lv_label_set_text(l, LV_SYMBOL_IMAGE);
            lv_obj_set_style_text_color(l, lv_color_hex(0x8D93A1), 0);
            lv_obj_set_style_text_font(l, &lv_font_montserrat_14, 0);
            lv_obj_center(l);
        }
    }
    if(!v) return;

    lv_obj_set_pos(v, P.x, P.y);
    lv_obj_set_size(v, P.w, P.h);
    if(P.opacity < 100) lv_obj_set_style_opa(v, (lv_opa_t)((255 * P.opacity + 50) / 100), 0);
    if(P.hidden) lv_obj_add_flag(v, LV_OBJ_FLAG_HIDDEN);
    if(P.tap_to >= 0) {
        if(strcmp(t, "label") == 0 || strcmp(t, "icon") == 0 || strcmp(t, "image") == 0) lv_obj_add_flag(v, LV_OBJ_FLAG_CLICKABLE);
        lv_obj_add_event_cb(v, ep_tap_cb, LV_EVENT_CLICKED, (void *)(intptr_t)((P.tap_to << 4) | (P.tap_anim & 15)));
    }
    if(widget_count < EP_MAX_WIDGETS) {
        widgets[widget_count].id = P.id;
        widgets[widget_count].obj = v;
        widget_count++;
    }
}

static void ep_prop(const char * k, const char * val)
{
    if(!strcmp(k, "text")) ep_unescape(P.text, val, sizeof(P.text));
    else if(!strcmp(k, "options")) ep_unescape(P.options, val, sizeof(P.options));
    else if(!strcmp(k, "data")) ep_unescape(P.data, val, sizeof(P.data));
    else if(!strcmp(k, "icon")) ep_unescape(P.icon, val, sizeof(P.icon));
    else if(!strcmp(k, "fg")) { P.fg = ep_hex(val); P.has_fg = 1; }
    else if(!strcmp(k, "bg")) { P.bg = ep_hex(val); P.has_bg = 1; }
    else if(!strcmp(k, "accent")) { P.accent = ep_hex(val); P.has_accent = 1; }
    else if(!strcmp(k, "borderColor")) { P.border_color = ep_hex(val); P.has_border_color = 1; }
    else if(!strcmp(k, "font")) P.font = ep_atoi(val);
    else if(!strcmp(k, "align")) P.align = ep_atoi(val);
    else if(!strcmp(k, "pad")) P.pad = ep_atoi(val);
    else if(!strcmp(k, "padb")) P.pad_bottom = ep_atoi(val);
    else if(!strcmp(k, "radius")) P.radius = ep_atoi(val);
    else if(!strcmp(k, "thick")) P.thick = ep_atoi(val);
    else if(!strcmp(k, "border")) P.border = ep_atoi(val);
    else if(!strcmp(k, "value")) P.value = ep_atoi(val);
    else if(!strcmp(k, "min")) P.min = ep_atoi(val);
    else if(!strcmp(k, "max")) P.max = ep_atoi(val);
    else if(!strcmp(k, "checked")) P.checked = ep_atoi(val);
    else if(!strcmp(k, "showValue")) P.show_value = ep_atoi(val);
    else if(!strcmp(k, "shadow")) P.shadow = ep_atoi(val);
    else if(!strcmp(k, "opacity")) P.opacity = ep_atoi(val);
    else if(!strcmp(k, "hidden")) P.hidden = ep_atoi(val);
    else if(!strcmp(k, "tapTo")) P.tap_to = ep_atoi(val);
    else if(!strcmp(k, "tapAnim")) P.tap_anim = ep_atoi(val);
    else if(!strcmp(k, "oneLine")) P.one_line = ep_atoi(val);
    else if(!strcmp(k, "password")) P.password = ep_atoi(val);
    else if(!strcmp(k, "img")) {
        const char * q = val;
        int w = ep_atoi(q);
        q = strchr(q, ',');
        int h = q ? ep_atoi(q + 1) : 0;
        q = q ? strchr(q + 1, ',') : NULL;
        int alpha = q ? ep_atoi(q + 1) : 0;
        if(P.img) lv_free(P.img);
        P.img = NULL;
        if(w > 0 && h > 0 && w <= 2048 && h <= 2048) {
            P.img_cap = (uint32_t)w * (uint32_t)h * (alpha ? 3 : 2);
            P.img = lv_malloc(P.img_cap);
            P.img_len = 0;
            P.img_w = w;
            P.img_h = h;
            P.img_alpha = alpha;
        }
    }
    else if(!strcmp(k, "imgd")) ep_img_append(val);
}

static void ep_new_screen(int id, uint32_t bg)
{
    lv_obj_t * scr = lv_obj_create(NULL);
    lv_obj_remove_flag(scr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(scr, lv_color_hex(bg), 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, 0);

    ep_screen_t * old = ep_find_screen(id);
    if(old) {
        lv_obj_t * prev = old->obj;
        old->obj = scr;
        ep_forget_widgets_of(prev);
        if(lv_screen_active() == prev) lv_screen_load(scr);
        lv_obj_delete(prev);
        ep_free_images(prev);
    }
    else if(screen_count < EP_MAX_SCREENS) {
        screens[screen_count].id = id;
        screens[screen_count].obj = scr;
        screen_count++;
    }
    cur_screen = scr;
}

static void ep_drop_screen(int id)
{
    for(int i = 0; i < screen_count; i++) {
        if(screens[i].id != id) continue;
        lv_obj_t * o = screens[i].obj;
        ep_forget_widgets_of(o);
        if(lv_screen_active() == o) {
            lv_obj_t * blank = lv_obj_create(NULL);
            lv_screen_load(blank);
        }
        lv_obj_delete(o);
        ep_free_images(o);
        screens[i] = screens[--screen_count];
        return;
    }
}

void epixo_rt_reset(void)
{
    lv_obj_t * blank = lv_obj_create(NULL);
    lv_obj_t * act = lv_screen_active();
    lv_screen_load(blank);
    for(int i = 0; i < screen_count; i++) {
        if(screens[i].obj && screens[i].obj != blank) lv_obj_delete(screens[i].obj);
    }
    if(act && act != blank) {
        int owned = 0;
        for(int i = 0; i < screen_count; i++) if(screens[i].obj == act) owned = 1;
        if(!owned) lv_obj_delete(act);
    }
    ep_free_images(NULL);
    screen_count = 0;
    widget_count = 0;
    cur_screen = NULL;
    in_widget = 0;
}

void epixo_rt_init(void)
{
    screen_count = 0;
    widget_count = 0;
    cur_screen = NULL;
    in_widget = 0;
}

static int ep_split(char * line, char ** f, int max)
{
    int n = 0;
    char * p = line;
    while(n < max) {
        f[n++] = p;
        char * tab = strchr(p, '\t');
        if(!tab) break;
        *tab = 0;
        p = tab + 1;
    }
    return n;
}

void epixo_rt_line(char * line)
{
    char * f[8];
    size_t len = strlen(line);
    while(len && (line[len - 1] == '\r' || line[len - 1] == '\n')) line[--len] = 0;
    if(!len) return;
    int n = ep_split(line, f, 8);
    char c = f[0][0];

    if(c == 'W' && n >= 7) {
        ep_props_default();
        strncpy(P.type, f[1], sizeof(P.type) - 1);
        P.id = ep_atoi(f[2]);
        P.x = ep_atoi(f[3]);
        P.y = ep_atoi(f[4]);
        P.w = ep_atoi(f[5]);
        P.h = ep_atoi(f[6]);
        in_widget = 1;
    }
    else if(c == 'P' && n >= 3 && in_widget) ep_prop(f[1], f[2]);
    else if(c == 'P' && n == 2 && in_widget) ep_prop(f[1], "");
    else if(c == 'E' && in_widget) { ep_build(); in_widget = 0; }
    else if(c == 'S' && n >= 3) ep_new_screen(ep_atoi(f[1]), ep_hex(f[2]));
    else if(c == 'L' && n >= 2) {
        lv_obj_t * s = epixo_rt_screen(ep_atoi(f[1]));
        if(s && s != lv_screen_active()) {
            if(n >= 3) lv_screen_load_anim(s, anims[ep_atoi(f[2]) & 7], 300, 0, false);
            else lv_screen_load(s);
        }
    }
    else if(c == 'K' && n >= 2) ep_drop_screen(ep_atoi(f[1]));
    else if(c == 'X') epixo_rt_reset();
}

void epixo_rt_exec(const char * script)
{
    static char buf[2048];
    const char * p = script;
    while(*p) {
        size_t n = 0;
        while(p[n] && p[n] != '\n') n++;
        size_t c = n < sizeof(buf) - 1 ? n : sizeof(buf) - 1;
        memcpy(buf, p, c);
        buf[c] = 0;
        epixo_rt_line(buf);
        p += n;
        if(*p == '\n') p++;
    }
}
