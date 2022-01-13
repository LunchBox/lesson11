import { ref, reactive, computed, watch } from "vue";
import propertyFilter from "../utils/property_filter.js";
import axios from "axios";

export default class {
  // local cache
  static get storage(){
    if (!this._storage){
      this._storage = reactive({});
    }

    return this._storage;
  }

	static get list() {
    return computed(() => Object.values(this.storage)); 
	}

	static async fetchAll() {
		try {
			const res = await axios.get(`/api/${this.modelKey}`);

      const jobs = res.data.map(id => this.fetch(id));
      await Promise.all(jobs);
		} catch (err) {
			// just do nothing.
		}
	}

  static _regModelData(id, data){
    const model = this.fromStorage(data);
    model.id = id; 

    this.storage[id] = model;
    return model;
  }

	static async fetch(id){
    const res = await axios.get(`/api/${this.modelKey}/${id}`);
    
    return this._regModelData(id, res.data);
	}

	static async create(model) {
		const data = JSON.stringify(model, propertyFilter);
		const res = await axios.post(`/api/${this.modelKey}`, data, {
			headers: { "Content-Type": "application/json" },
		});
		const { id } = res.data;

    return this._regModelData(id, model);
	}

	static async update(model, attrs) {
		const { id, ...rest } = model;
		const data = JSON.stringify(attrs, propertyFilter);
		const res = await axios.put(`/api/${this.modelKey}/${id}`, data, {
			headers: { "Content-Type": "application/json" },
		});

    return this._regModelData(id, res.data);
	}

	static async destroy(model) {
		const { id, ...rest } = model;
		const data = JSON.stringify(rest, propertyFilter);
		const res = await axios.delete(`/api/${this.modelKey}/${id}`);

    delete this.storage[id];
	}

	static fromStorage(values = {}) {
		return new this(values);
	}

	static get modelKey() {
		throw new Error("override this method to provide the model Key");
	}

	static get all() {
		return this.list;
	}

	static find(id) {
    return this.constructor.storage[id]
	}

	static findById(id) {
		return this.find(id);
	}

	static where(conds = {}) {
		let res = this.all.value;
		for (let key in conds) {
			res = res.filter((model) => model[key] === conds[key]);
		}

		return res;
	}

	constructor(attrs = {}) {
		const config = this.constructor.attributes;
		for (let key in config) {
			const val = attrs[key];
			this[key] = val === undefined ? config[key]?.default || null : val;
		}
	}

	async create() {
		this.beforeSave();
		this.beforeCreate();

		await this.constructor.create(this);

		this.afterCreate();
		this.afterSave();
	}

	async update(attrs = {}) {
		this.beforeSave();
		this.beforeUpdate();

		const { id, ...rest } = this;
		await this.constructor.update(this, { ...rest, ...attrs });

		this.afterUpdate();
		this.afterSave();
	}

	async destroy() {
		this.beforeDestroy();

		await this.constructor.destroy(this);

		this.afterDestroy();
	}

	// override these callbacks for further actions
	beforeCreate() {}
	afterCreate() {}

	beforeSave() {}
	afterSave() {}

	beforeUpdate() {}
	afterUpdate() {}

	beforeDestroy() {}
	afterDestroy() {}
}
