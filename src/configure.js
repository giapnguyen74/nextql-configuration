const loaders = require("./loaders");
const merge = require("lodash.merge");

function object_loader(modules, options) {
	Object.assign(modules, options.source);
	return Promise.resolve();
}

/**
 * resolve order:
 * 1. resolveLoader.paths
 * 2. node_modules
 * 3. default loaders
 * @param {*} nextql 
 * @param {*} name 
 */
function resolve_loader(nextql, name) {
	const paths = nextql.$configuration.loaderPaths;

	let loader;
	for (var i = 0; i < paths.length; i++) {
		try {
			loader = require(paths[i] + "/" + name);
			break;
		} catch (e) {}
	}

	if (!loader) {
		try {
			loader = require(name);
		} catch (e) {
			loader = loaders[name];
		}
	}

	if (!loader) {
		throw new Error("Cannot find loader name " + name);
	}
	return loader;
}

function load_modules_from_source(nextql, options) {
	return new Promise(function(ok) {
		if (!options.loader) {
			return ok(object_loader(nextql.$configuration.modules, options));
		}
		const loader = resolve_loader(nextql, options.loader);

		return ok(loader(nextql.$configuration.modules, options));
	});
}

function consume_module(context, name) {
	const module = context.modules[name];
	if (module.loaded === 1) {
		throw new Error(`Recursive load module ${name}`);
	}

	if (module.loaded) return;
	module.loaded = 1;

	const models = module.models || {};
	const dependencies = module.dependencies || [];

	dependencies.forEach(m => {
		if (!context.modules[m]) {
			throw new Error(
				`Module ${module.name} depend on module ${m} which not found.`
			);
		}

		consume_module(context, m);
	});

	merge(context.models, models);

	module.loaded = true;
}

function consume_modules(modules) {
	const context = {
		models: {},
		modules: modules
	};

	Object.keys(modules).forEach(k => consume_module(context, k));

	return context.models;
}

function load_modules(nextql) {
	return Promise.all(
		nextql.$configuration.sources.map(options =>
			load_modules_from_source(nextql, options)
		)
	).then(() => {
		const models = consume_modules(nextql.$configuration.modules);

		Object.keys(models).forEach(k => nextql.model(k, models[k]));
	});
}

function configure(conf) {
	const nextql = this;

	const paths = (conf.resolveLoader && conf.resolveLoader.paths) || [];

	nextql.$configuration = {
		modules: {},
		sources: conf.modules || [],
		loaderPaths: paths
	};

	return load_modules(nextql);
}

function reload() {
	const nextql = this;
	nextql.$configuration.modules = {};
	nextql.models = {};
	return load_modules(nextql);
}

module.exports = {
	configure,
	load_modules,
	load_modules_from_source,
	resolve_loader,
	object_loader,
	consume_modules,
	reload
};
