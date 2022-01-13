<template>
  <div v-if="entryItem">
    <div v-html="content"></div>

    <div v-if="false">
      {{ entryItem }}
      &middot;
      <a @click.prevent="del(entryItem)">Del</a>
    </div>
  </div>
</template>

<script setup>
	import { computed } from "vue";
	import { marked } from "marked";

  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

  const props = defineProps({
    entry: Entry,
    entryItem: EntryItem
  });

  const content = computed(() => {
		if (props.entryItem && props.entryItem.content) {
			return marked(props.entryItem.content);
		}
  });

  function del(entryItem){
    const idx = props.entry.entryItemIds.findIndex(id => id === entryItem.id);
    if (idx > -1) {
      props.entry.entryItemIds.splice(idx, 1);
      props.entry.update();
    }
    entryItem.destroy();
  }
</script>

<style>
</style>
