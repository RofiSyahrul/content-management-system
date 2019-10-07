const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* register */
router.post("/register", (req, res) => {
  const { email, password, retypePassword } = req.body;
  let response = { status: false, message: "", data: null, token: null };

  if (password === retypePassword) {
    User.findOne({ email })
      .then(value => {
        if (value) {
          response.message = `Email ${email} is already exist.`;
          res.status(400).json(response);
        } else {
          const user = new User({ email, password });
          user.save(err => {
            if (err) {
              response.message = err.toString();
              res.json(response);
            } else {
              response.status = true;
              response.message = "Register success";
              response.data = { email: user.email };
              response.token = user.token;
              res.status(200).json(response);
            }
          });
        }
      })
      .catch(err => {
        response.message = err.toString();
        res.json(response);
      });
  } else {
    response.message = "Retype password does not match with password";
    res.status(400).json(response);
  }
});

// login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  let response = { status: false, message: "", data: null, token: null };

  User.findOne({ email })
    .then(user => {
      if (user) {
        user.comparePassword(password, isMatch => {
          delete user.password;
          if (isMatch) {
            response.status = true;
            response.message = "Log in success";
            response.data = { email };
            response.token = user.getToken();
            res.status(200).json(response);
          } else {
            response.message = "Wrong email or password";
            res.status(400).json(response);
          }
        });
      } else {
        response.message = "Wrong email or password";
        res.status(400).json(response);
      }
    })
    .catch(err => {
      response.message = err.toString();
      res.json(response);
    });
});

// check token
router.post("/check", (req, res) => {
  const { token } = req.body;
  let response = { valid: false };

  try {
    const decoded = User.decodeToken(token);
    if (decoded) {
      User.findOne({ email: decoded.email })
        .then(user => {
          if (user) response.valid = true;
          res.status(200).json(response);
        })
        .catch(err => res.json(response));
    } else {
      res.status(200).json(response);
    }
  } catch (err) {
    res.json(response);
  }
});

// logout
router.get("/destroy", (req, res) => {
  const { id } = req.query;
  let response = { logout: false };
  User.findById(id, (err, user) => {
    if (user) {
      user.token = undefined;
      response.logout = true;
    }
    res.status(200).json(response);
  });
});

module.exports = router;
