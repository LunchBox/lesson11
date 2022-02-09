import { createRouter, createWebHashHistory } from "vue-router";

import Dashboard from "@/components/Dashboard.vue";
import EntryShow from "@/views/entries/Show.vue";

const routes = [
	{ path: "/", component: Dashboard },
	{ path: "/entries", component: Dashboard },
	{
		path: "/entries/:id",
		component: EntryShow,
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
