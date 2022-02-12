<script setup>
	import { ref, computed } from "vue";
	import Config from "@/models/config";

	const loading = ref(true);
	Config.preload().then(() => {
		loading.value = false;
	});

	const entries = computed(() => (Config.global && Config.global.entries) || []);

	async function remove(entry) {
		const g = Config.global;
		const idx = g.entryIds.indexOf(entry.id);
		if (idx > -1) {
			g.entryIds.splice(idx, 1);
		}
		await g.update();
	}
</script>

<template>
	<header>
		<router-link to="/entries">Entries</router-link>
		&middot;

		<ul class="tabs" v-if="!loading">
			<li v-for="entry in entries" :key="entry.id">
				<router-link :key="entry.id" :to="`/entries/${entry.id}`">
					{{ entry.title }}
				</router-link>
				<a href="" class="del" @click.prevent="remove(entry)">x</a>
			</li>
		</ul>
	</header>
	<main>
		<router-view></router-view>
	</main>
	<footer></footer>
</template>

<style scoped>
	.tabs {
		margin: 0;
		padding: 0;
		list-style: none;
		display: inline-flex;
	}
	.tabs li {
		margin: 0 4px;
	}
	.tabs li a {
		text-decoration: none;
		margin-right: 6px;
	}
</style>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;

		font-size: 16px;
		line-height: 1.5;

		--p-margin: 0.7rem;
		--color: #2c3e50;

		color: var(--color);
	}

	main {
		max-width: 640px;
		max-width: 56rem;
		margin: 0 auto;
	}

	a {
		color: var(--color);
	}

	textarea {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: var(--color);

		font-size: 16px;
		line-height: 1.5;

		-webkit-text-size-adjust: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	footer {
		height: 10em;
	}

	::placeholder {
		/* Chrome, Firefox, Opera, Safari 10.1+ */
		color: #ccc;
		opacity: 1; /* Firefox */
	}

	.rel-path {
		font-style: italic;
		font-size: smaller;
	}
</style>
