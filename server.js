const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const foodRouter = require("./routes/foodRoute.js");
const userRouter = require("./routes/UserRoute.js");
require('dotenv').config();
const cartRouter = require("./routes/cartRoute.js");
const orderRouter = require("./routes/orderRoute.js");
const reviewRoutes = require("./routes/reviewRoute.js");



// app config

const app = express()
const port = 4000


// middleware

app.use(express.json())


// CORS configuration for multiple origins
app.use(cors({
  origin: [process.env.FRONTEND_URL_ADMIN_LOCAL, process.env.FRONTEND_URL_FRONTEND_LOCAL, process.env.FRONTEND_URL_FRONTEND_HOST], // Replace with your actual frontend URLs
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));





app.use(express.urlencoded({ extended: true }));



// db connection 
connectDB();

// api endpoints

app.use("/api/food", foodRouter)
// app.use("/images",express.static('upload'))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res)=> {
    res.send(" API Working ")
})



app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})

