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
				@drop="onDrop"
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
	import entryItemTypes from "@/models/entry_item_types.js";

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

	async function attachFile(file) {
		console.log(
			`-- uploading file ${file.name}; size: ${file.size}; type: ${file.type}`
		);
		const fa = new FileAttachment({ file });
		await fa.save();
		await attachItem(fa);
	}

	async function onFileChange(e) {
		await attachFile(e.target.files[0]);
	}

	function onDrop(event) {
		let files = event.dataTransfer.files;

		// if files prsent, otherwise just pop up the event to normal drop..
		if (files && files.length > 0) {
			event.preventDefault();
			console.log("-- files detected on drop");
			Array.from(files).forEach(attachFile);
		}
	}

	async function onPaste(event) {
		console.log("--- on paste on textarea");

		const items = (event.clipboardData || event.originalEvent.clipboardData)
			.items;
		console.log(items);

		const files = Array.from(items)
			.filter((item) => item.kind === "file")
			.map((item) => item.getAsFile());

		if (files.length > 0) {
			// start upload files, stop the regular paste action.
			event.preventDefault();

			if (confirm("Files found in clipboard, do you want to upload now?")) {
				files.forEach(attachFile);
			}
		}
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

	function formatText(text) {
		let d = new Date();
		let ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
		let mo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(d);
		let da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

		const r = `${ye}-${mo}-${da}`;

		return text.replaceAll(/@date($|\s)/gi, `${ye}-${mo}-${da}$1`);
	}

	const submitting = ref(false);
	async function onSubmit() {
		if (submitting.value || formData.content === null) {
			return;
		}

		submitting.value = true;

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
			"sub",
			"fork",
		];

		const CONTENT_TYPE_ALIAS = {
			md: "markdown",
			js: "javascript",
		};

		let targetItem = null;

		if (text.startsWith("//")) {
			const res = text.match(/^\/\/(.+)/im);
			if (res && res[1] && res[1].trim() !== "") {
				props.entry.update({ title: formatText(res[1].trim()) });
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

				text = formatText(res[2]);
			}

			switch (contentType) {
				case "pen":
					const pen = new Pen({ html: text });
					await pen.save();
					targetItem = pen;
					break;
				case "sub":
					const entry = new Entry({ title: text });
					await entry.save();
					targetItem = entry;
					break;
				case "fork":
					const res = text.match(/([^\s]+)::([^\s]+)/im);
					if (res) {
						const C = entryItemTypes[res[1]];
						const target = await C.fetch(res[2]);
						const { id, ...rest } = target;
						const clone = new C(rest);
						await clone.save();
						targetItem = clone;
					}
					break;
				default:
					const memo = new Memo({ content: text, contentType });
					await memo.save();
					targetItem = memo;
			}
		} else if (text.startsWith("@")) {
			const res = text.match(/^\s*@([^\s]{7})/im);
			if (res) {
				const id = res[1];
				const entry = await Entry.fetch(id);
				targetItem = entry;
			}
		} else {
			const res = text.match(/^([^\s]+)::([^\s]+)$/im);
			if (res) {
				const C = entryItemTypes[res[1]];
				const target = await C.fetch(res[2]);
				targetItem = target;
			}
		}

		if (!targetItem) {
			const memo = new Memo({ content: formatText(text), contentType });
			await memo.save();
			targetItem = memo;
		}

		await attachItem(targetItem);
		submitting.value = false;
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

		box-sizing: border-box;
		border: 1px solid tomato;
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
