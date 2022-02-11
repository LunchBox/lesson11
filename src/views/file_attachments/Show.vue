<template>
	<div v-if="fa" class="fa">
		<a :href="fa.filePath">{{ fa.filename }}</a>
	</div>
</template>

<script setup>
	import { computed } from "vue";
	import FileAttachment from "@/models/file_attachment.js";

	const props = defineProps({
		item: FileAttachment,
	});

	const fa = computed(() => props.item);
</script>

<style scoped>
	.fa {
		margin: var(--p-margin) 0;
	}
</style>
