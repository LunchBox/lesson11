import ActiveRecord from "./active_record.js";
import axios from "axios";

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

	get cacheFilename() {
		const extMapping = {
			javascript: ".js",
			css: ".css",
			html: ".html",
			markdown: ".md",
		};

		const ext = extMapping[this.contentType] || ".md";
		const filename = this.id + ext;
		return filename;
	}

	async fileize() {
		const filename = this.cacheFilename;
		const res = await axios.put(
			`/api/${this.constructor.modelKey}_cache/${filename}`,
			this.content,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);

		console.log(res);
	}
}

Memo.regCallback("afterSave", async (memo) => {
	memo.fileize();
});
