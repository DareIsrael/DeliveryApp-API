// import orderModel from "../models/orderModel.js";

// import userModel from "../models/UserModel.js"

// import Stripe from "stripe"

// const stripe = new Stripe (process.env.STRIPE_SECRET_KEY)

// const placeOrder = async (req, res) => {

//     const frontend_url = "http://localhost:3000"
    
//     try {
//         const newOrder = new orderModel({
//             userId:req.body.userId,
//             items:req.body.items,
//             amount:req.body.amount,
//             address:req.body.address
//         })
//         await newOrder.save();
//         await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})

//         const line_items = req.body.items.map(() =>({
//             price_data: {
//                 currency: "",
//                 product_data: {
//                     name:item.name
//                 },
//                 unit_amount:item.price*100*80
//             },
//             quantity:item.quantity
//         }) )

//         line_items.push({
//             price_data:{
//                 currency:"",
//                 product_data: {
//                     name:"Deliver Charges"
//                 },
//                 unit_amount:2*100*80
//             },
//             quantity:1
//         })

//         const session = await stripe.checkout.session.create({
//             line_items:line_items,
//             mode:'payment',
//             success_url:`${front_url}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url:`${front_url}/verify?success=false&orderId=${newOrder._id}`,
//         })

//         res.json ({success:true, session_url:session.url})
//     } catch (error) {
//       console.log(error);
//       res.json({
//         success:false,
//         message:"error"
//       })
//     }

// }


// export  default placeOrder

const orderModel = require("../models/orderModel.js");
const userModel = require("../models/UserModel.js");
const paystack = require('paystack-api');

const paystackAPI = paystack(process.env.PAYSTACK_SECRET_KEY);

const placeOrder = async (req, res) => {
    console.log(req.body);

    const frontendUrl = "https://deliveryapp-ui.onrender.com"

    // 'https://deliveryapp-ui.onrender.com';
    // 'http://localhost:3001'

    try {
        // Clear user's cart data
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Create and save a new order
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();

        // Retrieve the user to get their email
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create a Paystack payment
        const paymentData = {
            email: user.email,
            amount: req.body.amount * 100, // Convert to kobo
            metadata: {
                orderId: newOrder._id,
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: newOrder._id
                    }
                ]
            },
            callback_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`
        
        };

        const response = await paystackAPI.transaction.initialize(paymentData);

        if (response.status) {
            res.json({
                success: true,
                session_url: response.data.authorization_url
            });
        } else {
            res.json({
                success: false,
                message: "Failed to initiate payment"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



const crypto = require('crypto');
const orderModel = require("../models/orderModel.js");

// Webhook route to handle Paystack events
const handlePaystackWebhook = async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Step 1: Verify the Paystack signature to ensure the request is genuine
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
        // Step 2: Process the event
        const event = req.body;

        if (event.event === 'charge.success') {
            const orderId = event.data.metadata.orderId;

            try {
                // Step 3: Find the order and update its status to "Paid"
                const order = await orderModel.findById(orderId);
                if (order) {
                    order.paymentStatus = "Paid";
                    await order.save();
                    console.log(`Order ${orderId} marked as paid`);
                }
            } catch (err) {
                console.error('Error updating order:', err);
            }
        }

        // Return a 200 response to acknowledge receipt of the webhook
        return res.status(200).send('Webhook processed successfully');
    } else {
        // Invalid signature
        return res.status(401).send('Invalid signature');
    }
};

// Export the webhook handler


// const verifyOrder = async (req, res) => {
//     const { orderId, success } = req.body;

//     try {
//         if (success === "true") {
//             await orderModel.findByIdAndUpdate(orderId, { payment: true });
//             res.json({ success: true, message: "Paid" });
//         } else {
//             await orderModel.findByIdAndDelete(orderId);
//             res.json({ success: false, message: "Not Paid" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };







const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment verified and order updated." });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment failed. Order deleted." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Server error during payment verification." });
    }
};




const userOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


    // fetch all orders





const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};










module.exports = { placeOrder, verifyOrder, userOrder, listOrders, updateStatus, handlePaystackWebhook};
