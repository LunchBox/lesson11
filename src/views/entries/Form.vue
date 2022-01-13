<template>
	<n-form @submit.prevent="onSubmit">
		<n-form-item label="Entry Title">
			<n-input v-model:value="formData.title"></n-input>
			<n-button attr-type="submit">Submit</n-button>
		</n-form-item>
	</n-form>
</template>

<script setup>
	import { reactive } from "vue";
	import { NForm, NFormItem, NInput, NButton } from "naive-ui";

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
