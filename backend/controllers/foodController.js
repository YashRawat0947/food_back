import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

// ==============================
// ADD FOOD
// ==============================
const addFood = async (req, res) => {
  try {
    // Check image
    if (!req.file) {
      return res.json({ success: false, message: "Image is required" });
    }

    // Check admin
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.json({ success: false, message: "You are not admin" });
    }

    // Upload image buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "food-items" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Create food document
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: result.secure_url,      // store image URL
      image_public_id: result.public_id, // store public_id for deletion
    });

    await food.save();

    res.json({ success: true, message: "Food Added" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding food" });
  }
};

// ==============================
// LIST FOOD
// ==============================
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching food" });
  }
};

// ==============================
// REMOVE FOOD
// ==============================
const removeFood = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);

    if (!userData || userData.role !== "admin") {
      return res.json({ success: false, message: "You are not admin" });
    }

    const food = await foodModel.findById(req.body.id);

    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    // Delete image from Cloudinary
    if (food.image_public_id) {
      await cloudinary.uploader.destroy(food.image_public_id);
    }

    await foodModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Food Removed" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };