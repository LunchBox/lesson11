import Entry from "@/models/entry.js";
import EntryItem from "@/models/entry_item.js";
import Memo from "@/models/memo.js";
import { js_beautify } from "js-beautify";

async function loadEntry(loading, entryId) {
	loading.value = true;
	const entry = await Entry.fetch(entryId);

	const jobs = entry.entryItemIds.map((id) => EntryItem.fetch(id));
	const entryItems = await Promise.all(jobs);
	const memos = await Promise.all(entryItems.map((ei) => ei?.fetchItem()));

	loading.value = false;
	syncScript(entry);
}

function syncScript(entry) {
	const scriptMemos = [];
	entry.entryItems.forEach((ei) => {
		if (
			ei &&
			ei.itemType === "Memo" &&
			ei.item.contentType === "javascript"
		) {
			scriptMemos.push(ei.item);
		}
	});

	let script = "let $_pos = null; \r\n";
	script +=
		"console.log = function(...args){ parent.postMessage({id: $_pos, type: 'log', data: args}) } \r\n";
	script +=
		"console.image = function(imageData){ parent.postMessage({id: $_pos, type: 'image', data: imageData}) } \r\n";
	script += scriptMemos
		.map((memo) => ["", `$_pos = "${memo.id}";`, memo.content].join("\r\n"))
		.join("\r\n");

	const content =
		"<scr" + "ipt>\r\n" + js_beautify(script) + "\r\n</scr" + "ipt>";
	postMessage(content);
}

function postMessage(content) {
	console.log(content);
	document.querySelectorAll(".debug-frame").forEach((elem) => elem.remove());
	const iframe = document.createElement("iframe");
	iframe.classList.add("debug-frame");
	document.body.append(iframe);
	const doc = iframe.contentWindow.document;
	doc.open();
	doc.writeln(content);
	doc.close();
}

export { loadEntry, syncScript };
