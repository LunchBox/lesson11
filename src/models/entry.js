import { computed } from "vue";
import ActiveRecord from "./active_record.js";

export default class Entry extends ActiveRecord {
	static modelKey = "entries";

	static attributes = {
		title: { type: "string", default: "Untitled" },
		entryItemIds: { type: "array", default: [] },
	};

	get mark() {
		return `@${this.id}`;
	}
}

console.log(Entry);
