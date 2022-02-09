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
				:is="componentMap[entryItem.itemType]"
				:item="entryItem.item"
				:editing="editing"
				@after-submit="afterSubmit"
			>
			</component>
		</div>
	</div>
</template>

<script setup>
	import { ref, computed, watch } from "vue";

	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";

	import MemoListItem from "../memos/Show.vue";
	import EntryListItem from "../entries/ListItem.vue";

	const componentMap = {
		Memo: MemoListItem,
		Entry: EntryListItem,
	};

	const props = defineProps({
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
</script>

<style scoped>
</style>
