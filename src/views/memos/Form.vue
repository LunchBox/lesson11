<template>
	<form @submit.prevent="onSubmit" @keydown.enter.ctrl="onSubmit">
		<textarea ref="inputField" v-model="formData.content"></textarea>
		<div class="path">
			http://localhost:9090/memo_caches/{{ memo.cacheFilename }}
		</div>
	</form>
</template>

<script setup>
	import { ref, reactive, watch, onMounted, nextTick } from "vue";
	import Memo from "@/models/memo.js";
	import autosize from "autosize";
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
		height: 1.5em;
		resize: none;
	}

	.path {
		font-style: italic;
		font-size: smaller;
		margin-bottom: 0.5em;
	}
</style>

<style>
	.CodeMirror {
		font-size: 13px;
		border: 1px solid #eee;
		margin: 0.5em 0;
		height: auto;

		line-height: 1.35;
	}
</style>