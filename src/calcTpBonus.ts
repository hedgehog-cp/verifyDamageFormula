/**
 * @customfunction 砲撃戦.航空攻撃 雷装装備ボーナスを取得する
 * @returns 砲撃戦.航空攻撃 雷装装備ボーナス
 * スプレッドシートから入ってくる数字は, value()を通していたとしても文字列となる.
 * しかし, parseInt()などを実行すると処理が遅くなるので, 厳密でない等価比較でtcsを騙す.
 */
function tpBonus(
  attackerIds: number[], // 実際はstring[]
  gearIds: number[][], // 実際はstring[][]
  gearRfs: number[][] // 実際はstring[][]
) {
  // 処理する行サイズ
  const ROW_SIZE = attackerIds.reduce((v1, v2) => v1 + (v2 > 0 ? 1 : 0), 0);

  // 攻撃艦
  let attackers = new Array(ROW_SIZE);

  // 行サイズぶんだけ砲撃戦.航空攻撃 雷装装備ボーナスを取得
  for (let i = 0; i < ROW_SIZE; i++) {
    attackers[i] = new TpAttacker(attackerIds[i], gearIds[i], gearRfs[i]);
    calcTpBonus(attackers[i]);
  }

  // 砲撃戦.航空攻撃 雷装装備ボーナスを返す
  return attackers.map((e: TpAttacker) => e.bonus);
}

/**
 * @function calcAswBonus 引数に与えられた攻撃艦1隻の砲撃戦.航空攻撃 雷装装備ボーナスを計算する
 * @param attacker 攻撃艦1隻(艦娘を想定)
 * @see https://github.com/KC3Kai/KC3Kai/blob/master/src/library/objects/GearBonus.js
 * @see https://docs.google.com/spreadsheets/d/1bInH11S_xKdaKP754bB7SYh-di9gGzcXkiQPvGuzCpg/edit#gid=843064990
 */
function calcTpBonus(attacker: TpAttacker) {
  const SLOT_SIZE = 6;
  for (let i = 0; i < SLOT_SIZE; i++) {
    // 368	https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型)
    if (
      attacker.gearIds[i] == GEAR_NAME_ID_MAP["Swordfish Mk.III改(水上機型)"]
    ) {
      if (attacker.name === "Gotoland andra") {
        attacker.bonuses[i] = 2;
        continue;
      }
    }

    // 369	https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型／熟練)
    if (
      attacker.gearIds[i] ==
      GEAR_NAME_ID_MAP["Swordfish Mk.III改(水上機型/熟練)"]
    ) {
      if (attacker.name === "Gotoland andra") {
        attacker.bonuses[i] = 3;
        continue;
      }
    }

    // 372	https://wikiwiki.jp/kancolle/天山一二型甲
    if (attacker.gearIds[i] == GEAR_NAME_ID_MAP["天山一二型甲"]) {
      if (attacker.ctype == "祥鳳型" && attacker.isKai2) {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "翔鶴型") {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "大鳳型") {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "龍鳳型") {
        attacker.bonuses[i] = attacker.isKaiPlus ? 1 : 0;
        attacker.bonuses[i] += attacker.isKai2 ? 1 : 0;
        continue;
      }
    }

    // 373	https://wikiwiki.jp/kancolle/天山一二型甲改(空六号電探改装備機)
    if (
      attacker.gearIds[i] ==
      GEAR_NAME_ID_MAP["天山一二型甲改(空六号電探改装備機)"]
    ) {
      if (attacker.ctype === "祥鳳型" && attacker.isKaiPlus) {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "龍鳳型") {
        attacker.bonuses[i] = 1;
        attacker.bonuses[i] += attacker.name == "龍鳳改二" ? 1 : 0;
        attacker.bonuses[i] += attacker.name == "龍鳳改二戊" ? 2 : 0;
        continue;
      } else if (attacker.ctype === "千歳型" && /航改/.test(attacker.name)) {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "飛鷹型") {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "翔鶴型") {
        attacker.bonuses[i] = 2;
        continue;
      } else if (attacker.ctype === "大鳳型") {
        attacker.bonuses[i] = 2;
        continue;
      } else if (["鈴谷航改二", "熊野航改二"].includes(attacker.name)) {
        attacker.bonuses[i] = 2;
        continue;
      }
    }

    // 374	https://wikiwiki.jp/kancolle/天山一二型甲改(熟練／空六号電探改装備機)
    if (
      attacker.gearIds[i] ==
      GEAR_NAME_ID_MAP["天山一二型甲改(熟練/空六号電探改装備機)"]
    ) {
      if (attacker.ctype === "祥鳳型" && attacker.isKaiPlus) {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "龍鳳型") {
        attacker.bonuses[i] = 1;
        attacker.bonuses[i] += attacker.name === "龍鳳改二" ? 1 : 0;
        attacker.bonuses[i] += attacker.name === "龍鳳改二戊" ? 2 : 0;
        continue;
      } else if (attacker.ctype === "千歳型") {
        attacker.bonuses[i] = 1;
        continue;
      } else if (attacker.ctype === "飛鷹型") {
        attacker.bonuses[i] = 2;
        continue;
      } else if (attacker.ctype === "翔鶴型") {
        attacker.bonuses[i] = 3;
        continue;
      } else if (attacker.ctype === "大鳳型") {
        attacker.bonuses[i] = 3;
        continue;
      } else if (["鈴谷航改二", "熊野航改二"].includes(attacker.name)) {
        attacker.bonuses[i] = 2;
        continue;
      }
    }

    // 424	https://wikiwiki.jp/kancolle/Barracuda%20Mk.II
    if (attacker.gearIds[i] == GEAR_NAME_ID_MAP["Barracuda Mk.II"]) {
      if (
        attacker.nationality === "イギリス" &&
        ["軽空母", "正規空母", "装甲空母"].includes(attacker.stype)
      ) {
        attacker.bonuses[i] = 3;
        continue;
      }
    }

    // 425	https://wikiwiki.jp/kancolle/Barracuda%20Mk.III
    if (attacker.gearIds[i] == GEAR_NAME_ID_MAP["Barracuda Mk.III"]) {
      if (
        attacker.nationality === "イギリス" &&
        ["軽空母", "正規空母", "装甲空母"].includes(attacker.stype)
      ) {
        attacker.bonuses[i] = 1;
        attacker.bonuses[i] += attacker.gearRfs[i] >= 8 ? 1 : 0;
        continue;
      }
    }

    // 478  https://wikiwiki.jp/kancolle/熟練甲板要員＋航空整備員
    // スプレに直接記述
  } // for

  const minBonus = Math.min(...attacker.bonuses);
  attacker.bonus = Number.isFinite(minBonus) ? minBonus : 0;
}
