import sys, numpy as np
from PIL import Image
def load(path,w,h):
    a=np.fromfile(path,dtype='<u2').reshape(h,w)
    r=((a>>11)&31)*255//31; g=((a>>5)&63)*255//63; b=(a&31)*255//31
    return Image.fromarray(np.dstack([r,g,b]).astype('uint8'))
imgs=[]
for spec in sys.argv[2:]:
    p,w,h=spec.split(':'); imgs.append(load(p,int(w),int(h)))
W=max(i.width for i in imgs); H=sum(i.height for i in imgs)+10*(len(imgs)-1)
out=Image.new('RGB',(W,H),(200,200,200)); y=0
for i in imgs: out.paste(i,(0,y)); y+=i.height+10
out.save(sys.argv[1])
