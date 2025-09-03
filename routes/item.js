const express = require("express");
const router = express.Router({ mergeParams: true });
const item = require('../models/Item')
const auth = require("../middleware/auth");
const {
  addItem,
  getItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

// @route   POST /api/inventories/:inventoryId/items
// @desc    Add new item to an inventory
// @access  Any logged-in user
router.post("/", auth, addItem);

// @route   GET /api/inventories/:inventoryId/items
// @desc    Get all items in an inventory
// @access  Any logged-in user
router.get("/", auth, getItem);

// @route   PUT /api/inventories/:inventoryId/items/:itemId
// @desc    Update item (only inventory creator or admin)
// @access  Inventory creator or admin
router.put("/:itemId", auth, updateItem);

// @route   DELETE /api/inventories/:inventoryId/items/:itemId
// @desc    Delete item (only inventory creator or admin)
// @access  Inventory creator or admin
router.delete("/:itemId", auth, deleteItem);

module.exports = router;
