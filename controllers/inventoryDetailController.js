// controllers/inventoryDetailController.js
const Inventory = require("../models/Inventory");
const Item = require("../models/Item");

// ---------------- Inventory ----------------

// Get inventory by ID
const getInventoryById = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const inventory = await Inventory.findById(inventoryId).populate(
      "userId",
      "username email role"
    );
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });
    res.json(inventory);
  } catch (err) {
    console.error("Error fetching inventory:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Items ----------------

// Get all items for an inventory
const getItems = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const items = await Item.find({ inventoryId });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new item
const addItem = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { itemId, name, quantity } = req.body;

    // Check inventory exists
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    // Permission: only creator or admin
    if (
      req.user.id !== inventory.userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const newItem = new Item({
      inventoryId,
      itemId,
      name,
      quantity,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { inventoryId, itemId } = req.params;
    const { name, quantity } = req.body;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    // Permission check
    if (
      req.user.id !== inventory.userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const item = await Item.findOne({ inventoryId, itemId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.name = name;
    item.quantity = quantity;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("Error updating item:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { inventoryId, itemId } = req.params;

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    // Permission check
    if (
      req.user.id !== inventory.userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const item = await Item.findOne({ inventoryId, itemId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getInventoryById,
  getItems,
  addItem,
  updateItem,
  deleteItem,
};
