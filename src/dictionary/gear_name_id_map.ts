const GEAR_NAME_ID_MAP: {
  [k: string]: number;
} = Object.fromEntries(
  api_mst_slotitem
    .filter((item) => item.api_sortno !== 0)
    .map((item) => [item.api_name, item.api_id])
);
