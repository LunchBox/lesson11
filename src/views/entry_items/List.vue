<template>
	<EntryItemForm :entry="entry" />
  <ListItem v-for="entryItem in list" :key="entryItem.id" :entry="entry" :entryItem="entryItem">
  </ListItem>
</template>

<script setup>
  import { computed } from "vue";
  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";
	import ListItem from "./ListItem.vue";

  const props = defineProps({
    entry: Entry
  });

  const list = computed(() => props.entry.entryItems);

</script>

<style>
</style>
