const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const Item = require("../models/Item");
const {
  addItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

// @route   GET /api/inventories/:inventoryId/items
// @desc    Get all items for an inventory
// @access  Any logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const items = await Item.find({ inventoryId });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// @route   POST /api/inventories/:inventoryId/items
// @desc    Add new item
router.post("/", auth, addItem);

// @route   PUT /api/inventories/:inventoryId/items/:itemId
// @desc    Update item
router.put("/:itemId", auth, updateItem);

// @route   DELETE /api/inventories/:inventoryId/items/:itemId
// @desc    Delete item
router.delete("/:itemId", auth, deleteItem);

module.exports = router;
