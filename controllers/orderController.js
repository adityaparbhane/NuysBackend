const db = require("../models/db");
const cloudinary = require("cloudinary").v2;
const upload = require("../middleware/orderImage");
const fs = require("fs");
const crypto = require("crypto");
const { json } = require("body-parser");

cloudinary.config({
  cloud_name: "dsxlrlc0c",
  api_key: "124118441879576",
  api_secret: "OmseKOvrDC0U70cxxONFGUtluwo",
});

const generateOrderId = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 digits alphanumeric
};

const createOrder = async (req, res) => {
  try {
    const {
      cname,
      cemail,
      contactNo,
      address,
      state,
      zipCode,
      items,
      paymentTransactionNo,
    } = req.body;

    const payment_Status = "Pending";
    const orderId = generateOrderId();
    const parsedItems = JSON.parse(items);

    const TotalAmount = parsedItems.reduce((acc, curr) => acc + curr.price, 0);
    const sql =
      "INSERT INTO orders (cname, cemail, contactNo, address, state, zipCode, orderId, paymentTransactionNo, payment_Status, orderDate,TotalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
    const orderDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result1 = await db.queryAsync(sql, [
      cname,
      cemail,
      contactNo,
      address,
      state,
      zipCode,
      orderId,
      paymentTransactionNo,
      payment_Status,
      orderDate,
      TotalAmount,
    ]);

    for (let i = 0; i < parsedItems.length; i++) {
      const { productId, productName, quantity, price } = parsedItems[i];

      const sql =
        "INSERT INTO orderdetails ( productId, productName, quantity, price,id) VALUES ( ?, ?, ?, ?, ?)";
      const orderDate = new Date().toISOString().slice(0, 19).replace("T", " ");

      await db.queryAsync(sql, [
        productId,
        productName,
        quantity,
        price,
        result1.insertId,
      ]);
    }

    res.status(201).json({
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const sql = "SELECT * FROM orders ORDER BY id DESC";
    const results = await db.queryAsync(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

const getAllOrderDetails = async (req, res) => {
  try {
    const sql = "SELECT * FROM orderdetails";
    const results = await db.queryAsync(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT * FROM orders WHERE id = ?";
    const result = await db.queryAsync(sql, [id]);

    const sql2 = "SELECT * FROM orderdetails WHERE Id = ?";
    const result2 = await db.queryAsync(sql2, [id]);

    if (result.length === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(200).json({ order: result[0], orderDetails: result2 });
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    cname,
    cemail,
    contactNo,
    address,
    state,
    zipCode,
    productId,
    productName,
    quantity,
    price,
    paymentTransactionNo,
    payment_Status,
  } = req.body;
  let paymentScreenshot = req.file ? req.file.path : null;
  let paymentScreenshotUrl = null;

  try {
    if (paymentScreenshot) {
      const uploadResult = await cloudinary.uploader.upload(paymentScreenshot);
      fs.unlinkSync(paymentScreenshot);
      paymentScreenshotUrl = uploadResult.secure_url;
    }

    const sql =
      "UPDATE orders SET cname = ?, cemail = ?, contactNo = ?, address = ?, state = ?, zipCode = ?, productId = ?, productName = ?, quantity = ?, price = ?, paymentTransactionNo = ?, paymentScreenshot = ? WHERE id = ?";
    const result = await db.queryAsync(sql, [
      cname,
      cemail,
      contactNo,
      address,
      state,
      zipCode,
      productId,
      productName,
      quantity,
      price,
      paymentTransactionNo,
      paymentScreenshotUrl,
      id,
    ]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(200).json({ message: "Order updated successfully" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Error updating order" });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM orders WHERE id = ?";
    const result = await db.queryAsync(sql, [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Error deleting order" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrderDetails,
};
