const glob = require("glob");

module.exports = {
	file: function(modules, options) {
		const pattern = options.source || "";
		return new Promise(function(ok, fail) {
			glob(pattern, function(err, files) {
				if (err) {
					return fail(err);
				}
				files.forEach(file => {
					const module = require(file);
					if (module.name) {
						modules[module.name] = module;
					}
				});
				ok();
			});
		});
	},
	json: function(modules, options) {
		const pattern = options.source || "";
		return new Promise(function(ok, fail) {
			glob(pattern, function(err, files) {
				if (err) {
					return fail(err);
				}
				files.forEach(file => {
					var json = JSON.parse(
						require("fs").readFileSync(file, "utf8")
					);

					if (json.name) {
						modules[json.name] = json;
					}
				});
				ok();
			});
		});
	}
};
