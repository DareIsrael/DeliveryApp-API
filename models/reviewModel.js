const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Reference to the User model
        required: true,
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food", // Reference to the Food model
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
