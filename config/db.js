const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://dareisrael4:bright3273@cluster0.mii6s.mongodb.net/food-del')
        .then(() => console.log("DB Connected"));
}

module.exports = { connectDB };


