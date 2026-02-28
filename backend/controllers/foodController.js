import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

// ==============================
// HELPER - Check Admin
// ==============================
const isAdmin = async (userId) => {
  if (!userId) return false;
  const user = await userModel.findById(userId);
  return user && user.role === "admin";
};

// ==============================
// ADD FOOD
// ==============================
const addFood = async (req, res) => {
  try {
    // Check image
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Validate required fields
    const { name, description, price, category, userId } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
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
      name,
      description,
      price: Number(price), // form data sends strings, convert to number
      category,
      image: result.secure_url,
      image_public_id: result.public_id,
    });

    await food.save();

    res.status(201).json({ success: true, message: "Food Added" });

  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

// ==============================
// LIST FOOD
// ==============================
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    console.error("List food error:", error);
    res.status(500).json({ success: false, message: "Error fetching food" });
  }
};

// ==============================
// REMOVE FOOD
// ==============================
const removeFood = async (req, res) => {
  try {
    const { userId, id } = req.body;

    // Check admin from req.body.userId (set by authMiddleware)
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: "Food ID is required" });
    }

    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // Delete image from Cloudinary
    if (food.image_public_id) {
      await cloudinary.uploader.destroy(food.image_public_id);
    }

    await foodModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Food Removed" });

  } catch (error) {
    console.error("Remove food error:", error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };