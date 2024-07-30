const express = require("express");
const router = express.Router();
const { adminLogin, getAllUsers, blockUser, unblockUser, deleteUserProperty } = require("../Controllers/adminController");

router.post("/login", adminLogin);
router.get("/users", getAllUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/properties/:id", deleteUserProperty);

module.exports = router;
