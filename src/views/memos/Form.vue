<template>
	<form @submit.prevent="onSubmit">
		<textarea
			ref="inputField"
			v-model="formData.content"
			autofocus
			@keydown.enter.ctrl="onSubmit"
		></textarea>
	</form>
</template>

<script setup>
	import { ref, reactive, watch, onMounted, nextTick } from "vue";
	import Memo from "@/models/memo.js";
	import autosize from "autosize";

	const props = defineProps({
		memo: Memo,
	});

	const emit = defineEmits(["after-submit", "after-update"]);

	const inputField = ref(null);
	onMounted(() => {
		nextTick(() => {
			autosize(inputField.value);
		});
	});

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

<style scoped>
	textarea {
		height: 1.6em;
		resize: none;
		margin: 0.5em 0;
	}
</style>
