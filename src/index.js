const { configure, reload } = require("./configure");
module.exports = {
	install(nextql) {
		nextql.$configuration = {
			modules: {}
		};
		nextql.configure = configure.bind(nextql);
		nextql.reload = reload.bind(nextql);
	}
};
