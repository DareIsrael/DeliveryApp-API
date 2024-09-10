// const foodModel = require ('../models/foodModel.js');

// const  fs = require ('fs')

// add food item







// const addFood = async (req, res) => {

//     let image_filename = `${req.file.filename}`;

//     const food = new foodModel ({
//      name : req.body.name,
//      description: req.body.description,
//      price: req.body.price,
//      category: req.body.category,
//      image: image_filename
//     })

//     try {
//         await food.save();
//         res.json({
//             success: true,
//             message: "Food Added"
//         })
//     } catch (error) {
//        console.log(error)
//        res.json({success:false, message: "Error"}) 
//     }


// }


// // all food list 

// const listFood = async (req, res ) => {
//     try {
//         const foods = await foodModel.find({});
//         res.json({
//             success:true,
//             message: "food listed",
//             data: foods
//         })
//     } catch (error) {
//         console.log(error)
//         res.json({success:false, message: "Error"}) 
//      } 

// }

// // remove food item


// const removeFood = async (req, res ) => {
//     try {
//         const food = await foodModel.findById(req.body.id);
//         fs.unlink(`upload/${food.image}`,()=>{})

//         await foodModel.findByIdAndDelete(req.body.id);
//         res.json({
//             success:true,
//             message: "food removed"
//         })
//     } catch (error) {
//         console.log(error)
//         res.json({success:false, message: "Error"}) 
//      } 

// }

// module.exports = {addFood, listFood, removeFood}


const cloudinary = require("../config/cloudinary");
const foodModel = require("../models/foodModel");
const fs = require("fs");

// Add a new food item with image upload to Cloudinary
const addFood = async (req, res) => {
    try {
        console.log("File uploaded:", req.file); // To check if file upload worked
        
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "food_items",
        });

        // Create a new food item with the image URL from Cloudinary
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: result.secure_url, // Store Cloudinary image URL
            imageId: result.public_id, // Store Cloudinary image public ID
        });

        // Save the food item to the database
        await food.save();

        // Delete the local file after uploading to Cloudinary
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: "Item added successfully",
        });
    } catch (error) {
        console.error("Error adding food:", error);
        res.status(500).json({ success: false, message: "Error adding item" });
    }
};

  //  fetch all items 

  // fetch all food 


// List all food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({
            success: true,
            message: "items listed successfully",
            data: foods,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error listing item" });
    }
};




// Remove a food item and its image from Cloudinary
const removeFood = async (req, res) => {
    try {
      // Find the food item by ID
      const food = await foodModel.findById(req.body.id);
      
      if (!food) {
        return res.status(404).json({
          success: false,
          message: "The item not found",
        });
      }
  
      // Remove image from Cloudinary (if using Cloudinary for image hosting)
      if (food.imageId) {
        await cloudinary.uploader.destroy(food.imageId);
      }
  
      // Alternatively, remove image from the local server if stored locally
      // fs.unlink(`upload/${food.image}`, (err) => {
      //   if (err) console.error('Failed to delete local image:', err);
      // });
  
      // Delete the food item from the database
      await foodModel.findByIdAndDelete(req.body.id);
  
      // Send a success response
      res.json({
        success: true,
        message: "Item removed successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error removing the item",
      });
    }
  };

module.exports = { addFood, listFood, removeFood };
