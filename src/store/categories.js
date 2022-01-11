import { ref } from "vue";
import Category from "@/models/category.js";
import axios from "axios";

const list = ref([]);

// function fetch(id) {
// 	return axios.get(`/api/categories/${id}`).then((cateRes) => {
// 		console.log(cateRes);

// 		const category = new Category(cateRes.data);
// 		category.id = id;

// 		list.value.push(category);

// 		return category;
// 	});
// }

async function fetch(id) {
	const cateRes = await axios.get(`/api/categories/${id}`);

	console.log(cateRes);

	const category = new Category(cateRes.data);
	category.id = id;

	return category;
}

async function fetchAll() {
	const res = await axios.get("/api/categories");
	console.log(res);

	// res.data.forEach(async (id) => {
	// 	const category = await fetch(id);
	// 	list.value.push(category);
	// });

	const jobs = res.data.map((id) => {
		return fetch(id);
	});

	list.value = await Promise.all(jobs);
}

function save(formData) {
	const category = new Category(formData);

	axios.post("/api/categories", category).then((res) => {
		category.id = res.data.id;
		list.value.push(category);
	});
}

export { list, fetch, fetchAll, save };
