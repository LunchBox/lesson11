<template>
	<div style="margin: 1em 0">
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
			inputField.value.focus();
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
		let text = formData.content.trim();
		let contentType = "markdown";

		const CONTENT_TYPE = ["markdown", "md", "javascript", "js", "html", "css"];

		const CONTENT_TYPE_ALIAS = {
			md: "markdown",
			js: "javascript",
		};

		if (text.startsWith("/")) {
			const res = text.match(/^\/([^\s]+)\s+([\S\s]*)/im);
			if (CONTENT_TYPE.includes(res[1].toLowerCase())) {
				contentType = res[1].toLowerCase();

				if (CONTENT_TYPE_ALIAS[contentType]) {
					contentType = CONTENT_TYPE_ALIAS[contentType];
				}

				text = res[2];
			}
		}

		const memo = new Memo({ content: text, contentType });
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
