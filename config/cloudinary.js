const cloudinary = require("cloudinary").v2;
require('dotenv').config(); // Load environment variables

// Configure Cloudinary using the CLOUDINARY_URL
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

module.exports = cloudinary;
