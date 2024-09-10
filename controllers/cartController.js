const userModel = require("../models/UserModel.js");

// Add items to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({
            success: true,
            message: "Add To Cart"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "error"
        });
    }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId); // Changed to `User`
        let cartData = await userData.cartData;

        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData }); // Changed to `User`
        res.json({
            success: true,
            message: "Removed from Cart"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "error"
        });
    }
};

// Fetch user cart data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId); // Changed to `User`
        let cartData = await userData.cartData;

        res.json({
            success: true,
            cartData
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "error"
        });
    }
};

module.exports = { addToCart, removeFromCart, getCart };









// const  User = require ('../models/UserModel.js')



// // add items to user cart 


// const addToCart = async (req, res) => {
//     try {
//         let userData = await User.findById(req.body.userId);
//         let cartData = await userData.cartData;

//         if (!cartData[req.body.itemId]) {

//             cartData[req.body.itemId] = 1;

//         } else {

//             cartData[req.body.itemId] += 1;
//         }
//         await User.findByIdAndUpdate(req.body.userId,{cartData});
//         res.json ({
//             success: true,
//             message: "Add To Cart"
//         })

//     } catch (error) {
//         console.log (error);
//         res.json ({
//             success: false,
//             message: "error"
//         })

//     }

// } 



// // remove items from user cart 

// const removeFromCart = async (req, res) => {

//     try {
//         let userData = await userModel.findById(req.body.userId)
//         let cartData = await userData.cartData;
//         if (cartData[req.body.itemId]>0) {
//             cartData[req.body.itemId] -= 1;
//         }
//         await userModel.findByIdAndUpdate(req.body.userId,{cartData})
//         res.json ({
//             success: true,
//             message: " Removed from Cart "
//         })
//     } catch (error) {
//         console.log(error);
//         res.json ({
//             success: false,
//             message: "error"
//         })

//     }

// }


// // fetch user cart data 

// const getCart = async (req, res) => {

//     try {
//         let userData = await userModel.findById(req.body.userId)
//         let cartData = await userData.cartData;
//         res.json ({
//             success: true,cartData
//         })

//     } catch (error) {
//         console.log(error);
//         res.json ({
//             success: false,
//             message: "error"
//         })
//     }

// }


// module.exports = { addToCart, removeFromCart, getCart }