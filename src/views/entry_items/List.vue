<template>
	<EntryItemForm :entry="entry" />
  <div v-for="entryItem in list" :key="entryItem.id">
    <div v-html="contentOf(entryItem)"></div>


    {{ entryItem }}
    &middot;
    <a @click.prevent="del(entryItem)">Del</a>
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";

	import { marked } from "marked";

  const props = defineProps({
    entry: Entry
  });

  const list = EntryItem.all;

  EntryItem.fetchAll();

  function del(entryItem){
    const idx = props.entry.entryItemIds.findIndex(id => id === entryItem.id);
    if (idx > -1) {
      props.entry.entryItemIds.splice(idx, 1);
      props.entry.update();
    }
    entryItem.destroy();
  }

  function contentOf(entryItem){
		if (entryItem.content) {
			return marked(entryItem.content);
		}
    return "-- blank --"
  }
</script>

<style>
</style>
