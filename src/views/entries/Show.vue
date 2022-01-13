<template>
	<div v-if="entry">
    {{ entry }}
		<h2>{{ entry.title }}</h2>

    <EntryItemList :entry="entry" />
	</div>
</template>

<script setup>
	import { ref } from "vue";
	import { useRoute } from "vue-router";

  import Entry from "@/models/entry.js";

  import EntryItemList from "../entry_items/List.vue";

	const route = useRoute();

  const entry = Entry.find(route.params.id)
</script>

<style>
</style>
