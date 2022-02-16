import ActiveRecord from "./active_record.js";
import axios from "axios";

export default class Pen extends ActiveRecord {
	static modelKey = "pens";

	static attributes = {
		html: { type: "text", default: null },
		js: { type: "text", default: null },
		css: { type: "text", default: null },
		data: { type: "text", default: null },
		width: { type: "string", default: "100%" },
		height: { type: "string", default: "200px" },
	};

	get htmlContent() {
		const content = [];
		if (this.css) {
			content.push("<style>\r\n" + this.css + "\r\n</style>");
		}

		if (this.html) {
			content.push(this.html);
		}

		let code = "function save(data){ parent.postMessage(data, '*') }\r\n";
		if (this.data) {
			code += `var data = '${this.data.replaceAll("'", "\\'")}'\r\n`;
		}
		content.push("<scr" + "ipt>\r\n" + code + "\r\n</scr" + "ipt>");

		if (this.js) {
			content.push(
				"<scr" +
					'ipt type="module">\r\n' +
					this.js +
					"\r\n</scr" +
					"ipt>",
			);
		}

		return content.join("\r\n");
	}

	get cacheFilename() {
		return this.id + ".html";
	}

	get cachePath() {
		return `/${this.constructor.modelKey}_cache/${this.cacheFilename}`;
	}

	get cacheUrl() {
		return `${import.meta.env.VITE_API_URL}${this.cachePath}`;
	}

	async fileize() {
		const filename = this.cacheFilename;
		const res = await axios.put(
			`/api/${this.constructor.modelKey}_cache/${filename}`,
			this.htmlContent,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);

		console.log(res);
	}

	afterFileize(func) {
		if (!this.$cbAfterFileize) {
			this.$cbAfterFileize = [];
		}
		this.$cbAfterFileize.push(func);
	}
}

Pen.regCallback("afterSave", async (pen) => {
	await pen.fileize();

	if (Array.isArray(pen.$cbAfterFileize)) {
		pen.$cbAfterFileize.forEach((func) => {
			func(pen);
		});
	}
});
