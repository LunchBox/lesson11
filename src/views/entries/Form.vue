<template>
	<form @submit.prevent="onSubmit">
		<input v-model="formData.title" placeholder="Entry Title" />
		<button type="submit">Add</button>
	</form>
</template>

<script setup>
	import { reactive } from "vue";

	import Entry from "@/models/entry.js";

	const formData = reactive({
		title: null,
	});

	function reset() {
		formData.title = null;
	}

	function onSubmit() {
		const entry = new Entry(formData);
		entry.create();
		reset();
	}
</script>

<style>
</style>
