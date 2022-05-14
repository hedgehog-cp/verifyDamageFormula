/**
 * @classdesc ある攻撃艦1隻のクラス 艦娘を想定
 * @param {number} attackerId 攻撃艦の艦船ID
 * @param {Array<number>} gearId 攻撃艦の装備ID
 * @param {Array<number>} gearRf 攻撃艦の装備改修値
 */
class TpAttacker {
  constructor(attackerId, gearId, gearRf) {
    /** @type {number} 攻撃艦の艦船ID */
    this.id = attackerId;
    /** @type {number} api_mst_shipでの位置 */
    this.index = TpAttacker.binarySearch(this.id, api_mst_ship.map(ship => ship.api_id));
    /** @type {JSON} アクセスのショートカットのため */
    this.elem = api_mst_ship[this.index];

    /** @type {string} 攻撃艦の艦名 */
    this.name = this.elem.api_name;
    /** @type {string} 攻撃艦のよみ */
    this.yomi = this.elem.api_yomi;
    /** @type {string} 攻撃艦の艦種 */
    this.stype = SHIP_TYPE.find(e => e.stype == this.elem.api_stype).name;
    /** @type {string} 攻撃艦の艦型 */
    this.ctype = CLASS_TYPE.find(e => e.ctype == this.elem.api_ctype).name;
    /** @type {string} 攻撃艦の国籍 main.jsに書いてあるらしい */
    this.country = CLASS_TYPE.find(e => e.ctype == this.elem.api_ctype).country;
    /** @type {Array<number>} 攻撃艦の装備ID */
    this.gearId = [...gearId.filter(id => id > 0)];
    /** @type {Array<number>} 攻撃艦の装備改修値 */
    this.gearRf = [...gearRf.filter((rf, i) => this.gearId[i] > 0)];

    /** @type スロットごとの砲撃戦.航空攻撃 雷装装備ボーナス */
    this.tpBonusPerSlot = new Array(this.gearId.length).fill(Infinity);
    /** @type 最小砲撃戦.航空攻撃 雷装装備ボーナス */
    this.tpBonus = Infinity;
  };

  /**
   * @method bunarySearch 二分探索して、その位置を返す
   * @param {number} searchValue 検索値
   * @param {Array<number>} sortedData 昇順ソート済みの検索対象データ
   * @return {number} 位置を返す エラーは-1
   * @see https://qiita.com/may88seiji/items/189002cb497e61578114
   */
  static binarySearch(searchValue, sortedData) {
    let index = -1;
    let left = 0;
    let right = sortedData.length - 1;
    let middle;
    while (left <= right) {
      middle = Math.floor((left + right) / 2);
      if (sortedData[middle] == searchValue) {
        index = middle;
        break;
      } else if (sortedData[middle] < searchValue) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    return index;
  }
}

/**
 * @function getTpBonus 引数に与えられた攻撃艦1隻の砲撃戦.航空攻撃 雷装装備ボーナスを取得する
 * @param {TpAttacker} attacker 攻撃艦1隻
 * @returns {Array<number>} 砲撃戦.航空攻撃 雷装装備ボーナス[]
 */
function getTpBonus(attacker) {

  // 装備スロット1つずつ
  for (let i = 0; i < attacker.gearId.length; i++) {

    // 368	https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型)
    if (attacker.gearId[i] == GEAR_ID_MAP['Swordfish Mk.III改(水上機型)']) {
      if (attacker.name == 'Gotoland andra') {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      }
    }

    // 369	https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型／熟練)
    if (attacker.gearId[i] == GEAR_ID_MAP['Swordfish Mk.III改(水上機型/熟練)']) {
      if (attacker.name == 'Gotoland andra') {
        attacker.tpBonusPerSlot[i] = 3;
        continue;
      }
    }

    // 372	https://wikiwiki.jp/kancolle/天山一二型甲
    if (attacker.gearId[i] == GEAR_ID_MAP['天山一二型甲']) {
      if (['龍鳳改二', '龍鳳改二戊'].includes(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (['翔鶴型', '大鳳型'].includes(attacker.ctype)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      }
    }

    // 373	https://wikiwiki.jp/kancolle/天山一二型甲改(空六号電探改装備機)
    if (attacker.gearId[i] == GEAR_ID_MAP['天山一二型甲改(空六号電探改装備機)']) {
      if (attacker.name == '龍鳳改二戊') {
        attacker.tpBonusPerSlot[i] = 3;
        continue;
      } else if (attacker.name == '龍鳳改二') {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (['翔鶴型', '大鳳型'].includes(attacker.ctype)) {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (attacker.ctype == '最上型' && /航改二/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (['龍鳳', '龍鳳改'].includes(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      } else if (attacker.ctype == '祥鳳型' && /改/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      } else if (attacker.ctype == '千歳型' && /航改/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      } else if (attacker.ctype == '飛鷹型') {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      }
    }

    // 374	https://wikiwiki.jp/kancolle/天山一二型甲改(熟練／空六号電探改装備機)
    if (attacker.gearId[i] == GEAR_ID_MAP['天山一二型甲改(熟練/空六号電探改装備機)']) {
      if (attacker.ctype == '翔鶴型' && /改二/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 3;
        continue;
      } else if (['大鳳改', '龍鳳改二戊'].includes(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 3;
        continue;
      } else if (attacker.ctype == '最上型' && /航改二/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (['龍鳳改二', '飛鷹改', '隼鷹改二'].includes(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 2;
        continue;
      } else if (attacker.name == '龍鳳改') {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      } else if (attacker.ctype == '祥鳳型' && /改/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      } else if (attacker.ctype == '千歳型' && /航改二/.test(attacker.name)) {
        attacker.tpBonusPerSlot[i] = 1;
        continue;
      }
    }

    // 424	https://wikiwiki.jp/kancolle/Barracuda%20Mk.II
    if (attacker.gearId[i] == GEAR_ID_MAP['Barracuda Mk.II']) {
      if (attacker.country == 'イギリス' && ['軽空母', '正規空母', '装甲空母'].includes(attacker.stype)) {
        attacker.tpBonusPerSlot[i] = 3;
        continue;
      }
    }

    // 425	https://wikiwiki.jp/kancolle/Barracuda%20Mk.III
    if (attacker.gearId[i] == GEAR_ID_MAP['Barracuda Mk.III']) {
      if (attacker.country == 'イギリス' && ['軽空母', '正規空母', '装甲空母'].includes(attacker.stype)) {
        attacker.tpBonusPerSlot[i] = 1;
        attacker.tpBonusPerSlot[i] = attacker.gearRf[i] >= 8 ? 1 : 0;
      }
    }

  } // for

  // 砲撃戦.航空攻撃 雷装ボーナスの最小値を取得する
  attacker.tpBonus = attacker.tpBonusPerSlot.reduce((v1, v2) => Math.min(v1, v2), Infinity);
  if (attacker.tpBonus == Infinity) {
    attacker.tpBonus = 0;
  }
}

/**
 * @customfunction 砲撃戦.航空攻撃 雷装装備ボーナスを取得する
 * @param {Array<number>} attackerId 攻撃艦の艦船ID
 * @param {Array<Array<number>>} gearId 攻撃艦の装備ID
 * @param {Array<Array<number>>} gearRf 攻撃艦の装備改修値
 * @returns {Array<number>} 砲撃戦.航空攻撃 雷装装備ボーナス
 */
function tpBonus(attackerId, gearId, gearRf) {

  // 処理する行サイズ
  const ROW_SIZE = attackerId.reduce((v1, v2) => v1 + (v2 > 0 ? 1 : 0), 0);

  // 攻撃艦
  let attacker = new Array(ROW_SIZE);

  // 行サイズぶんだけ砲撃戦.航空攻撃 雷装装備ボーナスを取得
  for (let i = 0; i < ROW_SIZE; i++) {
    attacker[i] = new TpAttacker(attackerId[i], gearId[i], gearRf[i]);
    getTpBonus(attacker[i]);
  }

  // 砲撃戦.航空攻撃 雷装装備ボーナスを返す
  return attacker.map(ship => ship.tpBonus);
}