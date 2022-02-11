import ActiveRecord from "./active_record.js";
import axios from "axios";

export default class FileAttachment extends ActiveRecord {
	static modelKey = "file_attachments";

	static attributes = {
		filename: { type: "string", default: null },
		filesize: { type: "string", default: null },
		contentType: { type: "string", default: null },
		path: { type: "string", default: null },
	};

	static attrsAccssor = ["file"];

	set file(file) {
		if (!file) {
			return;
		}
		this.$file = file;
		this.filename = file.name;
		this.filesize = file.size;
		this.contentType = file.type;
	}

	get filePath() {
		return `http://localhost:9090/${this.path}`;
	}

	async saveAttachment() {
		if (!this.$file) {
			return false;
		}

		const f = this.$file;
		this.$file = null;

		const formData = new FormData();
		formData.append("file", f);

		const res = await axios.post("/api/upload", formData);
		return res.data;
	}
}

FileAttachment.regCallback("beforeCreate", async (fa) => {
	const res = await fa.saveAttachment();
	if (res) {
		fa.path = res.path;
	}
});
