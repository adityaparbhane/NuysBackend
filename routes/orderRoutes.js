const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const upload = require("../middleware/orderImage");
const multer = require("multer");

router.post(
  "/new_order",
  upload.single("paymentScreenshot"),
  orderController.createOrder
);

router.get("/get_order", orderController.getAllOrders);
router.get("/get_orderDetails", orderController.getAllOrderDetails);

router.get("/get_order/:id", orderController.getOrderById);

router.put(
  "/update_order/:id",
  upload.single("paymentScreenshot"),
  orderController.updateOrder
);

router.delete("/remove_order/:id", orderController.deleteOrder);

module.exports = router;
