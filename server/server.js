const express = require("express")
const app = express()
const http = require("http").createServer(app)
const cors = require("cors")
app.use(cors()) 

app.options("*", cors()) // 👈 optional cho preflight request

const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient
const ObjectId = mongodb.ObjectId

const formidable = require("express-formidable")
app.use(formidable({ multiples: true }))
app.use(cors()) 



const fs = require("fs")
app.use("/uploads", express.static(__dirname + "/uploads"))

// custom modules
const admin = require("./modules/admin/index")
const products = require("./modules/products")
const auth = require("./modules/admin/auth")
const userAuth = require("./modules/auth")
require("./modules/globals")

const bcryptjs = require("bcryptjs")

const jwt = require("jsonwebtoken")
const jwtSecret = "jwtSecret1234567890"
global.jwtSecret = jwtSecret

const socketIO = require("socket.io")(http, {
    cors: {
      origin: [
        "http://localhost:8080",
        "http://localhost:8081",
        "http://192.168.0.229:8080",
        "http://192.168.0.229:8081"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  })  
global.socketIO = socketIO

socketIO.on("connection", (socket) => {
    console.log("🎉 New client connected:", socket.id)
  
    socket.on("disconnect", () => {
      console.log("👋 Client disconnected:", socket.id)
    })
  })

// Add headers before the routes are defined
app.use(function (req, res, next) {
    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://192.168.0.229:8080",
      "http://192.168.0.229:8081"
    ]
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')


    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization')


    res.setHeader('Access-Control-Allow-Credentials', true)
    
    next()
  })
  

const apiURL = "http://localhost:3000"
global.adminEmail = "admin@gmail.com"

const port = process.env.PORT || 3000
app.get("/", (req, res) => {
    res.send("Welcome to the E-Commerce API backend. All systems operational!");
});

http.listen(port, function () {
    console.log("Server started running at port: " + port)

    mongoClient.connect("mongodb://localhost:27017", async function (error, client) {
        if (error) {
            console.error(error)
            return
        }
        const db = client.db("ecommerce_free")
        global.db = db
        console.log("Database connected")

        admin.init(app)
        products.init(app)

        app.put("/products/:id", async (req, res) => {
            try {
              const productId = new ObjectId(req.params.id);
              const updates = req.fields; // 👈 dùng req.fields thay vì req.body
          
              if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
                return res.json({
                  status: "error",
                  message: "No update data received."
                });
              }
          
              await global.db.collection("products").updateOne(
                { _id: productId },
                { $set: updates }
              );
          
              res.json({
                status: "success",
                message: "Product updated successfully."
              });
            } catch (err) {
              res.json({ status: "error", message: err.message });
            }
          });          
          
        // Route cho frontend gửi bằng form-data (formidable)
        app.post("/products", async (req, res) => {
            try {
            const { name, description, price, itemsInStock, category, images } = req.fields;
        
            if (!name || !price || !itemsInStock || !category) {
                return res.json({
                status: "error",
                message: "Missing required fields."
                });
            }
  
      const newProduct = {
        name,
        description: description || "",
        price: parseFloat(price),
        itemsInStock: parseInt(itemsInStock),
        category,
        images: Array.isArray(images)
          ? images
          : typeof images === "string"
          ? [images]
          : [],
        createdAt: new Date().getTime()
      };
  
      await global.db.collection("products").insertOne(newProduct);
  
      res.json({
        status: "success",
        message: "Product added successfully.",
        product: newProduct
      });
    } catch (err) {
      res.json({ status: "error", message: err.message });
    }
  });  

        app.get("/orders", async (req, res) => {
            try {
              const orders = await global.db.collection("orders").find({}).toArray();
              res.json({
                status: "success",
                message: "Orders fetched successfully.",
                orders
              });
            } catch (err) {
              res.json({ status: "error", message: err.message });
            }
          });
          

        // POST - Thêm sản phẩm mới
        app.post("/products", async (req, res) => {
            try {
            const { name, description, price, itemsInStock, category, images } = req.body;
        
            if (!name || !price || !itemsInStock || !category) {
                return res.json({
                status: "error",
                message: "Missing required fields."
                });
            }
        
            const newProduct = {
                name,
                description: description || "",
                price: parseFloat(price),
                itemsInStock: parseInt(itemsInStock),
                category,
                images: Array.isArray(images) ? images : [],
                createdAt: new Date().getTime()
            };
        
            await global.db.collection("products").insertOne(newProduct);
        
            res.json({
                status: "success",
                message: "Product added successfully.",
                product: newProduct
            });
            } catch (err) {
            res.json({ status: "error", message: err.message });
            }
        });
        
        // GET - Lấy toàn bộ sản phẩm hoặc theo trang
        app.get("/products", async (req, res) => {
            try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
        
            const products = await global.db.collection("products")
                .find({})
                .skip(skip)
                .limit(limit)
                .toArray();
        
            const total = await global.db.collection("products").countDocuments();
        
            res.json({
                status: "success",
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                products
            });
            } catch (err) {
            res.json({ status: "error", message: err.message });
            }
        });
        
        // PUT - Cập nhật sản phẩm theo ID
        app.put("/products/:id", async (req, res) => {
            try {
            const productId = new ObjectId(req.params.id);
            const updates = req.body;
        
            await global.db.collection("products").updateOne(
                { _id: productId },
                { $set: updates }
            );
        
            res.json({
                status: "success",
                message: "Product updated successfully."
            });
            } catch (err) {
            res.json({ status: "error", message: err.message });
            }
        });
        
        // DELETE - Xoá sản phẩm theo ID
        app.delete("/products/:id", async (req, res) => {
            try {
            const productId = new ObjectId(req.params.id);
        
            await global.db.collection("products").deleteOne({ _id: productId });
        
            res.json({
                status: "success",
                message: "Product deleted successfully."
            });
            } catch (err) {
            res.json({ status: "error", message: err.message });
            }
        });

        const adminObj = await db.collection("admins").findOne({})
        if (adminObj == null) {
            bcryptjs.genSalt(10, function (error, salt) {
                bcryptjs.hash("admin", salt, async function(error, hash) {
                    await db.collection("admins").insertOne({
                        email: global.adminEmail,
                        password: hash
                    })

                    await db.collection("configurations").findOneAndUpdate({}, {
                        $set: {
                            "adminEmail": global.adminEmail
                        }
                    }, {
                        upsert: true
                    })
                })
            })
        }

        // route for logout request
        app.post("/logout", userAuth, async function (request, result) {
            const user = request.user

            // update JWT of user in database
            await db.collection("users").findOneAndUpdate({
                "_id": user._id
            }, {
                $set: {
                    "accessToken": ""
                }
            })

            result.json({
                status: "success",
                message: "Logout successfully."
            })
        })

        app.post("/getUser", userAuth, async function (request, result) {
            const user = request.user

            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: user
            })
        })

        // route for login requests
        app.post("/login", async function (request, result) {

            // get values from login form
            const email = request.fields.email
            const password = request.fields.password

            // check if email exists
            const user = await db.collection("users").findOne({
                "email": email
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Email does not exists."
                })
                return
            }

            // check if password is correct
            bcryptjs.compare(password, user.password, async function (error, isVerify) {
                if (isVerify) {
                    // generate JWT of user
                    const accessToken = jwt.sign({
                        "userId": user._id.toString()
                    }, jwtSecret)

                    // update JWT of user in database
                    await db.collection("users").findOneAndUpdate({
                        "email": email
                    }, {
                        $set: {
                            "accessToken": accessToken
                        }
                    })

                    result.json({
                        status: "success",
                        message: "Login successfully.",
                        accessToken: accessToken,
                        user: {
                            name: user.name,
                            email: user.email
                        }
                    })

                    return
                }

                result.json({
                    status: "error",
                    message: "Password is not correct."
                })
            })
        })

        app.post("/registration", async function (request, result) {
            const name = request.fields.name
            const email = request.fields.email
            const password = request.fields.password
            const createdAt = new Date().getTime()

            if (!name || !email || !password) {
                result.json({
                    status: "error",
                    message: "Please enter all values."
                })
                return
            }

            if (email == global.adminEmail) {
                result.json({
                    status: "error",
                    message: "Sorry, you cannot create an account with this email address."
                })
                return
            }

            // check if email already exists
            var user = await db.collection("users").findOne({
                email: email
            })

            if (user != null) {
                result.json({
                    status: "error",
                    message: "Email already exists."
                })
                return
            }

            bcryptjs.genSalt(10, function (error, salt) {
                bcryptjs.hash(password, salt, async function(error, hash) {

                    // insert in database
                    await db.collection("users").insertOne({
                        name: name,
                        email: email,
                        password: hash,
                        accessToken: "",
                        createdAt: createdAt,
                        lastMessageAt: 0
                    })

                    result.json({
                        status: "success",
                        message: "Account has been created. Please login now."
                    })
                })
            })
        })

        app.post("/cashOnDelivery", async function (request, result) {
            const productsCart = JSON.parse(request.fields.products)
            const name = request.fields.name
            const email = request.fields.email
            const mobile = request.fields.mobile
            const country = request.fields.country
            const address = request.fields.address

            for (let a = 0; a < productsCart.length; a++) {
                productsCart[a]._id = ObjectId(productsCart[a]._id)
            }

            const response = await global.decrementItemsInStock(productsCart)
            if (response.status == "error") {
                result.json({
                    status: "error",
                    message: response.message
                })
                return
            }

            await db.collection("orders").insertOne({
                cart: productsCart,
                name: name,
                email: email,
                mobile: mobile,
                country: country,
                address: address,
                paidVia: "COD",
                status: "Processing",
                createdAt: new Date().getTime()
            })

            const configurations = await global.db.collection("configurations").findOne({})
            if (configurations != null) {
                global.sendMail(configurations.adminEmail, "New order", "A new order has been received.")
            }

            await db.collection("notifications").insertOne({
                type: "order",
                isRead: false
            })

            socketIO.emit("newOrder", 1)

            result.json({
                status: "success",
                message: "Your order has been received. We will let you know via E-mail about your order tracking.",
            })
        })

        app.post("/getConfigurations", async function (request, result) {
            let configurations = await db.collection("configurations").findOne({})
            if (!configurations) configurations = {}
        
            const categories = await db.collection("products").distinct("category")
            configurations.categories = categories.filter(c => c?.trim() !== "")
        
            result.json({
                status: "success",
                message: "Data has been fetched.",
                configurations: configurations
            })
        })        
    })
})