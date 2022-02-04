import { computed } from "vue";
import ActiveRecord from "./active_record.js";

export default class Memo extends ActiveRecord {
	static modelKey = "memos";

	static attributes = {
		content: { type: "text", default: null },
		contentType: { type: "string", default: "markdown" },
	};

	get isMarkdown() {
		const ct = this.contentType;
		if (["markdown", "md"].includes(ct) || !ct) {
			return true;
		}
		return false;
	}
}
