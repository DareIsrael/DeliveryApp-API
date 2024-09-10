const userModel = require("../models/UserModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");

// Create a token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
const registerUser = async (req, res) => {
    const { name, password, passwordConfirm, email, phoneNumber } = req.body;
    try {
        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Validate email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Create a new user
        const newUser = new userModel({
            name,
            email,
            phoneNumber,
            password
                // Password will be hashed by the pre('save') middleware
        });

        // Save the user
        const user = await newUser.save();

        // Generate a token
        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        // Check if the provided password matches the stored password
        const isMatch = await user.matchPassword(password); // Use the method from the schema

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Generate a token
        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
        // Find the user by email
        const user = await userModel.findOne({ email, role: 'admin' }); // Only find admin users
        if (!user) {
            return res.json({ success: false, message: "Admin user does not exist" });
        }

        // Check if the provided password matches the stored password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Generate a token
        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};


// Forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Create a reset URL
        const resetUrl = `http://localhost:3001/resetpassword/${user._id}/${token}`; // Make sure this URL is correct for your frontend

        // Send the email with nodemailer
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        const mailOptions = {
            from: 'no-reply@example.com',
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please go to the following link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset. Please go to the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.json({ status: "error with token" });
        } else {
            bcrypt.hash(password, 10).then(hash => {
                userModel.findByIdAndUpdate({ _id: id }, { password: hash }).then(() => res.send({ status: "success" }))
                .catch(err => res.send({ status: err }));
            });
        }
    });
};

module.exports = { loginUser,loginAdmin, registerUser, forgotPassword, resetPassword };
