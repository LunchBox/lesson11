<template>
	<n-form @submit.prevent="onSubmit">
		<n-form-item>
			<n-input
				v-model:value="formData.content"
				type="textarea"
				placeholder="Content"
				autofocus
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
	import Memo from "@/models/memo.js";
	import EntryItem from "@/models/entry_item.js";

	const props = defineProps({
		entry: Entry,
		entryItem: EntryItem,
		formIdx: Number,
	});

	const emit = defineEmits(["after-submit", "after-create", "after-update"]);

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
      const memo = new Memo({ content: formData.content });
      await memo.save();

      const entryItem = new EntryItem(formData);
      entryItem.item = memo;
			entryItem.entryId = props.entry.id;
			entryItem.seq = props.formIdx + 1;

      console.log(entryItem);
      await entryItem.create();

			emit("after-create");
		} else {
			await editing.value.update(formData);
			emit("after-update");
		}

		emit("after-submit");

		reset();
	}

	watch(
		() => props.entryItem,
		(newVal) => {
			if (newVal) {
				for (let key in formData) {
					formData[key] = newVal[key];
				}

				editing.value = newVal;
			}
		},
		{ immediate: true }
	);
</script>

<style>
</style>
