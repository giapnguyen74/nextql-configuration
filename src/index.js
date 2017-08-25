const { configure } = require("./configure");
module.exports = {
	install(nextql) {
		nextql.$configuration = {
			modules: {}
		};
		nextql.configure = configure.bind(nextql);
	}
};
