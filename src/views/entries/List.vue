<template>
	<h2>Entry List</h2>

	<EntryForm />
	<ul>
		<li v-for="entry in list" :key="entry.id">
			<router-link :to="`/entries/${entry.id}`">
				{{ entry.title }}
			</router-link>
		</li>
	</ul>
</template>

<script setup>
	import { computed } from "vue";
	import Entry from "@/models/entry.js";
	import EntryForm from "./Form.vue";

	const list = computed(() => Entry.all);
	Entry.fetchAll();
</script>

<style>
</style>
