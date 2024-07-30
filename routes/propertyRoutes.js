const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const propertyController = require("./Controllers/propertyController");

// Create a new property
router.post("/properties", upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), propertyController.createProperty);

// Update an existing property
router.put("/properties/:id", upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 5 }]), propertyController.updateProperty);

// Other routes (e.g., get all properties, get property by ID) should be added as needed

module.exports = router;
