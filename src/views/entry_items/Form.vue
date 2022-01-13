<template>
	<n-form @submit.prevent="onSubmit">
    <n-form-item> 
			<n-input
				v-model:value="formData.content"
				type="textarea"
				placeholder="Content"
				:autosize="{
					minRows: 1,
				}"
        @keydown.enter.ctrl="onSubmit"
			/>
		</n-form-item>
	</n-form>
</template>

<script setup>
	import { reactive } from "vue";
	import { NForm, NFormItem, NInput, NButton } from "naive-ui";

  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

  const props = defineProps({
    entry: Entry
  });

	const formData = reactive({
		content: null,
	});

	function reset() {
		formData.content = null;
	}

	async function onSubmit() {
    const entryItem = new EntryItem(formData);
    entryItem.entryId = props.entry.id;
    await entryItem.create();

    props.entry.entryItemIds.push(entryItem.id);
    props.entry.update();

		reset();
	}
</script>

<style>
</style>
