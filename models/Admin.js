const express = require("express");
const {
  adminLogin,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUserProperty,
} = require("../Controllers/userController");

const router = express.Router();

// Admin routes (no auth required for simplicity)
router.post("/login", adminLogin);
router.get("/users", getAllUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/properties/:id", deleteUserProperty);

module.exports = router;
