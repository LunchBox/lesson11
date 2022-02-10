import ActiveRecord from "./active_record.js";

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
}

Pen.regCallback("afterSave", async (memo) => {
	// do nothing
});
