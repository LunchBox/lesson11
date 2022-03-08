import ActiveRecord from "./active_record.js";

// this actually should be the model of User
export default class Config extends ActiveRecord {
	static modelKey = "config";

	static attributes = {
		entryIds: { type: "array", default: [] },
		stIds: { type: "array", default: [] }, // for short term memory
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
      console.log(this.global)
			await this.global.fetchEntries();
			await this.global.fetchShortTermEntries();
		}
	}
}
