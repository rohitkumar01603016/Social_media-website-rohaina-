const User = require("../../Schema/User");
const validateLoginInput = require("../../validation/login");
const keys = require("../../config/key");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
const LoginControllers = async (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  const validationMessage =
    Object.values(errors || {}).find(Boolean) || "Invalid login details";

  // Check validation
  if (!isValid) {
    return res.status(400).json({ error: validationMessage });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database is not connected yet. Please try again in a few seconds.",
    });
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (typeof user.password !== "string" || user.password.trim().length === 0) {
      return res.status(409).json({
        error:
          "This account was saved without a valid password. Please register again with this email or use another account.",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // User matched
      // Create JWT Payload
      const payload = {
        id: user.id,
        name: user.name,
      };

      // Sign token
      return jwt.sign(
        payload,
        keys.key,
        {
          expiresIn: 31556926, // 1 year in seconds
        },
        (err, token) => {
          if (err) {
            return res.status(500).json({ error: "Could not generate token" });
          }

          return res.json({
            success: true,
            token: "Bearer " + token,
            name: user.name,
          });
        },
      );
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Login failed",
    });
  }
};

module.exports = LoginControllers;
