<template>
	<div v-if="fa" class="fa">
		<a :href="fa.filePath">{{ fa.filename }}</a>
		<div class="rel-path" @click="copyToClipboard">
			{{ fa.path }}
		</div>
	</div>
</template>

<script setup>
	import { computed } from "vue";
	import FileAttachment from "@/models/file_attachment.js";
	import copyToClipboard from "@/utils/copy_to_clipboard.js";

	const props = defineProps({
		item: FileAttachment,
		isSelected: Boolean,
	});

	const fa = computed(() => props.item);
</script>

<style scoped>
	.fa {
		margin: var(--p-margin) 0;
		position: relative;
	}
</style>
