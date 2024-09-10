// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');  // Changed from 'bcrypt' to 'bcryptjs'
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const multer = require('multer');  // Add multer
// require('dotenv').config();

// const app = express();

// app.use(express.json());
// app.use(cors());

// const PORT = process.env.PORT || 5000;

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
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
//   images: [String],  // Array of image URLs
//   videos: [String],  // Array of video URLs
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

// // Setup multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');  // Directory to save files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);  // Unique file name
//   },
// });

// const upload = multer({ storage: storage });

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

// app.post('/property', authenticateToken, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
//   const imageUrls = req.files['images'] ? req.files['images'].map(file => file.path) : [];
//   const videoUrls = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

//   const property = new Property({
//     title: req.body.title,
//     description: req.body.description,
//     address: req.body.address,
//     phoneNumber: req.body.phoneNumber,
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

// // User routes
// app.get('/user/properties', authenticateToken, async (req, res) => {
//   try {
//     const properties = await Property.find({ user: req.user._id });
//     res.send(properties);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.delete('/user/property/:id', authenticateToken, async (req, res) => {
//   try {
//     // Find the property by ID and ensure it belongs to the user
//     const property = await Property.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id
//     });
    
//     if (!property) return res.status(404).send('Property not found or does not belong to the user');
    
//     res.send(property);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// // Admin routes
// app.get('/admin/users', adminAuth, async (req, res) => {
//   try {
//     const users = await User.find();
//     res.send(users);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.post('/admin/block-user', adminAuth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.body.userId, { isBlocked: true }, { new: true });
//     res.send(user);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.post('/admin/unblock-user', adminAuth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.body.userId, { isBlocked: false }, { new: true });
//     res.send(user);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// app.post('/admin/delete-property', adminAuth, async (req, res) => {
//   try {
//     const property = await Property.findByIdAndDelete(req.body.propertyId);
//     if (!property) return res.status(404).send('Property not found');
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

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Changed from 'bcrypt' to 'bcryptjs'
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');  // Add multer
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isBlocked: { type: Boolean, default: false },
});

// Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  address: String,
  phoneNumber: String,
  images: [String],  // Array of image URLs
  videos: [String],  // Array of video URLs
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

// Admin Middleware
const adminAuth = (req, res, next) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Unique file name
  },
});

const upload = multer({ storage: storage });

// Routes
app.post('/register', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || user.isBlocked) return res.status(400).send('Access denied');

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.header('auth-token', token).send(token);
});

app.post('/property', authenticateToken, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
  const imageUrls = req.files['images'] ? req.files['images'].map(file => file.path) : [];
  const videoUrls = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

  const property = new Property({
    title: req.body.title,
    description: req.body.description,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    images: imageUrls,
    videos: videoUrls,
    user: req.user._id,
  });

  try {
    const savedProperty = await property.save();
    res.send(savedProperty);
  } catch (err) {
    res.status(400).send(err);
  }
});

// User routes
app.get('/user/properties', authenticateToken, async (req, res) => {
  try {
    const properties = await Property.find({ user: req.user._id });
    res.send(properties);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/user/property/:id', authenticateToken, async (req, res) => {
  try {
    // Find the property by ID and ensure it belongs to the user
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!property) return res.status(404).send('Property not found or does not belong to the user');
    
    res.send(property);
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
