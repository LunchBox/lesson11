import { computed } from "vue";
import Base from "./base.js";

import EntryItem from "./entry_item.js"; 

export default class Entry extends Base {
  static modelKey = "entries";

  static attributes = {
    title: { type: "string", default: "Untitled" },
    entryItemIds: { type: "array", default: [] }
  }; 

  get entryItems(){
    return computed(() => this.entryItemIds.map(id => EntryItem.find(id)));
  }
}
