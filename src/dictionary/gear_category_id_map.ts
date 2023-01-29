const GEAR_CATEGORY_ID_MAP: {
  [k: string]: number;
} = Object.fromEntries(
  api_mst_slotitem_equiptype.map((item) => [item.api_name, item.api_id])
);
