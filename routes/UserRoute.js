const express = require("express");
const { forgotPassword, loginUser, confirmUser, confirmOtp, registerUser, resetPassword, loginAdmin, fetchUsers } = require('../controllers/UserController.js');
const { authMiddleware} = require("../middleware/auth.js");
// const { adminMiddleware } = require("../middleware/adminAuth.js")
const rateLimit = require("express-rate-limit");

const userRouter = express.Router();

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
  });

userRouter.post("/register", registerUser);
userRouter.post("/login", limiter, loginUser);
userRouter.get('/confirm/:token', confirmUser);
userRouter.post('/confirm-otp', confirmOtp);
userRouter.post("/loginAdmin", limiter, loginAdmin);
userRouter.get('/fetchUsers', fetchUsers)
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword/:id/:token", resetPassword);

module.exports = userRouter;




