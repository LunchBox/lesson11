import { createApp } from "vue";
import App from "./App.vue";

import router from "./router.js";

import "@/models/associations.js";

import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
hljs.registerLanguage("javascript", javascript);
import "highlight.js/styles/github.css";

const app = createApp(App);

app.use(router);

app.directive("highlight", {
	beforeMount(el, bidning, vnode) {
		const blocks = el.querySelectorAll("pre code");
		blocks.forEach((block) => {
			hljs.highlightElement(block);
		});
	},
});

app.mount("#app");
