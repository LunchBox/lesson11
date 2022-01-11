<template>
	<n-form @submit.prevent="onSubmit">
		<n-form-item label="Category Name">
			<n-input v-model:value="formData.name"></n-input>
			<n-button attr-type="submit">Submit</n-button>
		</n-form-item>
	</n-form>
</template>

<script setup>
	import { reactive } from "vue";
	import { NForm, NFormItem, NInput, NButton } from "naive-ui";

	import { save } from "@/store/categories.js";

	const formData = reactive({
		name: null,
	});

	function reset() {
		formData.name = null;
	}

	function onSubmit() {
		save(formData);
		reset();
	}
</script>

<style>
</style>