type api_mst_any =
  | typeof api_mst_ship
  | typeof api_mst_slotitem
  | typeof api_mst_slotitem_equiptype;

type api_mst_ship_element = (typeof api_mst_ship)[number];

type api_mst_slotitem_element = (typeof api_mst_slotitem)[number];

type api_mst_slotitem_equiptype_element =
  (typeof api_mst_slotitem_equiptype)[number];
