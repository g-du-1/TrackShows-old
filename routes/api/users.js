const express = require("express");
const router = express.Router();
const bcrpyt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

// @route  POST api/users
// @desc   Register new user
// @access Public

router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  // TODO Improve validation

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
    });

    // Create salt & hash
    bcrpyt.genSalt(10, (err, salt) => {
      bcrpyt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            config.get("jwtSecret"),
            { expiresIn: "365d" },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
              });
            }
          );
        });
      });
    });
  });
});

module.exports = router;
