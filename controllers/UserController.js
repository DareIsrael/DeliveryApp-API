const userModel = require("../models/UserModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require('crypto');

// Create a token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};



// const registerUser = async (req, res) => {
//     const { name, password, passwordConfirm, email, phoneNumber } = req.body;
    
//     try {
//         // Check if user already exists
//         const exists = await userModel.findOne({ email });
//         if (exists) {
//             return res.status(400).json({ success: false, message: "User already exists" });
//         }

//         // Validate email format and strong password
//         if (!validator.isEmail(email)) {
//             return res.status(400).json({ success: false, message: "Please enter a valid email" });
//         }

//         if (password.length < 8) {
//             return res.status(400).json({ success: false, message: "Please enter a strong password (at least 8 characters)" });
//         }

//         if (password !== passwordConfirm) {
//             return res.status(400).json({ success: false, message: "Passwords do not match" });
//         }

//         // Create a new user instance
//         const newUser = new userModel({
//             name,
//             email,
//             phoneNumber,
//             password, // Password will be hashed by the pre('save') middleware
//         });

//         // Generate a confirmation token
//         const confirmationToken = crypto.randomBytes(32).toString('hex');
//         newUser.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
//         newUser.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours

//         // Save the user to the database
//         await newUser.save();

//         // Create confirmation URL
//         const confirmationUrl = `${process.env.FRONTEND_URL_FRONTEND_HOST}/confirm/${confirmationToken}`;

//         // Configure nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: process.env.EMAIL_PORT,
//             secure: false,
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });

//         // Email options
//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: newUser.email,
//             subject: 'Account Confirmation',
//             text: `Please confirm your account by clicking the following link: ${confirmationUrl}`,
//             html: `<p>Please confirm your account by clicking the following link:</p><a href="${confirmationUrl}">${confirmationUrl}</a>`,
//         };

//         // Send the email
//         await transporter.sendMail(mailOptions);

//         res.status(201).json({ success: true, message: "A confirmation link has been sent to your email address. Please check your inbox or spam folder to confirm your account." });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Error occurred while registering the user" });
//     }
// };



const registerUser = async (req, res) => {
    const { name, password, passwordConfirm, email, phoneNumber, isMobile } = req.body;

    try {
        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Validate email format and strong password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Please enter a strong password (at least 8 characters)" });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Create a new user instance
        const newUser = new userModel({
            name,
            email,
            phoneNumber,
            password, // Password will be hashed by the pre('save') middleware
        });

        if (isMobile) {
            // Generate OTP for mobile app users
            const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
            newUser.otp = otp;
            newUser.otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

            // Send OTP to the user's email
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: newUser.email,
                subject: 'OTP for Account Confirmation',
                text: `Your OTP for account confirmation is: ${otp}`,
                html: `<p>Your OTP for account confirmation is: <strong>${otp}</strong></p>`,
            };

            await transporter.sendMail(mailOptions);

            res.status(201).json({ success: true, message: "An OTP has been sent to your email. Please enter it to confirm your account." });
        } else {
            // Generate a confirmation token for website users
            const confirmationToken = crypto.randomBytes(32).toString('hex');
            newUser.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
            newUser.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours

            // Create confirmation URL
            const confirmationUrl = `${process.env.FRONTEND_URL_FRONTEND_HOST}/confirm/${confirmationToken}`;

            // Send confirmation link to the user's email
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: newUser.email,
                subject: 'Account Confirmation',
                text: `Please confirm your account by clicking the following link: ${confirmationUrl}`,
                html: `<p>Please confirm your account by clicking the following link:</p><a href="${confirmationUrl}">${confirmationUrl}</a>`,
            };

            await transporter.sendMail(mailOptions);

            res.status(201).json({ success: true, message: "A confirmation link has been sent to your email address. Please check your inbox or spam folder to confirm your account." });
        }

        // Save the user to the database
        await newUser.save();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error occurred while registering the user" });
    }
};

// Confirm User Email
const confirmUser = async (req, res) => {
    const { token } = req.params;

    try {
        // Hash the token to match the stored confirmationToken
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the user with the confirmation token and check if it's still valid
        const user = await userModel.findOne({
            confirmationToken: hashedToken,
            confirmationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired confirmation token' });
        }

        // Confirm the user's account
        user.isConfirmed = true;
        user.confirmationToken = undefined;
        user.confirmationTokenExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Account confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error confirming account' });
    }
};

const confirmOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find the user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Check if the OTP matches and is not expired
        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Confirm the user's account
        user.isConfirmed = true;
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Account confirmed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error confirming account" });
    }
};

// Login User (Only Confirmed Users)
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        // Check if the user has confirmed their email
        if (!user.isConfirmed) {
            return res.status(400).json({ success: false, message: "Please confirm your account before logging in" });
        }

        // Check if the provided password matches the stored password
        const isMatch = await user.matchPassword(password); // Use the method from the schema

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate a token
        const token = createToken(user._id);
       
        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error occurred while logging in" });
    }
   
};

const fetchUsers = async (req, res) => {
    try {
      // Find users and project only the desired fields
      const users = await userModel.find({}, 'name email phoneNumber role');
      
      // Respond with the fetched users
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
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
        // console.log(error);
        res.json({ success: false, message: "Error" });
    }
};


// Forgot password
// const forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//         // Check if the user exists
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//         // Create a reset URL
//         const resetUrl = `${process.env.FRONTEND_URL_FRONTEND_LOCAL}/resetpassword/${user._id}/${token}`; // Make sure this URL is correct for your frontend

//         // Send the email with nodemailer
//         const transporter = nodemailer.createTransport({
//             host: 'sandbox.smtp.mailtrap.io',
//             port: 2525,
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD
//             },
//         });

//         const mailOptions = {
//             from: 'no-reply@example.com',
//             to: user.email,
//             subject: 'Password Reset Request',
//             text: `You requested a password reset. Please go to the following link to reset your password: ${resetUrl}`,
//             html: `<p>You requested a password reset. Please go to the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
//         };

//         await transporter.sendMail(mailOptions);

//         res.status(200).json({ success: true, message: 'Password reset link sent to email' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// };

// // Reset password
// const resetPassword = async (req, res) => {
//     const { id, token } = req.params;
//     const { password } = req.body;
    
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.json({ status: "error with token" });
//         } else {
//             bcrypt.hash(password, 10).then(hash => {
//                 userModel.findByIdAndUpdate({ _id: id }, { password: hash }).then(() => res.send({ status: "success" }))
//                 .catch(err => res.send({ status: err }));
//             });
//         }
//     });
// };


// const forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//         // Check if the user exists
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // Generate a reset token using crypto
//         const resetToken = crypto.randomBytes(32).toString('hex');
//         const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//         const resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour expiry

//         // Store the hashed reset token and expiry in the user's document
//         user.resetPasswordToken = resetPasswordToken;
//         user.resetPasswordExpire = resetPasswordExpire;
//         await user.save();

//         // Create a reset URL
//         const resetUrl = `${process.env.FRONTEND_URL_FRONTEND_LOCAL}/resetpassword/${user._id}/${resetToken}`;

//         // Configure nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             host: 'sandbox.smtp.mailtrap.io',
//             port: 2525,
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });

//         // Email options
//         const mailOptions = {
//             from: 'no-reply@example.com',
//             to: user.email,
//             subject: 'Password Reset Request',
//             text: `You requested a password reset. Please go to the following link to reset your password: ${resetUrl}`,
//             html: `<p>You requested a password reset. Please go to the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
//         };

//         // Send the email
//         await transporter.sendMail(mailOptions);

//         res.status(200).json({ success: true, message: 'Password reset link sent to email' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// };

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token using the model method
        const resetToken = user.createPasswordResetToken();
        await user.save();

        // Create a reset URL
        const resetUrl = `${process.env.FRONTEND_URL_FRONTEND_HOST}/resetpassword/${user._id}/${resetToken}`;

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please go to the following link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset. Please go to the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ----------------------------
// Reset Password
// ----------------------------
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Hash the token to match the stored resetPasswordToken
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the user by reset token and ensure it's not expired
        const user = await userModel.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set the new password (let pre-save middleware handle hashing)
        user.password = password;

        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



module.exports = { loginUser,loginAdmin, registerUser, confirmOtp, confirmUser, forgotPassword, resetPassword , fetchUsers};
