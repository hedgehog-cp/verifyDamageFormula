/**
 * @customfunction 対潜装備ボーナスを取得する
 * @returns 対潜装備ボーナス
 * スプレッドシートから入ってくる数字は, value()を通していたとしても文字列となる.
 * しかし, parseInt()などを実行すると処理が遅くなるので, numberであるとしてtcsを騙す.
 * この型の差異の吸収は, binarySearchで行う.
 */
function aswBonus(
  attackerIds: number[], // 実際はstring[]
  gearIds: number[][], // 実際はstring[][]
  gearRfs: number[][] // 実際はstring[][]
) {
  // 処理する行数
  const ROW_SIZE = attackerIds.reduce((v1, v2) => v1 + (v2 > 0 ? 1 : 0), 0);

  // 攻撃艦
  let attackers: AswAttacker[] = new Array(ROW_SIZE);

  // 行サイズぶんだけ対潜装備ボーナスを取得
  for (let i = 0; i < ROW_SIZE; i++) {
    attackers[i] = new AswAttacker(attackerIds[i], gearIds[i], gearRfs[i]);
    calcAswBonus(attackers[i]);
  }

  // 対潜装備ボーナスを返す
  return attackers.map((e: AswAttacker) => e.bonus);
}

/**
 * @function calcAswBonus 引数に与えられた攻撃艦1隻の対潜装備ボーナスを計算する
 * @param attacker 攻撃艦1隻(艦娘を想定)
 * @return [[noreturn]]
 * @see https://github.com/KC3Kai/KC3Kai/blob/master/src/library/objects/GearBonus.js
 * @see https://docs.google.com/spreadsheets/d/1bInH11S_xKdaKP754bB7SYh-di9gGzcXkiQPvGuzCpg/edit#gid=843064990
 */
function calcAswBonus(attacker: AswAttacker) {
  // 装備個数
  let num: number = 0;

  //-------------------------------------------------------------------------//
  //                            >> multiple <<                               //
  //                                                                         //
  //                       bonus += coefficient * num                        //
  //                                                                         //
  //                     [multiple, single, synergy]                         //
  //                      ^^^^^^^^                                           //
  //-------------------------------------------------------------------------//

  // 19   https://wikiwiki.jp/kancolle/九六式艦戦
  if ((num = attacker.gearCount("九六式艦戦"))) {
    if (attacker.ctype === "大鷹型") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "鳳翔型") {
      attacker.bonus += 2 * num;
      attacker.bonus += attacker.isKai2 ? num : 0;
    }
  }

  // 44   https://wikiwiki.jp/kancolle/九四式爆雷投射機
  // 45   https://wikiwiki.jp/kancolle/三式爆雷投射機
  if (
    (num =
      attacker.gearCount("九四式爆雷投射機") +
      attacker.gearCount("三式爆雷投射機"))
  ) {
    if (attacker.ctype === "香取型") {
      attacker.bonus += 3 * num;
    }
  }

  // 47   https://wikiwiki.jp/kancolle/三式水中探信儀
  if ((num = attacker.gearCount("三式水中探信儀"))) {
    if (
      [
        "かみかぜ",
        "はるかぜ",
        "しぐれ",
        "やまかぜ",
        "まいかぜ",
        "あさしも",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 3 * num;
    } else if (
      [
        "うしお",
        "いかずち",
        "やまぐも",
        "いそかぜ",
        "はまかぜ",
        "きしなみ",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 2 * num;
    }
  }

  // 69   https://wikiwiki.jp/kancolle/カ号観測機
  if ((num = attacker.gearCount("カ号観測機"))) {
    if (attacker.name === "伊勢改二") {
      attacker.bonus += num;
    } else if (attacker.name === "日向改二") {
      attacker.bonus += 2 * num;
    } else if (attacker.name === "加賀改二護") {
      attacker.bonus += 2 * num;
    }
  }

  // 70 https://wikiwiki.jp/kancolle/三式指揮連絡機%28対潜%29
  if ((num = attacker.gearCount("三式指揮連絡機(対潜)"))) {
    if (attacker.yomi === "やましおまる") {
      attacker.bonus += num;
    }
  }

  // 82   https://wikiwiki.jp/kancolle/九七式艦攻(九三一空)
  if ((num = attacker.gearCount("九七式艦攻(九三一空)"))) {
    if (attacker.ctype === "大鷹型") {
      attacker.bonus += num;
    }
  }

  // 129  https://wikiwiki.jp/kancolle/熟練見張員
  if ((num = attacker.gearCount("熟練見張員"))) {
    if (attacker.nationality === "日本" && attacker.stype === "駆逐艦") {
      attacker.bonus += 2 * num;
    }
  }

  // 227  https://wikiwiki.jp/kancolle/二式爆雷
  attacker.bonus += attacker
    .gearRfs("二式爆雷")
    .reduce((v, rf) => v + (rf >= 8 ? 1 : 0) + (rf >= 10 ? 1 : 0), 0);

  // 228  https://wikiwiki.jp/kancolle/九六式艦戦改
  if ((num = attacker.gearCount("九六式艦戦改"))) {
    if (["大鷹型", "春日丸級"].includes(attacker.ctype)) {
      attacker.bonus += 5 * num;
    } else if (attacker.ctype === "鳳翔型") {
      attacker.bonus += 4 * num;
      attacker.bonus += attacker.isKai2 ? 2 * num : 0;
    }
    if (attacker.stype === "軽空母") {
      attacker.bonus += 2 * num;
    }
  }

  // 229  https://wikiwiki.jp/kancolle/12.7cm単装高角砲%28後期型%29
  if ((num = attacker.gearCount("12.7cm単装高角砲(後期型)"))) {
    if (attacker.name === "雪風改二") {
      attacker.bonus += 2 * num;
    }
  }

  // 287  https://wikiwiki.jp/kancolle/三式爆雷投射機%20集中配備
  if ((num = attacker.gearCount("三式爆雷投射機 集中配備"))) {
    if (attacker.ctype === "香取型") {
      attacker.bonus += 3 * num;
    } else if (attacker.name === "能代改二") {
      attacker.bonus += 3 * num;
    } else if (
      ["夕張改二丁", "五十鈴改二", "那珂改二", "由良改二", "雪風改二"].includes(
        attacker.name
      )
    ) {
      attacker.bonus += num;
    }
  }

  // 288  https://wikiwiki.jp/kancolle/試製15cm9連装対潜噴進砲
  if ((num = attacker.gearCount("試製15cm9連装対潜噴進砲"))) {
    if (attacker.ctype === "香取型") {
      attacker.bonus = 3 * num;
    } else if (
      ["五十鈴改二", "那珂改二", "由良改二", "雪風改二"].includes(attacker.name)
    ) {
      attacker.bonus += 2 * num;
    } else if (attacker.name === "夕張改二丁") {
      attacker.bonus = 3 * num;
    } else if (attacker.name === "能代改二") {
      attacker.bonus += 4 * num;
    }
  }

  // 295  https://wikiwiki.jp/kancolle/12.7cm連装砲A型改三(戦時改修)＋高射装置
  if ((num = attacker.gearCount("12.7cm連装砲A型改三(戦時改修)+高射装置"))) {
    if (attacker.name === "磯波改二") {
      attacker.bonus += num;
    }
  }

  // 302  https://wikiwiki.jp/kancolle/九七式艦攻(九三一空／熟練)
  if ((num = attacker.gearCount("九七式艦攻(九三一空/熟練)"))) {
    if (attacker.ctype === "大鷹型") {
      attacker.bonus += num;
    }
  }

  // 304  https://wikiwiki.jp/kancolle/S9%20Osprey
  if ((num = attacker.gearCount("S9 Osprey"))) {
    if (["球磨型", "長良型", "川内型", "阿賀野型"].includes(attacker.ctype)) {
      attacker.bonus += num;
    } else if (attacker.yomi === "ゴトランド") {
      attacker.bonus += 2 * num;
    }
  }

  // 305  https://wikiwiki.jp/kancolle/Ju87C改二(KMX搭載機)
  // 306  https://wikiwiki.jp/kancolle/Ju87C改二(KMX搭載機／熟練)
  if (
    (num =
      attacker.gearCount("Ju87C改二(KMX搭載機)") +
      attacker.gearCount("Ju87C改二(KMX搭載機/熟練)"))
  ) {
    if (attacker.ctype === "大鷹型") {
      attacker.bonus += num;
    }
    if (attacker.yomi === "しんよう") {
      attacker.bonus += 2 * num;
    }
  }

  // 310  https://wikiwiki.jp/kancolle/14cm連装砲改
  if ((num = attacker.gearCount("14cm連装砲改"))) {
    if (attacker.ctype === "夕張型" && attacker.isKai2) {
      attacker.bonus += num;
    }
  }

  // 322  https://wikiwiki.jp/kancolle/瑞雲改二(六三四空)
  if ((num = attacker.gearCount("瑞雲改二(六三四空)"))) {
    if (attacker.ctype === "伊勢型" && attacker.isKai2) {
      attacker.bonus += num;
    }
  }

  // 323  https://wikiwiki.jp/kancolle/瑞雲改二(六三四空／熟練)
  if ((num = attacker.gearCount("瑞雲改二(六三四空/熟練)"))) {
    if (attacker.ctype === "伊勢型" && attacker.isKai2) {
      attacker.bonus += 2 * num;
    }
  }

  // 324  https://wikiwiki.jp/kancolle/オ号観測機改
  // 325  https://wikiwiki.jp/kancolle/オ号観測機改二
  if (
    (num =
      attacker.gearCount("オ号観測機改") + attacker.gearCount("オ号観測機改二"))
  ) {
    if (attacker.name === "伊勢改二") {
      attacker.bonus += 2 * num;
    } else if (attacker.name === "日向改二") {
      attacker.bonus += 3 * num;
    } else if (attacker.name === "加賀改二護") {
      attacker.bonus += 3 * num;
    }
  }

  // 326  https://wikiwiki.jp/kancolle/S-51J
  if ((num = attacker.gearCount("S-51J"))) {
    if (attacker.name === "伊勢改二") {
      attacker.bonus += 3 * num;
    } else if (attacker.name === "日向改二") {
      attacker.bonus += 4 * num;
    } else if (attacker.name === "加賀改二護") {
      attacker.bonus += 5 * num;
    }
  }

  // 327  https://wikiwiki.jp/kancolle/S-51J改
  if ((num = attacker.gearCount("S-51J改"))) {
    if (attacker.name === "伊勢改二") {
      attacker.bonus += 4 * num;
    } else if (attacker.name === "日向改二") {
      attacker.bonus += 5 * num;
    } else if (attacker.name === "加賀改二護") {
      attacker.bonus += 6 * num;
    }
  }

  // 344  https://wikiwiki.jp/kancolle/九七式艦攻改%20試製三号戊型(空六号電探改装備機)
  // 344  https://wikiwiki.jp/kancolle/九七式艦攻改(熟練)%20試製三号戊型(空六号電探改装備機)
  if (
    (num =
      attacker.gearCount("九七式艦攻改 試製三号戊型(空六号電探改装備機)") +
      attacker.gearCount("九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)"))
  ) {
    if (["龍鳳改", "祥鳳改"].includes(attacker.name)) {
      attacker.bonus += num;
    } else if (["龍鳳改二", "龍鳳改二戊"].includes(attacker.name)) {
      attacker.bonus += 2 * num;
    } else if (["瑞鳳改二", "瑞鳳改二乙"].includes(attacker.name)) {
      attacker.bonus += 2 * num;
    }
  }

  // 367  https://wikiwiki.jp/kancolle/Swordfish(水上機型)
  if ((num = attacker.gearCount("Swordfish(水上機型)"))) {
    if (attacker.ctype === "C.Teste級") {
      attacker.bonus += num;
    } else if (attacker.ctype === "Gotland級") {
      attacker.bonus += num;
    }
  }

  // 368  https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型)
  if ((num = attacker.gearCount("Swordfish Mk.III改(水上機型)"))) {
    if (attacker.ctype === "C.Teste級") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "Gotland級") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "瑞穂型") {
      attacker.bonus += 2 * num;
    } else if (attacker.ctype === "神威型") {
      attacker.bonus += 2 * num;
    }
  }

  // 369  https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型／熟練)
  if ((num = attacker.gearCount("Swordfish Mk.III改(水上機型/熟練)"))) {
    if (attacker.ctype === "C.Teste級") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "Gotland級") {
      attacker.bonus += 4 * num;
    } else if (attacker.ctype === "瑞穂型") {
      attacker.bonus += 2 * num;
    } else if (attacker.ctype === "神威型") {
      attacker.bonus += 2 * num;
    }
  }

  // 370  https://wikiwiki.jp/kancolle/Swordfish%20Mk.II改(水偵型)
  if ((num = attacker.gearCount("Swordfish Mk.II改(水偵型)"))) {
    if (attacker.ctype === "C.Teste級") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "Gotland級") {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "瑞穂型") {
      attacker.bonus += 2 * num;
    } else if (attacker.ctype === "神威型") {
      attacker.bonus += 2 * num;
    } else if (attacker.nationality === "イギリス") {
      attacker.bonus += 3 * num;
    }
  }

  // 371  https://wikiwiki.jp/kancolle/Fairey%20Seafox改
  if ((num = attacker.gearCount("Fairey Seafox改"))) {
    if (attacker.ctype === "C.Teste級") {
      attacker.bonus += num;
    } else if (attacker.ctype === "Gotland級") {
      attacker.bonus += 2 * num;
    } else if (attacker.nationality === "イギリス") {
      attacker.bonus += num;
    }
  }

  // 372  https://wikiwiki.jp/kancolle/天山一二型甲
  if ((num = attacker.gearCount("天山一二型甲"))) {
    if (attacker.ctype === "祥鳳型") {
      attacker.bonus += num;
    } else if (attacker.ctype === "龍鳳型") {
      attacker.bonus += num;
    }
  }

  // 373  https://wikiwiki.jp/kancolle/天山一二型甲改(空六号電探改装備機)
  if ((num = attacker.gearCount("天山一二型甲改(空六号電探改装備機)"))) {
    if (attacker.ctype === "祥鳳型") {
      attacker.bonus += num;
      attacker.bonus += attacker.isKai2 ? num : 0;
    } else if (attacker.ctype === "龍鳳型") {
      attacker.bonus += num;
      attacker.bonus += attacker.isKaiPlus ? num : 0;
    }
  }

  // 374  https://wikiwiki.jp/kancolle/天山一二型甲改(熟練／空六号電探改装備機)
  if ((num = attacker.gearCount("天山一二型甲改(熟練/空六号電探改装備機)"))) {
    if (attacker.ctype === "祥鳳型") {
      attacker.bonus += num;
      attacker.bonus += attacker.isKaiPlus ? num : 0;
      attacker.bonus += attacker.isKai2 ? num : 0;
    } else if (attacker.ctype === "龍鳳型") {
      attacker.bonus += 2 * num;
      attacker.bonus += attacker.isKaiPlus ? num : 0;
    } else if (attacker.ctype === "千歳型" && attacker.stype === "軽空母") {
      attacker.bonus += attacker.isKaiPlus ? num : 0;
    } else if (["鈴谷改二航", "熊野改二航"].includes(attacker.name)) {
      attacker.bonus += num;
    }
  }

  // 375  https://wikiwiki.jp/kancolle/XF5U
  if ((num = attacker.gearCount("XF5U"))) {
    if (
      attacker.nationality === "アメリカ" &&
      ["軽空母", "正規空母", "装甲空母"].includes(attacker.stype)
    ) {
      attacker.bonus += 3 * num;
    } else if (attacker.ctype === "加賀型") {
      attacker.bonus += num;
    }
  }

  // 379  https://wikiwiki.jp/kancolle/12.7cm単装高角砲改二
  if ((num = attacker.gearCount("12.7cm単装高角砲改二"))) {
    if (attacker.ctype === "夕張型") {
      attacker.bonus += num;
      attacker.bonus += attacker.name === "夕張改二丁" ? 2 * num : 0;
    } else if (["いすず", "ゆら", "なか", "きぬ"].includes(attacker.yomi)) {
      attacker.bonus += num;
      attacker.bonus += attacker.isKai2 ? num : 0;
    } else if (attacker.ctype === "天龍型" && attacker.isKai2) {
      attacker.bonus += 2 * num;
    } else if (attacker.name === "雪風改二") {
      attacker.bonus += 2 * num;
    }
  }

  // 380  https://wikiwiki.jp/kancolle/12.7cm連装高角砲改二
  if ((num = attacker.gearCount("12.7cm連装高角砲改二"))) {
    if (attacker.ctype === "夕張型") {
      attacker.bonus += num;
      attacker.bonus += attacker.name === "夕張改二丁" ? 2 * num : 0;
    } else if (["いすず", "ゆら", "なか", "きぬ"].includes(attacker.yomi)) {
      attacker.bonus += num;
      attacker.bonus += attacker.isKai2 ? num : 0;
    } else if (attacker.ctype === "天龍型" && attacker.isKai2) {
      attacker.bonus += 2 * num;
    }
  }

  // 382  https://wikiwiki.jp/kancolle/12cm単装高角砲E型
  if ((num = attacker.gearCount("12cm単装高角砲E型"))) {
    if (attacker.stype === "海防艦") {
      attacker.bonus += num;
    }
  }

  // 389  https://wikiwiki.jp/kancolle/TBM-3W%20＋%203S
  if ((num = attacker.gearCount("TBM-3W+3S"))) {
    if (attacker.nationality === "アメリカ") {
      attacker.bonus += 3 * num;
    } else if (attacker.name === "加賀改二護") {
      attacker.bonus += 4 * num;
    }
  }

  // 408  https://wikiwiki.jp/kancolle/装甲艇(AB艇)
  // 409  https://wikiwiki.jp/kancolle/武装大発
  if (
    (num = attacker.gearCount("装甲艇(AB艇)") + attacker.gearCount("武装大発"))
  ) {
    if (attacker.yomi === "あきつまる") {
      attacker.bonus += num;
    }
  }

  // 425  https://wikiwiki.jp/kancolle/Barracuda%20Mk.III
  if ((num = attacker.gearCount("Barracuda Mk.III"))) {
    if (
      attacker.nationality === "イギリス" &&
      ["軽空母", "正規空母", "装甲空母"].includes(attacker.stype)
    ) {
      attacker.bonus += 2 * num;
      const rfs: number[] = attacker.gearRfs("Barracuda Mk.III");
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 2 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 6 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
    }
  }

  // 438  https://wikiwiki.jp/kancolle/三式水中探信儀改
  if ((num = attacker.gearCount("三式水中探信儀改"))) {
    if (
      [
        "かみかぜ",
        "はるかぜ",
        "しぐれ",
        "やまかぜ",
        "まいかぜ",
        "あさしも",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 3 * num;
    } else if (
      [
        "うしお",
        "いかずち",
        "やまぐも",
        "いそかぜ",
        "はまかぜ",
        "きしなみ",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 2 * num;
    }
  }

  // 447  https://wikiwiki.jp/kancolle/零式艦戦64型%28複座KMX搭載機%29
  if ((num = attacker.gearCount("零式艦戦64型(複座KMX搭載機)"))) {
    if (attacker.ctype === "大鷹型") {
      attacker.bonus += num;
    }
    if (attacker.yomi === "うんよう") {
      attacker.bonus += num;
    } else if (attacker.yomi === "たいげい・りゅうほう") {
      attacker.bonus += 2 * num;
    } else if (attacker.yomi === "ほうしょう") {
      attacker.bonus += 2 * num;
      attacker.bonus += attacker.isKai2 ? num : 0;
    }
    const rfs: number[] = attacker.gearRfs("零式艦戦64型(複座KMX搭載機)");
    attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 6 ? 1 : 0), 0);
    attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
  }

  // 451 https://wikiwiki.jp/kancolle/三式指揮連絡機改
  if ((num = attacker.gearCount("三式指揮連絡機改"))) {
    const rfs: number[] = attacker.gearRfs("三式指揮連絡機改");
    if (attacker.yomi === "やましおまる") {
      attacker.bonus += 3 * num;
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 3 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 8 ? 1 : 0), 0);
    } else if (attacker.yomi === "あきつまる") {
      attacker.bonus += 2 * num;
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 3 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 7 ? 1 : 0), 0);
    }
  }

  // 455 https://wikiwiki.jp/kancolle/試製%20長12.7cm連装砲A型改四
  if ((num = attacker.gearCount("試製 長12.7cm連装砲A型改四"))) {
    if (attacker.name === "浦波改二") {
      attacker.bonus += num;
    } else if (attacker.name === "磯波改二") {
      attacker.bonus += num;
    }
  }

  // 472 https://wikiwiki.jp/kancolle/Mk.32%20対潜魚雷(Mk.2落射機)
  if ((num = attacker.gearCount("Mk.32 対潜魚雷(Mk.2落射機)"))) {
    if (attacker.nationality === "アメリカ") {
      attacker.bonus += 2 * num;
      attacker.bonus += attacker.name === "Samuel B.Roberts Mk.II" ? 1 : 0;
    } else if (attacker.nationality === "イギリス") {
      attacker.bonus += num;
    }
  }

  // 488 https://wikiwiki.jp/kancolle/二式爆雷改二
  if ((num = attacker.gearCount("二式爆雷改二"))) {
    if (
      attacker.nationality === "日本" &&
      ["海防艦", "駆逐艦"].includes(attacker.stype) &&
      attacker.ctype !== "御蔵型"
    ) {
      attacker.bonus += num;
    }

    const rfs: number[] = attacker.gearRfs("二式爆雷改二");
    if (attacker.name === "時雨改二") {
      attacker.bonus += 5 * num;
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 5 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 9 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
    } else if (
      ["磯風乙改", "浜風乙改", "雪風改", "雪風改二", "丹陽", "時雨改"].includes(
        attacker.name
      )
    ) {
      attacker.bonus += 2 * num;
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 5 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
    } else if (
      [
        "扶桑改二",
        "山城改二",
        "響改",
        "潮改二",
        "冬月改",
        "涼月改",
        "初霜改二",
        "矢矧改二",
        "矢矧改二乙",
        "時雨",
      ].includes(attacker.name)
    ) {
      attacker.bonus += num;
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 5 ? 1 : 0), 0);
      attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
    }
  }

  //  489 https://wikiwiki.jp/kancolle/一式戦%20隼II型改(20戦隊)
  if ((num = attacker.gearCount("一式戦 隼II型改(20戦隊)"))) {
    if (attacker.yomi === "やましおまる") {
      attacker.bonus += num;
      attacker.bonus += attacker.isKai ? num : 0;
    } else if (attacker.yomi === "あきつまる") {
      attacker.bonus += num;
    }
    const rfs: number[] = attacker.gearRfs("一式戦 隼II型改(20戦隊)");
    attacker.bonus += rfs.reduce((v1, v2) => v1 + (v2 >= 6 ? 1 : 0), 0);
  }

  //-------------------------------------------------------------------------//
  //                             >> single <<                                //
  //                                                                         //
  //                     bonus += conditions ? constant : 0                  //
  //                                                                         //
  //                     [multiple, single, synergy]                         //
  //                                ^^^^^^                                   //
  //-------------------------------------------------------------------------//

  // 水上偵察機
  if (attacker.isEquipReconSeaplane()) {
    if (attacker.ctype === "阿賀野型" && attacker.isKai2) {
      attacker.bonus += 3;
    }
  }

  // 水上爆撃機
  if (attacker.isEquipSeaplaneBomber()) {
    if (attacker.ctype === "阿賀野型" && attacker.isKai2) {
      attacker.bonus += 1;
    }
  }

  // 回転翼機
  if (attacker.isEquipAutogyro() || attacker.isEquipHelicopter()) {
    if (attacker.name === "能代改二") {
      attacker.bonus += 4;
    } else if (["矢矧改二", "矢矧改二乙"].includes(attacker.name)) {
      attacker.bonus += 3;
    }
  }

  // 国産ソナー
  // 46
  // 47
  // 132
  // 149
  // 438
  if (attacker.isEquipJapanSonar()) {
    if (attacker.ctype === "香取型") {
      attacker.bonus += 2;
    }
  }

  // 132  https://wikiwiki.jp/kancolle/零式水中聴音機
  if (attacker.gearCount("零式水中聴音機")) {
    const maxRf = Math.max(...attacker.gearRfs("零式水中聴音機"));
    attacker.bonus += maxRf >= 5 ? 1 : 0;
    attacker.bonus += maxRf >= 8 ? 1 : 0;
    attacker.bonus += maxRf >= 10 ? 1 : 0;
  }

  // 149  https://wikiwiki.jp/kancolle/四式水中聴音機
  if (attacker.gearCount("四式水中聴音機")) {
    if (attacker.ctype === "秋月型") {
      attacker.bonus += 1;
    } else if (
      [
        "雪風改二",
        "五十鈴改二",
        "由良改二",
        "那珂改二",
        "夕張改二",
        "夕張改二特",
      ].includes(attacker.name)
    ) {
      attacker.bonus += 1;
    } else if (attacker.name === "夕張改二丁") {
      attacker.bonus += 3;
    } else if (attacker.name === "能代改二") {
      attacker.bonus += 2;
    }
  }

  // 346 https://wikiwiki.jp/kancolle/二式12cm迫撃砲改
  if (attacker.gearCount("二式12cm迫撃砲改")) {
    if (attacker.yomi === "やましおまる") {
      attacker.bonus += 1;
    }
  }

  // 347 https://wikiwiki.jp/kancolle/二式12cm迫撃砲改%20集中配備
  if (attacker.gearCount("二式12cm迫撃砲改 集中配備")) {
    if (attacker.yomi === "やましおまる") {
      attacker.bonus += 2;
    }
  }

  // 377  https://wikiwiki.jp/kancolle/RUR-4A%20Weapon%20Alpha改
  if (attacker.gearCount("RUR-4A Weapon Alpha改")) {
    if (attacker.nationality === "アメリカ") {
      attacker.bonus += 2;
      attacker.bonus += attacker.name === "Fletcher Mk.II" ? 1 : 0;
    } else if (["イギリス", "オーストラリア"].includes(attacker.nationality)) {
      attacker.bonus += 1;
    } else if (["丹陽", "雪風改二"].includes(attacker.name)) {
      attacker.bonus += 1;
    }
  }

  // 412  https://wikiwiki.jp/kancolle/水雷戦隊%20熟練見張員
  if (attacker.gearCount("水雷戦隊 熟練見張員")) {
    if (attacker.nationality === "日本" && attacker.stype === "駆逐艦") {
      attacker.bonus += 2;
    }
  }

  // 415  https://wikiwiki.jp/kancolle/SO3C%20Seamew改
  if (attacker.gearCount("SO3C Seamew改")) {
    if (attacker.nationality === "アメリカ") {
      attacker.bonus += 1;
    }
  }

  // 438  https://wikiwiki.jp/kancolle/三式水中探信儀改
  if (attacker.gearCount("三式水中探信儀改")) {
    if (["那珂改二", "由良改二", "五十鈴改二"].includes(attacker.name)) {
      attacker.bonus += 1;
    } else if (["みくら", "いしがき"].includes(attacker.yomi)) {
      attacker.bonus += 1;
    } else if (attacker.nationality === "日本" && attacker.stype === "駆逐艦") {
      attacker.bonus += 1;
    }
    if (
      [
        "うしお",
        "まいかぜ",
        "いそかぜ",
        "はまかぜ",
        "いかずち",
        "やまぐも",
        "うみかぜ",
        "かわかぜ",
        "すずかぜ",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 1;
    }
    if (
      [
        "しぐれ",
        "やまかぜ",
        "かみかぜ",
        "はるかぜ",
        //"みくら",
        //"いしがき",
      ].includes(attacker.yomi)
    ) {
      attacker.bonus += 1;
    }
    if (
      [
        "時雨改二", //?
        "時雨改三",
        "春風改",
        "神風改",
        "朝霜改二",
        "山風改二",
        "山風改二丁",
      ].includes(attacker.name)
    ) {
      const maxRf: number = attacker
        .gearRfs("三式水中探信儀改")
        .reduce((v1, v2) => Math.max(v1, v2), -Infinity);
      attacker.bonus += maxRf >= 4 ? 1 : 0;
      attacker.bonus += maxRf >= 8 ? 1 : 0;
    }
  }

  // 378  https://wikiwiki.jp/kancolle/対潜短魚雷(試作初期型)
  if (attacker.gearCount("対潜短魚雷(試作初期型)")) {
    if (attacker.nationality === "アメリカ") {
      attacker.bonus += 3;
      attacker.bonus += attacker.name === "Fletcher Mk.II" ? 1 : 0;
    } else if (attacker.nationality === "イギリス") {
      attacker.bonus += 2;
    } else if (attacker.nationality === "オーストラリア") {
      attacker.bonus += 1;
    } else if (["丹陽", "雪風改二"].includes(attacker.name)) {
      attacker.bonus += 1;
    }
  }

  // 439 https://wikiwiki.jp/kancolle/Hedgehog%28初期型%29
  if (attacker.gearCount("Hedgehog(初期型)")) {
    if (["駆逐艦", "軽巡洋艦", "練習巡洋艦"].includes(attacker.stype)) {
      attacker.bonus += 1;
    } else if (attacker.stype === "海防艦") {
      attacker.bonus += 2;
      attacker.bonus += attacker.ctype === "松型" ? 1 : 0;
    }
    if (["アメリカ", "イギリス"].includes(attacker.nationality)) {
      attacker.bonus += 2;
    }
  }

  //-------------------------------------------------------------------------//
  //                             >> synergy <<                               //
  //                                                                         //
  //         bonus += cond_1 && cond_2 ... & cond_N ? constant : 0           //
  //                                                                         //
  //                     [multiple, single, synergy]                         //
  //                                        ^^^^^^^                          //
  //-------------------------------------------------------------------------//

  // 水上電探 && 12cm単装砲改二 && (占守型 || 択捉型)
  // 293 https://wikiwiki.jp/kancolle/12cm単装砲改二
  if (attacker.isEquipSurfaceRadar() && attacker.gearCount("12cm単装砲改二")) {
    if (["占守型", "択捉型"].includes(attacker.ctype)) {
      attacker.bonus += 1;
    }
  }

  // オートジャイロ && つよつよTBM && 加賀改二護
  // 389  https://wikiwiki.jp/kancolle/TBM-3W%20＋%203S
  if (attacker.isEquipAutogyro() && attacker.gearCount("TBM-3W+3S")) {
    if (attacker.name === "加賀改二護") {
      attacker.bonus += 6;
    }
  }

  // ヘリコプター && つよつよTBM && 加賀改二護
  // 389  https://wikiwiki.jp/kancolle/TBM-3W%20＋%203S
  if (attacker.isEquipHelicopter() && attacker.gearCount("TBM-3W+3S")) {
    if (attacker.name === "加賀改二護") {
      attacker.bonus += 4;
    }
  }

  // [[noreturn]]
}
