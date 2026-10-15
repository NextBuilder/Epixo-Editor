(function (root) {
'use strict';

const R = Math.round, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FONTS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48];
const LH = {12:15,14:16,16:18,18:21,20:22,22:24,24:27,26:29,28:30,30:33,32:35,34:38,36:40,38:41,40:44,42:46,44:49,46:50,48:52};
const ADV = {"12":[52,51,75,135,119,162,132,40,65,65,77,112,44,74,44,68,128,71,110,110,128,110,118,115,124,118,44,44,112,112,112,110,199,141,145,139,159,129,122,148,156,60,98,138,114,183,156,161,139,161,140,119,113,152,137,216,129,124,126,64,68,64,112,96,115,115,131,110,131,118,68,132,131,54,55,118,54,203,131,122,131,131,79,96,79,130,107,173,106,107,100,67,57,67,112],"14":[60,60,88,157,139,189,154,47,75,76,90,130,51,86,51,79,149,83,129,128,150,129,138,134,144,138,51,51,130,130,130,128,232,164,170,162,185,150,142,173,182,69,115,161,133,214,182,188,162,188,163,139,131,177,159,252,151,145,147,75,79,75,131,112,134,134,153,128,153,137,79,155,153,62,64,138,62,237,153,142,153,153,92,112,93,152,125,201,124,125,117,79,67,79,130],"16":[69,69,100,180,159,216,176,54,86,87,102,149,58,98,58,90,171,95,147,146,171,147,158,153,165,158,58,58,149,149,149,147,265,187,194,185,211,172,163,198,208,79,131,184,152,244,208,215,185,215,186,159,150,202,182,288,172,166,168,85,90,85,149,128,154,153,175,146,175,157,90,177,174,71,73,158,71,271,174,163,175,175,105,128,106,173,143,230,141,143,133,90,77,90,149],"18":[77,77,113,202,179,243,198,60,97,97,115,168,65,110,65,101,192,107,165,165,193,165,178,172,185,178,65,65,168,168,168,165,298,211,218,208,238,193,183,222,234,89,148,207,171,275,234,242,208,242,209,179,169,228,205,324,194,186,189,96,101,96,168,144,173,172,196,164,196,176,102,199,196,80,82,177,80,304,196,183,196,196,118,144,119,195,161,259,159,161,150,101,86,101,168],"20":[86,86,125,225,199,270,220,67,108,108,128,186,73,123,73,113,213,118,184,183,214,184,197,191,206,197,73,73,186,186,186,183,331,234,242,231,264,214,203,247,260,99,164,230,190,306,260,269,231,269,233,199,188,253,228,360,215,207,210,107,113,107,187,160,192,191,218,183,218,196,113,221,218,89,91,197,89,338,218,203,218,218,131,160,132,217,179,288,177,179,167,112,96,112,186],"22":[95,94,138,247,219,297,241,74,119,119,141,205,80,135,80,124,235,130,202,201,235,202,217,210,227,217,80,80,205,205,205,202,364,258,266,254,291,236,224,272,286,109,181,253,209,336,286,296,254,296,256,219,207,278,251,396,237,228,231,117,124,117,205,176,211,210,240,201,240,215,124,243,240,98,100,217,98,372,240,224,240,240,144,176,146,238,197,316,194,197,183,124,105,124,205],"24":[103,103,150,270,238,324,263,81,129,130,154,223,87,147,87,135,256,142,220,220,257,220,237,230,247,237,87,87,223,223,223,220,397,281,291,278,317,257,244,296,312,119,197,276,228,367,312,323,277,323,279,238,225,304,273,432,258,248,252,128,135,128,224,192,230,230,262,219,262,235,136,265,262,107,109,237,107,406,262,244,262,262,157,192,159,260,215,345,212,215,200,135,115,135,223],"26":[112,111,163,292,258,351,285,87,140,141,166,242,94,159,94,146,277,154,239,238,278,239,257,249,268,257,94,94,242,242,242,238,430,305,315,301,344,279,264,321,338,129,213,299,247,397,338,349,300,349,302,258,244,329,296,468,280,269,273,139,146,139,243,208,250,249,284,238,284,255,147,287,283,116,118,256,116,440,283,264,284,284,171,208,172,282,233,374,230,233,217,146,124,146,242],"28":[121,120,175,315,278,378,307,94,151,151,179,261,102,172,102,158,299,166,257,256,300,257,276,268,289,276,102,102,261,261,261,257,463,328,339,324,370,300,284,346,364,139,230,322,266,428,364,376,323,376,326,278,263,354,319,504,302,290,294,149,158,149,261,224,269,268,306,256,306,274,158,309,305,125,127,276,125,474,305,284,306,306,184,224,185,303,250,403,247,250,233,157,134,157,261],"30":[129,129,188,337,298,405,329,101,162,162,192,279,109,184,109,169,320,178,276,275,321,276,296,287,309,296,109,109,279,279,279,275,496,351,363,347,396,322,305,371,390,149,246,345,285,458,390,403,347,403,349,298,282,380,342,540,323,311,315,160,169,160,280,240,288,287,327,274,327,294,169,331,327,134,136,296,134,507,327,305,327,327,197,240,199,325,268,432,265,268,250,168,144,168,279],"32":[138,137,200,360,318,432,351,108,173,173,205,298,116,196,116,180,342,189,294,293,343,294,316,306,330,316,116,116,298,298,298,293,529,375,388,370,423,343,325,395,416,159,263,368,304,489,416,430,370,430,372,318,301,405,365,577,345,331,336,170,180,170,298,256,307,306,349,292,349,313,181,353,349,143,145,315,143,541,349,325,349,349,210,257,212,347,286,460,283,286,267,180,153,180,298],"34":[146,146,213,382,338,459,373,114,183,184,218,317,123,208,123,191,363,201,312,311,364,312,336,325,350,336,123,123,317,317,317,312,562,398,412,393,449,364,345,420,442,169,279,391,323,520,442,457,393,457,395,338,319,430,387,613,366,352,357,181,191,181,317,272,326,325,371,311,371,333,192,375,370,152,154,335,152,575,370,345,371,371,223,273,225,368,304,489,300,304,283,191,163,191,317],"36":[155,154,225,405,358,486,395,121,194,195,230,335,131,221,131,203,384,213,331,329,385,331,355,344,371,355,131,131,335,335,335,330,596,422,436,416,476,386,366,445,468,179,295,414,342,550,468,484,416,484,419,358,338,456,410,649,388,373,378,192,203,192,336,288,346,344,393,329,393,353,203,397,392,161,164,355,161,609,392,366,393,393,236,289,238,390,322,518,318,322,300,202,172,202,335],"38":[164,163,238,427,378,513,417,128,205,206,243,354,138,233,138,214,406,225,349,348,407,349,375,364,392,375,138,138,354,354,354,348,629,445,460,440,502,407,386,469,494,188,312,437,361,581,494,511,439,511,442,378,357,481,433,685,409,393,399,202,214,202,354,304,365,364,415,347,415,372,215,420,414,170,173,375,170,643,414,386,415,415,249,305,252,412,340,547,336,340,317,213,182,213,354],"40":[172,172,250,450,397,540,439,134,216,216,256,372,145,245,145,225,427,237,367,366,428,367,395,383,412,395,145,145,372,372,372,367,662,468,484,463,529,429,406,494,520,198,328,460,380,611,520,538,462,538,465,397,376,506,456,721,431,414,420,213,225,213,373,320,384,383,436,365,436,392,226,442,436,179,182,394,179,676,436,406,436,436,262,321,265,433,358,575,353,358,333,225,191,225,372],"42":[181,180,263,472,417,566,461,141,226,227,269,391,153,257,153,237,448,249,386,384,450,386,415,402,433,415,153,153,391,391,391,385,695,492,509,486,555,450,427,519,546,208,345,483,399,642,546,564,485,564,489,417,394,532,478,757,452,435,442,224,237,224,392,336,403,402,458,384,458,411,237,464,458,187,191,414,187,710,458,427,458,458,276,337,278,455,376,604,371,376,350,236,201,236,391],"44":[189,189,275,495,437,593,483,148,237,238,282,410,160,270,160,248,470,260,404,403,471,404,434,421,453,434,160,160,410,410,410,403,728,515,533,509,582,472,447,543,572,218,361,506,418,672,572,591,508,591,512,437,413,557,501,793,474,455,463,234,248,234,410,352,422,421,480,402,480,431,249,486,479,196,200,434,196,744,479,447,480,480,289,353,291,477,394,633,389,394,367,247,210,247,410],"46":[198,197,288,517,457,620,505,155,248,249,294,428,167,282,167,259,491,272,422,421,492,422,454,440,474,454,167,167,428,428,428,422,761,539,557,532,608,493,467,568,598,228,378,529,437,703,598,618,531,618,535,457,432,582,524,829,495,476,484,245,259,245,429,368,442,440,502,420,502,450,260,508,501,205,209,453,205,778,501,467,502,502,302,369,305,498,411,662,406,411,383,258,220,258,428],"48":[207,206,300,540,477,647,527,161,259,260,307,447,174,294,174,270,512,284,441,439,514,441,474,459,495,474,174,174,447,447,447,440,794,562,581,555,634,515,488,593,624,238,394,552,456,733,624,645,554,645,558,477,451,607,547,865,517,497,505,256,270,256,448,384,461,459,524,439,524,470,271,530,523,214,218,473,214,812,523,488,524,524,315,385,318,520,429,690,424,429,400,270,230,270,447]};
function measureText(font, str) {
  const a = ADV[font] || ADV[16];
  let w = 0;
  for (const ch of String(str)) { const c = ch.codePointAt(0); w += (c >= 32 && c <= 126) ? a[c - 32] : a[33]; }
  return w / 16;
}
const F = v => FONTS.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a, FONTS[0]);
const C = {bg:'#F2F3F7',card:'#FFFFFF',ink:'#0E1525',ink2:'#5E6678',acc:'#0A6CFF',track:'#E4E6EB',green:'#30C15A',orange:'#FF9F0A',red:'#FF3B30',pink:'#FF2D55'};

const ICONS = {
  home:['<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>','HOME'],
  wifi:['<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/>','WIFI'],
  bluetooth:['<path d="M7 7l10 10-5 4V3l5 4L7 17"/>','BLUETOOTH'],
  bell:['<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>','BELL'],
  settings:['<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>','SETTINGS'],
  power:['<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>','POWER'],
  charge:['<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>','CHARGE'],
  play:['<path d="M7 4l13 8-13 8z"/>','PLAY'],
  pause:['<path d="M8 5v14M16 5v14"/>','PAUSE'],
  stop:['<rect x="6" y="6" width="12" height="12" rx="1"/>','STOP'],
  prev:['<path d="M18 5v14L8 12z"/><path d="M6 5v14"/>','PREV'],
  next:['<path d="M6 5v14l10-7z"/><path d="M18 5v14"/>','NEXT'],
  volume:['<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/>','VOLUME_MAX'],
  mute:['<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>','MUTE'],
  audio:['<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>','AUDIO'],
  refresh:['<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8"/><path d="M20 3v5h-5"/>','REFRESH'],
  ok:['<path d="M4 12.5l5 5L20 6.5"/>','OK'],
  close:['<path d="M6 6l12 12M18 6L6 18"/>','CLOSE'],
  plus:['<path d="M12 5v14M5 12h14"/>','PLUS'],
  minus:['<path d="M5 12h14"/>','MINUS'],
  left:['<path d="M15 5l-7 7 7 7"/>','LEFT'],
  right:['<path d="M9 5l7 7-7 7"/>','RIGHT'],
  up:['<path d="M5 15l7-7 7 7"/>','UP'],
  down:['<path d="M5 9l7 7 7-7"/>','DOWN'],
  battery:['<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M5.5 10v4M9 10v4M12.5 10v4"/>','BATTERY_FULL'],
  eye:['<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>','EYE_OPEN'],
  image:['<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>','IMAGE'],
  gps:['<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>','GPS'],
  trash:['<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>','TRASH'],
  edit:['<path d="M4 20h4L20 8l-4-4L4 16z"/>','EDIT'],
  save:['<path d="M5 3h11l4 4v14H4V3z"/><path d="M8 3v5h8V3M8 21v-7h8v7"/>','SAVE'],
  warning:['<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>','WARNING'],
  call:['<path d="M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>','CALL'],
  envelope:['<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>','ENVELOPE'],
  list:['<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>','LIST'],
  usb:['<path d="M12 2v15M12 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 7l4-4 4 4M7 10v3l5 3M17 9v3l-5 3"/>','USB'],
  upload:['<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>','UPLOAD'],
  download:['<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>','DOWNLOAD'],
  loop:['<path d="M17 2l4 4-4 4"/><path d="M3 12V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 12v3a3 3 0 0 1-3 3H3"/>','LOOP'],
  shuffle:['<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>','SHUFFLE'],
  keyboard:['<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>','KEYBOARD'],
  tint:['<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>','TINT']
};
const SYMBOL_NAME = n => 'LV_SYMBOL_' + (ICONS[n] || ICONS.home)[1];
const SYMBOL_HEX = {HOME:'F015',WIFI:'F1EB',BLUETOOTH:'F293',BELL:'F0F3',SETTINGS:'F013',POWER:'F011',CHARGE:'F0E7',PLAY:'F04B',PAUSE:'F04C',STOP:'F04D',PREV:'F048',NEXT:'F051',VOLUME_MAX:'F028',MUTE:'F026',AUDIO:'F001',REFRESH:'F021',OK:'F00C',CLOSE:'F00D',PLUS:'F067',MINUS:'F068',LEFT:'F053',RIGHT:'F054',UP:'F077',DOWN:'F078',BATTERY_FULL:'F240',EYE_OPEN:'F06E',IMAGE:'F03E',GPS:'F124',TRASH:'F2ED',EDIT:'F304',SAVE:'F0C7',WARNING:'F071',CALL:'F095',ENVELOPE:'F0E0',LIST:'F00B',USB:'F287',UPLOAD:'F093',DOWNLOAD:'F019',LOOP:'F079',SHUFFLE:'F074',KEYBOARD:'F11C',TINT:'F043'};

const TYPES = {
  label:{n:'Label',g:'basic',lv:'lv_label',i:'<path d="M5 6h14M12 6v13"/>',d:{w:180,h:34,text:'Hello, Epixo',fg:C.ink,font:20,align:'left',valign:'center',bg:'transparent',radius:0}},
  button:{n:'Button',g:'basic',lv:'lv_button',i:'<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/>',d:{w:150,h:50,text:'Continue',bg:C.acc,fg:'#FFFFFF',radius:14,font:16}},
  icon:{n:'Icon',g:'basic',lv:'lv_label',i:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4l-5.3 3 1.2-6-4.5-4.1 6-.7z"/>',d:{w:44,h:44,icon:'home',fg:C.acc}},
  panel:{n:'Card',g:'basic',lv:'lv_obj',i:'<rect x="3" y="5" width="18" height="14" rx="4"/>',d:{w:240,h:150,bg:C.card,radius:22,shadow:true,border:0,borderColor:'#E4E6EB'}},
  switch:{n:'Switch',g:'ctl',lv:'lv_switch',i:'<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="2.6"/>',d:{w:60,h:34,accent:C.green,bg:C.track,checked:true}},
  slider:{n:'Slider',g:'ctl',lv:'lv_slider',i:'<path d="M3 12h18"/><circle cx="9" cy="12" r="3"/>',d:{w:220,h:10,accent:C.acc,bg:C.track,value:60,min:0,max:100}},
  checkbox:{n:'Checkbox',g:'ctl',lv:'lv_checkbox',i:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12l3 3 5-6"/>',d:{w:180,h:30,text:'Auto mode',accent:C.acc,fg:C.ink,font:16,checked:true}},
  dropdown:{n:'Dropdown',g:'ctl',lv:'lv_dropdown',i:'<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M14 11l2 2 2-2"/>',d:{w:190,h:46,options:'Living room\nBedroom\nKitchen',bg:C.card,fg:C.ink,radius:12,font:16}},
  arc:{n:'Arc',g:'data',lv:'lv_arc',i:'<path d="M6 18a8 8 0 1 1 12 0"/>',d:{w:150,h:150,accent:C.acc,bg:C.track,value:70,min:0,max:100,thick:14,showValue:true,fg:C.ink,font:32}},
  bar:{n:'Progress',g:'data',lv:'lv_bar',i:'<rect x="3" y="10" width="18" height="4" rx="2"/><path d="M5 12h7"/>',d:{w:220,h:12,accent:C.green,bg:C.track,value:45,min:0,max:100,radius:6}},
  chart:{n:'Chart',g:'data',lv:'lv_chart',i:'<path d="M3 17l5-5 4 3 8-8"/>',d:{w:300,h:150,accent:C.acc,bg:C.card,data:'12,18,15,26,22,30,27,35',radius:16}},
  spinner:{n:'Spinner',g:'data',lv:'lv_spinner',i:'<path d="M12 3a9 9 0 1 0 9 9"/>',d:{w:56,h:56,accent:C.acc,bg:C.track,thick:6}},
  led:{n:'LED',g:'data',lv:'lv_led',i:'<circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',d:{w:26,h:26,accent:C.green,checked:true}}
};
const SQUARE = {arc:1, spinner:1, led:1, icon:1};
const TAPPABLE = {button:1, panel:1, icon:1, label:1};
const INTERACTIVE = {button:1, switch:1, slider:1, checkbox:1, dropdown:1, arc:0};

const ANIMS = [['move_left','Slide left','MOVE_LEFT'],['move_right','Slide right','MOVE_RIGHT'],['fade','Fade','FADE_IN'],['over_left','Cover left','OVER_LEFT'],['over_right','Cover right','OVER_RIGHT'],['move_top','Slide up','MOVE_TOP'],['move_bottom','Slide down','MOVE_BOTTOM'],['none','Instant','NONE']];
const animIndex = a => Math.max(0, ANIMS.findIndex(x => x[0] === a));

const THEMES = [
  {n:'Daylight',bg:'#F2F3F7',card:'#FFFFFF',ink:'#0E1525',ink2:'#5E6678',acc:'#0A6CFF',track:'#E4E6EB'},
  {n:'Midnight',bg:'#0B0D12',card:'#1A1D24',ink:'#F4F5F8',ink2:'#8D93A1',acc:'#3D8BFF',track:'#2A2E37'},
  {n:'Graphite',bg:'#1C1C1E',card:'#2C2C2E',ink:'#FFFFFF',ink2:'#98989F',acc:'#FF9F0A',track:'#3A3A3C'},
  {n:'Mint',bg:'#EEF6F2',card:'#FFFFFF',ink:'#0F2A1D',ink2:'#5E7A6B',acc:'#12A36B',track:'#DDEAE3'},
  {n:'Sunset',bg:'#FFF4EE',card:'#FFFFFF',ink:'#2A1610',ink2:'#8A6A5E',acc:'#FF5A36',track:'#F5E1D8'}
];

const SRC = {
  espanel:'https://github.com/esp-arduino-libs/ESP32_Display_Panel/tree/master/src/board/supported',
  cyd:'https://github.com/rzeldent/platformio-espressif32-sunton',
  ws:'https://www.waveshare.com/wiki/',
  elecrowAdv:'https://www.elecrow.com/wiki/1_Introduction_to_CrowPanel-Advance-HMI_Screen.html',
  lilygo:'https://openelab.io/nl/blogs/learn/lilygo-t-display-series-buying-guide',
  seeedEpd:'https://sensecraft-hmi-docs.seeed.cc/en/supported_hardware/',
  tab5:'https://www.cnx-software.com/2025/05/09/m5stack-tab5-tablet-esp32-p4-iot-development-kit-5-inch-touchscreen-display-and-front-facing-camera/'
};

function B(brand, name, size, w, h, o) {
  o = o || {};
  const id = (brand + '-' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  return {id, brand, name, size, w, h, round: !!o.r, panel: o.p || 'IPS', chip: o.c || 'ESP32-S3', touch: o.t !== false,
    lcd: o.lcd || '', tp: o.tp || '', pack: o.pack || null, bus: o.bus || '', v: o.v || 'spec', src: o.src || ''};
}
const EP = (macro, bus) => ({pack: 'espanel:' + macro, bus, v: 'driver', src: SRC.espanel});
const SD = (env) => ({pack: 'smart:' + env, v: 'cyd', src: SRC.cyd});
const WS = (page, extra) => Object.assign({v: 'web', src: SRC.ws + page}, extra || {});

const BOARDS = [
  B('Waveshare','ESP32-S3-Touch-AMOLED-1.75','1.75"',466,466,Object.assign({r:1,p:'AMOLED',lcd:'CO5300',tp:'CST9217'},WS('ESP32-S3-Touch-AMOLED-1.75'))),
  B('Waveshare','ESP32-S3-Touch-AMOLED-1.43','1.43"',466,466,Object.assign({r:1,p:'AMOLED',lcd:'SH8601',tp:'FT3168'},WS('ESP32-S3-Touch-AMOLED-1.43'))),
  B('Waveshare','ESP32-S3-Touch-AMOLED-1.64','1.64"',280,456,Object.assign({p:'AMOLED',lcd:'CO5300',tp:'FT3168'},WS('ESP32-S3-Touch-AMOLED-1.64'))),
  B('Waveshare','ESP32-S3-Touch-AMOLED-1.8','1.8"',368,448,Object.assign({p:'AMOLED',lcd:'SH8601',tp:'FT3168'},WS('ESP32-S3-Touch-AMOLED-1.8'))),
  B('Waveshare','ESP32-S3-Touch-AMOLED-2.06','2.06"',410,502,Object.assign({p:'AMOLED',lcd:'CO5300',tp:'FT3168'},WS('ESP32-S3-Touch-AMOLED-2.06'))),
  B('Waveshare','ESP32-S3-Touch-LCD-1.28','1.28"',240,240,Object.assign({r:1,lcd:'GC9A01A',tp:'CST816S'},WS('ESP32-S3-Touch-LCD-1.28'))),
  B('Waveshare','ESP32-S3-Touch-LCD-1.46','1.46"',412,412,{r:1,v:'web',src:'https://grobotronics.com/waveshare-esp32-s3-touch-ips-lcd-1-46-412412.html?sl=en'}),
  B('Waveshare','ESP32-S3-Touch-LCD-1.69','1.69"',240,280,Object.assign({lcd:'ST7789V2',tp:'CST816'},WS('ESP32-S3-Touch-LCD-1.69'))),
  B('Waveshare','ESP32-S3-Touch-LCD-1.85','1.85"',360,360,Object.assign({r:1,lcd:'ST77916',tp:'CST816S'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_1_85','spi'))),
  B('Waveshare','ESP32-S3-Touch-LCD-1.85C','1.85"',360,360,Object.assign({r:1,lcd:'ST77916',tp:'CST816S'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_1_85_C','spi'))),
  B('Waveshare','ESP32-S3-Touch-LCD-2.1','2.1"',480,480,Object.assign({r:1,lcd:'ST7701',tp:'CST816S'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_2_1','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-2.8','2.8"',240,320,Object.assign({lcd:'ST7789',tp:'CST328'},WS('ESP32-S3-Touch-LCD-2.8'))),
  B('Waveshare','ESP32-S3-Touch-LCD-2.8C','2.8"',480,480,Object.assign({r:1,lcd:'ST7701',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_2_8_C','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-3.5','3.5"',320,480,Object.assign({lcd:'ST7796',tp:'FT6336'},WS('ESP32-S3-Touch-LCD-3.5'))),
  B('Waveshare','ESP32-S3-Touch-LCD-4','4"',480,480,Object.assign({lcd:'ST7701',tp:'GT911'},WS('ESP32-S3-Touch-LCD-4'))),
  B('Waveshare','ESP32-S3-Touch-LCD-4.3','4.3"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_4_3','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-4.3B','4.3"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_4_3_B','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-5','5"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_5','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-5B','5"',1024,600,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_5_B','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-7','7"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_S3_TOUCH_LCD_7','rgb'))),
  B('Waveshare','ESP32-S3-Touch-LCD-7B','7"',1024,600,Object.assign({tp:'GT911'},WS('ESP32-S3-Touch-LCD-7B'))),
  B('Waveshare','ESP32-S3-LCD-1.47','1.47"',172,320,Object.assign({t:false,lcd:'ST7789'},WS('ESP32-S3-LCD-1.47'))),
  B('Waveshare','ESP32-C6-LCD-1.47','1.47"',172,320,{t:false,c:'ESP32-C6',lcd:'ST7789'}),
  B('Waveshare','ESP32-P4-Nano + 10.1" DSI','10.1"',800,1280,Object.assign({c:'ESP32-P4',lcd:'JD9365',tp:'GT911'},EP('BOARD_WAVESHARE_ESP32_P4_NANO','rgb'))),

  B('Elecrow','CrowPanel 7.0" HMI','7"',800,480,Object.assign({lcd:'EK9716B',tp:'GT911'},EP('BOARD_ELECROW_CROWPANEL_7_0','rgb'))),
  B('Elecrow','CrowPanel Advance 7.0"','7"',800,480,{tp:'GT911',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel Advance 5.0"','5"',800,480,{tp:'GT911',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel Advance 4.3"','4.3"',800,480,{tp:'GT911',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel Advance 3.5"','3.5"',320,480,{tp:'GT911',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel Advance 2.8"','2.8"',240,320,{tp:'FT6336U',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel Advance 2.4"','2.4"',240,320,{tp:'FT6336U',v:'web',src:SRC.elecrowAdv}),
  B('Elecrow','CrowPanel 5.0" HMI','5"',800,480,{}),
  B('Elecrow','CrowPanel 4.3" HMI','4.3"',480,272,{}),
  B('Elecrow','CrowPanel 3.5" HMI','3.5"',480,320,{c:'ESP32'}),
  B('Elecrow','CrowPanel 2.8" HMI','2.8"',320,240,{c:'ESP32'}),
  B('Elecrow','CrowPanel 2.4" HMI','2.4"',320,240,{c:'ESP32'}),
  B('Elecrow','CrowPanel 1.28" Rotary','1.28"',240,240,{r:1,c:'ESP32-C3',v:'web',src:'https://www.elecrow.com/crowpanel-1-28inch-hmi-esp32-rotary-display-240-240-ips-round-touch-knob-screen.html'}),
  B('Elecrow','CrowPanel 2.1" Rotary Knob','2.1"',480,480,{r:1,v:'web',src:'https://www.elecrow.com/crowpanel-2-1inch-hmi-esp32-rotary-display-480-480-ips-round-touch-knob-screen.html'}),

  B('LilyGO','T-Display','1.14"',240,135,{c:'ESP32',t:false,lcd:'ST7789V',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display-S3','1.9"',170,320,{t:false,lcd:'ST7789V',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display-S3 Touch','1.9"',170,320,{lcd:'ST7789V',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display-S3 AMOLED','1.91"',536,240,{p:'AMOLED',lcd:'RM67162',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display AMOLED Lite','1.47"',194,368,{p:'AMOLED',lcd:'SH8501B0',tp:'CHSC5816',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display-S3 Long','3.4"',180,640,{lcd:'AXS15231B',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display P4 TFT','4.05"',540,1168,{c:'ESP32-P4',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display P4 AMOLED','4.1"',568,1232,{c:'ESP32-P4',p:'AMOLED',v:'web',src:SRC.lilygo}),
  B('LilyGO','T-Display-S3 Pro','2.33"',222,480,{}),
  B('LilyGO','T-RGB 2.1"','2.1"',480,480,{r:1}),
  B('LilyGO','T-Deck','2.8"',320,240,{}),
  B('LilyGO','T-Watch S3','1.54"',240,240,{}),

  B('M5Stack','Core2','2"',320,240,Object.assign({c:'ESP32',lcd:'ILI9341',tp:'FT6336'},EP('BOARD_M5STACK_M5CORE2','spi'))),
  B('M5Stack','CoreS3','2"',320,240,Object.assign({lcd:'ILI9341',tp:'FT6336'},EP('BOARD_M5STACK_M5CORES3','spi'))),
  B('M5Stack','Dial','1.28"',240,240,Object.assign({r:1,lcd:'GC9A01',tp:'FT3267'},EP('BOARD_M5STACK_M5DIAL','spi'))),
  B('M5Stack','Tab5','5"',1280,720,{c:'ESP32-P4',tp:'GT911',v:'web',src:SRC.tab5}),
  B('M5Stack','Cardputer','1.14"',240,135,{t:false}),
  B('M5Stack','AtomS3','0.85"',128,128,{t:false}),
  B('M5Stack','PaperS3','4.7"',960,540,{p:'ePaper'}),

  B('Espressif','ESP32-S3-BOX-3','2.4"',320,240,Object.assign({lcd:'ILI9341',tp:'GT911'},EP('BOARD_ESPRESSIF_ESP32_S3_BOX_3','spi'))),
  B('Espressif','ESP32-S3-BOX','2.4"',320,240,Object.assign({lcd:'ST7789',tp:'TT21100'},EP('BOARD_ESPRESSIF_ESP32_S3_BOX','spi'))),
  B('Espressif','ESP32-S3-BOX-Lite','2.4"',320,240,Object.assign({t:false,lcd:'ST7789'},EP('BOARD_ESPRESSIF_ESP32_S3_BOX_LITE','spi'))),
  B('Espressif','ESP32-S3-Korvo-2','2.4"',320,240,Object.assign({lcd:'ST7789',tp:'TT21100'},EP('BOARD_ESPRESSIF_ESP32_S3_KORVO_2','spi'))),
  B('Espressif','ESP32-S3-EYE','1.3"',240,240,Object.assign({t:false,lcd:'ST7789'},EP('BOARD_ESPRESSIF_ESP32_S3_EYE','spi'))),
  B('Espressif','ESP32-S3-USB-OTG','1.3"',240,240,Object.assign({t:false,lcd:'ST7789'},EP('BOARD_ESPRESSIF_ESP32_S3_USB_OTG','spi'))),
  B('Espressif','ESP32-C3-LCDkit','1.28"',240,240,Object.assign({r:1,t:false,c:'ESP32-C3',lcd:'GC9A01'},EP('BOARD_ESPRESSIF_ESP32_C3_LCDKIT','spi'))),
  B('Espressif','ESP32-S3-LCD-EV-Board','3.95"',480,480,Object.assign({lcd:'GC9503',tp:'FT5x06'},EP('BOARD_ESPRESSIF_ESP32_S3_LCD_EV_BOARD','rgb'))),
  B('Espressif','ESP32-S3-LCD-EV-Board-2','4.3"',800,480,Object.assign({lcd:'ST7262',tp:'GT1151'},EP('BOARD_ESPRESSIF_ESP32_S3_LCD_EV_BOARD_2','rgb'))),
  B('Espressif','ESP32-P4-Function-EV-Board','7"',1024,600,Object.assign({c:'ESP32-P4',lcd:'EK79007',tp:'GT911'},EP('BOARD_ESPRESSIF_ESP32_P4_FUNCTION_EV_BOARD','rgb'))),

  B('Sunton (CYD)','ESP32-2432S028R','2.8"',240,320,Object.assign({c:'ESP32',tp:'XPT2046 (resistive)'},SD('esp32-2432S028R'))),
  B('Sunton (CYD)','ESP32-2432S028Rv3','2.8"',240,320,Object.assign({c:'ESP32',tp:'XPT2046 (resistive)'},SD('esp32-2432S028Rv3'))),
  B('Sunton (CYD)','ESP32-2432S022C','2.2"',240,320,Object.assign({c:'ESP32'},SD('esp32-2432S022C'))),
  B('Sunton (CYD)','ESP32-2432S024C','2.4"',240,320,Object.assign({c:'ESP32'},SD('esp32-2432S024C'))),
  B('Sunton (CYD)','ESP32-2432S032C','3.2"',240,320,Object.assign({c:'ESP32'},SD('esp32-2432S032C'))),
  B('Sunton (CYD)','ESP32-1732S019C','1.9"',170,320,SD('esp32-1732S019C')),
  B('Sunton (CYD)','ESP32-2424S012C','1.28"',240,240,Object.assign({r:1,c:'ESP32-C3'},SD('esp32-2424S012C'))),
  B('Sunton (CYD)','ESP32-3248S035C','3.5"',320,480,Object.assign({c:'ESP32'},SD('esp32-3248S035C'))),
  B('Sunton (CYD)','ESP32-4827S043C','4.3"',480,272,SD('esp32-4827S043C')),
  B('Sunton (CYD)','ESP32-4848S040C','4"',480,480,SD('esp32-4848S040CIY3')),
  B('Sunton (CYD)','ESP32-8048S043C','4.3"',800,480,SD('esp32-8048S043C')),
  B('Sunton (CYD)','ESP32-8048S050C','5"',800,480,SD('esp32-8048S050C')),
  B('Sunton (CYD)','ESP32-8048S070C','7"',800,480,SD('esp32-8048S070C')),

  B('Guition','JC2432W328C','2.8"',240,320,Object.assign({c:'ESP32'},SD('JC2432W328C'))),
  B('Guition','JC3248W535','3.5"',320,480,SD('JC3248W535N')),
  B('Guition','JC4827W543C','4.3"',480,272,SD('JC4827W543C')),
  B('Guition','JC8048W550C','5"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_JINGCAI_JC8048W550C','rgb'))),
  B('Guition','ESP32-4848S040C-I-Y-3','4"',480,480,Object.assign({lcd:'ST7701',tp:'GT911'},EP('BOARD_JINGCAI_ESP32_4848S040C_I_Y_3','rgb'))),
  B('Guition','JC1060P470','7"',1024,600,{c:'ESP32-P4'}),

  B('Viewe','UEDX80480070E-WB-A','7"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_VIEWE_UEDX80480070E_WB_A','rgb'))),
  B('Viewe','UEDX80480050E-WB-A','5"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_VIEWE_UEDX80480050E_WB_A','rgb'))),
  B('Viewe','UEDX80480043E-WB-A','4.3"',800,480,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_VIEWE_UEDX80480043E_WB_A','rgb'))),
  B('Viewe','UEDX48270043E-WB-A','4.3"',480,272,Object.assign({lcd:'ST7262',tp:'GT911'},EP('BOARD_VIEWE_UEDX48270043E_WB_A','rgb'))),
  B('Viewe','UEDX48480040E-WB-A','4"',480,480,Object.assign({lcd:'GC9503',tp:'FT5x06'},EP('BOARD_VIEWE_UEDX48480040E_WB_A','rgb'))),
  B('Viewe','UEDX48480028-MD80ET','2.8"',480,480,Object.assign({r:1,lcd:'GC9503',tp:'CST820'},EP('BOARD_VIEWE_UEDX48480028_MD80ET','rgb'))),
  B('Viewe','UEDX48480021-MD80ET','2.1"',480,480,Object.assign({r:1,lcd:'GC9503',tp:'CST820'},EP('BOARD_VIEWE_UEDX48480021_MD80ET','rgb'))),
  B('Viewe','UEDX32480035E-WB-A','3.5"',320,480,Object.assign({lcd:'ST7789',tp:'CHSC6540'},EP('BOARD_VIEWE_UEDX32480035E_WB_A','spi'))),
  B('Viewe','UEDX24320028E-WB-A','2.8"',240,320,Object.assign({tp:'CHSC6540'},EP('BOARD_VIEWE_UEDX24320028E_WB_A','spi'))),
  B('Viewe','UEDX24320024E-WB-A','2.4"',240,320,Object.assign({tp:'CHSC6540'},EP('BOARD_VIEWE_UEDX24320024E_WB_A','spi'))),
  B('Viewe','UEDX24240013-MD50E','1.3"',240,240,Object.assign({r:1,t:false,lcd:'GC9A01'},EP('BOARD_VIEWE_UEDX24240013_MD50E','spi'))),
  B('Viewe','UEDX46460015-MD50ET','1.5"',472,466,Object.assign({r:1,p:'AMOLED',lcd:'SH8601',tp:'CST820'},EP('BOARD_VIEWE_UEDX46460015_MD50ET','spi'))),
  B('Viewe','SmartRing','1.5"',472,466,Object.assign({r:1,p:'AMOLED',lcd:'SH8601',tp:'CST820'},EP('BOARD_VIEWE_SMARTRING','spi'))),

  B('Wireless-Tag','WTP4C5MP07S','7"',1024,600,Object.assign({c:'ESP32-P4',lcd:'EK79007',tp:'GT911'},EP('BOARD_WIRELESSTAG_WTP4C5MP07S','rgb'))),

  B('Seeed Studio','SenseCAP Indicator','4"',480,480,{}),
  B('Seeed Studio','XIAO Round Display','1.28"',240,240,{r:1}),
  B('Seeed Studio','Wio Terminal','2.4"',320,240,{c:'ATSAMD51',t:false}),
  B('Seeed Studio','reTerminal E1001','7.5"',800,480,{p:'ePaper',t:false,v:'web',src:SRC.seeedEpd}),
  B('Seeed Studio','reTerminal E1002','7.3"',800,480,{p:'ePaper',t:false,v:'web',src:SRC.seeedEpd}),
  B('Seeed Studio','reTerminal E1003','10.3"',1404,1872,{p:'ePaper',t:false,v:'web',src:SRC.seeedEpd}),

  B('Makerfabs','MaTouch 2.1" Rotary','2.1"',480,480,{r:1,lcd:'ST7701',v:'web',src:'https://www.elektor.com/matouch-esp32-s3-rotary-2-1-touch-display-st7701'}),
  B('Makerfabs','MaTouch 1.28" Round','1.28"',240,240,{r:1}),
  B('Makerfabs','MaTouch 3.5" Parallel','3.5"',480,320,{}),
  B('Makerfabs','MaTouch 7"','7"',1024,600,{}),

  B('Arduino','GIGA Display Shield','3.97"',800,480,{c:'STM32H747'}),
  B('Adafruit','PyPortal','3.2"',320,240,{c:'ATSAMD51'}),
  B('Adafruit','ESP32-S3 Reverse TFT Feather','1.14"',240,135,{t:false})
];

const VERIFY = {
  driver:{label:'Driver-verified',note:'Resolution, LCD and touch chips taken from Espressif\'s ESP32_Display_Panel board configs.'},
  cyd:{label:'Driver-verified',note:'Resolution taken from the board definitions used by the esp32-smartdisplay library.'},
  web:{label:'Maker-checked',note:'Resolution checked against the maker\'s product or wiki page.'},
  spec:{label:'Listed spec',note:'Not yet cross-checked against a primary source. Confirm before you ship.'}
};

function boardDims(b) { return b.rot === 90 ? {w: b.nh || b.h, h: b.nw || b.w} : {w: b.nw || b.w, h: b.nh || b.h}; }
function withRotation(b, rot) {
  const nw = b.nw || b.w, nh = b.nh || b.h;
  const r = Object.assign({}, b, {nw, nh, rot});
  if (rot === 90) { r.w = nh; r.h = nw; } else { r.w = nw; r.h = nh; }
  return r;
}

function box(W, H, round) {
  const u = Math.min(W, H) / 100;
  if (round) { const m = Math.min(W, H) * .16; return {x: m, y: m, w: W - 2 * m, h: H - 2 * m, u}; }
  const p = Math.max(10, u * 5);
  return {x: p, y: p, w: W - 2 * p, h: H - 2 * p, u};
}
function cells(x, y, w, h, cols, rows, gap) {
  const cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows, o = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) o.push({x: R(x + c * (cw + gap)), y: R(y + r * (ch + gap)), w: R(cw), h: R(ch)});
  return o;
}
function header(A, b, title, sub, opts) {
  opts = opts || {};
  const u = b.u, land = opts.land, th = R(u * (land ? 9 : 10));
  let x = b.x;
  if (opts.back) { const s = R(u * 9.5); A.push(['icon', {x: b.x, y: b.y + R((th - s) / 2), w: s, h: s, icon: 'left', fg: C.acc, onTap: opts.back}]); x = b.x + s + R(u * 2); }
  A.push(['label', {x, y: b.y, w: R(b.x + b.w - x - u * (opts.icon ? 12 : 0)), h: th, text: title, font: F(u * (land ? 7 : 8)), fg: C.ink}]);
  if (sub) A.push(['label', {x, y: b.y + th, w: R(b.x + b.w - x - u * (opts.icon ? 12 : 0)), h: R(u * 6), text: sub, font: F(u * (land ? 3.8 : 4.6)), fg: C.ink2}]);
  return b.y + th + R(u * (sub ? 9 : 4));
}
function settingsRows(A, b, top, items, land) {
  const u = b.u, gap = R(u * 2), avail = b.y + b.h - top;
  const n = clamp(Math.floor((avail + gap) / (u * (land ? 12 : 15) + gap)), 2, items.length);
  const rh = R((avail - gap * (n - 1)) / n);
  items.slice(0, n).forEach((it, i) => {
    const y = top + i * (rh + gap), p = R(u * 3);
    A.push(['panel', {x: b.x, y, w: R(b.w), h: rh, radius: R(Math.min(rh / 2.6, u * 5)), shadow: false}]);
    const isz = R(rh * .5);
    A.push(['icon', {x: b.x + p, y: y + R((rh - isz) / 2), w: isz, h: isz, icon: it[1], fg: it[3] || C.acc}]);
    A.push(['label', {x: b.x + p + isz + R(u * 2.5), y, w: R(b.w * .55), h: rh, text: it[0], font: F(Math.min(rh * .36, u * (land ? 4.4 : 5))), fg: C.ink}]);
    const sh = R(Math.min(rh * .55, u * (land ? 7 : 8))), sw = R(sh * 1.75);
    A.push(['switch', {x: R(b.x + b.w - p - sw), y: y + R((rh - sh) / 2), w: sw, h: sh, checked: it[2]}]);
  });
}

const TPL = {
  home:{n:'Smart Home',d:'Dashboard, lights and settings with live navigation',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.25;
    const A=[];const top=header(A,b,'Good evening','5 devices on',{land,icon:1});const isz=R(u*10);A.push(['icon',{x:R(b.x+b.w-isz),y:b.y,w:isz,h:isz,icon:'settings',fg:C.ink2,onTap:'@Settings'}]);
    const cols=land?3:2,rows=land||rd?1:2,cs=cells(b.x,top,b.w,b.y+b.h-top,cols,rows,R(u*3)).slice(0,rd?2:6),p=R(u*3.2);
    let c=cs[0];A.push(['panel',{...c,radius:R(u*5)}]);A.push(['label',{x:c.x+p,y:c.y+p,w:c.w-2*p,h:R(u*6),text:'Climate',font:F(u*4),fg:C.ink2}]);
    let s=R(Math.min(c.w-2*p,c.h-p*2-u*8)*.9);A.push(['arc',{x:R(c.x+(c.w-s)/2),y:R(c.y+p+u*7+(c.h-p*2-u*7-s)/2),w:s,h:s,value:22,min:16,max:30,accent:C.orange,thick:R(s*.09),font:F(s*.24)}]);
    c=cs[1];A.push(['panel',{...c,radius:R(u*5),onTap:'@Lights'}]);const ic=R(u*(land?9:10));A.push(['icon',{x:c.x+p,y:c.y+p,w:ic,h:ic,icon:'charge',fg:C.orange}]);
    const sh=R(u*(land?6.5:7)),sw=R(sh*1.75);A.push(['switch',{x:c.x+c.w-p-sw,y:c.y+p,w:sw,h:sh,checked:true}]);
    A.push(['label',{x:c.x+p,y:R(c.y+c.h-p-u*13),w:c.w-2*p,h:R(u*7),text:'Lights',font:F(u*5),fg:C.ink}]);A.push(['label',{x:c.x+p,y:R(c.y+c.h-p-u*6),w:c.w-2*p,h:R(u*6),text:'4 of 6 on',font:F(u*3.8),fg:C.ink2}]);
    c=cs[2];if(c){A.push(['panel',{...c,radius:R(u*5)}]);A.push(['label',{x:c.x+p,y:c.y+p,w:c.w-2*p,h:R(u*6),text:'Energy today',font:F(u*4),fg:C.ink2}]);
    A.push(['label',{x:c.x+p,y:R(c.y+p+u*6),w:c.w-2*p,h:R(u*9),text:'12.4 kWh',font:F(u*6.5),fg:C.ink}]);
    const chy=R(c.y+p+u*17);A.push(['chart',{x:c.x+p,y:chy,w:c.w-2*p,h:Math.max(20,R(c.y+c.h-p-chy)),bg:C.card,radius:0,accent:C.green,data:'4,6,5,9,7,11,10,13'}]);}
    if(cs[3]){c=cs[3];A.push(['panel',{...c,radius:R(u*5)}]);A.push(['label',{x:c.x+p,y:c.y+p,w:c.w-2*p,h:R(u*6),text:'Now playing',font:F(u*4),fg:C.ink2}]);
      A.push(['label',{x:c.x+p,y:R(c.y+p+u*6),w:c.w-2*p,h:R(u*8),text:'Lo-fi Beats',font:F(u*5),fg:C.ink}]);const k=R(u*9),gy=R(c.y+c.h-p-k),gx=R(c.x+(c.w-k*3-u*6)/2);
      ['prev','play','next'].forEach((n,i)=>A.push(['icon',{x:R(gx+i*(k+u*3)),y:gy,w:k,h:k,icon:n,fg:n=='play'?C.acc:C.ink}]))}
    const L=[];const t2=header(L,b,'Lights','Tap a room to switch it',{land,back:'@Home'});const rs=cells(b.x,t2,b.w,b.y+b.h-t2-u*16,land?2:1,land?2:3,R(u*2.5));
    ['Living room','Bedroom','Kitchen','Office'].slice(0,rs.length).forEach((n,i)=>{const c=rs[i];L.push(['panel',{...c,radius:R(Math.min(c.h/2.8,u*5))}]);L.push(['label',{x:c.x+p,y:c.y,w:R(c.w*.6),h:c.h,text:n,font:F(Math.min(c.h*.32,u*4.8)),fg:C.ink}]);
      const sh2=R(Math.min(c.h*.5,u*7.5)),sw2=R(sh2*1.75);L.push(['switch',{x:c.x+c.w-p-sw2,y:R(c.y+(c.h-sh2)/2),w:sw2,h:sh2,checked:i!=1}])});
    L.push(['label',{x:b.x,y:R(b.y+b.h-u*12),w:R(b.w*.5),h:R(u*6),text:'Brightness',font:F(u*4),fg:C.ink2}]);L.push(['slider',{x:R(b.x+u*2),y:R(b.y+b.h-u*4),w:R(b.w-u*4),h:R(u*2.4),value:72,accent:C.orange}]);
    const S=[];const t3=header(S,b,'Settings',null,{land,back:'@Home'});settingsRows(S,b,t3,[['Wi-Fi','wifi',true],['Bluetooth','bluetooth',true,'#2F6BFF'],['Notifications','bell',false,C.red],['Auto brightness','eye',true,C.orange],['Sounds','volume',false,C.pink]],land);
    return[{name:'Home',w:A},{name:'Lights',w:L},{name:'Settings',w:S}]}},
  thermostat:{n:'Thermostat',d:'Big arc dial with plus and minus',build(W,H,rd){const b=box(W,H,rd),u=b.u,A=[];
    const lh=R(u*7);A.push(['label',{x:b.x,y:b.y,w:R(b.w),h:lh,text:'Living room',font:F(u*5),fg:C.ink2,align:'center'}]);
    const k=R(u*13);const s=R(Math.min(b.w,b.h-lh-k*.6)*.94);const ax=R(b.x+(b.w-s)/2),ay=R(b.y+lh+u*1);
    A.push(['arc',{x:ax,y:ay,w:s,h:s,value:22,min:16,max:30,accent:C.orange,thick:R(s*.07),font:F(s*.26)}]);
    A.push(['label',{x:ax,y:R(ay+s*.64),w:s,h:R(u*6),text:'Heating',font:F(u*4),fg:'#C2410C',align:'center'}]);
    const by=R(ay+s-k*.55);A.push(['button',{x:R(ax+s*.12-k/2),y:by,w:k,h:k,radius:R(k/2),text:'-',bg:C.card,fg:C.ink,font:F(k*.5)}]);
    A.push(['button',{x:R(ax+s*.88-k/2),y:by,w:k,h:k,radius:R(k/2),text:'+',bg:C.card,fg:C.ink,font:F(k*.5)}]);
    return[{name:'Thermostat',w:A}]}},
  weather:{n:'Weather',d:'Today, sun and a 4-day forecast',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.25,A=[];
    A.push(['label',{x:b.x,y:b.y,w:R(b.w*.6),h:R(u*7),text:'Today',font:F(u*4.6),fg:C.ink2}]);
    const sun=R(u*(land?22:24));A.push(['panel',{x:R(b.x+b.w-sun),y:b.y,w:sun,h:sun,radius:R(sun/2),bg:C.orange,shadow:false}]);
    A.push(['label',{x:b.x,y:R(b.y+u*7),w:R(b.w*.6),h:R(u*16),text:'28 C',font:F(u*14),fg:C.ink}]);
    A.push(['label',{x:b.x,y:R(b.y+u*23),w:R(b.w*.7),h:R(u*6),text:'Partly sunny - feels like 31',font:F(u*3.8),fg:C.ink2}]);
    const top=R(b.y+u*33),fh=R(Math.min(u*30,b.y+b.h-top-u*12));const fc=cells(b.x,top,b.w,fh,4,1,R(u*2));
    [['Fri','29 / 21'],['Sat','30 / 22'],['Sun','27 / 20'],['Mon','26 / 19']].forEach((d,i)=>{const c=fc[i];A.push(['panel',{...c,radius:R(u*4)}]);A.push(['label',{x:c.x,y:R(c.y+c.h*.18),w:c.w,h:R(c.h*.3),text:d[0],font:F(Math.min(u*4,c.w*.18)),fg:C.ink2,align:'center'}]);A.push(['label',{x:c.x,y:R(c.y+c.h*.5),w:c.w,h:R(c.h*.32),text:d[1],font:F(Math.min(u*4,c.w*.15)),fg:C.ink,align:'center'}])});
    const hy=R(top+fh+u*4);A.push(['label',{x:b.x,y:hy,w:R(b.w*.5),h:R(u*5),text:'Humidity 62%',font:F(u*3.8),fg:C.ink2}]);A.push(['bar',{x:b.x,y:R(hy+u*6.5),w:R(b.w),h:R(u*2.4),value:62,accent:'#32ADE6',radius:R(u*1.2)}]);
    return[{name:'Weather',w:A}]}},
  music:{n:'Music Player',d:'Artwork, progress and transport controls',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.2,A=[];
    let ax,ay,s,tx,ty,tw;if(land){s=R(Math.min(b.h,b.w*.42));ax=b.x;ay=R(b.y+(b.h-s)/2);tx=R(ax+s+u*6);tw=R(b.x+b.w-tx);ty=R(b.y+b.h*.12)}else{s=R(Math.min(b.w*.8,b.h*.42));ax=R(b.x+(b.w-s)/2);ay=b.y;tx=b.x;tw=R(b.w);ty=R(ay+s+u*5)}
    A.push(['panel',{x:ax,y:ay,w:s,h:s,radius:R(s*.12),bg:C.pink}]);const ik=R(s*.34);A.push(['icon',{x:R(ax+(s-ik)/2),y:R(ay+(s-ik)/2),w:ik,h:ik,icon:'audio',fg:'#FFFFFF'}]);
    A.push(['label',{x:tx,y:ty,w:tw,h:R(u*9),text:'Midnight Drive',font:F(u*6.5),fg:C.ink,align:land?'left':'center'}]);
    A.push(['label',{x:tx,y:R(ty+u*9),w:tw,h:R(u*6),text:'Next Builder',font:F(u*4.2),fg:C.ink2,align:land?'left':'center'}]);
    const sy=R(ty+u*20);A.push(['slider',{x:R(tx+u),y:sy,w:R(tw-u*2),h:R(u*1.8),value:35,accent:C.ink}]);
    A.push(['label',{x:tx,y:R(sy+u*3),w:R(tw/2),h:R(u*5),text:'1:12',font:F(u*3.4),fg:C.ink2}]);A.push(['label',{x:R(tx+tw/2),y:R(sy+u*3),w:R(tw/2),h:R(u*5),text:'3:45',font:F(u*3.4),fg:C.ink2,align:'right'}]);
    const k=R(u*(land?11:13)),cy=R(sy+u*11),cx=R(tx+tw/2);A.push(['icon',{x:R(cx-k*2.2),y:R(cy+k*.18),w:R(k*.64),h:R(k*.64),icon:'prev',fg:C.ink}]);
    A.push(['panel',{x:R(cx-k/2),y:cy,w:k,h:k,radius:R(k/2),bg:C.ink,shadow:false}]);A.push(['icon',{x:R(cx-k*.22),y:R(cy+k*.28),w:R(k*.44),h:R(k*.44),icon:'pause',fg:'#FFFFFF'}]);
    A.push(['icon',{x:R(cx+k*1.56),y:R(cy+k*.18),w:R(k*.64),h:R(k*.64),icon:'next',fg:C.ink}]);
    return[{name:'Player',w:A}]}},
  fitness:{n:'Activity Rings',d:'Three concentric rings with goals',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.25,A=[];
    const s=R(rd?b.w*.56:land?Math.min(b.h,b.w*.5):Math.min(b.w,b.h*.62)),ox=land?b.x:R(b.x+(b.w-s)/2),oy=land?R(b.y+(b.h-s)/2):b.y,t=R(s*.1);
    [['#FA114F',1,72,'#3D0A18'],['#92E82A',.74,54,'#22340B'],['#1EEAEF',.48,88,'#0A3637']].forEach(([c,f,v,tr])=>{const z=R(s*f);A.push(['arc',{x:R(ox+(s-z)/2),y:R(oy+(s-z)/2),w:z,h:z,value:v,accent:c,bg:tr,thick:t,showValue:false}])});
    const lx=land?R(ox+s+u*7):b.x,ly=land?R(b.y+b.h*.14):R(oy+s+u*5),lw=land?R(b.x+b.w-lx):R(b.w);
    if(rd){[['430 / 600 CAL','#FA114F'],['16 / 30 MIN','#5CC51C'],['7 / 8 HRS','#0FB5BA']].forEach((r,i)=>A.push(['label',{x:b.x,y:R(oy+s+u*4+i*u*7),w:R(b.w),h:R(u*6.5),text:r[0],font:F(u*5),fg:r[1],align:'center'}]));return[{name:'Activity',bg:'#000000',w:A}]}
    [['Move','430 / 600 CAL','#FA114F'],['Exercise','16 / 30 MIN','#5CC51C'],['Stand','7 / 8 HRS','#0FB5BA']].forEach((r,i)=>{const yy=R(ly+i*u*(land?16:12));A.push(['label',{x:lx,y:yy,w:lw,h:R(u*5),text:r[0],font:F(u*4),fg:'#8D93A1',align:land?'left':'center'}]);A.push(['label',{x:lx,y:R(yy+u*5),w:lw,h:R(u*(land?8:6.5)),text:r[1],font:F(u*(land?6:5)),fg:r[2],align:land?'left':'center'}])});
    return[{name:'Activity',bg:'#000000',w:A}]}},
  energy:{n:'Energy Monitor',d:'Stat cards, live chart and battery',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.25,A=[];const top=header(A,b,'Energy','Live from your inverter',{land});
    const p=R(u*3),cw=(b.w-2*R(u*2.5))/3,cf=F(Math.min(u*3.8,cw*.14)),vf=F(Math.min(u*6,cw*.2)),ch=Math.max(R(u*5),LH[cf]),vh=Math.max(R(u*8),LH[vf]);
    const sh=Math.max(R(u*(land?20:18)),2*p+ch+vh+2),sc=cells(b.x,top,b.w,sh,3,1,R(u*2.5));
    [['Solar','3.2 kW','#B45309'],['Usage','1.8 kW',C.acc],['Battery','76%','#15803D']].forEach((d,i)=>{const c=sc[i];A.push(['panel',{...c,radius:R(u*4.5)}]);A.push(['label',{x:c.x+p,y:c.y+p,w:c.w-2*p,h:ch,text:d[0],font:cf,fg:C.ink2}]);A.push(['label',{x:c.x+p,y:R(c.y+c.h-p-vh),w:c.w-2*p,h:vh,text:d[1],font:vf,fg:d[2]}])});
    const cy=R(top+sh+u*3),chh=R(b.y+b.h-cy);A.push(['panel',{x:b.x,y:cy,w:R(b.w),h:chh,radius:R(u*4.5)}]);A.push(['label',{x:b.x+p,y:cy+p,w:R(b.w*.6),h:R(u*5),text:'Last 12 hours',font:F(u*3.8),fg:C.ink2}]);
    A.push(['chart',{x:b.x+p,y:R(cy+p+u*7),w:R(b.w-2*p),h:Math.max(24,R(chh-p*2-u*7)),radius:0,accent:C.orange,data:'1,2,4,7,9,10,11,10,8,6,3,2'}]);
    return[{name:'Energy',w:A}]}},
  settings:{n:'Settings List',d:'iOS-style rows with icons and switches',build(W,H,rd){const b=box(W,H,rd),u=b.u,land=W>H*1.25,A=[];const top=header(A,b,'Settings',null,{land});
    settingsRows(A,b,top,[['Wi-Fi','wifi',true],['Bluetooth','bluetooth',true,'#2F6BFF'],['Notifications','bell',false,C.red],['Auto brightness','eye',true,C.orange],['Sounds','volume',false,C.pink],['Location','gps',true,C.green]],land);
    return[{name:'Settings',w:A}]}},
  lock:{n:'Door Keypad',d:'PIN pad with status LED',build(W,H,rd){const b=box(W,H,rd),u=b.u,A=[];const land=W>H*1.25;
    const kw=land?R(b.w*.5):R(b.w),kx=land?R(b.x+b.w-kw):b.x;
    const lx=land?b.x:b.x,lw=land?R(b.w*.44):R(b.w);
    A.push(['label',{x:lx,y:b.y,w:lw,h:R(u*9),text:'Front door',font:F(u*(land?7:6.5)),fg:C.ink,align:land?'left':'center'}]);
    A.push(['label',{x:lx,y:R(b.y+u*9),w:lw,h:R(u*6),text:'Enter your PIN',font:F(u*4),fg:C.ink2,align:land?'left':'center'}]);
    const ld=R(u*5);A.push(['led',{x:land?lx:R(b.x+b.w/2-ld/2),y:R(b.y+u*17),w:ld,h:ld,accent:C.red,checked:true}]);
    const top=land?b.y:R(b.y+u*26),kh=R(b.y+b.h-top),ks=cells(kx,top,kw,kh,3,4,R(u*2.2));
    ['1','2','3','4','5','6','7','8','9','C','0','OK'].forEach((t,i)=>{const c=ks[i];A.push(['button',{...c,text:t,radius:R(Math.min(c.w,c.h)*.3),bg:t=='OK'?'#15803D':t=='C'?C.track:C.card,fg:t=='OK'?'#FFFFFF':C.ink,font:F(Math.min(c.h*.4,u*7))}])});
    return[{name:'Keypad',w:A}]}}
};

function blank(board) { return {v: 2, name: 'Untitled UI', board, cur: null, seq: 0, counts: {}, screens: [], lvgl: 9, updated: Date.now()}; }
const nameKey = n => ident(n).toLowerCase();
function uniqueName(p, n) {
  n = String(n).replace(/[^A-Za-z0-9 _-]/g, '').trim() || 'Screen';
  let k = n, i = 2;
  while (p.screens.some(s => nameKey(s.name) == nameKey(k))) k = n + ' ' + i++;
  return k;
}
function uniqueWidgetName(s, n, self) {
  const base = String(n).replace(/[^A-Za-z0-9_]/g, '') || 'Widget';
  const taken = k => s.widgets.some(w => w !== self && nameKey(w.name) == nameKey(k));
  if (!taken(base)) return base;
  const stem = base.replace(/\d+$/, '') || 'Widget';
  let i = 2;
  while (taken(stem + i)) i++;
  return stem + i;
}
function mkW(p, type, props) {
  const t = TYPES[type];
  if (!t) return null;
  p.counts[type] = (p.counts[type] || 0) + 1;
  const w = Object.assign({id: 'w' + (++p.seq), type, name: t.n.replace(/\W/g, '') + p.counts[type], x: 0, y: 0, opacity: 100, hidden: false, locked: false}, JSON.parse(JSON.stringify(t.d)), props || {});
  for (const k of ['x', 'y', 'w', 'h']) w[k] = R(w[k]);
  if (w.font) w.font = F(w.font);
  if (props && props.name) w.name = String(props.name).replace(/[^A-Za-z0-9_]/g, '') || w.name;
  return w;
}
function mkScreen(p, name, bg) {
  const s = {id: 's' + (++p.seq), name: uniqueName(p, name || 'Screen'), bg: bg || C.bg, widgets: []};
  p.screens.push(s);
  return s;
}
function fitWidget(w) {
  const room = w.type == 'button' ? w.w - 12 : w.type == 'checkbox' ? w.w - w.font * 1.7 : w.type == 'arc' ? (w.w - 2 * (w.thick || 0)) * .78 : w.w - (hasBg(w) ? 16 : 0);
  const text = w.type == 'arc' ? String(R(w.value)) : String(w.text || '');
  const lines = text.split('\n');
  const fits = f => Math.max(...lines.map(l => measureText(f, l) * 1.04)) <= room && (w.type != 'label' || LH[f] * lines.length <= w.h + 2) && (w.type != 'button' || LH[f] <= w.h);
  let i = FONTS.indexOf(w.font);
  while (i > 0 && !fits(FONTS[i])) i--;
  w.font = FONTS[i];
}
function fitTemplate(ws) { ws.forEach(w => { if ((w.type == 'label' || w.type == 'button' || w.type == 'checkbox') && w.text) fitWidget(w); if (w.type == 'arc' && w.showValue) fitWidget(w); }); }
function roundFit(w, W, H) {
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 2;
  for (let i = 0; i < 80; i++) {
    const far = [[w.x, w.y], [w.x + w.w, w.y], [w.x, w.y + w.h], [w.x + w.w, w.y + w.h]].some(([x, y]) => Math.hypot(x - cx, y - cy) > r);
    if (!far) return true;
    const mx = w.x + w.w / 2, my = w.y + w.h / 2;
    w.x = R(w.x + (cx - mx) * .08); w.y = R(w.y + (cy - my) * .08);
    if (i > 20) { const nw = Math.max(8, R(w.w * .96)), nh = Math.max(8, R(w.h * .96)); w.x += R((w.w - nw) / 2); w.y += R((w.h - nh) / 2); w.w = nw; w.h = nh; if (SQUARE[w.type]) w.h = w.w; }
  }
  return false;
}
function addTemplate(p, key, W, H, rd) {
  const out = TPL[key].build(W, H, rd);
  const made = out.map(o => ({o, s: mkScreen(p, o.name, o.bg)}));
  const map = {};
  made.forEach(m => map['@' + m.o.name] = m.s.id);
  made.forEach(m => {
    m.s.widgets = m.o.w.map(([t, pr]) => {
      const tap = pr.onTap;
      const w = mkW(p, t, Object.assign({}, pr, {onTap: null}));
      if (tap && map[tap]) w.onTap = {to: map[tap], anim: 'move_left'};
      return w;
    });
    fitTemplate(m.s.widgets);
    if (rd) m.s.widgets.forEach(w => { if (w.type != 'panel') roundFit(w, W, H); });
  });
  return made.map(m => m.s);
}
function defaultProject() {
  const b = BOARDS.find(x => x.name == 'ESP32-S3-Touch-LCD-4.3');
  const p = blank(b);
  p.name = 'Smart Home Panel';
  const ss = addTemplate(p, 'home', b.w, b.h, b.round);
  p.cur = ss[0].id;
  return p;
}

const nums = s => String(s || '').split(/[,\s]+/).filter(x => x !== '').map(Number).filter(n => isFinite(n)).slice(0, 64).map(R);
const sid = s => parseInt(String(s).slice(1), 10) || 0;
const ident = s => String(s).replace(/[^A-Za-z0-9_]/g, '_').replace(/^(\d)/, '_$1');
const hexv = c => (c && c[0] == '#' ? c.slice(1, 7) : '000000').toUpperCase();
const hx = c => '0x' + hexv(c);
const cstr = s => JSON.stringify(String(s == null ? '' : s));
function iconFont(w) { const m = Math.min(w.w, w.h); let f = 12; for (const s of FONTS) if (LH[s] <= m) f = s; return f; }
function padOf(w) {
  if (w.type === 'icon') return Math.max(0, Math.floor((w.h - LH[iconFont(w)]) / 2));
  if (w.type === 'label' && w.valign === 'center') return Math.max(0, Math.floor((w.h - LH[w.font]) / 2));
  if (w.type === 'label' && w.valign === 'bottom') return Math.max(0, w.h - LH[w.font]);
  return 0;
}
const opaOf = w => Math.floor((255 * w.opacity + 50) / 100);
const hasBg = w => w.bg && w.bg !== 'transparent';
const alignIdx = a => a === 'center' ? 1 : a === 'right' ? 2 : 0;
function tapOf(P, w) { const t = w.onTap && w.onTap.to && P.screens.find(x => x.id == w.onTap.to); return t && TAPPABLE[w.type] ? t : null; }

function esc(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, ''); }
function scriptWidget(P, w) {
  const L = [['W', w.type, sid(w.id), w.x, w.y, w.w, w.h].join('\t')];
  const p = (k, v) => L.push('P\t' + k + '\t' + v);
  const t = w.type;
  if ('text' in w && (t == 'label' || t == 'button' || t == 'checkbox')) p('text', esc(w.text));
  if (t == 'dropdown') p('options', esc(w.options));
  if (t == 'chart') p('data', nums(w.data).join(','));
  if (t == 'icon') { p('icon', w.icon); p('font', iconFont(w)); }
  else if (w.font) p('font', w.font);
  if (w.fg) p('fg', hexv(w.fg));
  if (t == 'label') { if (hasBg(w)) p('bg', hexv(w.bg)); }
  else if (w.bg && w.bg !== 'transparent') p('bg', hexv(w.bg));
  if (w.accent) p('accent', hexv(w.accent));
  if (w.borderColor) p('borderColor', hexv(w.borderColor));
  if (t == 'label') p('align', alignIdx(w.align));
  const pad = padOf(w); if (pad) p('pad', pad);
  for (const k of ['radius', 'thick', 'border', 'value', 'min', 'max']) if (w[k] != null) p(k, R(+w[k]));
  for (const k of ['checked', 'showValue', 'shadow']) if (w[k] != null) p(k, w[k] ? 1 : 0);
  p('opacity', R(w.opacity == null ? 100 : w.opacity));
  if (w.hidden) p('hidden', 1);
  const tg = tapOf(P, w);
  if (tg) { p('tapTo', sid(tg.id)); p('tapAnim', animIndex(w.onTap.anim)); }
  L.push('E');
  return L.join('\n');
}
function scriptScreen(P, s) { return ['S\t' + sid(s.id) + '\t' + hexv(s.bg), ...s.widgets.map(w => scriptWidget(P, w))].join('\n'); }
function toScript(P, opts) {
  opts = opts || {};
  const L = [];
  if (opts.reset !== false) L.push('X');
  for (const s of P.screens) L.push(scriptScreen(P, s));
  const cur = P.screens.find(s => s.id == P.cur) || P.screens[0];
  if (cur) L.push('L\t' + sid(cur.id));
  return L.join('\n') + '\n';
}

function vname(s, w) { return 'ui_' + ident(s.name) + '_' + ident(w.name); }
function genC(P, opt) {
  opt = opt || {};
  const lv = opt.lvgl || P.lvgl || 9, v8 = lv === 8;
  const API = v8 ? {btn:'lv_btn_create',rmflag:'lv_obj_clear_flag',load:'lv_scr_load',loadAnim:'lv_scr_load_anim',ofsY:'lv_obj_set_style_shadow_ofs_y'} : {btn:'lv_button_create',rmflag:'lv_obj_remove_flag',load:'lv_screen_load',loadAnim:'lv_screen_load_anim',ofsY:'lv_obj_set_style_shadow_offset_y'};
  const out = [], decl = [], evs = [];
  const anyArcLabel = P.screens.some(s => s.widgets.some(w => w.type == 'arc' && w.showValue));
  P.screens.forEach(s => { decl.push('lv_obj_t * ui_' + ident(s.name) + ';'); s.widgets.forEach(w => decl.push('lv_obj_t * ' + vname(s, w) + ';')); });
  if (anyArcLabel) evs.push('static void ui_arc_value_cb(lv_event_t * e)', '{', '    lv_obj_t * arc = (lv_obj_t *)lv_event_get_target(e);', '    lv_obj_t * label = (lv_obj_t *)lv_event_get_user_data(e);', '    lv_label_set_text_fmt(label, "%d", (int)lv_arc_get_value(arc));', '}', '');
  const font = f => '&lv_font_montserrat_' + f;
  const fns = P.screens.map(s => {
    const L = [], sv = 'ui_' + ident(s.name);
    L.push('void ' + sv + '_create(void)', '{', '    ' + sv + ' = lv_obj_create(NULL);', '    ' + API.rmflag + '(' + sv + ', LV_OBJ_FLAG_SCROLLABLE);', '    lv_obj_set_style_bg_color(' + sv + ', lv_color_hex(' + hx(s.bg) + '), 0);', '    lv_obj_set_style_bg_opa(' + sv + ', LV_OPA_COVER, 0);');
    s.widgets.forEach(w => {
      const v = vname(s, w), A = x => L.push('    ' + x);
      L.push('');
      switch (w.type) {
        case 'label':
          A(v + ' = lv_label_create(' + sv + ');'); A('lv_label_set_text(' + v + ', ' + cstr(w.text) + ');'); A('lv_obj_set_style_text_color(' + v + ', lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + ', ' + font(w.font) + ', 0);');
          if (w.align == 'center' || w.align == 'right') A('lv_obj_set_style_text_align(' + v + ', LV_TEXT_ALIGN_' + w.align.toUpperCase() + ', 0);');
          if (padOf(w)) A('lv_obj_set_style_pad_top(' + v + ', ' + padOf(w) + ', 0);');
          if (hasBg(w)) { A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), 0);'); A('lv_obj_set_style_bg_opa(' + v + ', LV_OPA_COVER, 0);'); A('lv_obj_set_style_radius(' + v + ', ' + (w.radius || 0) + ', 0);'); A('lv_obj_set_style_pad_hor(' + v + ', 8, 0);'); }
          break;
        case 'button':
          A(v + ' = ' + API.btn + '(' + sv + ');'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), 0);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', 0);'); A('lv_obj_set_style_shadow_width(' + v + ', 0, 0);');
          A('lv_obj_t * ' + v + '_label = lv_label_create(' + v + ');'); A('lv_label_set_text(' + v + '_label, ' + cstr(w.text) + ');'); A('lv_obj_set_style_text_color(' + v + '_label, lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + '_label, ' + font(w.font) + ', 0);'); A('lv_obj_center(' + v + '_label);');
          break;
        case 'panel':
          A(v + ' = lv_obj_create(' + sv + ');'); A(API.rmflag + '(' + v + ', LV_OBJ_FLAG_SCROLLABLE);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), 0);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', 0);'); A('lv_obj_set_style_pad_all(' + v + ', 0, 0);');
          A('lv_obj_set_style_border_width(' + v + ', ' + (w.border || 0) + ', 0);'); if (w.border) A('lv_obj_set_style_border_color(' + v + ', lv_color_hex(' + hx(w.borderColor) + '), 0);');
          if (w.shadow) { A('lv_obj_set_style_shadow_width(' + v + ', 24, 0);'); A(API.ofsY + '(' + v + ', 6, 0);'); A('lv_obj_set_style_shadow_color(' + v + ', lv_color_hex(0x101828), 0);'); A('lv_obj_set_style_shadow_opa(' + v + ', 20, 0);'); }
          else A('lv_obj_set_style_shadow_width(' + v + ', 0, 0);');
          break;
        case 'switch':
          A(v + ' = lv_switch_create(' + sv + ');'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), LV_PART_MAIN);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR | LV_STATE_CHECKED);'); if (w.checked) A('lv_obj_add_state(' + v + ', LV_STATE_CHECKED);');
          break;
        case 'slider':
          A(v + ' = lv_slider_create(' + sv + ');'); A('lv_slider_set_range(' + v + ', ' + w.min + ', ' + w.max + ');'); A('lv_slider_set_value(' + v + ', ' + R(w.value) + ', LV_ANIM_OFF);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), LV_PART_MAIN);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(0xFFFFFF), LV_PART_KNOB);');
          break;
        case 'bar':
          A(v + ' = lv_bar_create(' + sv + ');'); A('lv_bar_set_range(' + v + ', ' + w.min + ', ' + w.max + ');'); A('lv_bar_set_value(' + v + ', ' + R(w.value) + ', LV_ANIM_OFF);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), LV_PART_MAIN);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', LV_PART_MAIN);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', LV_PART_INDICATOR);');
          break;
        case 'arc':
          A(v + ' = lv_arc_create(' + sv + ');'); A('lv_arc_set_rotation(' + v + ', 135);'); A('lv_arc_set_bg_angles(' + v + ', 0, 270);'); A('lv_arc_set_range(' + v + ', ' + w.min + ', ' + w.max + ');'); A('lv_arc_set_value(' + v + ', ' + R(w.value) + ');'); A('lv_obj_remove_style(' + v + ', NULL, LV_PART_KNOB);');
          A('lv_obj_set_style_arc_width(' + v + ', ' + w.thick + ', LV_PART_MAIN);'); A('lv_obj_set_style_arc_width(' + v + ', ' + w.thick + ', LV_PART_INDICATOR);'); A('lv_obj_set_style_arc_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), LV_PART_MAIN);'); A('lv_obj_set_style_arc_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR);');
          if (w.showValue) { A('lv_obj_t * ' + v + '_value = lv_label_create(' + v + ');'); A('lv_label_set_text_fmt(' + v + '_value, "%d", ' + R(w.value) + ');'); A('lv_obj_set_style_text_color(' + v + '_value, lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + '_value, ' + font(w.font) + ', 0);'); A('lv_obj_center(' + v + '_value);'); A('lv_obj_add_event_cb(' + v + ', ui_arc_value_cb, LV_EVENT_VALUE_CHANGED, ' + v + '_value);'); }
          break;
        case 'checkbox':
          A(v + ' = lv_checkbox_create(' + sv + ');'); A('lv_checkbox_set_text(' + v + ', ' + cstr(w.text) + ');'); A('lv_obj_set_style_text_color(' + v + ', lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + ', ' + font(w.font) + ', 0);'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR | LV_STATE_CHECKED);'); A('lv_obj_set_style_border_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR | LV_STATE_CHECKED);'); if (w.checked) A('lv_obj_add_state(' + v + ', LV_STATE_CHECKED);');
          break;
        case 'icon':
          A(v + ' = lv_label_create(' + sv + ');'); A('lv_label_set_text(' + v + ', ' + SYMBOL_NAME(w.icon) + ');'); A('lv_obj_set_style_text_color(' + v + ', lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + ', ' + font(iconFont(w)) + ', 0);'); A('lv_obj_set_style_text_align(' + v + ', LV_TEXT_ALIGN_CENTER, 0);'); if (padOf(w)) A('lv_obj_set_style_pad_top(' + v + ', ' + padOf(w) + ', 0);');
          break;
        case 'dropdown':
          A(v + ' = lv_dropdown_create(' + sv + ');'); A('lv_dropdown_set_options(' + v + ', ' + cstr(w.options) + ');'); A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), 0);'); A('lv_obj_set_style_text_color(' + v + ', lv_color_hex(' + hx(w.fg) + '), 0);'); A('lv_obj_set_style_text_font(' + v + ', ' + font(w.font) + ', 0);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', 0);');
          break;
        case 'chart': {
          const vs = nums(w.data), lo = Math.min(0, ...vs), hi = Math.max(1, ...vs);
          A(v + ' = lv_chart_create(' + sv + ');'); A('lv_chart_set_type(' + v + ', LV_CHART_TYPE_LINE);'); A('lv_chart_set_point_count(' + v + ', ' + vs.length + ');'); A('lv_chart_set_range(' + v + ', LV_CHART_AXIS_PRIMARY_Y, ' + lo + ', ' + hi + ');'); A('lv_chart_set_div_line_count(' + v + ', 3, 0);');
          A('lv_obj_set_style_bg_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), 0);'); A('lv_obj_set_style_radius(' + v + ', ' + w.radius + ', 0);'); A('lv_obj_set_style_border_width(' + v + ', 0, 0);'); A('lv_chart_series_t * ' + v + '_series = lv_chart_add_series(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_CHART_AXIS_PRIMARY_Y);');
          vs.forEach(n => A('lv_chart_set_next_value(' + v + ', ' + v + '_series, ' + n + ');'));
          break;
        }
        case 'spinner':
          if (v8) A(v + ' = lv_spinner_create(' + sv + ', 1000, 100);'); else { A(v + ' = lv_spinner_create(' + sv + ');'); A('lv_spinner_set_anim_params(' + v + ', 1000, 100);'); }
          A('lv_obj_set_style_arc_width(' + v + ', ' + w.thick + ', LV_PART_MAIN);'); A('lv_obj_set_style_arc_width(' + v + ', ' + w.thick + ', LV_PART_INDICATOR);'); A('lv_obj_set_style_arc_color(' + v + ', lv_color_hex(' + hx(w.bg) + '), LV_PART_MAIN);'); A('lv_obj_set_style_arc_color(' + v + ', lv_color_hex(' + hx(w.accent) + '), LV_PART_INDICATOR);');
          break;
        case 'led':
          A(v + ' = lv_led_create(' + sv + ');'); A('lv_led_set_color(' + v + ', lv_color_hex(' + hx(w.accent) + '));'); A(w.checked ? 'lv_led_on(' + v + ');' : 'lv_led_off(' + v + ');');
          break;
      }
      A('lv_obj_set_pos(' + v + ', ' + w.x + ', ' + w.y + ');'); A('lv_obj_set_size(' + v + ', ' + w.w + ', ' + w.h + ');');
      if ((w.opacity == null ? 100 : w.opacity) < 100) A('lv_obj_set_style_opa(' + v + ', ' + opaOf(w) + ', 0);');
      if (w.hidden) A('lv_obj_add_flag(' + v + ', LV_OBJ_FLAG_HIDDEN);');
      const tg = tapOf(P, w);
      if (tg) {
        const fn = 'ui_event_' + ident(s.name) + '_' + ident(w.name);
        evs.push('static void ' + fn + '(lv_event_t * e)', '{', '    LV_UNUSED(e);', '    ' + API.loadAnim + '(ui_' + ident(tg.name) + ', LV_SCR_LOAD_ANIM_' + ANIMS[animIndex(w.onTap.anim)][2] + ', 300, 0, false);', '}', '');
        if (w.type == 'label' || w.type == 'icon') A('lv_obj_add_flag(' + v + ', LV_OBJ_FLAG_CLICKABLE);');
        A('lv_obj_add_event_cb(' + v + ', ' + fn + ', LV_EVENT_CLICKED, NULL);');
      }
    });
    L.push('}', '');
    return L.join('\n');
  });
  out.push('#include "ui.h"', '', ...decl, '', ...evs, ...fns);
  out.push('lv_obj_t * ui_get_screen(uint32_t index)', '{', '    switch(index) {', ...P.screens.map((s, i) => '        case ' + i + ': return ui_' + ident(s.name) + ';'), '        default: return NULL;', '    }', '}', '');
  out.push('void ui_init(void)', '{', ...P.screens.map(s => '    ui_' + ident(s.name) + '_create();'), '    ' + API.load + '(ui_' + ident(P.screens[0].name) + ');', '}', '');
  let code = out.join('\n');
  if (lv == 96) code = code.replace(/lv_obj_remove_flag\(([^,]+), LV_OBJ_FLAG_SCROLLABLE\)/g, 'lv_obj_set_scrollable($1, false)').replace(/lv_obj_add_flag\(([^,]+), LV_OBJ_FLAG_HIDDEN\)/g, 'lv_obj_set_hidden($1, true)').replace(/lv_obj_add_flag\(([^,]+), LV_OBJ_FLAG_CLICKABLE\)/g, 'lv_obj_set_clickable($1, true)').replace(/lv_chart_set_range\(/g, 'lv_chart_set_axis_range(');
  return code;
}
function genH(P) {
  return ['#ifndef EPIXO_UI_H', '#define EPIXO_UI_H', '', '#if defined __has_include', '#if __has_include("lvgl.h")', '#include "lvgl.h"', '#elif __has_include("lvgl/lvgl.h")', '#include "lvgl/lvgl.h"', '#else', '#include "lvgl.h"', '#endif', '#else', '#include "lvgl.h"', '#endif', '', '#ifdef __cplusplus', 'extern "C" {', '#endif', '',
    '#define UI_SCREEN_COUNT ' + P.screens.length, '',
    ...P.screens.flatMap(s => ['extern lv_obj_t * ui_' + ident(s.name) + ';', ...s.widgets.map(w => 'extern lv_obj_t * ' + vname(s, w) + ';')]), '',
    'void ui_init(void);', 'lv_obj_t * ui_get_screen(uint32_t index);', '', '#ifdef __cplusplus', '}', '#endif', '', '#endif', ''].join('\n');
}

function genPy(P) {
  const L = ['import lvgl as lv', ''], c = x => 'lv.color_hex(' + hx(x) + ')', f = n => 'lv.font_montserrat_' + n;
  const anyArc = P.screens.some(s => s.widgets.some(w => w.type == 'arc' && w.showValue));
  if (anyArc) L.push('def arc_value_cb(arc, label):', '    def cb(e):', '        label.set_text(str(arc.get_value()))', '    return cb', '');
  const sn = s => 'scr_' + ident(s.name).toLowerCase();
  P.screens.forEach(s => L.push(sn(s) + ' = lv.obj()', sn(s) + '.remove_flag(lv.obj.FLAG.SCROLLABLE)', sn(s) + '.set_style_bg_color(' + c(s.bg) + ', 0)', sn(s) + '.set_style_bg_opa(lv.OPA.COVER, 0)', ''));
  P.screens.forEach(s => {
    const sv = sn(s);
    s.widgets.forEach(w => {
      const v = (ident(s.name) + '_' + ident(w.name)).toLowerCase(), A = x => L.push(x);
      switch (w.type) {
        case 'label': A(v + ' = lv.label(' + sv + ')'); A(v + '.set_text(' + cstr(w.text) + ')'); A(v + '.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '.set_style_text_font(' + f(w.font) + ', 0)'); if (w.align == 'center' || w.align == 'right') A(v + '.set_style_text_align(lv.TEXT_ALIGN.' + w.align.toUpperCase() + ', 0)'); if (padOf(w)) A(v + '.set_style_pad_top(' + padOf(w) + ', 0)'); if (hasBg(w)) { A(v + '.set_style_bg_color(' + c(w.bg) + ', 0)'); A(v + '.set_style_bg_opa(lv.OPA.COVER, 0)'); A(v + '.set_style_radius(' + (w.radius || 0) + ', 0)'); A(v + '.set_style_pad_hor(8, 0)'); } break;
        case 'button': A(v + ' = lv.button(' + sv + ')'); A(v + '.set_style_bg_color(' + c(w.bg) + ', 0)'); A(v + '.set_style_radius(' + w.radius + ', 0)'); A(v + '.set_style_shadow_width(0, 0)'); A(v + '_label = lv.label(' + v + ')'); A(v + '_label.set_text(' + cstr(w.text) + ')'); A(v + '_label.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '_label.set_style_text_font(' + f(w.font) + ', 0)'); A(v + '_label.center()'); break;
        case 'panel': A(v + ' = lv.obj(' + sv + ')'); A(v + '.remove_flag(lv.obj.FLAG.SCROLLABLE)'); A(v + '.set_style_bg_color(' + c(w.bg) + ', 0)'); A(v + '.set_style_radius(' + w.radius + ', 0)'); A(v + '.set_style_pad_all(0, 0)'); A(v + '.set_style_border_width(' + (w.border || 0) + ', 0)'); if (w.border) A(v + '.set_style_border_color(' + c(w.borderColor) + ', 0)'); if (w.shadow) { A(v + '.set_style_shadow_width(24, 0)'); A(v + '.set_style_shadow_offset_y(6, 0)'); A(v + '.set_style_shadow_color(lv.color_hex(0x101828), 0)'); A(v + '.set_style_shadow_opa(20, 0)'); } else A(v + '.set_style_shadow_width(0, 0)'); break;
        case 'switch': A(v + ' = lv.switch(' + sv + ')'); A(v + '.set_style_bg_color(' + c(w.bg) + ', lv.PART.MAIN)'); A(v + '.set_style_bg_color(' + c(w.accent) + ', lv.PART.INDICATOR | lv.STATE.CHECKED)'); if (w.checked) A(v + '.add_state(lv.STATE.CHECKED)'); break;
        case 'slider': A(v + ' = lv.slider(' + sv + ')'); A(v + '.set_range(' + w.min + ', ' + w.max + ')'); A(v + '.set_value(' + R(w.value) + ', False)'); A(v + '.set_style_bg_color(' + c(w.bg) + ', lv.PART.MAIN)'); A(v + '.set_style_bg_color(' + c(w.accent) + ', lv.PART.INDICATOR)'); A(v + '.set_style_bg_color(lv.color_hex(0xFFFFFF), lv.PART.KNOB)'); break;
        case 'bar': A(v + ' = lv.bar(' + sv + ')'); A(v + '.set_range(' + w.min + ', ' + w.max + ')'); A(v + '.set_value(' + R(w.value) + ', False)'); A(v + '.set_style_bg_color(' + c(w.bg) + ', lv.PART.MAIN)'); A(v + '.set_style_bg_color(' + c(w.accent) + ', lv.PART.INDICATOR)'); A(v + '.set_style_radius(' + w.radius + ', lv.PART.MAIN)'); A(v + '.set_style_radius(' + w.radius + ', lv.PART.INDICATOR)'); break;
        case 'arc': A(v + ' = lv.arc(' + sv + ')'); A(v + '.set_rotation(135)'); A(v + '.set_bg_angles(0, 270)'); A(v + '.set_range(' + w.min + ', ' + w.max + ')'); A(v + '.set_value(' + R(w.value) + ')'); A(v + '.remove_style(None, lv.PART.KNOB)'); A(v + '.set_style_arc_width(' + w.thick + ', lv.PART.MAIN)'); A(v + '.set_style_arc_width(' + w.thick + ', lv.PART.INDICATOR)'); A(v + '.set_style_arc_color(' + c(w.bg) + ', lv.PART.MAIN)'); A(v + '.set_style_arc_color(' + c(w.accent) + ', lv.PART.INDICATOR)');
          if (w.showValue) { A(v + '_value = lv.label(' + v + ')'); A(v + '_value.set_text("' + R(w.value) + '")'); A(v + '_value.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '_value.set_style_text_font(' + f(w.font) + ', 0)'); A(v + '_value.center()'); A(v + '.add_event_cb(arc_value_cb(' + v + ', ' + v + '_value), lv.EVENT.VALUE_CHANGED, None)'); } break;
        case 'checkbox': A(v + ' = lv.checkbox(' + sv + ')'); A(v + '.set_text(' + cstr(w.text) + ')'); A(v + '.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '.set_style_text_font(' + f(w.font) + ', 0)'); A(v + '.set_style_bg_color(' + c(w.accent) + ', lv.PART.INDICATOR | lv.STATE.CHECKED)'); A(v + '.set_style_border_color(' + c(w.accent) + ', lv.PART.INDICATOR | lv.STATE.CHECKED)'); if (w.checked) A(v + '.add_state(lv.STATE.CHECKED)'); break;
        case 'icon': A(v + ' = lv.label(' + sv + ')'); A(v + '.set_text(lv.SYMBOL.' + (ICONS[w.icon] || ICONS.home)[1] + ')'); A(v + '.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '.set_style_text_font(' + f(iconFont(w)) + ', 0)'); A(v + '.set_style_text_align(lv.TEXT_ALIGN.CENTER, 0)'); if (padOf(w)) A(v + '.set_style_pad_top(' + padOf(w) + ', 0)'); break;
        case 'dropdown': A(v + ' = lv.dropdown(' + sv + ')'); A(v + '.set_options(' + cstr(w.options) + ')'); A(v + '.set_style_bg_color(' + c(w.bg) + ', 0)'); A(v + '.set_style_text_color(' + c(w.fg) + ', 0)'); A(v + '.set_style_text_font(' + f(w.font) + ', 0)'); A(v + '.set_style_radius(' + w.radius + ', 0)'); break;
        case 'chart': { const vs = nums(w.data), lo = Math.min(0, ...vs), hi = Math.max(1, ...vs); A(v + ' = lv.chart(' + sv + ')'); A(v + '.set_type(lv.chart.TYPE.LINE)'); A(v + '.set_point_count(' + vs.length + ')'); A(v + '.set_axis_range(lv.chart.AXIS.PRIMARY_Y, ' + lo + ', ' + hi + ')'); A(v + '.set_div_line_count(3, 0)'); A(v + '.set_style_bg_color(' + c(w.bg) + ', 0)'); A(v + '.set_style_radius(' + w.radius + ', 0)'); A(v + '.set_style_border_width(0, 0)'); A(v + '_series = ' + v + '.add_series(' + c(w.accent) + ', lv.chart.AXIS.PRIMARY_Y)'); A('for value in [' + vs.join(', ') + ']:'); A('    ' + v + '.set_next_value(' + v + '_series, value)'); break; }
        case 'spinner': A('# lv.spinner is not exposed by the MicroPython binding, so this is a matching arc'); A(v + ' = lv.arc(' + sv + ')'); A(v + '.set_bg_angles(0, 360)'); A(v + '.set_angles(270, 10)'); A(v + '.remove_style(None, lv.PART.KNOB)'); A(v + '.remove_flag(lv.obj.FLAG.CLICKABLE)'); A(v + '.set_style_arc_width(' + w.thick + ', lv.PART.MAIN)'); A(v + '.set_style_arc_width(' + w.thick + ', lv.PART.INDICATOR)'); A(v + '.set_style_arc_color(' + c(w.bg) + ', lv.PART.MAIN)'); A(v + '.set_style_arc_color(' + c(w.accent) + ', lv.PART.INDICATOR)'); break;
        case 'led': A(v + ' = lv.led(' + sv + ')'); A(v + '.set_color(' + c(w.accent) + ')'); A(w.checked ? v + '.on()' : v + '.off()'); break;
      }
      A(v + '.set_pos(' + w.x + ', ' + w.y + ')'); A(v + '.set_size(' + w.w + ', ' + w.h + ')');
      if ((w.opacity == null ? 100 : w.opacity) < 100) A(v + '.set_style_opa(' + opaOf(w) + ', 0)');
      if (w.hidden) A(v + '.add_flag(lv.obj.FLAG.HIDDEN)');
      const tg = tapOf(P, w);
      if (tg) { if (w.type == 'label' || w.type == 'icon') A(v + '.add_flag(lv.obj.FLAG.CLICKABLE)'); A(v + '.add_event_cb(lambda e: lv.screen_load_anim(' + sn(tg) + ', lv.SCR_LOAD_ANIM.' + ANIMS[animIndex(w.onTap.anim)][2] + ', 300, 0, False), lv.EVENT.CLICKED, None)'); }
      A('');
    });
  });
  L.push('lv.screen_load(' + sn(P.screens[0]) + ')', '');
  return L.join('\n');
}

function genXML(P) {
  const xa = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\n/g, '&#10;');
  const col = c => '0x' + hexv(c);
  const fnt = f => 'lv_font_montserrat_' + f;
  const skipped = [];
  const files = P.screens.map(s => {
    const L = ['<screen>', '\t<view scrollable="false" style_bg_color="' + col(s.bg) + '" style_bg_opa="255">'];
    s.widgets.forEach(w => {
      if (w.type == 'spinner' || w.type == 'led') { skipped.push(s.name + '/' + w.name); return; }
      const pos = 'name="' + ident(w.name).toLowerCase() + '" x="' + w.x + '" y="' + w.y + '" width="' + w.w + '" height="' + w.h + '"';
      const tg = tapOf(P, w);
      const extra = (w.hidden ? ' hidden="true"' : '') + ((w.opacity == null ? 100 : w.opacity) < 100 ? ' style_opa="' + opaOf(w) + '"' : '') + (tg && (w.type == 'label' || w.type == 'icon') ? ' clickable="true"' : '');
      const pad = padOf(w) ? ' style_pad_top="' + padOf(w) + '"' : '';
      const kids = [];
      if (tg) kids.push('\t\t\t<screen_load_event trigger="clicked" screen="' + ident(tg.name).toLowerCase() + '" anim_type="' + ANIMS[animIndex(w.onTap.anim)][2].toLowerCase() + '" duration="300"/>');
      let open = '';
      switch (w.type) {
        case 'label': open = '<lv_label ' + pos + ' text="' + xa(w.text) + '" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(w.font) + '"' + (w.align == 'center' || w.align == 'right' ? ' style_text_align="' + w.align + '"' : '') + pad + (hasBg(w) ? ' style_bg_color="' + col(w.bg) + '" style_bg_opa="255" style_radius="' + (w.radius || 0) + '" style_pad_left="8" style_pad_right="8"' : '') + extra; break;
        case 'button': open = '<lv_button ' + pos + ' style_bg_color="' + col(w.bg) + '" style_radius="' + w.radius + '" style_shadow_width="0"' + extra; kids.unshift('\t\t\t<lv_label text="' + xa(w.text) + '" align="center" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(w.font) + '"/>'); break;
        case 'panel': open = '<lv_obj ' + pos + ' scrollable="false" style_bg_color="' + col(w.bg) + '" style_radius="' + w.radius + '" style_pad_all="0" style_border_width="' + (w.border || 0) + '"' + (w.border ? ' style_border_color="' + col(w.borderColor) + '"' : '') + (w.shadow ? ' style_shadow_width="24" style_shadow_offset_y="6" style_shadow_color="0x101828" style_shadow_opa="20"' : ' style_shadow_width="0"') + extra; break;
        case 'switch': open = '<lv_switch ' + pos + ' style_bg_color="' + col(w.bg) + '" style_bg_color:indicator:checked="' + col(w.accent) + '"' + (w.checked ? ' checked="true"' : '') + extra; break;
        case 'slider': open = '<lv_slider ' + pos + ' min_value="' + w.min + '" max_value="' + w.max + '" value="' + R(w.value) + '" style_bg_color="' + col(w.bg) + '" style_bg_color:indicator="' + col(w.accent) + '" style_bg_color:knob="0xFFFFFF"' + extra; break;
        case 'bar': open = '<lv_bar ' + pos + ' min_value="' + w.min + '" max_value="' + w.max + '" value="' + R(w.value) + '" style_bg_color="' + col(w.bg) + '" style_bg_color:indicator="' + col(w.accent) + '" style_radius="' + w.radius + '" style_radius:indicator="' + w.radius + '"' + extra; break;
        case 'arc': open = '<lv_arc ' + pos + ' rotation="135" bg_start_angle="0" bg_end_angle="270" min_value="' + w.min + '" max_value="' + w.max + '" value="' + R(w.value) + '" style_arc_width="' + w.thick + '" style_arc_width:indicator="' + w.thick + '" style_arc_color="' + col(w.bg) + '" style_arc_color:indicator="' + col(w.accent) + '"' + extra; kids.unshift('\t\t\t<remove_style selector="knob"/>'); if (w.showValue) kids.push('\t\t\t<lv_label text="' + R(w.value) + '" align="center" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(w.font) + '"/>'); break;
        case 'checkbox': open = '<lv_checkbox ' + pos + ' text="' + xa(w.text) + '" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(w.font) + '" style_bg_color:indicator:checked="' + col(w.accent) + '" style_border_color:indicator:checked="' + col(w.accent) + '"' + (w.checked ? ' checked="true"' : '') + extra; break;
        case 'icon': open = '<lv_label ' + pos + ' text="&#x' + SYMBOL_HEX[(ICONS[w.icon] || ICONS.home)[1]] + ';" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(iconFont(w)) + '" style_text_align="center"' + pad + extra; break;
        case 'dropdown': open = '<lv_dropdown ' + pos + ' options="' + xa(w.options) + '" style_bg_color="' + col(w.bg) + '" style_text_color="' + col(w.fg) + '" style_text_font="' + fnt(w.font) + '" style_radius="' + w.radius + '"' + extra; break;
        case 'chart': { const vs = nums(w.data); open = '<lv_chart ' + pos + ' type="line" point_count="' + vs.length + '" hor_div_line_count="3" ver_div_line_count="0" style_bg_color="' + col(w.bg) + '" style_radius="' + w.radius + '" style_border_width="0"' + extra; kids.unshift('\t\t\t<lv_chart-axis axis="primary_y" min_value="' + Math.min(0, ...vs) + '" max_value="' + Math.max(1, ...vs) + '"/>', '\t\t\t<lv_chart-series color="0x' + hexv(w.accent) + '" axis="primary_y" values="' + vs.join(' ') + '"/>'); break; }
      }
      const tag = open.slice(1, open.indexOf(' '));
      if (kids.length) L.push('\t\t' + open + '>', ...kids, '\t\t</' + tag + '>'); else L.push('\t\t' + open + '/>');
    });
    L.push('\t</view>', '</screen>');
    return {name: ident(s.name).toLowerCase(), xml: L.join('\n') + '\n'};
  });
  files.skipped = skipped;
  return files;
}
function genXMLLoader(P) {
  const fonts = usedFonts(P), xs = genXML(P);
  return ['#include "lvgl.h"', '', '/* Loads the Epixo XML screens with the LVGL XML module (LV_USE_XML 1). */', '',
    ...xs.map(x => 'extern const char epixo_xml_' + x.name + '[];'), '',
    'lv_obj_t * epixo_xml_init(void)', '{', ...fonts.map(f => '    lv_xml_register_font(NULL, "lv_font_montserrat_' + f + '", &lv_font_montserrat_' + f + ');'),
    ...xs.map(x => '    lv_xml_register_component_from_data("' + x.name + '", epixo_xml_' + x.name + ');'),
    '    lv_obj_t * first = lv_xml_create_screen("' + xs[0].name + '");', '    lv_screen_load(first);', '    return first;', '}', ''].join('\n');
}
function genYAML(P) {
  const L = ['lvgl:', '  pages:'], q = s => JSON.stringify(String(s == null ? '' : s));
  const pid = s => ident(s.name).toLowerCase();
  const skipped = [];
  P.screens.forEach(s => {
    L.push('    - id: ' + pid(s), '      bg_color: ' + hx(s.bg), '      bg_opa: COVER', '      widgets:');
    s.widgets.forEach(w => {
      if (w.type == 'chart') { skipped.push(w.name); return; }
      const T = {panel: 'obj', icon: 'label'}[w.type] || w.type, I = '            ', A = x => L.push(I + x);
      L.push('        - ' + T + ':');
      A('id: ' + pid(s) + '_' + ident(w.name).toLowerCase()); A('x: ' + w.x); A('y: ' + w.y); A('width: ' + w.w); A('height: ' + w.h);
      switch (w.type) {
        case 'label': A('text: ' + q(w.text)); A('text_color: ' + hx(w.fg)); A('text_font: montserrat_' + w.font); if (w.align == 'center' || w.align == 'right') A('text_align: ' + w.align.toUpperCase()); if (padOf(w)) A('pad_top: ' + padOf(w)); if (hasBg(w)) { A('bg_color: ' + hx(w.bg)); A('bg_opa: COVER'); A('radius: ' + (w.radius || 0)); A('pad_left: 8'); A('pad_right: 8'); } break;
        case 'icon': A('text: "\\U0000' + SYMBOL_HEX[(ICONS[w.icon] || ICONS.home)[1]] + '"'); A('text_color: ' + hx(w.fg)); A('text_font: montserrat_' + iconFont(w)); A('text_align: CENTER'); if (padOf(w)) A('pad_top: ' + padOf(w)); break;
        case 'button': A('bg_color: ' + hx(w.bg)); A('radius: ' + w.radius); A('shadow_width: 0'); A('widgets:'); A('  - label:'); A('      align: CENTER'); A('      text: ' + q(w.text)); A('      text_color: ' + hx(w.fg)); A('      text_font: montserrat_' + w.font); break;
        case 'panel': A('bg_color: ' + hx(w.bg)); A('radius: ' + w.radius); A('pad_all: 0'); A('border_width: ' + (w.border || 0)); if (w.border) A('border_color: ' + hx(w.borderColor)); A('scrollable: false'); if (w.shadow) { A('shadow_width: 24'); A('shadow_ofs_y: 6'); A('shadow_color: 0x101828'); A('shadow_opa: 8%'); } else A('shadow_width: 0'); break;
        case 'switch': A('bg_color: ' + hx(w.bg)); A('state:'); A('  checked: ' + (w.checked ? 'true' : 'false')); A('indicator:'); A('  checked:'); A('    bg_color: ' + hx(w.accent)); break;
        case 'slider': A('min_value: ' + w.min); A('max_value: ' + w.max); A('value: ' + R(w.value)); A('bg_color: ' + hx(w.bg)); A('indicator:'); A('  bg_color: ' + hx(w.accent)); A('knob:'); A('  bg_color: 0xFFFFFF'); break;
        case 'bar': A('min_value: ' + w.min); A('max_value: ' + w.max); A('value: ' + R(w.value)); A('bg_color: ' + hx(w.bg)); A('radius: ' + w.radius); A('indicator:'); A('  bg_color: ' + hx(w.accent)); A('  radius: ' + w.radius); break;
        case 'arc': A('min_value: ' + w.min); A('max_value: ' + w.max); A('value: ' + R(w.value)); A('rotation: 135'); A('start_angle: 0'); A('end_angle: 270'); A('arc_width: ' + w.thick); A('arc_color: ' + hx(w.bg)); A('indicator:'); A('  arc_width: ' + w.thick); A('  arc_color: ' + hx(w.accent)); A('knob:'); A('  bg_opa: TRANSP'); A('  pad_all: 0');
          if (w.showValue) { A('widgets:'); A('  - label:'); A('      id: ' + pid(s) + '_' + ident(w.name).toLowerCase() + '_value'); A('      align: CENTER'); A('      text: "' + R(w.value) + '"'); A('      text_color: ' + hx(w.fg)); A('      text_font: montserrat_' + w.font); A('on_value:'); A('  - lvgl.label.update:'); A('      id: ' + pid(s) + '_' + ident(w.name).toLowerCase() + '_value'); A('      text:'); A('        format: "%d"'); A('        args: [ "(int) x" ]'); } break;
        case 'checkbox': A('text: ' + q(w.text)); A('text_color: ' + hx(w.fg)); A('text_font: montserrat_' + w.font); A('state:'); A('  checked: ' + (w.checked ? 'true' : 'false')); A('indicator:'); A('  checked:'); A('    bg_color: ' + hx(w.accent)); A('    border_color: ' + hx(w.accent)); break;
        case 'dropdown': A('options:'); String(w.options).split('\n').forEach(o => A('  - ' + q(o))); A('bg_color: ' + hx(w.bg)); A('text_color: ' + hx(w.fg)); A('text_font: montserrat_' + w.font); A('radius: ' + w.radius); break;
        case 'spinner': A('spin_time: 1000ms'); A('arc_length: 100deg'); A('arc_width: ' + w.thick); A('arc_color: ' + hx(w.bg)); A('indicator:'); A('  arc_width: ' + w.thick); A('  arc_color: ' + hx(w.accent)); break;
        case 'led': A('color: ' + hx(w.accent)); A('brightness: ' + (w.checked ? '100%' : '0%')); break;
      }
      if ((w.opacity == null ? 100 : w.opacity) < 100) A('opa: ' + R(w.opacity) + '%');
      if (w.hidden) A('hidden: true');
      const tg = tapOf(P, w);
      if (tg) { if (w.type == 'label' || w.type == 'icon') A('clickable: true'); A('on_click:'); A('  - lvgl.page.show:'); A('      id: ' + pid(tg)); A('      animation: ' + ANIMS[animIndex(w.onTap.anim)][2]); A('      time: 300ms'); }
    });
  });
  return {yaml: L.join('\n') + '\n', skipped};
}

function usedFonts(P) {
  const s = new Set();
  P.screens.forEach(sc => sc.widgets.forEach(w => { if (w.type == 'icon') s.add(iconFont(w)); else if (w.font && (w.type != 'arc' || w.showValue)) s.add(w.font); }));
  s.add(14);
  return [...s].sort((a, b) => a - b);
}

function genLvConf(template, P, opt) {
  opt = opt || {};
  let t = template.replace(/#if 0 \/\*Set it to "1" to enable content\*\//, '#if 1');
  const fonts = usedFonts(P);
  t = t.replace(/#define LV_FONT_MONTSERRAT_(\d+)\s+(0|1)/g, (m, n) => '#define LV_FONT_MONTSERRAT_' + n + ' ' + (fonts.includes(+n) ? 1 : 0));
  if (opt.memKB) t = t.replace(/#define LV_MEM_SIZE \(\d+[U]?\s*\*\s*1024U\)/, '#define LV_MEM_SIZE (' + opt.memKB + 'U * 1024U)').replace(/#define LV_MEM_SIZE 65536\b/, '#define LV_MEM_SIZE (' + opt.memKB + 'U * 1024U)');
  if (opt.swap != null) t = t.replace(/#define LV_COLOR_16_SWAP \d/, '#define LV_COLOR_16_SWAP ' + opt.swap);
  return t;
}

function packOf(b) {
  if (!b || !b.pack) return null;
  const [kind, id] = b.pack.split(':');
  return {kind, id};
}

function boardPlatformio(P, pack) {
  const b = P.board;
  if (pack.kind == 'espanel') {
    const swap = b.bus == 'spi' ? 1 : 0;
    return ['; Generated by Epixo Editor for ' + b.brand + ' ' + b.name, '; Based on the official ESP32_Display_Panel PlatformIO example (LVGL 8.4)', '',
      '[platformio]', 'default_envs = ' + pack.id, '',
      '[env]', 'framework = arduino', 'platform = https://github.com/pioarduino/platform-espressif32/releases/download/53.03.11/platform-espressif32.zip',
      'platform_packages =', '    platformio/framework-arduinoespressif32@https://github.com/espressif/arduino-esp32.git#3.1.1', '    platformio/framework-arduinoespressif32-libs@https://dl.espressif.com/AE/esp-arduino-libs/esp32-3.1.1-h.zip',
      'monitor_speed = 115200', 'lib_deps =', '    https://github.com/esp-arduino-libs/ESP32_Display_Panel.git#v1.0.5', '    https://github.com/esp-arduino-libs/ESP32_IO_Expander.git#v1.1.0', '    https://github.com/esp-arduino-libs/esp-lib-utils.git#v0.2.0', '    https://github.com/lvgl/lvgl.git#v8.4.0', '',
      '[env:' + pack.id + ']', 'board = ' + (b.chip == 'ESP32' ? 'm5stack-core2' : pack.id), 'build_flags =', '    -DCORE_DEBUG_LEVEL=1', '    -DLV_CONF_INCLUDE_SIMPLE', '    -DLV_LVGL_H_INCLUDE_SIMPLE', '    -I src', '    -DLV_COLOR_16_SWAP=' + swap, '    -DESP_PANEL_BOARD_DEFAULT_USE_SUPPORTED=1', '    -D' + pack.id, ''].join('\n');
  }
  if (pack.kind == 'smart') {
    return ['; Generated by Epixo Editor for ' + b.brand + ' ' + b.name, '; Uses rzeldent/esp32-smartdisplay (LVGL 9). Board definitions: clone', ';   https://github.com/rzeldent/platformio-espressif32-sunton into ./boards', '',
      '[platformio]', 'default_envs = ' + pack.id, '',
      '[env]', 'platform = espressif32', 'framework = arduino', 'monitor_speed = 115200', 'monitor_filters = esp32_exception_decoder', 'board_build.partitions = min_spiffs.csv',
      'build_flags =', '    -Ofast', '    -D CORE_DEBUG_LEVEL=ARDUHAL_LOG_LEVEL_INFO', "    '-D LV_CONF_PATH=${platformio.include_dir}/lv_conf.h'", 'lib_deps =', '    https://github.com/rzeldent/esp32-smartdisplay.git#2.1.2', '',
      '[env:' + pack.id + ']', 'board = ' + pack.id, ''].join('\n');
  }
  return null;
}

function mainForPack(P, pack, mode) {
  const rot = P.board.rot === 90;
  if (pack.kind == 'espanel') {
    const body = mode == 'runtime'
      ? ['    epixo_rt_init();', '    lv_obj_t * hello = lv_label_create(lv_scr_act());', '    lv_label_set_text(hello, "Epixo Live Mirror\\nWaiting for the editor...");', '    lv_obj_center(hello);']
      : ['    ui_init();'];
    return ['#include <Arduino.h>', '#include <esp_display_panel.hpp>', '#include <lvgl.h>', '#include "lvgl_v8_port.h"', mode == 'runtime' ? '#include "epixo_rt.h"' : '#include "ui.h"', '',
      'using namespace esp_panel::drivers;', 'using namespace esp_panel::board;', '',
      mode == 'runtime' ? 'static char line_buf[2048];\nstatic size_t line_len;\n' : '',
      'void setup()', '{', '    Serial.begin(' + (mode == 'runtime' ? '921600' : '115200') + ');', '    Board *board = new Board();', '    board->init();',
      '#if LVGL_PORT_AVOID_TEARING_MODE', '    auto lcd = board->getLCD();', '    lcd->configFrameBufferNumber(LVGL_PORT_DISP_BUFFER_NUM);', '#if ESP_PANEL_DRIVERS_BUS_ENABLE_RGB && CONFIG_IDF_TARGET_ESP32S3', '    auto lcd_bus = lcd->getBus();', '    if (lcd_bus->getBasicAttributes().type == ESP_PANEL_BUS_TYPE_RGB) {', '        static_cast<BusRGB *>(lcd_bus)->configRGB_BounceBufferSize(lcd->getFrameWidth() * 10);', '    }', '#endif', '#endif',
      '    assert(board->begin());', '    lvgl_port_init(board->getLCD(), board->getTouch());', '    lvgl_port_lock(-1);', ...body, '    lvgl_port_unlock();', '}', '',
      'void loop()', '{',
      ...(mode == 'runtime' ? ['    while (Serial.available()) {', '        char c = (char)Serial.read();', '        if (c == \'\\n\') {', '            line_buf[line_len] = 0;', '            lvgl_port_lock(-1);', '            epixo_rt_line(line_buf);', '            lvgl_port_unlock();', '            line_len = 0;', '        } else if (line_len < sizeof(line_buf) - 1) {', '            line_buf[line_len++] = c;', '        }', '    }', '    delay(1);'] : ['    delay(1000);']),
      '}', ''].join('\n');
  }
  if (pack.kind == 'smart') {
    return ['#include <Arduino.h>', '#include <esp32_smartdisplay.h>', mode == 'runtime' ? '#include "epixo_rt.h"' : '#include "ui.h"', '',
      mode == 'runtime' ? 'static char line_buf[2048];\nstatic size_t line_len;\n' : '',
      'void setup()', '{', '    Serial.begin(' + (mode == 'runtime' ? '921600' : '115200') + ');', '    smartdisplay_init();', '    lv_display_t * display = lv_display_get_default();',
      rot ? '    lv_display_set_rotation(display, LV_DISPLAY_ROTATION_90);' : '    LV_UNUSED(display);',
      ...(mode == 'runtime' ? ['    epixo_rt_init();', '    lv_obj_t * hello = lv_label_create(lv_screen_active());', '    lv_label_set_text(hello, "Epixo Live Mirror\\nWaiting for the editor...");', '    lv_obj_center(hello);'] : ['    ui_init();']),
      '}', '', 'static unsigned long lv_last_tick;', '', 'void loop()', '{',
      ...(mode == 'runtime' ? ['    while (Serial.available()) {', '        char c = (char)Serial.read();', '        if (c == \'\\n\') {', '            line_buf[line_len] = 0;', '            epixo_rt_line(line_buf);', '            line_len = 0;', '        } else if (line_len < sizeof(line_buf) - 1) {', '            line_buf[line_len++] = c;', '        }', '    }'] : []),
      '    unsigned long now = millis();', '    lv_tick_inc(now - lv_last_tick);', '    lv_last_tick = now;', '    lv_timer_handler();', '}', ''].join('\n');
  }
  return null;
}

function genGenericMain(P) {
  return ['#include <Arduino.h>', '#include <lvgl.h>', '#include "ui.h"', '',
    '#define SCREEN_W ' + P.board.w, '#define SCREEN_H ' + P.board.h, '',
    'static uint8_t draw_buf[SCREEN_W * 40 * 2];', '',
    'static void flush_cb(lv_display_t * disp, const lv_area_t * area, uint8_t * px_map)', '{',
    '    /* Send px_map to your panel here, for example with LovyanGFX or TFT_eSPI:', '       tft.pushImage(area->x1, area->y1, lv_area_get_width(area), lv_area_get_height(area), (uint16_t *)px_map); */',
    '    lv_display_flush_ready(disp);', '}', '',
    'static void touch_cb(lv_indev_t * indev, lv_indev_data_t * data)', '{', '    /* Read your touch controller here and fill data->point and data->state */', '    data->state = LV_INDEV_STATE_RELEASED;', '}', '',
    'void setup()', '{', '    lv_init();', '    lv_tick_set_cb((lv_tick_get_cb_t)millis);', '    lv_display_t * disp = lv_display_create(SCREEN_W, SCREEN_H);', '    lv_display_set_buffers(disp, draw_buf, NULL, sizeof(draw_buf), LV_DISPLAY_RENDER_MODE_PARTIAL);', '    lv_display_set_flush_cb(disp, flush_cb);', '    lv_indev_t * indev = lv_indev_create();', '    lv_indev_set_type(indev, LV_INDEV_TYPE_POINTER);', '    lv_indev_set_read_cb(indev, touch_cb);', '    ui_init();', '}', '',
    'void loop()', '{', '    lv_timer_handler();', '    delay(5);', '}', ''].join('\n');
}

function memoryReport(P) {
  const b = P.board, px = b.w * b.h;
  const fontKB = {12:13,14:16,16:19,18:23,20:27,22:31,24:36,26:41,28:46,30:52,32:58,34:65,36:72,38:78,40:86,42:93,44:101,46:108,48:117};
  const fonts = usedFonts(P);
  const flashFonts = fonts.reduce((a, f) => a + (fontKB[f] || 40), 0);
  const nW = P.screens.reduce((a, s) => a + s.widgets.length, 0);
  const objBytes = {label: 180, button: 330, icon: 180, panel: 150, switch: 170, slider: 210, checkbox: 260, dropdown: 300, arc: 230, bar: 200, chart: 420, spinner: 240, led: 160};
  let ram = 0;
  P.screens.forEach(s => { ram += 160; s.widgets.forEach(w => { ram += (objBytes[w.type] || 200) + 60 + (w.text ? String(w.text).length : 0); }); });
  const fb = px * 2;
  return {screens: P.screens.length, widgets: nW, fonts, flashFontsKB: flashFonts, uiRamKB: Math.ceil(ram / 1024), fullFrameKB: Math.ceil(fb / 1024), partialBufKB: Math.ceil(b.w * Math.ceil(b.h / 10) * 2 / 1024), lvMemKB: Math.max(48, Math.ceil(ram * 1.6 / 1024 / 16) * 16)};
}

function luminance(hex) {
  const n = parseInt(hexv(hex), 16), ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
  return .2126 * ch[0] + .7152 * ch[1] + .0722 * ch[2];
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function inside(o, w) { return w.x >= o.x && w.y >= o.y && w.x + w.w <= o.x + o.w && w.y + w.h <= o.y + o.h; }
function backdrop(s, w) {
  const i = s.widgets.indexOf(w);
  for (let k = i - 1; k >= 0; k--) { const o = s.widgets[k]; if (!o.hidden && (o.type == 'panel' || o.type == 'button') && inside(o, w)) return o.bg; }
  return s.bg;
}

function touchTarget(b) {
  const diag = parseFloat(String(b.size || '').replace(',', '.'));
  const ppi = diag > 0 ? Math.hypot(b.nw || b.w, b.nh || b.h) / diag : 160;
  return Math.max(28, R(4.5 / 25.4 * ppi));
}
const TEXTY = {label: 1, button: 1, checkbox: 1, dropdown: 1};
function textBox(w) {
  if (w.type != 'label') return {x: w.x, y: w.y, w: w.w, h: w.h, w0: w};
  const th = Math.min(w.h, (LH[w.font] || w.h) * String(w.text).split('\n').length);
  const y = w.valign == 'top' ? w.y : w.valign == 'bottom' ? w.y + w.h - th : w.y + (w.h - th) / 2;
  return {x: w.x, y, w: w.w, h: th, w0: w};
}
function doctor(P, measure) {
  const b = P.board, out = [];
  const add = (sev, s, w, code, msg, fix) => out.push({sev, screen: s.id, widget: w ? w.id : null, code, msg, fix});
  const minTouch = touchTarget(b);
  const screenKeys = new Map();
  P.screens.forEach(s => { const k = nameKey(s.name); if (screenKeys.has(k)) add('error', s, null, 'dupscreen', s.name + ' has the same code name as ' + screenKeys.get(k).name + '. Rename one of them.', null); else screenKeys.set(k, s); });
  P.screens.forEach(s => {
    if (!s.widgets.length) add('info', s, null, 'empty', s.name + ' has no widgets yet.', null);
    const keys = new Map();
    s.widgets.forEach(w => { const k = nameKey(w.name); if (keys.has(k)) add('error', s, w, 'dupname', '“' + w.name + '” has the same name as another widget on ' + s.name + ', so the code will not compile.', 'rename'); else keys.set(k, w); });
    const texts = s.widgets.filter(w => !w.hidden && TEXTY[w.type]).map(textBox);
    texts.forEach((a, i) => texts.slice(i + 1).forEach(c => {
      if (Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x) > 2 && Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y) > 2) add('warn', s, c.w0, 'overlap', '“' + c.w0.name + '” overlaps “' + a.w0.name + '”, so their text will collide.', null);
    }));
    s.widgets.forEach(w => {
      if (w.hidden) return;
      const nm = '“' + w.name + '”';
      if (w.x + w.w <= 0 || w.y + w.h <= 0 || w.x >= b.w || w.y >= b.h) add('error', s, w, 'offscreen', nm + ' is completely off the screen.', 'bringin');
      else if (w.x < 0 || w.y < 0 || w.x + w.w > b.w || w.y + w.h > b.h) add('warn', s, w, 'clipped', nm + ' runs past the screen edge.', 'bringin');
      if (b.round && w.type != 'panel') {
        const cx = b.w / 2, cy = b.h / 2, r = Math.min(b.w, b.h) / 2;
        const corners = [[w.x, w.y], [w.x + w.w, w.y], [w.x, w.y + w.h], [w.x + w.w, w.y + w.h]];
        if (corners.some(([x, y]) => Math.hypot(x - cx, y - cy) > r + 1)) add('warn', s, w, 'round', nm + ' pokes outside the round display.', 'shrinkround');
      }
      if (b.touch && (INTERACTIVE[w.type] || (w.onTap && w.onTap.to))) {
        const hit = w.type == 'slider' ? Math.max(w.h * 3, 24) : w.type == 'switch' ? Math.sqrt(w.w * w.h) : Math.min(w.w, w.h);
        const need = minTouch * (w.type == 'slider' ? 0.6 : 0.85);
        if (hit < need) add(hit < need * 0.7 ? 'warn' : 'info', s, w, 'touch', nm + ' is about ' + Math.round(hit) + ' px. On this ' + (b.size || '') + ' screen a comfortable finger target is ' + minTouch + ' px.', 'grow');
      }
      const fg = w.type == 'label' || w.type == 'checkbox' || w.type == 'button' || w.type == 'dropdown' || (w.type == 'icon' && w.onTap && w.onTap.to) ? w.fg : null;
      if (fg) {
        const bg = w.type == 'button' || w.type == 'dropdown' ? w.bg : (hasBg(w) ? w.bg : backdrop(s, w));
        const ratio = contrast(fg, bg), need = w.type == 'icon' || (w.font || 16) >= 24 ? 3 : 4.5;
        if (ratio < need) add('warn', s, w, 'contrast', nm + ' text contrast is ' + ratio.toFixed(1) + ':1. Aim for ' + need + ':1 so it reads in sunlight.', 'contrast');
      }
      if (measure && (w.type == 'label' || w.type == 'button' || w.type == 'checkbox') && w.text) {
        const lines = String(w.text).split('\n');
        const tw = Math.max(...lines.map(l => measure(w.font || 16, l)));
        const room = w.type == 'button' ? w.w - 16 : w.type == 'checkbox' ? w.w - (w.font || 16) * 1.6 : w.w - (hasBg(w) ? 16 : 0);
        if (tw > room + 1) add(w.type == 'label' ? 'warn' : 'error', s, w, 'overflow', nm + ' text is ' + Math.round(tw) + ' px wide but only ' + Math.round(room) + ' px fit' + (w.type == 'label' ? ', so it will wrap.' : '.'), 'fittext');
        if (w.type == 'label' && LH[w.font] * lines.length > w.h + 2 && w.valign == 'center') add('info', s, w, 'tall', nm + ' is shorter than its text line.', 'fitheight');
      }
      if (w.type == 'chart' && nums(w.data).length < 2) add('warn', s, w, 'chartdata', nm + ' needs at least two values.', null);
      if ((w.type == 'slider' || w.type == 'bar' || w.type == 'arc') && (+w.min >= +w.max)) add('error', s, w, 'range', nm + ' has min ≥ max.', 'range');
      if (w.onTap && w.onTap.to && !P.screens.some(x => x.id == w.onTap.to)) add('error', s, w, 'deadlink', nm + ' opens a screen that no longer exists.', 'unlink');
    });
    const tapTargets = new Set();
    P.screens.forEach(x => x.widgets.forEach(w => { if (w.onTap && w.onTap.to) tapTargets.add(w.onTap.to); }));
    if (P.screens.length > 1 && s.id != P.screens[0].id && !tapTargets.has(s.id)) add('info', s, null, 'unreachable', 'Nothing opens ' + s.name + '. Add an On tap link so people can reach it.', null);
  });
  const mem = memoryReport(P);
  if (mem.fonts.length > 7) out.push({sev: 'info', screen: null, widget: null, code: 'fonts', msg: mem.fonts.length + ' font sizes use about ' + mem.flashFontsKB + ' KB of flash. Fewer sizes keep firmware small.', fix: null});
  return out;
}

function applyFix(P, issue, measure) {
  const s = P.screens.find(x => x.id == issue.screen);
  const w = s && s.widgets.find(x => x.id == issue.widget);
  const b = P.board;
  if (!w) return false;
  switch (issue.fix) {
    case 'bringin': w.w = Math.min(w.w, b.w); w.h = Math.min(w.h, b.h); w.x = clamp(w.x, 0, b.w - w.w); w.y = clamp(w.y, 0, b.h - w.h); return true;
    case 'shrinkround': roundFit(w, b.w, b.h); if (w.type == 'label' && measure) fitWidget(w); return true;
    case 'grow': { const t = touchTarget(b); if (w.type == 'slider') { const nh = Math.max(w.h, R(t * .25)); w.y -= R((nh - w.h) / 2); w.h = nh; } else { const cx = w.x + w.w / 2, cy = w.y + w.h / 2; if (w.type == 'switch') { w.h = Math.max(w.h, R(t * .8)); w.w = Math.max(w.w, R(w.h * 1.75)); } else { w.w = Math.max(w.w, t); w.h = Math.max(w.h, t); } w.x = R(cx - w.w / 2); w.y = R(cy - w.h / 2); } return true; }
    case 'contrast': { const bg = w.type == 'button' || w.type == 'dropdown' ? w.bg : (hasBg(w) ? w.bg : backdrop(s, w)); w.fg = luminance(bg) > .4 ? '#0E1525' : '#FFFFFF'; return true; }
    case 'fittext': if (!measure) return false; { const lines = String(w.text).split('\n'); const room = w.type == 'button' ? w.w - 16 : w.type == 'checkbox' ? w.w - (w.font || 16) * 1.6 : w.w; let f = w.font; while (f > 12 && Math.max(...lines.map(l => measure(f, l))) > room) f = FONTS[FONTS.indexOf(f) - 1]; w.font = f; if (Math.max(...lines.map(l => measure(f, l))) > room) w.w = R(Math.max(...lines.map(l => measure(f, l))) + (w.type == 'button' ? 20 : 4)); return true; }
    case 'fitheight': w.h = LH[w.font] * String(w.text).split('\n').length + 2; return true;
    case 'range': w.max = +w.min + 100; return true;
    case 'unlink': w.onTap = null; return true;
    case 'rename': w.name = uniqueWidgetName(s, w.name, w); return true;
  }
  return false;
}

const API = {
  R, clamp, FONTS, LH, F, ADV, measureText, fitWidget, C, ICONS, SYMBOL_HEX, TYPES, SQUARE, TAPPABLE, ANIMS, THEMES, BOARDS, VERIFY, TPL, SRC,
  blank, uniqueName, uniqueWidgetName, nameKey, mkW, mkScreen, addTemplate, defaultProject, boardDims, withRotation,
  nums, ident, hexv, iconFont, padOf, toScript, scriptScreen, sid,
  genC, genH, genPy, genXML, genXMLLoader, genYAML, genLvConf, usedFonts, packOf, boardPlatformio, mainForPack, genGenericMain,
  memoryReport, doctor, applyFix, contrast, touchTarget
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.EpixoCore = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
