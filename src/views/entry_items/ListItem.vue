<template>
	<div v-if="entryItem">
		<div v-if="showInfo">
			{{ entryItem }}
			&middot;
			<a @click.prevent="del">Del</a>
		</div>

		<EntryItemForm
			v-if="editing"
			:entryItem="entryItem"
			@after-submit="editing = false"
		/>
		<div v-else v-html="content" @dblclick.prevent="edit"></div>
	</div>
</template>

<script setup>
	import { ref, computed, watch } from "vue";
	import { marked } from "marked";

	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";

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
    showInfo: Boolean,
		entry: Entry,
		entryItem: EntryItem,
	});

  watch(
    () => props.entryItem,
    (newVal) => {
      if (newVal) {
        newVal.fetchItem();
      }
    },
    { immediate: true }
  );

  const content = ref(null);
  watch(
    () => props.entryItem.item,
    (newVal) => {
      if (newVal) {
        content.value = marked(newVal.content);
      }
    },
    { immediate: true }
  );


	function del() {
		const entryItem = props.entryItem;
		const idx = props.entry.entryItemIds.findIndex((id) => id === entryItem.id);
		if (idx > -1) {
			props.entry.entryItemIds.splice(idx, 1);
			props.entry.update();
		}
		entryItem.destroy();
	}

	const editing = ref(false);
	function edit() {
		editing.value = true;
	}
</script>

<style>
</style>
