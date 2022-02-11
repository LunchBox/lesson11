<template>
	<div class="gform">
		<form @submit.prevent="onSubmit">
			<div class="upload-file">
				<label>
					<input type="file" @change="onFileChange" />
				</label>
			</div>
			<textarea
				ref="inputField"
				v-model="formData.content"
				placeholder="What's on your mind?"
				@keydown.enter.ctrl="onSubmit"
				@blur="onBlur"
				@paste="onPaste"
			></textarea>
		</form>
	</div>
</template>

<script setup>
	import { ref, reactive, watch, onMounted, nextTick } from "vue";

	import Entry from "@/models/entry.js";
	import Memo from "@/models/memo.js";
	import Pen from "@/models/pen.js";
	import EntryItem from "@/models/entry_item.js";
	import FileAttachment from "@/models/file_attachment.js";

	import autosize from "autosize";

	const inputField = ref(null);

	async function attachItem(item) {
		const entryItem = new EntryItem(formData);
		entryItem.item = item;
		entryItem.entryId = props.entry.id;

		entryItem.$position = props.formIdx;

		console.log(entryItem);
		await entryItem.create();

		emit("after-create");
		emit("after-submit");

		reset();
	}

	async function onFileChange(e) {
		const f = e.target.files[0];
		console.log(f);

		const fa = new FileAttachment({ file: f });
		await fa.save();

		await attachItem(fa);
	}

	const uploading = ref(false);
	async function onPaste(event) {
		console.log("--- on paste on textarea");

		// start upload files, stop the regular paste action.
		event.preventDefault();

		if (!confirm("Files found in clipboard, do you want to upload now?")) {
			return;
		}

		uploading.value = true;
		const items = (event.clipboardData || event.originalEvent.clipboardData)
			.items;
		console.log(items);

		Array.from(items).forEach(async (item) => {
			if (item.kind === "file") {
				const blob = item.getAsFile();
				if (blob == null) {
					console.log("-- blob is null, try next one");
				} else {
					console.log(
						`-- pasted file: ${blob.name}; size: ${blob.size}; type: ${blob.type}`
					);

					const fa = new FileAttachment({ file: blob });
					await fa.save();
					await attachItem(fa);
				}
			}
		});
	}

	function focusOnInput() {
		inputField.value.style.height = "1.5em";
		autosize(inputField.value);
		inputField.value.focus();
	}

	onMounted(() => {
		nextTick(focusOnInput);
	});

	watch(
		() => props.formIdx,
		() => {
			nextTick(focusOnInput);
		}
	);

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
		nextTick(focusOnInput);
	}

	function onBlur() {
		if (formData.content !== null && formData.content.trim() !== "") {
			onSubmit();
		}
	}

	async function onSubmit() {
		let text = formData.content.trim();
		let contentType = "markdown";

		const CONTENT_TYPE = [
			"markdown",
			"md",
			"javascript",
			"js",
			"html",
			"css",
			"pen",
		];

		const CONTENT_TYPE_ALIAS = {
			md: "markdown",
			js: "javascript",
		};

		let targetItem = null;

		if (text.startsWith("//")) {
			const res = text.match(/^\/\/(.+)/im);
			if (res && res[1] && res[1].trim() !== "") {
				props.entry.update({ title: res[1].trim() });
			} else {
				props.entry.update({ title: "Untitled" });
			}
			reset();
			return;
		} else if (text.startsWith("/")) {
			const res = text.match(/^\/([^\s]+)\s+([\S\s]*)/im);
			if (CONTENT_TYPE.includes(res[1].toLowerCase())) {
				contentType = res[1].toLowerCase();

				if (CONTENT_TYPE_ALIAS[contentType]) {
					contentType = CONTENT_TYPE_ALIAS[contentType];
				}

				text = res[2];
			}

			switch (contentType) {
				case "pen":
					const pen = new Pen({ html: text });
					await pen.save();
					targetItem = pen;
					break;
				default:
					const memo = new Memo({ content: text, contentType });
					await memo.save();
					targetItem = memo;
			}
		} else if (text.startsWith("@")) {
			const res = text.match(/^\s*@([^\s]{7})/im);
			const id = res[1];
			const entry = await Entry.fetch(id);
			targetItem = entry;
		}

		if (!targetItem) {
			const memo = new Memo({ content: text, contentType });
			await memo.save();
			targetItem = memo;
		}

		await attachItem(targetItem);
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
	.gform {
		margin: var(--p-margin) 0;
		position: relative;
	}
	.gform form {
		position: relative;
	}
	.gform form .upload-file {
		position: absolute;
		left: -2em;
	}
	.gform form .upload-file label {
		display: inline-block;
		width: 1em;
		height: 1em;
		overflow: hidden;

		background: tomato;
		border-radius: 2px;
	}
	.gform form .upload-file label input {
		display: none;
	}
	textarea {
		height: 1.5em;
		resize: none;
		border: none;
		outline: none;
		padding: 0;
		margin: 0;
		display: block;

		color: tomato;

		flex: 1;
		margin-right: 0.5em;
	}
	textarea:focus {
		color: var(--color);
	}
</style>
