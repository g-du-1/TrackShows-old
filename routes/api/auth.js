const express = require("express");
const router = express.Router();
const bcrpyt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const fetch = require('node-fetch');

const User = require("../../models/User");

// @route  POST api/auth
// @desc   Auth user
// @access Public

router.post("/", (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  // TODO Improve validation

  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User does not exists" });

    // Validate password
    bcrpyt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      jwt.sign(
        { id: user.id },
        config.get("jwtSecret"),
        { expiresIn: "365d" },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              _id: user.id,
              name: user.name,
              email: user.email,
            },
          });
        }
      );
    });
  });
});

// @route  GET api/auth/user
// @desc   Auth user data
// @access Private

router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.json(user));
});

// Trakt

const trakt_client_id = config.get("trakt_client_id");
const trakt_client_secret = config.get("trakt_client_secret");
const trakt_redir_url = config.get("trakt_redir_url");

router.get("/trakt", (req, res) => {
  res.redirect(`https://trakt.tv/oauth/authorize?response_type=code&client_id=${trakt_client_id}&redirect_uri=${trakt_redir_url}`);
});

router.get("/trakt/callback", async (req, res) => {
  const code = req.query.code;
  const access_token = await getAccessToken({ code, trakt_client_id, trakt_client_secret });
  const user = await fetchTraktUser(access_token);
  if (user) {
    req.session.access_token = access_token;
    req.session.traktSlug = user.ids.slug;
    res.redirect("/api/auth/upcoming");
  } else {
    res.send("Login did not succeed!");
  }
});

async function getAccessToken({ code, trakt_client_id, trakt_client_secret }) {
  const request = await fetch("https://api.trakt.tv/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: code,
      client_id: trakt_client_id,
      client_secret: trakt_client_secret,
      redirect_uri: trakt_redir_url,
      grant_type: "authorization_code"
    })
  });
  const response = await request.json();
  return response.access_token;
}

async function fetchTraktUser(token) {
  const request = await fetch("https://api.trakt.tv/users/me", {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'trakt-api-version': '2',
      'trakt-api-key': `${trakt_client_id}`
    }
  });
  return await request.json();
}

router.get("/upcoming", async (req, res) => {
  if (req.session) {
    const upcomingEps = await getUpcomingEps(req.session.access_token, trakt_client_id);
    res.send(upcomingEps);
  } else {
    res.redirect("/trakt");
  }
});

async function getUpcomingEps( token, trakt_client_id ) {
  const request = await fetch("https://api.trakt.tv/calendars/my/shows/2022-03-26/7", {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'trakt-api-version': '2',
      'trakt-api-key': `${trakt_client_id}`
    }
  });
  return await request.json();
}

router.get("/trakt/logout", (req, res) => {
  if (req.session) req.session = null;
  res.redirect("/");
});

module.exports = router;
