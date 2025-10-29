const bcrypt = require("bcrypt");
const crypto = require("crypto");

const SALT_ROUNDS = 10;
const algorithm = "aes-256-cbc";

// Secret key must be 32 bytes → store it in environment (do not regenerate each time)
const secretKey = Buffer.from(process.env.SECRET_KEY || "12345678901234567890123456789012"); 

// 🔐 Password hashing (one-way, cannot decode)
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

// 🔐 Symmetric encryption (encode & decode)
function encodeData(data) {
  const iv = crypto.randomBytes(16); // unique IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return { iv: iv.toString("hex"), content: encrypted };
}

function decodeData(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  let decrypted = decipher.update(hash.content, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

module.exports = { hashPassword, comparePassword, encodeData, decodeData };
