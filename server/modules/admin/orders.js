const express = require("express")
const ObjectId = require("mongodb").ObjectId
const auth = require("./auth")

module.exports = {
	init: function (router) {
		const orderRouter = express.Router()

		// 🔍 SEARCH
		orderRouter.post("/search", auth, async function (request, result) {
			const search = request.fields.search || ""

			const orders = await global.db.collection("orders").find({
				$or: [
					{ name: { $regex: ".*" + search + ".*", $options: "i" } },
					{ email: { $regex: ".*" + search + ".*", $options: "i" } },
					{ mobile: { $regex: ".*" + search + ".*", $options: "i" } },
					{ country: { $regex: ".*" + search + ".*", $options: "i" } },
					{ address: { $regex: ".*" + search + ".*", $options: "i" } },
					{ paidVia: { $regex: ".*" + search + ".*", $options: "i" } },
					{ status: { $regex: ".*" + search + ".*", $options: "i" } }
				]
			}).sort({ createdAt: -1 }).toArray()

			result.send({
				status: "success",
				message: "Data has been fetched.",
				orders: orders
			})
		})

		// ✅ MARK AS COMPLETED
		orderRouter.post("/markAsCompleted", auth, async function (request, result) {
			const _id = request.fields._id

			const order = await global.db.collection("orders").findOne({
				_id: ObjectId(_id)
			})

			if (!order) {
				return result.json({
					status: "error",
					message: "Order not found."
				})
			}

			await global.db.collection("orders").updateOne(
				{ _id: order._id },
				{ $set: { status: "Completed" } }
			)

			result.json({
				status: "success",
				message: "Order has been marked as completed."
			})
		})

		// 📄 FETCH SINGLE
		orderRouter.post("/fetchSingle", auth, async function (request, result) {
			const orderId = request.fields.orderId

			const order = await global.db.collection("orders").findOne({
				_id: ObjectId(orderId)
			})

			if (!order) {
				return result.json({
					status: "error",
					message: "Order not found."
				})
			}

			result.json({
				status: "success",
				message: "Data has been fetched.",
				order: order
			})
		})

		// 📦 FETCH PAGINATED
		orderRouter.post("/fetch", auth, async function (request, result) {
			const page = parseInt(request.fields.page) || 1
			const perPage = 10
			const startFrom = (page - 1) * perPage

			const orders = await global.db.collection("orders").find({})
				.sort({ createdAt: -1 })
				.skip(startFrom)
				.limit(perPage)
				.toArray()

			await global.db.collection("notifications").updateMany(
				{ type: "order" },
				{ $set: { isRead: true } }
			)

			result.json({
				status: "success",
				message: "Data has been fetched.",
				orders: orders
			})
		})

		// 📊 SALES CHART FOR LAST 7 DAYS
		orderRouter.post("/salesChart", auth, async function (req, res) {
			const today = new Date()
			const days = []

			for (let i = 6; i >= 0; i--) {
				const d = new Date(today)
				d.setHours(0, 0, 0, 0)
				d.setDate(today.getDate() - i)
				days.push(d)
			}

			const stats = []

			for (let d of days) {
				const nextDay = new Date(d)
				nextDay.setDate(d.getDate() + 1)

				const sales = await global.db.collection("orders").aggregate([
					{
						$match: {
							createdAt: {
								$gte: d.getTime(),
								$lt: nextDay.getTime()
							},
							status: "Completed" // ✅ Chỉ tính đơn hoàn tất
						}
					},
					{
						$group: {
							_id: null,
							total: { $sum: "$total" },
							count: { $sum: 1 }
						}
					}
				]).toArray()

				stats.push({
					date: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
					total: sales[0]?.total || 0,
					count: sales[0]?.count || 0
				})
			}

			res.json({
				status: "success",
				message: "Sales chart data fetched.",
				stats
			})
		})


		// 👇 Mount to /orders
		router.use("/orders", orderRouter)
	}
}
