// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Define the user schema
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     phoneNumber: {
//         type: String,
//         required: false,
//         select: false
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'user'
//       },
//     cartData: {
//         type: Object,
//         default: {}
//     },
//     resetPasswordToken: {
//         type: String
//     },
//     resetPasswordExpire: {
//         type: Date
//     }
// }, { minimize: false });

// // Middleware to hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Method to compare password for login
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// // Create or get the model
// const userModel = mongoose.models.user || mongoose.model("user", userSchema);

// module.exports = userModel;


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Add crypto import

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
      
    },
    phoneNumber: {
        type: String,
        required: false,
        select: false
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cartData: {
        type: Object,
        default: {}
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    confirmationToken: {
        type: String
    },
    confirmationTokenExpire: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    otp: {
        type: String // Store OTP as a string
    },
    otpExpire: {
        type: Date
    }
}, { minimize: false });

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to set reset token and expiry
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // Token valid for 30 minutes
    return resetToken;
};

// Method to set confirmation token and expiry
userSchema.methods.createConfirmationToken = function () {
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    this.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
    this.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
    return confirmationToken;
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;
