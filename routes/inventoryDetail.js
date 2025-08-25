// routes/inventoryDetail.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getInventoryById,
  getItems,
  addItem,
  updateItem,
  deleteItem,
} = require("../controllers/inventoryDetailController");

// ---------------- Inventory Routes ----------------

// GET /api/inventories/:inventoryId
// Get inventory details by ID
router.get("/:inventoryId", auth, getInventoryById);

// ---------------- Item Routes ----------------

// GET /api/inventories/:inventoryId/items
// Get all items of an inventory
router.get("/:inventoryId/items", auth, getItems);

// POST /api/inventories/:inventoryId/items
// Add a new item to an inventory
router.post("/:inventoryId/items", auth, addItem);

// PUT /api/inventories/:inventoryId/items/:itemId
// Update an item
router.put("/:inventoryId/items/:itemId", auth, updateItem);

// DELETE /api/inventories/:inventoryId/items/:itemId
// Delete an item
router.delete("/:inventoryId/items/:itemId", auth, deleteItem);

module.exports = router;
