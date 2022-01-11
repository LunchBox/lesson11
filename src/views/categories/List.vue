<template>
	<h2>Category List</h2>

	<ul>
		<li v-for="category in list" :key="category.name">
			<router-link :to="`/categories/${category.id}`">
				{{ category.name }}
			</router-link>
		</li>
	</ul>
	<Form />
</template>

<script setup>
	import Form from "./Form.vue";

	import { list, fetchAll } from "@/store/categories.js";

	fetchAll();
</script>

<style>
</style>