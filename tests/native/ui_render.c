#include "harness_common.h"
#include "ui.h"
int main(int argc, char ** argv)
{
    int w = atoi(argv[1]), h = atoi(argv[2]);
    lv_init();
    lv_display_t * d = mkdisp(w, h);
    ui_init();
    for(int i = 0; i < UI_SCREEN_COUNT; i++) {
        char p[512]; snprintf(p, sizeof p, "%s/%d.raw", argv[3], i);
        lv_screen_load(ui_get_screen(i));
        dump(d, p);
    }
    return 0;
}
