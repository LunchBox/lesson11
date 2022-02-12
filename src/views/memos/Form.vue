<template>
	<form @submit.prevent="onSubmit" @keydown.enter.ctrl="onSubmit">
		<textarea ref="inputField" v-model="formData.content"></textarea>
	</form>
</template>

<script setup>
	import { ref, reactive, watch, onMounted, nextTick } from "vue";
	import Memo from "@/models/memo.js";
	import autosize from "autosize";
	import { js_beautify } from "js-beautify";
	import jbOption from "@/utils/js_beautify_option.js";

	import CodeMirror from "codemirror";
	import cmOption from "@/utils/codemirror_option.js";
	import "codemirror/lib/codemirror.css";
	import "codemirror/mode/javascript/javascript.js";

	const props = defineProps({
		memo: Memo,
	});

	const emit = defineEmits(["after-submit", "after-update"]);

	const inputField = ref(null);
	onMounted(() => {
		nextTick(() => {
			if (!props.memo.isMarkdown) {
				const editor = CodeMirror.fromTextArea(inputField.value, cmOption);
				editor.on("change", (cm) => {
					formData.content = cm.getValue();
				});

				editor.on("keydown", (cm, e) => {
					if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
						e.preventDefault();

						let content = cm.getValue();
						if (props.memo.contentType === "javascript") {
							content = js_beautify(cm.getValue(), jbOption);
							cm.getDoc().setValue(content);
						}

						props.memo.update({ content });
					}
				});
			} else {
				autosize(inputField.value);
				inputField.value.focus();
			}
		});
	});

	const formData = reactive({
		content: null,
	});

	function reset() {
		formData.content = null;
	}

	async function onSubmit() {
		let { content } = formData;
		if (props.memo.contentType === "javascript") {
			content = js_beautify(content, jbOption);
		}
		await props.memo.update({ content });

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
	form {
		margin-top: var(--p-margin);
	}
	textarea {
		height: 1.5em;
		resize: none;
	}
</style>

<style>
	.CodeMirror {
		font-size: 13px;
		border: 1px solid #eee;
		margin: var(--p-margin) 0;
		height: auto;

		line-height: 1.35;
	}
</style>