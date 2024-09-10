const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();
const router = express.Router();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "epyH81bcKO"; // Secret JWT key
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h"; // Token expiry
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dub:dub@dub.92zzeme.mongodb.net/dub?retryWrites=true&w=majority&appName=dub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
};
app.use(errorMiddleware);

// Multer setup for file uploads
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, default: "user" },
});
const User = mongoose.model("User", userSchema);

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  localGovernment: { type: String, required: true },
  images: [{ data: Buffer, contentType: String }],
  videos: [{ data: Buffer, contentType: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added owner field
});
const Property = mongoose.model("Property", propertySchema);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
    req.user = decoded;
    next();
  });
};

// Admin check middleware
const isAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admin access required" });
    }
  });
};

// Controllers
const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already in use" });

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, username });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid admin credentials" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndUpdate(id, { isBlocked: true });
    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const unblockUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndUpdate(id, { isBlocked: false });
    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addProperty = async (req, res) => {
  const { name, description, location, address, phoneNumber, localGovernment } = req.body;
  const images = req.files?.images || [];
  const videos = req.files?.videos || [];

  try {
    const newProperty = new Property({
      name,
      description,
      location,
      address,
      phoneNumber,
      localGovernment,
      images: images.map((file) => ({ data: file.buffer, contentType: file.mimetype })),
      videos: videos.map((file) => ({ data: file.buffer, contentType: file.mimetype })),
      owner: req.user.id // Assign the owner of the property
    });
    await newProperty.save();
    res.status(201).json({ message: "Property added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden: You can only delete your own properties" });

    await Property.findByIdAndDelete(id);
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get properties with pagination and search
router.get("/properties", async (req, res) => {
  const { page = 1, limit = 5, search = "" } = req.query;

  try {
    const properties = await Property.find({
      name: { $regex: search, $options: "i" }, // Search by name
    })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", adminLogin);
router.get("/users", isAdmin, getAllUsers);
router.patch("/users/block/:id", isAdmin, blockUser);
router.patch("/users/unblock/:id", isAdmin, unblockUser);
router.post("/properties", authenticate, upload.fields([{ name: "images[]", maxCount: 10 }, { name: "videos[]", maxCount: 2 }]), addProperty);
router.delete("/properties/:id", authenticate, deleteProperty);

// Use router
app.use("/api", router);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});