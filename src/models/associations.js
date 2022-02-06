import Entry from "./entry.js";
import EntryItem from "./entry_item.js";
import Memo from "./memo.js";

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
	allowItemTypes: { Entry, Memo },
	afterDestroy: async function (item) {
		if (item instanceof Memo) {
			await item.destroy();
		}
	},
});
