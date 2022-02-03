<template>
	<div style="margin: 0.5em 0">
		<form @submit.prevent="onSubmit">
			<textarea
				ref="inputField"
				v-model="formData.content"
				placeholder="Content"
				autofocus
				@keydown.enter.ctrl="onSubmit"
			></textarea>
		</form>
	</div>
</template>

<script setup>
	import { ref, reactive, watch, onMounted, nextTick } from "vue";

	import Entry from "@/models/entry.js";
	import Memo from "@/models/memo.js";
	import EntryItem from "@/models/entry_item.js";

	import autosize from "autosize";

	const inputField = ref(null);
	onMounted(() => {
		nextTick(() => {
			autosize(inputField.value);
		});
	});

	const props = defineProps({
		entry: Entry,
		entryItem: EntryItem,
		formIdx: Number,
	});

	const emit = defineEmits(["after-submit", "after-create", "after-update"]);

	const formData = reactive({
		content: null,
	});

	function reset() {
		formData.content = null;
	}

	async function onSubmit() {
		const memo = new Memo({ content: formData.content });
		await memo.save();

		const entryItem = new EntryItem(formData);
		entryItem.item = memo;
		entryItem.entryId = props.entry.id;

		entryItem.$position = props.formIdx;

		console.log(entryItem);
		await entryItem.create();

		emit("after-create");

		emit("after-submit");

		reset();
	}

	watch(
		() => props.entryItem,
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
	}
</style>
