import { createRouter, createWebHashHistory } from "vue-router";

import Dashboard from "@/components/Dashboard.vue";
import CategoryShow from "@/views/categories/Show.vue";

const routes = [
	{ path: "/", component: Dashboard },
	{ path: "/categories/:id", component: CategoryShow },
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
