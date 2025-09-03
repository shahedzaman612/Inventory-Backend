const Inventory = require("../models/Inventory");
const Item = require("../models/Item");

// Get all inventories
const getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find()
      .populate("userId", "username email role")
      .sort({ createdAt: -1 });
    res.json(inventories);
  } catch (err) {
    console.error("Error fetching inventories:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Full-text search inventories
const searchInventories = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    // Build regex for partial + case-insensitive matching
    const regex = new RegExp(query, "i");

    const results = await Inventory.find({
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
        { "customFields.stringFields": regex },
        { "customFields.textFields": regex },
        { "customFields.linkFields": regex },
        { "customFields.dropdownFields": regex },
        // Convert numberFields to string for regex matching
        { "customFields.numberFields": { $regex: regex } },
      ],
    }).limit(20);

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

// Create inventory
const createInventory = async (req, res) => {
  try {
    const inventory = new Inventory({ ...req.body, userId: req.user.id });
    await inventory.save();
    res.status(201).json(inventory);
  } catch (err) {
    console.error("Error creating inventory:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    if (req.user.id !== inventory.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(inventory, req.body);
    await inventory.save();
    res.json(inventory);
  } catch (err) {
    console.error("Error updating inventory:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete inventory
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    if (req.user.id !== inventory.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await inventory.deleteOne();
    res.json({ message: "Inventory deleted successfully" });
  } catch (err) {
    console.error("Error deleting inventory:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get inventory stats
const getInventoryStats = async (req, res) => {
  try {
    const totalInventories = await Inventory.countDocuments();
    const totalItems = await Item.countDocuments();
    res.json({ inventories: totalInventories, items: totalItems });
  } catch (err) {
    console.error("Error fetching stats:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get inventories of logged-in user
const myProfile = async (req, res) => {
  try {
    const inventories = await Inventory.find({ userId: req.user.id });
    res.json(inventories);
  } catch (err) {
    console.error("Error fetching user inventories:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllInventories,
  searchInventories, 
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryStats,
  myProfile,
};
