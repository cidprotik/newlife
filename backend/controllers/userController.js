const User = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const otpGenerator = require("otp-generator");

// Register
async function register(req, res) {
  try {
    const {
      prefix,
      first_name,
      middle_name,
      last_name,
      full_name,
      gender,
      phone_no,
      email_id,
      date_of_birth,
      present_address,
      permanent_address,
      user_name,
      password,
      user_type,
      status,
      selected_date_time,
      created_user_id
    } = req.body;

    if (!first_name || !last_name || !user_name || !password || !email_id || !phone_no) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ $or: [{ email_id }, { user_name }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    const hashed = await hashPassword(password);

    // Build profile image URL
    let profileImageUrl = null;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      profileImageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const user = new User({
      prefix,
      first_name,
      middle_name,
      last_name,
      full_name: full_name || `${prefix || ""} ${first_name} ${middle_name || ""} ${last_name}`.trim(),
      gender,
      phone_no,
      email_id,
      date_of_birth,
      present_address,
      permanent_address,
      user_name,
      password: hashed,
      profile_image: profileImageUrl,   // 👈 save full link instead of filename
      user_type,
      status,
      selected_date_time,
      created_date_time: new Date(),
      created_user_id
    });

    await user.save();
    res.status(201).json({ 
      message: "User registered successfully", 
      userId: user._id, 
      profile_image: profileImageUrl   // return image link too
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// Login
async function login(req, res) {
  try {
    const { user_name, password } = req.body;

    const user = await User.findOne({ user_name });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      // user: {
      //   id: user._id,
      //   full_name: user.full_name,
      //   user_name: user.user_name,
      //   user_type: user.user_type
      // }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// app login
async function app_login(req, res) {
  try {
    const { phone_no } = req.body;

    const user = await User.findOne({ phone_no });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    await user.save();

    res.json({
      message: "OTP sent successfully",
      otp // ⚠️ return only for testing
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Step 2: Verify OTP and generate JWT
async function verify_otp(req, res) {
  try {
    const { phone_no, otp } = req.body;
    const user = await User.findOne({ phone_no });
    if (!user) return res.status(400).json({ message: "Invalid phone number" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // Clear OTP after successful verification
    user.otp = null;
    await user.save();

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      // user: {
      //   id: user._id,
      //   full_name: user.full_name,
      //   user_name: user.user_name,
      //   user_type: user.user_type
      // }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Profile (Protected)
async function profile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, profile, app_login, verify_otp };
