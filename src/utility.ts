/**
 * 二分探索で, mst[index].api_id === id となる index を返す;
 * これを満たすindexが存在しなければ, -1を返す
 * @param id
 * @param mst
 * @returns
 * スプレッドシートから入ってくる数字は, value()を通していたとしても文字列となる.
 * しかし, parseInt()などを実行すると処理が遅くなるので, numberであるとしてtcsを騙す.
 */
function binarySearch(id: number, mst: api_mst_any): number | -1 {
  const id_: number = id | 0; // idは, 実は文字列

  let index: number = -1;
  let left: number = 0;
  let right: number = mst.length - 1;
  let middle: number;

  while (left <= right) {
    middle = Math.floor((left + right) / 2);
    if (mst[middle].api_id === id_) {
      index = middle;
      break;
    } else if (mst[middle].api_id < id_) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return mst[index]?.api_id === id_ ? index : -1;
}

/**
 * 艦船IDに対応するmstを返す;
 * api_mst_shipに存在しない艦船IDであれば, undefinedを返す
 * @param shipId 艦船ID
 * @returns
 */
function getElementOfApiMstShip(
  shipId: number
): api_mst_ship_element | undefined {
  return api_mst_ship[binarySearch(shipId, api_mst_ship)];
}

/**
 * 装備IDに対応するmstを返す;
 * api_mst_slotitemに存在しない装備IDであれば, undefinedを返す
 * @param gearId 装備ID
 * @returns
 */
function getElementOfApiMstSlotitem(
  gearId: number
): api_mst_slotitem_element | undefined {
  return api_mst_slotitem[binarySearch(gearId, api_mst_slotitem)];
}

/**
 * 装備IDに対応する装備図鑑IDを返す;
 * api_mst_slotitemに存在しない装備IDであれば, undefinedを返す
 * @param gearId 装備ID
 * @returns
 */
function getGearPictureBookId(gearId: number): number | undefined {
  const pictureBookIndex = 1;
  return getElementOfApiMstSlotitem(gearId)?.api_type[pictureBookIndex];
}

/**
 * 装備IDに対応する装備カテゴリIDを返す;
 * api_mst_slotitemに存在しない装備IDであれば, undefinedを返す
 * @param gearId 装備ID
 * @returns
 */
function getGearCategoryId(gearId: number): number | undefined {
  const categoryIndex = 2;
  return getElementOfApiMstSlotitem(gearId)?.api_type[categoryIndex];
}

/**
 * 装備IDに対応する装備索敵値を返す;
 * api_mst_slotitemに存在しない装備IDであれば, undefinedを返す
 * @param gearId 装備ID
 * @returns
 */
function getGearSakuValue(gearId: number): number | undefined {
  return getElementOfApiMstSlotitem(gearId)?.api_saku;
}

/**
 * 装備IDが水上電探であるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isSurfaceRadar(gearId: number): boolean {
  // 索敵値 >= 5 ?
  const sakuValue = 5;
  const gearSakuValue = getGearSakuValue(gearId);
  const isSurface = gearSakuValue !== undefined && gearSakuValue >= sakuValue;
  if (!isSurface) return false;

  // 電探 ?
  const gearCategory = getGearCategoryId(gearId);
  if (gearCategory === undefined) return false;
  return [
    GEAR_CATEGORY_ID_MAP["小型電探"],
    GEAR_CATEGORY_ID_MAP["大型電探"],
    GEAR_CATEGORY_ID_MAP["大型電探(II)"],
  ].includes(gearCategory);
}

/**
 * 装備IDが水上偵察機であるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isReconSeaplane(gearId: number): boolean {
  return getGearCategoryId(gearId) === GEAR_CATEGORY_ID_MAP["水上偵察機"];
}

/**
 * 装備IDが水上爆撃機であるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isSeaplaneBomber(gearId: number): boolean {
  return getGearCategoryId(gearId) === GEAR_CATEGORY_ID_MAP["水上爆撃機"];
}

/**
 * 装備IDが, 国産ソナーであるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isJapaneseSonar(gearId: number): boolean {
  return [
    GEAR_NAME_ID_MAP["九三式水中聴音機"],
    GEAR_NAME_ID_MAP["三式水中探信儀"],
    GEAR_NAME_ID_MAP["零式水中聴音機"],
    GEAR_NAME_ID_MAP["四式水中聴音機"],
    GEAR_NAME_ID_MAP["三式水中探信儀改"],
  ].includes(gearId);
}

/**
 * 装備IDがオートジャイロであるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isAutogyro(gearId: number): boolean {
  return (
    getGearPictureBookId(gearId) === GEAR_PICTURE_BOOK_ID_MAP["オートジャイロ"]
  );
}

/**
 * 装備IDが回転翼機であるかを検証する
 * @param gearId 装備ID
 * @returns
 */
function isHelicopter(gearId: number): boolean {
  return getGearPictureBookId(gearId) == GEAR_PICTURE_BOOK_ID_MAP["回転翼機"];
}
