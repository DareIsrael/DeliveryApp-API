const Review = require("../models/reviewModel");
const foodModel = require("../models/foodModel");
const userModel = require("../models/UserModel.js");

// Add a review
const addReview = async (req, res) => {
    try {
        const { foodId } = req.params;
        const { rating, comment } = req.body;

        // Check if rating and comment are provided
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required.'
            });
        }

        // Check if the rating is within the valid range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5.'
            });
        }

        // Check if the food item exists
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        // Attach the userId from the token to the request object
        const userId = req.body.userId; // We are assuming that the userId is now set by authMiddleware

        // Check if the user has already reviewed this food
        const existingReview = await Review.findOne({ user: userId, food: foodId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product" });
        }

        // Create a new review
        const review = new Review({
            user: userId,
            food: foodId,
            rating,
            comment,
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ success: false, message: "Error adding review" });
    }
};

// Get reviews for a specific food item
const getReviews = async (req, res) => {
    try {
        const { foodId } = req.params;

        const reviews = await Review.find({ food: foodId })
            .populate("user", "name email") // Populate user data
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json({
            success: true,
            reviews,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
};

module.exports = { addReview, getReviews };
