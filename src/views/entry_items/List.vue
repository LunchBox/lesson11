<template>
	<EntryItemForm :entry="entry" />
  <div v-for="entryItem in list" :key="entryItem.id">
    {{ entryItem }}

    &middot;
    <a @click.prevent="del(entryItem)">Del</a>
  </div>
</template>

<script setup>
  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";

  const props = defineProps({
    entry: Entry
  });

  const list = EntryItem.list;

  EntryItem.fetchAll();

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
