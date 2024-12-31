const express = require("express");
const { authMiddleware } = require("../middleware/auth.js");
const { listOrders, placeOrder, updateStatus, userOrder, verifyOrder ,verifyPayment, handlePaystackWebhook} = require("../controllers/orderController.js");
const bodyParser = require('body-parser');

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
// orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrder);
orderRouter.get("/api/verifyPayment/:orderId", verifyPayment)
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post ('/paystack-webhook', handlePaystackWebhook);

module.exports = orderRouter;


