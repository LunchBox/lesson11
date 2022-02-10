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
		></iframe>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted, nextTick, reactive } from "vue";

	import Pen from "@/models/pen.js";

	import CodeMirror from "codemirror";
	import cmOption from "@/utils/codemirror_option.js";

	import "codemirror/lib/codemirror.css";
	import "codemirror/mode/javascript/javascript.js";
	import "codemirror/mode/htmlmixed/htmlmixed.js";
	import "codemirror/mode/css/css.js";

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
		preview();
	}

	async function onSubmit() {
		const { content, width, height } = formData;
		const data = { [editing.value]: content, width, height };
		await pen.value.update(data);

		reset();
	}

	const iframe = ref(null);

	onMounted(() => {
		nextTick(() => {
			preview();
		});
	});

	function preview() {
		const content = [];
		if (pen.value.css) {
			content.push("<style>\r\n" + pen.value.css + "\r\n</style>");
		}

		if (pen.value.html) {
			content.push(pen.value.html);
		}

		if (pen.value.js) {
			content.push("<scr" + "ipt>\r\n" + pen.value.js + "\r\n</scr" + "ipt>");
		}
		console.log(content.join("\r\n"));
		const doc = iframe.value.contentWindow.document;
		doc.open();
		doc.writeln(content.join("\r\n"));
		doc.close();
	}
</script>

<style scoped>
	.pen {
		margin: 1em 0;
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
		margin-bottom: 1em;
	}

	.form-item {
		margin-bottom: 0.5em;
	}
</style>
