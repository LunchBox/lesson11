<script setup>
</script>

<template>
	<router-view></router-view>
	<footer></footer>
</template>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;

		max-width: 640px;
		max-width: 56rem;
		margin: 0 auto;

		font-size: 16px;
		line-height: 1.5;

		--p-margin: 0.7rem;
		--color: #2c3e50;

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
