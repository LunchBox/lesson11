<template>
	<p v-if="entry">
		<router-link :to="`/entries/${entry.id}`">
			{{ entry.title }}
		</router-link>
	</p>
</template>

<script setup>
	import { computed } from "vue";

	import Entry from "@/models/entry.js";

	const props = defineProps({
		item: Entry,
	});

	const entry = computed(() => props.item);
</script>