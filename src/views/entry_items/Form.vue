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
	import { ref, reactive, watch } from "vue";
	import { NForm, NFormItem, NInput, NButton } from "naive-ui";

  import Entry from "@/models/entry.js";
  import EntryItem from "@/models/entry_item.js";

  const props = defineProps({
    entry: Entry,
    entryItem: EntryItem
  });

  const emit = defineEmits(["after-submit"]);

	const formData = reactive({
		content: null,
	});

  const editing = ref(null);

	function reset() {
		formData.content = null;

    editing.value = null;
	}

	async function onSubmit() {
    if (!editing.value) {
      const entryItem = new EntryItem(formData);
      entryItem.entryId = props.entry.id;
      await entryItem.create();

      props.entry.entryItemIds.push(entryItem.id);
      await props.entry.update();
    } else {
      await editing.value.update(formData);
    }

    emit("after-submit");

		reset();
	}


  watch(
    () => props.entryItem,
    (newVal) => {
      if (newVal) {
        for(let key in formData) {
          formData[key] = newVal[key]
        }

        editing.value = newVal;
      }
    },
    { immediate: true }
  )
</script>

<style>
</style>
