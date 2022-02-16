<template>
	<template v-for="(entryItem, idx) in list" :key="entryItem?.id">
		<ListItem
			v-if="isEntryItem(entryItem)"
			:entry="entry"
			:entryItem="entryItem"
			:class="{ selected: isSelected(entryItem) }"
			:isSelected="isSelected(entryItem)"
			@click="select(entryItem, $event)"
			@after-submit="$emit('after-submit')"
			@merge="merge"
			@delete="deleteEntryItem"
		>
		</ListItem>
		<div v-else>
			<p>
				- Error:: entryItem {{ entry.entryItemIds[idx] }} not exist -
				<a href="" @click.prevent="removeIdCache(idx)">Remove</a>
			</p>
		</div>

		<div :id="`form-wrapper-${idx}`"></div>
	</template>

	<teleport v-if="formIdx !== null" :to="`#form-wrapper-${formIdx}`">
		<EntryItemForm
			:entry="entry"
			:formIdx="formIdx"
			@after-create="afterCreate"
		/>
	</teleport>

	<EntryItemForm
		v-if="entryItemList.length === 0"
		:entry="entry"
		:formIdx="formIdx"
		@after-create="afterCreate"
	/>
</template>

<script setup>
	import { ref, computed, watch, onBeforeUnmount } from "vue";
	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";
	import Memo from "@/models/memo.js";

	import EntryItemForm from "./Form.vue";
	import ListItem from "./ListItem.vue";

	import isInput from "@/utils/is_input.js";

	const props = defineProps({
		entry: Entry,
	});

	const emit = defineEmits(["after-submit"]);

	const list = computed(() => props.entry.entryItems);
	const entryItemList = computed(() =>
		list.value.filter((item) => isEntryItem(item))
	);

	const selection = ref([]);

	function isSelected(entryItem) {
		return selection.value.includes(entryItem);
	}

	function clearSelection() {
		selection.value.splice(0);
	}

	function addToSelection(entryItems) {
		selection.value.push(
			...entryItems.filter((ei) => !selection.value.includes(ei))
		);

		// correct the seq
		const tmp = list.value.filter((ei) => selection.value.includes(ei));
		clearSelection();
		selection.value.push(...tmp);
	}

	function replaceSelection(entryItems) {
		clearSelection();
		addToSelection(entryItems);
	}

	function removeFromSelection(entryItems) {
		entryItems.forEach((ei) => {
			const idx = selection.value.indexOf(ei);
			if (idx > -1) {
				selection.value.splice(idx, 1);
			}
		});
	}

	function select(entryItem, event) {
		const selected = selection.value;
		if (event.ctrlKey || event.metaKey || event.altKey) {
			if (selected.includes(entryItem)) {
				removeFromSelection([entryItem]);
			} else {
				addToSelection([entryItem]);
			}
		} else if (event.shiftKey) {
			if (selected.includes(entryItem)) {
				return;
			}

			const idx = list.value.indexOf(entryItem);

			if (selected.length > 0) {
				const s = list.value.indexOf(selected[0]);
				const e = list.value.indexOf(selected[selected.length - 1]);

				if (idx < s) {
					replaceSelection(list.value.slice(idx, e + 1));
				} else if (idx > s && idx < s) {
					replaceSelection(list.value.slice(s, e + 1));
				} else if (idx > e) {
					replaceSelection(list.value.slice(s, idx + 1));
				}
			} else {
				addToSelection([entryItem]);
			}
		} else {
			replaceSelection([entryItem]);
		}

		// 雖然可以點哪個 item 就在 item 下方開 form，但這樣整個頁面抖動太厲害，不喜
		// if (selection.value.length === 1) {
		// 	setFormUnder(selection.value[0]);
		// }
	}

	async function removeIdCache(idx) {
		const { entry } = props;
		entry.entryItemIds.splice(idx, 1);
		entry.update();
	}

	async function deleteEntryItem(entryItem) {
		const { entry } = props;
		const idx = entry.entryItemIds.indexOf(entryItem.id);
		if (idx > -1) {
			entry.entryItemIds.splice(idx, 1);
			await entry.update();
		}
		await entryItem.destroy();
	}

	async function merge(entryItem) {
		const { entry } = props;
		if (entryItem.itemType !== "Entry") {
			return;
		}

		clearSelection();

		const pos = entry.entryItemIds.indexOf(entryItem.id);

		const item = await entryItem.fetchItem();

    // merge the title
    if (item.title && item.title.trim() !== ""){
      const memo = new Memo({ content: `## ${item.title.trim()}`, contentType: "markdown" });
      await memo.save();

      const entryItem = new EntryItem({});
      entryItem.item = memo;
      entryItem.entryId = item.id;

      entryItem.$position = -1;
      await entryItem.create();
    }

    await item.reload();

		entry.entryItemIds.splice(pos, 0, ...item.entryItemIds);
		await entry.update();

		const jobs = item.entryItemIds.map((id) => EntryItem.fetch(id));
		const entryItems = await Promise.all(jobs);

		const jobs2 = entryItems.map((ei) => ei.update({ entryId: entry.id }));
		await Promise.all(jobs2);

		await deleteEntryItem(entryItem);
		await item.destroy();

		replaceSelection(entryItems);
	}

	async function splitSelection() {
		const eis = selection.value;
		const eiIds = eis.map((ei) => ei.id);
		const entry = new Entry({ title: "Untitled" });
		await entry.create();

		const jobs = eis.map((ei) => ei.update({ entryId: entry.id }));
		await Promise.all(jobs);

		await entry.update({ entryItemIds: eiIds });

		const pos = props.entry.entryItemIds.indexOf(eiIds[0]);

		const _eiIds = props.entry.entryItemIds.filter((id) => !eiIds.includes(id));
		props.entry.update({ entryItemIds: _eiIds });

		const entryItem = new EntryItem({});
		entryItem.item = entry;
		entryItem.entryId = props.entry.id;

		entryItem.$position = pos - 1;
		await entryItem.create();
	}

	function moveSelectionUp() {
		const ids = [...props.entry.entryItemIds];
		selection.value.forEach((ei) => {
			const idx = ids.indexOf(ei.id);
			if (idx > 0) {
				ids.splice(idx, 1);
				ids.splice(idx - 1, 0, ei.id);
			}
		});

		props.entry.update({ entryItemIds: ids });
	}

	function moveSelectionDown() {
		const ids = [...props.entry.entryItemIds];
		selection.value.forEach((ei) => {
			const idx = ids.indexOf(ei.id);
			if (idx < ids.length - 1) {
				ids.splice(idx, 1);
				ids.splice(idx + 1, 0, ei.id);
			}
		});

		props.entry.update({ entryItemIds: ids });
	}

	function selectAbove(append = false) {
		const ei = selection.value[0];
		const idx = list.value.indexOf(ei);
		if (idx > 0) {
			if (!append) {
				clearSelection();
			}
			const target = list.value[idx - 1];
			addToSelection([target]);
		}
	}

	function selectBelow(append = false) {
		const ei = selection.value[selection.value.length - 1];
		const idx = list.value.indexOf(ei);
		if (idx < list.value.length - 1) {
			if (!append) {
				clearSelection();
			}
			const target = list.value[idx + 1];
			addToSelection([target]);
		}
	}

	const keydownHandler = (e) => {
		// 在 input 裡的所有 keydown 都不做特別處理
		if (isInput(e.target)) {
			return;
		}

		// 在只選中一個 item 地情況下按 entry 就在下方開啟輸入欄
		if (e.code === "Enter" && !e.ctrlKey) {
			if (selection.value.length !== 1) {
				return;
			}

			e.preventDefault();
			setFormUnder(selection.value[0]);
			clearSelection();
		}

		// 按下 esc 取消所有選中
		if (e.code === "Escape") {
			e.preventDefault();
			clearSelection();
		}

		if (selection.value.length > 0) {
			// 有選中任何 item 的時候按 tab 就折疊一層
			if (e.code === "Tab") {
				e.preventDefault();
				if (window.confirm("Are you sure to split these items?")) {
					splitSelection();
				}
			}

			if (e.ctrlKey || e.altKey) {
				// 按 ctrl + 上下箭頭移動 item
				const m = {
					ArrowUp: moveSelectionUp,
					ArrowDown: moveSelectionDown,
				};
				m[e.code] && m[e.code]();
			} else if (e.shiftKey) {
				// 按 shift 上下箭頭選中上下 item
				const m = {
					ArrowUp: selectAbove,
					ArrowDown: selectBelow,
				};
				m[e.code] && m[e.code](true);
			} else if (selection.value.length === 1) {
				// 只選中一個 item 的情況下按上下箭頭選中對應上下的 item
				const m = {
					ArrowUp: selectAbove,
					ArrowDown: selectBelow,
				};
				m[e.code] && m[e.code]();
			}
		} else {
			// 每選中任何 item 的時候按 tab 選中第一個 item
			if (e.code === "Tab") {
				if (list.value.length > 0) {
					e.preventDefault();
					addToSelection([list.value[0]]);
				}
			}
		}
	};

	document.addEventListener("keydown", keydownHandler);
	onBeforeUnmount(() => {
		document.removeEventListener("keydown", keydownHandler);
	});

	function isEntryItem(entryItem) {
		return entryItem instanceof EntryItem;
	}

	const formIdx = ref(null);

	function setFormUnder(entryItem) {
		formIdx.value = list.value.indexOf(entryItem);
	}

	function afterCreate() {
		formIdx.value += 1;
		if (formIdx.value >= list.value.length) {
			formIdx.value = list.value.length - 1;
		}
	}
</script>

<style>
	.entry-item {
		/* margin-left: calc(-2.5em - 4px); */
		display: flex;
		position: relative;
	}

	.entry-item__menus {
		width: 2em;
		height: 100%;

		position: absolute;
		left: -2em;
	}

	.entry-item__menus .icon {
		display: inline-block;
		width: 1em;
		height: 1em;
		box-sizing: border-box;
		border: 1px solid #ccc;
		border-radius: 2px;
		margin-top: calc(var(--p-margin) * 1.3);
		cursor: pointer;

		visibility: hidden;
	}

	.entry-item.selected .entry-item__menus .icon {
		visibility: visible;
	}

	.entry-item__menus .menus {
		position: absolute;
		z-index: 1;
		margin-top: 2px;

		background: #fff;
		color: #555;
		font-size: 13px;

		border: 1px solid #ccc;
		border-radius: 2px;
		padding: 0.5em;

		min-width: 160px;
	}

	.entry-item__menus .menus ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.entry-item__menus .menus ul li {
		line-height: 30px;
	}

	.entry-item__menus .menus ul li > * {
		display: block;
		padding: 0 4px;
	}

	.entry-item__menus .menus ul li a:hover {
		background: #eee;
	}

	.entry-item__content {
		flex: 1;
	}
	.entry-item.selected .entry-item__content:before {
		content: " ";
		position: absolute;
		left: -0.5em;
		top: 0;
		bottom: 0;
		width: 2px;
		background: tomato;
	}
</style>
