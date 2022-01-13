<template>
	<h2>Entry List</h2>

	<ul>
		<li v-for="entry in list" :key="entry.id">
			<router-link :to="`/entries/${entry.id}`">
				{{ entry.title }}
			</router-link>
		</li>
	</ul>
	<EntryForm />
</template>

<script setup>
  import Entry from "@/models/entry.js";
	import EntryForm from "./Form.vue";

  Entry.fetchAll();
  console.log(Entry);

  const list = Entry.all;
</script>

<style>
</style>
