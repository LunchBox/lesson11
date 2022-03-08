import { reactive } from "vue";
import propertyFilter from "../utils/property_filter.js";
import axios from "axios";
// import _ from "lodash";
import path from "path";

import "./active_support.js";

const CALLBACKS = [
	"beforeCreate",
	"afterCreate",

	"beforeSave",
	"afterSave",

	"beforeUpdate",
	"afterUpdate",

	"beforeDestroy",
	"afterDestroy",
];

export default class ActiveRecord {
	static get modelKey() {
		throw new Error("override this method to provide the model Key");
	}

	static attributes = {};

	static attrsAccssor = [];

	static defaultExtension = ".json";

	static get defaultExt() {
		return this.defaultExtension;
	}

	// local cache
	static get storage() {
		if (!this._storage) {
			this._storage = reactive({});
		}

		return this._storage;
	}

	static async fetchAll(ext = ".json") {
		try {
			const res = await axios.get(`/api/${this.modelKey}${ext}`);

			const files = res.data;
			files.sort((a, b) => {
				return new Date(a.birthtime).getTime() >
					new Date(b.birthtime).getTime()
					? -1
					: 1;
			});

			// console.log(files);

			const jobs = files.map((file) => {
				const id = file.filename.split(ext)[0];
				return this.fetch(id);
			});
			await Promise.all(jobs);
		} catch (err) {
			// just do nothing.
			console.log(err);
		}
	}

	static _regModelData(id, model) {
		model.id = id;

		this.storage[id] = model;
		return model;
	}

	static async fetch(id, ext = ".json") {
		try {
			const res = await axios.get(`/api/${this.modelKey}/${id}${ext}`);

			if (this.storage[id]) {
				const model = this.storage[id];
				return this._regModelData(id, model.mergeUpdate(res.data));
			} else {
				return this._regModelData(id, this.build(res.data));
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

  async reload(){
    await this.constructor.fetch(this.id);
  }

	static async create(model) {
    model.createdAt = new Date();
    model.updatedAt = model.createdAt;

		const data = JSON.stringify(model, propertyFilter);
		const res = await axios.post(
			`/api/${this.modelKey}${this.defaultExt}`,
			data,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);
		const { id } = res.data;

		return this._regModelData(id, model);
	}

	static async update(model, attrs) {
		const { id, ...rest } = model;
    const updated_attrs = { ...rest, ...attrs, updatedAt: new Date() };

		const data = JSON.stringify(updated_attrs, propertyFilter);
		const res = await axios.put(
			`/api/${this.modelKey}/${id}${this.defaultExt}`,
			data,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);

		return this._regModelData(id, model.mergeUpdate(res.data));
	}

	static async destroy(id) {
		await axios.delete(`/api/${this.modelKey}/${id}${this.defaultExt}`);
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

    ["createdAt", "updatedAt"].forEach((key) => {
      if (attrs[key]) {
        if (typeof attrs[key] === "string"){
          this[key] = new Date(attrs[key]);
        } else if (attrs[key] instanceof Date) {
          this[key] = attrs[key];
        } 
      }
    });
	}

  get mark() {
    return `${this.constructor.name}::${this.id}`;
  }

	mergeUpdate(attrs = {}) {
		const config = this.constructor.attributes;
		for (let key in config) {
			const val = attrs[key];
			this[key] = val === undefined ? config[key]?.default || null : val;
		}

		this.constructor.attrsAccssor.forEach((key) => {
			this[key] = null;
		});

		return this;
	}

	async create() {
		await this.beforeSave();
		await this.beforeCreate();

		await this.constructor.create(this);

		await this.afterCreate();
		await this.afterSave();
	}

	async update(attrs = {}) {
		await this.beforeSave();
		await this.beforeUpdate();

    await this.constructor.update(this, attrs);

		await this.afterUpdate();
		await this.afterSave();
	}

	async save() {
		if (this.id) {
			await this.update();
		} else {
			await this.create();
		}
	}

	async destroy() {
		await this.beforeDestroy();

		await this.constructor.destroy(this.id);

		await this.afterDestroy();
	}

	static async actCallback(callbackType, model) {
		const cName = `_${callbackType}`;

		if (!this[cName]) {
			return null;
		}

		const jobs = this[cName].map((cb) => cb.bind(model)(model));
		await Promise.all(jobs);
	}

	// cb must be async
	static regCallback(callbackType, func) {
		const cName = `_${callbackType}`;
		if (!this[cName]) {
			this[cName] = [];
		}
		this[cName].push(func);
	}

	// associations
	static hasMany(
		associationName,
		config = {
			className: null,
			foreignKey: null,
			collectionKey: null,
			dependency: "nullify",
		},
	) {
		if (
			!config.className ||
			(!config.foreignKey && !config.collectionKey)
		) {
			throw new Error(
				"className and foreignKey(or collectionKey) is required",
			);
		}

    const cName = associationName.capitalize();
		const fetchMethod = `fetch${cName}`;

		Object.defineProperty(this.prototype, associationName, {
			get: function () {
				if (config.collectionKey) {
					return this[config.collectionKey].map((id) =>
						config.className.find(id),
					);
				}

				return config.className.where({
					[this[config.foreignKey]]: this.id,
				});
			},
		});

		// only collectionKey way can fetch entries,
		// foreignKey way has to load all associations or the server provide API to filter items
		if (config.collectionKey) {
			this.prototype[fetchMethod] = async function () {
				const jobs = this[config.collectionKey].map((id) =>
					config.className.fetch(id),
				);
				return Promise.all(jobs);
			};
		}

		CALLBACKS.forEach((callbackType) => {
			this.regCallback(callbackType, async function () {
				// console.log(callbackType, this);

				if (config[callbackType]) {
					await config[callbackType].bind(this)(
						this[associationName],
					);
				}
			});
		});
	}

	static belongsTo(
		associationName,
		config = { className: null, foreignKey: null },
	) {
		if (!config.className || !config.foreignKey) {
			throw new Error("className is required");
		}

		Object.defineProperty(this.prototype, associationName, {
			get: function () {
				if (!this[config.foreignKey]) {
					return null;
				}
				return config.className.find(this[config.foreignKey]);
			},
			set: function (obj) {
				this[config.foreignKey] = obj.id;
			},
		});

		CALLBACKS.forEach((callbackType) => {
			this.regCallback(callbackType, async function () {
				const association = await config.className.fetch(
					this[config.foreignKey],
				);

				if (config[callbackType]) {
					await config[callbackType].bind(this)(association);
				}
			});
		});
	}

	static hasOne(
		associationName,
		config = {
			className: null,
			foreignKey: null,
			polymorphic: false,
			allowItemTypes: {}, // required when polymorphic is True
		},
	) {
		// entry => Entry
		// config => Config
		// item => Item
    const cName = associationName.capitalize();
		const fetchMethod = `fetch${cName}`;

		// 多態
		if (config.polymorphic) {
			const itemType = `${associationName}Type`;
			const itemId = `${associationName}Id`;

			const allowTypes = config.allowItemTypes;

			Object.defineProperty(this.prototype, associationName, {
				get: function () {
					if (!this[itemId]) {
						return null;
					}

					return allowTypes[this[itemType]].find(this[itemId]);
				},
				set: function (obj) {
					this[itemType] = obj.constructor.name;
					this[itemId] = obj.id;
				},
			});

			this.prototype[fetchMethod] = async function () {
				return await allowTypes[this[itemType]].fetch(this[itemId]);
			};
		} else {
			let foreignKey = config.foreignKey;
			if (!foreignKey) {
				foreignKey = `${associationName}Id`;
			}

			let className = config.className;
			if (!className) {
				throw new Error("className is required.");
			}

			Object.defineProperty(this.prototype, associationName, {
				get: function () {
					if (!this[foreignKey]) {
						return null;
					}

					return className.find(this[foreignKey]);
				},
				set: function (obj) {
					this[foreignKey] = obj.id;
				},
			});

			this.prototype[fetchMethod] = async function () {
				if (!this[foreignKey]) {
					return null;
				}
				return await className.fetch(this[foreignKey]);
			};
		}

		CALLBACKS.forEach((callbackType) => {
			this.regCallback(callbackType, async function (item) {
				const association = await item[fetchMethod]();

				if (config[callbackType]) {
					await config[callbackType].bind(this)(association);
				}
			});
		});
	}
}

CALLBACKS.forEach((callbackType) => {
	ActiveRecord.prototype[callbackType] = async function () {
		await this.constructor.actCallback(callbackType, this);
	};
});
