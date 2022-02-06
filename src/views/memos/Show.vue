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
				<div
					v-if="memo.contentType === 'javascript'"
					style="margin-bottom: 1em"
				>
					&gt; {{ memo.$result }}
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
		memo: Memo,
		editing: Boolean,
	});

	const mdContent = computed(() => {
		if (props.memo) {
			return marked(props.memo.content);
		} else {
			return "- BLANK -";
		}
	});
</script>

<style scoped>
	:deep(p) {
		margin: 0.5em 0;
	}

	pre {
		/* padding: 0; */
	}

	.hljs {
		background: transparent;
		font-family: monospace;
		font-size: 13px;
	}

	pre code.hljs {
		padding: 0.5em;
		padding: 0;
	}
</style>
