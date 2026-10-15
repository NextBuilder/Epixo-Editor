#ifndef EPIXO_RT_H
#define EPIXO_RT_H

#include "lvgl.h"

#ifdef __cplusplus
extern "C" {
#endif

void epixo_rt_init(void);
void epixo_rt_exec(const char * script);
void epixo_rt_line(char * line);
void epixo_rt_reset(void);
lv_obj_t * epixo_rt_screen(int id);
int epixo_rt_widget_value(int id);

#ifdef __cplusplus
}
#endif

#endif
