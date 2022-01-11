<template>
	<div v-if="category">
		<h2>Show Details of Category: {{ category.name }}</h2>
	</div>
</template>

<script setup>
	import { ref } from "vue";
	import { useRoute } from "vue-router";
	import { fetch } from "@/store/categories.js";

	const route = useRoute();

	const category = ref(null);
	fetch(route.params.id).then((c) => (category.value = c));
</script>

<style>
</style>