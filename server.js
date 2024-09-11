const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const foodRouter = require("./routes/foodRoute.js");
const userRouter = require("./routes/UserRoute.js");
require('dotenv').config();
const cartRouter = require("./routes/cartRoute.js");
const orderRouter = require("./routes/orderRoute.js");



// app config

const app = express()
const port = 4000


// middleware

app.use(express.json())


// CORS configuration for multiple origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://deliveryapp-ui.onrender.com'], // Replace with your actual frontend URLs
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));


app.use(express.urlencoded({ extended: true }));

// app.use(cors())

// db connection 
connectDB();

// api endpoints

app.use("/api/food", foodRouter)
// app.use("/images",express.static('upload'))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

app.get("/", (req, res)=> {
    res.send(" API Working ")
})

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})

// mongodb+srv://dareisrael4:bright3273@cluster0.mii6s.mongodb.net/?