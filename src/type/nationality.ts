const MST_NATIONALITY: { [key: number]: string } = {
  1: "日本",
  2: "日本",
  3: "日本",
  4: "日本",
  5: "日本",
  6: "日本",
  7: "日本",
  8: "日本",
  9: "日本",
  10: "日本",
  11: "日本",
  12: "日本",
  13: "日本",
  14: "日本",
  15: "日本",
  16: "日本",
  17: "日本",
  18: "日本",
  19: "日本",
  20: "日本",
  21: "日本",
  22: "日本",
  23: "日本",
  24: "日本",
  25: "日本",
  26: "日本",
  27: "日本",
  28: "日本",
  29: "日本",
  30: "日本",
  31: "日本",
  32: "日本",
  33: "日本",
  34: "日本",
  35: "日本",
  36: "日本",
  37: "日本",
  38: "日本",
  39: "日本",
  40: "日本",
  41: "日本",
  42: "日本",
  43: "日本",
  44: "日本",
  45: "日本",
  46: "日本",
  47: "ドイツ",
  48: "ドイツ",
  49: "日本",
  50: "日本",
  51: "日本",
  52: "日本",
  53: "日本",
  54: "日本",
  55: "ドイツ",
  56: "日本",
  57: "ドイツ",
  58: "イタリア",
  59: "日本",
  60: "日本",
  61: "イタリア",
  62: "日本",
  63: "ドイツ",
  64: "イタリア",
  65: "アメリカ",
  66: "日本",
  67: "イギリス",
  68: "イタリア",
  69: "アメリカ",
  70: "フランス",
  71: "日本",
  72: "日本",
  73: "ロシア",
  74: "日本",
  75: "日本",
  76: "日本",
  77: "日本",
  78: "イギリス",
  79: "フランス",
  80: "イタリア",
  81: "ロシア",
  82: "イギリス",
  83: "アメリカ",
  84: "アメリカ",
  85: "日本",
  86: "日本",
  87: "アメリカ",
  88: "イギリス",
  89: "スウェーデン",
  90: "日本",
  91: "アメリカ",
  92: "イタリア",
  93: "アメリカ",
  94: "日本",
  95: "アメリカ",
  96: "オーストラリア",
  97: "日本",
  98: "オランダ",
  99: "アメリカ",
  100: "日本",
  101: "日本",
  102: "アメリカ",
  103: "日本",
  104: "日本",
  105: "アメリカ",
  106: "アメリカ",
  107: "アメリカ",
  108: "イギリス",
  109: "日本",
  110: "アメリカ",
  111: "日本",
  112: "イギリス",
  113: "イタリア",
  114: "アメリカ",
  115: "日本",
  116: "アメリカ",
  117: "日本",
  118: "アメリカ",
  119: "日本",
  120: "日本",
  121: "アメリカ",
} as const;

type nationality = (typeof MST_NATIONALITY)[keyof typeof MST_NATIONALITY];
