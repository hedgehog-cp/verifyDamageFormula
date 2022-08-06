/**
 * @classdesc ある攻撃艦1隻のクラス 艦娘を想定
 * @param {number} attackerId 攻撃艦の艦船ID
 * @param {Array<number>} gearId 攻撃艦の装備ID
 * @param {Array<number>} gearRf 攻撃艦の装備改修値
 */
class AswAttacker {
  constructor(attackerId, gearId, gearRf) {
    /** @type {number} 攻撃艦の艦船ID */
    this.id = attackerId;
    /** @type {number} api_mst_shipでの位置 */
    this.index = AswAttacker.binarySearch(this.id, api_mst_ship.map(ship => ship.api_id));
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

    /** @type {boolean} 水上電探を装備しているか */
    this.isEquipSurfaceRadar = this.gearId.some(id => AswAttacker.isSurfaceRadar(id));
    /** @type {boolean} 水上偵察機を装備しているか */
    this.isEquipReconSeaplane = this.gearId.some(id => AswAttacker.isReconSeaplane(id));
    /** @type {boolean} 水上爆撃機を装備しているか */
    this.isEquipSeaplaneBomber = this.gearId.some(id => AswAttacker.isSeaplaneBomber(id));
    /** @type {boolean} 国産爆雷投射機を装備しているか [未使用] */
    // this.isEquipJapanDepthChargeProjector = this.gearId.some(id => AswAttacker.isJapaneseDepthChargeProjector(id));
    /** @type {boolean} 国産ソナーを装備しているか */
    this.isEquipJapanSonar = this.gearId.some(id => AswAttacker.isJapaneseSonar(id));
    /** @type {boolean} オートジャイロを装備しているか */
    this.isEquipAutogyro = this.gearId.some(id => AswAttacker.isAutogyro(id));
    /** @type {boolean} 回転翼機を装備しているか */
    this.isEquipHelicopter = this.gearId.some(id => AswAttacker.isHelicopter(id));
    /** @type {boolean} 二式爆雷を装備しているか */
    this.isEquipType2DepthCharge = this.gearId.some(id => AswAttacker.isType2DepthCharge(id));

    /** @type 対潜装備ボーナス */
    this.aswBonus = 0;
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

  /**
   * @method getGearPictureBook 与えた装備IDの図鑑表示IDを返す
   * @param {number} id 装備ID
   * @return {number} 装備の図鑑表示IDを返す
   */
  static getGearPictureBook(id) {
    const pictureBookIndex = 1;
    const gearIndex = AswAttacker.binarySearch(id, api_mst_slotitem.map(item => item.api_id));
    return api_mst_slotitem[gearIndex].api_type[pictureBookIndex];
  };

  /**
   * @method getGearCategory 与えた装備IDのカテゴリIDを返す
   * @param {number} id 装備ID
   * @return {number} 装備のカテゴリIDを返す
   */
  static getGearCategory(id) {
    const categoryIndex = 2;
    const gearIndex = AswAttacker.binarySearch(id, api_mst_slotitem.map(item => item.api_id));
    return api_mst_slotitem[gearIndex].api_type[categoryIndex];
  };

  /**
   * @method getGearSakuValue 与えた装備IDの装備索敵値を返す
   * @param {number} id 装備ID
   * @return {number} 装備索敵値を返す
   */
  static getGearSakuValue(id) {
    const gearIndex = AswAttacker.binarySearch(id, api_mst_slotitem.map(item => item.api_id));
    return api_mst_slotitem[gearIndex].api_saku;
  };

  /**
   * @method isSurfaceRadar 与えた装備IDが水上電探であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 水上電探であればtrue、そうでなければfalseを返す
   */
  static isSurfaceRadar(id) {
    // 索敵値 >= 5 ?
    const sakuValue = 5;
    const gearSakuValue = AswAttacker.getGearSakuValue(id);
    const isSurface = gearSakuValue >= sakuValue;

    // 電探 ?
    const radar = [
      GEAR_CATEGORY_ID_MAP['小型電探'],
      GEAR_CATEGORY_ID_MAP['大型電探'],
      GEAR_CATEGORY_ID_MAP['大型電探(II)']
    ];
    const gearCategory = AswAttacker.getGearCategory(id);
    const isRadar = radar.includes(gearCategory);

    return isSurface && isRadar;
  };

  /**
   * @method isReconSeaplane 与えた装備IDが水上偵察機であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 水上偵察機であればtrue、そうでなければfalseを返す
   */
  static isReconSeaplane(id) {
    const reconSeaplane = GEAR_CATEGORY_ID_MAP['水上偵察機'];
    return AswAttacker.getGearCategory(id) == reconSeaplane;
  };

  /**
   * @method isSeaplaneBomber 与えた装備IDが水上爆撃機であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 水上爆撃機であればtrue、そうでなければfalseを返す
   */
  static isSeaplaneBomber(id) {
    const seaplaneBomber = GEAR_CATEGORY_ID_MAP['水上爆撃機'];
    return AswAttacker.getGearCategory(id) == seaplaneBomber;
  };

  /**
   * [未使用]
   * @method isJapaneseDepthChargeProjector 与えた装備IDが国産爆雷投射機であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 国産爆雷投射機であればtrue、そうでなければfalseを返す
   */
  /*
    static isJapaneseDepthChargeProjector(id) {
      const japaneseDepthChargeProjector = [
        GEAR_ID_MAP['九四式爆雷投射機'],
        GEAR_ID_MAP['三式爆雷投射機'],
        GEAR_ID_MAP['三式爆雷投射機 集中配備'],
        GEAR_ID_MAP['試製15cm9連装対潜噴進砲']
      ];
      return japaneseDepthChargeProjector.includes(id);
    }
  */

  /**
   * @method isJapaneseSonar 与えた装備IDが国産ソナーであるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 国産ソナーであればtrue、そうでなければfalseを返す
   */
  static isJapaneseSonar(id) {
    const japaneseSonar = [
      GEAR_ID_MAP['九三式水中聴音機'],
      GEAR_ID_MAP['三式水中探信儀'],
      GEAR_ID_MAP['零式水中聴音機'],
      GEAR_ID_MAP['四式水中聴音機'],
      GEAR_ID_MAP['三式水中探信儀改']
    ];
    return japaneseSonar.includes(id);
  }

  /**
   * @method isAutogyro 与えた装備IDがオートジャイロであるか検証する
   * @param {number} id 装備ID
   * @return {boolean} オートジャイロであればtrue、そうでなければfalseを返す
   */
  static isAutogyro(id) {
    const autogyro = GEAR_PICTURE_BOOK_ID_MAP['オートジャイロ'];
    return AswAttacker.getGearPictureBook(id) == autogyro;
  }

  /**
   * @method isAutogyro 与えた装備IDが回転翼機であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 回転翼機であればtrue、そうでなければfalseを返す
   */
  static isHelicopter(id) {
    const helicopter = GEAR_PICTURE_BOOK_ID_MAP['回転翼機'];
    return AswAttacker.getGearPictureBook(id) == helicopter;
  }

  /**
   * @method isAutogyro 与えた装備IDが二式爆雷であるか検証する
   * @param {number} id 装備ID
   * @return {boolean} 二式爆雷であればtrue、そうでなければfalseを返す
   */
  static isType2DepthCharge(id) {
    const type2DepthCharge = GEAR_ID_MAP['二式爆雷'];
    return id == type2DepthCharge;
  }
}

/**
 * @function getAswBonus 引数に与えられた攻撃艦1隻の対潜装備ボーナスを取得する
 * @param {AswAttacker} attacker 攻撃艦1隻
 * @return {number} 対潜装備ボーナス
 */
function getAswBonus(attacker) {

  // よく使う処理

  /**
   * @function gearCount 与えた装備IDの装備をいくつ装備しているか返す
   * @param {string} gearName 装備名
   * @return {number} 装備個数を返す
   */
  const gearCount = function (gearName) {
    return attacker.gearId.reduce((v1, v2) => v1 + (v2 == GEAR_ID_MAP[gearName] ? 1 : 0), 0);
  }

  /**
   * @function gearFilteredRf 与えた装備IDの装備の改修値を返す
   * @param {string} gearName 装備名
   * @return {Array<number>} 装備改修値の配列
   */
  const gearFilteredRf = function (gearName) {
    return attacker.gearRf.filter((v, i) => attacker.gearId[i] == GEAR_ID_MAP[gearName]);
  }


  // 制御用

  /** @type {number} 装備個数 */
  let num;


  // common

  // 19   https://wikiwiki.jp/kancolle/九六式艦戦
  if (num = gearCount('九六式艦戦')) {
    if (attacker.ctype == '大鷹型') {
      attacker.aswBonus += 3 * num;
    } else if (attacker.ctype == '鳳翔型') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 47   https://wikiwiki.jp/kancolle/三式水中探信儀
  if (num = gearCount('三式水中探信儀')) {
    if (['かみかぜ', 'はるかぜ', 'しぐれ', 'やまかぜ', 'まいかぜ', 'あさしも'].includes(attacker.yomi)) {
      attacker.aswBonus += 3 * num;
    } else if (['うしお', 'いかずち', 'やまぐも', 'いそかぜ', 'はまかぜ', 'きしなみ'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 69   https://wikiwiki.jp/kancolle/カ号観測機
  if (num = gearCount('カ号観測機')) {
    if (['加賀改二護', '日向改二'].includes(attacker.name)) {
      attacker.aswBonus += 2 * num;
    } else if (attacker.name == '伊勢改二') {
      attacker.aswBonus += num;
    }
  }

  // 70 https://wikiwiki.jp/kancolle/三式指揮連絡機%28対潜%29
  if (num = gearCount('三式指揮連絡機(対潜)')) {
    if (attacker.yomi == 'やましおまる') {
      attacker.aswBonus += num;
    }
  }

  // 82   https://wikiwiki.jp/kancolle/九七式艦攻(九三一空)
  // 302  https://wikiwiki.jp/kancolle/九七式艦攻(九三一空／熟練)
  if (num = gearCount('九七式艦攻(九三一空)') + gearCount('九七式艦攻(九三一空/熟練)')) {
    if (attacker.ctype == '大鷹型') {
      attacker.aswBonus += num;
    }
  }

  // 129  https://wikiwiki.jp/kancolle/熟練見張員
  if (num = gearCount('熟練見張員')) {
    if (attacker.country == '日本' && attacker.stype == '駆逐艦') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 149  https://wikiwiki.jp/kancolle/四式水中聴音機
  if (gearCount('四式水中聴音機')) {
    if (attacker.name == '夕張改二丁') {
      attacker.aswBonus += 3;
    } else if (attacker.name == '能代改二') {
      attacker.aswBonus += 2;
    } else if (attacker.ctype == '秋月型' || ['雪風改二', '五十鈴改二', '由良改二', '那珂改二', '夕張改二', '夕張改二特'].includes(attacker.name)) {
      attacker.aswBonus += 1;
    }
  }

  // 227  https://wikiwiki.jp/kancolle/二式爆雷
  if (num = gearCount('二式爆雷')) {
    const rf = gearFilteredRf('二式爆雷');
    attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 8 ? 1 : 0), 0);
    attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
  }

  // 228  https://wikiwiki.jp/kancolle/九六式艦戦改
  if (num = gearCount('九六式艦戦改')) {
    if (attacker.ctype == '大鷹型') {
      attacker.aswBonus += 7 * num;
    } else if (attacker.yomi == 'ほうしょう') {
      attacker.aswBonus += 6 * num;
    } else if (attacker.stype == '軽空母') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 229  https://wikiwiki.jp/kancolle/12.7cm単装高角砲%28後期型%29
  if (gearCount('12.7cm単装高角砲(後期型)')) {
    if (attacker.name == '雪風改二') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 287  https://wikiwiki.jp/kancolle/三式爆雷投射機%20集中配備
  if (num = gearCount('三式爆雷投射機 集中配備')) {
    if (attacker.ctype == '香取型' || attacker.name == '能代改二') {
      attacker.aswBonus += 3 * num;
    } else if (['雪風改二', '五十鈴改二', '由良改二', '那珂改二', '夕張改二丁'].includes(attacker.name)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 288  https://wikiwiki.jp/kancolle/試製15cm9連装対潜噴進砲
  if (num = gearCount('試製15cm9連装対潜噴進砲')) {
    if (attacker.name == '能代改二') {
      attacker.aswBonus += 4 * num;
    } else if (attacker.stype == '香取型' || attacker.name == '夕張改二丁') {
      attacker.aswBonus = 3 * num;
    } else if (['雪風改二', '五十鈴改二', '由良改二', '那珂改二'].includes(attacker.name)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 295  https://wikiwiki.jp/kancolle/12.7cm連装砲A型改三(戦時改修)＋高射装置
  if (num = gearCount('12.7cm連装砲A型改三(戦時改修)+高射装置')) {
    if (attacker.name == '磯波改二') {
      attacker.aswBonus += num;
    }
  }

  // 304  https://wikiwiki.jp/kancolle/S9%20Osprey
  if (num = gearCount('S9 Osprey')) {
    if (['球磨型', '長良型', '川内型', '阿賀野型'].includes(attacker.ctype)) {
      attacker.aswBonus += num;
    } else if (attacker.yomi == 'ゴトランド') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 305  https://wikiwiki.jp/kancolle/Ju87C改二(KMX搭載機)
  // 306  https://wikiwiki.jp/kancolle/Ju87C改二(KMX搭載機／熟練)
  if (num = gearCount('Ju87C改二(KMX搭載機)') + gearCount('Ju87C改二(KMX搭載機/熟練)')) {
    if (attacker.yomi == 'しんよう') {
      attacker.aswBonus += 3 * num;
    } else if (attacker.ctype == '大鷹型') {
      attacker.aswBonus += num;
    }
  }

  // 310  https://wikiwiki.jp/kancolle/14cm連装砲改
  if (num = gearCount('14cm連装砲改')) {
    if (/夕張改二/.test(attacker.name)) {
      attacker.aswBonus += num;
    }
  }

  // 322  https://wikiwiki.jp/kancolle/瑞雲改二(六三四空)
  if (num = gearCount('瑞雲改二(六三四空)')) {
    if (attacker.ctype == '伊勢型' && /改二/.test(attacker.name)) {
      attacker.aswBonus += num;
    }
  }

  // 323  https://wikiwiki.jp/kancolle/瑞雲改二(六三四空／熟練)
  if (num = gearCount('瑞雲改二(六三四空/熟練)')) {
    if (attacker.ctype == '伊勢型' && /改二/.test(attacker.name)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 324  https://wikiwiki.jp/kancolle/オ号観測機改
  // 325  https://wikiwiki.jp/kancolle/オ号観測機改二
  if (num = gearCount('オ号観測機改') + gearCount('オ号観測機改二')) {
    if (['加賀改二護', '日向改二'].includes(attacker.name)) {
      attacker.aswBonus += 3 * num;
    } else if (attacker.name == '伊勢改二') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 326  https://wikiwiki.jp/kancolle/S-51J
  if (num = gearCount('S-51J')) {
    if (attacker.name == '加賀改二護') {
      attacker.aswBonus += 5 * num;
    } else if (attacker.name == '日向改二') {
      attacker.aswBonus += 4 * num;
    } else if (attacker.name == '伊勢改二') {
      attacker.aswBonus += 3 * num;
    }
  }

  // 327  https://wikiwiki.jp/kancolle/S-51J改
  if (num = gearCount('S-51J改')) {
    if (attacker.name == '加賀改二護') {
      attacker.aswBonus += 6 * num;
    } else if (attacker.name == '日向改二') {
      attacker.aswBonus += 5 * num;
    } else if (attacker.name == '伊勢改二') {
      attacker.aswBonus += 4 * num;
    }
  }

  // 344  https://wikiwiki.jp/kancolle/九七式艦攻改%20試製三号戊型(空六号電探改装備機)
  // 345  https://wikiwiki.jp/kancolle/九七式艦攻改(熟練)%20試製三号戊型(空六号電探改装備機)
  if (num = gearCount('九七式艦攻改 試製三号戊型(空六号電探改装備機)') + gearCount('九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)')) {
    if (/(龍鳳改二戊?)|(瑞鳳改二乙?)/.test(attacker.name)) {
      attacker.aswBonus += 2 * num;
    } else if (['龍鳳改', '祥鳳改'].includes(attacker.name)) {
      attacker.aswBonus += num;
    }
  }

  // 346 https://wikiwiki.jp/kancolle/二式12cm迫撃砲改
  if (num = gearCount('二式12cm迫撃砲改')) {
    if (attacker.yomi == 'やましおまる') {
      attacker.aswBonus += num;
    }
  }

  // 347 https://wikiwiki.jp/kancolle/二式12cm迫撃砲改%20集中配備
  if (num = gearCount('二式12cm迫撃砲改 集中配備')) {
    if (attacker.yomi == 'やましおまる') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 367  https://wikiwiki.jp/kancolle/Swordfish(水上機型)
  if (num = gearCount('Swordfish(水上機型)')) {
    if (['ゴトランド', 'コマンダン・テスト'].includes(attacker.yomi)) {
      attacker.aswBonus += num;
    }
  }

  // 368  https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型)
  if (num = gearCount('Swordfish Mk.III改(水上機型)')) {
    if (['ゴトランド', 'コマンダン・テスト'].includes(attacker.yomi)) {
      attacker.aswBonus += 3 * num;
    } else if (['みずほ', 'かもい'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 369  https://wikiwiki.jp/kancolle/Swordfish%20Mk.III改(水上機型／熟練)
  if (num = gearCount('Swordfish Mk.III改(水上機型/熟練)')) {
    if (attacker.yomi == 'ゴトランド') {
      attacker.aswBonus += 4 * num;
    } else if (attacker.yomi == 'コマンダン・テスト') {
      attacker.aswBonus += 3 * num;
    } else if (['みずほ', 'かもい'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 370  https://wikiwiki.jp/kancolle/Swordfish%20Mk.II改(水偵型)
  if (num = gearCount('Swordfish Mk.II改(水偵型)')) {
    if (['ゴトランド', 'コマンダン・テスト', 'ウォースパイト', 'シェフィールド', 'ネルソン'].includes(attacker.yomi)) {
      attacker.aswBonus += 3 * num;
    } else if (['みずほ', 'かもい'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
  }

  // 371  https://wikiwiki.jp/kancolle/Fairey%20Seafox改
  if (num = gearCount('Fairey Seafox改')) {
    if (attacker.yomi == 'ゴトランド') {
      attacker.aswBonus += 2 * num;
    } else if (['コマンダン・テスト', 'ウォースパイト', 'シェフィールド', 'ネルソン'].includes(attacker.yomi)) {
      attacker.aswBonus += num;
    }
  }

  // 372  https://wikiwiki.jp/kancolle/天山一二型甲
  if (num = gearCount('天山一二型甲')) {
    if (['しょうほう', 'ずいほう', 'たいげい・りゅうほう'].includes(attacker.yomi)) {
      attacker.aswBonus += num;
    }
  }

  // 373  https://wikiwiki.jp/kancolle/天山一二型甲改(空六号電探改装備機)
  if (num = gearCount('天山一二型甲改(空六号電探改装備機)')) {
    if (/(瑞鳳改二乙?)|(龍鳳改)/.test(attacker.name)) {
      attacker.aswBonus += 2 * num;
    } else if (attacker.ctype == '祥鳳型' || attacker.name == '龍鳳') {
      attacker.aswBonus += num;
    }
  }

  // 374  https://wikiwiki.jp/kancolle/天山一二型甲改(熟練／空六号電探改装備機)
  if (num = gearCount('天山一二型甲改(熟練/空六号電探改装備機)')) {
    if (/瑞鳳改二乙?/.test(attacker.name) || /龍鳳改/.test(attacker.name)) {
      attacker.aswBonus += 3 * num;
    } else if (attacker.ctype == '祥鳳型' && /改/.test(attacker.name) || attacker.name == '龍鳳' || (attacker.ctype == '最上型' && /航改二/.test(attacker.name))) {
      attacker.aswBonus += 2 * num;
    } else if (attacker.ctype == '千歳型' && /航改二/.test(attacker.name) || attacker.ctype == '祥鳳型') {
      attacker.aswBonus += num;
    }
  }

  // 375  https://wikiwiki.jp/kancolle/XF5U
  if (num = gearCount('XF5U')) {
    if (attacker.country == 'アメリカ' && ['軽空母', '正規空母', '装甲空母'].includes(attacker.stype)) {
      attacker.aswBonus += 3 * num;
    } else if (attacker.yomi == 'かが') {
      attacker.aswBonus += num;
    }
  }

  // 377  https://wikiwiki.jp/kancolle/RUR-4A%20Weapon%20Alpha改
  if (gearCount('RUR-4A Weapon Alpha改')) {
    if (attacker.name == 'Fletcher Mk.II') {
      attacker.aswBonus += 3;
    } else if (attacker.country == 'アメリカ' && ['駆逐艦', '軽巡洋艦'].includes(attacker.stype)) {
      attacker.aswBonus += 2;
    } else if ((attacker.country == 'イギリス' && ['駆逐艦', '軽巡洋艦'].includes(attacker.stype)) || ['丹陽', '雪風改二'].includes(attacker.name)) {
      attacker.aswBonus += 1;
    }
  }

  // 378  https://wikiwiki.jp/kancolle/対潜短魚雷(試作初期型)
  if (gearCount('対潜短魚雷(試作初期型)')) {
    if (attacker.name == 'Fletcher Mk.II') {
      attacker.aswBonus += 4;
    } else if (attacker.country == 'アメリカ' && ['駆逐艦', '軽巡洋艦'].includes(attacker.stype)) {
      attacker.aswBonus += 3;
    } else if (attacker.country == 'イギリス' && ['駆逐艦', '軽巡洋艦'].includes(attacker.stype)) {
      attacker.aswBonus += 2;
    } else if (['パース', '丹陽', '雪風改二'].includes(attacker.name)) {
      attacker.aswBonus += 1;
    }
  }

  // 379  https://wikiwiki.jp/kancolle/12.7cm単装高角砲改二
  if (num = gearCount('12.7cm単装高角砲改二')) {
    if (attacker.name == '夕張改二丁') {
      attacker.aswBonus += 3 * num;
    } else if (['雪風改二', '天龍改二', '龍田改二', '五十鈴改二', '鬼怒改二', '那珂改二', '由良改二'].includes(attacker.name)) {
      attacker.aswBonus += 2 * num;
    } else if (['いすず', 'きぬ', 'なか', 'ゆら', 'ゆうばり'].includes(attacker.yomi)) {
      attacker.aswBonus += num;
    }
  }

  // 380  https://wikiwiki.jp/kancolle/12.7cm連装高角砲改二
  if (num = gearCount('12.7cm連装高角砲改二')) {
    if (attacker.name == '夕張改二丁') {
      attacker.aswBonus += 3 * num;
    } else if (['天龍改二', '龍田改二', '五十鈴改二', '鬼怒改二', '那珂改二', '由良改二'].includes(attacker.name)) {
      attacker.aswBonus += 2 * num;
    } else if (['いすず', 'きぬ', 'なか', 'ゆら'].includes(attacker.yomi) || /夕張改/.test(attacker.name)) {
      attacker.aswBonus += num;
    }
  }

  // 382  https://wikiwiki.jp/kancolle/12cm単装高角砲E型
  if (num = gearCount('12cm単装高角砲E型')) {
    if (attacker.stype == '海防艦') {
      attacker.aswBonus += num;
    }
  }

  // 389  https://wikiwiki.jp/kancolle/TBM-3W%20＋%203S
  if (num = gearCount('TBM-3W+3S')) {
    if (attacker.name == '加賀改二護') {
      attacker.aswBonus += 4 * num;
    } else if (attacker.country == 'アメリカ' && ['軽空母', '正規空母', '装甲空母'].includes(attacker.stype)) {
      attacker.aswBonus += 3 * num;
    }
  }

  // 408  https://wikiwiki.jp/kancolle/装甲艇(AB艇)
  // 409  https://wikiwiki.jp/kancolle/武装大発
  if (num = gearCount('装甲艇(AB艇)') + gearCount('武装大発')) {
    if (attacker.yomi == 'あきつまる') {
      attacker.aswBonus += num;
    }
  }

  // 412  https://wikiwiki.jp/kancolle/水雷戦隊%20熟練見張員
  if (gearCount('水雷戦隊 熟練見張員')) {
    if (attacker.country == '日本' && attacker.stype == '駆逐艦') {
      attacker.aswBonus += 2;
    }
  }

  // 415  https://wikiwiki.jp/kancolle/SO3C%20Seamew改
  if (num = gearCount('SO3C Seamew改')) {
    if (attacker.country == 'アメリカ' && ['軽巡洋艦', '重巡洋艦', '戦艦', '巡洋戦艦']) {
      attacker.aswBonus += num;
    }
  }

  // 425  https://wikiwiki.jp/kancolle/Barracuda%20Mk.III
  if (num = gearCount('Barracuda Mk.III')) {
    if (attacker.country == 'イギリス' && ['軽空母', '正規空母', '装甲空母'].includes(attacker.stype)) {
      attacker.aswBonus += 2 * num;
      const rf = gearFilteredRf('Barracuda Mk.III');
      attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 2 ? 1 : 0), 0);
      attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 6 ? 1 : 0), 0);
      attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
    }
  }

  // 438  https://wikiwiki.jp/kancolle/三式水中探信儀改
  if (num = gearCount('三式水中探信儀改')) {
    if (attacker.country == '日本' && attacker.stype == '駆逐艦') {
      attacker.aswBonus += 1;
    }
    if (['かみかぜ', 'はるかぜ', 'しぐれ', 'やまかぜ', 'まいかぜ', 'あさしも'].includes(attacker.yomi)) {
      attacker.aswBonus += 3 * num;
    }
    if (['うしお', 'いかずち', 'やまぐも', 'いそかぜ', 'はまかぜ', 'きしなみ'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
    if (['うしお', 'まいかぜ', 'いそかぜ', 'はまかぜ', 'いかずち', 'やまぐも', 'うみかぜ', 'かわかぜ', 'すずかぜ'].includes(attacker.yomi)) {
      attacker.aswBonus += 1;
    }
    if (['しぐれ', 'やまかぜ', 'かみかぜ', 'はるかぜ', 'みくら', 'いしがき'].includes(attacker.yomi)) {
      attacker.aswBonus += 1;
    }
    if (['那珂改二', '由良改二', '五十鈴改二'].includes(attacker.name)) {
      attacker.aswBonus += 1;
    }
    const rfMax = gearFilteredRf('三式水中探信儀改').reduce((v1, v2) => Math.max(v1, v2), -Infinity);
    if (['時雨改二', '春風改', '神風改', '朝霜改二', '山風改二', '山風改二丁'].includes(attacker.name)) {
      attacker.aswBonus += rfMax >= 4 ? 1 : 0;
      attacker.aswBonus += rfMax >= 8 ? 1 : 0;
    }
  }

  // 439 https://wikiwiki.jp/kancolle/Hedgehog%28初期型%29
  if (gearCount('Hedgehog(初期型)')) {
    if (['アメリカ', 'イギリス'].includes(attacker.country)) {
      attacker.aswBonus += 3;
    } else if (attacker.stype == '海防艦' || attacker.ctype == '松型') {
      attacker.aswBonus += 2;
    } else if (['駆逐艦', '軽巡洋艦', '練習巡洋艦'].includes(attacker.stype)) {
      attacker.aswBonus += 1;
    }
  }

  // 447  https://wikiwiki.jp/kancolle/零式艦戦64型%28複座KMX搭載機%29
  if (num = gearCount('零式艦戦64型(複座KMX搭載機)')) {
    if (['ほうしょう', 'たいげい・りゅうほう'].includes(attacker.yomi)) {
      attacker.aswBonus += 2 * num;
    }
    if (attacker.yomi == 'うんよう') {
      attacker.aswBonus += 1 * num;
    }
    if (attacker.ctype == '大鷹型') {
      attacker.aswBonus += 1 * num;
    }
    const rf = gearFilteredRf('零式艦戦64型(複座KMX搭載機)');
    attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 6 ? 1 : 0), 0);
    attacker.aswBonus += rf.reduce((v1, v2) => v1 + (v2 >= 10 ? 1 : 0), 0);
  }

  // 451 https://wikiwiki.jp/kancolle/三式指揮連絡機改
  if (num = gearCount('三式指揮連絡機改')) {
    if (attacker.yomi == 'やましおまる') {
      attacker.aswBonus += 3 * num;
    } else if (attacker.yomi == 'あきつまる') {
      attacker.aswBonus += 2 * num;
    }
  }

  // 455 https://wikiwiki.jp/kancolle/試製%20長12.7cm連装砲A型改四
  if (num = gearCount('試製 長12.7cm連装砲A型改四')) {
    if (['磯波改二', '浦波改二'].includes(attacker.name)) {
      attacker.aswBonus += num;
    }
  }

  // 472 https://wikiwiki.jp/kancolle/Mk.32%20対潜魚雷(Mk.2落射機)
  if (num = gearCount('Mk.32 対潜魚雷(Mk.2落射機)')) {
    if (attacker.country == 'アメリカ') {
      attacker.aswBonus += 2 * num;
    }
    if (attacker.country == 'イギリス' || attacker.name == 'Samuel B.Roberts Mk.II') {
      attacker.aswBonus += 1 * num;
    }
  }


  // single

  // 国産ソナー
  if (attacker.isEquipJapanSonar) {
    if (attacker.ctype == '香取型') {
      attacker.aswBonus += 2;
    }
  }

  // 回転翼機
  if (attacker.isEquipAutogyro || attacker.isEquipHelicopter) {
    if (attacker.name == '能代改二') {
      attacker.aswBonus += 4;
    } else if (/矢矧改二乙?/.test(attacker.name)) {
      attacker.aswBonus += 3;
    }
  }

  // 水上偵察機
  if (attacker.isEquipReconSeaplane) {
    if (attacker.ctype == '阿賀野型' && /改二/.test(attacker.name)) {
      attacker.aswBonus += 3;
    }
  }

  // 水上爆撃機
  if (attacker.isEquipSeaplaneBomber) {
    if (attacker.ctype == '阿賀野型' && /改二/.test(attacker.name)) {
      attacker.aswBonus += 1;
    }
  }


  // synergy

  // 12cm単装砲改二 && 水上電探 && (占守型 || 択捉型)
  if (gearCount('12cm単装砲改二') * attacker.isEquipSurfaceRadar) {
    if (['占守型', '択捉型'].includes(attacker.ctype)) {
      attacker.aswBonus += 1;
    }
  }

  // オートジャイロ && つよつよTBM && 加賀改二護 
  if (attacker.isEquipAutogyro * gearCount('TBM-3W+3S')) {
    if (attacker.name == '加賀改二護') {
      attacker.aswBonus += 6;
    }
  }

  // ヘリコプター && つよつよTBM && 加賀改二護 
  if (attacker.isEquipHelicopter * gearCount('TBM-3W+3S')) {
    if (attacker.name == '加賀改二護') {
      attacker.aswBonus += 10;
    }
  }
}

/**
 * @customfunction 対潜装備ボーナスを取得する
 * @param {Array<number>} attackerId 攻撃艦の艦船ID
 * @param {Array<Array<number>>} gearId 攻撃艦の装備ID
 * @param {Array<Array<number>>} gearRf 攻撃艦の装備改修値
 * @returns {Array<number>} 対潜装備ボーナス
 */
function aswBonus(attackerId, gearId, gearRf) {

  // 処理する行サイズ
  const ROW_SIZE = attackerId.reduce((v1, v2) => v1 + (v2 > 0 ? 1 : 0), 0);

  // 攻撃艦
  let attacker = new Array(ROW_SIZE);

  // 行サイズぶんだけ対潜装備ボーナスを取得
  for (let i = 0; i < ROW_SIZE; i++) {
    attacker[i] = new AswAttacker(attackerId[i], gearId[i], gearRf[i]);
    getAswBonus(attacker[i]);
  }

  // 対潜装備ボーナスを返す
  return attacker.map(e => e.aswBonus)
}