const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
      process.env.CLIENT_ORIGIN || 'https://bayelsaconnect.vercel.app',
      'https://bayelsaconnect.vercel.app/register',
      'https://bayelsaconnect.vercel.app/login',
      'https://bayelsaconnect.vercel.app/properties',
      'http://localhost:5173',
      'http://localhost:5173/login',
      'http://localhost:5173/register'
  ],
  credentials: true
}));

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema Definitions
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
});

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  address: String,
  phoneNumber: String,
  images: [String],
  videos: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Models
const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role === 'admin') {
      req.user = verified;
      next();
    } else {
      res.status(403).send('Access Forbidden');
    }
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};


// // Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Apartment Renting API');
});


// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!email) return res.status(400).send("Email is required");
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send('User with this email already exists');
    }
    res.status(400).send(err);
  }
});

// Admin Login with hardcoded credentials
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.header('auth-token', token).send({ token });
  } else {
    res.status(403).send('Invalid Admin Credentials');
  }
});

// User Login
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || user.isBlocked) return res.status(400).send('Access denied');

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ _id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('auth-token', token).send({ token });
});

// app.post('/property', authenticateToken, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
//   const { title, description, address, phoneNumber } = req.body;

//   // Check for missing fields
//   if (!title || !description || !address || !phoneNumber) {
//     return res.status(400).send('All fields are required');
//   }

//   const imageUrls = req.files['images'] ? req.files['images'].map(file => file.path) : [];
//   const videoUrls = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

//   const property = new Property({
//     title,
//     description,
//     address,
//     phoneNumber,
//     images: imageUrls,
//     videos: videoUrls,
//     user: req.user._id,
//   });

//   try {
//     const savedProperty = await property.save();
//     res.send(savedProperty);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });


// User routes

app.post('/property', authenticateToken, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
  try {
    const { title, description, address, phoneNumber } = req.body;

    // Validate inputs
    if (!title || !description || !address || !phoneNumber) {
      return res.status(400).send('All fields are required');
    }

    const imageUrls = req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const videoUrls = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

    const property = new Property({
      title,
      description,
      address,
      phoneNumber,
      images: imageUrls,
      videos: videoUrls,
      user: req.user._id,
    });

    const savedProperty = await property.save();
    res.send(savedProperty);
  } catch (err) {
    console.error('Error saving property:', err);  // Log error for debugging
    res.status(500).send('Failed to add property');
  }
});




app.get('/user/properties', authenticateToken, async (req, res) => {
  try {
    const properties = await Property.find({ user: req.user._id });
    res.send(properties);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete property
app.delete('/property/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!property) return res.status(404).send('Property not found or unauthorized');
    res.send('Property deleted successfully');
  } catch (err) {
    res.status(400).send(err);
  }
});


// Admin routes
app.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/admin/block-user', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, { isBlocked: true }, { new: true });
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/admin/unblock-user', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.body.userId, { isBlocked: false }, { new: true });
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/admin/delete-property', adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.body.propertyId);
    if (!property) return res.status(404).send('Property not found');
    res.send(property);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Fetch all properties
app.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find().populate('user', 'username');
    res.send(properties);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
