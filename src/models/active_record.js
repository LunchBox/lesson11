import { reactive } from "vue";
import propertyFilter from "../utils/property_filter.js";
import axios from "axios";
import _ from "lodash";

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

	static async fetchAll() {
		try {
			const res = await axios.get(
				`/api/${this.modelKey}${this.defaultExt}`,
			);

			const jobs = res.data.map((id) => this.fetch(id));
			await Promise.all(jobs);
		} catch (err) {
			// just do nothing.
		}
	}

	static _regModelData(id, model) {
		model.id = id;

		this.storage[id] = model;
		return model;
	}

	static async fetch(id) {
		const res = await axios.get(
			`/api/${this.modelKey}/${id}${this.defaultExt}`,
		);

		return this._regModelData(id, this.build(res.data));
	}

	static async create(model) {
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
		const data = JSON.stringify(attrs, propertyFilter);
		const res = await axios.put(
			`/api/${this.modelKey}/${id}${this.defaultExt}`,
			data,
			{
				headers: { "Content-Type": "text/plain" },
			},
		);

		return this._regModelData(id, this.build(res.data));
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

		const { id, ...rest } = this;
		await this.constructor.update(this, { ...rest, ...attrs });

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
		config = { className: null, foreignKey: null, dependency: "nullify" },
	) {
		if (!config.className || !config.foreignKey) {
			throw new Error("className is required");
		}

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
				// console.log(callbackType, this);

				const association = await config.className.fetch(
					this[config.foreignKey],
				);

				if (config[callbackType]) {
					await config[callbackType].bind(this)(association);
				}
			});
		});
	}

	static hasOne(associationName, config = { allowItemTypes: {} }) {
		const cName = _.capitalize(associationName);
		const typeName = `${associationName}Type`;
		const idName = `${associationName}Id`;

		const ITEM_TYPES = config.allowItemTypes;

		Object.defineProperty(this.prototype, associationName, {
			get: function () {
				if (!this[idName]) {
					return null;
				}

				return ITEM_TYPES[this[typeName]].find(this[idName]);
			},
			set: function (obj) {
				this[typeName] = obj.constructor.name;
				this[idName] = obj.id;
			},
		});

		this.prototype[`fetch${cName}`] = async function () {
			return await ITEM_TYPES[this[typeName]].fetch(this[idName]);
		};

		CALLBACKS.forEach((callbackType) => {
			this.regCallback(callbackType, async function () {
				// console.log(callbackType, this);

				const association = await config.allowItemTypes[
					this[typeName]
				].fetch(this[idName]);

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
