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

// Create inventory
const createInventory = async (req, res) => {
  try {
    const inventory = new Inventory({ ...req.body, userId: req.user.id }); // userId is the creator
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
    const inventory = await Inventory.findById(req.params.id); // changed to match route param
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    // Only creator or admin can update
    if (
      req.user.id !== inventory.userId.toString() &&
      req.user.role !== "admin"
    ) {
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
    const inventory = await Inventory.findById(req.params.id); // changed to match route param
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    // Only creator or admin can delete
    if (
      req.user.id !== inventory.userId.toString() &&
      req.user.role !== "admin"
    ) {
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

module.exports = {
  getAllInventories,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryStats,
};
