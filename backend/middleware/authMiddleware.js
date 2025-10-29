const jwt = require("jsonwebtoken");
const { decodeData } = require("../utils/hash"); // import your decode function

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract the encrypted id
    const encryptedId = decoded.id; // { iv, content }

    // Decrypt it
    const userId = decodeData(encryptedId); // returns the original string ObjectId

    //console.log("Encrypted ID:", encryptedId);
    //console.log("Decrypted UserId:", userId);

    // Attach userId to req.user
    req.user = { ...decoded, id: userId };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(400).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
