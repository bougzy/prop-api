

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const connectDB = require("./config/db");
const propertyController = require("./Controllers/propertyController");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const router = express.Router();

// Connect to MongoDB
connectDB();

// Use CORS middleware to allow requests from your React app
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Route to handle property creation with file upload
router.post(
  "/",
  upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 10 }]),
  propertyController.createProperty
);

// Route to update property with file upload
router.put(
  "/:id",
  upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 10 }]),
  propertyController.updateProperty
);

// Route to fetch property by ID
router.get("/:id", propertyController.getPropertyById);

// Property routes
router.get("/", propertyController.getAllProperties);
router.delete("/:id", propertyController.deleteProperty);

// Use the router for the "/api/properties" endpoint
app.use("/api/properties", router);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
