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
            discount: req.body.discount,
            initprice: req.body.initprice,
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

 


// List all food items
// const listFood = async (req, res) => {
//     try {
//         const foods = await foodModel.find({});
//         res.json({
//             success: true,
//             message: "items listed successfully",
//             data: foods,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Error listing item" });
//     }
// };

const listFood = async (req, res) => {
  try {
      const { name } = req.query;

      // Construct a query object
      
       let query = {};
      // Add search criteria only if name or category is provided
      if (name) {
          query.$or = [];
          if (name) query.$or.push({ name: { $regex: name, $options: 'i' } }); // Case-insensitive search
          // if (category) query.$or.push({ category: { $regex: category, $options: 'i' } }); // Case-insensitive search
      }

      // If no search criteria, query will be empty, fetching all items
      const foods = await foodModel.find(query);

      res.json({
          success: true,
          message: "Items listed successfully",
          data: foods,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error listing items" });
  }
};


const updateFood = async (req, res) => {
  try {
      const { id, name, category, price, discount , initprice} = req.body;

      // Find and update the food item by its ID
      const updatedFood = await foodModel.findByIdAndUpdate(
          id,
          { name, category, price, discount, initprice },
          { new: true }
      );

      if (!updatedFood) {
          return res.status(404).json({ success: false, message: 'Item not found' });
      }

      res.json({
          success: true,
          message: 'Item updated successfully',
          data: updatedFood,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating item' });
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

module.exports = { addFood, listFood, removeFood , updateFood};
