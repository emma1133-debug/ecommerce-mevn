const express = require("express");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
	init: function (app) {
		const router = express.Router();

		// ✅ ADD NEW PRODUCT WITH CATEGORY
		router.post("/add", async function (req, res) {
			const { name, description, price, itemsInStock, category } = req.fields;
			const images = [];

			if (req.files && req.files.images) {
				let uploaded = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
				for (let img of uploaded) {
					const filename = new Date().getTime() + "_" + img.name;
					await global.moveFile(img, filename);
					images.push(filename);
				}
			}

			await global.db.collection("products").insertOne({
				name,
				description,
				price: parseFloat(price),
				itemsInStock: parseInt(itemsInStock),
				category: category || "Uncategorized",
				images,
				createdAt: new Date().getTime()
			});

			res.json({
				status: "success",
				message: "Product has been added successfully."
			});
		});

		// ✅ FETCH SINGLE PRODUCT
		router.post("/fetchSingle", async function (req, res) {
			const _id = req.fields._id;

			const product = await global.db.collection("products").findOne({
				_id: ObjectId(_id)
			});

			if (product == null) {
				res.json({
					status: "error",
					message: "Product not found."
				});
				return;
			}

			res.json({
				status: "success",
				message: "Data has been fetched.",
				product: product
			});
		});

		// ✅ FETCH PRODUCTS WITH PAGINATION + SEARCH + SORT + CATEGORY + totalPages
		router.post("/fetch", async function (req, res) {
			const page = parseInt(req.fields.page) || 1;
			const sortBy = req.fields.sortBy;
			const category = req.fields.category || "";
			const search = req.fields.search || "";

			const perPage = 8;
			const startFrom = (page - 1) * perPage;

			let sortObj = { createdAt: -1 };

			if (sortBy === "newestToOldest") {
				sortObj = { createdAt: -1 };
			} else if (sortBy === "oldestToNewest") {
				sortObj = { createdAt: 1 };
			} else if (sortBy === "priceDescending") {
				sortObj = { price: -1 };
			} else if (sortBy === "priceAscending") {
				sortObj = { price: 1 };
			}

			const orArray = [];

			if (search !== "") {
				orArray.push(
					{ name: { $regex: ".*" + search + ".*", $options: "i" } },
					{ description: { $regex: ".*" + search + ".*", $options: "i" } },
					{ category: { $regex: ".*" + search + ".*", $options: "i" } },
					{ "specs.value": { $regex: ".*" + search + ".*", $options: "i" } }
				);
			}

			let findObj = {};
			if (category !== "" && category !== "All") {
				orArray.push({ category: category });
			}

			if (orArray.length > 0) {
				findObj = { $or: orArray };
			}

			const totalProducts = await global.db.collection("products").countDocuments(findObj);
			const totalPages = Math.ceil(totalProducts / perPage);

			const products = await global.db.collection("products")
				.find(findObj)
				.sort(sortObj)
				.skip(startFrom)
				.limit(perPage)
				.toArray();

			res.json({
				status: "success",
				message: "Data has been fetched.",
				products,
				totalPages
			});
		});

		app.use("/products", router);
	}
};
