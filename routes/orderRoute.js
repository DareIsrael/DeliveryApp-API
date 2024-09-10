const express = require("express");
const { authMiddleware } = require("../middleware/auth.js");
const { listOrders, placeOrder, updateStatus, userOrder, verifyOrder } = require("../controllers/orderController.js");

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrder);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

module.exports = orderRouter;
