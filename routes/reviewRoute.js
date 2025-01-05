const express = require("express");
const { addReview, getReviews } = require("../controllers/reviewController");
const { authMiddleware } = require("../middleware/auth.js");


const router = express.Router();

// Route to add a review
router.post("/:foodId", authMiddleware , addReview);

// Route to get reviews for a food item
router.get("/:foodId",  getReviews);

module.exports = router;
