const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  prefix: { type: String },
  first_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String },
  full_name: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  phone_no: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  date_of_birth: { type: Date },
  present_address: { type: String },
  permanent_address: { type: String },
  user_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image: { type: String },
  user_type: { type: String, enum: ["Admin", "User"], default: "User" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  selected_date_time: { type: Date },
  created_date_time: { type: Date, default: Date.now },
  created_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updated_date_time: { type: Date },
  updated_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  otp: { type: String, default: null }
});

module.exports = mongoose.model("User", userSchema);
