import Base from "./base.js";

import Entry from "./entry.js";
import Memo from "./memo.js";

const ITEM_TYPES = {
  Memo
};


export default class EntryItem extends Base {
  static modelKey = "entry_items";

  static attributes = {
    entryId: { type: "string", default: null },
    itemType: { type: "string", default: null },
    itemId: { type: "string", default: null },
  }; 

  static attrsAccssor = ["content", "seq"];

  get item(){
    return ITEM_TYPES[this.itemType].find(this.itemId);
  }

  async fetchItem(){
    return await ITEM_TYPES[this.itemType].fetch(this.itemId);
  }

  async afterDestroy(){
    return await ITEM_TYPES[this.itemType].destroy(this.itemId); 
  }

  async beforeCreate(){
    if (this.content){
      const memo = new Memo({content: this.content});
      await memo.save();
      
      this.itemType = "Memo";
      this.itemId = memo.id;
    } 
    return true;
  }

  async afterCreate(){
    const entry = await Entry.fetch(this.entryId);

    entry.entryItemIds.splice(this.seq, 0, this.id);

    await entry.update();
    return true;
  }
}

// EntryItem.hasOne("item", {});
