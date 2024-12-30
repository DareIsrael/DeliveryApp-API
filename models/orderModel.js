// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({

//     userId: {
//       type: String,
//       required:true
//     },
//     items:{
//         type: Array,
//         required: true
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     address: {
//         type: Object,
//         required:true
//     },
//     status: {
//         type: String,
//         default: "Order Processing"
//     },
//     date: {
//         type: Date,
//         default:Date.now()
//     },
//     payment: {
//         type: Boolean,
//         default: false
//     }
// })


// const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

// module.exports = orderModel


const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: "Order Processing" // You can customize this based on your order lifecycle
    },
    paymentStatus: {
        type: String,
        default: "Pending" // To track if the payment is 'Pending', 'Paid', or 'Failed'
    },
    date: {
        type: Date,
        default: Date.now()
    },
    payment: {
        type: Boolean,
        default: false // You can keep this for payment verification, but now `paymentStatus` is more specific
    }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

module.exports = orderModel;
