import Config from "./config.js";
import Entry from "./entry.js";
import EntryItem from "./entry_item.js";
import Memo from "./memo.js";
import Pen from "./pen.js";
import FileAttachment from "./file_attachment.js";

import entryItemTypes from "./entry_item_types.js";

// Entry
Entry.hasMany("entryItems", {
	className: EntryItem,
	foreignKey: "entryId",
	collectionKey: "entryItemIds",
});

// Entry Item
EntryItem.belongsTo("entry", {
	className: Entry,
	foreignKey: "entryId",
	afterCreate: async function (entry) {
		console.log(this);
		entry.entryItemIds.splice(this.$position + 1, 0, this.id);
		await entry.update();
	},
});

EntryItem.hasOne("item", {
	polymorphic: true,
	allowItemTypes: entryItemTypes,
	afterDestroy: async function (item) {
		if (item instanceof Memo) {
			await item.destroy();
		}
	},
});

// Config
Config.hasMany("entries", {
	className: Entry,
	collectionKey: "entryIds",
});
