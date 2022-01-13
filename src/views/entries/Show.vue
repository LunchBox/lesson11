<template>
	<div v-if="entry">
		<h2>{{ entry.title }}</h2>
	</div>
</template>

<script setup>
	import { ref } from "vue";
	import { useRoute } from "vue-router";

  import Entry from "@/models/entry.js";

	const route = useRoute();

  const entry = Entry.find(route.params.id)

  Entry.fetch(route.params.id);
  
</script>

<style>
</style>
