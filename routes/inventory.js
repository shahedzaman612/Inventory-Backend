const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllInventories,
  createInventory,
  getInventoryStats,
  updateInventory,
  deleteInventory,
  myProfile,
} = require("../controllers/inventoryController");

// @route   GET /api/inventories
// @desc    Get all inventories (with optional search/filter)
// @access  Authenticated users
router.get("/", auth, getAllInventories);

// @route   POST /api/inventories
// @desc    Create a new inventory
// @access  Creator or Admin
router.post("/", auth, createInventory);

// @route   GET /api/inventories/stats
// @desc    Get total inventories and items stats
// @access  Authenticated users
router.get("/stats", auth, getInventoryStats);

// @route   PUT /api/inventories/:id
// @desc    Update an inventory
// @access  Creator or Admin
router.put("/:id", auth, updateInventory);

// @route   DELETE /api/inventories/:id
// @desc    Delete an inventory
// @access  Creator or Admin
router.delete("/:id", auth, deleteInventory);
// @route   GET /api/inventories/my
// @desc    Get inventories of the logged-in user
// @access  Authenticated users
router.get("/my", auth, myProfile);


module.exports = router;
