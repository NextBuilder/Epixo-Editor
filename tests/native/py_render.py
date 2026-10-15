import sys
import lvgl as lv
W = int(sys.argv[1]); H = int(sys.argv[2]); D = sys.argv[3]

buf = bytearray(W * H * 2)
disp = lv.display_create(W, H)
disp.set_color_format(lv.COLOR_FORMAT.RGB565)
disp.set_buffers(buf, None, len(buf), lv.DISPLAY_RENDER_MODE.DIRECT)
def flush(d, area, px):
    d.flush_ready()
disp.set_flush_cb(flush)
g = {}
exec(open(D + '/ui.py').read(), g)
names = [l.strip() for l in open(D + '/screens.txt') if l.strip()]
for i, n in enumerate(names):
    lv.screen_load(g['scr_' + n])
    for k in range(60):
        lv.tick_inc(20)
        lv.timer_handler()
    lv.screen_active().invalidate()
    lv.refr_now(disp)
    f = open(D + '/out_py/%d.raw' % i, 'wb')
    f.write(buf)
    f.close()
print('ok', len(names))
