<template>
  <div v-if="entryItem">

    <div v-if="false">
      {{ entryItem }}
      &middot;
      <a @click.prevent="del">Del</a>
    </div>

    <EntryItemForm v-if="editing" :entryItem="entryItem" @after-submit="editing = false" />
    <div v-else v-html="content" @dblclick="edit"></div>
  </div>
</template>

<script setup>
	import { ref, computed } from "vue";
	import { marked } from "marked";

  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

  import EntryItemForm from "./Form.vue";

  const props = defineProps({
    entry: Entry,
    entryItem: EntryItem
  });

  const content = computed(() => {
		if (props.entryItem && props.entryItem.content) {
			return marked(props.entryItem.content);
		}
  });

  function del(){
    const entryItem = props.entryItem;
    const idx = props.entry.entryItemIds.findIndex(id => id === entryItem.id);
    if (idx > -1) {
      props.entry.entryItemIds.splice(idx, 1);
      props.entry.update();
    }
    entryItem.destroy();
  }

  const editing = ref(false);
  function edit(){
    editing.value = true
  }
</script>

<style>
</style>
