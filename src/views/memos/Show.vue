<template>
	<div v-if="memo">
		<MemoForm
			v-if="editing"
			:memo="memo"
			@after-submit="editing = false"
		/>
    <div v-else v-html="content"></div>
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
    editing: Boolean
	});

  const content = computed(() => {
    if (props.memo){
      return marked(props.memo.content)
    } else {
      return "- BLANK -"
    }
  });


</script>

<style scoped>
</style>
