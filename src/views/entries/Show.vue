<template>
	<div v-if="entry">
		<h2>{{ entry.title }}</h2>

		<EntryItemList :entry="entry" />
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

	console.log(entry);
</script>

<style>
</style>
