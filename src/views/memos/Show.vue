<template>
	<div v-if="memo">
		<MemoForm
			v-if="editing"
			:memo="memo"
			@after-submit="$emit('after-submit')"
		/>
		<div v-else class="memo">
			<div v-if="memo.isMarkdown" v-html="mdContent"></div>
			<div v-else v-highlight>
				<pre><code :class="`language-${memo.contentType}`">{{ memo.content }}</code></pre>
				<div
					v-if="memo.contentType === 'html'"
					v-html="memo.content"
				></div>
				<div v-if="memo.contentType === 'javascript'" class="output">
					<div v-if="memo.$result?.type === 'log'">
						&gt; {{ memo.$result.data }}
					</div>
					<div v-else-if="memo.$result?.type === 'image'">
						<img
							:src="memo.$result.data"
							:alt="`${memo.id}_output.png`"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed, watch } from "vue";
	import { marked } from "marked";

	import Memo from "@/models/memo.js";

	import MemoForm from "./Form.vue";

	marked.setOptions({
		renderer: new marked.Renderer(),
		// highlight: function (code, lang) {
		// 	const hljs = require("highlight.js");
		// 	const language = hljs.getLanguage(lang) ? lang : "plaintext";
		// 	return hljs.highlight(code, { language }).value;
		// },
		langPrefix: "hljs language-", // highlight.js css expects a top-level 'hljs' class.
		pedantic: false,
		gfm: true,
		breaks: true,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		xhtml: false,
	});

	const props = defineProps({
		item: Memo,
		editing: Boolean,
	});

	const memo = computed(() => props.item);

	const mdContent = computed(() => {
		if (memo.value) {
			return marked(memo.value.content);
		} else {
			return "- BLANK -";
		}
	});
</script>

<style scoped>
	.output {
		word-break: break-all;
		margin: 0.5em 0;
	}
</style>
