<template>
	<div v-if="entry">
		<div style="margin-bottom: 1em">
			<a @click.prevent="showInfo = !showInfo">Toggle Info</a> &middot;
		</div>

		<div v-if="showInfo">
			{{ entry }}
		</div>

		<h2>{{ entry.title }}</h2>

		<EntryItemList :entry="entry" :showInfo="showInfo" />
	</div>
</template>

<script setup>
	import { ref, computed, toRef } from "vue";
	import { useRoute } from "vue-router";

	import Entry from "@/models/entry.js";

	import EntryItemList from "../entry_items/List.vue";

	const route = useRoute();

	Entry.fetch(route.params.id);
	const entry = computed(() => Entry.find(route.params.id));

	const showInfo = ref(false);
	console.log(entry);
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
</style>
