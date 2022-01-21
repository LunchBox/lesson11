<template>
	<template v-for="(entryItem, idx) in list" :key="entryItem?.id">
		<ListItem
			class="entry-item"
      v-if="isEntryItem(entryItem)"
			:entry="entry"
			:entryItem="entryItem"
			:class="{ selected: selected(entryItem) }"
      :showInfo="showInfo"
      :isSelected="selected(entryItem)"
			@click="select(entryItem)"
		/>
		<EntryItemForm
			v-if="realFormIdx === idx"
			:entry="entry"
			:formIdx="realFormIdx"
      :key="realFormIdx"
			@after-create="afterCreate"
		/>
	</template>
	<EntryItemForm
		v-if="list.length === 0"
		:entry="entry"
		:formIdx="realFormIdx"
    :key="-1"
		@after-create="afterCreate"
	/>
</template>

<script setup>
	import { ref, computed, watch } from "vue";
	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";

	import EntryItemForm from "./Form.vue";
	import ListItem from "./ListItem.vue";

	const props = defineProps({
    showInfo: Boolean,
		entry: Entry,
	});

	props.entry.entryItemIds.forEach((id) => EntryItem.fetch(id));

	const list = computed(() => props.entry.entryItems);


	const selection = ref([]);

	function select(entryItem) {
		selection.value.splice(0);

		if (!selection.value.includes(entryItem)) {
			selection.value.push(entryItem);
		}
	}

	function selected(entryItem) {
		return selection.value.includes(entryItem);
	}


  function isEntryItem(entryItem){
    return entryItem instanceof EntryItem;
  }

	const formIdx = ref(null);
	const realFormIdx = computed(() => {
		if (formIdx.value !== null) {
			return formIdx.value;
		}

		return list.value.length - 1;
	});

	function setFormUnder(entryItem) {
		formIdx.value = list.value.indexOf(entryItem);
	}

	function isInput(elem) {
		const blackList = ["INPUT", "TEXTAREA", "SELECT"];
		if (blackList.includes(elem.tagName)) {
			return true;
		}

		if (elem.classList && elem.classList.contains("is-input")) {
			return true;
		}

		if (elem.parentNode) {
			return isInput(elem.parentNode);
		}

		return false;
	}

	document.addEventListener("keydown", (e) => {
		if (e.code === "Enter" && !e.ctrlKey && !isInput(e.target)) {
			if (selection.value.length !== 1) {
				return;
			}

			setFormUnder(selection.value[0]);
			selection.value.splice(0);
		}

		if (e.code === "KeyJ" && e.ctrlKey) {
			if (realFormIdx.value < list.value.length - 1) {
				formIdx.value = realFormIdx.value + 1;
			}
		}

		if (e.code === "KeyK" && e.ctrlKey) {
			if (realFormIdx.value > 0) {
				formIdx.value = realFormIdx.value - 1;
			}
		}
	});

	function afterCreate() {
		console.log("here", realFormIdx.value);
    if ( formIdx.value){
      formIdx.value += 1;
    } else {
      formIdx.value = realFormIdx.value;
    }
	}
</script>

<style scoped>
	.entry-item {
		padding: 0 0.5em;
		margin: 0 -0.5em;
		margin-left: calc(-0.5em - 4px);

		border-left: 4px solid transparent;
	}
	.selected {
		border-left-color: tomato;
	}
</style>
