const router = require('express').Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('./users-model');
const dbErrorMsg = { message: "There has been an error with the database" }

router.post('/register', validateInput(), async (req, res) => {
  try {
    const isUsernameTaken = (await Users.findByUsername(req.credentials.username) ? true : false)

    if (isUsernameTaken) {
      return res.status(400).json("username taken")
    }

    const passwordHash = bcrypt.hashSync(req.credentials.password);

    const newUser = await Users.add({ username: req.credentials.username, password: passwordHash });

    return res.status(201).json(newUser);
  } catch {
    res.status(500).json(dbErrorMsg);
  }
});

router.post('/login', validateInput(), async (req, res) => {
/*
IMPLEMENT
You are welcome to build additional middlewares to help with the endpoint's functionality.

1- In order to log into an existing account the client must provide `username` and `password`:
  {
    "username": "Captain Marvel",
    "password": "foobar"
  }

2- On SUCCESSFUL login,
  the response body should have `message` and `token`:
  {
    "message": "welcome, Captain Marvel",
    "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
  }

3- On FAILED login due to `username` or `password` missing from the request body,
  the response body should include a string exactly as follows: "username and password required".

4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
  the response body should include a string exactly as follows: "invalid credentials".
*/

  try {
    const user = await Users.findByUsername(req.credentials.username);

    if (!user) {
      return res.status(400).json("invalid credentials")
    }

    const isPasswordValid = bcrypt.compareSync(req.credentials.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json("invalid credentials")
    }

    // Generate JWT -- setup additional JWT settings with an options obj in this call
    const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET);
    if (!token) {
      return res.status(500).json("please try again");
    }

    return res.status(200).json({
      message: `Welcome, ${user.username}`,
      token
    })

  } catch {
    res.status(500).json(dbErrorMsg);
  }

});

// ROUTER MIDDLEWARE //
function validateInput() {
  return function (req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json("username and password required");
    }

    req.credentials = {
      username,
      password
    }
    next();
  }
}

module.exports = router;
