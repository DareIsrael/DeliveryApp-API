const express = require("express");
const { forgotPassword, loginUser, registerUser, resetPassword, loginAdmin } = require('../controllers/UserController.js');
// const { authMiddleware, adminMiddleware,} = require("../middleware/auth.js");

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/loginAdmin", loginAdmin);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword/:id/:token", resetPassword);

module.exports = userRouter;




