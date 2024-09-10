// const mongoose = require("mongoose");

// const foodSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     }
// });

// const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

// module.exports = foodModel;


const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String, // URL of the image stored in Cloudinary
        required: true
    },
    imageId: {
        type: String, // Cloudinary public ID for the image
        required: false
    },
    category: {
        type: String,
        required: true
    }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

module.exports = foodModel;
