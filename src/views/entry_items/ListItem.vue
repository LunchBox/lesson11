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
						<a @click="merge">Merge</a>
					</li>
					<li>
						<a @click="del">Del</a>
					</li>
				</ul>
			</div>
		</div>
		<div class="entry-item__content" @dblclick="edit">
			<p v-if="!entryItem.item">
				- item {{ entryItem.itemType }}::{{ entryItem.itemId }} has been
				removed -
			</p>
			<p v-else-if="!componentMap[entryItem.itemType]">
				- unsupported item type: {{ entryItem.itemType }} -
			</p>
			<component
				v-else
				:is="componentMap[entryItem.itemType]"
				:item="entryItem.item"
				:editing="editing"
				:isSelected="isSelected"
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
	import PenListItem from "../pens/Show.vue";
	import FaListItem from "../file_attachments/Show.vue";
	import EntryListItem from "../entries/ListItem.vue";

	const componentMap = {
		Memo: MemoListItem,
		Pen: PenListItem,
		Entry: EntryListItem,
		FileAttachment: FaListItem,
	};

	const props = defineProps({
		isSelected: Boolean,
		entry: Entry,
		entryItem: EntryItem,
	});

	const emit = defineEmits(["after-submit", "merge", "delete"]);

	watch(
		() => props.isSelected,
		(newVal) => {
			if (!newVal) {
				showMenus.value = false;
			}
		}
	);

	const showMenus = ref(false);

	function merge() {
		const { entryItem } = props;
		if (entryItem.itemType !== "Entry") {
			return;
		}

		emit("merge", entryItem);
	}

	function del() {
		const { entryItem } = props;
		emit("delete", entryItem);
	}

	const editing = ref(false);
	function edit(e) {
		const selectedText = window.getSelection().toString();
		// console.log(selectedText);

		if (selectedText.trim() == "") {
			editing.value = true;

			// 取消選中的文字
			if (document.selection && document.selection.empty) {
				document.selection.empty();
			} else if (window.getSelection) {
				var sel = window.getSelection();
				sel.removeAllRanges();
			}
		}
	}

	function afterSubmit() {
		editing.value = false;
		emit("after-submit");
	}
</script>

<style scoped>
</style>
