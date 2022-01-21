<template>
	<div v-if="entryItem">
		<div v-if="showInfo">
			{{ entryItem }}
			&middot;
			<a @click.prevent="del">Del</a>
		</div>

    <div style="display: flex; align-items: baseline;">
      <div class="ei-menu" :class="{ active: isSelected }"> 
        <n-dropdown 
          @select="handleSelect" 
          trigger="click" 
          placement="bottom-start"
          :options="options"
        >
          <n-button text>M</n-button>
        </n-dropdown>
      </div>
      <div style="flex: 1" @dblclick.prevent="edit">
        <component :is="MemoView" :memo="entryItem.item" :editing="editing"></component>
      </div>
    </div>
	</div>
</template>

<script setup>
	import { ref, computed, watch } from "vue";
  import { NDropdown, NButton } from "naive-ui";
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

const eiMark = computed(() => {
  return `EI::${props.entryItem.id}`;
});

  const options = [
    {
      label: () => eiMark.value, 
      key: () => eiMark.value 
    },
    {
      label: "edit",
      key: edit
    },
    {
      label: "delete",
      key: "delete"
    },
  ];


  function handleSelect(key){
    console.log(key);
    if (typeof key === "function"){
      key();
    }
  }
</script>

<style scoped>
.ei-menu {
  margin-right: 20px; 
  margin-left: -32px;
  visibility: hidden;
}

.ei-menu.active {
  visibility: visible; 
}
</style>
