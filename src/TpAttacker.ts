class TpAttacker {
  readonly id: number;
  readonly mst: api_mst_ship_element | undefined;
  readonly name: string;
  readonly yomi: string;
  readonly remodel: number; // 1: 未改造;  [2, 6): 改; [6, 9): 改二
  readonly isKai: boolean; // 2 <= remoedl < 6
  readonly isKai2: boolean; // 6 <= remoedl < 9
  readonly isKaiPlus: boolean; // 2 <= remoedl < 9
  readonly stype: stype;
  readonly ctype: ctype;
  readonly nationality: nationality;
  readonly gears: Map<number, number[]>;
  bonus: number;
  is_error: boolean;

  constructor(attackerId: number, gearIds: number[], gearRfs: number[]) {
    this.id = attackerId;
    this.mst = getElementOfApiMstShip(this.id);
    this.name = this.mst?.api_name ?? "undefined";
    this.yomi = this.mst?.api_yomi ?? "undefined";
    this.remodel = (this.mst?.api_sort_id ?? 0) % 10; // null合体演算子の右辺の0に特に意味はない
    this.isKai = 2 <= this.remodel && this.remodel < 6;
    this.isKai2 = 6 <= this.remodel && this.remodel < 9;
    this.isKaiPlus = 2 <= this.remodel && this.remodel < 9;

    this.stype =
      this.mst?.api_stype === undefined
        ? "undefined"
        : MST_SHIP_TYPE[this.mst.api_stype];

    this.ctype =
      this.mst?.api_ctype === undefined
        ? "undefined"
        : MST_CLASS_TYPE[this.mst.api_ctype];

    this.nationality =
      this.mst?.api_ctype === undefined
        ? "undefined"
        : MST_NATIONALITY[this.mst.api_ctype];

    this.gears = new Map();
    gearIds.forEach((val, index) => {
      if (!this.gears.has(val)) {
        this.gears.set(val, []);
      }
      this.gears.get(val)?.push(gearRfs[index]);
    });

    this.bonus = 0;
    this.is_error = this.mst === undefined;
  }

  gearCount(gearName: string): number {
    const id: number = GEAR_NAME_ID_MAP[gearName];
    return this.gears.get(id)?.length ?? 0;
  }

  gearRfs(gearName: string): number[] {
    const id: number = GEAR_NAME_ID_MAP[gearName];
    return this.gears.get(id) ?? [];
  }
}
