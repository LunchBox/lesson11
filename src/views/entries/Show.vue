<template>
	<div v-if="category">
		<h2>{{ entry.title }}</h2>
	</div>
</template>

<script setup>
	import { ref } from "vue";
	import { useRoute } from "vue-router";

  import Entry from "@/models/entry.js";

	const route = useRoute();

	const entry = ref(null);
	Entry.fetch(route.params.id).then((model) => (entry.value = model));
</script>

<style>
</style>
