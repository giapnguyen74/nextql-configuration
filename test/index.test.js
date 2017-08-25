const NextQL = require("nextql");
const path = require("path");
const configuration = require("../src/index");

test("load json files", async function() {
	const nextql = new NextQL();
	nextql.use(configuration);
	await nextql.configure({
		modules: [
			{
				loader: "json",
				source: path.resolve(__dirname, "./fixtures/json/*.json")
			}
		]
	});

	expect(nextql.models).toMatchObject({
		model1: {
			name: "model1",
			$options: {
				fields: {
					a: 1
				},
				name: "model1"
			},
			fields: {
				a: 1
			},
			computed: {},
			methods: {},
			returns: {}
		},
		model2: {
			name: "model2",
			$options: {
				fields: {
					a: 1
				},
				name: "model2"
			},
			fields: {
				a: 1
			},
			computed: {},
			methods: {},
			returns: {}
		}
	});
});

test("load dependencies modules", async function() {
	const nextql = new NextQL();
	nextql.use(configuration);
	await nextql.configure({
		modules: [
			{
				source: {
					module1: {
						models: {
							model1: {
								fields: {
									a: "*"
								}
							}
						},
						dependencies: ["module2"]
					},
					module2: {
						models: {
							model1: {
								fields: {
									a: 1
								}
							}
						}
					}
				}
			}
		]
	});

	expect(nextql.models).toMatchObject({
		model1: {
			name: "model1",
			$options: {
				fields: {
					a: "*"
				},
				name: "model1"
			},
			fields: {
				a: "*"
			},
			computed: {},
			methods: {},
			returns: {}
		}
	});
});
