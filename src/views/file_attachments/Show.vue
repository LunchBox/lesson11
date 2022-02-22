<template>
	<div v-if="fa" class="fa">
		<a :href="fa.filePath">{{ fa.filename }}</a>
		<div class="rel-path" @click="copyToClipboard">
			{{ fa.path }}
		</div>
    <div v-if="fa.contentType.startsWith('image')" class="thumb">
      <img :src="fa.filePath" :alt="fa.filename" @click="toggleImg" />
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

  function toggleImg(e) {
    const img = e.target;
    if (img.classList.contains("active")){
      img.classList.remove("active");
    } else {
      img.classList.add("active");
    }
  }
</script>

<style scoped>
	.fa {
		margin: var(--p-margin) 0;
		position: relative;
	}

  .thumb img{
    max-width: 100%;
    max-height: 120px;
    image-orientation: from-image;
    cursor: pointer;
    object-fit: cover;
    border: 2px solid #ccc;
    border-radius: 2px;
  }

  .thumb img.active {
    max-height: none;
  }

  
</style>
