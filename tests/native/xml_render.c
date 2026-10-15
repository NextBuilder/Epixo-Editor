#include "harness_common.h"
#include <string.h>
static char * slurp(const char * p)
{
    FILE * f = fopen(p, "rb"); if(!f) return NULL;
    fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET);
    char * s = malloc(n + 1); fread(s, 1, n, f); s[n] = 0; fclose(f); return s;
}
#define F(n) lv_xml_register_font(NULL, "lv_font_montserrat_" #n, &lv_font_montserrat_##n)
int main(int argc, char ** argv)
{
    int w = atoi(argv[1]), h = atoi(argv[2]);
    const char * dir = argv[3];
    lv_init();
    lv_display_t * d = mkdisp(w, h);
    F(12);F(14);F(16);F(18);F(20);F(22);F(24);F(26);F(28);F(30);F(32);F(34);F(36);F(38);F(40);F(42);F(44);F(46);F(48);
    char path[512]; snprintf(path, sizeof path, "%s/index.txt", dir);
    char * idx = slurp(path); char * names[64]; int n = 0;
    for(char * t = strtok(idx, "\n"); t && n < 64; t = strtok(NULL, "\n")) names[n++] = t;
    for(int i = 0; i < n; i++) {
        snprintf(path, sizeof path, "%s/%s.xml", dir, names[i]);
        char * x = slurp(path);
        if(lv_xml_register_component_from_data(names[i], x) != LV_RESULT_OK) { printf("REGISTER FAIL %s\n", names[i]); return 2; }
    }
    for(int i = 0; i < n; i++) {
        lv_obj_t * s = lv_xml_create_screen(names[i]);
        if(!s) { printf("CREATE FAIL %s\n", names[i]); return 3; }
        lv_screen_load(s);
        snprintf(path, sizeof path, "%s/../out_xml/%d.raw", dir, i);
        dump(d, path);
    }
    return 0;
}
