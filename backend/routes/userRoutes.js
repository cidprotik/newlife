const express = require("express");
const { register, login, profile, app_login, verify_otp } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", upload.single("profile_image"), register);
router.post("/login", login);
router.post("/token_verify", authMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "Token is valid",
    user: req.user
  });
});
router.post("/applogin", app_login);
router.post("/verifyotp", verify_otp);
router.get("/profile", authMiddleware, profile);

module.exports = router;
