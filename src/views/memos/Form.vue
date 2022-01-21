<template>
	<n-form @submit.prevent="onSubmit">
		<n-form-item>
			<n-input
				v-model:value="formData.content"
				type="textarea"
				placeholder="Content"
				autofocus
				:autosize="{
					minRows: 1,
				}"
				@keydown.enter.ctrl="onSubmit"
			/>
		</n-form-item>
	</n-form>
</template>

<script setup>
	import { ref, reactive, watch } from "vue";
	import { NForm, NFormItem, NInput, NButton } from "naive-ui";

	import Memo from "@/models/memo.js";

	const props = defineProps({
    memo: Memo
	});

	const emit = defineEmits(["after-submit", "after-update"]);

	const formData = reactive({
		content: null,
	});

	function reset() {
		formData.content = null;
	}

	async function onSubmit() {
    await props.memo.update(formData);

    emit("after-update");
		emit("after-submit");

		reset();
	}

	watch(
		() => props.memo,
		(newVal) => {
			if (newVal) {
				for (let key in formData) {
					formData[key] = newVal[key];
				}
			}
		},
		{ immediate: true }
	);
</script>

<style>
</style>
