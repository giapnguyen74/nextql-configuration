const NextQL = require("nextql");
const path = require("path");
const { configure, reload, consume_modules } = require("../src/configure");
test("configure#simple source", async function() {
	const nextql = new NextQL();

	const modules = {
		a: {},
		b: {},
		c: {}
	};
	await configure.bind(nextql)({
		modules: [{ source: modules }]
	});

	expect(nextql.$configuration.modules).toMatchObject(modules);
});

test("configure#multi sources", async function() {
	const nextql = new NextQL();

	const source1 = {
		a: {},
		b: {},
		c: {}
	};

	const source2 = {
		a: {},
		e: {},
		f: {}
	};
	await configure.bind(nextql)({
		modules: [{ source: source1 }, { source: source2 }]
	});

	expect(nextql.$configuration.modules).toMatchObject({
		a: {},
		b: {},
		c: {},
		e: {},
		f: {}
	});
});

test("configure#custom loader", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		resolveLoader: {
			paths: [
				path.resolve(__dirname, "./fixtures/loaders"),
				path.resolve(__dirname, "./fixtures/xloaders")
			]
		},
		modules: [{ loader: "a-loader" }, { loader: "b-loader" }]
	});
});

test("configure#custom loader fallback", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		modules: [{ loader: "isarray" }, { loader: "file" }]
	});
});

test("configure#throw error no loader found", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		modules: [{ loader: "a" }]
	}).catch(err => expect(err.message).toBe("Cannot find loader name a"));
});

test("configure#file-loader glob", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		modules: [
			{
				source: path.resolve(__dirname, "./fixtures/modules/*.js"),
				loader: "file"
			}
		]
	});

	expect(nextql.$configuration.modules).toMatchObject({
		a: { name: "a" },
		b: { name: "b" }
	});
});

test("configure#file-loader name", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		modules: [
			{
				source: path.resolve(__dirname, "./fixtures/modules/a.js"),
				loader: "file"
			}
		]
	});

	expect(nextql.$configuration.modules).toMatchObject({
		a: { name: "a" }
	});
});

test("configure#reload", async function() {
	const nextql = new NextQL();
	await configure.bind(nextql)({
		modules: [
			{
				source: path.resolve(__dirname, "./fixtures/json/*.json"),
				loader: "json"
			}
		]
	});

	nextql.$configuration.modules = {}; // clear modules
	await reload.bind(nextql)();

	expect(nextql.$configuration.modules).toMatchObject({
		a: { name: "a" },
		b: { name: "b" }
	});
});

test("consume_modules#simple modules", function() {
	const models = consume_modules({
		a: {
			name: "a",
			models: {
				model1: {
					fields: {
						a: 1
					}
				},
				model2: {
					fields: {
						a: 1
					}
				}
			}
		},
		b: {
			name: "b",
			models: {
				model1: {
					fields: {
						x: 1
					}
				},
				model2: {
					fields: {
						y: 1
					}
				}
			}
		}
	});

	expect(models).toMatchObject({
		model1: {
			fields: {
				a: 1,
				x: 1
			}
		},
		model2: {
			fields: {
				a: 1,
				y: 1
			}
		}
	});
});

test("consume_modules#dependencies modules", function() {
	const models = consume_modules({
		m: {
			name: "m",
			models: {
				model1: {
					fields: {
						a: "*"
					}
				}
			},
			dependencies: ["n"]
		},
		n: {
			name: "n",
			models: {
				model1: {
					fields: {
						a: 1
					}
				},
				model2: {
					fields: {
						a: 1
					}
				}
			}
		}
	});

	expect(models).toMatchObject({
		model1: {
			fields: {
				a: "*"
			}
		},
		model2: {
			fields: {
				a: 1
			}
		}
	});
});

test("consume_modules#missing dependencies modules", function() {
	expect(() =>
		consume_modules({
			m: {
				name: "m",
				models: {
					model1: {
						fields: {
							a: "*"
						}
					}
				},
				dependencies: ["x"]
			},
			n: {
				name: "n",
				models: {
					model1: {
						fields: {
							a: 1
						}
					},
					model2: {
						fields: {
							a: 1
						}
					}
				}
			}
		})
	).toThrowError("Module m depend on module x which not found");
});

test("consume_modules#recusive dependencies modules", function() {
	expect(() =>
		consume_modules({
			m: {
				name: "m",
				dependencies: ["l"]
			},
			l: {
				name: "l",
				dependencies: ["n"]
			},
			n: {
				name: "n",
				dependencies: ["m"]
			}
		})
	).toThrowError("Recursive load module m");
});

test("consume_modules#self recusive dependencies modules", function() {
	expect(() =>
		consume_modules({
			m: {
				name: "m",
				dependencies: ["m"]
			},
			l: {
				name: "l",
				dependencies: ["n"]
			},
			n: {
				name: "n",
				dependencies: ["m"]
			}
		})
	).toThrowError("Recursive load module m");
});
