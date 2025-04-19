const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const nodemailerFrom = ""; // 👉 Điền email gửi
const nodemailerObject = {
	host: "",                // 👉 Điền host SMTP (ví dụ: smtp.gmail.com)
	port: 465,
	secure: true,
	auth: {
		user: "",            // 👉 Điền email user
		pass: ""             // 👉 Điền app password
	}
};

// ✅ Gửi mail
global.sendMail = async function (to, subject, message, onSuccess = null) {
	const transporter = nodemailer.createTransport(nodemailerObject);

	transporter.sendMail({
		from: nodemailerFrom,
		to: to,
		subject: subject,
		text: message,
		html: message
	}, function (error, info) {
		if (error) {
			console.error("❌ Email error:", error);
		} else {
			console.log("📧 Email sent:", info.response);
		}

		if (onSuccess != null) {
			onSuccess();
		}
	});
};

// ✅ Trừ số lượng hàng trong kho sau khi mua
global.decrementItemsInStock = async function (items) {
	for (let a = 0; a < items.length; a++) {
		const product = await global.db.collection("products").findOne({
			_id: items[a]._id
		});
		if (product != null) {
			if (product.itemsInStock > 0 && product.itemsInStock < items[a].units) {
				return {
					status: "error",
					message: "Only " + product.itemsInStock + " items are left in " + product.name
				};
			}

			const remainingUnits = product.itemsInStock - items[a].units;
			if (remainingUnits < 0) {
				return {
					status: "error",
					message: "Not enough stock in " + product.name
				};
			}

			await global.db.collection("products").findOneAndUpdate({
				_id: product._id
			}, {
				$set: {
					itemsInStock: remainingUnits
				}
			});
		}
	}

	return {
		status: "success",
		message: "Items in stock has been decremented."
	};
};

// ✅ Di chuyển file upload vào thư mục uploads/
global.moveFile = function (file, filename) {
	return new Promise((resolve, reject) => {
		const uploadPath = path.join(__dirname, "..", "uploads", filename);

		// Nếu thư mục chưa tồn tại thì tạo
		fs.mkdir(path.dirname(uploadPath), { recursive: true }, (err) => {
			if (err) {
				console.error("❌ Folder create error:", err);
				return reject(err);
			}

			// Di chuyển file
			file.mv(uploadPath, function (err) {
				if (err) {
					console.error("❌ File move error:", err);
					reject(err);
				} else {
					console.log("✅ File moved to:", uploadPath);
					resolve();
				}
			});
		});
	});
};
