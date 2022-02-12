<template>
	<div v-if="loading">loading...</div>
	<div v-else>
		<h2 @dblclick="addToTabs">{{ entry.title }}</h2>

		<div class="meta">
			<span @click.prevent="copyToClipboard">
				{{ entry.mark }}
			</span>
		</div>

		<EntryItemList :entry="entry" @after-submit="afterSubmit" />
	</div>
</template>

<script setup>
	import { ref, computed, onBeforeUnmount } from "vue";
	import { useRoute, onBeforeRouteUpdate } from "vue-router";

	import copyToClipboard from "@/utils/copy_to_clipboard.js";

	import Entry from "@/models/entry.js";
	import Memo from "@/models/memo.js";
	import Config from "@/models/config.js";

	import EntryItemList from "../entry_items/List.vue";

	import { loadEntry, syncScript } from "./helper";

	const route = useRoute();
	const entry = computed(() => Entry.find(route.params.id));

	const loading = ref(true);
	loadEntry(loading, route.params.id);

	onBeforeRouteUpdate((to, from) => {
		loadEntry(loading, to.params.id);
	});

	// const runtimeHandler = (event) => {
	// 	// console.log(event.data);
	// 	const typeWhitelist = ["log", "image"];
	// 	if (
	// 		event.data &&
	// 		typeof event.data === "object" &&
	// 		typeWhitelist.includes(event.data.type)
	// 	) {
	// 		const { id, type, data } = event.data;
	// 		const memo = Memo.find(id);
	// 		memo.$result = { type, data };
	// 	}
	// };

	// window.addEventListener("message", runtimeHandler);
	// onBeforeUnmount(() => {
	// 	window.removeEventListener("message", runtimeHandler);
	// });

	function afterSubmit() {
		// syncScript(entry.value);
	}

	async function addToTabs() {
		if (Config.global && entry.value) {
			if (!Config.global.entryIds.includes(entry.value.id)) {
				Config.global.entryIds.push(entry.value.id);
				await Config.global.update();
			}
		}
	}
</script>

<style scoped>
	:deep(textarea) {
		width: 100%;
	}
	.meta {
		margin-bottom: var(--p-margin);
		font-family: monospace;
		color: #999;
	}
	.meta > * {
		color: #999;
		font-size: smaller;

		cursor: pointer;
	}
</style>

<style>
	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		tab-size: 4;

		background: #f5f7fa;
		line-height: 1.35;
		border-radius: 2px;

		margin: var(--p-margin) 0;
		padding: 0.5em;
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

	.hljs {
		background: transparent !important;
		font-family: monospace;
		font-size: 13px;
	}

	pre code.hljs {
		padding: 0 !important;
	}
</style>


<style>
	iframe.debug-frame {
		width: 100%;
		height: 2.5em;
		border: none;
		overflow: hidden;

		display: none;
	}
</style>

<style >
	.list-item p {
		margin: var(--p-margin) 0;
	}
</style>
