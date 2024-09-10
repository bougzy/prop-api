// // const express = require("express");
// // const mongoose = require("mongoose");
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");
// // const multer = require("multer");
// // const cors = require("cors");
// // require("dotenv").config(); // Load environment variables

// // const app = express();
// // const router = express.Router();

// // // Constants
// // const JWT_SECRET = process.env.JWT_SECRET || "epyH81bcKO"; // Secret JWT key
// // const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h"; // Token expiry
// // const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
// // const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// // // Connect to MongoDB
// // const connectDB = async () => {
// //   try {
// //     await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://list:list@list.p4wqj.mongodb.net/list', {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     });
// //     console.log("MongoDB connected");
// //   } catch (err) {
// //     console.error("Error connecting to MongoDB", err);
// //     process.exit(1);
// //   }
// // };
// // connectDB();

// // // Middleware
// // app.use(express.json());
// // app.use(cors());

// // // Error handling middleware
// // const errorMiddleware = (err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
// // };
// // app.use(errorMiddleware);

// // // Multer setup for file uploads
// // const storage = multer.memoryStorage();
// // const fileFilter = (req, file, cb) => {
// //   const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
// //   if (allowedTypes.includes(file.mimetype)) {
// //     cb(null, true);
// //   } else {
// //     cb(new Error("Invalid file type"), false);
// //   }
// // };
// // const upload = multer({ storage: storage, fileFilter: fileFilter });

// // // Models
// // const userSchema = new mongoose.Schema({
// //   email: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   username: { type: String, required: true, unique: true },
// //   isBlocked: { type: Boolean, default: false },
// //   role: { type: String, default: "user" },
// // });
// // const User = mongoose.model("User", userSchema);

// // const propertySchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   description: { type: String, required: true },
// //   location: { type: String, required: true },
// //   address: { type: String, required: true },
// //   phoneNumber: { type: String, required: true },
// //   localGovernment: { type: String, required: true },
// //   images: [{ data: Buffer, contentType: String }],
// //   videos: [{ data: Buffer, contentType: String }],
// //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner of the property
// // });
// // const Property = mongoose.model("Property", propertySchema);

// // // Authentication middleware
// // const authenticate = (req, res, next) => {
// //   const token = req.headers.authorization?.split(" ")[1];
// //   if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

// //   jwt.verify(token, JWT_SECRET, (err, decoded) => {
// //     if (err) return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
// //     req.user = decoded;
// //     next();
// //   });
// // };

// // // Admin check middleware
// // const isAdmin = (req, res, next) => {
// //   authenticate(req, res, () => {
// //     if (req.user.role === "admin") {
// //       next();
// //     } else {
// //       res.status(403).json({ message: "Forbidden: Admin access required" });
// //     }
// //   });
// // };

// // // Controllers
// // const registerUser = async (req, res) => {
// //   const { email, password, username } = req.body;

// //   try {
// //     const emailExists = await User.findOne({ email });
// //     if (emailExists) return res.status(400).json({ message: "Email already in use" });

// //     const usernameExists = await User.findOne({ username });
// //     if (usernameExists) return res.status(400).json({ message: "Username already in use" });

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const newUser = new User({ email, password: hashedPassword, username });
// //     await newUser.save();
// //     res.status(201).json({ message: "User registered successfully" });
// //   } catch (err) {
// //     console.error("Error registering user:", err);
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// // const loginUser = async (req, res) => {
// //   const { email, password } = req.body;

// //   try {
// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(400).json({ message: "Invalid credentials" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

// //     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
// //     res.json({ token });
// //   } catch (err) {
// //     console.error("Error logging in user:", err);
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// // const adminLogin = (req, res) => {
// //   const { email, password } = req.body;
// //   if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
// //     const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
// //     res.json({ token });
// //   } else {
// //     res.status(401).json({ message: "Invalid admin credentials" });
// //   }
// // };

// // // Fetch all properties
// // const getAllProperties = async (req, res) => {
// //   try {
// //     const properties = await Property.find().populate('owner', 'username email');
// //     res.status(200).json(properties);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// // const addProperty = async (req, res) => {
// //   const { name, description, location, address, phoneNumber, localGovernment } = req.body;
// //   const images = req.files?.images || [];
// //   const videos = req.files?.videos || [];

// //   try {
// //     const newProperty = new Property({
// //       name,
// //       description,
// //       location,
// //       address,
// //       phoneNumber,
// //       localGovernment,
// //       images: images.map((file) => ({ data: file.buffer, contentType: file.mimetype })),
// //       videos: videos.map((file) => ({ data: file.buffer, contentType: file.mimetype })),
// //       owner: req.user.id // Assign the owner of the property
// //     });
// //     await newProperty.save();
// //     res.status(201).json({ message: "Property added successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// // // Delete property
// // const deleteProperty = async (req, res) => {
// //   const { id } = req.params;

// //   try {
// //     const property = await Property.findById(id);
// //     if (!property) return res.status(404).json({ message: "Property not found" });

// //     if (property.owner.toString() !== req.user.id) {
// //       return res.status(403).json({ message: "Forbidden: You are not the owner of this property" });
// //     }

// //     await Property.findByIdAndDelete(id);
// //     res.status(200).json({ message: "Property deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// // // Routes
// // router.post("/register", registerUser);
// // router.post("/login", loginUser);
// // router.post("/admin/login", adminLogin);
// // router.get("/properties", authenticate, getAllProperties); // Fetch all properties
// // router.post("/properties", authenticate, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), addProperty);
// // router.delete("/properties/:id", authenticate, deleteProperty);

// // app.use("/api", router);

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });




// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const cors = require("cors");
// const AWS = require("aws-sdk");
// const path = require("path");
// const fs = require("fs");
// require("dotenv").config();

// const app = express();
// const router = express.Router();

// // Constants
// const JWT_SECRET = process.env.JWT_SECRET || "epyH81bcKO";
// const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
// const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
// const LOCAL_UPLOAD_DIR = "uploads/"; // Local directory for file storage

// // AWS S3 Configuration
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://list:list@list.p4wqj.mongodb.net/list', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("Error connecting to MongoDB", err);
//     process.exit(1);
//   }
// };
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Ensure upload directory exists
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)){
//   fs.mkdirSync(LOCAL_UPLOAD_DIR);
// }

// // Error handling middleware
// const errorMiddleware = (err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
// };
// app.use(errorMiddleware);

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, LOCAL_UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type"), false);
//   }
// };
// const upload = multer({ storage: storage, fileFilter: fileFilter });

// // Models
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   username: { type: String, required: true, unique: true },
//   isBlocked: { type: Boolean, default: false },
//   role: { type: String, default: "user" },
// });
// const User = mongoose.model("User", userSchema);

// const propertySchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   location: { type: String, required: true },
//   address: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   localGovernment: { type: String, required: true },
//   images: [{ url: String, contentType: String }],
//   videos: [{ url: String, contentType: String }],
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// });
// const Property = mongoose.model("Property", propertySchema);

// // Authentication middleware
// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: "Unauthorized: Invalid token", error: err.message });
//     req.user = decoded;
//     next();
//   });
// };

// // Admin check middleware
// const isAdmin = (req, res, next) => {
//   authenticate(req, res, () => {
//     if (req.user.role === "admin") {
//       next();
//     } else {
//       res.status(403).json({ message: "Forbidden: Admin access required" });
//     }
//   });
// };

// // Controllers
// const registerUser = async (req, res) => {
//   const { email, password, username } = req.body;

//   try {
//     const emailExists = await User.findOne({ email });
//     if (emailExists) return res.status(400).json({ message: "Email already in use" });

//     const usernameExists = await User.findOne({ username });
//     if (usernameExists) return res.status(400).json({ message: "Username already in use" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ email, password: hashedPassword, username });
//     await newUser.save();
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error("Error registering user:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
//     res.json({ token });
//   } catch (err) {
//     console.error("Error logging in user:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const adminLogin = (req, res) => {
//   const { email, password } = req.body;
//   if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
//     const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
//     res.json({ token });
//   } else {
//     res.status(401).json({ message: "Invalid admin credentials" });
//   }
// };

// // Fetch all properties
// const getAllProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate('owner', 'username email');
//     res.status(200).json(properties);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const uploadToS3 = async (file) => {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: `${Date.now()}_${file.originalname}`,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: "public-read"
//   };
  
//   const { Location } = await s3.upload(params).promise();
//   return Location;
// };

// const addProperty = async (req, res) => {
//   const { name, description, location, address, phoneNumber, localGovernment } = req.body;
//   const images = req.files?.images || [];
//   const videos = req.files?.videos || [];

//   try {
//     // Upload files to S3 and get URLs
//     const imageUrls = await Promise.all(images.map(file => uploadToS3(file)));
//     const videoUrls = await Promise.all(videos.map(file => uploadToS3(file)));

//     const newProperty = new Property({
//       name,
//       description,
//       location,
//       address,
//       phoneNumber,
//       localGovernment,
//       images: imageUrls.map((url, index) => ({ url, contentType: images[index].mimetype })),
//       videos: videoUrls.map((url, index) => ({ url, contentType: videos[index].mimetype })),
//       owner: req.user.id
//     });
//     await newProperty.save();
//     res.status(201).json({ message: "Property added successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Delete property
// const deleteProperty = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const property = await Property.findById(id);
//     if (!property) return res.status(404).json({ message: "Property not found" });

//     if (property.owner.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Forbidden: You are not the owner of this property" });
//     }

//     await Property.findByIdAndDelete(id);
//     res.status(200).json({ message: "Property deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Routes
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/admin/login", adminLogin);
// router.get("/properties", authenticate, getAllProperties);
// router.post("/properties", authenticate, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), addProperty);
// router.delete("/properties/:id", authenticate, deleteProperty);

// app.use("/api", router);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Replaced bcrypt with bcryptjs
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// app.use(express.json());

// app.use(cors({
//   origin: [
//       process.env.CLIENT_ORIGIN || 'http://localhost:5173',
//       'http://localhost:5173',
//       'http://localhost:5173/login',
//       'http://localhost:5173/register'
//   ],
//   credentials: true
// }));

// const PORT = process.env.PORT || 5000;

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.on('connected', () => {
//   console.log('MongoDB connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// // User Schema
// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   isBlocked: { type: Boolean, default: false },
// });

// // Property Schema
// const propertySchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   address: String,
//   phoneNumber: String,
//   images: [String],
//   videos: [String],
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// });

// // Models
// const User = mongoose.model('User', userSchema);
// const Property = mongoose.model('Property', propertySchema);

// // Middleware for authentication
// const authenticateToken = (req, res, next) => {
//   const token = req.header('auth-token');
//   if (!token) return res.status(401).send('Access Denied');

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (err) {
//     res.status(400).send('Invalid Token');
//   }
// };

// // Admin Middleware
// const adminAuth = (req, res, next) => {
//   const { username, password } = req.body;
//   if (username === 'admin' && password === 'admin123') {
//     next();
//   } else {
//     res.status(403).send('Forbidden');
//   }
// };


// // Default route to handle GET requests to the root URL
// app.get('/', (req, res) => {
//   res.send('Welcome to the API service!');
// });


// // Routes
// app.post('/register', async (req, res) => {
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(req.body.password, salt);

//   const user = new User({
//     username: req.body.username,
//     password: hashedPassword,
//   });

//   try {
//     const savedUser = await user.save();
//     res.send({ user: user._id });
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.post('/login', async (req, res) => {
//   const user = await User.findOne({ username: req.body.username });
//   if (!user || user.isBlocked) return res.status(400).send('Access denied');

//   const validPass = await bcrypt.compare(req.body.password, user.password);
//   if (!validPass) return res.status(400).send('Invalid password');

//   const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
//   res.header('auth-token', token).send(token);
// });

// app.post('/property', authenticateToken, async (req, res) => {
//   const property = new Property({
//     title: req.body.title,
//     description: req.body.description,
//     address: req.body.address,
//     phoneNumber: req.body.phoneNumber,
//     images: req.body.images,
//     videos: req.body.videos,
//     user: req.user._id,
//   });

//   try {
//     const savedProperty = await property.save();
//     res.send(savedProperty);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // Route to upload additional images for a property
// app.put('/property/:id/images', authenticateToken, async (req, res) => {
//   try {
//     const property = await Property.findOne({ _id: req.params.id, user: req.user._id });
//     if (!property) return res.status(404).send('Property not found or not authorized to update.');

//     // Add new images to the existing list
//     property.images.push(...req.body.images);
//     await property.save();
//     res.send(property);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // Route to upload additional videos for a property
// app.put('/property/:id/videos', authenticateToken, async (req, res) => {
//   try {
//     const property = await Property.findOne({ _id: req.params.id, user: req.user._id });
//     if (!property) return res.status(404).send('Property not found or not authorized to update.');

//     // Add new videos to the existing list
//     property.videos.push(...req.body.videos);
//     await property.save();
//     res.send(property);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // Route for users to delete their own property
// app.delete('/property/:id', authenticateToken, async (req, res) => {
//   try {
//     const property = await Property.findOne({ _id: req.params.id, user: req.user._id });
//     if (!property) return res.status(404).send('Property not found or not authorized to delete.');

//     await Property.findByIdAndDelete(req.params.id);
//     res.send('Property deleted successfully');
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // Admin routes
// app.post('/admin/block-user', adminAuth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.body.userId, { isBlocked: true });
//     res.send(user);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.post('/admin/delete-property', adminAuth, async (req, res) => {
//   try {
//     const property = await Property.findByIdAndDelete(req.body.propertyId);
//     res.send(property);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.get('/properties', async (req, res) => {
//   try {
//     const properties = await Property.find().populate('user', 'username');
//     res.send(properties);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // In your Express.js backend
// app.patch('/users/block/:id', async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to block user' });
//   }
// });


// app.patch('/users/unblock/:id', async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to unblock user' });
//   }
// });

// app.delete('/properties/:id', async (req, res) => {
//   try {
//     await Property.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Property deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete property' });
//   }
// });
 

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


