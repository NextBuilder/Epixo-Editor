#include "harness_v8.h"
#include "epixo_rt.h"
int main(int argc, char ** argv)
{
    int w = atoi(argv[1]), h = atoi(argv[2]);
    FILE * f = fopen(argv[3], "rb");
    fseek(f, 0, SEEK_END); long n = ftell(f); fseek(f, 0, SEEK_SET);
    char * s = malloc(n + 1); fread(s, 1, n, f); s[n] = 0; fclose(f);
    lv_init();
    lv_disp_t * d = mkdisp(w, h);
    epixo_rt_init();
    epixo_rt_exec(s);
    for(int i = 4; i < argc; i += 2) {
        char cmd[32]; snprintf(cmd, sizeof cmd, "L\t%s", argv[i]);
        epixo_rt_line(cmd);
        dump(d, argv[i + 1]);
    }
    return 0;
}
