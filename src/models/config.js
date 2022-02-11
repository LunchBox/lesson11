import ActiveRecord from "./active_record.js";

export default class Config extends ActiveRecord {
	static modelKey = "config";

	static attributes = {
		rootId: { type: "string", default: null },
	};

	static get global() {
		return this.all[0];
	}

	static async preload() {
		await this.fetchAll();
		console.log(this.all);
		console.log(this.all[0]);
		console.log(this.global);
		if (!this.global) {
			const config = new this({});
			await config.save();
			await this.fetchAll();
		} else {
			await this.global.fetchRoot();
		}
	}
}
