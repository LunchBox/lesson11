<template>
	<div v-if="loading">loading...</div>
	<div v-else>
		<div style="margin-bottom: 1em">
			<router-link to="/entries">Entries</router-link> &middot;
		</div>

		<h2>{{ entry.title }}</h2>

		<EntryItemList :entry="entry" @after-submit="afterSubmit" />
	</div>
</template>

<script setup>
	import { ref, computed, onBeforeUnmount } from "vue";
	import { useRoute, onBeforeRouteUpdate } from "vue-router";

	import Entry from "@/models/entry.js";
	import Memo from "@/models/memo.js";

	import EntryItemList from "../entry_items/List.vue";

	import { loadEntry, syncScript } from "./helper";

	const route = useRoute();
	const entry = computed(() => Entry.find(route.params.id));

	const loading = ref(true);
	loadEntry(loading, route.params.id);

	onBeforeRouteUpdate((to, from) => {
		loadEntry(loading, to.params.id);
	});

	const runtimeHandler = (event) => {
		if (event.data && "type" in event.data) {
			const { id, type, data } = event.data;
			const memo = Memo.find(id);
			memo.$result = { type, data };
		}
	};

	window.addEventListener("message", runtimeHandler);
	onBeforeUnmount(() => {
		window.removeEventListener("message", runtimeHandler);
	});

	function afterSubmit() {
		syncScript(entry.value);
	}
</script>

<style>
	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
		tab-size: 4;

		background: #f5f7fa;
		line-height: 1.35;
		border-radius: 2px;
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
</style>

<style scoped>
	:deep(textarea) {
		width: 100%;
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
