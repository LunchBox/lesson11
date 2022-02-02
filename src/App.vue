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

		font-size: 15px;
	}

	textarea {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;

		font-size: 15px;

		line-height: 1.6;
		-webkit-text-size-adjust: 100%;
		-webkit-tap-highlight-color: transparent;
	}

	footer {
		height: 10em;
	}
</style>
