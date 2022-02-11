import ActiveRecord from "./active_record.js";

export default class Config extends ActiveRecord {
	static modelKey = "config";

	static attributes = {
		entryIds: { type: "array", default: [] },
	};

	static get global() {
		return this.all[0];
	}

	static async preload() {
		await this.fetchAll();
		if (!this.global) {
			const config = new this({});
			await config.save();
			await this.fetchAll();
		} else {
			await this.global.fetchEntries();
		}
	}
}
