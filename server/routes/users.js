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
              user.generateToken(() => {
                response.status = true;
                response.message = "Register success";
                response.data = { email: user.email };
                response.token = user.token;
                res.status(200).json(response);
              });
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
          // delete user.password;
          if (isMatch) {
            user.generateToken(() => {
              response.status = true;
              response.message = "Log in success";
              response.data = { email };
              response.token = user.token;
              res.status(200).json(response);
            });
          } else {
            response.message = "Wrong email or password";
            res.json(response);
          }
        });
      } else {
        response.message = "Wrong email or password";
        res.json(response);
      }
    })
    .catch(err => {
      response.message = err.toString();
      res.json(response);
    });
});

// check token
router.post("/check", (req, res) => {
  const token = req.header("Authorization");
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
  const token = req.header("Authorization");
  let response = { logout: false };

  try {
    const decoded = User.decodeToken(token);
    if (decoded) {
      User.findOne({ email: decoded.email })
        .then(user => {
          if (user) {
            user.token = undefined;
            User.updateOne(
              { email: user.email },
              { token: user.token },
              (err, docs) => {
                if (err) {
                  console.log(err);
                } else {
                  response.logout = true;
                }
                res.status(200).json(response);
              }
            );
          } else {
            res.status(200).json(response);
          }
        })
        .catch(err => res.json(response));
    } else {
      res.status(200).json(response);
    }
  } catch (err) {
    res.json(response);
  }
});

// find
router.post("/find", (req, res) => {
  const { email } = req.body;
  let response = { found: false, data: {} };

  User.findOne({ email })
    .then(user => {
      if (user) {
        response.found = true;
        response.data.email = email;
      }
      res.json(response);
    })
    .catch(err => res.json(response));
});

module.exports = router;
