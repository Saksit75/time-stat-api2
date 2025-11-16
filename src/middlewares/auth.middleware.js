// middleware/auth.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || 'mysecretkey';

module.exports = (req, res, next) => {
  // อ่าน token จาก Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No access_token" });
  }

  // ดึง token จริง ๆ
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.middlewareUser = decoded; // ใส่ payload ลง req
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(403).json({ message: `Invalid token` });
  }
};
