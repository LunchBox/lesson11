import Base from "./base.js";

import Entry from "./entry.js";
import Memo from "./memo.js";

export default class EntryItem extends Base {
  static modelKey = "entry_items";

  static attributes = {
    entryId: { type: "string", default: null },
    itemType: { type: "string", default: null },
    itemId: { type: "string", default: null },
    // content: { type: "text", default: null }
  }; 

  static attrsAccssor = ["content", "seq"];

  async beforeCreate(){
    console.log("--- before create entry Item", this.content);
    if (this.content){
      const memo = new Memo({content: this.content});
      await memo.save();
      
      this.itemType = "Memo";
      this.itemId = memo.id;

      console.log("-- after memo saved", this);
    } 
    return true;
  }

  async afterCreate(){
    console.log("-- after create entryItem", this);

    // const entry = await Entry.fetch(this.entryId);
    const entry = Entry.find(this.entryId);

    console.log(entry);
    entry.entryItemIds.splice(this.seq, 0, this.id);

    console.log(entry);
    // await entry.update();
    entry.update();

    return true;
  }
}

console.log(EntryItem);
