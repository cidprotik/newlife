const jwt = require("jsonwebtoken");
const { encodeData, decodeData } = require("../utils/hash"); // 👈 import it

function generateToken(user) {
  return jwt.sign(
    { id: encodeData(user._id.toString()) },  // 👈 convert ObjectId → string
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function verifyToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Data:",decoded)
  // decode the user id
  const userId = decodeData(decoded.id);  

  return { ...decoded, userId }; // userId is now string
}

module.exports = { generateToken, verifyToken };

