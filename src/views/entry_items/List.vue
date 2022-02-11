<template>
	<template v-for="(entryItem, idx) in list" :key="entryItem?.id">
		<ListItem
			v-if="isEntryItem(entryItem)"
			:entry="entry"
			:entryItem="entryItem"
			:class="{ selected: selected(entryItem) }"
			:isSelected="selected(entryItem)"
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

	function select(entryItem, event) {
		const selected = selection.value;
		if (event.ctrlKey || event.metaKey || event.altKey) {
			const idx = selected.indexOf(entryItem);
			if (idx > -1) {
				selected.splice(idx, 1);
			} else {
				selected.push(entryItem);
			}
		} else {
			selected.splice(0);
			if (!selected.includes(entryItem)) {
				selected.push(entryItem);
			}
		}

		const tmp = list.value.filter((ei) => selected.includes(ei));
		selection.value = tmp;

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

		selection.value.splice(0);

		const pos = entry.entryItemIds.indexOf(entryItem.id);

		const item = await entryItem.fetchItem();

		entry.entryItemIds.splice(pos, 0, ...item.entryItemIds);
		await entry.update();

		const jobs = item.entryItemIds.map((id) => EntryItem.fetch(id));
		const entryItems = await Promise.all(jobs);

		const jobs2 = entryItems.map((ei) => ei.update({ entryId: entry.id }));
		await Promise.all(jobs2);

		await deleteEntryItem(entryItem);
		await item.destroy();

		selection.value.push(...entryItems);
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

	const keydownHandler = (e) => {
		if (isInput(e.target)) {
			return;
		}

		if (e.code === "Enter" && !e.ctrlKey) {
			if (selection.value.length !== 1) {
				return;
			}

			e.preventDefault();
			setFormUnder(selection.value[0]);
			selection.value.splice(0);
		}

		if (e.code === "Escape") {
			selection.value.splice(0);
		}

		if (e.code === "Tab" && selection.value.length > 0) {
			if (window.confirm("Are you sure to split these items?")) {
				e.preventDefault();
				splitSelection();
			}
		}
	};

	document.addEventListener("keydown", keydownHandler);
	onBeforeUnmount(() => {
		document.removeEventListener("keydown", keydownHandler);
	});

	function selected(entryItem) {
		return selection.value.includes(entryItem);
	}

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
		margin-left: calc(-2.5em - 4px);
		display: flex;
	}

	.entry-item__menus {
		width: 2em;
		height: 100%;

		position: relative;
	}

	.entry-item__menus .icon {
		display: block;
		width: 1rem;
		height: 1rem;
		border: 1px solid #ccc;
		border-radius: 2px;
		margin: var(--p-margin) 0;
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

		border-left: 4px solid transparent;
		padding-left: 0.5em;
	}
	.entry-item.selected .entry-item__content {
		border-left-color: tomato;
	}
</style>
