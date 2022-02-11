<script setup>
	import { computed } from "vue";
	import Config from "@/models/config";
	Config.preload();

	const root = computed(() => Config.global && Config.global.root);
</script>

<template>
	<header>
		<router-link to="/entries">Entries</router-link>
		<template v-if="root">
			&middot;
			<router-link :to="`/entries/${root.id}`">
				{{ root.title }}
			</router-link>
		</template>
	</header>
	<main>
		<router-view></router-view>
	</main>
	<footer></footer>
</template>

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
</style>
