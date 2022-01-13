import Base from "./base.js";

export default class extends Base {
  static modelKey = "entry_items";

  static attributes = {
    entryId: { type: "string", default: null },
    content: { type: "text", default: null }
  }; 
}
