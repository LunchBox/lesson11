import { reactive } from "vue"; 
import propertyFilter from "../utils/property_filter.js";
import axios from "axios";

export default class {
	static get modelKey() {
		throw new Error("override this method to provide the model Key");
	}

  static attributes = {}; 

  static attrsAccssor = [];

  // local cache
  static get storage(){
    if (!this._storage){
      this._storage = reactive({}); 
    }

    return this._storage;
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

  static _regModelData(id, model){
    model.id = id; 

    this.storage[id] = model;
    return model;
  }

	static async fetch(id){
    const res = await axios.get(`/api/${this.modelKey}/${id}`);
    
    return this._regModelData(id, this.build(res.data));
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

    return this._regModelData(id, this.build(res.data));
	}

	static async destroy(model) {
		const { id, ...rest } = model;
		const data = JSON.stringify(rest, propertyFilter);
		const res = await axios.delete(`/api/${this.modelKey}/${id}`);

    delete this.storage[id];
	}


	static build(values = {}) {
		return new this(values);
	}


	static get all() {
    return Object.values(this.storage);
	}

	static find(id) {
    return this.storage[id];
	}

	static where(conds = {}) {
    let res = this.all;

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

    this.constructor.attrsAccssor.forEach((key) => {
      this[key] = attrs[key] || null;
    });
	}

	async create() {
    await this.beforeSave();
		await this.beforeCreate();

		await this.constructor.create(this);
    console.log("-- before after create", this);

		await this.afterCreate();
		await this.afterSave();
	}

	async update(attrs = {}) {
		await this.beforeSave();
		await this.beforeUpdate();

		const { id, ...rest } = this;
		await this.constructor.update(this, { ...rest, ...attrs });

		await this.afterUpdate();
		await this.afterSave();
	}

  async save(){
    console.log(this.id);
    if ( this.id ) {
      await this.update();
    } else {
      await this.create();
    }
  }

	async destroy() {
		await this.beforeDestroy();

		await this.constructor.destroy(this);

		await this.afterDestroy();
	}

	// override these callbacks for further actions
	async beforeCreate() { return true }
	async afterCreate() { return true }

	async beforeSave() { return true }
	async afterSave() { return true }

	async beforeUpdate() { return true }
	async afterUpdate() { return true }

	async beforeDestroy() { return true }
	async afterDestroy() { return true }
}
