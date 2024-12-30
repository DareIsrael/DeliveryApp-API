
const crypto = require('crypto');
const orderModel = require("../models/orderModel.js");
const userModel = require("../models/UserModel.js");
const paystack = require('paystack-api');

const paystackAPI = paystack(process.env.PAYSTACK_SECRET_KEY);

// const placeOrder = async (req, res) => {
//     // console.log(req.body);

//     const frontendUrl = process.env.FRONTEND_URL_FRONTEND_HOST
    
//     try {
//         // Clear user's cart data
//         await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

//         // Create and save a new order
//         const newOrder = new orderModel({
//             userId: req.body.userId,
//             items: req.body.items,
//             amount: req.body.amount,
//             address: req.body.address
//         });
//         await newOrder.save();

//         // Retrieve the user to get their email
//         const user = await userModel.findById(req.body.userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         // Create a Paystack payment
//         const paymentData = {
//             email: user.email,
//             amount: req.body.amount * 100, // Convert to kobo
//             metadata: {
//                 orderId: newOrder._id,
//                 custom_fields: [
//                     {
//                         display_name: "Order ID",
//                         variable_name: "order_id",
//                         value: newOrder._id
//                     }
//                 ]
//             },
//             callback_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`
        
//         };

//         const response = await paystackAPI.transaction.initialize(paymentData);

//         if (response.status) {
//             res.json({
//                 success: true,
//                 session_url: response.data.authorization_url
               
//             });
//             // console.log(response.data.authorization_url)
//         } else {
//             res.json({
//                 success: false,
//                 message: "Failed to initiate payment"
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// };




// // Webhook route to handle Paystack events
// const handlePaystackWebhook = async (req, res) => {
//     const secret = process.env.PAYSTACK_SECRET_KEY;

//     // Step 1: Verify the Paystack signature to ensure the request is genuine
//     const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

//     if (hash === req.headers['x-paystack-signature']) {
//         // Step 2: Process the event
//         const event = req.body;

//         if (event.event === 'charge.success') {
//             const orderId = event.data.metadata.orderId;

//             try {
//                 // Step 3: Find the order and update its status to "Paid"
//                 const order = await orderModel.findById(orderId);
//                 if (order) {
//                     order.paymentStatus = "Paid";
//                     await order.save();
//                     // console.log(`Order ${orderId} marked as paid`);
//                 }
//             } catch (err) {
//                 console.error('Error updating order:', err);
//             }
//         }

//         // Return a 200 response to acknowledge receipt of the webhook
//         return res.status(200).send('Webhook processed successfully');
//     } else {
//         // Invalid signature
//         return res.status(401).send('Invalid signature');
//     }
// };






// const verifyOrder = async (req, res) => {
//     const { orderId, success } = req.body;

//     console.log(req.body)

//     try {
//         if (success === "true") {
//             await orderModel.findByIdAndUpdate(orderId, { payment: true });
//             res.json({ success: true, message: "Payment verified and order updated." });
//         } else {
//             await orderModel.findByIdAndDelete(orderId);
//             res.json({ success: false, message: "Payment failed. Order deleted." });
//         }
//     } catch (error) {
//         console.error("Error verifying payment:", error);
//         res.status(500).json({ success: false, message: "Server error during payment verification." });
//     }
// };



// const paystackAPI = paystack(process.env.PAYSTACK_SECRET_KEY);

const placeOrder = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL_FRONTEND_HOST;
    
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
        
        // Ensure the email is available
        const email = user.email;
        if (!email) {
            return res.status(400).json({ success: false, message: "User email not found" });
        }

        // Prepare payment data
        const paymentData = {
            email: email,
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

        // Initialize Paystack payment
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

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    

    try {
        if (success === "true") {
            
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment verified and order updated." });
        } else {
            
            const deletedOrder = await orderModel.findByIdAndDelete(orderId);

            if (deletedOrder) {
              
                res.json({ success: false, message: "Payment failed. Order deleted." });
            } else {
                
                res.json({ success: false, message: "Payment failed. Order not found." });
            }
        }
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Server error during payment verification." });
    }
};




const userOrder = async (req, res) => {
    try {
        // Sort orders by 'date' in descending order (newest first)
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
        
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




 // Assuming this is where your order model is

// List orders based on search query
const listOrders = async (req, res) => {
    try {
        const { firstname, lastname } = req.query;

        let searchQuery = {};

        // Add search conditions only if parameters are provided
        if (firstname) {
            searchQuery['address.firstName'] = { $regex: firstname, $options: 'i' }; // Case-insensitive search
        }
        if (lastname) {
            searchQuery['address.lastName'] = { $regex: lastname, $options: 'i' }; // Case-insensitive search
        }

        // Fetch orders based on the search criteria or all orders if no criteria
        const orders = await orderModel.find(searchQuery).sort({ date: -1 }); // Sort by date, most recent first

        if (orders.length > 0) {
            res.json({
                success: true,
                data: orders,
            });
        } else {
            res.json({
                success: true,
                data: [],
                message: 'No orders found matching your search',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};




// const listOrders = async (req, res) => {
//     try {
//         const orders = await orderModel.find({});
//         res.json({
//             success: true,
//             data: orders
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// };


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
