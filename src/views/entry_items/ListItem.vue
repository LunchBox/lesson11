<template>
  <div v-if="entryItem" class="entry-item list-item" :class="{vc: entryItem?.item?.role, exp: entryItem?.exp }">
		<div class="entry-item__menus">
			<span class="icon" @click.stop="showMenus = true"></span>
			<div
				v-if="showMenus"
				class="menus"
				@click.stop="showMenus = false"
			>
				<ul>
					<li v-if="entryItem.item">
						<a @click.prevent="copyToClipboard">
							{{ entryItem.item.mark }}
						</a>
					</li>
					<li>
						<a @click="edit">Edit</a>
					</li>
					<li v-if="entryItem.itemType === 'Entry'">
						<a @click="toggle">Toggle</a>
					</li>
					<li v-if="entryItem.itemType === 'Memo'">
            <div class="inline-btn-group">
              <a @click="toRole()">N</a>
              <a v-for="role in Memo.ROLES" :key="role" @click="toRole(role)">{{ role }}</a>
            </div>
					</li>
					<li>
						<a @click="merge">Merge</a>
					</li>
					<li>
						<a @click="convToTitle">Convert To Title</a>
					</li>
					<li>
						<a @click="detach">Detach (UnLink)</a>
					</li>
					<li v-if="entryItem.item">
						<a @click="delItem">Delete Item</a>
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
	import { ref, computed, watch, onBeforeUnmount } from "vue";

	import Entry from "@/models/entry.js";
	import EntryItem from "@/models/entry_item.js";
	import Memo from "@/models/memo.js";

	import EntryItemForm from "./Form.vue";

	import MemoListItem from "../memos/Show.vue";
	import PenListItem from "../pens/Show.vue";
	import FaListItem from "../file_attachments/Show.vue";
	import EntryListItem from "../entries/ListItem.vue";

	import copyToClipboard from "@/utils/copy_to_clipboard.js";

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

  const hideMenus = (e) => {
    // e.preventDefault();
    showMenus.value = false;
  }

  document.addEventListener("click", hideMenus);
  onBeforeUnmount(() => {
    document.removeEventListener("click", hideMenus);
  })


	const showMenus = ref(false);

	function merge() {
		const { entryItem } = props;
		if (entryItem.itemType !== "Entry") {
			return;
		}

		emit("merge", entryItem);
	}

	function detach() {
		const { entryItem } = props;
		emit("delete", entryItem);
	}

	async function delItem(force = false) {
		if (force || confirm("Are you sure?")) {
			const { entryItem } = props;
			const item = await entryItem.fetchItem();
			if (item) {
				await item.destroy();
				emit("delete", entryItem);
			}
		}
	}

	async function convToTitle() {
		const { entry, entryItem } = props;
		if (entryItem.itemType === "Memo" && confirm("Are you sure?")) {
			const memo = await entryItem.fetchItem();
			if (memo.content && memo.content.trim() !== "") {
				await entry.update({ title: memo.content.trim() });
				await delItem(true);
			}
		}
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

  async function toRole(role = null){
    const { entryItem } = props;
    if (entryItem.itemType === "Memo") {
      const item = await entryItem.fetchItem();
      if (item) {
        item.role = role;
        await item.save();
        afterSubmit();
      }
    }
  }

  async function toggle(){
    const { entryItem } = props;
    if (entryItem.itemType === "Entry") {
      entryItem.exp = !entryItem.exp;
      await enryItem.save();
      afterSubmit();
    }
  }

</script>

<style scoped>
  .inline-btn-group {
    display: flex !important;
    margin: 4px 0;
  }

  .inline-btn-group a {
    border: 1px solid #eee;
    border-radius: 1px;
    height: 24px;
    width: 24px;
    padding: 0;
    display: flex;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 2px;
    text-transform: uppercase;
    cursor: pointer;
  }
</style>
