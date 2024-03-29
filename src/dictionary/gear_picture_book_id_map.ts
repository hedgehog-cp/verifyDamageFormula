// 装備種2; 図鑑表示
const GEAR_PICTURE_BOOK_ID_MAP: {
  [k: string]: number;
} = {
  主砲: 1,
  副砲: 2,
  魚雷: 3,
  特殊潜航艇: 4,
  艦上機: 5,
  対空機銃: 6,
  偵察機: 7,
  電探: 8,
  強化: 9,
  ソナー: 10,
  上陸用舟艇: 14,
  オートジャイロ: 15,
  対潜哨戒機: 16,
  追加装甲: 17,
  探照灯: 18,
  簡易輸送部材: 19,
  艦艇修理施設: 20,
  照明弾: 21,
  司令部施設: 22,
  航空要員: 23,
  高射装置: 24,
  対艦強化弾: 25,
  対地装備: 26,
  水上艦要員: 27,
  対空強化弾: 28,
  対空ロケットランチャー: 29,
  応急修理要員: 30,
  機関部強化: 31,
  爆雷: 32,
  大型飛行艇: 33,
  戦闘糧食: 34,
  補給物資: 35,
  "多用途水上機/水上戦闘機": 36,
  特型内火艇: 37,
  陸上攻撃機: 38,
  局地戦闘機: 39,
  噴式戦闘爆撃機: 40,
  輸送機材: 41,
  潜水艦装備: 42,
  "多用途水上機/水上爆撃機": 43,
  回転翼機: 44, // 訳不明; ヘリコプター?
  DD戦車: 45,
  大型陸上機: 46,
  武装大発: 47, // 訳不明; 戦闘用舟艇?
  陸戦部隊: 48,
  艦載発煙装置: 49,
};
