
const Property = require("../models/propertyModel");

// Create a new property
exports.createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      address,
      phoneNumber,
      localGovernment,
    } = req.body;

    const images = req.files["images"]
      ? req.files["images"].map((file) => ({
          data: file.buffer,
          contentType: file.mimetype,
        }))
      : [];

    const videos = req.files["videos"]
      ? req.files["videos"].map((file) => ({
          data: file.buffer,
          contentType: file.mimetype,
        }))
      : [];

    const newProperty = new Property({
      name,
      description,
      location,
      address,
      phoneNumber,
      localGovernment,
      images,
      videos,
    });

    await newProperty.save();
    res.status(201).json({ message: "Property created successfully", property: newProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing property
exports.updateProperty = async (req, res) => {
  try {
    const { name, description, location, address, phoneNumber, localGovernment } = req.body;

    const images = req.files["images"]
      ? req.files["images"].map((file) => ({
          data: file.buffer,
          contentType: file.mimetype,
        }))
      : [];

    const videos = req.files["videos"]
      ? req.files["videos"].map((file) => ({
          data: file.buffer,
          contentType: file.mimetype,
        }))
      : [];

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Append new files to the existing ones
    if (images.length > 0) {
      property.images.push(...images);
    }
    if (videos.length > 0) {
      property.videos.push(...videos);
    }

    // Update other fields
    property.name = name || property.name;
    property.description = description || property.description;
    property.location = location || property.location;
    property.address = address || property.address;
    property.phoneNumber = phoneNumber || property.phoneNumber;
    property.localGovernment = localGovernment || property.localGovernment;

    await property.save();

    res.status(200).json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all properties with pagination and search
exports.getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const totalProperties = await Property.countDocuments({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    });

    const properties = await Property.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      properties,
      currentPage: page,
      totalPages: Math.ceil(totalProperties / limit),
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a property by ID
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



