import Base from "./base.js";

export default class extends Base {
  static modelKey = "entries";

  static attributes = {
    title: { type: "string", default: "Untitled" },
    entryItemIds: { type: "array", default: [] }
  }; 
}
