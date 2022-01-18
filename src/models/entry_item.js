import Base from "./base.js";

export default class EntryItem extends Base {
  static modelKey = "entry_items";

  static attributes = {
    entryId: { type: "string", default: null },
    itemType: { type: "string", default: null },
    itemId: { type: "string", default: null },
  }; 

  static attrsAccssor = ["content", "seq"];

}


