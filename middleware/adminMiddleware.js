const jwt = require("jsonwebtoken");
const JWT_SECRET = "epyH81bcKO"; // Use environment variable in production

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  });
};

module.exports = isAdmin;
