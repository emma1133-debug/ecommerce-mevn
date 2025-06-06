const express = require("express")
const fileSystem = require("fs")
const auth = require("./auth")
const ObjectId = require("mongodb").ObjectId

module.exports = {
  callbackFileUpload: function (images, index, savedPaths = [], success = null, error = null) {
    const self = this

    if (images.length > index) {
      fileSystem.readFile(images[index].path, function (error, data) {
        if (error) {
          console.error(error)
          return
        }

        let filePath = "uploads/" + new Date().getTime() + "-" + images[index].name

        fileSystem.writeFile(filePath, data, async function (error) {
          if (error) {
            console.error(error)
            return
          }

          console.log("image " + (index + 1) + " uploaded")
          savedPaths.push(filePath)

          if (index == (images.length - 1)) {
            console.log("last image uploaded")

            if (success != null) {
              success(savedPaths)
            }
          } else {
            index++
            self.callbackFileUpload(images, index, savedPaths, success, error)
          }
        })

        fileSystem.unlink(images[index].path, function (error) {
          if (error) {
            console.error(error)
            return
          }
        })
      })
    } else {
      if (success != null) {
        success(savedPaths)
      }
    }
  },

  init: function (router) {
    const self = this
    const productsRouter = express.Router()

    productsRouter.post("/destroy", auth, async function (request, result) {
      const _id = request.fields._id

      const product = await global.db.collection("products").findOne({
        _id: ObjectId(_id)
      })

      if (product == null) {
        result.json({ status: "error", message: "Product not found." })
        return
      }

      for (let a = 0; a < product.images.length; a++) {
        fileSystem.unlink(product.images[a], function (error) {
          console.log(error)
        })
      }

      await global.db.collection("products").deleteOne({ _id: product._id })

      result.json({ status: "success", message: "Product has been deleted." })
    })

    productsRouter.post("/update", auth, async function (request, result) {
      const name = request.fields.name
      const description = request.fields.description
      const price = request.fields.price
      const itemsInStock = parseInt(request.fields.itemsInStock) || 0
      const category = request.fields.category || "Uncategorized"
      const _id = request.fields._id

      const product = await global.db.collection("products").findOne({
        _id: ObjectId(_id)
      })

      if (!product) {
        result.json({ status: "error", message: "Product not found." })
        return
      }

      const images = []
      if (Array.isArray(request.files.images)) {
        for (let a = 0; a < request.files.images.length; a++) {
          if (request.files.images[a].size > 0) {
            images.push(request.files.images[a])
          }
        }
      } else {
        if (request.files.images?.size > 0) {
          images.push(request.files.images)
        }
      }

      self.callbackFileUpload(images, 0, [], async function (savedPaths) {
        const updateFields = {
          name,
          description,
          price: parseFloat(price),
          itemsInStock,
          category
        }

        if (savedPaths.length > 0) {
          // delete previous images
          for (let a = 0; a < product.images.length; a++) {
            fileSystem.unlink(product.images[a], function (error) {
              console.log(error)
            })
          }

          updateFields.images = savedPaths
        }

        await global.db.collection("products").updateOne(
          { _id: product._id },
          { $set: updateFields }
        )

        result.json({ status: "success", message: "Product has been updated." })
      })
    })

    productsRouter.post("/fetchSingle", auth, async function (request, result) {
      const _id = request.fields._id

      const product = await global.db.collection("products").findOne({
        _id: ObjectId(_id)
      })

      if (!product) {
        result.json({ status: "error", message: "Product not found." })
        return
      }

      result.json({ status: "success", message: "Data has been fetched.", product })
    })

    productsRouter.post("/fetch", auth, async function (request, result) {
      const page = parseInt(request.fields.page) || 1
      const perPage = 10
      const startFrom = (page - 1) * perPage

      const products = await global.db.collection("products")
        .find({})
        .sort({ createdAt: -1 })
        .skip(startFrom)
        .limit(perPage)
        .toArray()

      result.json({ status: "success", message: "Data has been fetched.", products })
    })

    productsRouter.post("/add", auth, function (request, result) {
      const name = request.fields.name
      const description = request.fields.description
      const price = request.fields.price
      const itemsInStock = parseInt(request.fields.itemsInStock) || 0
      const category = request.fields.category || "Uncategorized"

      if (itemsInStock < 0) {
        result.json({ status: "error", message: "Items in stock must be a positive number." })
        return
      }

      const images = []
      if (Array.isArray(request.files.images)) {
        for (let a = 0; a < request.files.images.length; a++) {
          if (request.files.images[a].size > 0) {
            images.push(request.files.images[a])
          }
        }
      } else if (request.files.images?.size > 0) {
        images.push(request.files.images)
      }

      self.callbackFileUpload(images, 0, [], async function (savedPaths) {
        await global.db.collection("products").insertOne({
          name,
          description,
          price: parseFloat(price),
          itemsInStock,
          category,
          images: savedPaths,
          createdAt: new Date().getTime()
        })

        result.json({ status: "success", message: "Product has been added." })
      })
    })

    router.use("/products", productsRouter)
  }
}
