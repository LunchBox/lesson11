<template>
	<div v-if="entryItem" class="entry-item list-item">
		<div class="entry-item__menus">
			<span class="icon" @click="showMenus = true"></span>
			<div
				v-if="isSelected && showMenus"
				class="menus"
				@click.stop="showMenus = false"
			>
				<ul>
					<li>
						<span> {{ eiMark }} </span>
					</li>
					<li>
						<a @click="edit">Edit</a>
					</li>
					<li>
						<a @click="del">Del</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="entry-item__content" @dblclick.prevent="edit">
			<component
				:is="MemoView"
				:memo="entryItem.item"
				:editing="editing"
				@after-submit="afterSubmit"
			>
			</component>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed, watch } from "vue";
	import { marked } from "marked";

	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";

	import MemoView from "../memos/Show.vue";

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
		isSelected: Boolean,
		entry: Entry,
		entryItem: EntryItem,
	});

	const emit = defineEmits(["after-submit"]);

	watch(
		() => props.isSelected,
		(newVal) => {
			if (!newVal) {
				showMenus.value = false;
			}
		}
	);

	// watch(
	// 	() => props.entryItem,
	// 	(newVal) => {
	// 		if (newVal) {
	// 			newVal.fetchItem();
	// 		}
	// 	},
	// 	{ immediate: true }
	// );

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

	const showMenus = ref(false);

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

	function afterSubmit() {
		editing.value = false;
		emit("after-submit");
	}

	const eiMark = computed(() => {
		return `EI::${props.entryItem.id}`;
	});
</script>

<style scoped>
</style>
