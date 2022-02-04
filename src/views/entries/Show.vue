<template>
	<div v-if="entry">
		<div style="margin-bottom: 1em">
			<router-link to="/entries">Entries</router-link> &middot;
			<a @click.prevent="showInfo = !showInfo">Toggle Info</a> &middot;
		</div>

		<div v-if="showInfo">
			{{ entry }}
		</div>

		<h2>{{ entry.title }}</h2>

		<iframe src="/debug.html" ref="debugFrame"></iframe>

		<EntryItemList
			:entry="entry"
			:showInfo="showInfo"
			@after-submit="afterSubmit"
		/>
	</div>
</template>

<script setup>
	import { ref, computed, onBeforeUnmount } from "vue";
	import { useRoute } from "vue-router";

	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";
	import Memo from "@/models/memo.js";

	import EntryItemList from "../entry_items/List.vue";

	const route = useRoute();

	async function loadEntry(entryId) {
		const entry = await Entry.fetch(entryId);

		const jobs = entry.entryItemIds.map((id) => EntryItem.fetch(id));
		const entryItems = await Promise.all(jobs);
		const memos = await Promise.all(entryItems.map((ei) => ei.fetchItem()));

		syncScript();
	}
	loadEntry(route.params.id);

	function syncScript() {
		const scriptMemos = [];
		entry.value.entryItems.forEach((ei) => {
			if (ei.itemType === "Memo" && ei.item.contentType === "javascript") {
				scriptMemos.push(ei.item);
			}
		});

		let script = "let $_pos = null; \r\n";
		script +=
			"console.log = function(...args){ parent.postMessage({ type: 'debug', id: $_pos, data: args}) } \r\n";
		script += scriptMemos
			.map((memo) => ["", `$_pos = "${memo.id}"`, memo.content].join("\r\n"))
			.join("\r\n");

		console.log(script);
		postMessage("script", script);
	}

	const runtimeHandler = (event) => {
		if (typeof event.data === "object" && event.data.type === "debug") {
			const { id, type, data } = event.data;

			console.log(id, data);

			const memo = Memo.find(id);
			if (memo) {
				memo.$result = data;
			}
		}
	};

	window.addEventListener("message", runtimeHandler);
	onBeforeUnmount(() => {
		window.removeEventListener("message", runtimeHandler);
	});

	function afterSubmit() {
		syncScript();
	}

	const entry = computed(() => Entry.find(route.params.id));

	const showInfo = ref(false);
	console.log(entry);

	const debugFrame = ref(null);
	function postMessage(type, data) {
		debugFrame.value.contentWindow.postMessage(
			JSON.stringify({
				type: "script",
				data,
			}),
			"*"
		);
	}
</script>

<style>
	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		font-size: 13px;
		line-height: 20px;
		tab-size: 4;

		background: #f5f7fa;
		line-height: 1.35;
		border-radius: 2px;
		padding: 0.5em;
		margin: 0.5em 0;
	}

	code {
		background: rgba(135, 131, 120, 0.15);
		color: #eb5757;
		padding: 0.2em 0.4em;
	}

	pre code {
		color: #555;
		font-size: 13px;
		font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
		background: #f5f7fa;
		line-height: 1.35;
		border-radius: 2px;
		padding: 0;
	}
</style>

<style scoped>
	:deep(textarea) {
		width: 100%;
	}

	iframe {
		width: 100%;
		height: 2.5em;
		border: none;
		overflow: hidden;

		display: none;
	}
</style>
