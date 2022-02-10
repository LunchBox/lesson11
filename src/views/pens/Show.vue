<template>
	<div v-if="pen" class="pen">
		<div class="toolbar">
			<a href="" @click.prevent="edit('html')">HTML</a> |
			<a href="" @click.prevent="edit('js')">JavaScript</a> |
			<a href="" @click.prevent="edit('css')">CSS</a>
		</div>
		<form
			v-if="editing"
			@submit.prevent="onSubmit"
			@keydown.enter.ctrl="onSubmit"
		>
			<div class="form-item">
				<textarea
					ref="inputField"
					v-model="formData.content"
				></textarea>
			</div>

			<div class="form-item">
				width: <input type="text" v-model="formData.width" /> height:
				<input type="text" v-model="formData.height" /> &nbsp;
				<button type="submit">Save</button>
				<button @click.prevent="reset()">Cancel</button>
			</div>
		</form>
		<iframe
			ref="iframe"
			class="debug"
			:style="{ width: pen.width, height: pen.height }"
			:src="pen.cacheUrl"
		></iframe>
	</div>
</template>

<script setup>
	import Pen from "@/models/pen.js";
	import cmOption from "@/utils/codemirror_option.js";
	import CodeMirror from "codemirror";
	import "codemirror/lib/codemirror.css";
	import "codemirror/mode/css/css.js";
	import "codemirror/mode/htmlmixed/htmlmixed.js";
	import "codemirror/mode/javascript/javascript.js";
	import { computed, nextTick, onBeforeUnmount, reactive, ref } from "vue";

	const props = defineProps({
		item: Pen,
		editing: Boolean,
	});

	const pen = computed(() => props.item);

	const editing = ref(null);
	const formData = reactive({
		content: null,
		width: "auto",
		height: "auto",
	});

	const inputField = ref(null);
	async function edit(contentType = "html") {
		if (editing.value) {
			await onSubmit();
		}

		editing.value = contentType;
		formData.content = pen.value[contentType];
		formData.width = pen.value.width;
		formData.height = pen.value.height;

		const modeMapping = {
			html: "htmlmixed",
			js: "javascript",
			css: "css",
		};

		nextTick(() => {
			const editor = CodeMirror.fromTextArea(inputField.value, {
				...cmOption,
				mode: modeMapping[contentType],
			});
			editor.on("change", (cm) => {
				formData.content = cm.getValue();
			});
		});
	}

	function reset() {
		formData.content = null;
		editing.value = null;
	}

	async function onSubmit() {
		const { content, width, height } = formData;
		const data = { [editing.value]: content, width, height };

		pen.value.afterFileize(reloadIframe);

		await pen.value.update(data);

		reset();
	}

	const iframe = ref(null);

	// onMounted(() => {
	// 	nextTick(() => {
	// 		preview();
	// 	});
	// });

	// child iframe 返回一些 string 數據就 save 到 pen 中
	const runtimeHandler = async (event) => {
		if (event.data && typeof event.data === "string") {
			await pen.value.update({ data: event.data });
		}
	};

	window.addEventListener("message", runtimeHandler);
	onBeforeUnmount(() => {
		window.removeEventListener("message", runtimeHandler);
	});

	function reloadIframe() {
		// iframe.value.contentWindow.location.reload(true);
		iframe.value.src = pen.value.cacheUrl + "?t=" + new Date().getTime();
	}
</script>

<style scoped>
	.pen {
		margin: 0.5em 0;
	}

	iframe.debug {
		width: 100%;
		border: 2px solid #f5f7fa;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		display: block;
	}

	.toolbar {
		background: #f5f7fa;
		font-family: monospace;
		padding: 4px 0.5em;
		margin-bottom: 0.5em;
	}
	.toolbar a {
		color: #333;
		font-size: smaller;
		text-decoration: none;
	}
	form {
		margin-bottom: 0.5em;
	}

	.form-item {
		margin-bottom: 0.5em;
	}
</style>
